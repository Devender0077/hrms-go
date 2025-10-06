const mysql = require('mysql2/promise');

async function resetDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hrmgo_hero'
    });

    console.log('🗑️ Starting database reset...');

    // Get all table names
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (tableNames.length === 0) {
      console.log('📋 No tables found in database');
    } else {
      console.log(`📋 Found ${tableNames.length} tables to delete:`);
      tableNames.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table}`);
      });

      // Disable foreign key checks
      console.log('🔧 Disabling foreign key checks...');
      await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

      // Drop all tables
      console.log('🗑️ Dropping all tables...');
      for (const tableName of tableNames) {
        try {
          await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
          console.log(`  ✅ Dropped table: ${tableName}`);
        } catch (error) {
          console.log(`  ❌ Failed to drop table ${tableName}: ${error.message}`);
        }
      }

      // Re-enable foreign key checks
      console.log('🔧 Re-enabling foreign key checks...');
      await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    }

    // Reset migration status
    console.log('🔄 Resetting migration status...');
    try {
      await connection.execute('DROP TABLE IF EXISTS migrations');
      console.log('  ✅ Dropped migrations table');
    } catch (error) {
      console.log('  ℹ️ No migrations table to drop');
    }

    console.log('\n🎉 Database reset completed successfully!');
    console.log('📋 Next steps:');
    console.log('  1. Run migrations: node migration-manager.js up');
    console.log('  2. Check table count: node check-database-tables.js');

  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();
