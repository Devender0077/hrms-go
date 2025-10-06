export const up = async (connection) => {
  try {
    console.log('Running migration: Create meeting_types table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meeting_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        duration INT DEFAULT 60,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ meeting_types table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop meeting_types table...');
    
    await connection.execute(`DROP TABLE IF EXISTS meeting_types`);
    
    console.log('✅ meeting_types table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};