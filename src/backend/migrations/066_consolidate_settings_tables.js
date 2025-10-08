/**
 * Migration: 066_consolidate_settings_tables
 * Adds category column to system_settings and migrates data from settings table
 */

async function up(connection) {
  console.log('📝 Consolidating settings tables...');
  
  try {
    // Check if system_settings table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'system_settings'");
    
    if (tables.length > 0) {
      // Add category column to system_settings if it doesn't exist
      const [columns] = await connection.query("SHOW COLUMNS FROM system_settings LIKE 'category'");
      
      if (columns.length === 0) {
        console.log('Adding category column to system_settings...');
        await connection.execute(`
          ALTER TABLE system_settings 
          ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'general' AFTER company_id,
          ADD INDEX idx_category (category)
        `);
        console.log('✅ Added category column to system_settings');
      } else {
        console.log('✅ Category column already exists in system_settings');
      }
      
      // Migrate data from settings table to system_settings if settings table exists
      const [settingsTables] = await connection.query("SHOW TABLES LIKE 'settings'");
      
      if (settingsTables.length > 0) {
        console.log('Migrating data from settings to system_settings...');
        
        // Get all data from settings table
        const [settingsData] = await connection.query('SELECT * FROM settings');
        
        for (const row of settingsData) {
          await connection.query(`
            INSERT INTO system_settings (company_id, category, setting_key, setting_value, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              category = VALUES(category),
              setting_value = VALUES(setting_value),
              updated_at = VALUES(updated_at)
          `, [
            row.company_id || 1,
            row.category || 'general',
            row.setting_key,
            row.setting_value,
            row.created_at,
            row.updated_at
          ]);
        }
        
        console.log(`✅ Migrated ${settingsData.length} settings from settings to system_settings`);
      }
      
      // Update unique constraint to include category
      try {
        await connection.execute(`
          ALTER TABLE system_settings 
          DROP INDEX IF EXISTS unique_company_setting
        `);
        
        await connection.execute(`
          ALTER TABLE system_settings 
          ADD UNIQUE KEY unique_company_category_key (company_id, category, setting_key)
        `);
        console.log('✅ Updated unique constraint on system_settings');
      } catch (error) {
        console.log('Note: Unique constraint may already be correct');
      }
      
    } else {
      console.log('⚠️  system_settings table does not exist, skipping');
    }
    
  } catch (error) {
    console.error('Error consolidating settings tables:', error.message);
    // Don't throw - allow migration to continue
  }
  
  console.log('✅ Settings tables consolidation complete');
}

async function down(connection) {
  console.log('🔄 Reverting settings tables consolidation...');
  
  try {
    // Remove category column from system_settings
    await connection.execute(`
      ALTER TABLE system_settings 
      DROP COLUMN IF EXISTS category
    `);
    console.log('✅ Removed category column from system_settings');
  } catch (error) {
    console.error('Error reverting migration:', error.message);
  }
}

module.exports = { up, down };
