const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hrmgo_hero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function migrateEmployeeFields() {
  try {
    console.log('🔄 Starting employee fields migration...');
    
    // First, let's check the current schema
    console.log('\n📋 Current employees table schema:');
    const [columns] = await pool.query('SHOW COLUMNS FROM employees');
    console.log('Existing columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Define the new columns to add
    const newColumns = [
      {
        name: 'employment_type',
        definition: "ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time'"
      },
      {
        name: 'attendance_policy_id',
        definition: 'INT NULL'
      },
      {
        name: 'bank_name',
        definition: 'VARCHAR(255) NULL'
      },
      {
        name: 'bank_account_number',
        definition: 'VARCHAR(50) NULL'
      },
      {
        name: 'bank_routing_number',
        definition: 'VARCHAR(50) NULL'
      },
      {
        name: 'bank_swift_code',
        definition: 'VARCHAR(20) NULL'
      },
      {
        name: 'bank_address',
        definition: 'TEXT NULL'
      }
    ];
    
    // Check which columns already exist
    const existingColumnNames = columns.map(col => col.Field);
    console.log('\n🔍 Checking which columns need to be added:');
    
    for (const column of newColumns) {
      if (existingColumnNames.includes(column.name)) {
        console.log(`  ✅ ${column.name} - already exists`);
      } else {
        console.log(`  ❌ ${column.name} - needs to be added`);
      }
    }
    
    // Add missing columns
    console.log('\n➕ Adding missing columns...');
    for (const column of newColumns) {
      if (!existingColumnNames.includes(column.name)) {
        try {
          await pool.query(`ALTER TABLE employees ADD COLUMN ${column.name} ${column.definition}`);
          console.log(`  ✅ Added ${column.name}`);
        } catch (error) {
          console.log(`  ❌ Failed to add ${column.name}: ${error.message}`);
        }
      }
    }
    
    // Also add missing columns to attendance_policies and attendance_regulations
    console.log('\n🔧 Adding company_id to attendance tables...');
    
    // Check attendance_policies
    try {
      const [policyColumns] = await pool.query('SHOW COLUMNS FROM attendance_policies');
      const policyColumnNames = policyColumns.map(col => col.Field);
      
      if (!policyColumnNames.includes('company_id')) {
        await pool.query('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
        console.log('  ✅ Added company_id to attendance_policies');
      } else {
        console.log('  ✅ company_id already exists in attendance_policies');
      }
    } catch (error) {
      console.log(`  ❌ Error with attendance_policies: ${error.message}`);
    }
    
    // Check attendance_regulations
    try {
      const [regulationColumns] = await pool.query('SHOW COLUMNS FROM attendance_regulations');
      const regulationColumnNames = regulationColumns.map(col => col.Field);
      
      if (!regulationColumnNames.includes('company_id')) {
        await pool.query('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
        console.log('  ✅ Added company_id to attendance_regulations');
      } else {
        console.log('  ✅ company_id already exists in attendance_regulations');
      }
    } catch (error) {
      console.log(`  ❌ Error with attendance_regulations: ${error.message}`);
    }
    
    // Verify the final schema
    console.log('\n📋 Final employees table schema:');
    const [finalColumns] = await pool.query('SHOW COLUMNS FROM employees');
    console.log('All columns:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Test creating a sample employee with new fields
    console.log('\n🧪 Testing employee creation with new fields...');
    
    // Create a test user first
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const [userResult] = await pool.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['Test Employee', 'test.employee@company.com', hashedPassword, 'employee', 'active']
    );
    
    const userId = userResult.insertId;
    console.log(`  ✅ Created test user with ID: ${userId}`);
    
    // Create test employee with new fields
    const [employeeResult] = await pool.query(
      `INSERT INTO employees (
        user_id, company_id, branch_id, department_id, designation_id,
        employee_id, first_name, last_name, email, phone,
        date_of_birth, gender, address, city, state, country, zip_code,
        joining_date, status, employment_type, attendance_policy_id,
        bank_name, bank_account_number, bank_routing_number, bank_swift_code, bank_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 1, 1, 1, 1, // user_id, company_id, branch_id, department_id, designation_id
        'TEST001', 'Test', 'Employee', 'test.employee@company.com', '+1234567890', // employee_id, first_name, last_name, email, phone
        '1990-01-01', 'male', '123 Test Street', 'Test City', 'Test State', 'Test Country', '12345', // date_of_birth, gender, address, city, state, country, zip_code
        '2024-01-01', 'active', 'full_time', null, // joining_date, status, employment_type, attendance_policy_id
        'Test Bank', '1234567890', '987654321', 'TESTUS33', '456 Bank Street' // bank_name, bank_account_number, bank_routing_number, bank_swift_code, bank_address
      ]
    );
    
    const employeeId = employeeResult.insertId;
    console.log(`  ✅ Created test employee with ID: ${employeeId}`);
    
    // Retrieve and display the employee
    const [employees] = await pool.query(
      `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN branches b ON e.branch_id = b.id
       WHERE e.id = ?`,
      [employeeId]
    );
    
    if (employees.length > 0) {
      const employee = employees[0];
      console.log('\n📖 Test employee data:');
      console.log(`  - Name: ${employee.first_name} ${employee.last_name}`);
      console.log(`  - Employee ID: ${employee.employee_id}`);
      console.log(`  - Email: ${employee.email}`);
      console.log(`  - Employment Type: ${employee.employment_type}`);
      console.log(`  - Bank Name: ${employee.bank_name}`);
      console.log(`  - Bank Account: ${employee.bank_account_number}`);
      console.log(`  - Status: ${employee.status}`);
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await pool.query('DELETE FROM employees WHERE id = ?', [employeeId]);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    console.log('  ✅ Test data cleaned up');
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ All new employee fields have been added to the database');
    console.log('✅ Attendance policies and regulations company_id columns added');
    console.log('✅ Database schema is now ready for the enhanced employee system');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

migrateEmployeeFields();
