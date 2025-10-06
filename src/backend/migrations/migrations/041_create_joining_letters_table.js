export const up = async (connection) => {
  try {
    console.log('Running migration: Create joining_letters table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS joining_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        letter_number VARCHAR(100) NOT NULL,
        joining_date DATE NOT NULL,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        salary DECIMAL(10,2),
        document_path VARCHAR(500),
        status ENUM('draft', 'sent', 'acknowledged') DEFAULT 'draft',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ joining_letters table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop joining_letters table...');
    
    await connection.execute(`DROP TABLE IF EXISTS joining_letters`);
    
    console.log('✅ joining_letters table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};