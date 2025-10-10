const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_hero',
  port: process.env.DB_PORT || 3306
};

async function fixDatabaseIssues() {
  let connection;
  try {
    console.log('🔧 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    // 1. Check users table for employees
    console.log('\n📊 Checking users table for employee records...');
    const [employeeUsers] = await connection.query(`
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, 
             e.id as employee_id
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.id
      WHERE u.role IN ('employee', 'manager', 'hr_manager')
    `);
    
    console.log(`Found ${employeeUsers.length} users with employee-related roles:`);
    employeeUsers.forEach(user => {
      console.log(`  - ID:${user.id}, Email:${user.email}, Role:${user.role}, Has Employee Record: ${!!user.employee_id}`);
    });
    
    // 2. Check for duplicate user entries (users who should only be in employees table)
    console.log('\n🔍 Checking for users who should only be employees...');
    const [regularEmployees] = await connection.query(`
      SELECT u.id, u.email, u.role
      FROM users u
      INNER JOIN employees e ON e.user_id = u.id
      WHERE u.role = 'employee'
      AND u.role NOT IN ('super_admin', 'company_admin', 'hr_manager', 'manager', 'admin')
    `);
    
    if (regularEmployees.length > 0) {
      console.log(`⚠️  Found ${regularEmployees.length} regular employees in users table (should be auth only):`);
      regularEmployees.forEach(user => {
        console.log(`  - ID:${user.id}, Email:${user.email}, Role:${user.role}`);
      });
    }
    
    // 3. Verify permissions count
    console.log('\n📋 Checking permissions...');
    const [permissions] = await connection.query('SELECT COUNT(*) as total FROM permissions');
    console.log(`Total permissions in database: ${permissions[0].total}`);
    
    if (permissions[0].total < 255) {
      console.log(`⚠️  Expected 255 permissions, found ${permissions[0].total}. Missing ${255 - permissions[0].total} permissions.`);
    } else {
      console.log('✅ Permissions count is correct!');
    }
    
    // 4. Check audit_logs table structure
    console.log('\n📝 Checking audit_logs table...');
    try {
      const [auditExists] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'audit_logs'
      `);
      
      if (auditExists[0].count > 0) {
        const [auditCount] = await connection.query('SELECT COUNT(*) as total FROM audit_logs');
        console.log(`✅ audit_logs table exists with ${auditCount[0].total} records`);
        
        // Check audit logs structure
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'audit_logs'
        `);
        console.log(`Columns: ${columns.map(c => c.COLUMN_NAME).join(', ')}`);
      } else {
        console.log('⚠️  audit_logs table does not exist. Creating it...');
        await connection.query(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT NULL,
            old_values JSON NULL,
            new_values JSON NULL,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_entity (entity_type, entity_id),
            INDEX idx_created_at (created_at),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ audit_logs table created!');
      }
    } catch (auditError) {
      console.error('Error checking audit_logs:', auditError.message);
    }
    
    // 5. Summary
    console.log('\n📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Database connection: Working`);
    console.log(`📋 Permissions: ${permissions[0].total} total`);
    console.log(`👥 Users with employee roles: ${employeeUsers.length}`);
    console.log(`📝 Audit logs table: ${auditExists[0].count > 0 ? 'Exists' : 'Created'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
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

// Run the fix
fixDatabaseIssues()
  .then(() => {
    console.log('\n🎉 Database check complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });
