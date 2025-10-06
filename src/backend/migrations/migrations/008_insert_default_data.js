/**
 * Migration: 008_insert_default_data
 * Inserts default company and test users
 */

const bcrypt = require('bcrypt');

async function up(connection) {
  console.log('📝 Inserting default data...');

  // Insert default company
  try {
    await connection.query(`
      INSERT IGNORE INTO companies (id, name, legal_name, email, phone, address, city, state, country, zip_code)
      VALUES (1, 'HRMS Company', 'HRMS Company Ltd.', 'admin@hrms.com', '+1-555-0123', '123 Business St', 'Business City', 'Business State', 'Business Country', '12345')
    `);
    console.log('✅ Default company inserted');
  } catch (error) {
    console.log('ℹ️ Default company already exists');
  }

  // Insert default admin user
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    await connection.query(`
      INSERT IGNORE INTO users (id, name, email, password, role, status, first_name, last_name, username)
      VALUES (1, 'Admin User', 'admin@example.com', ?, 'super_admin', 'active', 'Admin', 'User', 'admin')
    `, [hashedPassword]);
    console.log('✅ Default admin user inserted');
  } catch (error) {
    console.log('ℹ️ Default admin user already exists');
  }

  // Insert default employee user
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    await connection.query(`
      INSERT IGNORE INTO users (id, name, email, password, role, status, first_name, last_name, username)
      VALUES (2, 'Employee User', 'employee@example.com', ?, 'employee', 'active', 'Employee', 'User', 'employee')
    `, [hashedPassword]);
    console.log('✅ Default employee user inserted');
  } catch (error) {
    console.log('ℹ️ Default employee user already exists');
  }

  // Insert default employee record
  try {
    await connection.query(`
      INSERT IGNORE INTO employees (id, user_id, company_id, employee_id, first_name, last_name, email, phone, joining_date, status)
      VALUES (1, 2, 1, 'EMP001', 'Employee', 'User', 'employee@example.com', '+1-555-0124', CURDATE(), 'active')
    `);
    console.log('✅ Default employee record inserted');
  } catch (error) {
    console.log('ℹ️ Default employee record already exists');
  }

  console.log('✅ Default data insertion completed');
}

async function down(connection) {
  console.log('🔄 Removing default data...');
  
  await connection.query('DELETE FROM employees WHERE id = 1');
  await connection.query('DELETE FROM users WHERE id IN (1, 2)');
  await connection.query('DELETE FROM companies WHERE id = 1');
  
  console.log('✅ Default data removed');
}

module.exports = { up, down };
