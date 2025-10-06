export const up = async (connection) => {
  try {
    console.log('Running migration: Create messenger table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messenger (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        message_type ENUM('text', 'file', 'image') DEFAULT 'text',
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ messenger table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop messenger table...');
    
    await connection.execute(`DROP TABLE IF EXISTS messenger`);
    
    console.log('✅ messenger table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};