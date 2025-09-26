import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hrmgo',
  port: 3306
};

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Check if leave management tables exist
    const tables = [
      'leave_types',
      'leave_applications', 
      'leave_balances',
      'leave_policies',
      'leave_holidays'
    ];

    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`✅ Table '${table}' exists`);
          const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`   Records: ${count[0].count}`);
        } else {
          console.log(`❌ Table '${table}' does not exist`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}': ${error.message}`);
      }
    }

    // Check if companies table exists
    try {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM companies`);
      console.log(`✅ Companies table exists with ${rows[0].count} records`);
    } catch (error) {
      console.log(`❌ Companies table error: ${error.message}`);
    }

    // Check if employees table exists
    try {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM employees`);
      console.log(`✅ Employees table exists with ${rows[0].count} records`);
    } catch (error) {
      console.log(`❌ Employees table error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkDatabase();
