export const up = async (connection) => {
  try {
    console.log('Running migration: Create resignations table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS resignations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        resignation_date DATE NOT NULL,
        last_working_date DATE NOT NULL,
        reason TEXT NOT NULL,
        notice_period_days INT DEFAULT 30,
        status ENUM('submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        exit_interview_conducted BOOLEAN DEFAULT FALSE,
        handover_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ resignations table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop resignations table...');
    
    await connection.execute(`DROP TABLE IF EXISTS resignations`);
    
    console.log('✅ resignations table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};