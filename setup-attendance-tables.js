const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAttendanceTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hrmgo_hero'
    });

    console.log('🔧 Setting up attendance-related tables...\n');

    // 1. Create weekend_configs table
    console.log('📅 Creating weekend_configs table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS weekend_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday',
        is_active BOOLEAN DEFAULT true,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_day_of_week (day_of_week)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Create attendance table
    console.log('⏰ Creating attendance table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in_time TIME,
        check_out_time TIME,
        total_hours DECIMAL(5,2) DEFAULT 0,
        status ENUM('Present', 'Absent', 'Half Day', 'Late', 'Early Leave', 'On Leave', 'Holiday') DEFAULT 'Absent',
        overtime_hours DECIMAL(5,2) DEFAULT 0,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_employee_date (employee_id, date),
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create attendance_calculation_rules table
    console.log('📊 Creating attendance_calculation_rules table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance_calculation_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('full_day', 'half_day', 'present', 'absent', 'late', 'early_leave') NOT NULL,
        min_hours DECIMAL(5,2) DEFAULT 8.00,
        max_hours DECIMAL(5,2) DEFAULT 8.00,
        grace_period_minutes INT DEFAULT 15,
        overtime_threshold_hours DECIMAL(5,2) DEFAULT 8.00,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create leave_holidays table
    console.log('🎉 Creating leave_holidays table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_holidays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        type ENUM('national', 'religious', 'company', 'other') DEFAULT 'national',
        is_recurring BOOLEAN DEFAULT false,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_company_date (company_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('\n📝 Inserting default data...');

    // Insert default weekend configurations
    await connection.execute(`
      INSERT IGNORE INTO weekend_configs 
      (name, day_of_week, is_active, description) 
      VALUES 
      ('Saturday', 6, true, 'Saturday weekend'),
      ('Sunday', 0, true, 'Sunday weekend');
    `);

    // Insert default attendance calculation rules
    await connection.execute(`
      INSERT IGNORE INTO attendance_calculation_rules 
      (name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active) 
      VALUES 
      ('Full Day Present', 'full_day', 8.00, 8.00, 15, 8.00, 'Standard full day attendance rule', true),
      ('Half Day Present', 'half_day', 4.00, 4.00, 15, 4.00, 'Half day attendance rule', true),
      ('Late Arrival', 'late', 6.00, 8.00, 15, 8.00, 'Late arrival but still present', true),
      ('Early Leave', 'early_leave', 4.00, 6.00, 15, 6.00, 'Early departure from work', true),
      ('Absent', 'absent', 0.00, 0.00, 0, 0.00, 'No attendance recorded', true);
    `);

    // Insert sample holidays
    await connection.execute(`
      INSERT IGNORE INTO leave_holidays 
      (company_id, name, date, type, is_recurring, description) 
      VALUES 
      (1, 'New Year Day', '2025-01-01', 'national', false, 'New Year celebration'),
      (1, 'Independence Day', '2025-08-15', 'national', false, 'Independence Day'),
      (1, 'Gandhi Jayanti', '2025-10-02', 'national', false, 'Birthday of Mahatma Gandhi'),
      (1, 'Diwali', '2025-10-20', 'religious', false, 'Festival of Lights'),
      (1, 'Christmas', '2025-12-25', 'religious', false, 'Christmas Day');
    `);

    console.log('\n✅ All attendance-related tables created successfully!');
    console.log('📋 Created tables:');
    console.log('   - weekend_configs (with default Saturday/Sunday)');
    console.log('   - attendance (for employee attendance records)');
    console.log('   - attendance_calculation_rules (with default rules)');
    console.log('   - leave_holidays (with sample holidays)');

  } catch (error) {
    console.error('❌ Error setting up tables:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupAttendanceTables();
