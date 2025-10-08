/**
 * Cleanup Unused Settings Tables
 * Removes unused settings tables after verification
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_hero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function cleanupTables() {
  try {
    console.log('🧹 Cleaning up unused settings tables...\n');
    
    const tablesToDrop = [
      'cache_settings',
      'seo_settings',
      'chatgpt_settings',
      'cookie_consent_settings'
    ];
    
    for (const table of tablesToDrop) {
      try {
        // Check if table exists
        const [tables] = await pool.query(`SHOW TABLES LIKE '${table}'`);
        
        if (tables.length > 0) {
          // Check if table has data
          const [count] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
          const recordCount = count[0].count;
          
          console.log(`📋 Table: ${table}`);
          console.log(`   Records: ${recordCount}`);
          
          if (recordCount === 0) {
            await pool.query(`DROP TABLE IF EXISTS ${table}`);
            console.log(`   ✅ Dropped (empty table)\n`);
          } else {
            console.log(`   ⚠️  Skipped (has ${recordCount} records)\n`);
          }
        } else {
          console.log(`📋 Table: ${table}`);
          console.log(`   ℹ️  Does not exist\n`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${table}:`, error.message);
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Cleanup complete!\n');
    
    // Show remaining settings tables
    const [remainingTables] = await pool.query("SHOW TABLES LIKE '%settings%'");
    console.log('📊 Remaining settings tables:');
    remainingTables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupTables();
}

module.exports = { cleanupTables };
