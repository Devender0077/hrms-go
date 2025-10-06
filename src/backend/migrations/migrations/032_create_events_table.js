export const up = async (connection) => {
  try {
    console.log('Running migration: Create events table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        location VARCHAR(255),
        event_type ENUM('meeting', 'training', 'holiday', 'celebration', 'other') DEFAULT 'other',
        is_company_wide BOOLEAN DEFAULT FALSE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ events table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop events table...');
    
    await connection.execute(`DROP TABLE IF EXISTS events`);
    
    console.log('✅ events table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};