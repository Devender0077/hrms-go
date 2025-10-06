/**
 * Migration: 013_ensure_all_tables
 * Ensure all required tables exist with correct structure
 */

async function up(connection) {
  console.log('🔄 Running migration: Ensure all required tables exist...');
  
  try {
    // Create companies table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        legal_name VARCHAR(255),
        tax_id VARCHAR(50),
        registration_number VARCHAR(50),
        logo VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        website VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Companies table ensured');

    // Create users table with all required columns
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        remember_token VARCHAR(100),
        email_verified_at TIMESTAMP NULL,
        role ENUM('super_admin', 'company_admin', 'employee') NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        profile_photo VARCHAR(255),
        username VARCHAR(100) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        department VARCHAR(100),
        position VARCHAR(100),
        department_id INT DEFAULT NULL,
        designation_id INT DEFAULT NULL,
        branch_id INT DEFAULT NULL,
        manager_id INT DEFAULT NULL,
        hire_date DATE DEFAULT NULL,
        salary DECIMAL(10,2) DEFAULT NULL,
        is_email_verified BOOLEAN DEFAULT FALSE,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        login_attempts INT DEFAULT 0,
        locked_until DATETIME NULL,
        last_login DATETIME NULL,
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ensured');

    // Create branches table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS branches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        manager_id INT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Branches table ensured');

    // Create departments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        manager_id INT DEFAULT NULL,
        budget DECIMAL(15,2) DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Departments table ensured');

    // Create designations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS designations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        level INT DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Designations table ensured');

    // Create employees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        employee_id VARCHAR(50) UNIQUE,
        company_id INT NOT NULL DEFAULT 1,
        department_id INT DEFAULT NULL,
        designation_id INT DEFAULT NULL,
        branch_id INT DEFAULT NULL,
        manager_id INT DEFAULT NULL,
        hire_date DATE NOT NULL,
        salary DECIMAL(10,2) DEFAULT NULL,
        status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Employees table ensured');

    // Create system_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL DEFAULT 1,
        setting_key VARCHAR(255) NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_company_setting (company_id, setting_key),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ System settings table ensured');

    // Create attendance_records table with correct structure
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in_time TIMESTAMP NULL DEFAULT NULL,
        check_out_time TIMESTAMP NULL DEFAULT NULL,
        total_hours DECIMAL(4,2) DEFAULT 0,
        overtime_hours DECIMAL(4,2) DEFAULT 0,
        status ENUM('present', 'absent', 'late', 'half-day', 'leave') DEFAULT 'absent',
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id),
        INDEX idx_date (date),
        INDEX idx_status (status),
        UNIQUE KEY unique_employee_date (employee_id, date)
      )
    `);
    console.log('✅ Attendance records table ensured');

    // Create audit_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        action VARCHAR(255) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id INT DEFAULT NULL,
        old_values JSON DEFAULT NULL,
        new_values JSON DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_table_name (table_name),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Audit logs table ensured');

    // Create jobs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        department_id INT DEFAULT NULL,
        location VARCHAR(255) DEFAULT NULL,
        employment_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
        experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'entry',
        salary_min DECIMAL(10,2) DEFAULT NULL,
        salary_max DECIMAL(10,2) DEFAULT NULL,
        status ENUM('open', 'closed', 'on-hold') DEFAULT 'open',
        posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closing_date DATE DEFAULT NULL,
        requirements TEXT DEFAULT NULL,
        benefits TEXT DEFAULT NULL,
        created_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_department_id (department_id),
        INDEX idx_created_by (created_by)
      )
    `);
    console.log('✅ Jobs table ensured');

    // Create candidates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        resume_url VARCHAR(500) DEFAULT NULL,
        cover_letter TEXT DEFAULT NULL,
        experience_years INT DEFAULT 0,
        current_salary DECIMAL(10,2) DEFAULT NULL,
        expected_salary DECIMAL(10,2) DEFAULT NULL,
        availability_date DATE DEFAULT NULL,
        status ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected') DEFAULT 'applied',
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_job_id (job_id),
        INDEX idx_status (status),
        INDEX idx_email (email)
      )
    `);
    console.log('✅ Candidates table ensured');

    // Create interviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        interviewer_id INT NOT NULL,
        interview_type ENUM('phone', 'video', 'in-person', 'technical') DEFAULT 'in-person',
        scheduled_date TIMESTAMP NOT NULL,
        duration_minutes INT DEFAULT 60,
        location VARCHAR(255) DEFAULT NULL,
        status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
        feedback TEXT DEFAULT NULL,
        rating INT DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_candidate_id (candidate_id),
        INDEX idx_interviewer_id (interviewer_id),
        INDEX idx_scheduled_date (scheduled_date)
      )
    `);
    console.log('✅ Interviews table ensured');

    // Create performance_reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS performance_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        review_period_start DATE NOT NULL,
        review_period_end DATE NOT NULL,
        review_type ENUM('annual', 'quarterly', 'probation', 'project') DEFAULT 'annual',
        status ENUM('draft', 'in-progress', 'completed', 'approved') DEFAULT 'draft',
        overall_rating DECIMAL(3,2) DEFAULT NULL,
        goals_rating DECIMAL(3,2) DEFAULT NULL,
        skills_rating DECIMAL(3,2) DEFAULT NULL,
        behavior_rating DECIMAL(3,2) DEFAULT NULL,
        achievements TEXT DEFAULT NULL,
        areas_for_improvement TEXT DEFAULT NULL,
        goals_next_period TEXT DEFAULT NULL,
        comments TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id),
        INDEX idx_reviewer_id (reviewer_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Performance reviews table ensured');

    // Create training_programs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS training_programs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        duration VARCHAR(100) DEFAULT NULL,
        cost DECIMAL(10,2) DEFAULT 0,
        trainer VARCHAR(255) DEFAULT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Training programs table ensured');

    // Create training_enrollments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS training_enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        program_id INT NOT NULL,
        employee_id INT NOT NULL,
        enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completion_date TIMESTAMP NULL DEFAULT NULL,
        status ENUM('enrolled', 'in-progress', 'completed', 'dropped') DEFAULT 'enrolled',
        grade VARCHAR(10) DEFAULT NULL,
        certificate_url VARCHAR(500) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_program_id (program_id),
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Training enrollments table ensured');

    // Create payroll_salaries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payroll_salaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        basic_salary DECIMAL(10,2) NOT NULL,
        allowances DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        net_salary DECIMAL(10,2) NOT NULL,
        effective_date DATE NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id),
        INDEX idx_effective_date (effective_date),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Payroll salaries table ensured');

    // Create payroll_payslips table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payroll_payslips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        basic_salary DECIMAL(10,2) NOT NULL,
        allowances DECIMAL(10,2) DEFAULT 0,
        overtime DECIMAL(10,2) DEFAULT 0,
        bonuses DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        net_pay DECIMAL(10,2) NOT NULL,
        status ENUM('draft', 'generated', 'paid') DEFAULT 'draft',
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id),
        INDEX idx_pay_period (pay_period_start, pay_period_end),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Payroll payslips table ensured');

    // Create leave_applications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        leave_type_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_requested DECIMAL(4,2) NOT NULL,
        reason TEXT DEFAULT NULL,
        status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
        approved_by INT DEFAULT NULL,
        approved_at TIMESTAMP NULL DEFAULT NULL,
        rejection_reason TEXT DEFAULT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id),
        INDEX idx_leave_type_id (leave_type_id),
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date)
      )
    `);
    console.log('✅ Leave applications table ensured');

    console.log('🎉 Migration completed: All required tables ensured');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function down(connection) {
  console.log('🔄 Rolling back migration: Ensure all required tables exist...');
  
  try {
    // Note: This rollback doesn't drop tables as they might contain data
    // Individual table rollbacks should be handled by specific migrations
    console.log('✅ Rollback completed: Tables preserved (no data loss)');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

export { up, down };
