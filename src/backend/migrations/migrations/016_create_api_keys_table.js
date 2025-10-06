export const up = async (connection) => {
  try {
    console.log('Running migration: Create api_keys table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        key_value VARCHAR(255) NOT NULL UNIQUE,
        permissions JSON,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ api_keys table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop api_keys table...');
    
    await connection.execute(`DROP TABLE IF EXISTS api_keys`);
    
    console.log('✅ api_keys table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};