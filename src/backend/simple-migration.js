const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  try {
    console.log('🔄 Starting database migration...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hrmgo_hero'
    });
    
    console.log('✅ Connected to database');
    
    // Check current employees table structure
    console.log('\n📋 Current employees table columns:');
    const [columns] = await connection.execute('SHOW COLUMNS FROM employees');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Add new columns one by one
    const newColumns = [
      "ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time'",
      "ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL",
      "ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) NULL",
      "ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(50) NULL",
      "ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(50) NULL",
      "ALTER TABLE employees ADD COLUMN bank_swift_code VARCHAR(20) NULL",
      "ALTER TABLE employees ADD COLUMN bank_address TEXT NULL"
    ];
    
    console.log('\n➕ Adding new columns...');
    for (const sql of newColumns) {
      try {
        await connection.execute(sql);
        const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
        console.log(`  ✅ Added ${columnName}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
          console.log(`  ℹ️ ${columnName} already exists`);
        } else {
          console.log(`  ❌ Error: ${error.message}`);
        }
      }
    }
    
    // Add company_id to attendance tables
    console.log('\n🔧 Adding company_id to attendance tables...');
    
    try {
      await connection.execute('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
      console.log('  ✅ Added company_id to attendance_policies');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('  ℹ️ company_id already exists in attendance_policies');
      } else {
        console.log(`  ❌ Error with attendance_policies: ${error.message}`);
      }
    }
    
    try {
      await connection.execute('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
      console.log('  ✅ Added company_id to attendance_regulations');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('  ℹ️ company_id already exists in attendance_regulations');
      } else {
        console.log(`  ❌ Error with attendance_regulations: ${error.message}`);
      }
    }
    
    // Verify final structure
    console.log('\n📋 Final employees table columns:');
    const [finalColumns] = await connection.execute('SHOW COLUMNS FROM employees');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
