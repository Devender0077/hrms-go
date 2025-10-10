/**
 * Migration: 071_create_api_keys_table
 * Creates API keys table for managing API access tokens
 */

async function up(connection) {
  console.log('📝 Creating API keys table...');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      api_key VARCHAR(255) NOT NULL UNIQUE,
      status ENUM('active', 'inactive', 'revoked') DEFAULT 'active',
      last_used_at TIMESTAMP NULL,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_api_key (api_key),
      INDEX idx_user_id (user_id),
      INDEX idx_status (status)
    )
  `);
  console.log('✅ API keys table created');
}

async function down(connection) {
  console.log('📝 Dropping API keys table...');
  await connection.query(`DROP TABLE IF EXISTS api_keys`);
  console.log('✅ API keys table dropped');
}

module.exports = { up, down };

