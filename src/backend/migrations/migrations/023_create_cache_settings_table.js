export const up = async (connection) => {
  try {
    console.log('Running migration: Create cache_settings table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cache_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cache_key VARCHAR(255) NOT NULL UNIQUE,
        cache_value LONGTEXT,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ cache_settings table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop cache_settings table...');
    
    await connection.execute(`DROP TABLE IF EXISTS cache_settings`);
    
    console.log('✅ cache_settings table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};