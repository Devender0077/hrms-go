const mysql = require('mysql2/promise');

async function checkSchema() {
  let connection;
  try {
    console.log('🔍 Checking database schema...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hrmgo_hero'
    });
    
    console.log('✅ Connected to database');
    
    // Check employees table structure
    console.log('\n📋 Employees table columns:');
    const [columns] = await connection.execute('SHOW COLUMNS FROM employees');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Check if new columns exist
    const columnNames = columns.map(col => col.Field);
    const newColumns = [
      'employment_type',
      'attendance_policy_id',
      'bank_name',
      'bank_account_number',
      'bank_routing_number',
      'bank_swift_code',
      'bank_address'
    ];
    
    console.log('\n🔍 Checking for new columns:');
    let allColumnsExist = true;
    for (const col of newColumns) {
      if (columnNames.includes(col)) {
        console.log(`  ✅ ${col} - exists`);
      } else {
        console.log(`  ❌ ${col} - missing`);
        allColumnsExist = false;
      }
    }
    
    if (allColumnsExist) {
      console.log('\n🎉 All new columns exist in the employees table!');
    } else {
      console.log('\n⚠️ Some columns are missing. Migration needed.');
    }
    
    // Check attendance tables
    console.log('\n📋 Checking attendance tables...');
    
    try {
      const [policyColumns] = await connection.execute('SHOW COLUMNS FROM attendance_policies');
      const policyColumnNames = policyColumns.map(col => col.Field);
      
      if (policyColumnNames.includes('company_id')) {
        console.log('  ✅ company_id exists in attendance_policies');
      } else {
        console.log('  ❌ company_id missing in attendance_policies');
      }
    } catch (error) {
      console.log(`  ❌ Error checking attendance_policies: ${error.message}`);
    }
    
    try {
      const [regulationColumns] = await connection.execute('SHOW COLUMNS FROM attendance_regulations');
      const regulationColumnNames = regulationColumns.map(col => col.Field);
      
      if (regulationColumnNames.includes('company_id')) {
        console.log('  ✅ company_id exists in attendance_regulations');
      } else {
        console.log('  ❌ company_id missing in attendance_regulations');
      }
    } catch (error) {
      console.log(`  ❌ Error checking attendance_regulations: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSchema();
