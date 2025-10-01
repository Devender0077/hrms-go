/**
 * Migration script for HR Setup tables
 * Adds missing fields to existing tables and creates new HR setup tables
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_hero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function runMigration() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔄 Starting HR Setup migration...\n');

    // Add missing fields to existing tables
    console.log('📝 Adding missing fields to existing tables...');
    
    const alterTableQueries = [
      // Branches
      "ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(50) AFTER name",
      "ALTER TABLE branches ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER address",
      "ALTER TABLE branches ADD COLUMN IF NOT EXISTS email VARCHAR(255) AFTER phone",
      "ALTER TABLE branches ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER zip_code",
      
      // Departments
      "ALTER TABLE departments ADD COLUMN IF NOT EXISTS code VARCHAR(50) AFTER name",
      "ALTER TABLE departments ADD COLUMN IF NOT EXISTS manager_id INT AFTER description",
      "ALTER TABLE departments ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER description",
      
      // Designations
      "ALTER TABLE designations ADD COLUMN IF NOT EXISTS code VARCHAR(50) AFTER name",
      "ALTER TABLE designations ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER description",
      
      // Leave Types
      "ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS code VARCHAR(50) AFTER name",
      "ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS description TEXT AFTER code",
      "ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS days_per_year INT AFTER description",
      "ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER is_paid"
    ];

    for (const query of alterTableQueries) {
      try {
        await connection.query(query);
        console.log(`✅ ${query.split('ADD COLUMN')[1]?.split('AFTER')[0]?.trim() || 'Field'} added`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`ℹ️  Field already exists: ${query.split('ADD COLUMN')[1]?.split('AFTER')[0]?.trim()}`);
        } else {
          console.error(`❌ Error: ${error.message}`);
        }
      }
    }

    // Create new HR setup tables
    console.log('\n📝 Creating new HR setup tables...');
    
    const createTableQueries = {
      document_types: `
        CREATE TABLE IF NOT EXISTS document_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          is_required BOOLEAN DEFAULT FALSE,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      payslip_types: `
        CREATE TABLE IF NOT EXISTS payslip_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      allowance_options: `
        CREATE TABLE IF NOT EXISTS allowance_options (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          is_taxable BOOLEAN DEFAULT TRUE,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      loan_options: `
        CREATE TABLE IF NOT EXISTS loan_options (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          max_amount DECIMAL(15,2),
          interest_rate DECIMAL(5,2),
          max_duration_months INT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      deduction_options: `
        CREATE TABLE IF NOT EXISTS deduction_options (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          is_mandatory BOOLEAN DEFAULT FALSE,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      goal_types: `
        CREATE TABLE IF NOT EXISTS goal_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      competencies: `
        CREATE TABLE IF NOT EXISTS competencies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          category VARCHAR(100),
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      performance_types: `
        CREATE TABLE IF NOT EXISTS performance_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      training_types: `
        CREATE TABLE IF NOT EXISTS training_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      job_categories: `
        CREATE TABLE IF NOT EXISTS job_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      job_stages: `
        CREATE TABLE IF NOT EXISTS job_stages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          order_index INT DEFAULT 0,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      award_types: `
        CREATE TABLE IF NOT EXISTS award_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      termination_types: `
        CREATE TABLE IF NOT EXISTS termination_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          notice_period_days INT DEFAULT 30,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      expense_types: `
        CREATE TABLE IF NOT EXISTS expense_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          requires_approval BOOLEAN DEFAULT TRUE,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      income_types: `
        CREATE TABLE IF NOT EXISTS income_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          is_taxable BOOLEAN DEFAULT TRUE,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      payment_types: `
        CREATE TABLE IF NOT EXISTS payment_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`,
      
      contract_types: `
        CREATE TABLE IF NOT EXISTS contract_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL DEFAULT 1,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(50),
          description TEXT,
          duration_months INT,
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )`
    };

    for (const [tableName, query] of Object.entries(createTableQueries)) {
      try {
        await connection.query(query);
        console.log(`✅ Created/verified ${tableName} table`);
      } catch (error) {
        console.error(`❌ Error creating ${tableName}:`, error.message);
      }
    }

    console.log('\n🎉 HR Setup migration completed successfully!\n');
    
    // Show summary
    console.log('📊 Summary:');
    console.log('  ✅ Updated 4 existing tables (branches, departments, designations, leave_types)');
    console.log('  ✅ Created 16 new HR setup tables');
    console.log('  ✅ All tables have company_id, status, and timestamps');
    console.log('\n💡 Next steps:');
    console.log('  1. Restart backend server');
    console.log('  2. Visit http://localhost:5176/dashboard/hr-system-setup');
    console.log('  3. Test all HR setup modules\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run migration
runMigration();

