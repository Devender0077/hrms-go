/**
 * Migrate Settings Data
 * Migrates all data from system_settings to settings table
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

async function migrateSettings() {
  try {
    console.log('🔄 Migrating settings from system_settings to settings...');
    
    // Get all data from system_settings
    const [systemSettings] = await pool.query('SELECT * FROM system_settings');
    
    console.log(`📊 Found ${systemSettings.length} records in system_settings`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const row of systemSettings) {
      try {
        // Parse setting_key to extract category and key
        let category = 'general';
        let key = row.setting_key;
        
        // Check if it's in dot notation (e.g., "general.siteName")
        if (row.setting_key.includes('.')) {
          const parts = row.setting_key.split('.');
          if (parts.length === 2) {
            category = parts[0];
            key = parts[1];
          }
        } else if (row.setting_key.includes('_')) {
          // Handle underscore format (e.g., "company_name")
          const parts = row.setting_key.split('_');
          if (parts.length >= 2) {
            category = parts[0];
            key = parts.slice(1).join('_');
          }
        }
        
        // Insert into settings table
        await pool.query(
          `INSERT INTO settings (company_id, category, setting_key, setting_value, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             setting_value = VALUES(setting_value),
             updated_at = VALUES(updated_at)`,
          [
            row.company_id || 1,
            category,
            key,
            row.setting_value,
            row.created_at,
            row.updated_at
          ]
        );
        
        migrated++;
        
        if (migrated % 10 === 0) {
          console.log(`✓ Migrated ${migrated}/${systemSettings.length}...`);
        }
      } catch (error) {
        console.error(`Error migrating ${row.setting_key}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration complete!');
    console.log(`📊 Total: ${systemSettings.length}`);
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Show final counts
    const [settingsCount] = await pool.query('SELECT COUNT(*) as count FROM settings');
    console.log(`📊 Settings table now has: ${settingsCount[0].count} records`);
    
  } catch (error) {
    console.error('❌ Error migrating settings:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrateSettings();
}

module.exports = { migrateSettings };
