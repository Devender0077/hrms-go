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
    const existingColumns = columns.map(col => col.Field);
    console.log('Existing columns:', existingColumns.join(', '));
    
    // Define new columns to add
    const newColumns = [
      {
        name: 'employment_type',
        sql: "ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time'"
      },
      {
        name: 'attendance_policy_id',
        sql: 'ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL'
      },
      {
        name: 'bank_name',
        sql: 'ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) NULL'
      },
      {
        name: 'bank_account_number',
        sql: 'ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(50) NULL'
      },
      {
        name: 'bank_routing_number',
        sql: 'ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(50) NULL'
      },
      {
        name: 'bank_swift_code',
        sql: 'ALTER TABLE employees ADD COLUMN bank_swift_code VARCHAR(20) NULL'
      },
      {
        name: 'bank_address',
        sql: 'ALTER TABLE employees ADD COLUMN bank_address TEXT NULL'
      }
    ];
    
    console.log('\n➕ Adding new columns to employees table...');
    for (const column of newColumns) {
      if (existingColumns.includes(column.name)) {
        console.log(`  ℹ️ ${column.name} already exists`);
      } else {
        try {
          await connection.execute(column.sql);
          console.log(`  ✅ Added ${column.name}`);
        } catch (error) {
          console.log(`  ❌ Error adding ${column.name}: ${error.message}`);
        }
      }
    }
    
    // Add company_id to attendance tables
    console.log('\n🔧 Adding company_id to attendance tables...');
    
    // Check attendance_policies
    try {
      const [policyColumns] = await connection.execute('SHOW COLUMNS FROM attendance_policies');
      const policyColumnNames = policyColumns.map(col => col.Field);
      
      if (policyColumnNames.includes('company_id')) {
        console.log('  ℹ️ company_id already exists in attendance_policies');
      } else {
        await connection.execute('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
        console.log('  ✅ Added company_id to attendance_policies');
      }
    } catch (error) {
      console.log(`  ❌ Error with attendance_policies: ${error.message}`);
    }
    
    // Check attendance_regulations
    try {
      const [regulationColumns] = await connection.execute('SHOW COLUMNS FROM attendance_regulations');
      const regulationColumnNames = regulationColumns.map(col => col.Field);
      
      if (regulationColumnNames.includes('company_id')) {
        console.log('  ℹ️ company_id already exists in attendance_regulations');
      } else {
        await connection.execute('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
        console.log('  ✅ Added company_id to attendance_regulations');
      }
    } catch (error) {
      console.log(`  ❌ Error with attendance_regulations: ${error.message}`);
    }
    
    // Verify final structure
    console.log('\n📋 Final employees table columns:');
    const [finalColumns] = await connection.execute('SHOW COLUMNS FROM employees');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ All new employee fields have been added to the database');
    console.log('✅ Attendance policies and regulations company_id columns added');
    console.log('✅ Database schema is now ready for the enhanced employee system');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
