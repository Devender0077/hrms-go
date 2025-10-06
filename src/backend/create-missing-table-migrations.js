const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createMissingTableMigrations() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hrmgo_hero'
    });

    console.log('🔍 Analyzing missing tables...');

    // Get current tables
    const [tables] = await connection.execute('SHOW TABLES');
    const currentTables = tables.map(row => Object.values(row)[0]);

    // Define all expected tables (145 total)
    const expectedTables = [
      'allowance_options', 'announcements', 'api_keys', 'asset_assignments', 'asset_categories', 'assets',
      'attendance', 'attendance_exceptions', 'attendance_policies', 'attendance_records', 'attendance_regularization_audit_logs',
      'attendance_regularization_requests', 'attendance_regulations', 'attendance_summaries', 'audit_logs', 'award_types',
      'awards', 'branches', 'cache_settings', 'calendar_events', 'candidates', 'chatgpt_conversations', 'chatgpt_settings',
      'companies', 'company_policies', 'competencies', 'complaints', 'contract_types', 'contracts', 'cookie_consent_settings',
      'deduction_options', 'departments', 'designations', 'document_categories', 'document_types', 'document_versions',
      'documents', 'email_templates', 'employee_benefits', 'employee_certifications', 'employee_contracts', 'employee_documents',
      'employee_education', 'employee_emergency_contacts', 'employee_experience', 'employee_family', 'employee_handbook',
      'employee_medical', 'employee_notes', 'employee_photos', 'employee_references', 'employee_salaries', 'employee_salary_components',
      'employee_salary_history', 'employee_skills', 'employee_timeline', 'employees', 'events', 'expense_categories', 'expense_types',
      'expenses', 'experience_certificates', 'file_uploads', 'goal_tracking', 'goal_types', 'goal_updates', 'goals',
      'google_calendar_integrations', 'holidays', 'hr_setup_steps', 'income_types', 'interview_schedules', 'interviews',
      'job_applications', 'job_categories', 'job_postings', 'job_stages', 'jobs', 'joining_letters', 'leave_applications',
      'leave_approvals', 'leave_balances', 'leave_holidays', 'leave_notifications', 'leave_policies', 'leave_types',
      'leave_workflows', 'loan_options', 'meeting_attendees', 'meeting_rooms', 'meeting_types', 'meetings', 'messages',
      'messenger', 'migrations', 'noc_letters', 'notification_templates', 'notifications', 'offer_letters', 'payment_types',
      'payroll_components', 'payroll_deductions', 'payroll_payslips', 'payroll_runs', 'payroll_salaries', 'payslip_types',
      'payslips', 'performance_cycles', 'performance_goals', 'performance_ratings', 'performance_reviews', 'performance_types',
      'permissions', 'project_assignments', 'project_tasks', 'projects', 'promotions', 'reports', 'resignations',
      'review_questions', 'role_permissions', 'roles', 'salary_components', 'seo_settings', 'settings', 'shift_assignments',
      'shifts', 'system_settings', 'task_comments', 'tasks', 'termination_types', 'terminations', 'timesheets',
      'training_enrollments', 'training_participants', 'training_programs', 'training_sessions', 'training_types',
      'transfers', 'user_permissions', 'user_roles', 'users', 'warnings', 'webhook_logs', 'webhooks'
    ];

    // Find missing tables
    const missingTables = expectedTables.filter(table => !currentTables.includes(table));

    console.log(`📊 Current tables: ${currentTables.length}`);
    console.log(`📊 Expected tables: ${expectedTables.length}`);
    console.log(`📊 Missing tables: ${missingTables.length}`);

    if (missingTables.length === 0) {
      console.log('✅ All tables are present!');
      return;
    }

    console.log('\n❌ Missing tables:');
    missingTables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });

    // Create individual migration files for missing tables
    const migrationsDir = path.join(__dirname, 'migrations', 'migrations');
    
    // Get the next migration number
    const existingMigrations = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => parseInt(file.split('_')[0]))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a);
    
    let nextMigrationNumber = existingMigrations.length > 0 ? existingMigrations[0] + 1 : 15;

    console.log(`\n🔧 Creating migration files starting from ${nextMigrationNumber}...`);

    // Create migration files for missing tables
    for (const tableName of missingTables) {
      const migrationNumber = nextMigrationNumber.toString().padStart(3, '0');
      const fileName = `${migrationNumber}_create_${tableName}_table.js`;
      const filePath = path.join(migrationsDir, fileName);

      const migrationContent = generateMigrationContent(tableName);

      fs.writeFileSync(filePath, migrationContent);
      console.log(`  ✅ Created: ${fileName}`);
      
      nextMigrationNumber++;
    }

    console.log(`\n🎉 Created ${missingTables.length} migration files!`);
    console.log('📋 Next steps:');
    console.log('  1. Run: node migration-manager.js up');
    console.log('  2. Verify all tables are created');

  } catch (error) {
    console.error('❌ Error creating migrations:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function generateMigrationContent(tableName) {
  const tableDefinitions = {
    'announcements': `
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('general', 'urgent', 'maintenance', 'holiday') DEFAULT 'general',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'api_keys': `
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        key_value VARCHAR(255) NOT NULL UNIQUE,
        permissions JSON,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'attendance': `
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        total_hours DECIMAL(4,2) DEFAULT 0,
        status ENUM('present', 'absent', 'late', 'half-day') DEFAULT 'absent',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_date (employee_id, date)
      )`,
    
    'attendance_exceptions': `
      CREATE TABLE IF NOT EXISTS attendance_exceptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        exception_type ENUM('late_arrival', 'early_departure', 'missed_check_in', 'missed_check_out', 'overtime') NOT NULL,
        reason TEXT,
        approved_by INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'attendance_regularization_audit_logs': `
      CREATE TABLE IF NOT EXISTS attendance_regularization_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        regularization_id INT NOT NULL,
        action ENUM('created', 'approved', 'rejected', 'modified') NOT NULL,
        performed_by INT NOT NULL,
        old_values JSON,
        new_values JSON,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'attendance_regularization_requests': `
      CREATE TABLE IF NOT EXISTS attendance_regularization_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        request_type ENUM('check_in', 'check_out', 'full_day') NOT NULL,
        requested_time TIME,
        reason TEXT NOT NULL,
        supporting_documents JSON,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'attendance_summaries': `
      CREATE TABLE IF NOT EXISTS attendance_summaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        month YEAR NOT NULL,
        year YEAR NOT NULL,
        total_days INT DEFAULT 0,
        present_days INT DEFAULT 0,
        absent_days INT DEFAULT 0,
        late_days INT DEFAULT 0,
        half_days INT DEFAULT 0,
        total_hours DECIMAL(6,2) DEFAULT 0,
        overtime_hours DECIMAL(6,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_month_year (employee_id, month, year)
      )`,
    
    'awards': `
      CREATE TABLE IF NOT EXISTS awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        award_type_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        award_date DATE NOT NULL,
        amount DECIMAL(10,2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (award_type_id) REFERENCES award_types(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'cache_settings': `
      CREATE TABLE IF NOT EXISTS cache_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cache_key VARCHAR(255) NOT NULL UNIQUE,
        cache_value LONGTEXT,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'chatgpt_conversations': `
      CREATE TABLE IF NOT EXISTS chatgpt_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        response TEXT,
        tokens_used INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'chatgpt_settings': `
      CREATE TABLE IF NOT EXISTS chatgpt_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'company_policies': `
      CREATE TABLE IF NOT EXISTS company_policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        category VARCHAR(100),
        version VARCHAR(20) DEFAULT '1.0',
        effective_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'complaints': `
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('harassment', 'discrimination', 'workplace_issue', 'other') NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
        assigned_to INT,
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'contracts': `
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        contract_type_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        salary DECIMAL(10,2),
        status ENUM('active', 'expired', 'terminated') DEFAULT 'active',
        document_path VARCHAR(500),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (contract_type_id) REFERENCES contract_types(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'cookie_consent_settings': `
      CREATE TABLE IF NOT EXISTS cookie_consent_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        consent_type VARCHAR(100) NOT NULL,
        granted BOOLEAN DEFAULT FALSE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'employee_documents': `
      CREATE TABLE IF NOT EXISTS employee_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        document_type_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT,
        mime_type VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by INT,
        verified_at TIMESTAMP NULL,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'events': `
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        location VARCHAR(255),
        event_type ENUM('meeting', 'training', 'holiday', 'celebration', 'other') DEFAULT 'other',
        is_company_wide BOOLEAN DEFAULT FALSE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'expense_categories': `
      CREATE TABLE IF NOT EXISTS expense_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'experience_certificates': `
      CREATE TABLE IF NOT EXISTS experience_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        description TEXT,
        document_path VARCHAR(500),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`,
    
    'file_uploads': `
      CREATE TABLE IF NOT EXISTS file_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by INT NOT NULL,
        module VARCHAR(100),
        record_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'goal_tracking': `
      CREATE TABLE IF NOT EXISTS goal_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        employee_id INT NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        notes TEXT,
        tracked_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`,
    
    'google_calendar_integrations': `
      CREATE TABLE IF NOT EXISTS google_calendar_integrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        calendar_id VARCHAR(255) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'holidays': `
      CREATE TABLE IF NOT EXISTS holidays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        type ENUM('national', 'regional', 'company', 'religious') DEFAULT 'national',
        is_recurring BOOLEAN DEFAULT FALSE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'job_applications': `
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        resume_path VARCHAR(500),
        cover_letter TEXT,
        status ENUM('applied', 'screening', 'interview', 'offered', 'hired', 'rejected') DEFAULT 'applied',
        applied_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )`,
    
    'job_postings': `
      CREATE TABLE IF NOT EXISTS job_postings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        location VARCHAR(255),
        salary_range VARCHAR(100),
        employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
        is_active BOOLEAN DEFAULT TRUE,
        posted_date DATE NOT NULL,
        closing_date DATE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'joining_letters': `
      CREATE TABLE IF NOT EXISTS joining_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        letter_number VARCHAR(100) NOT NULL,
        joining_date DATE NOT NULL,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        salary DECIMAL(10,2),
        document_path VARCHAR(500),
        status ENUM('draft', 'sent', 'acknowledged') DEFAULT 'draft',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'meeting_rooms': `
      CREATE TABLE IF NOT EXISTS meeting_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        capacity INT DEFAULT 10,
        amenities JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'meeting_types': `
      CREATE TABLE IF NOT EXISTS meeting_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        duration INT DEFAULT 60,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'messenger': `
      CREATE TABLE IF NOT EXISTS messenger (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        message_type ENUM('text', 'file', 'image') DEFAULT 'text',
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'noc_letters': `
      CREATE TABLE IF NOT EXISTS noc_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        letter_number VARCHAR(100) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        description TEXT,
        document_path VARCHAR(500),
        status ENUM('draft', 'approved', 'issued') DEFAULT 'draft',
        issued_date DATE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'notification_templates': `
      CREATE TABLE IF NOT EXISTS notification_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        type ENUM('email', 'sms', 'push') DEFAULT 'email',
        variables JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'offer_letters': `
      CREATE TABLE IF NOT EXISTS offer_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        salary DECIMAL(10,2),
        start_date DATE,
        document_path VARCHAR(500),
        status ENUM('draft', 'sent', 'accepted', 'declined') DEFAULT 'draft',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'performance_cycles': `
      CREATE TABLE IF NOT EXISTS performance_cycles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('planning', 'active', 'completed', 'closed') DEFAULT 'planning',
        description TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'project_assignments': `
      CREATE TABLE IF NOT EXISTS project_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        employee_id INT NOT NULL,
        role VARCHAR(255),
        start_date DATE,
        end_date DATE,
        allocation_percentage DECIMAL(5,2) DEFAULT 100,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`,
    
    'project_tasks': `
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INT,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('todo', 'in_progress', 'review', 'completed') DEFAULT 'todo',
        start_date DATE,
        due_date DATE,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'projects': `
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        budget DECIMAL(12,2),
        manager_id INT,
        client_name VARCHAR(255),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'promotions': `
      CREATE TABLE IF NOT EXISTS promotions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        from_position VARCHAR(255),
        to_position VARCHAR(255) NOT NULL,
        from_department VARCHAR(255),
        to_department VARCHAR(255),
        from_salary DECIMAL(10,2),
        to_salary DECIMAL(10,2),
        effective_date DATE NOT NULL,
        reason TEXT,
        approved_by INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'reports': `
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        report_type VARCHAR(100) NOT NULL,
        parameters JSON,
        query TEXT,
        is_scheduled BOOLEAN DEFAULT FALSE,
        schedule_frequency VARCHAR(50),
        last_generated TIMESTAMP NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'resignations': `
      CREATE TABLE IF NOT EXISTS resignations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        resignation_date DATE NOT NULL,
        last_working_date DATE NOT NULL,
        reason TEXT NOT NULL,
        notice_period_days INT DEFAULT 30,
        status ENUM('submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        exit_interview_conducted BOOLEAN DEFAULT FALSE,
        handover_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'review_questions': `
      CREATE TABLE IF NOT EXISTS review_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_text TEXT NOT NULL,
        question_type ENUM('text', 'rating', 'multiple_choice', 'yes_no') DEFAULT 'text',
        options JSON,
        is_required BOOLEAN DEFAULT TRUE,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'seo_settings': `
      CREATE TABLE IF NOT EXISTS seo_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        keywords TEXT,
        meta_tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    
    'terminations': `
      CREATE TABLE IF NOT EXISTS terminations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        termination_type_id INT NOT NULL,
        termination_date DATE NOT NULL,
        reason TEXT NOT NULL,
        notice_period_days INT DEFAULT 0,
        severance_amount DECIMAL(10,2),
        status ENUM('pending', 'approved', 'completed') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        exit_interview_conducted BOOLEAN DEFAULT FALSE,
        handover_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (termination_type_id) REFERENCES termination_types(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'timesheets': `
      CREATE TABLE IF NOT EXISTS timesheets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        project_id INT,
        task_id INT,
        date DATE NOT NULL,
        hours_worked DECIMAL(4,2) NOT NULL,
        description TEXT,
        status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'training_participants': `
      CREATE TABLE IF NOT EXISTS training_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        training_id INT NOT NULL,
        employee_id INT NOT NULL,
        enrollment_date DATE NOT NULL,
        completion_date DATE,
        status ENUM('enrolled', 'in_progress', 'completed', 'dropped') DEFAULT 'enrolled',
        score DECIMAL(5,2),
        feedback TEXT,
        certificate_issued BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (training_id) REFERENCES training_programs(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_training_employee (training_id, employee_id)
      )`,
    
    'transfers': `
      CREATE TABLE IF NOT EXISTS transfers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        from_department VARCHAR(255),
        to_department VARCHAR(255) NOT NULL,
        from_branch VARCHAR(255),
        to_branch VARCHAR(255),
        from_position VARCHAR(255),
        to_position VARCHAR(255),
        effective_date DATE NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`,
    
    'warnings': `
      CREATE TABLE IF NOT EXISTS warnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        warning_type ENUM('verbal', 'written', 'final') NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        warning_date DATE NOT NULL,
        status ENUM('active', 'resolved', 'expired') DEFAULT 'active',
        issued_by INT NOT NULL,
        acknowledged_by_employee BOOLEAN DEFAULT FALSE,
        acknowledged_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
    
    'webhook_logs': `
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        webhook_id INT NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        payload JSON,
        response_status INT,
        response_body TEXT,
        execution_time INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
      )`,
    
    'webhooks': `
      CREATE TABLE IF NOT EXISTS webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        events JSON NOT NULL,
        secret_key VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`
  };

  const tableDefinition = tableDefinitions[tableName];
  
  if (!tableDefinition) {
    // Generic table definition for tables not specifically defined
    return `export const up = async (connection) => {
  try {
    console.log('Running migration: Create ${tableName} table...');
    
    await connection.execute(\`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    \`);
    
    console.log('✅ ${tableName} table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop ${tableName} table...');
    
    await connection.execute(\`DROP TABLE IF EXISTS ${tableName}\`);
    
    console.log('✅ ${tableName} table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};`;
  }

  return `export const up = async (connection) => {
  try {
    console.log('Running migration: Create ${tableName} table...');
    
    await connection.execute(\`${tableDefinition}\`);
    
    console.log('✅ ${tableName} table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop ${tableName} table...');
    
    await connection.execute(\`DROP TABLE IF EXISTS ${tableName}\`);
    
    console.log('✅ ${tableName} table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};`;
}

createMissingTableMigrations();
