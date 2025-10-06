export const up = async (connection) => {
  try {
    console.log('Running migration: Create seo_settings table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seo_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        keywords TEXT,
        meta_tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    
    console.log('✅ seo_settings table created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (connection) => {
  try {
    console.log('Rolling back: Drop seo_settings table...');
    
    await connection.execute(`DROP TABLE IF EXISTS seo_settings`);
    
    console.log('✅ seo_settings table dropped');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};