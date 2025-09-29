const mysql = require('mysql2/promise');

async function testContractsDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hrmgo_hero'
  });

  try {
    // Check if table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'employee_contracts'");
    console.log('Tables found:', tables);

    if (tables.length > 0) {
      // Check table structure
      const [columns] = await connection.execute("DESCRIBE employee_contracts");
      console.log('Table structure:', columns);

      // Check if there are any records
      const [records] = await connection.execute("SELECT COUNT(*) as count FROM employee_contracts");
      console.log('Record count:', records);

      // Try to insert a test record
      try {
        const [result] = await connection.execute(`
          INSERT INTO employee_contracts (
            employee_id, contract_type, start_date, end_date, salary,
            status, terms, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [20, 'permanent', '2024-01-01', null, 75000, 'active', 'Test contract']);
        
        console.log('Insert successful:', result);
      } catch (insertError) {
        console.error('Insert error:', insertError.message);
      }
    } else {
      console.log('employee_contracts table does not exist');
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await connection.end();
  }
}

testContractsDB();
