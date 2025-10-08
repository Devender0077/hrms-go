const migration = {
  up: async (pool) => {
    try {
      // Create weekend_configs table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS weekend_configs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday',
          is_active BOOLEAN DEFAULT true,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_day_of_week (day_of_week)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Insert default weekend configurations (Saturday and Sunday)
      await pool.query(`
        INSERT IGNORE INTO weekend_configs 
        (name, day_of_week, is_active, description) 
        VALUES 
        ('Saturday', 6, true, 'Saturday weekend'),
        ('Sunday', 0, true, 'Sunday weekend');
      `);

      console.log('✅ Weekend configs table created successfully');
    } catch (error) {
      console.error('❌ Error creating weekend configs table:', error);
      throw error;
    }
  },

  down: async (pool) => {
    try {
      await pool.query('DROP TABLE IF EXISTS weekend_configs');
      console.log('✅ Weekend configs table dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping weekend configs table:', error);
      throw error;
    }
  }
};

module.exports = migration;
