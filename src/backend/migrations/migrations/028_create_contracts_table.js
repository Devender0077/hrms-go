export const up = async (connection) => {
  try {
    console.log('Running migration: Create contracts table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        contract_type_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        salary DECIMAL(10,2),
        status ENUM('active', 'expired', 'terminated') DEFAULT 'active',
        document_path VARCHAR(500),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (contract_type_id) REFERENCES contract_types(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ contracts table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop contracts table...');
    
    await connection.execute(`DROP TABLE IF EXISTS contracts`);
    
    console.log('✅ contracts table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};