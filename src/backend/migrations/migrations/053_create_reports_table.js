export const up = async (connection) => {
  try {
    console.log('Running migration: Create reports table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        report_type VARCHAR(100) NOT NULL,
        parameters JSON,
        query TEXT,
        is_scheduled BOOLEAN DEFAULT FALSE,
        schedule_frequency VARCHAR(50),
        last_generated TIMESTAMP NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ reports table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop reports table...');
    
    await connection.execute(`DROP TABLE IF EXISTS reports`);
    
    console.log('✅ reports table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};