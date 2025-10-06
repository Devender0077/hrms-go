/**
 * Migration: 012_fix_attendance_records
 * Fix attendance_records table to match route expectations
 */

async function up(connection) {
  console.log('🔄 Running migration: Fix attendance_records table structure...');
  
  try {
    // Check if the table exists and has the wrong column names
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'attendance_records'
      AND COLUMN_NAME IN ('check_in', 'check_out')
    `);
    
    if (columns.length > 0) {
      console.log('📝 Updating attendance_records table columns...');
      
      // Rename columns to match route expectations
      await connection.execute(`
        ALTER TABLE attendance_records 
        CHANGE COLUMN check_in check_in_time TIMESTAMP NULL DEFAULT NULL,
        CHANGE COLUMN check_out check_out_time TIMESTAMP NULL DEFAULT NULL
      `);
      
      console.log('✅ Attendance records columns renamed');
    }
    
    // Ensure the table has the correct structure
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
    
    console.log('✅ Migration completed: Attendance records table structure fixed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function down(connection) {
  console.log('🔄 Rolling back migration: Fix attendance_records table structure...');
  
  try {
    // Revert column names if they were changed
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'attendance_records'
      AND COLUMN_NAME IN ('check_in_time', 'check_out_time')
    `);
    
    if (columns.length > 0) {
      await connection.execute(`
        ALTER TABLE attendance_records 
        CHANGE COLUMN check_in_time check_in TIME NULL,
        CHANGE COLUMN check_out_time check_out TIME NULL
      `);
    }
    
    console.log('✅ Rollback completed: Attendance records table structure reverted');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

export { up, down };
