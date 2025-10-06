export const up = async (connection) => {
  try {
    console.log('Running migration: Create project_assignments table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        employee_id INT NOT NULL,
        role VARCHAR(255),
        start_date DATE,
        end_date DATE,
        allocation_percentage DECIMAL(5,2) DEFAULT 100,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ project_assignments table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop project_assignments table...');
    
    await connection.execute(`DROP TABLE IF EXISTS project_assignments`);
    
    console.log('✅ project_assignments table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};