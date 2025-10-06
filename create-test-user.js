const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hrms'
  });

  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await connection.execute(
      `INSERT INTO users (company_id, name, email, password, role, status, created_at) 
       VALUES (1, 'Test User', 'test@example.com', ?, 'admin', 'active', NOW())
       ON DUPLICATE KEY UPDATE password = ?`,
      [hashedPassword, hashedPassword]
    );

    console.log('✅ Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: password123');

    // Test login
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['test@example.com']
    );

    if (users.length > 0) {
      console.log('✅ User found in database');
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await connection.end();
  }
}

createTestUser();
