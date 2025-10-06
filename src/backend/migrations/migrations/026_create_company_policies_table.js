export const up = async (connection) => {
  try {
    console.log('Running migration: Create company_policies table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS company_policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        category VARCHAR(100),
        version VARCHAR(20) DEFAULT '1.0',
        effective_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ company_policies table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop company_policies table...');
    
    await connection.execute(`DROP TABLE IF EXISTS company_policies`);
    
    console.log('✅ company_policies table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};