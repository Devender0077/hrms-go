export const up = async (connection) => {
  try {
    console.log('Running migration: Create chatgpt_settings table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatgpt_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ chatgpt_settings table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop chatgpt_settings table...');
    
    await connection.execute(`DROP TABLE IF EXISTS chatgpt_settings`);
    
    console.log('✅ chatgpt_settings table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};