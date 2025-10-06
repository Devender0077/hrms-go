export const up = async (connection) => {
  try {
    console.log('Running migration: Create promotions table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        from_position VARCHAR(255),
        to_position VARCHAR(255) NOT NULL,
        from_department VARCHAR(255),
        to_department VARCHAR(255),
        from_salary DECIMAL(10,2),
        to_salary DECIMAL(10,2),
        effective_date DATE NOT NULL,
        reason TEXT,
        approved_by INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ promotions table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop promotions table...');
    
    await connection.execute(`DROP TABLE IF EXISTS promotions`);
    
    console.log('✅ promotions table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};