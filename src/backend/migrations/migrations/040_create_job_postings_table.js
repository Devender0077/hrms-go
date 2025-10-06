export const up = async (connection) => {
  try {
    console.log('Running migration: Create job_postings table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        location VARCHAR(255),
        salary_range VARCHAR(100),
        employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
        is_active BOOLEAN DEFAULT TRUE,
        posted_date DATE NOT NULL,
        closing_date DATE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ job_postings table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop job_postings table...');
    
    await connection.execute(`DROP TABLE IF EXISTS job_postings`);
    
    console.log('✅ job_postings table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};