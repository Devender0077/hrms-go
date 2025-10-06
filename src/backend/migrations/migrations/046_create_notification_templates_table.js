export const up = async (connection) => {
  try {
    console.log('Running migration: Create notification_templates table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notification_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        type ENUM('email', 'sms', 'push') DEFAULT 'email',
        variables JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ notification_templates table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop notification_templates table...');
    
    await connection.execute(`DROP TABLE IF EXISTS notification_templates`);
    
    console.log('✅ notification_templates table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};