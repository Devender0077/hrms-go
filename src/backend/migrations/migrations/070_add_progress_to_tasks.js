/**
 * Migration: 070_add_progress_to_tasks
 * Adds progress field to tasks table
 */

async function up(connection) {
  console.log('📝 Adding progress field to tasks table...');

  // Check if progress column already exists
  const [columns] = await connection.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'tasks' 
    AND COLUMN_NAME = 'progress'
  `);

  if (columns.length === 0) {
    await connection.query(`
      ALTER TABLE tasks 
      ADD COLUMN progress DECIMAL(5,2) DEFAULT 0 COMMENT 'Task completion percentage (0-100)'
      AFTER status
    `);
    console.log('✅ Progress field added to tasks table');
  } else {
    console.log('ℹ️  Progress field already exists in tasks table');
  }
}

async function down(connection) {
  console.log('📝 Removing progress field from tasks table...');

  // Check if progress column exists
  const [columns] = await connection.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'tasks' 
    AND COLUMN_NAME = 'progress'
  `);

  if (columns.length > 0) {
    await connection.query(`
      ALTER TABLE tasks 
      DROP COLUMN progress
    `);
    console.log('✅ Progress field removed from tasks table');
  } else {
    console.log('ℹ️  Progress field does not exist in tasks table');
  }
}

module.exports = { up, down };

