export const up = async (connection) => {
  try {
    console.log('Running migration: Create google_calendar_integrations table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS google_calendar_integrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        calendar_id VARCHAR(255) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ google_calendar_integrations table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop google_calendar_integrations table...');
    
    await connection.execute(`DROP TABLE IF EXISTS google_calendar_integrations`);
    
    console.log('✅ google_calendar_integrations table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};