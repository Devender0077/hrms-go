const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hrmgo_hero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testEmployeeCreation() {
  try {
    console.log('🧪 Testing employee creation and database schema...');
    
    // First, let's check if the required columns exist
    console.log('\n📋 Checking database schema...');
    
    try {
      const [columns] = await pool.query('DESCRIBE employees');
      const columnNames = columns.map(col => col.Field);
      
      const requiredColumns = [
        'employment_type', 'attendance_policy_id', 'bank_name', 
        'bank_account_number', 'bank_routing_number', 'bank_swift_code', 'bank_address'
      ];
      
      console.log('✅ Existing columns in employees table:');
      columnNames.forEach(col => console.log(`  - ${col}`));
      
      console.log('\n🔍 Checking for required columns:');
      for (const col of requiredColumns) {
        if (columnNames.includes(col)) {
          console.log(`  ✅ ${col} - exists`);
        } else {
          console.log(`  ❌ ${col} - missing`);
        }
      }
    } catch (error) {
      console.log('❌ Error checking schema:', error.message);
    }
    
    // Test creating a user account
    console.log('\n👤 Creating test user account...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const [userResult] = await pool.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['Test Employee', 'test.employee@company.com', hashedPassword, 'employee', 'active']
    );
    
    const userId = userResult.insertId;
    console.log(`✅ Created user with ID: ${userId}`);
    
    // Test creating an employee with all new fields
    console.log('\n👨‍💼 Creating test employee...');
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
        'EMP001', 'Test', 'Employee', 'test.employee@company.com', '+1234567890', // employee_id, first_name, last_name, email, phone
        '1990-01-01', 'male', '123 Test Street', 'Test City', 'Test State', 'Test Country', '12345', // date_of_birth, gender, address, city, state, country, zip_code
        '2024-01-01', 'active', 'full_time', null, // joining_date, status, employment_type, attendance_policy_id
        'Test Bank', '1234567890', '987654321', 'TESTUS33', '456 Bank Street' // bank_name, bank_account_number, bank_routing_number, bank_swift_code, bank_address
      ]
    );
    
    const employeeId = employeeResult.insertId;
    console.log(`✅ Created employee with ID: ${employeeId}`);
    
    // Test retrieving the employee
    console.log('\n📖 Retrieving test employee...');
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
      console.log('✅ Employee retrieved successfully:');
      console.log(`  - Name: ${employee.first_name} ${employee.last_name}`);
      console.log(`  - Employee ID: ${employee.employee_id}`);
      console.log(`  - Email: ${employee.email}`);
      console.log(`  - Employment Type: ${employee.employment_type}`);
      console.log(`  - Bank Name: ${employee.bank_name}`);
      console.log(`  - Bank Account: ${employee.bank_account_number}`);
      console.log(`  - Status: ${employee.status}`);
    } else {
      console.log('❌ Failed to retrieve employee');
    }
    
    // Test updating the employee
    console.log('\n✏️ Testing employee update...');
    await pool.query(
      `UPDATE employees SET
        employment_type = ?, bank_name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      ['part_time', 'Updated Bank', 'inactive', employeeId]
    );
    
    console.log('✅ Employee updated successfully');
    
    // Test password change
    console.log('\n🔑 Testing password change...');
    const newHashedPassword = await bcrypt.hash('newpassword123', 10);
    await pool.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHashedPassword, userId]
    );
    
    console.log('✅ Password changed successfully');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await pool.query('DELETE FROM employees WHERE id = ?', [employeeId]);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! Database schema and operations are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

testEmployeeCreation();
