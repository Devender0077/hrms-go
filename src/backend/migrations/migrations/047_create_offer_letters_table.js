export const up = async (connection) => {
  try {
    console.log('Running migration: Create offer_letters table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS offer_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        salary DECIMAL(10,2),
        start_date DATE,
        document_path VARCHAR(500),
        status ENUM('draft', 'sent', 'accepted', 'declined') DEFAULT 'draft',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ offer_letters table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop offer_letters table...');
    
    await connection.execute(`DROP TABLE IF EXISTS offer_letters`);
    
    console.log('✅ offer_letters table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};