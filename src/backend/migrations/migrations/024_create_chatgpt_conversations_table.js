export const up = async (connection) => {
  try {
    console.log('Running migration: Create chatgpt_conversations table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatgpt_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        response TEXT,
        tokens_used INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ chatgpt_conversations table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop chatgpt_conversations table...');
    
    await connection.execute(`DROP TABLE IF EXISTS chatgpt_conversations`);
    
    console.log('✅ chatgpt_conversations table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};