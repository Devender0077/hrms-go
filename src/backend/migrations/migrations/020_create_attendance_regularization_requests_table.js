export const up = async (connection) => {
  try {
    console.log('Running migration: Create attendance_regularization_requests table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance_regularization_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        request_type ENUM('check_in', 'check_out', 'full_day') NOT NULL,
        requested_time TIME,
        reason TEXT NOT NULL,
        supporting_documents JSON,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )`);
    
    console.log('✅ attendance_regularization_requests table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop attendance_regularization_requests table...');
    
    await connection.execute(`DROP TABLE IF EXISTS attendance_regularization_requests`);
    
    console.log('✅ attendance_regularization_requests table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};