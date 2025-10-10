const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_hero',
  port: process.env.DB_PORT || 3306
};

async function cleanupUsersTable() {
  let connection;
  try {
    console.log('🔧 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected!');
    
    // 1. Check current state
    console.log('\n📊 Current Users Table Status:');
    const [users] = await connection.query(`
      SELECT u.id, u.email, u.role, e.id as employee_id
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.id
      ORDER BY u.id
    `);
    
    console.log(`Total users: ${users.length}`);
    const managementUsers = users.filter(u => ['super_admin', 'company_admin', 'hr_manager', 'manager', 'admin'].includes(u.role));
    const employeeUsers = users.filter(u => u.role === 'employee');
    
    console.log(`Management users: ${managementUsers.length}`);
    console.log(`Employee users: ${employeeUsers.length}`);
    
    console.log('\nManagement Users (KEEP):');
    managementUsers.forEach(u => {
      console.log(`  - ID:${u.id}, Email:${u.email}, Role:${u.role}`);
    });
    
    console.log('\nEmployee Users (TO REMOVE):');
    employeeUsers.forEach(u => {
      console.log(`  - ID:${u.id}, Email:${u.email}, Has Employee Record:${!!u.employee_id}`);
    });
    
    // 2. Safety check
    if (employeeUsers.length === 0) {
      console.log('\n✅ No employee users to remove. Users table is already clean!');
      return;
    }
    
    console.log(`\n⚠️  About to delete ${employeeUsers.length} employee user records.`);
    console.log('⚠️  This will NOT delete employee data from employees table.');
    console.log('⚠️  Employees will need to be manually created as users again if needed.');
    
    // 3. Perform cleanup
    const employeeIds = employeeUsers.map(u => u.id);
    
    console.log(`\n🗑️  Deleting users: ${employeeIds.join(', ')}`);
    
    await connection.query(`
      DELETE FROM users 
      WHERE role = 'employee' 
      AND id IN (?)
    `, [employeeIds]);
    
    console.log('✅ Deleted employee users from users table');
    
    // 4. Verify
    const [afterUsers] = await connection.query(`
      SELECT COUNT(*) as total, role
      FROM users
      GROUP BY role
    `);
    
    console.log('\n📊 Users Table After Cleanup:');
    afterUsers.forEach(row => {
      console.log(`  - ${row.role}: ${row.total}`);
    });
    
    const [totalAfter] = await connection.query('SELECT COUNT(*) as total FROM users');
    console.log(`\nTotal users remaining: ${totalAfter[0].total}`);
    
    // 5. Check employees table is intact
    const [employees] = await connection.query('SELECT COUNT(*) as total FROM employees');
    console.log(`Employees table: ${employees[0].total} records (INTACT) ✅`);
    
    console.log('\n✅ Cleanup complete!');
    console.log('📝 Note: Employees can still access the system using their employee records.');
    console.log('📝 Only authentication entries were removed from users table.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the cleanup
cleanupUsersTable()
  .then(() => {
    console.log('\n🎉 Users table cleanup complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });
