/**
 * Migration: 004_create_leave_system
 * Creates the leave management system
 */

async function up(connection) {
  console.log('📝 Creating leave system...');

  // Leave Types Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50),
      description TEXT,
      days_per_year INT,
      requires_approval BOOLEAN DEFAULT TRUE,
      is_paid BOOLEAN DEFAULT TRUE,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Leave types table created');

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
  console.log('✅ Leave applications table created');

  // Leave Balances Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_balances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      leave_type_id INT NOT NULL,
      year INT NOT NULL,
      total_days INT NOT NULL,
      used_days INT DEFAULT 0,
      remaining_days INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year)
    )
  `);
  console.log('✅ Leave balances table created');

  // Leave Policies Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_policies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      max_consecutive_days INT NULL,
      advance_notice_days INT NULL,
      requires_medical_certificate BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Leave policies table created');

  // Leave Holidays Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_holidays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      type ENUM('national', 'religious', 'company', 'optional') DEFAULT 'national',
      is_recurring BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Leave holidays table created');

  // Leave Approvals Table (For Multi-level Approval)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_approvals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      leave_application_id INT NOT NULL,
      approver_id INT NOT NULL,
      approval_level INT NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      comments TEXT,
      approved_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (leave_application_id) REFERENCES leave_applications(id) ON DELETE CASCADE,
      FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Leave approvals table created');

  // Leave Workflows Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_workflows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      leave_type_id INT NULL,
      department_id INT NULL,
      approval_levels JSON NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Leave workflows table created');

  // Leave Notifications Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      leave_application_id INT NOT NULL,
      user_id INT NOT NULL,
      notification_type ENUM('application_submitted', 'application_approved', 'application_rejected', 'application_cancelled', 'reminder') NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (leave_application_id) REFERENCES leave_applications(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Leave notifications table created');

  // Insert default leave types
  const defaultLeaveTypes = [
    { name: 'Annual Leave', code: 'AL', description: 'Annual vacation leave', days_per_year: 21 },
    { name: 'Sick Leave', code: 'SL', description: 'Medical leave for illness', days_per_year: 12 },
    { name: 'Personal Leave', code: 'PL', description: 'Personal time off', days_per_year: 5 },
    { name: 'Maternity Leave', code: 'ML', description: 'Maternity leave for new mothers', days_per_year: 90 },
    { name: 'Paternity Leave', code: 'PTL', description: 'Paternity leave for new fathers', days_per_year: 7 }
  ];

  for (const leaveType of defaultLeaveTypes) {
    try {
      await connection.query(`
        INSERT IGNORE INTO leave_types (company_id, name, code, description, days_per_year)
        VALUES (1, ?, ?, ?, ?)
      `, [leaveType.name, leaveType.code, leaveType.description, leaveType.days_per_year]);
    } catch (error) {
      // Leave type already exists
    }
  }
  console.log('✅ Default leave types inserted');

  // Insert default holidays
  const defaultHolidays = [
    { name: 'New Year', date: '2024-01-01', type: 'national' },
    { name: 'Independence Day', date: '2024-08-15', type: 'national' },
    { name: 'Gandhi Jayanti', date: '2024-10-02', type: 'national' },
    { name: 'Christmas', date: '2024-12-25', type: 'national' },
    { name: 'Company Foundation Day', date: '2024-06-15', type: 'company' }
  ];

  for (const holiday of defaultHolidays) {
    try {
      await connection.query(`
        INSERT IGNORE INTO leave_holidays (company_id, name, date, type)
        VALUES (1, ?, ?, ?)
      `, [holiday.name, holiday.date, holiday.type]);
    } catch (error) {
      // Holiday already exists
    }
  }
  console.log('✅ Default holidays inserted');
}

async function down(connection) {
  console.log('🔄 Dropping leave system...');
  
  await connection.query('DROP TABLE IF EXISTS leave_notifications');
  await connection.query('DROP TABLE IF EXISTS leave_workflows');
  await connection.query('DROP TABLE IF EXISTS leave_approvals');
  await connection.query('DROP TABLE IF EXISTS leave_holidays');
  await connection.query('DROP TABLE IF EXISTS leave_policies');
  await connection.query('DROP TABLE IF EXISTS leave_balances');
  await connection.query('DROP TABLE IF EXISTS leave_applications');
  await connection.query('DROP TABLE IF EXISTS leave_types');
  
  console.log('✅ Leave system dropped');
}

module.exports = { up, down };
