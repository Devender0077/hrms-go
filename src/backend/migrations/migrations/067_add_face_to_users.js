/**
 * Migration: Add Face Recognition to Users Table
 * Problem: Management users (super_admin, company_admin) can't use face login
 * Solution: Add face_descriptor column to users table
 * 
 * Why?
 * - users table: Management (may not be in employees table)
 * - employees table: Regular employees (already has face_descriptor)
 * - Both need face recognition support
 */

exports.up = async function(connection) {
  try {
    console.log('🔄 Adding face_descriptor to users table...');
    
    // Check if face_descriptor column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'face_descriptor'
    `);
    
    if (columns.length === 0) {
      // Add face_descriptor column to users table
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN face_descriptor JSON NULL 
        COMMENT 'Face descriptor (128 floats) for face recognition - encrypted'
      `);
      console.log('✅ Added face_descriptor column to users table');
    } else {
      console.log('✅ face_descriptor column already exists in users table');
    }
    
    console.log('✅ Users table face recognition migration completed');
    return true;
  } catch (error) {
    console.error('❌ Error adding face_descriptor to users table:', error);
    throw error;
  }
};

exports.down = async function(connection) {
  try {
    console.log('🔄 Rolling back users face_descriptor...');
    
    // Check if column exists before dropping
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'face_descriptor'
    `);
    
    if (columns.length > 0) {
      await connection.execute(`
        ALTER TABLE users DROP COLUMN face_descriptor
      `);
      console.log('✅ Removed face_descriptor from users table');
    }
    
    console.log('✅ Rollback completed');
    return true;
  } catch (error) {
    console.error('❌ Error in rollback:', error);
    throw error;
  }
};

