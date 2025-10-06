export const up = async (connection) => {
  try {
    console.log('Running migration: Create warnings table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        warning_type ENUM('verbal', 'written', 'final') NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        warning_date DATE NOT NULL,
        status ENUM('active', 'resolved', 'expired') DEFAULT 'active',
        issued_by INT NOT NULL,
        acknowledged_by_employee BOOLEAN DEFAULT FALSE,
        acknowledged_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ warnings table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop warnings table...');
    
    await connection.execute(`DROP TABLE IF EXISTS warnings`);
    
    console.log('✅ warnings table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};