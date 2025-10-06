export const up = async (connection) => {
  try {
    console.log('Running migration: Fix employee table columns and system_settings...');
    
    // Add missing columns to employees table
    await connection.execute(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS shift_id INT NULL,
      ADD COLUMN IF NOT EXISTS face_data TEXT NULL,
      ADD COLUMN IF NOT EXISTS face_descriptor JSON NULL
    `);
    console.log('✅ Added missing columns to employees table');
    
    // Create system_settings table if it doesn't exist
    const [tables] = await connection.execute("SHOW TABLES LIKE 'system_settings'");
    if (tables.length === 0) {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          setting_key VARCHAR(255) NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_company_setting (company_id, setting_key),
          INDEX idx_company_key (company_id, setting_key)
        )
      `);
      console.log('✅ Created system_settings table');
    } else {
      console.log('✅ system_settings table already exists');
    }
    
    // Add foreign key constraint for shift_id if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE employees 
        ADD CONSTRAINT fk_employees_shift 
        FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint for shift_id');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME' || error.message.includes('Duplicate key name')) {
        console.log('✅ Foreign key constraint already exists');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migration completed: Employee columns and system_settings fixed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Remove employee columns and system_settings...');
    
    // Remove foreign key constraint
    try {
      await connection.execute(`
        ALTER TABLE employees 
        DROP FOREIGN KEY fk_employees_shift
      `);
      console.log('✅ Removed foreign key constraint for shift_id');
    } catch (error) {
      console.log('⚠️ Foreign key constraint may not exist');
    }
    
    // Remove columns from employees table
    await connection.execute(`
      ALTER TABLE employees 
      DROP COLUMN IF EXISTS shift_id,
      DROP COLUMN IF EXISTS face_data,
      DROP COLUMN IF EXISTS face_descriptor
    `);
    console.log('✅ Removed columns from employees table');
    
    // Drop system_settings table
    await connection.execute('DROP TABLE IF EXISTS system_settings');
    console.log('✅ Dropped system_settings table');
    
    console.log('✅ Rollback completed: Employee columns and system_settings removed');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};
