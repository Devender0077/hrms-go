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

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to database...');
    
    // Add company_id to attendance_policies
    try {
      await pool.query('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
      console.log('✅ Added company_id to attendance_policies');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ company_id already exists in attendance_policies');
      } else {
        console.log('❌ Error adding company_id to attendance_policies:', e.message);
      }
    }
    
    // Add company_id to attendance_regulations
    try {
      await pool.query('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
      console.log('✅ Added company_id to attendance_regulations');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ company_id already exists in attendance_regulations');
      } else {
        console.log('❌ Error adding company_id to attendance_regulations:', e.message);
      }
    }
    
    // Add employment_type to employees
    try {
      await pool.query('ALTER TABLE employees ADD COLUMN employment_type ENUM("full_time", "part_time", "contract", "intern", "consultant") DEFAULT "full_time"');
      console.log('✅ Added employment_type to employees');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ employment_type already exists in employees');
      } else {
        console.log('❌ Error adding employment_type to employees:', e.message);
      }
    }
    
    // Add attendance_policy_id to employees
    try {
      await pool.query('ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL');
      console.log('✅ Added attendance_policy_id to employees');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ attendance_policy_id already exists in employees');
      } else {
        console.log('❌ Error adding attendance_policy_id to employees:', e.message);
      }
    }
    
    // Add bank information columns to employees
    const bankColumns = [
      { name: 'bank_name', type: 'VARCHAR(255) NULL' },
      { name: 'bank_account_number', type: 'VARCHAR(50) NULL' },
      { name: 'bank_routing_number', type: 'VARCHAR(50) NULL' },
      { name: 'bank_swift_code', type: 'VARCHAR(20) NULL' },
      { name: 'bank_address', type: 'TEXT NULL' }
    ];
    
    for (const col of bankColumns) {
      try {
        await pool.query(`ALTER TABLE employees ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added ${col.name} to employees`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`ℹ️ ${col.name} already exists in employees`);
        } else {
          console.log(`❌ Error adding ${col.name} to employees:`, e.message);
        }
      }
    }
    
    console.log('🎉 Database schema update completed!');
  } catch (error) {
    console.error('❌ Error updating database schema:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingColumns();
