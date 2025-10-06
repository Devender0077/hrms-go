/**
 * Migration: 002_create_permissions_system
 * Creates the permissions and roles system
 */

async function up(connection) {
  console.log('📝 Creating permissions system...');

  // Permissions Table (Fixed structure)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      permission_name VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      module VARCHAR(50) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Permissions table created');

  // Roles Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      permissions JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Roles table created');

  // User Roles Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      assigned_by INT,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('✅ User roles table created');

  // Role Permissions Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
      UNIQUE KEY unique_role_permission (role_id, permission_id)
    )
  `);
  console.log('✅ Role permissions table created');

  // User Permissions Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      permission VARCHAR(100) NOT NULL,
      granted_by INT NOT NULL,
      granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      permission_id INT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE SET NULL,
      UNIQUE KEY unique_user_permission (user_id, permission)
    )
  `);
  console.log('✅ User permissions table created');

  // Insert default permissions
  const defaultPermissions = [
    { permission_name: 'users.create', name: 'Create Users', module: 'users' },
    { permission_name: 'users.read', name: 'Read Users', module: 'users' },
    { permission_name: 'users.update', name: 'Update Users', module: 'users' },
    { permission_name: 'users.delete', name: 'Delete Users', module: 'users' },
    { permission_name: 'employees.create', name: 'Create Employees', module: 'employees' },
    { permission_name: 'employees.read', name: 'Read Employees', module: 'employees' },
    { permission_name: 'employees.update', name: 'Update Employees', module: 'employees' },
    { permission_name: 'employees.delete', name: 'Delete Employees', module: 'employees' },
    { permission_name: 'attendance.read', name: 'Read Attendance', module: 'attendance' },
    { permission_name: 'attendance.update', name: 'Update Attendance', module: 'attendance' },
    { permission_name: 'leave.read', name: 'Read Leave', module: 'leave' },
    { permission_name: 'leave.approve', name: 'Approve Leave', module: 'leave' },
    { permission_name: 'payroll.read', name: 'Read Payroll', module: 'payroll' },
    { permission_name: 'payroll.process', name: 'Process Payroll', module: 'payroll' },
    { permission_name: 'reports.read', name: 'Read Reports', module: 'reports' },
    { permission_name: 'settings.read', name: 'Read Settings', module: 'settings' },
    { permission_name: 'settings.update', name: 'Update Settings', module: 'settings' }
  ];

  for (const permission of defaultPermissions) {
    try {
      await connection.query(`
        INSERT IGNORE INTO permissions (permission_name, name, description, module)
        VALUES (?, ?, ?, ?)
      `, [permission.permission_name, permission.name, permission.name, permission.module]);
    } catch (error) {
      // Permission already exists
    }
  }
  console.log('✅ Default permissions inserted');
}

async function down(connection) {
  console.log('🔄 Dropping permissions system...');
  
  await connection.query('DROP TABLE IF EXISTS user_permissions');
  await connection.query('DROP TABLE IF EXISTS role_permissions');
  await connection.query('DROP TABLE IF EXISTS user_roles');
  await connection.query('DROP TABLE IF EXISTS roles');
  await connection.query('DROP TABLE IF EXISTS permissions');
  
  console.log('✅ Permissions system dropped');
}

module.exports = { up, down };
