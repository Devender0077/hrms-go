/**
 * Database Migration Script
 * Adds tables for: Calendar Events, Goals, Reviews, Assets, Expenses, Documents
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
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 Starting migration for new modules...');
    
    // =====================================================
    // CALENDAR EVENTS TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        type ENUM('meeting', 'holiday', 'training', 'interview', 'other') DEFAULT 'other',
        color VARCHAR(20),
        created_by INT,
        visibility ENUM('all', 'department', 'custom') DEFAULT 'all',
        visible_to JSON,
        departments JSON,
        location VARCHAR(255),
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_pattern JSON,
        reminder_minutes INT,
        is_all_day BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created calendar_events table');
    
    // =====================================================
    // GOALS TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        goal_type_id INT,
        target_value DECIMAL(10,2),
        current_value DECIMAL(10,2) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        status ENUM('not_started', 'in_progress', 'completed', 'cancelled') DEFAULT 'not_started',
        progress INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (goal_type_id) REFERENCES goal_types(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created goals table');
    
    // =====================================================
    // GOAL TRACKING TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS goal_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        update_date DATE NOT NULL,
        progress_value DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created goal_tracking table');
    
    // =====================================================
    // PERFORMANCE REVIEWS TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS performance_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        review_period_start DATE,
        review_period_end DATE,
        overall_rating DECIMAL(3,2),
        status ENUM('draft', 'submitted', 'completed') DEFAULT 'draft',
        submitted_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created performance_reviews table');
    
    // =====================================================
    // REVIEW QUESTIONS TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS review_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        rating DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES performance_reviews(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created review_questions table');
    
    // =====================================================
    // ASSETS TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        asset_code VARCHAR(100) UNIQUE,
        category VARCHAR(100),
        serial_number VARCHAR(100),
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        status ENUM('available', 'assigned', 'maintenance', 'retired') DEFAULT 'available',
        \`condition\` ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
        location VARCHAR(255),
        warranty_expires DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created assets table');
    
    // =====================================================
    // ASSET ASSIGNMENTS TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS asset_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_id INT NOT NULL,
        employee_id INT NOT NULL,
        assigned_date DATE NOT NULL,
        return_date DATE,
        assigned_by INT,
        status ENUM('active', 'returned', 'lost', 'damaged') DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created asset_assignments table');
    
    // =====================================================
    // EXPENSES TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        expense_type_id INT,
        amount DECIMAL(10,2) NOT NULL,
        expense_date DATE NOT NULL,
        description TEXT,
        receipt_path VARCHAR(500),
        status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
        approved_by INT,
        approved_at DATETIME,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (expense_type_id) REFERENCES expense_types(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created expenses table');
    
    // =====================================================
    // DOCUMENTS TABLE
    // =====================================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        document_type_id INT,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        uploaded_by INT NOT NULL,
        employee_id INT,
        expiry_date DATE,
        is_confidential BOOLEAN DEFAULT FALSE,
        tags JSON,
        status ENUM('active', 'expired', 'archived') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE SET NULL,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created documents table');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = runMigration;

