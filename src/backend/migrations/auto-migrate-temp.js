    async function runAutoMigration() {
      try {
        console.log('🔄 Running auto-migration...');
        
        // Add new columns to employees table
        const newColumns = [
          "ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time'",
          "ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL",
          "ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) NULL",
          "ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(50) NULL",
          "ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(50) NULL",
          "ALTER TABLE employees ADD COLUMN bank_swift_code VARCHAR(20) NULL",
          "ALTER TABLE employees ADD COLUMN bank_address TEXT NULL",
          "ALTER TABLE employees ADD COLUMN role VARCHAR(50) DEFAULT 'employee'"
        ];
        
        for (const sql of newColumns) {
          try {
            await pool.query(sql);
            const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
            console.log(`✅ Added ${columnName} to employees table`);
          } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
              const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
              console.log(`ℹ️ ${columnName} already exists in employees table`);
            } else {
              console.log(`❌ Error adding column: ${error.message}`);
            }
          }
        }
        
        // Add company_id to attendance tables
        try {
          await pool.query('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
          console.log('✅ Added company_id to attendance_policies');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ company_id already exists in attendance_policies');
          } else {
            console.log(`❌ Error with attendance_policies: ${error.message}`);
          }
        }
        
        try {
          await pool.query('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
          console.log('✅ Added company_id to attendance_regulations');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ company_id already exists in attendance_regulations');
          } else {
            console.log(`❌ Error with attendance_regulations: ${error.message}`);
          }
        }
        
        // Create attendance_records table if it doesn't exist
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
          console.log(`❌ Error creating attendance_records: ${error.message}`);
        }

        // Create leave management tables
        try {
          // Leave Types Table
          await pool.query(`
            CREATE TABLE IF NOT EXISTS leave_types (
              id INT AUTO_INCREMENT PRIMARY KEY,
              company_id INT NOT NULL,
              name VARCHAR(100) NOT NULL,
              code VARCHAR(20) UNIQUE NOT NULL,
              description TEXT,
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
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            )
          `);

          // Leave Applications Table
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

          // Leave Balances Table
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

          // Leave Policies Table
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

          // Leave Holidays Table
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
          console.log(`❌ Error creating leave management tables: ${error.message}`);
        }
        
        // Create employee_salary_components table
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS employee_salary_components (
              id INT AUTO_INCREMENT PRIMARY KEY,
              salary_id INT NOT NULL,
              component_id INT NOT NULL,
              amount DECIMAL(10,2) NOT NULL DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (salary_id) REFERENCES employee_salaries(id) ON DELETE CASCADE,
              FOREIGN KEY (component_id) REFERENCES salary_components(id) ON DELETE CASCADE,
              UNIQUE KEY unique_salary_component (salary_id, component_id)
            )
          `);
          console.log('✅ Created employee_salary_components table');
        } catch (error) {
          console.log(`❌ Error creating employee_salary_components table: ${error.message}`);
        }
        
        // Create employee_contracts table
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
          console.log(`❌ Error creating employee_contracts table: ${error.message}`);
        }
        
        // Add demo data for employee contracts
        try {
          const [existingContracts] = await pool.query('SELECT COUNT(*) as count FROM employee_contracts');
          if (existingContracts[0].count === 0) {
            // Get existing employees first
            const [employees] = await pool.query('SELECT id FROM employees ORDER BY id LIMIT 5');
            
            const demoContracts = [
              {
                employee_id: employees[0]?.id || 20,
                contract_type: 'permanent',
                start_date: '2023-01-15',
                end_date: null,
                salary: 75000.00,
                status: 'active',
                terms: 'Full-time permanent employment with standard benefits package including health insurance, paid time off, and retirement contributions.'
              },
              {
                employee_id: employees[1]?.id || 19,
                contract_type: 'contract',
                start_date: '2023-06-01',
                end_date: '2024-05-31',
                salary: 65000.00,
                status: 'active',
                terms: '12-month contract position with possibility of extension. Includes health insurance and paid time off.'
              },
              {
                employee_id: employees[2]?.id || 18,
                contract_type: 'permanent',
                start_date: '2022-09-01',
                end_date: null,
                salary: 85000.00,
                status: 'active',
                terms: 'Full-time permanent employment with comprehensive benefits including health, dental, vision insurance, and 401k matching.'
              },
              {
                employee_id: employees[3]?.id || 17,
                contract_type: 'temporary',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                salary: 45000.00,
                status: 'active',
                terms: 'Temporary position for project duration. Includes basic health insurance coverage.'
              },
              {
                employee_id: employees[4]?.id || 16,
                contract_type: 'intern',
                start_date: '2024-06-01',
                end_date: '2024-08-31',
                salary: 3000.00,
                status: 'active',
                terms: 'Summer internship program with learning opportunities and mentorship.'
              }
            ];
            
            for (const contract of demoContracts) {
              await pool.query(`
                INSERT INTO employee_contracts (
                  employee_id, contract_type, start_date, end_date, salary, status, terms
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [
                contract.employee_id,
                contract.contract_type,
                contract.start_date,
                contract.end_date,
                contract.salary,
                contract.status,
                contract.terms
              ]);
            }
            console.log('✅ Added demo data for employee contracts');
          } else {
            console.log('ℹ️ Employee contracts demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding employee contracts demo data: ${error.message}`);
        }

        // Create audit_logs table
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
              status ENUM('success', 'failed', 'warning') DEFAULT 'success',
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
              INDEX idx_status (status),
              INDEX idx_severity (severity),
              INDEX idx_created_at (created_at),
              INDEX idx_log_id (log_id)
            )
          `);
          console.log('✅ Created audit_logs table');
        } catch (error) {
          console.log(`❌ Error creating audit_logs table: ${error.message}`);
        }

        // Add demo data for leave types
        try {
          const [existingLeaveTypes] = await pool.query('SELECT COUNT(*) as count FROM leave_types WHERE company_id = 1');
          if (existingLeaveTypes[0].count === 0) {
            const demoLeaveTypes = [
              {
                company_id: 1,
                name: 'Annual Leave',
                days_allowed: 25,
                requires_approval: true,
                is_paid: true
              },
              {
                company_id: 1,
                name: 'Sick Leave',
                days_allowed: 12,
                requires_approval: false,
                is_paid: true
              },
              {
                company_id: 1,
                name: 'Personal Leave',
                days_allowed: 5,
                requires_approval: true,
                is_paid: false
              },
              {
                company_id: 1,
                name: 'Maternity Leave',
                days_allowed: 90,
                requires_approval: true,
                is_paid: true
              },
              {
                company_id: 1,
                name: 'Emergency Leave',
                days_allowed: 3,
                requires_approval: false,
                is_paid: true
              }
            ];

            for (const leaveType of demoLeaveTypes) {
              await pool.query(`
                INSERT INTO leave_types (
                  company_id, name, days_allowed, requires_approval, is_paid
                ) VALUES (?, ?, ?, ?, ?)
              `, [
                leaveType.company_id, leaveType.name, leaveType.days_allowed,
                leaveType.requires_approval, leaveType.is_paid
              ]);
            }
            console.log('✅ Added demo data for leave types');
          } else {
            console.log('ℹ️ Leave types demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding leave types demo data: ${error.message}`);
        }

        // Add demo data for leave applications
        try {
          const [existingLeaveApps] = await pool.query('SELECT COUNT(*) as count FROM leave_applications');
          if (existingLeaveApps[0].count === 0) {
            // Get employee IDs and leave type IDs
            const [employees] = await pool.query('SELECT id FROM employees WHERE company_id = 1 LIMIT 5');
            const [leaveTypes] = await pool.query('SELECT id, name FROM leave_types WHERE company_id = 1');

            if (employees.length > 0 && leaveTypes.length > 0) {
              const demoLeaveApplications = [
                {
                  leave_id: 'LA202501001',
                  employee_id: employees[0]?.id || 1,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Annual Leave')?.id || 1,
                  start_date: '2025-02-15',
                  end_date: '2025-02-20',
                  total_days: 5,
                  reason: 'Family vacation to Hawaii',
                  emergency_contact: '+1-555-0123',
                  status: 'pending'
                },
                {
                  leave_id: 'LA202501002',
                  employee_id: employees[1]?.id || 2,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Sick Leave')?.id || 2,
                  start_date: '2025-01-20',
                  end_date: '2025-01-21',
                  total_days: 2,
                  reason: 'Medical appointment and recovery',
                  emergency_contact: '+1-555-0456',
                  status: 'approved',
                  approved_by: 1,
                  approved_at: '2025-01-19 10:30:00'
                },
                {
                  leave_id: 'LA202501003',
                  employee_id: employees[2]?.id || 3,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Personal Leave')?.id || 3,
                  start_date: '2025-01-25',
                  end_date: '2025-01-25',
                  total_days: 1,
                  reason: 'Personal matters',
                  emergency_contact: '+1-555-0789',
                  status: 'rejected',
                  approved_by: 1,
                  approved_at: '2025-01-24 14:15:00',
                  rejection_reason: 'Insufficient notice period'
                },
                {
                  leave_id: 'LA202501004',
                  employee_id: employees[3]?.id || 4,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Maternity Leave')?.id || 4,
                  start_date: '2025-03-01',
                  end_date: '2025-05-30',
                  total_days: 90,
                  reason: 'Maternity leave for childbirth',
                  emergency_contact: '+1-555-0321',
                  status: 'approved',
                  approved_by: 1,
                  approved_at: '2025-02-15 09:00:00'
                },
                {
                  leave_id: 'LA202501005',
                  employee_id: employees[4]?.id || 5,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Emergency Leave')?.id || 5,
                  start_date: '2025-01-18',
                  end_date: '2025-01-18',
                  total_days: 1,
                  reason: 'Family emergency - father hospitalized',
                  emergency_contact: '+1-555-0654',
                  status: 'approved',
                  approved_by: 1,
                  approved_at: '2025-01-18 08:00:00'
                }
              ];

              for (const leaveApp of demoLeaveApplications) {
                await pool.query(`
                  INSERT INTO leave_applications (
                    leave_id, employee_id, leave_type_id, start_date, end_date,
                    total_days, reason, emergency_contact, status, approved_by, approved_at, rejection_reason
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  leaveApp.leave_id, leaveApp.employee_id, leaveApp.leave_type_id,
                  leaveApp.start_date, leaveApp.end_date, leaveApp.total_days, leaveApp.reason,
                  leaveApp.emergency_contact, leaveApp.status, leaveApp.approved_by,
                  leaveApp.approved_at, leaveApp.rejection_reason
                ]);
              }
              console.log('✅ Added demo data for leave applications');
            }
          } else {
            console.log('ℹ️ Leave applications demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding leave applications demo data: ${error.message}`);
        }

        // Add demo data for audit logs
        try {
          const [existingAuditLogs] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
          if (existingAuditLogs[0].count === 0) {
            const actions = [
              "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT", 
              "APPROVE", "REJECT", "ASSIGN", "UNASSIGN", "SCHEDULE", "CANCEL", "RESET_PASSWORD",
              "CHANGE_ROLE", "UPDATE_PROFILE", "UPLOAD_FILE", "DOWNLOAD_FILE", "SEND_EMAIL"
            ];
            
            const resources = [
              "USER", "EMPLOYEE", "DEPARTMENT", "JOB", "CANDIDATE", "INTERVIEW", "REVIEW", 
              "GOAL", "ATTENDANCE", "LEAVE", "PAYROLL", "EXPENSE", "REPORT", "SETTINGS", 
              "ROLE", "PERMISSION", "DOCUMENT", "NOTIFICATION", "CALENDAR", "TASK"
            ];
            
            const users = [
              { id: 17, name: "John Smith", email: "admin@example.com", department: "IT" },
              { id: 18, name: "Sarah Johnson", email: "employee@example.com", department: "HR" },
              { id: 19, name: "Mike Wilson", email: "mike.wilson@company.com", department: "Finance" },
              { id: 20, name: "Lisa Anderson", email: "lisa.anderson@company.com", department: "Marketing" }
            ];
            
            const statuses = ["success", "failed", "warning"];
            const severities = ["low", "medium", "high", "critical"];
            
            const now = new Date();
            
            for (let i = 0; i < 50; i++) {
              const user = users[Math.floor(Math.random() * users.length)];
              const action = actions[Math.floor(Math.random() * actions.length)];
              const resource = resources[Math.floor(Math.random() * resources.length)];
              const status = statuses[Math.floor(Math.random() * statuses.length)];
              const severity = severities[Math.floor(Math.random() * severities.length)];
              
              // Generate timestamp within last 30 days
              const daysAgo = Math.floor(Math.random() * 30);
              const hoursAgo = Math.floor(Math.random() * 24);
              const minutesAgo = Math.floor(Math.random() * 60);
              const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
              
              const logId = `LOG-${String(i + 1).padStart(6, '0')}`;
              const resourceId = `${resource}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
              const sessionId = `SESS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
              const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
              const location = Math.random() > 0.5 ? 'Office' : 'Remote';
              
              await pool.query(`
                INSERT INTO audit_logs (
                  log_id, user_id, user_name, user_email, action, resource, resource_id,
                  details, ip_address, user_agent, status, severity, department, location,
                  session_id, changes, old_values, new_values, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                logId,
                user.id,
                user.name,
                user.email,
                action,
                resource,
                resourceId,
                `${action} operation performed on ${resource.toLowerCase()}`,
                ipAddress,
                `Mozilla/5.0 (${Math.random() > 0.5 ? 'Windows' : 'Mac'}) AppleWebKit/537.36`,
                status,
                severity,
                user.department,
                location,
                sessionId,
                Math.random() > 0.7 ? JSON.stringify({ field1: "old_value", field2: "new_value" }) : null,
                Math.random() > 0.8 ? JSON.stringify({ name: "Old Name", status: "inactive" }) : null,
                Math.random() > 0.8 ? JSON.stringify({ name: "New Name", status: "active" }) : null,
                timestamp
              ]);
            }
            console.log('✅ Added demo data for audit logs');
          } else {
            console.log('ℹ️ Audit logs demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding audit logs demo data: ${error.message}`);
        }

        // Create settings table
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
          console.log(`❌ Error creating settings table: ${error.message}`);
        }

        // Add default settings
        try {
          const [existingSettings] = await pool.query('SELECT COUNT(*) as count FROM settings');
          if (existingSettings[0].count === 0) {
            const defaultSettings = [
              // General Settings
              { category: 'general', setting_key: 'site_name', setting_value: 'HRMGO', setting_type: 'string', description: 'Site name', is_public: true },
              { category: 'general', setting_key: 'site_description', setting_value: 'Human Resource Management System', setting_type: 'string', description: 'Site description', is_public: true },
              { category: 'general', setting_key: 'primary_color', setting_value: '#006FEE', setting_type: 'string', description: 'Primary color', is_public: true },
              { category: 'general', setting_key: 'secondary_color', setting_value: '#7828C8', setting_type: 'string', description: 'Secondary color', is_public: true },
              { category: 'general', setting_key: 'maintenance_mode', setting_value: 'false', setting_type: 'boolean', description: 'Maintenance mode', is_public: false },
              { category: 'general', setting_key: 'debug_mode', setting_value: 'false', setting_type: 'boolean', description: 'Debug mode', is_public: false },
              { category: 'general', setting_key: 'auto_backup', setting_value: 'true', setting_type: 'boolean', description: 'Auto backup', is_public: false },
              { category: 'general', setting_key: 'session_timeout', setting_value: '120', setting_type: 'number', description: 'Session timeout in minutes', is_public: false },
              
              // Company Settings
              { category: 'company', setting_key: 'company_name', setting_value: 'Your Company', setting_type: 'string', description: 'Company name', is_public: true },
              { category: 'company', setting_key: 'company_address', setting_value: '123 Business St, City, State 12345', setting_type: 'string', description: 'Company address', is_public: true },
              { category: 'company', setting_key: 'company_phone', setting_value: '+1 (555) 123-4567', setting_type: 'string', description: 'Company phone', is_public: true },
              { category: 'company', setting_key: 'company_email', setting_value: 'info@company.com', setting_type: 'string', description: 'Company email', is_public: true },
              { category: 'company', setting_key: 'company_website', setting_value: 'https://company.com', setting_type: 'string', description: 'Company website', is_public: true },
              { category: 'company', setting_key: 'company_logo', setting_value: '', setting_type: 'string', description: 'Company logo URL', is_public: true },
              
              // Localization Settings
              { category: 'localization', setting_key: 'default_language', setting_value: 'en', setting_type: 'string', description: 'Default language', is_public: true },
              { category: 'localization', setting_key: 'timezone', setting_value: 'America/New_York', setting_type: 'string', description: 'Default timezone', is_public: true },
              { category: 'localization', setting_key: 'date_format', setting_value: 'MM/DD/YYYY', setting_type: 'string', description: 'Date format', is_public: true },
              { category: 'localization', setting_key: 'time_format', setting_value: '12h', setting_type: 'string', description: 'Time format', is_public: true },
              { category: 'localization', setting_key: 'currency', setting_value: 'USD', setting_type: 'string', description: 'Default currency', is_public: true },
              { category: 'localization', setting_key: 'currency_symbol', setting_value: '$', setting_type: 'string', description: 'Currency symbol', is_public: true },
              
              // Email Settings
              { category: 'email', setting_key: 'mail_driver', setting_value: 'smtp', setting_type: 'string', description: 'Mail driver', is_public: false },
              { category: 'email', setting_key: 'mail_host', setting_value: 'smtp.example.com', setting_type: 'string', description: 'Mail host', is_public: false },
              { category: 'email', setting_key: 'mail_port', setting_value: '587', setting_type: 'string', description: 'Mail port', is_public: false },
              { category: 'email', setting_key: 'mail_username', setting_value: 'noreply@example.com', setting_type: 'string', description: 'Mail username', is_public: false },
              { category: 'email', setting_key: 'mail_password', setting_value: '', setting_type: 'string', description: 'Mail password', is_public: false },
              { category: 'email', setting_key: 'mail_encryption', setting_value: 'tls', setting_type: 'string', description: 'Mail encryption', is_public: false },
              { category: 'email', setting_key: 'mail_from_address', setting_value: 'noreply@example.com', setting_type: 'string', description: 'From address', is_public: false },
              { category: 'email', setting_key: 'mail_from_name', setting_value: 'HRMGO', setting_type: 'string', description: 'From name', is_public: false },
              
              // Notification Settings
              { category: 'notification', setting_key: 'email_notifications', setting_value: 'true', setting_type: 'boolean', description: 'Email notifications', is_public: false },
              { category: 'notification', setting_key: 'sms_notifications', setting_value: 'false', setting_type: 'boolean', description: 'SMS notifications', is_public: false },
              { category: 'notification', setting_key: 'push_notifications', setting_value: 'true', setting_type: 'boolean', description: 'Push notifications', is_public: false },
              { category: 'notification', setting_key: 'in_app_notifications', setting_value: 'true', setting_type: 'boolean', description: 'In-app notifications', is_public: false },
              
              // Security Settings
              { category: 'security', setting_key: 'password_min_length', setting_value: '8', setting_type: 'number', description: 'Minimum password length', is_public: false },
              { category: 'security', setting_key: 'password_require_special', setting_value: 'true', setting_type: 'boolean', description: 'Require special characters', is_public: false },
              { category: 'security', setting_key: 'session_timeout', setting_value: '120', setting_type: 'number', description: 'Session timeout', is_public: false },
              { category: 'security', setting_key: 'two_factor_enabled', setting_value: 'false', setting_type: 'boolean', description: 'Two-factor authentication', is_public: false },
              { category: 'security', setting_key: 'ip_whitelist', setting_value: '[]', setting_type: 'json', description: 'IP whitelist', is_public: false }
            ];
            
            for (const setting of defaultSettings) {
              await pool.query(`
                INSERT INTO settings (category, setting_key, setting_value, setting_type, description, is_public)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [setting.category, setting.setting_key, setting.setting_value, setting.setting_type, setting.description, setting.is_public]);
            }
            console.log('✅ Added default settings');
          } else {
            console.log('ℹ️ Default settings already exist');
          }
        } catch (error) {
          console.log(`❌ Error adding default settings: ${error.message}`);
        }
        
        // Add missing columns to user_permissions table if they don't exist
        try {
          await pool.query('ALTER TABLE user_permissions ADD COLUMN permission_id INT NULL');
          console.log('✅ Added permission_id column to user_permissions table');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ permission_id already exists in user_permissions table');
          } else {
            console.log(`❌ Error adding permission_id: ${error.message}`);
          }
        }
        
        try {
          await pool.query('ALTER TABLE user_permissions ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
          console.log('✅ Added is_active column to user_permissions table');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ is_active already exists in user_permissions table');
          } else {
            console.log(`❌ Error with user_permissions: ${error.message}`);
          }
        }
        
        // Add foreign key constraint for permission_id if it doesn't exist
        try {
          await pool.query('ALTER TABLE user_permissions ADD CONSTRAINT fk_user_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE');
          console.log('✅ Added foreign key constraint for permission_id');
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME') {
            console.log('ℹ️ Foreign key constraint already exists');
          } else {
            console.log(`❌ Error adding foreign key: ${error.message}`);
          }
        }
        
        // Add missing permissions
        const additionalPermissions = [
          // Dashboard & Analytics
          { key: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard and analytics', module: 'dashboard' },
          { key: 'dashboard.export', name: 'Export Dashboard Data', description: 'Export dashboard reports and data', module: 'dashboard' },
          
          // Calendar & Events
          { key: 'calendar.view', name: 'View Calendar', description: 'View company calendar and events', module: 'calendar' },
          { key: 'calendar.create', name: 'Create Events', description: 'Create new calendar events', module: 'calendar' },
          { key: 'calendar.edit', name: 'Edit Events', description: 'Edit existing calendar events', module: 'calendar' },
          { key: 'calendar.delete', name: 'Delete Events', description: 'Delete calendar events', module: 'calendar' },
          
          // Tasks & Projects
          { key: 'tasks.view', name: 'View Tasks', description: 'View assigned tasks and projects', module: 'tasks' },
          { key: 'tasks.create', name: 'Create Tasks', description: 'Create new tasks and projects', module: 'tasks' },
          { key: 'tasks.edit', name: 'Edit Tasks', description: 'Edit existing tasks', module: 'tasks' },
          { key: 'tasks.delete', name: 'Delete Tasks', description: 'Delete tasks and projects', module: 'tasks' },
          { key: 'tasks.assign', name: 'Assign Tasks', description: 'Assign tasks to other users', module: 'tasks' },
          
          // Organization Management
          { key: 'organization.view', name: 'View Organization Chart', description: 'View company organization structure', module: 'organization' },
          { key: 'organization.edit', name: 'Edit Organization Chart', description: 'Modify organization structure', module: 'organization' },
          
          // Leave Management
          { key: 'leave.view', name: 'View Leave Requests', description: 'View leave applications and history', module: 'leave' },
          { key: 'leave.create', name: 'Create Leave Request', description: 'Submit new leave applications', module: 'leave' },
          { key: 'leave.approve', name: 'Approve Leave', description: 'Approve or reject leave requests', module: 'leave' },
          { key: 'leave.edit', name: 'Edit Leave Requests', description: 'Modify leave applications', module: 'leave' },
          { key: 'leave.delete', name: 'Delete Leave Requests', description: 'Delete leave applications', module: 'leave' },
          { key: 'leave.manage', name: 'Manage Leave System', description: 'Full access to leave management system', module: 'leave' },
          { key: 'leave.types.view', name: 'View Leave Types', description: 'View leave types configuration', module: 'leave' },
          { key: 'leave.types.manage', name: 'Manage Leave Types', description: 'Create/edit/delete leave types', module: 'leave' },
          { key: 'leave.policies.view', name: 'View Leave Policies', description: 'View leave policies', module: 'leave' },
          { key: 'leave.policies.manage', name: 'Manage Leave Policies', description: 'Create/edit/delete leave policies', module: 'leave' },
          { key: 'leave.balances.view', name: 'View Leave Balances', description: 'View employee leave balances', module: 'leave' },
          { key: 'leave.balances.manage', name: 'Manage Leave Balances', description: 'Adjust employee leave balances', module: 'leave' },
          { key: 'leave.holidays.view', name: 'View Holidays', description: 'View company holidays', module: 'leave' },
          { key: 'leave.holidays.manage', name: 'Manage Holidays', description: 'Create/edit/delete holidays', module: 'leave' },
          { key: 'leave.reports', name: 'Leave Reports', description: 'Generate and view leave reports', module: 'leave' },
          
          // Payroll & Finance
          { key: 'payroll.view', name: 'View Payroll', description: 'View payroll information and reports', module: 'payroll' },
          { key: 'payroll.create', name: 'Create Payroll', description: 'Generate payroll for employees', module: 'payroll' },
          { key: 'payroll.edit', name: 'Edit Payroll', description: 'Modify payroll calculations', module: 'payroll' },
          { key: 'payroll.approve', name: 'Approve Payroll', description: 'Approve payroll for processing', module: 'payroll' },
          { key: 'expenses.view', name: 'View Expenses', description: 'View expense reports and claims', module: 'expenses' },
          { key: 'expenses.create', name: 'Create Expense', description: 'Submit new expense claims', module: 'expenses' },
          { key: 'expenses.approve', name: 'Approve Expenses', description: 'Approve expense claims', module: 'expenses' },
          
          // Recruitment
          { key: 'recruitment.view', name: 'View Recruitment', description: 'View recruitment dashboard and statistics', module: 'recruitment' },
          { key: 'jobs.view', name: 'View Job Postings', description: 'View available job positions', module: 'jobs' },
          { key: 'jobs.create', name: 'Create Job Posting', description: 'Create new job postings', module: 'jobs' },
          { key: 'jobs.edit', name: 'Edit Job Postings', description: 'Edit existing job postings', module: 'jobs' },
          { key: 'jobs.delete', name: 'Delete Job Postings', description: 'Delete job postings', module: 'jobs' },
          { key: 'candidates.view', name: 'View Candidates', description: 'View candidate profiles and applications', module: 'candidates' },
          { key: 'candidates.create', name: 'Add Candidates', description: 'Add new candidate profiles', module: 'candidates' },
          { key: 'candidates.edit', name: 'Edit Candidates', description: 'Edit candidate information', module: 'candidates' },
          { key: 'candidates.delete', name: 'Delete Candidates', description: 'Delete candidate profiles', module: 'candidates' },
          { key: 'interviews.view', name: 'View Interviews', description: 'View interview schedules and results', module: 'interviews' },
          { key: 'interviews.create', name: 'Schedule Interviews', description: 'Schedule new interviews', module: 'interviews' },
          { key: 'interviews.edit', name: 'Edit Interviews', description: 'Modify interview schedules', module: 'interviews' },
          
          // Performance Management
          { key: 'performance.view', name: 'View Performance', description: 'View performance reviews and goals', module: 'performance' },
          { key: 'goals.view', name: 'View Goals', description: 'View employee goals and objectives', module: 'goals' },
          { key: 'goals.create', name: 'Create Goals', description: 'Set new performance goals', module: 'goals' },
          { key: 'goals.edit', name: 'Edit Goals', description: 'Modify existing goals', module: 'goals' },
          { key: 'reviews.view', name: 'View Reviews', description: 'View performance reviews', module: 'reviews' },
          { key: 'reviews.create', name: 'Create Reviews', description: 'Create performance reviews', module: 'reviews' },
          { key: 'reviews.edit', name: 'Edit Reviews', description: 'Edit performance reviews', module: 'reviews' },
          
          // Reports & Analytics
          { key: 'reports.view', name: 'View Reports', description: 'Access to all system reports', module: 'reports' },
          { key: 'reports.export', name: 'Export Reports', description: 'Export reports in various formats', module: 'reports' },
          { key: 'reports.income_expense', name: 'Income vs Expense Reports', description: 'View financial reports', module: 'reports' },
          { key: 'reports.attendance', name: 'Attendance Reports', description: 'View attendance analytics', module: 'reports' },
          { key: 'reports.leave', name: 'Leave Reports', description: 'View leave analytics', module: 'reports' },
          { key: 'reports.payroll', name: 'Payroll Reports', description: 'View payroll reports', module: 'reports' },
          
          // Asset Management
          { key: 'assets.view', name: 'View Assets', description: 'View company assets and inventory', module: 'assets' },
          { key: 'assets.create', name: 'Create Assets', description: 'Add new assets to inventory', module: 'assets' },
          { key: 'assets.edit', name: 'Edit Assets', description: 'Modify asset information', module: 'assets' },
          { key: 'assets.delete', name: 'Delete Assets', description: 'Remove assets from inventory', module: 'assets' },
          { key: 'assets.assign', name: 'Assign Assets', description: 'Assign assets to employees', module: 'assets' },
          
          // Documents & Policies
          { key: 'documents.view', name: 'View Documents', description: 'View company documents and policies', module: 'documents' },
          { key: 'documents.create', name: 'Create Documents', description: 'Upload new documents', module: 'documents' },
          { key: 'documents.edit', name: 'Edit Documents', description: 'Modify existing documents', module: 'documents' },
          { key: 'documents.delete', name: 'Delete Documents', description: 'Delete documents', module: 'documents' },
          
          // System Administration
          { key: 'settings.view', name: 'View Settings', description: 'View system settings and configuration', module: 'settings' },
          { key: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', module: 'settings' },
          { key: 'users.view', name: 'View Users', description: 'View user accounts and profiles', module: 'users' },
          { key: 'users.create', name: 'Create Users', description: 'Create new user accounts', module: 'users' },
          { key: 'users.edit', name: 'Edit Users', description: 'Modify user accounts', module: 'users' },
          { key: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', module: 'users' },
          { key: 'audit.view', name: 'View Audit Logs', description: 'View system audit logs and history', module: 'audit' },
          
          // Timekeeping & Attendance
          { key: 'timekeeping.view', name: 'View Timekeeping', description: 'View timekeeping dashboard', module: 'timekeeping' },
          { key: 'shifts.view', name: 'View Shifts', description: 'View work shifts and schedules', module: 'shifts' },
          { key: 'shifts.create', name: 'Create Shifts', description: 'Create new work shifts', module: 'shifts' },
          { key: 'shifts.edit', name: 'Edit Shifts', description: 'Modify work shifts', module: 'shifts' },
          { key: 'shifts.delete', name: 'Delete Shifts', description: 'Delete work shifts', module: 'shifts' },
          { key: 'policies.view', name: 'View Attendance Policies', description: 'View attendance policies', module: 'policies' },
          { key: 'policies.create', name: 'Create Attendance Policies', description: 'Create new attendance policies', module: 'policies' },
          { key: 'policies.edit', name: 'Edit Attendance Policies', description: 'Modify attendance policies', module: 'policies' },
          { key: 'records.view', name: 'View Attendance Records', description: 'View attendance records and history', module: 'records' },
          { key: 'records.edit', name: 'Edit Attendance Records', description: 'Modify attendance records', module: 'records' },
          { key: 'regulations.view', name: 'View Regulations', description: 'View attendance regulations', module: 'regulations' },
          { key: 'regulations.create', name: 'Create Regulations', description: 'Create new attendance regulations', module: 'regulations' },
          { key: 'regulations.edit', name: 'Edit Regulations', description: 'Modify attendance regulations', module: 'regulations' },
          { key: 'regulations.delete', name: 'Delete Regulations', description: 'Delete attendance regulations', module: 'regulations' },
          { key: 'regularization.view', name: 'View Regularization', description: 'View attendance regularization requests', module: 'regularization' },
          { key: 'regularization.create', name: 'Create Regularization', description: 'Submit attendance regularization requests', module: 'regularization' },
          { key: 'regularization.approve', name: 'Approve Regularization', description: 'Approve attendance regularization requests', module: 'regularization' },
          
          // Profile & Personal
          { key: 'profile.view', name: 'View Profile', description: 'View own profile information', module: 'profile' },
          { key: 'profile.edit', name: 'Edit Profile', description: 'Edit own profile information', module: 'profile' },
          { key: 'profile.upload_photo', name: 'Upload Profile Photo', description: 'Upload and change profile photo', module: 'profile' }
        ];
        
        console.log('🔄 Adding missing permissions...');
        for (const permission of additionalPermissions) {
          try {
            await pool.query(
              'INSERT INTO permissions (permission_key, permission_name, description, module, is_active, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
              [permission.key, permission.name, permission.description, permission.module, true]
            );
            console.log(`✅ Added permission: ${permission.name}`);
          } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              console.log(`ℹ️ Permission already exists: ${permission.name}`);
            } else {
              console.log(`❌ Error adding permission ${permission.name}: ${error.message}`);
            }
          }
        }
        
        // Create test users if they don't exist
        try {
          const testUsers = [
            {
              name: 'Admin User',
              email: 'admin@example.com',
              password: 'admin123',
              role: 'super_admin',
              status: 'active'
            },
            {
              name: 'HR Manager',
              email: 'hr@example.com',
              password: 'hr123',
              role: 'hr_manager',
              status: 'active'
            },
            {
              name: 'Employee User',
              email: 'employee@example.com',
              password: 'employee123',
              role: 'employee',
              status: 'active'
            }
          ];

          for (const user of testUsers) {
            try {
              // Check if user already exists
              const [existing] = await pool.query(
                'SELECT id FROM users WHERE email = ?',
                [user.email]
              );

              if (existing.length === 0) {
                // Create user
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await pool.query(
                  'INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                  [user.name, user.email, hashedPassword, user.role, user.status]
                );
                console.log(`✅ Created test user: ${user.email}`);
              } else {
                console.log(`ℹ️ Test user already exists: ${user.email}`);
              }
            } catch (error) {
              console.log(`❌ Error creating test user ${user.email}: ${error.message}`);
            }
          }
        } catch (error) {
          console.log(`❌ Error in test user creation: ${error.message}`);
        }
        
        console.log('🎉 Auto-migration completed!');
      } catch (error) {
        console.error('❌ Auto-migration failed:', error.message);
      }
    }
