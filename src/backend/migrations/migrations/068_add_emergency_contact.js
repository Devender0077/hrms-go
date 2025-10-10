/**
 * Migration: Add Emergency Contact Fields to Employees Table
 * Purpose: Store emergency contact information for employees
 */

exports.up = async function(connection) {
  try {
    console.log('🔄 Adding emergency contact fields to employees table...');
    
    // Check if emergency_contact_name column exists
    const [nameColumn] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'employees' 
      AND COLUMN_NAME = 'emergency_contact_name'
    `);
    
    if (nameColumn.length === 0) {
      await connection.execute(`
        ALTER TABLE employees 
        ADD COLUMN emergency_contact_name VARCHAR(255) NULL COMMENT 'Emergency contact person name',
        ADD COLUMN emergency_contact_relationship VARCHAR(100) NULL COMMENT 'Relationship to employee',
        ADD COLUMN emergency_contact_phone VARCHAR(20) NULL COMMENT 'Emergency contact phone number',
        ADD COLUMN emergency_contact_email VARCHAR(255) NULL COMMENT 'Emergency contact email',
        ADD COLUMN emergency_contact_address TEXT NULL COMMENT 'Emergency contact address'
      `);
      console.log('✅ Added emergency contact fields to employees table');
    } else {
      console.log('✅ Emergency contact fields already exist');
    }
    
    console.log('✅ Emergency contact migration completed');
    return true;
  } catch (error) {
    console.error('❌ Error adding emergency contact fields:', error);
    throw error;
  }
};

exports.down = async function(connection) {
  try {
    console.log('🔄 Rolling back emergency contact fields...');
    
    await connection.execute(`
      ALTER TABLE employees 
      DROP COLUMN IF EXISTS emergency_contact_name,
      DROP COLUMN IF EXISTS emergency_contact_relationship,
      DROP COLUMN IF EXISTS emergency_contact_phone,
      DROP COLUMN IF EXISTS emergency_contact_email,
      DROP COLUMN IF EXISTS emergency_contact_address
    `);
    
    console.log('✅ Rollback completed');
    return true;
  } catch (error) {
    console.error('❌ Error in rollback:', error);
    throw error;
  }
};

