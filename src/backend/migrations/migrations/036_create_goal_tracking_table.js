export const up = async (connection) => {
  try {
    console.log('Running migration: Create goal_tracking table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS goal_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        employee_id INT NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        notes TEXT,
        tracked_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ goal_tracking table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop goal_tracking table...');
    
    await connection.execute(`DROP TABLE IF EXISTS goal_tracking`);
    
    console.log('✅ goal_tracking table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};