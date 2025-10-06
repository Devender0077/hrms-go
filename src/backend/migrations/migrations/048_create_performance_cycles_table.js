export const up = async (connection) => {
  try {
    console.log('Running migration: Create performance_cycles table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS performance_cycles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('planning', 'active', 'completed', 'closed') DEFAULT 'planning',
        description TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ performance_cycles table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop performance_cycles table...');
    
    await connection.execute(`DROP TABLE IF EXISTS performance_cycles`);
    
    console.log('✅ performance_cycles table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};