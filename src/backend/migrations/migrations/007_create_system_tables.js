/**
 * Migration: 007_create_system_tables
 * Creates system tables (tasks, calendar, settings, audit logs, etc.)
 */

async function up(connection) {
  console.log('📝 Creating system tables...');

  // Tasks Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assigned_to INT,
      assigned_by INT NOT NULL,
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      due_date DATETIME,
      completed_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Tasks table created');

  // Task Comments Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS task_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      user_id INT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Task comments table created');

  // Calendar Events Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      event_type ENUM('meeting', 'holiday', 'training', 'interview', 'other') DEFAULT 'other',
      location VARCHAR(255),
      attendees JSON,
      created_by INT NOT NULL,
      is_all_day BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Calendar events table created');

  // Settings Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL DEFAULT 1,
      category VARCHAR(100) NOT NULL,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT,
      setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
      is_public BOOLEAN DEFAULT FALSE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE KEY unique_company_category_key (company_id, category, setting_key)
    )
  `);
  console.log('✅ Settings table created');

  // Audit Logs Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100),
      entity_id INT,
      old_values TEXT,
      new_values TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      status ENUM('success', 'failed', 'pending') DEFAULT 'success',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('✅ Audit logs table created');

  // Notifications Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Notifications table created');

  // Goals Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS goals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      target_value DECIMAL(15,2),
      current_value DECIMAL(15,2) DEFAULT 0,
      unit VARCHAR(50),
      start_date DATE,
      end_date DATE,
      status ENUM('not_started', 'in_progress', 'completed', 'cancelled') DEFAULT 'not_started',
      progress_percentage DECIMAL(5,2) DEFAULT 0,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Goals table created');

  // Goal Updates Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS goal_updates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      goal_id INT NOT NULL,
      current_value DECIMAL(15,2),
      progress_percentage DECIMAL(5,2),
      notes TEXT,
      updated_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Goal updates table created');

  // Expenses Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      category VARCHAR(100) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      description TEXT,
      receipt_path VARCHAR(255),
      expense_date DATE NOT NULL,
      status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
      approved_by INT,
      approved_at DATETIME,
      paid_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('✅ Expenses table created');

  // Assets Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      asset_code VARCHAR(50),
      category VARCHAR(100),
      purchase_date DATE,
      purchase_cost DECIMAL(15,2),
      warranty_expiry DATE,
      status ENUM('available', 'assigned', 'under_maintenance', 'disposed') DEFAULT 'available',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Assets table created');

  // Asset Assignments Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS asset_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      employee_id INT NOT NULL,
      assigned_date DATE NOT NULL,
      return_date DATE,
      condition_on_assign TEXT,
      condition_on_return TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Asset assignments table created');

  // Insert default settings
  const defaultSettings = [
    { category: 'company', setting_key: 'name', setting_value: 'HRMS Company', setting_type: 'string' },
    { category: 'company', setting_key: 'email', setting_value: 'admin@hrms.com', setting_type: 'string' },
    { category: 'company', setting_key: 'phone', setting_value: '+1-555-0123', setting_type: 'string' },
    { category: 'system', setting_key: 'timezone', setting_value: 'UTC', setting_type: 'string' },
    { category: 'system', setting_key: 'date_format', setting_value: 'YYYY-MM-DD', setting_type: 'string' },
    { category: 'system', setting_key: 'currency', setting_value: 'USD', setting_type: 'string' },
    { category: 'attendance', setting_key: 'working_hours', setting_value: '8', setting_type: 'number' },
    { category: 'attendance', setting_key: 'grace_period', setting_value: '15', setting_type: 'number' }
  ];

  for (const setting of defaultSettings) {
    try {
      await connection.query(`
        INSERT IGNORE INTO settings (company_id, category, setting_key, setting_value, setting_type)
        VALUES (1, ?, ?, ?, ?)
      `, [setting.category, setting.setting_key, setting.setting_value, setting.setting_type]);
    } catch (error) {
      // Setting already exists
    }
  }
  console.log('✅ Default settings inserted');
}

async function down(connection) {
  console.log('🔄 Dropping system tables...');
  
  await connection.query('DROP TABLE IF EXISTS asset_assignments');
  await connection.query('DROP TABLE IF EXISTS assets');
  await connection.query('DROP TABLE IF EXISTS expenses');
  await connection.query('DROP TABLE IF EXISTS goal_updates');
  await connection.query('DROP TABLE IF EXISTS goals');
  await connection.query('DROP TABLE IF EXISTS notifications');
  await connection.query('DROP TABLE IF EXISTS audit_logs');
  await connection.query('DROP TABLE IF EXISTS settings');
  await connection.query('DROP TABLE IF EXISTS calendar_events');
  await connection.query('DROP TABLE IF EXISTS task_comments');
  await connection.query('DROP TABLE IF EXISTS tasks');
  
  console.log('✅ System tables dropped');
}

module.exports = { up, down };
