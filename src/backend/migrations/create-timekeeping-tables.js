const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_hero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createTimekeepingTables() {
  try {
    console.log('🚀 Creating timekeeping tables...');

    // 1. Create shifts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        break_duration INT DEFAULT 0 COMMENT 'Break duration in minutes',
        working_days JSON COMMENT 'Array of working days (0=Sunday, 1=Monday, etc.)',
        is_flexible BOOLEAN DEFAULT FALSE,
        grace_period INT DEFAULT 15 COMMENT 'Grace period in minutes',
        late_threshold INT DEFAULT 30 COMMENT 'Late threshold in minutes',
        overtime_rate DECIMAL(5,2) DEFAULT 1.5,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created shifts table');

    // 2. Create shift_assignments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shift_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        shift_id INT NOT NULL,
        effective_date DATE NOT NULL,
        end_date DATE NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_active_assignment (employee_id, effective_date, is_active)
      )
    `);
    console.log('✅ Created shift_assignments table');

    // 3. Create attendance_policies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        policy_type ENUM('general', 'department', 'employee') DEFAULT 'general',
        department_id INT NULL,
        employee_id INT NULL,
        late_arrival_penalty DECIMAL(5,2) DEFAULT 0,
        early_departure_penalty DECIMAL(5,2) DEFAULT 0,
        absent_penalty DECIMAL(5,2) DEFAULT 0,
        overtime_rate DECIMAL(5,2) DEFAULT 1.5,
        max_overtime_hours DECIMAL(4,2) DEFAULT 4.0,
        require_approval_for_overtime BOOLEAN DEFAULT TRUE,
        allow_remote_work BOOLEAN DEFAULT FALSE,
        require_location_tracking BOOLEAN DEFAULT TRUE,
        auto_approve_overtime BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created attendance_policies table');

    // 4. Create attendance_regulations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_regulations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        regulation_type ENUM('policy', 'rule', 'guideline', 'procedure') DEFAULT 'policy',
        category ENUM('attendance', 'overtime', 'leave', 'remote_work', 'breaks', 'holidays') DEFAULT 'attendance',
        effective_date DATE NOT NULL,
        expiry_date DATE NULL,
        is_mandatory BOOLEAN DEFAULT TRUE,
        penalty_description TEXT,
        compliance_requirements TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created attendance_regulations table');

    // 5. Create attendance_exceptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_exceptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        exception_type ENUM('late_excuse', 'early_leave', 'absent_excuse', 'overtime_approval', 'remote_work') NOT NULL,
        reason TEXT NOT NULL,
        approved_by INT,
        approved_at TIMESTAMP NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created attendance_exceptions table');

    // 6. Create attendance_summaries table for reporting
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_summaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        month_year VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
        total_working_days INT DEFAULT 0,
        total_present_days INT DEFAULT 0,
        total_absent_days INT DEFAULT 0,
        total_late_days INT DEFAULT 0,
        total_leave_days INT DEFAULT 0,
        total_work_hours DECIMAL(6,2) DEFAULT 0,
        total_overtime_hours DECIMAL(6,2) DEFAULT 0,
        total_break_hours DECIMAL(6,2) DEFAULT 0,
        attendance_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_month (employee_id, month_year)
      )
    `);
    console.log('✅ Created attendance_summaries table');

    // Insert default shifts
    await pool.query(`
      INSERT IGNORE INTO shifts (name, description, start_time, end_time, break_duration, working_days, is_flexible, grace_period, late_threshold, overtime_rate) VALUES
      ('Day Shift', 'Regular day shift (9 AM - 6 PM)', '09:00:00', '18:00:00', 60, '[1,2,3,4,5]', FALSE, 15, 30, 1.5),
      ('Night Shift', 'Night shift (10 PM - 6 AM)', '22:00:00', '06:00:00', 30, '[1,2,3,4,5]', FALSE, 15, 30, 1.5),
      ('Flexible Hours', 'Flexible working hours', '08:00:00', '17:00:00', 60, '[1,2,3,4,5]', TRUE, 30, 60, 1.5),
      ('Part Time', 'Part time shift (4 hours)', '09:00:00', '13:00:00', 15, '[1,2,3,4,5]', FALSE, 10, 15, 1.5)
    `);
    console.log('✅ Inserted default shifts');

    // Insert default attendance policies
    await pool.query(`
      INSERT IGNORE INTO attendance_policies (name, description, policy_type, late_arrival_penalty, early_departure_penalty, absent_penalty, overtime_rate, max_overtime_hours, require_approval_for_overtime, allow_remote_work, require_location_tracking) VALUES
      ('General Attendance Policy', 'Default attendance policy for all employees', 'general', 0, 0, 0, 1.5, 4.0, TRUE, FALSE, TRUE),
      ('Remote Work Policy', 'Policy for remote work arrangements', 'general', 0, 0, 0, 1.5, 2.0, TRUE, TRUE, FALSE),
      ('Overtime Policy', 'Policy for overtime work and compensation', 'general', 0, 0, 0, 2.0, 8.0, TRUE, FALSE, TRUE)
    `);
    console.log('✅ Inserted default attendance policies');

    // Insert default regulations
    await pool.query(`
      INSERT IGNORE INTO attendance_regulations (title, description, regulation_type, category, effective_date, is_mandatory, penalty_description, compliance_requirements) VALUES
      ('Punctuality Requirement', 'All employees must arrive on time for their scheduled shifts', 'rule', 'attendance', CURDATE(), TRUE, 'Late arrivals may result in disciplinary action', 'Employees must clock in within the grace period'),
      ('Overtime Approval', 'Overtime work must be pre-approved by supervisor', 'procedure', 'overtime', CURDATE(), TRUE, 'Unauthorized overtime will not be compensated', 'Submit overtime request at least 24 hours in advance'),
      ('Break Time Regulations', 'Employees are entitled to breaks as per labor law', 'guideline', 'breaks', CURDATE(), TRUE, 'Excessive break time may affect performance review', 'Take breaks as scheduled and return on time'),
      ('Remote Work Guidelines', 'Guidelines for remote work arrangements', 'guideline', 'remote_work', CURDATE(), FALSE, 'Non-compliance may result in revocation of remote work privileges', 'Maintain regular communication and meet productivity standards')
    `);
    console.log('✅ Inserted default regulations');

    console.log('🎉 All timekeeping tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating timekeeping tables:', error);
  } finally {
    await pool.end();
  }
}

createTimekeepingTables();
