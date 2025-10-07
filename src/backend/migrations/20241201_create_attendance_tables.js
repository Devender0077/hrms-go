/**
 * Migration: Create Attendance Tables
 * Creates tables for attendance tracking and calculation rules
 */

const migration = {
  up: async (pool) => {
    try {
      // Create attendance table
      await pool.query(`
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

      // Create attendance calculation rules table
      await pool.query(`
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

      // Insert default attendance calculation rules
      await pool.query(`
        INSERT IGNORE INTO attendance_calculation_rules 
        (name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active) 
        VALUES 
        ('Full Day Present', 'full_day', 8.00, 8.00, 15, 8.00, 'Standard full day attendance rule', true),
        ('Half Day Present', 'half_day', 4.00, 4.00, 15, 4.00, 'Half day attendance rule', true),
        ('Late Arrival', 'late', 6.00, 8.00, 15, 8.00, 'Late arrival but still present', true),
        ('Early Leave', 'early_leave', 4.00, 6.00, 15, 6.00, 'Early departure from work', true),
        ('Absent', 'absent', 0.00, 0.00, 0, 0.00, 'No attendance recorded', true);
      `);

      console.log('✅ Attendance tables created successfully');
    } catch (error) {
      console.error('❌ Error creating attendance tables:', error);
      throw error;
    }
  },

  down: async (pool) => {
    try {
      await pool.query('DROP TABLE IF EXISTS attendance_calculation_rules');
      await pool.query('DROP TABLE IF EXISTS attendance');
      console.log('✅ Attendance tables dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping attendance tables:', error);
      throw error;
    }
  }
};

module.exports = migration;
