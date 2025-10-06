export const up = async (connection) => {
  try {
    console.log('Running migration: Create awards table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        award_type_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        award_date DATE NOT NULL,
        amount DECIMAL(10,2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (award_type_id) REFERENCES award_types(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ awards table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop awards table...');
    
    await connection.execute(`DROP TABLE IF EXISTS awards`);
    
    console.log('✅ awards table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};