/**
 * Migration: Add country column to leave_holidays table
 * This allows filtering holidays by country (India, USA, etc.)
 */

async function up(connection) {
  console.log('🔧 Adding country column to leave_holidays table...');

  try {
    // Check if country column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM leave_holidays LIKE 'country'"
    );

    if (columns.length === 0) {
      // Add country column
      await connection.query(`
        ALTER TABLE leave_holidays 
        ADD COLUMN country VARCHAR(50) DEFAULT 'Global' AFTER type
      `);
      console.log('✅ Country column added to leave_holidays table');

      // Add index for better query performance
      await connection.query(`
        ALTER TABLE leave_holidays 
        ADD INDEX idx_country (country)
      `);
      console.log('✅ Index added for country column');
    } else {
      console.log('ℹ️  Country column already exists, skipping...');
    }
  } catch (error) {
    console.error('❌ Error adding country column:', error);
    throw error;
  }
}

async function down(connection) {
  console.log('⏪ Removing country column from leave_holidays table...');

  try {
    // Remove index first
    await connection.query(`
      ALTER TABLE leave_holidays 
      DROP INDEX IF EXISTS idx_country
    `);

    // Remove country column
    await connection.query(`
      ALTER TABLE leave_holidays 
      DROP COLUMN IF EXISTS country
    `);
    console.log('✅ Country column removed from leave_holidays table');
  } catch (error) {
    console.error('❌ Error removing country column:', error);
    throw error;
  }
}

module.exports = { up, down };
