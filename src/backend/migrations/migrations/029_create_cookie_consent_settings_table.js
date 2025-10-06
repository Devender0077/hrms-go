export const up = async (connection) => {
  try {
    console.log('Running migration: Create cookie_consent_settings table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cookie_consent_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        consent_type VARCHAR(100) NOT NULL,
        granted BOOLEAN DEFAULT FALSE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ cookie_consent_settings table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop cookie_consent_settings table...');
    
    await connection.execute(`DROP TABLE IF EXISTS cookie_consent_settings`);
    
    console.log('✅ cookie_consent_settings table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};