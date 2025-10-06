export const up = async (connection) => {
  try {
    console.log('Running migration: Create experience_certificates table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS experience_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        description TEXT,
        document_path VARCHAR(500),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ experience_certificates table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop experience_certificates table...');
    
    await connection.execute(`DROP TABLE IF EXISTS experience_certificates`);
    
    console.log('✅ experience_certificates table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};