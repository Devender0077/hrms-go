const mysql = require('mysql2/promise');

async function checkAndFixRoles() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hrmgo_hero',
    waitForConnections: true,
    connectionLimit: 10
  });

  try {
    console.log('🔍 Checking user roles in database...\n');

    // Check current roles
    const [users] = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
    
    console.log('📊 Current users and roles:');
    console.table(users);

    // Find users with 'admin' role
    const [adminUsers] = await pool.query('SELECT id, username, email, role FROM users WHERE role = "admin"');
    
    if (adminUsers.length > 0) {
      console.log('\n⚠️  Found users with "admin" role (should be "super_admin"):');
      console.table(adminUsers);

      console.log('\n🔧 Fixing roles: admin → super_admin...');
      
      const [result] = await pool.query('UPDATE users SET role = "super_admin" WHERE role = "admin"');
      
      console.log(`✅ Updated ${result.affectedRows} user(s) from "admin" to "super_admin"`);

      // Show updated users
      const [updatedUsers] = await pool.query('SELECT id, username, email, role FROM users WHERE role = "super_admin"');
      console.log('\n✅ Updated users:');
      console.table(updatedUsers);
    } else {
      console.log('\n✅ No users with "admin" role found. All good!');
    }

    // Show final state
    console.log('\n📊 Final user roles:');
    const [finalUsers] = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    console.table(finalUsers);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndFixRoles();
