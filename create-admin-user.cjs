/**
 * Create Admin User Script
 * Run this to create a default admin user for testing
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdminUser() {
  try {
    // Database connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hrmgo_hero'
    });

    console.log('🔗 Connected to database');

    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@hrmgo.com']
    );

    if (existingUsers.length > 0) {
      console.log('✅ Admin user already exists');
      await connection.end();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Password hashed');

    // Create admin user
    const [result] = await connection.execute(
      `INSERT INTO users (
        name,
        email, 
        password, 
        role, 
        status,
        email_verified_at,
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        'System Administrator',
        'admin@hrmgo.com',
        hashedPassword,
        'super_admin',
        'active'
      ]
    );

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hrmgo.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: super_admin');

    await connection.end();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
