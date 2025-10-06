export const up = async (connection) => {
  try {
    console.log('Running migration: Create webhooks table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        events JSON NOT NULL,
        secret_key VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ webhooks table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop webhooks table...');
    
    await connection.execute(`DROP TABLE IF EXISTS webhooks`);
    
    console.log('✅ webhooks table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};