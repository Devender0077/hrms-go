export const up = async (connection) => {
  try {
    console.log('Running migration: Create attendance_exceptions table...');
    
    await connection.execute(`
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
      )`);
    
    console.log('✅ attendance_exceptions table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop attendance_exceptions table...');
    
    await connection.execute(`DROP TABLE IF EXISTS attendance_exceptions`);
    
    console.log('✅ attendance_exceptions table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};