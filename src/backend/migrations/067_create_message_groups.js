/**
 * Migration: Create message groups and group members tables
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function up() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrmgo_hero'
  });

  try {
    // Check if users table exists
    const [usersTables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (usersTables.length === 0) {
      console.log('⚠️  Users table does not exist, skipping message_groups creation');
      return;
    }

    console.log('Creating message_groups table...');
    
    // Create message_groups table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS message_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        group_type ENUM('team_lead', 'management', 'accounts', 'hr', 'department', 'custom') DEFAULT 'custom',
        created_by INT NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_group_type (group_type),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Creating message_group_members table...');
    
    // Create message_group_members table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS message_group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('admin', 'member') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES message_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_group_member (group_id, user_id),
        INDEX idx_group_id (group_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Message groups tables created successfully');
  } catch (error) {
    console.error('❌ Error creating message groups tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function down() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrmgo_hero'
  });

  try {
    await connection.query('DROP TABLE IF EXISTS message_group_members');
    await connection.query('DROP TABLE IF EXISTS message_groups');
    console.log('✅ Message groups tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping message groups tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { up, down };

// Run migration if called directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
