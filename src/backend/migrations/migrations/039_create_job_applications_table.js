export const up = async (connection) => {
  try {
    console.log('Running migration: Create job_applications table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        resume_path VARCHAR(500),
        cover_letter TEXT,
        status ENUM('applied', 'screening', 'interview', 'offered', 'hired', 'rejected') DEFAULT 'applied',
        applied_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ job_applications table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop job_applications table...');
    
    await connection.execute(`DROP TABLE IF EXISTS job_applications`);
    
    console.log('✅ job_applications table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};