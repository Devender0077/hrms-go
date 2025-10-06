export const up = async (connection) => {
  try {
    console.log('Running migration: Create webhook_logs table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        webhook_id INT NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        payload JSON,
        response_status INT,
        response_body TEXT,
        execution_time INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ webhook_logs table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop webhook_logs table...');
    
    await connection.execute(`DROP TABLE IF EXISTS webhook_logs`);
    
    console.log('✅ webhook_logs table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};