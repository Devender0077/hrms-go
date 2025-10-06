export const up = async (connection) => {
  try {
    console.log('Running migration: Create training_participants table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS training_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        training_id INT NOT NULL,
        employee_id INT NOT NULL,
        enrollment_date DATE NOT NULL,
        completion_date DATE,
        status ENUM('enrolled', 'in_progress', 'completed', 'dropped') DEFAULT 'enrolled',
        score DECIMAL(5,2),
        feedback TEXT,
        certificate_issued BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (training_id) REFERENCES training_programs(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_training_employee (training_id, employee_id)
      )`);
    
    console.log('✅ training_participants table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop training_participants table...');
    
    await connection.execute(`DROP TABLE IF EXISTS training_participants`);
    
    console.log('✅ training_participants table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};