/**
 * Comprehensive Auto-Migration Script
 * Runs on server startup to ensure all tables and data are in place
 */

const bcrypt = require('bcrypt');

async function runAutoMigration(pool) {
  try {
    console.log('🔄 Running auto-migration...');
    
    // =====================================================
    // ADD MISSING COLUMNS TO EMPLOYEES TABLE
    // =====================================================
    const employeeColumns = [
      "ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time'",
      "ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL",
      "ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) NULL",
      "ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(50) NULL",
      "ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(50) NULL",
      "ALTER TABLE employees ADD COLUMN bank_swift_code VARCHAR(20) NULL",
      "ALTER TABLE employees ADD COLUMN bank_address TEXT NULL",
      "ALTER TABLE employees ADD COLUMN role VARCHAR(50) DEFAULT 'employee'"
    ];
    
    for (const sql of employeeColumns) {
      try {
        await pool.query(sql);
        const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
        console.log(`✅ Added ${columnName} to employees table`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
          console.log(`ℹ️ ${columnName} already exists in employees table`);
        }
      }
    }
    
    // =====================================================
    // ADD COMPANY_ID TO ATTENDANCE TABLES
    // =====================================================
    try {
      await pool.query('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
      console.log('✅ Added company_id to attendance_policies');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ company_id already exists in attendance_policies');
      }
    }
    
    try {
      await pool.query('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
      console.log('✅ Added company_id to attendance_regulations');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ company_id already exists in attendance_regulations');
      }
    }
    
    // =====================================================
    // CREATE ATTENDANCE_RECORDS TABLE
    // =====================================================
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS attendance_records (
          id INT(11) NOT NULL AUTO_INCREMENT,
          employee_id INT(11) NOT NULL,
          date DATE NOT NULL,
          check_in TIME NULL,
          check_out TIME NULL,
          work_hours DECIMAL(5,2) DEFAULT 0,
          overtime_hours DECIMAL(5,2) DEFAULT 0,
          status ENUM('present', 'absent', 'late', 'partial') DEFAULT 'present',
          check_in_location VARCHAR(255) NULL,
          check_out_location VARCHAR(255) NULL,
          check_in_ip VARCHAR(45) NULL,
          check_out_ip VARCHAR(45) NULL,
          check_in_device TEXT NULL,
          check_out_device TEXT NULL,
          company_id INT(11) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY unique_employee_date (employee_id, date),
          INDEX idx_employee_id (employee_id),
          INDEX idx_date (date),
          INDEX idx_status (status),
          INDEX idx_company_id (company_id)
        )
      `);
      console.log('✅ Created attendance_records table');
    } catch (error) {
      console.log(`ℹ️ attendance_records table already exists`);
    }
    
    // =====================================================
    // CREATE LEAVE MANAGEMENT TABLES
    // =====================================================
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS leave_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(20) UNIQUE,
          description TEXT,
          days_per_year INT DEFAULT 0,
          max_days_per_year INT DEFAULT 0,
          max_consecutive_days INT DEFAULT 0,
          requires_approval BOOLEAN DEFAULT TRUE,
          requires_documentation BOOLEAN DEFAULT FALSE,
          is_paid BOOLEAN DEFAULT TRUE,
          carry_forward BOOLEAN DEFAULT FALSE,
          max_carry_forward_days INT DEFAULT 0,
          gender_restriction ENUM('all', 'male', 'female') DEFAULT 'all',
          min_service_days INT DEFAULT 0,
          advance_notice_days INT DEFAULT 0,
          color_code VARCHAR(7) DEFAULT '#3B82F6',
          status ENUM('active', 'inactive') DEFAULT 'active',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS leave_applications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          leave_id VARCHAR(50) UNIQUE NULL,
          employee_id INT NOT NULL,
          leave_type_id INT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          total_days INT NOT NULL,
          reason TEXT NOT NULL,
          emergency_contact VARCHAR(255),
          attachment VARCHAR(500),
          status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
          approved_by INT NULL,
          approved_at DATETIME NULL,
          rejection_reason TEXT,
          cancelled_at DATETIME NULL,
          cancellation_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
          FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
          FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS leave_balances (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_id INT NOT NULL,
          leave_type_id INT NOT NULL,
          year YEAR NOT NULL,
          total_allocated INT DEFAULT 0,
          total_used INT DEFAULT 0,
          total_approved INT DEFAULT 0,
          total_pending INT DEFAULT 0,
          carry_forward_from_previous INT DEFAULT 0,
          carry_forward_to_next INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year),
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
          FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS leave_policies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          policy_type ENUM('general', 'department_specific', 'employee_specific') DEFAULT 'general',
          department_id INT NULL,
          employee_id INT NULL,
          leave_type_id INT NOT NULL,
          max_days_per_year INT DEFAULT 0,
          max_consecutive_days INT DEFAULT 0,
          requires_approval BOOLEAN DEFAULT TRUE,
          approval_workflow JSON,
          is_active BOOLEAN DEFAULT TRUE,
          effective_from DATE NOT NULL,
          effective_to DATE NULL,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
          FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
          FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS leave_holidays (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          type ENUM('national', 'regional', 'company', 'floating') DEFAULT 'company',
          is_recurring BOOLEAN DEFAULT FALSE,
          recurring_pattern ENUM('yearly', 'monthly', 'weekly') NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
      `);

      console.log('✅ Leave management tables created/verified');
    } catch (error) {
      console.log(`ℹ️ Leave tables already exist`);
    }
    
    // =====================================================
    // CREATE EMPLOYEE SALARY COMPONENTS TABLE
    // =====================================================
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS employee_salary_components (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_salary_id INT NOT NULL,
          salary_component_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_salary_id) REFERENCES employee_salaries(id) ON DELETE CASCADE,
          UNIQUE KEY unique_salary_component (employee_salary_id, salary_component_id)
        )
      `);
      console.log('✅ Created employee_salary_components table');
    } catch (error) {
      console.log(`ℹ️ employee_salary_components table already exists`);
    }
    
    // =====================================================
    // CREATE EMPLOYEE CONTRACTS TABLE
    // =====================================================
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS employee_contracts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_id INT NOT NULL,
          contract_type ENUM('permanent', 'contract', 'temporary', 'intern', 'consultant') NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NULL,
          salary DECIMAL(10,2) NOT NULL,
          status ENUM('active', 'expired', 'terminated', 'pending') DEFAULT 'active',
          terms TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created employee_contracts table');
    } catch (error) {
      console.log(`ℹ️ employee_contracts table already exists`);
    }
    
    // =====================================================
    // CREATE AUDIT LOGS TABLE
    // =====================================================
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          log_id VARCHAR(50) UNIQUE NOT NULL,
          user_id INT NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          action VARCHAR(100) NOT NULL,
          resource VARCHAR(100) NOT NULL,
          resource_id VARCHAR(100) NULL,
          details TEXT,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
          department VARCHAR(100) NULL,
          location VARCHAR(100) NULL,
          session_id VARCHAR(100) NULL,
          changes JSON NULL,
          old_values JSON NULL,
          new_values JSON NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_action (action),
          INDEX idx_resource (resource),
          INDEX idx_severity (severity),
          INDEX idx_created_at (created_at),
          INDEX idx_log_id (log_id)
        )
      `);
      console.log('✅ Created audit_logs table');
    } catch (error) {
      console.log(`ℹ️ audit_logs table already exists`);
    }
    
    // =====================================================
    // CREATE SETTINGS TABLE
    // =====================================================
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          setting_key VARCHAR(100) NOT NULL,
          setting_value TEXT,
          setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
          description TEXT,
          is_public BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_category_key (category, setting_key),
          INDEX idx_category (category),
          INDEX idx_public (is_public)
        )
      `);
      console.log('✅ Created settings table');
    } catch (error) {
      console.log(`ℹ️ settings table already exists`);
    }
    
    // =====================================================
    // ADD DEFAULT SETTINGS
    // =====================================================
    try {
      const [existingSettings] = await pool.query('SELECT COUNT(*) as count FROM settings');
      if (existingSettings[0].count === 0) {
        const defaultSettings = [
          { category: 'general', setting_key: 'site_name', setting_value: 'HRMGO', setting_type: 'string', is_public: true },
          { category: 'general', setting_key: 'site_description', setting_value: 'Human Resource Management System', setting_type: 'string', is_public: true },
          { category: 'company', setting_key: 'company_name', setting_value: 'Your Company', setting_type: 'string', is_public: true },
          { category: 'company', setting_key: 'company_email', setting_value: 'info@company.com', setting_type: 'string', is_public: true },
          { category: 'localization', setting_key: 'default_language', setting_value: 'en', setting_type: 'string', is_public: true },
          { category: 'localization', setting_key: 'timezone', setting_value: 'America/New_York', setting_type: 'string', is_public: true },
          { category: 'localization', setting_key: 'currency', setting_value: 'USD', setting_type: 'string', is_public: true }
        ];
        
        for (const setting of defaultSettings) {
          await pool.query(
            'INSERT INTO settings (category, setting_key, setting_value, setting_type, is_public) VALUES (?, ?, ?, ?, ?)',
            [setting.category, setting.setting_key, setting.setting_value, setting.setting_type, setting.is_public]
          );
        }
        console.log('✅ Added default settings');
      } else {
        console.log('ℹ️ Default settings already exist');
      }
    } catch (error) {
      console.log(`ℹ️ Settings already configured`);
    }
    
    // =====================================================
    // ADD MISSING COLUMNS TO USER_PERMISSIONS
    // =====================================================
    try {
      await pool.query('ALTER TABLE user_permissions ADD COLUMN permission_id INT NULL');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ permission_id already exists in user_permissions table');
      }
    }
    
    try {
      await pool.query('ALTER TABLE user_permissions ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ is_active already exists in user_permissions table');
      }
    }
    
    // =====================================================
    // ADD MISSING PERMISSIONS
    // =====================================================
    const permissions = [
      { key: 'dashboard.view', name: 'View Dashboard', module: 'dashboard' },
      { key: 'dashboard.export', name: 'Export Dashboard Data', module: 'dashboard' },
      { key: 'calendar.view', name: 'View Calendar', module: 'calendar' },
      { key: 'calendar.create', name: 'Create Events', module: 'calendar' },
      { key: 'calendar.edit', name: 'Edit Events', module: 'calendar' },
      { key: 'calendar.delete', name: 'Delete Events', module: 'calendar' },
      { key: 'tasks.view', name: 'View Tasks', module: 'tasks' },
      { key: 'tasks.create', name: 'Create Tasks', module: 'tasks' },
      { key: 'tasks.edit', name: 'Edit Tasks', module: 'tasks' },
      { key: 'tasks.delete', name: 'Delete Tasks', module: 'tasks' },
      { key: 'tasks.assign', name: 'Assign Tasks', module: 'tasks' },
      { key: 'organization.view', name: 'View Organization Chart', module: 'organization' },
      { key: 'organization.edit', name: 'Edit Organization Chart', module: 'organization' },
      { key: 'leave.view', name: 'View Leave Requests', module: 'leave' },
      { key: 'leave.create', name: 'Create Leave Request', module: 'leave' },
      { key: 'leave.approve', name: 'Approve Leave', module: 'leave' },
      { key: 'leave.edit', name: 'Edit Leave Requests', module: 'leave' },
      { key: 'leave.delete', name: 'Delete Leave Requests', module: 'leave' },
      { key: 'leave.manage', name: 'Manage Leave System', module: 'leave' },
      { key: 'leave.types.view', name: 'View Leave Types', module: 'leave' },
      { key: 'leave.types.manage', name: 'Manage Leave Types', module: 'leave' },
      { key: 'leave.policies.view', name: 'View Leave Policies', module: 'leave' },
      { key: 'leave.policies.manage', name: 'Manage Leave Policies', module: 'leave' },
      { key: 'leave.balances.view', name: 'View Leave Balances', module: 'leave' },
      { key: 'leave.balances.manage', name: 'Manage Leave Balances', module: 'leave' },
      { key: 'leave.holidays.view', name: 'View Holidays', module: 'leave' },
      { key: 'leave.holidays.manage', name: 'Manage Holidays', module: 'leave' },
      { key: 'leave.reports', name: 'Leave Reports', module: 'leave' },
      { key: 'payroll.view', name: 'View Payroll', module: 'payroll' },
      { key: 'payroll.create', name: 'Create Payroll', module: 'payroll' },
      { key: 'payroll.edit', name: 'Edit Payroll', module: 'payroll' },
      { key: 'payroll.approve', name: 'Approve Payroll', module: 'payroll' },
      { key: 'expenses.view', name: 'View Expenses', module: 'expenses' },
      { key: 'expenses.create', name: 'Create Expense', module: 'expenses' },
      { key: 'expenses.approve', name: 'Approve Expenses', module: 'expenses' },
      { key: 'recruitment.view', name: 'View Recruitment', module: 'recruitment' },
      { key: 'jobs.view', name: 'View Job Postings', module: 'jobs' },
      { key: 'jobs.create', name: 'Create Job Posting', module: 'jobs' },
      { key: 'jobs.edit', name: 'Edit Job Postings', module: 'jobs' },
      { key: 'jobs.delete', name: 'Delete Job Postings', module: 'jobs' },
      { key: 'candidates.view', name: 'View Candidates', module: 'candidates' },
      { key: 'candidates.create', name: 'Add Candidates', module: 'candidates' },
      { key: 'candidates.edit', name: 'Edit Candidates', module: 'candidates' },
      { key: 'candidates.delete', name: 'Delete Candidates', module: 'candidates' },
      { key: 'interviews.view', name: 'View Interviews', module: 'interviews' },
      { key: 'interviews.create', name: 'Schedule Interviews', module: 'interviews' },
      { key: 'interviews.edit', name: 'Edit Interviews', module: 'interviews' },
      { key: 'performance.view', name: 'View Performance', module: 'performance' },
      { key: 'goals.view', name: 'View Goals', module: 'goals' },
      { key: 'goals.create', name: 'Create Goals', module: 'goals' },
      { key: 'goals.edit', name: 'Edit Goals', module: 'goals' },
      { key: 'reviews.view', name: 'View Reviews', module: 'reviews' },
      { key: 'reviews.create', name: 'Create Reviews', module: 'reviews' },
      { key: 'reviews.edit', name: 'Edit Reviews', module: 'reviews' },
      { key: 'reports.view', name: 'View Reports', module: 'reports' },
      { key: 'reports.export', name: 'Export Reports', module: 'reports' },
      { key: 'reports.income_expense', name: 'Income vs Expense Reports', module: 'reports' },
      { key: 'reports.attendance', name: 'Attendance Reports', module: 'reports' },
      { key: 'reports.leave', name: 'Leave Reports', module: 'reports' },
      { key: 'reports.payroll', name: 'Payroll Reports', module: 'reports' },
      { key: 'assets.view', name: 'View Assets', module: 'assets' },
      { key: 'assets.create', name: 'Create Assets', module: 'assets' },
      { key: 'assets.edit', name: 'Edit Assets', module: 'assets' },
      { key: 'assets.delete', name: 'Delete Assets', module: 'assets' },
      { key: 'assets.assign', name: 'Assign Assets', module: 'assets' },
      { key: 'documents.view', name: 'View Documents', module: 'documents' },
      { key: 'documents.create', name: 'Create Documents', module: 'documents' },
      { key: 'documents.edit', name: 'Edit Documents', module: 'documents' },
      { key: 'documents.delete', name: 'Delete Documents', module: 'documents' },
      { key: 'settings.view', name: 'View Settings', module: 'settings' },
      { key: 'settings.edit', name: 'Edit Settings', module: 'settings' },
      { key: 'users.view', name: 'View Users', module: 'users' },
      { key: 'users.create', name: 'Create Users', module: 'users' },
      { key: 'users.edit', name: 'Edit Users', module: 'users' },
      { key: 'users.delete', name: 'Delete Users', module: 'users' },
      { key: 'audit.view', name: 'View Audit Logs', module: 'audit' },
      { key: 'timekeeping.view', name: 'View Timekeeping', module: 'timekeeping' },
      { key: 'shifts.view', name: 'View Shifts', module: 'shifts' },
      { key: 'shifts.create', name: 'Create Shifts', module: 'shifts' },
      { key: 'shifts.edit', name: 'Edit Shifts', module: 'shifts' },
      { key: 'shifts.delete', name: 'Delete Shifts', module: 'shifts' },
      { key: 'policies.view', name: 'View Attendance Policies', module: 'policies' },
      { key: 'policies.create', name: 'Create Attendance Policies', module: 'policies' },
      { key: 'policies.edit', name: 'Edit Attendance Policies', module: 'policies' },
      { key: 'records.view', name: 'View Attendance Records', module: 'records' },
      { key: 'records.edit', name: 'Edit Attendance Records', module: 'records' },
      { key: 'regulations.view', name: 'View Regulations', module: 'regulations' },
      { key: 'regulations.create', name: 'Create Regulations', module: 'regulations' },
      { key: 'regulations.edit', name: 'Edit Regulations', module: 'regulations' },
      { key: 'regulations.delete', name: 'Delete Regulations', module: 'regulations' },
      { key: 'regularization.view', name: 'View Regularization', module: 'regularization' },
      { key: 'regularization.create', name: 'Create Regularization', module: 'regularization' },
      { key: 'regularization.approve', name: 'Approve Regularization', module: 'regularization' },
      { key: 'profile.view', name: 'View Profile', module: 'profile' },
      { key: 'profile.edit', name: 'Edit Profile', module: 'profile' },
      { key: 'profile.upload_photo', name: 'Upload Profile Photo', module: 'profile' }
    ];
    
    console.log('🔄 Adding missing permissions...');
    for (const permission of permissions) {
      try {
        await pool.query(
          'INSERT INTO permissions (permission_key, name, description, module, is_active, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [permission.key, permission.name, permission.name, permission.module, true]
        );
        console.log(`✅ Added permission: ${permission.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Permission already exists: ${permission.name}`);
        }
      }
    }
    
    // =====================================================
    // CREATE TEST USERS
    // =====================================================
    const testUsers = [
      { name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'super_admin' },
      { name: 'Employee User', email: 'employee@example.com', password: 'password123', role: 'employee' }
    ];

    for (const user of testUsers) {
      try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);
        if (existing.length === 0) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await pool.query(
            'INSERT INTO users (name, email, password, role, status, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [user.name, user.email, hashedPassword, user.role, 'active', 1]
          );
          console.log(`✅ Created test user: ${user.email}`);
        } else {
          console.log(`ℹ️ Test user already exists: ${user.email}`);
        }
      } catch (error) {
        console.log(`ℹ️ Test user ${user.email}: ${error.message}`);
      }
    }
    
    console.log('🎉 Auto-migration completed!');
  } catch (error) {
    console.error('❌ Auto-migration failed:', error.message);
  }
}

module.exports = runAutoMigration;

