/**
 * Fix Migrations Table Structure
 * Ensures consistent migration tracking across all installations
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixMigrationsTable() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hrmgo_hero'
    });

    console.log('✅ Connected to database');

    // Check if migrations table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'migrations'"
    );

    if (tables.length === 0) {
      console.log('ℹ️  Migrations table does not exist, creating...');
      await connection.query(`
        CREATE TABLE migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INT DEFAULT NULL,
          status ENUM('success', 'failed') DEFAULT 'success',
          error_message TEXT DEFAULT NULL,
          INDEX idx_migration_name (migration_name),
          INDEX idx_executed_at (executed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Migrations table created successfully');
      return;
    }

    // Check current structure
    const [columns] = await connection.query(
      "DESCRIBE migrations"
    );

    const columnNames = columns.map(col => col.Field);
    console.log('ℹ️  Current columns:', columnNames.join(', '));

    // Check if we need to rename 'name' to 'migration_name'
    if (columnNames.includes('name') && !columnNames.includes('migration_name')) {
      console.log('🔧 Renaming column "name" to "migration_name"...');
      await connection.query(`
        ALTER TABLE migrations 
        CHANGE COLUMN name migration_name VARCHAR(255) NOT NULL UNIQUE
      `);
      console.log('✅ Column renamed successfully');
    }

    // Ensure migration_name column exists and is unique
    if (!columnNames.includes('migration_name')) {
      console.log('❌ ERROR: migrations table is missing migration_name column!');
      console.log('🔧 Recreating migrations table...');
      
      // Backup existing data
      const [existingMigrations] = await connection.query('SELECT * FROM migrations');
      
      // Drop and recreate table
      await connection.query('DROP TABLE IF EXISTS migrations');
      await connection.query(`
        CREATE TABLE migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INT DEFAULT NULL,
          status ENUM('success', 'failed') DEFAULT 'success',
          error_message TEXT DEFAULT NULL,
          INDEX idx_migration_name (migration_name),
          INDEX idx_executed_at (executed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Restore data if any
      if (existingMigrations.length > 0) {
        console.log(`🔄 Restoring ${existingMigrations.length} migration records...`);
        for (const migration of existingMigrations) {
          const migrationName = migration.name || migration.migration_name;
          if (migrationName) {
            await connection.query(
              'INSERT IGNORE INTO migrations (migration_name, executed_at) VALUES (?, ?)',
              [migrationName, migration.executed_at]
            );
          }
        }
      }
      
      console.log('✅ Migrations table recreated successfully');
    }

    console.log('✅ Migrations table structure is correct');

  } catch (error) {
    console.error('❌ Error fixing migrations table:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixMigrationsTable()
  .then(() => {
    console.log('\n✅ Migrations table fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to fix migrations table:', error);
    process.exit(1);
  });

