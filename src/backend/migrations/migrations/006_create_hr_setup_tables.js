/**
 * Migration: 006_create_hr_setup_tables
 * Creates all HR setup configuration tables
 */

async function up(connection) {
  console.log('📝 Creating HR setup tables...');

  const hrSetupTables = [
    {
      name: 'document_types',
      sql: `
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
        )`
    },
    {
      name: 'payslip_types',
      sql: `
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
        )`
    },
    {
      name: 'allowance_options',
      sql: `
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
        )`
    },
    {
      name: 'loan_options',
      sql: `
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
        )`
    },
    {
      name: 'deduction_options',
      sql: `
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
        )`
    },
    {
      name: 'goal_types',
      sql: `
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
        )`
    },
    {
      name: 'competencies',
      sql: `
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
        )`
    },
    {
      name: 'performance_types',
      sql: `
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
        )`
    },
    {
      name: 'training_types',
      sql: `
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
        )`
    },
    {
      name: 'job_categories',
      sql: `
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
        )`
    },
    {
      name: 'job_stages',
      sql: `
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
        )`
    },
    {
      name: 'award_types',
      sql: `
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
        )`
    },
    {
      name: 'termination_types',
      sql: `
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
        )`
    },
    {
      name: 'expense_types',
      sql: `
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
        )`
    },
    {
      name: 'income_types',
      sql: `
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
        )`
    },
    {
      name: 'payment_types',
      sql: `
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
        )`
    },
    {
      name: 'contract_types',
      sql: `
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
    }
  ];

  for (const table of hrSetupTables) {
    await connection.query(table.sql);
    console.log(`✅ ${table.name} table created`);
  }

  console.log('✅ All HR setup tables created');
}

async function down(connection) {
  console.log('🔄 Dropping HR setup tables...');
  
  const hrSetupTables = [
    'contract_types', 'payment_types', 'income_types', 'expense_types',
    'termination_types', 'award_types', 'job_stages', 'job_categories',
    'training_types', 'performance_types', 'competencies', 'goal_types',
    'deduction_options', 'loan_options', 'allowance_options', 'payslip_types',
    'document_types'
  ];

  for (const tableName of hrSetupTables) {
    await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
  }
  
  console.log('✅ HR setup tables dropped');
}

module.exports = { up, down };
