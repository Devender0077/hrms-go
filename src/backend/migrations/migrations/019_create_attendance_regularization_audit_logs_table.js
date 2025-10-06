export const up = async (connection) => {
  try {
    console.log('Running migration: Create attendance_regularization_audit_logs table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance_regularization_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        regularization_id INT NOT NULL,
        action ENUM('created', 'approved', 'rejected', 'modified') NOT NULL,
        performed_by INT NOT NULL,
        old_values JSON,
        new_values JSON,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE
      )`);
    
    console.log('✅ attendance_regularization_audit_logs table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop attendance_regularization_audit_logs table...');
    
    await connection.execute(`DROP TABLE IF EXISTS attendance_regularization_audit_logs`);
    
    console.log('✅ attendance_regularization_audit_logs table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};