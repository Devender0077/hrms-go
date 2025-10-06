/**
 * Migration: 003_create_attendance_system
 * Creates the attendance and timekeeping system
 */

async function up(connection) {
  console.log('📝 Creating attendance system...');

  // Attendance Policies Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS attendance_policies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL DEFAULT 1,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      policy_type ENUM('general', 'department', 'employee') NULL,
      department_id INT NULL,
      employee_id INT NULL,
      late_arrival_penalty DECIMAL(5,2) NULL,
      early_departure_penalty DECIMAL(5,2) NULL,
      absent_penalty DECIMAL(5,2) NULL,
      overtime_rate DECIMAL(5,2) NULL,
      max_overtime_hours DECIMAL(4,2) NULL,
      require_approval_for_overtime BOOLEAN NULL,
      allow_remote_work BOOLEAN NULL,
      require_location_tracking BOOLEAN NULL,
      auto_approve_overtime BOOLEAN NULL,
      is_active BOOLEAN NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Attendance policies table created');

  // Attendance Records Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      check_in TIME NULL,
      check_out TIME NULL,
      work_hours DECIMAL(5,2) NULL,
      overtime_hours DECIMAL(5,2) NULL,
      status ENUM('present', 'absent', 'late', 'partial') NULL,
      check_in_location VARCHAR(255) NULL,
      check_out_location VARCHAR(255) NULL,
      check_in_ip VARCHAR(45) NULL,
      check_out_ip VARCHAR(45) NULL,
      check_in_device TEXT NULL,
      check_out_device TEXT NULL,
      company_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_date (employee_id, date)
    )
  `);
  console.log('✅ Attendance records table created');

  // Attendance Regulations Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS attendance_regulations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      regulation_type ENUM('general', 'department', 'employee') NULL,
      department_id INT NULL,
      employee_id INT NULL,
      working_hours_per_day DECIMAL(4,2) NULL,
      working_days_per_week INT NULL,
      break_duration_minutes INT NULL,
      grace_period_minutes INT NULL,
      late_penalty_amount DECIMAL(5,2) NULL,
      absent_penalty_amount DECIMAL(5,2) NULL,
      overtime_rate_multiplier DECIMAL(3,2) NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);
  console.log('✅ Attendance regulations table created');

  // Shifts Table (Fixed with company_id)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL DEFAULT 1,
      name VARCHAR(100) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      break_duration_minutes INT DEFAULT 0,
      working_hours DECIMAL(4,2) NOT NULL,
      is_night_shift BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Shifts table created');

  // Shift Assignments Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS shift_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      shift_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Shift assignments table created');

  // Insert default shifts
  const defaultShifts = [
    { name: 'Day Shift', start_time: '09:00:00', end_time: '17:00:00', working_hours: 8.0 },
    { name: 'Night Shift', start_time: '22:00:00', end_time: '06:00:00', working_hours: 8.0, is_night_shift: true },
    { name: 'Evening Shift', start_time: '14:00:00', end_time: '22:00:00', working_hours: 8.0 }
  ];

  for (const shift of defaultShifts) {
    try {
      await connection.query(`
        INSERT IGNORE INTO shifts (company_id, name, start_time, end_time, working_hours, is_night_shift)
        VALUES (1, ?, ?, ?, ?, ?)
      `, [shift.name, shift.start_time, shift.end_time, shift.working_hours, shift.is_night_shift || false]);
    } catch (error) {
      // Shift already exists
    }
  }
  console.log('✅ Default shifts inserted');
}

async function down(connection) {
  console.log('🔄 Dropping attendance system...');
  
  await connection.query('DROP TABLE IF EXISTS shift_assignments');
  await connection.query('DROP TABLE IF EXISTS shifts');
  await connection.query('DROP TABLE IF EXISTS attendance_regulations');
  await connection.query('DROP TABLE IF EXISTS attendance_records');
  await connection.query('DROP TABLE IF EXISTS attendance_policies');
  
  console.log('✅ Attendance system dropped');
}

module.exports = { up, down };
