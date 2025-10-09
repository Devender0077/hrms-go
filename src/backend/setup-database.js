/**
 * Comprehensive Database Setup Script
 * Runs all migrations and seeds default data
 * Works in any environment (local, VPS, cloud)
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}➜${colors.reset} ${msg}`),
};

async function setupDatabase() {
  let connection;
  
  try {
    log.step('Starting database setup...\n');
    
    // Step 1: Create database if it doesn't exist
    log.info('Step 1: Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    const dbName = process.env.DB_NAME || 'hrmgo_hero';
    log.info(`Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    log.success(`Database '${dbName}' is ready\n`);
    
    // Step 2: Create migrations tracking table
    log.info('Step 2: Setting up migrations tracking...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    log.success('Migrations tracking table created\n');
    
    // Step 3: Run all migrations
    log.info('Step 3: Running database migrations...');
    const migrationsDir = path.join(__dirname, 'migrations', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      log.error(`Migrations directory not found: ${migrationsDir}`);
      process.exit(1);
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort to ensure correct order
    
    log.info(`Found ${migrationFiles.length} migration files`);
    
    let executed = 0;
    let skipped = 0;
    
    for (const file of migrationFiles) {
      const migrationName = file.replace('.js', '');
      
      // Check if migration already executed
      const [rows] = await connection.query(
        'SELECT id FROM migrations WHERE name = ?',
        [migrationName]
      );
      
      if (rows.length > 0) {
        skipped++;
        continue;
      }
      
      try {
        log.step(`Running: ${migrationName}`);
        const migration = require(path.join(migrationsDir, file));
        
        if (typeof migration.up === 'function') {
          await migration.up(connection);
        } else {
          log.warning(`Migration ${file} has no 'up' function, skipping...`);
          continue;
        }
        
        // Mark as executed
        await connection.query(
          'INSERT INTO migrations (name) VALUES (?)',
          [migrationName]
        );
        
        log.success(`Completed: ${migrationName}`);
        executed++;
      } catch (error) {
        log.error(`Failed to run migration ${file}:`);
        console.error(error.message);
        // Continue with other migrations
      }
    }
    
    log.success(`\nMigrations complete: ${executed} executed, ${skipped} skipped\n`);
    
    // Step 4: Seed default data
    log.info('Step 4: Seeding default data...');
    await seedDefaultData(connection);
    log.success('Default data seeded successfully\n');
    
    // Step 5: Verify setup
    log.info('Step 5: Verifying database setup...');
    const verification = await verifySetup(connection);
    
    if (verification.success) {
      log.success('\n' + '='.repeat(60));
      log.success('DATABASE SETUP COMPLETED SUCCESSFULLY!');
      log.success('='.repeat(60));
      log.info('\nDefault Login Credentials:');
      log.info('  Super Admin: admin@example.com / admin123');
      log.info('  Company Admin: company@example.com / company123');
      log.info('  HR Manager: hr@example.com / hr123');
      log.info('  Employee: employee@example.com / employee123');
      log.success('\n' + '='.repeat(60) + '\n');
    } else {
      log.warning('\nSetup completed with warnings:');
      verification.warnings.forEach(w => log.warning(`  - ${w}`));
    }
    
  } catch (error) {
    log.error('\nDatabase setup failed:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function seedDefaultData(connection) {
  const bcrypt = require('bcrypt');
  
  // Seed roles first
  await seedRoles(connection);
  
  // Check if users already exist
  const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count > 0) {
    log.info('Users already exist, skipping user seeding');
  } else {
    log.step('Creating default users...');
    
    const defaultUsers = [
      {
        name: 'Super Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'super_admin',
        status: 'active',
        first_name: 'Super',
        last_name: 'Admin',
      },
      {
        name: 'Company Admin',
        email: 'company@example.com',
        password: await bcrypt.hash('company123', 10),
        role: 'company_admin',
        status: 'active',
        first_name: 'Company',
        last_name: 'Admin',
      },
      {
        name: 'HR Manager',
        email: 'hr@example.com',
        password: await bcrypt.hash('hr123', 10),
        role: 'hr',
        status: 'active',
        first_name: 'HR',
        last_name: 'Manager',
      },
      {
        name: 'Employee User',
        email: 'employee@example.com',
        password: await bcrypt.hash('employee123', 10),
        role: 'employee',
        status: 'active',
        first_name: 'Employee',
        last_name: 'User',
      },
    ];
    
    for (const user of defaultUsers) {
      await connection.query(
        `INSERT INTO users (name, email, password, role, status, first_name, last_name, company_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [user.name, user.email, user.password, user.role, user.status, user.first_name, user.last_name]
      );
    }
    
    log.success('Default users created');
  }
  
  // Check if permissions exist
  const [existingPermissions] = await connection.query('SELECT COUNT(*) as count FROM permissions');
  if (existingPermissions[0].count > 0) {
    log.info('Permissions already exist, skipping permission seeding');
  } else {
    log.step('Creating default permissions...');
    await seedPermissions(connection);
    log.success('Default permissions created');
  }
  
  // Check if settings exist
  const [existingSettings] = await connection.query('SELECT COUNT(*) as count FROM system_settings');
  if (existingSettings[0].count > 0) {
    log.info('Settings already exist, skipping settings seeding');
  } else {
    log.step('Creating default settings...');
    await seedSettings(connection);
    log.success('Default settings created');
  }
  
  // Seed other important tables
  await seedDepartments(connection);
  await seedDesignations(connection);
  await seedLeaveTypes(connection);
  await seedDocumentTypes(connection);
  await seedWeekendConfigs(connection);
  await seedAttendanceRules(connection);
}

async function seedPermissions(connection) {
  const permissions = [
    // Dashboard
    { name: 'dashboard.view', description: 'View dashboard', category: 'dashboard' },
    
    // Employees
    { name: 'employees.view', description: 'View employees', category: 'employees' },
    { name: 'employees.create', description: 'Create employees', category: 'employees' },
    { name: 'employees.edit', description: 'Edit employees', category: 'employees' },
    { name: 'employees.delete', description: 'Delete employees', category: 'employees' },
    
    // Attendance
    { name: 'attendance.view', description: 'View attendance', category: 'attendance' },
    { name: 'attendance.create', description: 'Create attendance', category: 'attendance' },
    { name: 'attendance.edit', description: 'Edit attendance', category: 'attendance' },
    { name: 'attendance.delete', description: 'Delete attendance', category: 'attendance' },
    
    // Leave
    { name: 'leave.view', description: 'View leave', category: 'leave' },
    { name: 'leave.create', description: 'Create leave', category: 'leave' },
    { name: 'leave.edit', description: 'Edit leave', category: 'leave' },
    { name: 'leave.delete', description: 'Delete leave', category: 'leave' },
    { name: 'leave.manage', description: 'Manage leave types', category: 'leave' },
    
    // Payroll
    { name: 'payroll.view', description: 'View payroll', category: 'payroll' },
    { name: 'payroll.create', description: 'Create payroll', category: 'payroll' },
    { name: 'payroll.edit', description: 'Edit payroll', category: 'payroll' },
    { name: 'payroll.delete', description: 'Delete payroll', category: 'payroll' },
    
    // Recruitment
    { name: 'recruitment.view', description: 'View recruitment', category: 'recruitment' },
    { name: 'recruitment.create', description: 'Create recruitment', category: 'recruitment' },
    { name: 'recruitment.edit', description: 'Edit recruitment', category: 'recruitment' },
    { name: 'recruitment.delete', description: 'Delete recruitment', category: 'recruitment' },
    
    // Reports
    { name: 'reports.view', description: 'View reports', category: 'reports' },
    { name: 'reports.export', description: 'Export reports', category: 'reports' },
    
    // Settings
    { name: 'settings.view', description: 'View settings', category: 'settings' },
    { name: 'settings.manage', description: 'Manage settings', category: 'settings' },
    
    // Users
    { name: 'users.view', description: 'View users', category: 'users' },
    { name: 'users.create', description: 'Create users', category: 'users' },
    { name: 'users.edit', description: 'Edit users', category: 'users' },
    { name: 'users.delete', description: 'Delete users', category: 'users' },
    
    // Roles
    { name: 'roles.view', description: 'View roles', category: 'roles' },
    { name: 'roles.create', description: 'Create roles', category: 'roles' },
    { name: 'roles.edit', description: 'Edit roles', category: 'roles' },
    { name: 'roles.delete', description: 'Delete roles', category: 'roles' },
    
    // Organization
    { name: 'organization.view', description: 'View organization', category: 'organization' },
    { name: 'organization.manage', description: 'Manage organization', category: 'organization' },
    
    // Calendar
    { name: 'calendar.view', description: 'View calendar', category: 'calendar' },
    
    // Tasks
    { name: 'tasks.view', description: 'View tasks', category: 'tasks' },
    { name: 'tasks.create', description: 'Create tasks', category: 'tasks' },
    { name: 'tasks.edit', description: 'Edit tasks', category: 'tasks' },
    { name: 'tasks.delete', description: 'Delete tasks', category: 'tasks' },
    
    // Performance
    { name: 'performance.view', description: 'View performance', category: 'performance' },
    { name: 'performance.manage', description: 'Manage performance', category: 'performance' },
    
    // Training
    { name: 'training.view', description: 'View training', category: 'training' },
    { name: 'training.manage', description: 'Manage training', category: 'training' },
    
    // Time Tracking
    { name: 'time_tracking.view', description: 'View time tracking', category: 'time_tracking' },
    { name: 'time_tracking.manage', description: 'Manage time tracking', category: 'time_tracking' },
    
    // Messenger
    { name: 'messenger.view', description: 'Access and use messenger', category: 'messenger' },
    { name: 'messenger.groups.create', description: 'Create message groups', category: 'messenger' },
    { name: 'messenger.groups.manage', description: 'Manage message groups', category: 'messenger' },
    
    // Announcements
    { name: 'announcements.view', description: 'View announcements', category: 'announcements' },
    { name: 'announcements.create', description: 'Create announcements', category: 'announcements' },
    { name: 'announcements.edit', description: 'Edit announcements', category: 'announcements' },
    { name: 'announcements.delete', description: 'Delete announcements', category: 'announcements' },
    { name: 'announcements.manage', description: 'Manage announcements', category: 'announcements' },
  ];
  
  for (const permission of permissions) {
    await connection.query(
      `INSERT IGNORE INTO permissions (permission_name, name, description, module, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [permission.name, permission.description.replace('View ', '').replace('Manage ', ''), permission.description, permission.category]
    );
  }
  
  // Assign all permissions to super_admin role
  const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', ['super_admin']);
  if (roles.length > 0) {
    const roleId = roles[0].id;
    const [allPermissions] = await connection.query('SELECT id FROM permissions');
    
    for (const perm of allPermissions) {
      await connection.query(
        `INSERT IGNORE INTO role_permissions (role_id, permission_id, is_active, created_at)
         VALUES (?, ?, 1, NOW())`,
        [roleId, perm.id]
      );
    }
  }
}

async function seedSettings(connection) {
  const defaultSettings = [
    { category: 'general', setting_key: 'siteName', setting_value: 'HRMS Platform', type: 'string' },
    { category: 'general', setting_key: 'companyName', setting_value: 'Your Company', type: 'string' },
    { category: 'general', setting_key: 'primaryColor', setting_value: '#3b82f6', type: 'string' },
    { category: 'general', setting_key: 'messengerEnabled', setting_value: 'true', type: 'boolean' },
    { category: 'localization', setting_key: 'language', setting_value: 'en', type: 'string' },
    { category: 'localization', setting_key: 'timezone', setting_value: 'UTC', type: 'string' },
    { category: 'localization', setting_key: 'currency', setting_value: 'USD', type: 'string' },
    { category: 'features', setting_key: 'enableNotifications', setting_value: 'true', type: 'boolean' },
    { category: 'features', setting_key: 'enableFaceRecognition', setting_value: 'false', type: 'boolean' },
  ];
  
  // Insert into settings table (the active table with category column)
  for (const setting of defaultSettings) {
    await connection.query(
      `INSERT INTO settings (company_id, category, setting_key, setting_value, created_at, updated_at)
       VALUES (1, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [setting.category, setting.setting_key, setting.setting_value]
    );
  }
}

async function verifySetup(connection) {
  const warnings = [];
  
  // Check critical tables
  const criticalTables = ['users', 'permissions', 'roles', 'system_settings', 'employees', 'attendance'];
  
  for (const table of criticalTables) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = ? AND table_name = ?`,
      [process.env.DB_NAME || 'hrmgo_hero', table]
    );
    
    if (rows[0].count === 0) {
      warnings.push(`Table '${table}' not found`);
    }
  }
  
  // Check if users exist
  const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    warnings.push('No users found in database');
  }
  
  // Check if permissions exist
  const [permissions] = await connection.query('SELECT COUNT(*) as count FROM permissions');
  if (permissions[0].count === 0) {
    warnings.push('No permissions found in database');
  }
  
  return {
    success: warnings.length === 0,
    warnings
  };
}

async function seedRoles(connection) {
  log.step('Seeding roles...');
  const roles = [
    { name: 'super_admin', description: 'Super Administrator with full access', is_active: 1 },
    { name: 'company_admin', description: 'Company Administrator', is_active: 1 },
    { name: 'hr', description: 'HR Manager', is_active: 1 },
    { name: 'manager', description: 'Department Manager', is_active: 1 },
    { name: 'employee', description: 'Regular Employee', is_active: 1 },
  ];
  
  for (const role of roles) {
    await connection.query(
      `INSERT IGNORE INTO roles (name, description, is_active, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [role.name, role.description, role.is_active]
    );
  }
  log.success('Roles seeded');
}

async function seedDepartments(connection) {
  try {
    log.step('Seeding departments...');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'departments'"
    );
    if (tables.length === 0) {
      log.warning('departments table does not exist, skipping');
      return;
    }
    
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM departments');
    if (existing[0].count > 0) {
      log.info('Departments already exist, skipping');
      return;
    }
  
  const departments = [
    { name: 'Engineering', description: 'Software Development', status: 'active' },
    { name: 'Human Resources', description: 'HR Management', status: 'active' },
    { name: 'Sales', description: 'Sales and Marketing', status: 'active' },
    { name: 'Finance', description: 'Finance and Accounting', status: 'active' },
    { name: 'Operations', description: 'Operations Management', status: 'active' },
  ];
  
  for (const dept of departments) {
    await connection.query(
      `INSERT INTO departments (name, description, status, company_id, created_at, updated_at)
       VALUES (?, ?, ?, 1, NOW(), NOW())`,
      [dept.name, dept.description, dept.status]
    );
  }
    log.success('Departments seeded');
  } catch (error) {
    log.warning(`Could not seed departments: ${error.message}`);
  }
}

async function seedDesignations(connection) {
  try {
    log.step('Seeding designations...');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'designations'"
    );
    if (tables.length === 0) {
      log.warning('designations table does not exist, skipping');
      return;
    }
    
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM designations');
    if (existing[0].count > 0) {
      log.info('Designations already exist, skipping');
      return;
    }
  
  const designations = [
    { name: 'Software Engineer', description: 'Software Development', status: 'active' },
    { name: 'Senior Software Engineer', description: 'Senior Developer', status: 'active' },
    { name: 'HR Manager', description: 'Human Resources Manager', status: 'active' },
    { name: 'Sales Executive', description: 'Sales Representative', status: 'active' },
    { name: 'Accountant', description: 'Finance and Accounting', status: 'active' },
    { name: 'Manager', description: 'Department Manager', status: 'active' },
  ];
  
  for (const desig of designations) {
    await connection.query(
      `INSERT INTO designations (name, description, status, company_id, created_at, updated_at)
       VALUES (?, ?, ?, 1, NOW(), NOW())`,
      [desig.name, desig.description, desig.status]
    );
  }
    log.success('Designations seeded');
  } catch (error) {
    log.warning(`Could not seed designations: ${error.message}`);
  }
}

async function seedLeaveTypes(connection) {
  try {
    log.step('Seeding leave types...');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'leave_types'"
    );
    if (tables.length === 0) {
      log.warning('leave_types table does not exist, skipping');
      return;
    }
    
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM leave_types');
    if (existing[0].count > 0) {
      log.info('Leave types already exist, skipping');
      return;
    }
    
    const leaveTypes = [
      { name: 'Casual Leave', total_days: 12, description: 'For personal matters', status: 'active' },
      { name: 'Sick Leave', total_days: 10, description: 'For medical reasons', status: 'active' },
      { name: 'Earned Leave', total_days: 15, description: 'Earned annual leave', status: 'active' },
      { name: 'Maternity Leave', total_days: 180, description: 'For maternity', status: 'active' },
      { name: 'Paternity Leave', total_days: 15, description: 'For paternity', status: 'active' },
    ];
    
    for (const leave of leaveTypes) {
      await connection.query(
        `INSERT INTO leave_types (name, total_days, description, status, company_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
        [leave.name, leave.total_days, leave.description, leave.status]
      );
    }
    log.success('Leave types seeded');
  } catch (error) {
    log.warning(`Could not seed leave types: ${error.message}`);
  }
}

async function seedDocumentTypes(connection) {
  try {
    log.step('Seeding document types...');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'document_types'"
    );
    if (tables.length === 0) {
      log.warning('document_types table does not exist, skipping');
      return;
    }
    
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM document_types');
    if (existing[0].count > 0) {
      log.info('Document types already exist, skipping');
      return;
    }
  
  const documentTypes = [
    { name: 'Aadhar Card', description: 'Government ID', is_required: 1, status: 'active' },
    { name: 'PAN Card', description: 'Tax ID', is_required: 1, status: 'active' },
    { name: 'Passport', description: 'International ID', is_required: 0, status: 'active' },
    { name: 'Driving License', description: 'Driving permit', is_required: 0, status: 'active' },
    { name: 'Educational Certificate', description: 'Degree/Diploma', is_required: 1, status: 'active' },
    { name: 'Experience Letter', description: 'Previous employment', is_required: 0, status: 'active' },
  ];
  
  for (const doc of documentTypes) {
    await connection.query(
      `INSERT INTO document_types (name, description, is_required, status, company_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [doc.name, doc.description, doc.is_required, doc.status]
    );
  }
    log.success('Document types seeded');
  } catch (error) {
    log.warning(`Could not seed document types: ${error.message}`);
  }
}

async function seedWeekendConfigs(connection) {
  try {
    log.step('Seeding weekend configurations...');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'weekend_configs'"
    );
    if (tables.length === 0) {
      log.warning('weekend_configs table does not exist, skipping');
      return;
    }
    
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM weekend_configs');
    if (existing[0].count > 0) {
      log.info('Weekend configs already exist, skipping');
      return;
    }
  
  const weekends = [
    { day_of_week: 0, name: 'Sunday', is_active: 1 },
    { day_of_week: 6, name: 'Saturday', is_active: 1 },
  ];
  
  for (const weekend of weekends) {
    await connection.query(
      `INSERT INTO weekend_configs (day_of_week, name, is_active, company_id, created_at, updated_at)
       VALUES (?, ?, ?, 1, NOW(), NOW())`,
      [weekend.day_of_week, weekend.name, weekend.is_active]
    );
  }
    log.success('Weekend configurations seeded');
  } catch (error) {
    log.warning(`Could not seed weekend configs: ${error.message}`);
  }
}

async function seedAttendanceRules(connection) {
  try {
    log.step('Seeding attendance calculation rules...');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'attendance_calculation_rules'"
    );
    if (tables.length === 0) {
      log.warning('attendance_calculation_rules table does not exist, skipping');
      return;
    }
    
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM attendance_calculation_rules');
    if (existing[0].count > 0) {
      log.info('Attendance rules already exist, skipping');
      return;
    }
  
  const rules = [
    {
      name: 'Full Day',
      type: 'full_day',
      min_hours: 8,
      max_hours: 10,
      grace_period_minutes: 15,
      overtime_threshold_hours: 8,
      description: 'Standard full day work hours',
      is_active: 1
    },
    {
      name: 'Half Day',
      type: 'half_day',
      min_hours: 4,
      max_hours: 5,
      grace_period_minutes: 10,
      overtime_threshold_hours: 4,
      description: 'Half day work hours',
      is_active: 1
    },
    {
      name: 'Late Arrival',
      type: 'late',
      min_hours: 0,
      max_hours: 0,
      grace_period_minutes: 15,
      overtime_threshold_hours: 0,
      description: 'Late arrival beyond grace period',
      is_active: 1
    },
  ];
  
  for (const rule of rules) {
    await connection.query(
      `INSERT INTO attendance_calculation_rules 
       (name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active, company_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [rule.name, rule.type, rule.min_hours, rule.max_hours, rule.grace_period_minutes, rule.overtime_threshold_hours, rule.description, rule.is_active]
    );
  }
    log.success('Attendance rules seeded');
  } catch (error) {
    log.warning(`Could not seed attendance rules: ${error.message}`);
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };
