/**
 * Migration Manager
 * Handles running multiple migration files in proper order
 * Follows industry standards for database migrations
 */

import fs from 'fs/promises';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_hero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

class MigrationManager {
  constructor() {
    this.connection = null;
    this.migrationsPath = path.join(__dirname, 'migrations');
  }

  async connect() {
    this.connection = await mysql.createConnection(dbConfig);
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async createMigrationsTable() {
    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INT,
        status ENUM('success', 'failed') DEFAULT 'success',
        error_message TEXT NULL
      )
    `);
  }

  async getExecutedMigrations() {
    const [rows] = await this.connection.query(
      'SELECT migration_name FROM migrations WHERE status = "success" ORDER BY executed_at'
    );
    return rows.map(row => row.migration_name);
  }

  async markMigrationExecuted(migrationName, executionTime, status = 'success', errorMessage = null) {
    await this.connection.query(`
      INSERT INTO migrations (migration_name, execution_time_ms, status, error_message)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        execution_time_ms = VALUES(execution_time_ms),
        status = VALUES(status),
        error_message = VALUES(error_message),
        executed_at = CURRENT_TIMESTAMP
    `, [migrationName, executionTime, status, errorMessage]);
  }

  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.js') && file !== 'migration-manager.js')
        .sort(); // Natural sort order (001_, 002_, etc.)
    } catch (error) {
      console.error('Error reading migration files:', error);
      return [];
    }
  }

  async runMigration(migrationFile) {
    const startTime = Date.now();
    const migrationName = path.basename(migrationFile, '.js');
    
    try {
      console.log(`🔄 Running migration: ${migrationName}`);
      
      // Import and run the migration
      const migrationPath = path.join(this.migrationsPath, migrationFile);
      const migration = await import(`file://${migrationPath}`);
      
      if (typeof migration.up === 'function') {
        await migration.up(this.connection);
        console.log(`✅ Migration completed: ${migrationName}`);
      } else {
        throw new Error('Migration must export an "up" function');
      }
      
      const executionTime = Date.now() - startTime;
      await this.markMigrationExecuted(migrationName, executionTime);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.markMigrationExecuted(migrationName, executionTime, 'failed', error.message);
      console.error(`❌ Migration failed: ${migrationName}`, error.message);
      throw error;
    }
  }

  async runAllMigrations() {
    try {
      await this.connect();
      await this.createMigrationsTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(path.basename(file, '.js'))
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }
      
      console.log(`🔄 Found ${pendingMigrations.length} pending migrations`);
      
      for (const migrationFile of pendingMigrations) {
        await this.runMigration(migrationFile);
      }
      
      console.log('🎉 All migrations completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration process failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async rollbackMigration(migrationName) {
    try {
      await this.connect();
      
      const migrationFile = `${migrationName}.js`;
      const migrationPath = path.join(this.migrationsPath, migrationFile);
      
      console.log(`🔄 Rolling back migration: ${migrationName}`);
      
      const migration = await import(`file://${migrationPath}`);
      
      if (typeof migration.down === 'function') {
        await migration.down(this.connection);
        console.log(`✅ Migration rolled back: ${migrationName}`);
      } else {
        throw new Error('Migration must export a "down" function for rollback');
      }
      
      // Remove from migrations table
      await this.connection.query('DELETE FROM migrations WHERE migration_name = ?', [migrationName]);
      
    } catch (error) {
      console.error(`❌ Rollback failed: ${migrationName}`, error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async getMigrationStatus() {
    try {
      await this.connect();
      await this.createMigrationsTable();
      
      const [migrations] = await this.connection.query(`
        SELECT migration_name, executed_at, execution_time_ms, status, error_message
        FROM migrations
        ORDER BY executed_at DESC
      `);
      
      const migrationFiles = await this.getMigrationFiles();
      const executedMigrations = migrations.map(m => m.migration_name);
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(path.basename(file, '.js'))
      );
      
      return {
        executed: migrations,
        pending: pendingMigrations,
        total: migrationFiles.length,
        executedCount: migrations.length,
        pendingCount: pendingMigrations.length
      };
      
    } catch (error) {
      console.error('Error getting migration status:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const migrationName = process.argv[3];
  
  const manager = new MigrationManager();
  
  switch (command) {
    case 'up':
      manager.runAllMigrations().catch(console.error);
      break;
    case 'rollback':
      if (!migrationName) {
        console.error('Please specify migration name: npm run migrate:rollback <migration-name>');
        process.exit(1);
      }
      manager.rollbackMigration(migrationName).catch(console.error);
      break;
    case 'status':
      manager.getMigrationStatus()
        .then(status => {
          console.log('\n📊 Migration Status:');
          console.log(`Total migrations: ${status.total}`);
          console.log(`Executed: ${status.executedCount}`);
          console.log(`Pending: ${status.pendingCount}`);
          
          if (status.pending.length > 0) {
            console.log('\n⏳ Pending migrations:');
            status.pending.forEach(migration => console.log(`  - ${migration}`));
          }
          
          if (status.executed.length > 0) {
            console.log('\n✅ Executed migrations:');
            status.executed.forEach(migration => {
              const status = migration.status === 'success' ? '✅' : '❌';
              console.log(`  ${status} ${migration.migration_name} (${migration.execution_time_ms}ms)`);
            });
          }
        })
        .catch(console.error);
      break;
    default:
      console.log('Usage:');
      console.log('  node migration-manager.js up          - Run all pending migrations');
      console.log('  node migration-manager.js rollback    - Rollback a specific migration');
      console.log('  node migration-manager.js status      - Show migration status');
      break;
  }
}

export default MigrationManager;
