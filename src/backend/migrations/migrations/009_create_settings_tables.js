/**
 * Migration: 009_create_settings_tables
 * Creates settings and audit_logs tables
 */

export async function up(connection) {
  console.log('📝 Creating settings tables...');
  
  // Create settings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT,
      setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
      is_public BOOLEAN DEFAULT FALSE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_category_key (category, setting_key)
    );
  `);
  console.log('✅ Settings table created');

  // Create audit_logs table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(255) NOT NULL,
      details TEXT,
      status ENUM('success', 'failure', 'warning') DEFAULT 'success',
      severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
      ip_address VARCHAR(45),
      user_agent TEXT,
      changes JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Audit logs table created');

  // Insert default settings
  const defaultSettings = [
    // General settings
    { category: 'general', setting_key: 'siteName', setting_value: 'HRMS HUI v1', setting_type: 'string', is_public: true, description: 'Site name displayed in the application' },
    { category: 'general', setting_key: 'siteDescription', setting_value: 'Human Resource Management System', setting_type: 'string', is_public: true, description: 'Site description' },
    { category: 'general', setting_key: 'timezone', setting_value: 'UTC', setting_type: 'string', is_public: false, description: 'Default timezone for the application' },
    { category: 'general', setting_key: 'dateFormat', setting_value: 'YYYY-MM-DD', setting_type: 'string', is_public: false, description: 'Default date format' },
    { category: 'general', setting_key: 'timeFormat', setting_value: '24h', setting_type: 'string', is_public: false, description: 'Default time format' },
    
    // Company settings
    { category: 'company', setting_key: 'name', setting_value: 'HRMS Company', setting_type: 'string', is_public: true, description: 'Company name' },
    { category: 'company', setting_key: 'email', setting_value: 'admin@hrms.com', setting_type: 'string', is_public: true, description: 'Company email' },
    { category: 'company', setting_key: 'phone', setting_value: '+1-555-0123', setting_type: 'string', is_public: true, description: 'Company phone' },
    { category: 'company', setting_key: 'address', setting_value: '123 Business St, Business City, BC 12345', setting_type: 'string', is_public: true, description: 'Company address' },
    { category: 'company', setting_key: 'website', setting_value: 'https://hrms.com', setting_type: 'string', is_public: true, description: 'Company website' },
    
    // Security settings
    { category: 'security', setting_key: 'passwordMinLength', setting_value: '8', setting_type: 'number', is_public: false, description: 'Minimum password length' },
    { category: 'security', setting_key: 'passwordRequireUppercase', setting_value: 'true', setting_type: 'boolean', is_public: false, description: 'Require uppercase letters in passwords' },
    { category: 'security', setting_key: 'passwordRequireNumbers', setting_value: 'true', setting_type: 'boolean', is_public: false, description: 'Require numbers in passwords' },
    { category: 'security', setting_key: 'passwordRequireSpecialChars', setting_value: 'false', setting_type: 'boolean', is_public: false, description: 'Require special characters in passwords' },
    { category: 'security', setting_key: 'sessionTimeout', setting_value: '24', setting_type: 'number', is_public: false, description: 'Session timeout in hours' },
    { category: 'security', setting_key: 'maxLoginAttempts', setting_value: '5', setting_type: 'number', is_public: false, description: 'Maximum login attempts before lockout' },
    
    // Email settings
    { category: 'email', setting_key: 'smtpHost', setting_value: '', setting_type: 'string', is_public: false, description: 'SMTP host for email sending' },
    { category: 'email', setting_key: 'smtpPort', setting_value: '587', setting_type: 'number', is_public: false, description: 'SMTP port' },
    { category: 'email', setting_key: 'smtpUsername', setting_value: '', setting_type: 'string', is_public: false, description: 'SMTP username' },
    { category: 'email', setting_key: 'smtpPassword', setting_value: '', setting_type: 'string', is_public: false, description: 'SMTP password' },
    { category: 'email', setting_key: 'smtpEncryption', setting_value: 'tls', setting_type: 'string', is_public: false, description: 'SMTP encryption method' },
    { category: 'email', setting_key: 'fromEmail', setting_value: 'noreply@hrms.com', setting_type: 'string', is_public: false, description: 'Default from email address' },
    { category: 'email', setting_key: 'fromName', setting_value: 'HRMS System', setting_type: 'string', is_public: false, description: 'Default from name' },
    
    // Notification settings
    { category: 'notifications', setting_key: 'emailNotifications', setting_value: 'true', setting_type: 'boolean', is_public: false, description: 'Enable email notifications' },
    { category: 'notifications', setting_key: 'pushNotifications', setting_value: 'true', setting_type: 'boolean', is_public: false, description: 'Enable push notifications' },
    { category: 'notifications', setting_key: 'leaveNotifications', setting_value: 'true', setting_type: 'boolean', is_public: false, description: 'Enable leave-related notifications' },
    { category: 'notifications', setting_key: 'attendanceNotifications', setting_value: 'true', setting_type: 'boolean', is_public: false, description: 'Enable attendance-related notifications' },
    { category: 'notifications', setting_key: 'payrollNotifications', setting_value: 'true', setting_type: 'boolean', is_public: false, description: 'Enable payroll-related notifications' },
    
    // System settings
    { category: 'system', setting_key: 'maintenanceMode', setting_value: 'false', setting_type: 'boolean', is_public: false, description: 'Enable maintenance mode' },
    { category: 'system', setting_key: 'debugMode', setting_value: 'false', setting_type: 'boolean', is_public: false, description: 'Enable debug mode' },
    { category: 'system', setting_key: 'logLevel', setting_value: 'info', setting_type: 'string', is_public: false, description: 'System log level' },
    { category: 'system', setting_key: 'backupFrequency', setting_value: 'daily', setting_type: 'string', is_public: false, description: 'Database backup frequency' },
    { category: 'system', setting_key: 'maxFileSize', setting_value: '10485760', setting_type: 'number', is_public: false, description: 'Maximum file upload size in bytes' },
  ];

  for (const setting of defaultSettings) {
    try {
      await connection.query(
        'INSERT INTO settings (category, setting_key, setting_value, setting_type, is_public, description) VALUES (?, ?, ?, ?, ?, ?)',
        [setting.category, setting.setting_key, setting.setting_value, setting.setting_type, setting.is_public, setting.description]
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        // Update existing setting if it's a duplicate
        await connection.query(
          'UPDATE settings SET setting_value = ?, setting_type = ?, is_public = ?, description = ? WHERE category = ? AND setting_key = ?',
          [setting.setting_value, setting.setting_type, setting.is_public, setting.description, setting.category, setting.setting_key]
        );
      } else {
        throw error;
      }
    }
  }
  console.log('✅ Default settings inserted');
}

export async function down(connection) {
  console.log('📝 Rolling back settings tables...');
  await connection.query('DROP TABLE IF EXISTS audit_logs');
  await connection.query('DROP TABLE IF EXISTS settings');
  console.log('✅ Settings tables rolled back');
}
