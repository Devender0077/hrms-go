export const up = async (connection) => {
  try {
    console.log('Running migration: Create employee_documents table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        document_type_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT,
        mime_type VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by INT,
        verified_at TIMESTAMP NULL,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ employee_documents table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop employee_documents table...');
    
    await connection.execute(`DROP TABLE IF EXISTS employee_documents`);
    
    console.log('✅ employee_documents table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};