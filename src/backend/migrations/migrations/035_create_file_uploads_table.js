export const up = async (connection) => {
  try {
    console.log('Running migration: Create file_uploads table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by INT NOT NULL,
        module VARCHAR(100),
        record_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ file_uploads table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop file_uploads table...');
    
    await connection.execute(`DROP TABLE IF EXISTS file_uploads`);
    
    console.log('✅ file_uploads table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};