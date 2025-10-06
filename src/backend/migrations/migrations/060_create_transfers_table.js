export const up = async (connection) => {
  try {
    console.log('Running migration: Create transfers table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transfers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        from_department VARCHAR(255),
        to_department VARCHAR(255) NOT NULL,
        from_branch VARCHAR(255),
        to_branch VARCHAR(255),
        from_position VARCHAR(255),
        to_position VARCHAR(255),
        effective_date DATE NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ transfers table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop transfers table...');
    
    await connection.execute(`DROP TABLE IF EXISTS transfers`);
    
    console.log('✅ transfers table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};