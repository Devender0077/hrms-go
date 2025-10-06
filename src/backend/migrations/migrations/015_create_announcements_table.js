export const up = async (connection) => {
  try {
    console.log('Running migration: Create announcements table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('general', 'urgent', 'maintenance', 'holiday') DEFAULT 'general',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ announcements table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop announcements table...');
    
    await connection.execute(`DROP TABLE IF EXISTS announcements`);
    
    console.log('✅ announcements table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};