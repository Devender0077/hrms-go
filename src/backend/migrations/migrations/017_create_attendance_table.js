export const up = async (connection) => {
  try {
    console.log('Running migration: Create attendance table...');
    
    await connection.execute(`
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
      )`);
    
    console.log('✅ attendance table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop attendance table...');
    
    await connection.execute(`DROP TABLE IF EXISTS attendance`);
    
    console.log('✅ attendance table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};