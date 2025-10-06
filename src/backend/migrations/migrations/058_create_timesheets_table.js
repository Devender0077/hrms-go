export const up = async (connection) => {
  try {
    console.log('Running migration: Create timesheets table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        project_id INT,
        task_id INT,
        date DATE NOT NULL,
        hours_worked DECIMAL(4,2) NOT NULL,
        description TEXT,
        status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ timesheets table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop timesheets table...');
    
    await connection.execute(`DROP TABLE IF EXISTS timesheets`);
    
    console.log('✅ timesheets table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};