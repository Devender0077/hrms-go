export const up = async (connection) => {
  try {
    console.log('Running migration: Create projects table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        budget DECIMAL(12,2),
        manager_id INT,
        client_name VARCHAR(255),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ projects table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop projects table...');
    
    await connection.execute(`DROP TABLE IF EXISTS projects`);
    
    console.log('✅ projects table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};