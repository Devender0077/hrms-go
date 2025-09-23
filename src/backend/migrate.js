// Database migration script for HRM system
    const mysql = require('mysql2/promise');
    const bcrypt = require('bcrypt');
    const fs = require('fs').promises;
    const path = require('path');
    const dotenv = require('dotenv');

    // Load environment variables
    dotenv.config();

    // Database connection config
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    };

    async function runMigration() {
      let connection;
      
      try {
        console.log('Starting database migration...');
        
        // Create connection
        connection = await mysql.createConnection(dbConfig);
        
        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'hrmgo_hero';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Database '${dbName}' created or already exists`);
        
        // Use the database
        await connection.query(`USE ${dbName}`);
        
        // Check if schema.sql file exists
        try {
          const schemaPath = path.join(__dirname, '../database/schema.sql');
          await fs.access(schemaPath);
          
          // Read schema file
          const schemaSql = await fs.readFile(schemaPath, 'utf8');
          
          // Split SQL statements and execute them
          const statements = schemaSql
            .replace(/--.*$/gm, '') // Remove comments
            .split(';')
            .filter(statement => statement.trim());
          
          for (const statement of statements) {
            try {
              await connection.query(statement);
            } catch (error) {
              console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
              console.error(error.message);
              // Continue with other statements
            }
          }
          
          console.log('Schema created successfully');
        } catch (error) {
          console.error('Schema file not found or could not be read. Creating tables manually...');
          
          // Create tables manually if schema file is not found
          await createTablesManually(connection);
        }
        
        // Create default company
        const [companyExists] = await connection.query('SELECT id FROM companies WHERE name = "HRMGO"');
        
        let companyId;
        
        if (companyExists.length === 0) {
          const [companyResult] = await connection.query(
            `INSERT INTO companies (name, legal_name, email, phone, address, city, country)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['HRMGO', 'HRMGO Inc.', 'info@hrmgo.com', '+1234567890', '123 Main St', 'New York', 'USA']
          );
          
          companyId = companyResult.insertId;
          console.log(`Default company created with ID: ${companyId}`);
        } else {
          companyId = companyExists[0].id;
          console.log(`Default company already exists with ID: ${companyId}`);
        }
        
        // Create default super admin user
        const [adminExists] = await connection.query('SELECT id FROM users WHERE email = "admin@hrmgo.com"');
        
        let adminId;
        
        if (adminExists.length === 0) {
          // Hash password
          const hashedPassword = await bcrypt.hash('admin123', 10);
          
          const [userResult] = await connection.query(
            `INSERT INTO users (name, email, password, role, status)
             VALUES (?, ?, ?, ?, ?)`,
            ['Admin User', 'admin@hrmgo.com', hashedPassword, 'super_admin', 'active']
          );
          
          adminId = userResult.insertId;
          console.log(`Super admin created with ID: ${adminId}`);
          console.log('Default login: admin@hrmgo.com / admin123');
          
          // Create employee record for admin
          try {
            const [employeeResult] = await connection.query(
              `INSERT INTO employees (
                user_id, company_id, employee_id, first_name, last_name, email, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [adminId, companyId, 'EMP001', 'Admin', 'User', 'admin@hrmgo.com', 'active']
            );
            
            console.log(`Admin employee record created with ID: ${employeeResult.insertId}`);
          } catch (error) {
            console.error('Error creating admin employee record:', error.message);
          }
        } else {
          adminId = adminExists[0].id;
          console.log(`Super admin already exists with ID: ${adminId}`);
        }
        
        // Create company admin user
        const [companyAdminExists] = await connection.query('SELECT id FROM users WHERE email = "company@hrmgo.com"');
        
        let companyAdminId;
        
        if (companyAdminExists.length === 0) {
          // Hash password
          const hashedPassword = await bcrypt.hash('company123', 10);
          
          const [userResult] = await connection.query(
            `INSERT INTO users (name, email, password, role, status)
             VALUES (?, ?, ?, ?, ?)`,
            ['Company Admin', 'company@hrmgo.com', hashedPassword, 'company_admin', 'active']
          );
          
          companyAdminId = userResult.insertId;
          console.log(`Company admin created with ID: ${companyAdminId}`);
          console.log('Company admin login: company@hrmgo.com / company123');
          
          // Create employee record for company admin
          try {
            const [employeeResult] = await connection.query(
              `INSERT INTO employees (
                user_id, company_id, employee_id, first_name, last_name, email, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [companyAdminId, companyId, 'EMP002', 'Company', 'Admin', 'company@hrmgo.com', 'active']
            );
            
            console.log(`Company admin employee record created with ID: ${employeeResult.insertId}`);
          } catch (error) {
            console.error('Error creating company admin employee record:', error.message);
          }
        } else {
          companyAdminId = companyAdminExists[0].id;
          console.log(`Company admin already exists with ID: ${companyAdminId}`);
        }
        
        // Create employee user
        const [employeeExists] = await connection.query('SELECT id FROM users WHERE email = "employee@hrmgo.com"');
        
        let employeeUserId;
        
        if (employeeExists.length === 0) {
          // Hash password
          const hashedPassword = await bcrypt.hash('employee123', 10);
          
          const [userResult] = await connection.query(
            `INSERT INTO users (name, email, password, role, status)
             VALUES (?, ?, ?, ?, ?)`,
            ['John Employee', 'employee@hrmgo.com', hashedPassword, 'employee', 'active']
          );
          
          employeeUserId = userResult.insertId;
          console.log(`Employee user created with ID: ${employeeUserId}`);
          console.log('Employee login: employee@hrmgo.com / employee123');
          
          // Create employee record
          try {
            const [employeeResult] = await connection.query(
              `INSERT INTO employees (
                user_id, company_id, employee_id, first_name, last_name, email, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [employeeUserId, companyId, 'EMP003', 'John', 'Employee', 'employee@hrmgo.com', 'active']
            );
            
            console.log(`Employee record created with ID: ${employeeResult.insertId}`);
          } catch (error) {
            console.error('Error creating employee record:', error.message);
          }
        } else {
          employeeUserId = employeeExists[0].id;
          console.log(`Employee user already exists with ID: ${employeeUserId}`);
        }
        
        // Create default departments
        const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations'];
        
        for (const dept of departments) {
          const [deptExists] = await connection.query('SELECT id FROM departments WHERE name = ? AND company_id = ?', [dept, companyId]);
          
          if (deptExists.length === 0) {
            await connection.query(
              `INSERT INTO departments (company_id, name, description)
               VALUES (?, ?, ?)`,
              [companyId, dept, `${dept} Department`]
            );
            console.log(`Created department: ${dept}`);
          } else {
            console.log(`Department ${dept} already exists`);
          }
        }
        
        // Create default designations
        const designations = [
          { name: 'HR Manager', dept: 'HR' },
          { name: 'HR Executive', dept: 'HR' },
          { name: 'Software Engineer', dept: 'IT' },
          { name: 'System Administrator', dept: 'IT' },
          { name: 'Finance Manager', dept: 'Finance' },
          { name: 'Accountant', dept: 'Finance' },
          { name: 'Marketing Manager', dept: 'Marketing' },
          { name: 'Marketing Executive', dept: 'Marketing' },
          { name: 'Operations Manager', dept: 'Operations' },
          { name: 'Operations Executive', dept: 'Operations' }
        ];
        
        for (const desig of designations) {
          // Get department ID
          const [deptResult] = await connection.query(
            'SELECT id FROM departments WHERE name = ? AND company_id = ?',
            [desig.dept, companyId]
          );
          
          if (deptResult.length > 0) {
            const deptId = deptResult[0].id;
            
            const [desigExists] = await connection.query(
              'SELECT id FROM designations WHERE name = ? AND company_id = ?',
              [desig.name, companyId]
            );
            
            if (desigExists.length === 0) {
              await connection.query(
                `INSERT INTO designations (company_id, department_id, name, description)
                 VALUES (?, ?, ?, ?)`,
                [companyId, deptId, desig.name, `${desig.name} Position`]
              );
              console.log(`Created designation: ${desig.name}`);
            } else {
              console.log(`Designation ${desig.name} already exists`);
            }
          }
        }
        
        // Create default leave types
        const leaveTypes = [
          { name: 'Annual Leave', days: 20, isPaid: true },
          { name: 'Sick Leave', days: 10, isPaid: true },
          { name: 'Unpaid Leave', days: 30, isPaid: false },
          { name: 'Maternity Leave', days: 90, isPaid: true },
          { name: 'Paternity Leave', days: 10, isPaid: true }
        ];
        
        for (const leave of leaveTypes) {
          const [leaveExists] = await connection.query(
            'SELECT id FROM leave_types WHERE name = ? AND company_id = ?',
            [leave.name, companyId]
          );
          
          if (leaveExists.length === 0) {
            await connection.query(
              `INSERT INTO leave_types (company_id, name, days_allowed, is_paid)
               VALUES (?, ?, ?, ?)`,
              [companyId, leave.name, leave.days, leave.isPaid]
            );
            console.log(`Created leave type: ${leave.name}`);
          } else {
            console.log(`Leave type ${leave.name} already exists`);
          }
        }
        
        // Create sample data for testing
        await createSampleData(connection, companyId);
        
        console.log('Migration completed successfully!');
        
      } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
      } finally {
        if (connection) {
          await connection.end();
        }
      }
    }
    
    // Function to create tables manually if schema file is not found
    async function createTablesManually(connection) {
      try {
        console.log('Creating tables manually...');
        
        // Users Table
        await connection.query(`
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('Users table created');
        
        // Companies Table
        await connection.query(`
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
        console.log('Companies table created');
        
        // Branches Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS branches (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100),
            zip_code VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Branches table created');
        
        // Departments Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS departments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            branch_id INT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
          )
        `);
        console.log('Departments table created');
        
        // Designations Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS designations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            department_id INT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
          )
        `);
        console.log('Designations table created');
        
        // Employees Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            company_id INT NOT NULL,
            branch_id INT,
            department_id INT,
            designation_id INT,
            manager_id INT,
            employee_id VARCHAR(50) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            date_of_birth DATE,
            gender ENUM('male', 'female', 'other'),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100),
            zip_code VARCHAR(20),
            joining_date DATE,
            exit_date DATE,
            status ENUM('active', 'inactive', 'on_leave', 'terminated') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
            FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL,
            FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
          )
        `);
        console.log('Employees table created');
        
        // Employee Documents Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS employee_documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            document_type VARCHAR(100) NOT NULL,
            document_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            expiry_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
          )
        `);
        console.log('Employee Documents table created');
        
        // Attendance Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            date DATE NOT NULL,
            check_in DATETIME,
            check_out DATETIME,
            status ENUM('present', 'absent', 'late', 'leave') NOT NULL,
            work_hours DECIMAL(5,2),
            ip_address VARCHAR(45),
            location_latitude DECIMAL(10,8),
            location_longitude DECIMAL(11,8),
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
          )
        `);
        console.log('Attendance table created');
        
        // Leave Types Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS leave_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            days_allowed INT NOT NULL,
            requires_approval BOOLEAN DEFAULT TRUE,
            is_paid BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Leave Types table created');
        
        // Leave Applications Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS leave_applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            leave_type_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            total_days INT NOT NULL,
            reason TEXT,
            status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
            approved_by INT,
            approved_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
            FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
          )
        `);
        console.log('Leave Applications table created');
        
        // Salary Components Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS salary_components (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            type ENUM('earning', 'deduction') NOT NULL,
            is_taxable BOOLEAN DEFAULT FALSE,
            is_fixed BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Salary Components table created');
        
        // Employee Salaries Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS employee_salaries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            basic_salary DECIMAL(15,2) NOT NULL,
            effective_date DATE NOT NULL,
            end_date DATE,
            payment_type ENUM('monthly', 'weekly', 'biweekly', 'hourly') DEFAULT 'monthly',
            bank_name VARCHAR(100),
            account_number VARCHAR(50),
            account_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
          )
        `);
        console.log('Employee Salaries table created');
        
        // Employee Salary Components Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS employee_salary_components (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_salary_id INT NOT NULL,
            salary_component_id INT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            percentage DECIMAL(5,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_salary_id) REFERENCES employee_salaries(id) ON DELETE CASCADE,
            FOREIGN KEY (salary_component_id) REFERENCES salary_components(id) ON DELETE CASCADE
          )
        `);
        console.log('Employee Salary Components table created');
        
        // Payslips Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS payslips (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            month INT NOT NULL,
            year INT NOT NULL,
            basic_salary DECIMAL(15,2) NOT NULL,
            total_earnings DECIMAL(15,2) NOT NULL,
            total_deductions DECIMAL(15,2) NOT NULL,
            net_salary DECIMAL(15,2) NOT NULL,
            payment_date DATE,
            payment_method ENUM('bank', 'cash', 'cheque', 'online') DEFAULT 'bank',
            status ENUM('draft', 'generated', 'paid', 'cancelled') DEFAULT 'draft',
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
          )
        `);
        console.log('Payslips table created');
        
        // Job Postings Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS job_postings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            department_id INT,
            designation_id INT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            requirements TEXT,
            responsibilities TEXT,
            location VARCHAR(255),
            job_type ENUM('full_time', 'part_time', 'contract', 'internship', 'remote') DEFAULT 'full_time',
            experience_min INT,
            experience_max INT,
            salary_min DECIMAL(15,2),
            salary_max DECIMAL(15,2),
            vacancies INT DEFAULT 1,
            closing_date DATE,
            status ENUM('draft', 'published', 'closed', 'archived') DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
            FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL
          )
        `);
        console.log('Job Postings table created');
        
        // Job Applications Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS job_applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_posting_id INT NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            resume VARCHAR(255) NOT NULL,
            cover_letter TEXT,
            status ENUM('new', 'screening', 'interview', 'testing', 'offer', 'hired', 'rejected') DEFAULT 'new',
            source VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE
          )
        `);
        console.log('Job Applications table created');
        
        // Performance Review Cycles Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS performance_cycles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Performance Cycles table created');
        
        // Performance Reviews Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS performance_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cycle_id INT NOT NULL,
            employee_id INT NOT NULL,
            reviewer_id INT NOT NULL,
            overall_rating DECIMAL(3,2),
            comments TEXT,
            status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
            submission_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (cycle_id) REFERENCES performance_cycles(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        console.log('Performance Reviews table created');
        
        // Training Programs Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS training_programs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATE,
            end_date DATE,
            location VARCHAR(255),
            cost DECIMAL(15,2),
            status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Training Programs table created');
        
        // Training Participants Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS training_participants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            program_id INT NOT NULL,
            employee_id INT NOT NULL,
            status ENUM('enrolled', 'attending', 'completed', 'dropped') DEFAULT 'enrolled',
            completion_date DATE,
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
          )
        `);
        console.log('Training Participants table created');
        
        // Assets Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS assets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            asset_code VARCHAR(50),
            category VARCHAR(100),
            purchase_date DATE,
            purchase_cost DECIMAL(15,2),
            warranty_expiry DATE,
            status ENUM('available', 'assigned', 'under_maintenance', 'disposed') DEFAULT 'available',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Assets table created');
        
        // Asset Assignments Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS asset_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            asset_id INT NOT NULL,
            employee_id INT NOT NULL,
            assigned_date DATE NOT NULL,
            return_date DATE,
            condition_on_assign TEXT,
            condition_on_return TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
          )
        `);
        console.log('Asset Assignments table created');
        
        // Announcements Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATE,
            end_date DATE,
            departments VARCHAR(255),
            created_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        console.log('Announcements table created');
        
        // Documents Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            file_path VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            visibility ENUM('public', 'private', 'restricted') DEFAULT 'private',
            uploaded_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        console.log('Documents table created');
        
        // System Settings Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            setting_key VARCHAR(100) NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('System Settings table created');
        
        // Audit Logs Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            action VARCHAR(255) NOT NULL,
            entity_type VARCHAR(100),
            entity_id INT,
            old_values TEXT,
            new_values TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
          )
        `);
        console.log('Audit Logs table created');
        
        // Projects Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATE,
            end_date DATE,
            status ENUM('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'not_started',
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            budget DECIMAL(15,2),
            client_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Projects table created');
        
        // Project Members Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS project_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            employee_id INT NOT NULL,
            role VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
          )
        `);
        console.log('Project Members table created');
        
        // Tasks Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            assigned_to INT,
            assigned_by INT,
            due_date DATE,
            status ENUM('todo', 'in_progress', 'review', 'completed') DEFAULT 'todo',
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
            FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
          )
        `);
        console.log('Tasks table created');
        
        // Holidays Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS holidays (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            description TEXT,
            is_recurring BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
          )
        `);
        console.log('Holidays table created');
        
        // Expenses Table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            employee_id INT NOT NULL,
            expense_date DATE NOT NULL,
            category VARCHAR(100) NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            description TEXT,
            receipt_path VARCHAR(255),
            status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
            approved_by INT,
            approved_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
          )
        `);
        console.log('Expenses table created');
        
        console.log('All tables created successfully');
      } catch (error) {
        console.error('Error creating tables manually:', error);
        throw error;
      }
    }
    
    // Function to create sample data for testing
    async function createSampleData(connection, companyId) {
      try {
        console.log('Creating sample data...');
        
        // Create sample branches
        const branches = [
          { name: 'Headquarters', location: 'New York', address: '123 Main St', city: 'New York', country: 'USA' },
          { name: 'West Coast Office', location: 'San Francisco', address: '456 Market St', city: 'San Francisco', country: 'USA' },
          { name: 'European Office', location: 'London', address: '789 Oxford St', city: 'London', country: 'UK' }
        ];
        
        for (const branch of branches) {
          const [branchExists] = await connection.query('SELECT id FROM branches WHERE name = ? AND company_id = ?', [branch.name, companyId]);
          
          if (branchExists.length === 0) {
            await connection.query(
              `INSERT INTO branches (company_id, name, location, address, city, country)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [companyId, branch.name, branch.location, branch.address, branch.city, branch.country]
            );
            console.log(`Created branch: ${branch.name}`);
          }
        }
        
        // Create sample employees
        const sampleEmployees = [
          {
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@hrmgo.com',
            phone: '+1234567891',
            department: 'HR',
            designation: 'HR Manager',
            employee_id: 'EMP004',
            gender: 'female',
            joining_date: '2022-01-15'
          },
          {
            first_name: 'Michael',
            last_name: 'Smith',
            email: 'michael.smith@hrmgo.com',
            phone: '+1234567892',
            department: 'IT',
            designation: 'Software Engineer',
            employee_id: 'EMP005',
            gender: 'male',
            joining_date: '2022-02-01'
          },
          {
            first_name: 'Emily',
            last_name: 'Davis',
            email: 'emily.davis@hrmgo.com',
            phone: '+1234567893',
            department: 'Finance',
            designation: 'Accountant',
            employee_id: 'EMP006',
            gender: 'female',
            joining_date: '2022-03-10'
          },
          {
            first_name: 'David',
            last_name: 'Wilson',
            email: 'david.wilson@hrmgo.com',
            phone: '+1234567894',
            department: 'Marketing',
            designation: 'Marketing Manager',
            employee_id: 'EMP007',
            gender: 'male',
            joining_date: '2022-04-05'
          }
        ];
        
        for (const emp of sampleEmployees) {
          // Check if employee already exists
          const [empExists] = await connection.query('SELECT id FROM employees WHERE email = ?', [emp.email]);
          
          if (empExists.length === 0) {
            // Get department ID
            const [deptResult] = await connection.query(
              'SELECT id FROM departments WHERE name = ? AND company_id = ?',
              [emp.department, companyId]
            );
            
            if (deptResult.length === 0) {
              console.log(`Department ${emp.department} not found, skipping employee ${emp.first_name} ${emp.last_name}`);
              continue;
            }
            
            const departmentId = deptResult[0].id;
            
            // Get designation ID
            const [desigResult] = await connection.query(
              'SELECT id FROM designations WHERE name = ? AND company_id = ?',
              [emp.designation, companyId]
            );
            
            if (desigResult.length === 0) {
              console.log(`Designation ${emp.designation} not found, skipping employee ${emp.first_name} ${emp.last_name}`);
              continue;
            }
            
            const designationId = desigResult[0].id;
            
            // Create user account
            const hashedPassword = await bcrypt.hash('password123', 10);
            
            const [userResult] = await connection.query(
              `INSERT INTO users (name, email, password, role, status)
               VALUES (?, ?, ?, ?, ?)`,
              [`${emp.first_name} ${emp.last_name}`, emp.email, hashedPassword, 'employee', 'active']
            );
            
            const userId = userResult.insertId;
            
            // Create employee record
            await connection.query(
              `INSERT INTO employees (
                user_id, company_id, department_id, designation_id,
                employee_id, first_name, last_name, email, phone,
                gender, joining_date, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId, companyId, departmentId, designationId,
                emp.employee_id, emp.first_name, emp.last_name, emp.email, emp.phone,
                emp.gender, emp.joining_date, 'active'
              ]
            );
            
            console.log(`Created employee: ${emp.first_name} ${emp.last_name}`);
          }
        }
        
        // Create sample salary components
        const salaryComponents = [
          { name: 'Basic Salary', type: 'earning', is_taxable: true, is_fixed: true },
          { name: 'House Rent Allowance', type: 'earning', is_taxable: false, is_fixed: true },
          { name: 'Transport Allowance', type: 'earning', is_taxable: false, is_fixed: true },
          { name: 'Medical Allowance', type: 'earning', is_taxable: false, is_fixed: true },
          { name: 'Performance Bonus', type: 'earning', is_taxable: true, is_fixed: false },
          { name: 'Income Tax', type: 'deduction', is_taxable: false, is_fixed: false },
          { name: 'Provident Fund', type: 'deduction', is_taxable: false, is_fixed: true },
          { name: 'Health Insurance', type: 'deduction', is_taxable: false, is_fixed: true }
        ];
        
        for (const comp of salaryComponents) {
          const [compExists] = await connection.query(
            'SELECT id FROM salary_components WHERE name = ? AND company_id = ?',
            [comp.name, companyId]
          );
          
          if (compExists.length === 0) {
            await connection.query(
              `INSERT INTO salary_components (company_id, name, type, is_taxable, is_fixed)
               VALUES (?, ?, ?, ?, ?)`,
              [companyId, comp.name, comp.type, comp.is_taxable, comp.is_fixed]
            );
            console.log(`Created salary component: ${comp.name}`);
          }
        }
        
        // Create sample holidays
        const holidays = [
          { name: 'New Year\'s Day', date: '2024-01-01', description: 'New Year\'s Day celebration' },
          { name: 'Independence Day', date: '2024-07-04', description: 'Independence Day celebration' },
          { name: 'Labor Day', date: '2024-09-02', description: 'Labor Day celebration' },
          { name: 'Thanksgiving', date: '2024-11-28', description: 'Thanksgiving celebration' },
          { name: 'Christmas', date: '2024-12-25', description: 'Christmas celebration' }
        ];
        
        for (const holiday of holidays) {
          const [holidayExists] = await connection.query(
            'SELECT id FROM holidays WHERE name = ? AND date = ? AND company_id = ?',
            [holiday.name, holiday.date, companyId]
          );
          
          if (holidayExists.length === 0) {
            await connection.query(
              `INSERT INTO holidays (company_id, name, date, description, is_recurring)
               VALUES (?, ?, ?, ?, ?)`,
              [companyId, holiday.name, holiday.date, holiday.description, true]
            );
            console.log(`Created holiday: ${holiday.name}`);
          }
        }
        
        // Create sample job postings
        const jobPostings = [
          {
            title: 'Senior Software Engineer',
            department: 'IT',
            designation: 'Software Engineer',
            description: 'We are looking for an experienced software engineer to join our team.',
            requirements: '5+ years of experience in software development, proficiency in JavaScript and React.',
            responsibilities: 'Develop and maintain web applications, collaborate with cross-functional teams.',
            location: 'New York',
            job_type: 'full_time',
            experience_min: 5,
            experience_max: 8,
            salary_min: 100000,
            salary_max: 130000,
            vacancies: 2,
            closing_date: '2024-06-30',
            status: 'published'
          },
          {
            title: 'HR Executive',
            department: 'HR',
            designation: 'HR Executive',
            description: 'We are looking for an HR Executive to support our HR operations.',
            requirements: '2+ years of experience in HR, knowledge of HR practices and procedures.',
            responsibilities: 'Manage employee records, assist in recruitment, handle employee queries.',
            location: 'San Francisco',
            job_type: 'full_time',
            experience_min: 2,
            experience_max: 4,
            salary_min: 60000,
            salary_max: 75000,
            vacancies: 1,
            closing_date: '2024-05-15',
            status: 'published'
          }
        ];
        
        for (const job of jobPostings) {
          const [jobExists] = await connection.query(
            'SELECT id FROM job_postings WHERE title = ? AND company_id = ?',
            [job.title, companyId]
          );
          
          if (jobExists.length === 0) {
            // Get department ID
            const [deptResult] = await connection.query(
              'SELECT id FROM departments WHERE name = ? AND company_id = ?',
              [job.department, companyId]
            );
            
            if (deptResult.length === 0) {
              console.log(`Department ${job.department} not found, skipping job posting ${job.title}`);
              continue;
            }
            
            const departmentId = deptResult[0].id;
            
            // Get designation ID
            const [desigResult] = await connection.query(
              'SELECT id FROM designations WHERE name = ? AND company_id = ?',
              [job.designation, companyId]
            );
            
            if (desigResult.length === 0) {
              console.log(`Designation ${job.designation} not found, skipping job posting ${job.title}`);
              continue;
            }
            
            const designationId = desigResult[0].id;
            
            await connection.query(
              `INSERT INTO job_postings (
                company_id, department_id, designation_id, title, description,
                requirements, responsibilities, location, job_type,
                experience_min, experience_max, salary_min, salary_max,
                vacancies, closing_date, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                companyId, departmentId, designationId, job.title, job.description,
                job.requirements, job.responsibilities, job.location, job.job_type,
                job.experience_min, job.experience_max, job.salary_min, job.salary_max,
                job.vacancies, job.closing_date, job.status
              ]
            );
            
            console.log(`Created job posting: ${job.title}`);
          }
        }
        
        // Create sample projects
        const projects = [
          {
            name: 'Website Redesign',
            description: 'Redesign the company website to improve user experience and conversion rates.',
            start_date: '2024-02-01',
            end_date: '2024-05-31',
            status: 'in_progress',
            priority: 'high',
            budget: 50000,
            client_name: 'Internal'
          },
          {
            name: 'Mobile App Development',
            description: 'Develop a mobile app for customers to access our services on the go.',
            start_date: '2024-03-15',
            end_date: '2024-08-31',
            status: 'in_progress',
            priority: 'medium',
            budget: 75000,
            client_name: 'Internal'
          }
        ];
        
        for (const project of projects) {
          const [projectExists] = await connection.query(
            'SELECT id FROM projects WHERE name = ? AND company_id = ?',
            [project.name, companyId]
          );
          
          if (projectExists.length === 0) {
            await connection.query(
              `INSERT INTO projects (
                company_id, name, description, start_date, end_date,
                status, priority, budget, client_name
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                companyId, project.name, project.description, project.start_date, project.end_date,
                project.status, project.priority, project.budget, project.client_name
              ]
            );
            
            console.log(`Created project: ${project.name}`);
          }
        }
        
        console.log('Sample data created successfully');
      } catch (error) {
        console.error('Error creating sample data:', error);
        throw error;
      }
    }
    
    runMigration();
