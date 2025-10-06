export const up = async (connection) => {
  try {
    console.log('Running migration: Create attendance_summaries table...');
    
    await connection.execute(`
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
      )`);
    
    console.log('✅ attendance_summaries table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop attendance_summaries table...');
    
    await connection.execute(`DROP TABLE IF EXISTS attendance_summaries`);
    
    console.log('✅ attendance_summaries table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};