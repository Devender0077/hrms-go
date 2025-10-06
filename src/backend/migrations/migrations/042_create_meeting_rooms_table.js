export const up = async (connection) => {
  try {
    console.log('Running migration: Create meeting_rooms table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meeting_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        capacity INT DEFAULT 10,
        amenities JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ meeting_rooms table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop meeting_rooms table...');
    
    await connection.execute(`DROP TABLE IF EXISTS meeting_rooms`);
    
    console.log('✅ meeting_rooms table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};