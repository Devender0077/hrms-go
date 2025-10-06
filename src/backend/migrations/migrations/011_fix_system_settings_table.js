export const up = async (connection) => {
  try {
    console.log('Running migration: Fix system_settings table structure...');
    
    // Check if system_settings table exists, create it if it doesn't
    const [tables] = await connection.execute("SHOW TABLES LIKE 'system_settings'");
    if (tables.length === 0) {
      console.log('Creating system_settings table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          setting_key VARCHAR(255) NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_company_key (company_id, setting_key)
        )
      `);
      console.log('✅ Created system_settings table');
    } else {
      console.log('✅ system_settings table already exists');
    }
    
    // First, remove duplicate entries, keeping the latest one
    console.log('Cleaning up duplicate entries...');
    await connection.execute(`
      DELETE s1 FROM system_settings s1
      INNER JOIN system_settings s2 
      WHERE s1.id < s2.id 
      AND s1.company_id = s2.company_id 
      AND s1.setting_key = s2.setting_key
    `);
    
    console.log('✅ Cleaned up duplicate entries');
    
    // Add unique constraint to system_settings table (if it doesn't exist)
    try {
      await connection.execute(`
        ALTER TABLE system_settings 
        ADD UNIQUE KEY unique_company_setting (company_id, setting_key)
      `);
      console.log('✅ Added unique constraint to system_settings table');
    } catch (constraintError) {
      if (constraintError.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Unique constraint already exists');
      } else {
        throw constraintError;
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Remove unique constraint from system_settings table...');
    
    // Remove unique constraint
    await connection.execute(`
      ALTER TABLE system_settings 
      DROP INDEX unique_company_setting
    `);
    
    console.log('✅ Removed unique constraint from system_settings table');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};
