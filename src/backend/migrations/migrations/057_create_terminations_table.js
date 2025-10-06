export const up = async (connection) => {
  try {
    console.log('Running migration: Create terminations table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS terminations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        termination_type_id INT NOT NULL,
        termination_date DATE NOT NULL,
        reason TEXT NOT NULL,
        notice_period_days INT DEFAULT 0,
        severance_amount DECIMAL(10,2),
        status ENUM('pending', 'approved', 'completed') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        exit_interview_conducted BOOLEAN DEFAULT FALSE,
        handover_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (termination_type_id) REFERENCES termination_types(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ terminations table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop terminations table...');
    
    await connection.execute(`DROP TABLE IF EXISTS terminations`);
    
    console.log('✅ terminations table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};