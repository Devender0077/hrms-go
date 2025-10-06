/**
 * Schema Loader
 * Loads modular schema files in the correct order
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

class SchemaLoader {
  constructor() {
    this.connection = null;
    this.schemasPath = path.join(__dirname, 'schemas');
  }

  async connect() {
    this.connection = await mysql.createConnection(dbConfig);
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async getSchemaFiles() {
    try {
      const files = await fs.readdir(this.schemasPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Natural sort order (01_, 02_, etc.)
    } catch (error) {
      console.error('Error reading schema files:', error);
      return [];
    }
  }

  async loadSchemaFile(schemaFile) {
    const schemaPath = path.join(this.schemasPath, schemaFile);
    const sql = await fs.readFile(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await this.connection.query(statement);
        } catch (error) {
          console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
          console.error(error.message);
          throw error;
        }
      }
    }
  }

  async loadAllSchemas() {
    try {
      await this.connect();
      
      const schemaFiles = await this.getSchemaFiles();
      
      if (schemaFiles.length === 0) {
        console.log('No schema files found');
        return;
      }
      
      console.log(`🔄 Loading ${schemaFiles.length} schema files...`);
      
      for (const schemaFile of schemaFiles) {
        console.log(`📝 Loading ${schemaFile}...`);
        await this.loadSchemaFile(schemaFile);
        console.log(`✅ ${schemaFile} loaded successfully`);
      }
      
      console.log('🎉 All schemas loaded successfully!');
      
    } catch (error) {
      console.error('❌ Schema loading failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async loadSpecificSchema(schemaName) {
    try {
      await this.connect();
      
      if (schemaName === 'all') {
        // Load all schema files in order
        const files = await fs.readdir(this.schemasPath);
        const schemaFiles = files.filter(file => file.endsWith('.sql') && file !== 'all.sql');
        schemaFiles.sort(); // Ensure they load in order
        
        console.log(`📝 Loading ${schemaFiles.length} schema files...`);
        
        for (const schemaFile of schemaFiles) {
          console.log(`📝 Loading ${schemaFile}...`);
          
          try {
            await this.loadSchemaFile(schemaFile);
            console.log(`✅ ${schemaFile} loaded successfully`);
          } catch (error) {
            console.error(`❌ Failed to load ${schemaFile}:`, error.message);
            throw error;
          }
        }
        
        console.log(`🎉 All ${schemaFiles.length} schema files loaded successfully!`);
        return;
      }
      
      const schemaFile = `${schemaName}.sql`;
      console.log(`📝 Loading ${schemaFile}...`);
      
      await this.loadSchemaFile(schemaFile);
      console.log(`✅ ${schemaFile} loaded successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to load ${schemaName}:`, error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const schemaName = process.argv[3];
  
  const loader = new SchemaLoader();
  
  switch (command) {
    case 'all':
      loader.loadAllSchemas().catch(console.error);
      break;
    case 'load':
      if (!schemaName) {
        console.error('Please specify schema name: node load-schemas.js load <schema-name>');
        process.exit(1);
      }
      loader.loadSpecificSchema(schemaName).catch(console.error);
      break;
    default:
      console.log('Usage:');
      console.log('  node load-schemas.js all                    - Load all schema files');
      console.log('  node load-schemas.js load <schema-name>     - Load specific schema file');
      break;
  }
}

export default SchemaLoader;
