/**
 * Migration: Create announcements table
 * Description: Announcements system for management to communicate with employees
 */

async function up(pool) {
  const connection = await pool.getConnection();
  
  try {
    console.log('Creating announcements table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        category VARCHAR(100) DEFAULT 'general',
        target_audience ENUM('all', 'department', 'designation', 'specific_users') DEFAULT 'all',
        target_departments TEXT NULL COMMENT 'JSON array of department IDs',
        target_designations TEXT NULL COMMENT 'JSON array of designation IDs',
        target_users TEXT NULL COMMENT 'JSON array of user IDs',
        published_by INT NOT NULL,
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        is_active BOOLEAN DEFAULT TRUE,
        read_count INT DEFAULT 0,
        attachments TEXT NULL COMMENT 'JSON array of attachment URLs',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_published_at (published_at),
        INDEX idx_priority (priority),
        INDEX idx_is_active (is_active),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('Creating announcement_reads table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        announcement_id INT NOT NULL,
        user_id INT NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_read (announcement_id, user_id),
        INDEX idx_user_id (user_id),
        INDEX idx_announcement_id (announcement_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Announcements tables created successfully');
    
  } catch (error) {
    console.error('❌ Error creating announcements tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function down(pool) {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('DROP TABLE IF EXISTS announcement_reads');
    await connection.query('DROP TABLE IF EXISTS announcements');
    console.log('✅ Announcements tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping announcements tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { up, down };

