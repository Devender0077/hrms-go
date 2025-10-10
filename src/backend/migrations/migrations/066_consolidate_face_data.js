/**
 * Migration: Consolidate Face Data Storage
 * 
 * Problem: employees table has BOTH face_data AND face_descriptor columns
 * Solution: Keep only face_descriptor (JSON), remove face_data (TEXT)
 * 
 * This ensures:
 * - Single source of truth
 * - Consistent data structure
 * - No duplicate columns
 * - Clean database schema
 */

exports.up = async function(connection) {
  try {
    console.log('🔄 Starting face data consolidation migration...');

    // Check if face_data column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'employees' 
      AND COLUMN_NAME = 'face_data'
    `);

    if (columns.length > 0) {
      // Migrate any existing face_data to face_descriptor (directly, no CAST needed in MariaDB)
      await connection.execute(`
        UPDATE employees 
        SET face_descriptor = face_data
        WHERE face_data IS NOT NULL 
        AND face_data != ''
        AND (face_descriptor IS NULL OR JSON_LENGTH(COALESCE(face_descriptor, '{}')) = 0)
      `);
      console.log('✅ Migrated existing face_data to face_descriptor');

      // Drop face_data column (we only need face_descriptor)
      await connection.execute(`
        ALTER TABLE employees 
        DROP COLUMN face_data
      `);
      console.log('✅ Removed duplicate face_data column');
    } else {
      console.log('✅ face_data column already removed or never existed');
    }

    // Ensure face_descriptor column exists and is correct type
    const [descriptorColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'employees' 
      AND COLUMN_NAME = 'face_descriptor'
    `);

    if (descriptorColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE employees 
        ADD COLUMN face_descriptor JSON NULL COMMENT 'Encrypted face descriptor (128 floats) for face recognition'
      `);
      console.log('✅ Added face_descriptor column');
    } else {
      console.log('✅ face_descriptor column already exists');
    }

    console.log('✅ Face data consolidation migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in face data consolidation migration:', error);
    throw error;
  }
};

exports.down = async function(connection) {
  try {
    console.log('🔄 Rolling back face data consolidation...');

    // Add back face_data column
    await connection.execute(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS face_data TEXT NULL
    `);

    console.log('✅ Rollback completed');
    return true;
  } catch (error) {
    console.error('❌ Error in rollback:', error);
    throw error;
  }
};
