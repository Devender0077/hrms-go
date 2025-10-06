export const up = async (connection) => {
  try {
    console.log('Running migration: Create complaints table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('harassment', 'discrimination', 'workplace_issue', 'other') NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
        assigned_to INT,
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ complaints table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop complaints table...');
    
    await connection.execute(`DROP TABLE IF EXISTS complaints`);
    
    console.log('✅ complaints table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};