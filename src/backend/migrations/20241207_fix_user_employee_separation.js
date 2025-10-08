/**
 * Migration: 20241207_fix_user_employee_separation
 * Fixes the separation between users (system access) and employees (company workers)
 * Creates employee records for existing users who don't have them
 */

async function up(connection) {
  console.log('🔧 Fixing user-employee separation...');

  // First, let's check if we have users without employee records
  const [usersWithoutEmployees] = await connection.query(`
    SELECT u.id, u.name, u.email, u.first_name, u.last_name, u.phone, u.role
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    WHERE e.id IS NULL AND u.role != 'super_admin'
  `);

  console.log(`Found ${usersWithoutEmployees.length} users without employee records`);

  // Create employee records for users who don't have them
  for (const user of usersWithoutEmployees) {
    try {
      // Generate employee ID
      const employeeId = `EMP${String(user.id).padStart(4, '0')}`;
      
      // Create employee record
      await connection.query(`
        INSERT INTO employees (
          user_id, company_id, employee_id, first_name, last_name, email, phone, 
          status, employment_type, created_at, updated_at
        ) VALUES (?, 1, ?, ?, ?, ?, ?, 'active', 'full_time', NOW(), NOW())
      `, [
        user.id,
        employeeId,
        user.first_name || user.name?.split(' ')[0] || 'Unknown',
        user.last_name || user.name?.split(' ').slice(1).join(' ') || 'Employee',
        user.email,
        user.phone
      ]);

      console.log(`✅ Created employee record for user ${user.email} (ID: ${employeeId})`);
    } catch (error) {
      console.error(`❌ Error creating employee record for user ${user.email}:`, error.message);
    }
  }

  // Update attendance table to use employee IDs instead of user IDs
  console.log('🔄 Updating attendance records to use employee IDs...');
  
  const [attendanceRecords] = await connection.query(`
    SELECT a.id, a.employee_id, e.id as correct_employee_id
    FROM attendance a
    JOIN users u ON a.employee_id = u.id
    JOIN employees e ON u.id = e.user_id
    WHERE a.employee_id != e.id
  `);

  console.log(`Found ${attendanceRecords.length} attendance records to update`);

  for (const record of attendanceRecords) {
    try {
      await connection.query(`
        UPDATE attendance 
        SET employee_id = ? 
        WHERE id = ?
      `, [record.correct_employee_id, record.id]);

      console.log(`✅ Updated attendance record ${record.id}`);
    } catch (error) {
      console.error(`❌ Error updating attendance record ${record.id}:`, error.message);
    }
  }

  console.log('✅ User-employee separation fix completed');
}

async function down(connection) {
  console.log('🔄 Reverting user-employee separation...');
  
  // This migration is not easily reversible as it creates new data
  // In a production environment, you would need to implement proper rollback logic
  console.log('⚠️  This migration cannot be safely reverted');
}

module.exports = { up, down };
