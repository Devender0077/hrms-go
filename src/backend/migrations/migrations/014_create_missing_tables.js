/**
 * Migration: 014_create_missing_tables
 * Create all missing tables for complete HRMS functionality
 */

async function up(connection) {
  console.log('🔄 Running migration: Create missing tables...');
  
  try {
    // Fix attendance_records table structure
    console.log('📝 Fixing attendance_records table structure...');
    await connection.execute(`
      ALTER TABLE attendance_records 
      CHANGE COLUMN work_hours total_hours DECIMAL(4,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL
    `);
    console.log('✅ Attendance records table structure fixed');

    // Create payroll_components table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payroll_components (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('allowance', 'deduction', 'bonus', 'overtime') NOT NULL,
        is_taxable BOOLEAN DEFAULT TRUE,
        is_percentage BOOLEAN DEFAULT FALSE,
        default_amount DECIMAL(10,2) DEFAULT 0,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Payroll components table created');

    // Create payroll_deductions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payroll_deductions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        component_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        percentage DECIMAL(5,2) DEFAULT NULL,
        effective_date DATE NOT NULL,
        end_date DATE DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (component_id) REFERENCES payroll_components(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Payroll deductions table created');

    // Create interview_schedules table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS interview_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        interview_id INT NOT NULL,
        scheduled_date TIMESTAMP NOT NULL,
        duration_minutes INT DEFAULT 60,
        location VARCHAR(255) DEFAULT NULL,
        meeting_link VARCHAR(500) DEFAULT NULL,
        status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Interview schedules table created');

    // Create performance_goals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS performance_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        review_id INT DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_value DECIMAL(10,2) DEFAULT NULL,
        actual_value DECIMAL(10,2) DEFAULT NULL,
        unit VARCHAR(50) DEFAULT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('not_started', 'in_progress', 'completed', 'cancelled') DEFAULT 'not_started',
        weight DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (review_id) REFERENCES performance_reviews(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Performance goals table created');

    // Create performance_ratings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS performance_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        criteria VARCHAR(255) NOT NULL,
        rating DECIMAL(3,2) NOT NULL,
        max_rating DECIMAL(3,2) DEFAULT 5.00,
        comments TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES performance_reviews(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Performance ratings table created');

    // Create training_sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS training_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        program_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        session_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location VARCHAR(255) DEFAULT NULL,
        trainer VARCHAR(255) DEFAULT NULL,
        max_participants INT DEFAULT NULL,
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Training sessions table created');

    // Create asset_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS asset_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        depreciation_rate DECIMAL(5,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Asset categories table created');

    // Create meeting_attendees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meeting_attendees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meeting_id INT NOT NULL,
        employee_id INT NOT NULL,
        status ENUM('invited', 'accepted', 'declined', 'tentative') DEFAULT 'invited',
        response_date TIMESTAMP NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_meeting_employee (meeting_id, employee_id)
      )
    `);
    console.log('✅ Meeting attendees table created');

    // Create document_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS document_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id INT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES document_categories(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Document categories table created');

    // Create document_versions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS document_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_id INT NOT NULL,
        version_number VARCHAR(20) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT DEFAULT NULL,
        mime_type VARCHAR(100) DEFAULT NULL,
        uploaded_by INT NOT NULL,
        change_notes TEXT DEFAULT NULL,
        is_current BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Document versions table created');

    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        recipient_id INT DEFAULT NULL,
        subject VARCHAR(255) DEFAULT NULL,
        body TEXT NOT NULL,
        message_type ENUM('direct', 'group', 'announcement', 'system') DEFAULT 'direct',
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        parent_message_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Messages table created');

    // Create hr_setup_steps table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hr_setup_steps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        step_name VARCHAR(255) NOT NULL,
        step_description TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        completed_by INT DEFAULT NULL,
        step_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ HR setup steps table created');

    // Create employee_handbook table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_handbook (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        version VARCHAR(20) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT TRUE,
        effective_date DATE NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee handbook table created');

    // Create employee_benefits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_benefits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        benefit_type VARCHAR(255) NOT NULL,
        benefit_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) DEFAULT NULL,
        start_date DATE NOT NULL,
        end_date DATE DEFAULT NULL,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee benefits table created');

    // Create employee_emergency_contacts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_emergency_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee emergency contacts table created');

    // Create employee_skills table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        skill_name VARCHAR(255) NOT NULL,
        skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
        years_of_experience INT DEFAULT 0,
        certification VARCHAR(255) DEFAULT NULL,
        verified_by INT DEFAULT NULL,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Employee skills table created');

    // Create employee_certifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_certifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        certification_name VARCHAR(255) NOT NULL,
        issuing_organization VARCHAR(255) NOT NULL,
        issue_date DATE NOT NULL,
        expiry_date DATE DEFAULT NULL,
        credential_id VARCHAR(255) DEFAULT NULL,
        credential_url VARCHAR(500) DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by INT DEFAULT NULL,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Employee certifications table created');

    // Create employee_education table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        institution_name VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        field_of_study VARCHAR(255) DEFAULT NULL,
        start_date DATE NOT NULL,
        end_date DATE DEFAULT NULL,
        gpa DECIMAL(3,2) DEFAULT NULL,
        is_graduated BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee education table created');

    // Create employee_experience table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE DEFAULT NULL,
        description TEXT DEFAULT NULL,
        is_current BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee experience table created');

    // Create employee_family table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_family (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE DEFAULT NULL,
        occupation VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        is_dependent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee family table created');

    // Create employee_medical table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_medical (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        blood_type VARCHAR(10) DEFAULT NULL,
        allergies TEXT DEFAULT NULL,
        medical_conditions TEXT DEFAULT NULL,
        emergency_contact_name VARCHAR(255) DEFAULT NULL,
        emergency_contact_phone VARCHAR(20) DEFAULT NULL,
        emergency_contact_relationship VARCHAR(100) DEFAULT NULL,
        insurance_provider VARCHAR(255) DEFAULT NULL,
        insurance_number VARCHAR(100) DEFAULT NULL,
        last_medical_checkup DATE DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee medical table created');

    // Create employee_notes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        note_type ENUM('general', 'performance', 'disciplinary', 'personal', 'medical') DEFAULT 'general',
        title VARCHAR(255) DEFAULT NULL,
        content TEXT NOT NULL,
        is_confidential BOOLEAN DEFAULT FALSE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee notes table created');

    // Create employee_photos table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        photo_type ENUM('profile', 'id_card', 'official', 'casual') DEFAULT 'profile',
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INT DEFAULT NULL,
        mime_type VARCHAR(100) DEFAULT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee photos table created');

    // Create employee_references table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_references (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        reference_name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        company VARCHAR(255) DEFAULT NULL,
        position VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Employee references table created');

    // Create employee_salary_history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_salary_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        old_salary DECIMAL(10,2) NOT NULL,
        new_salary DECIMAL(10,2) NOT NULL,
        effective_date DATE NOT NULL,
        reason VARCHAR(255) DEFAULT NULL,
        approved_by INT DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Employee salary history table created');

    // Create employee_timeline table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_timeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        event_type ENUM('hired', 'promoted', 'transferred', 'salary_change', 'leave', 'disciplinary', 'award', 'training', 'other') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        event_date DATE NOT NULL,
        created_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Employee timeline table created');

    console.log('🎉 Migration completed: All missing tables created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function down(connection) {
  console.log('🔄 Rolling back migration: Create missing tables...');
  
  try {
    // Drop tables in reverse order
    const tablesToDrop = [
      'employee_timeline',
      'employee_salary_history',
      'employee_references',
      'employee_photos',
      'employee_notes',
      'employee_medical',
      'employee_family',
      'employee_experience',
      'employee_education',
      'employee_certifications',
      'employee_skills',
      'employee_emergency_contacts',
      'employee_benefits',
      'employee_handbook',
      'hr_setup_steps',
      'messages',
      'document_versions',
      'document_categories',
      'meeting_attendees',
      'asset_categories',
      'training_sessions',
      'performance_ratings',
      'performance_goals',
      'interview_schedules',
      'payroll_deductions',
      'payroll_components'
    ];
    
    for (const table of tablesToDrop) {
      await connection.execute(`DROP TABLE IF EXISTS ${table}`);
    }
    
    console.log('✅ Rollback completed: Missing tables dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

export { up, down };
