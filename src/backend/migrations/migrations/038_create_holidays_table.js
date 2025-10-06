export const up = async (connection) => {
  try {
    console.log('Running migration: Create holidays table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS holidays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        type ENUM('national', 'regional', 'company', 'religious') DEFAULT 'national',
        is_recurring BOOLEAN DEFAULT FALSE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ holidays table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop holidays table...');
    
    await connection.execute(`DROP TABLE IF EXISTS holidays`);
    
    console.log('✅ holidays table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};