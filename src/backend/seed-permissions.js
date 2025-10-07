#!/usr/bin/env node

/**
 * Seed Permissions Script
 * This script populates the permissions table with sample data
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_db',
  port: process.env.DB_PORT || 3306
};

const samplePermissions = [
  // Dashboard Module
  { permission_name: 'dashboard.view', name: 'View Dashboard', description: 'Access to dashboard overview', module: 'dashboard' },
  { permission_name: 'dashboard.analytics', name: 'View Analytics', description: 'Access to analytics and reports', module: 'dashboard' },
  
  // Employee Module
  { permission_name: 'employees.view', name: 'View Employees', description: 'View employee list and details', module: 'employees' },
  { permission_name: 'employees.create', name: 'Create Employee', description: 'Add new employees to the system', module: 'employees' },
  { permission_name: 'employees.edit', name: 'Edit Employee', description: 'Modify employee information', module: 'employees' },
  { permission_name: 'employees.delete', name: 'Delete Employee', description: 'Remove employees from the system', module: 'employees' },
  { permission_name: 'employees.export', name: 'Export Employees', description: 'Export employee data', module: 'employees' },
  
  // Attendance Module
  { permission_name: 'attendance.view', name: 'View Attendance', description: 'View attendance records', module: 'attendance' },
  { permission_name: 'attendance.manage', name: 'Manage Attendance', description: 'Manage attendance records', module: 'attendance' },
  { permission_name: 'attendance.reports', name: 'Attendance Reports', description: 'Generate attendance reports', module: 'attendance' },
  
  // Leave Module
  { permission_name: 'leave.view', name: 'View Leave', description: 'View leave applications', module: 'leave' },
  { permission_name: 'leave.create', name: 'Create Leave', description: 'Submit leave applications', module: 'leave' },
  { permission_name: 'leave.approve', name: 'Approve Leave', description: 'Approve or reject leave applications', module: 'leave' },
  { permission_name: 'leave.manage', name: 'Manage Leave', description: 'Manage leave policies and types', module: 'leave' },
  
  // Payroll Module
  { permission_name: 'payroll.view', name: 'View Payroll', description: 'View payroll information', module: 'payroll' },
  { permission_name: 'payroll.manage', name: 'Manage Payroll', description: 'Manage payroll calculations', module: 'payroll' },
  { permission_name: 'payroll.generate', name: 'Generate Payroll', description: 'Generate payroll reports', module: 'payroll' },
  
  // Organization Module
  { permission_name: 'organization.view', name: 'View Organization', description: 'View organization structure', module: 'organization' },
  { permission_name: 'organization.manage', name: 'Manage Organization', description: 'Manage departments and branches', module: 'organization' },
  
  // Settings Module
  { permission_name: 'settings.view', name: 'View Settings', description: 'View system settings', module: 'settings' },
  { permission_name: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', module: 'settings' },
  { permission_name: 'settings.users', name: 'Manage Users', description: 'Manage user accounts and roles', module: 'settings' },
  
  // Reports Module
  { permission_name: 'reports.view', name: 'View Reports', description: 'Access to various reports', module: 'reports' },
  { permission_name: 'reports.generate', name: 'Generate Reports', description: 'Generate custom reports', module: 'reports' },
  { permission_name: 'reports.export', name: 'Export Reports', description: 'Export reports to various formats', module: 'reports' },
  
  // Tasks Module
  { permission_name: 'tasks.view', name: 'View Tasks', description: 'View task assignments', module: 'tasks' },
  { permission_name: 'tasks.create', name: 'Create Tasks', description: 'Create new tasks', module: 'tasks' },
  { permission_name: 'tasks.assign', name: 'Assign Tasks', description: 'Assign tasks to employees', module: 'tasks' },
  { permission_name: 'tasks.manage', name: 'Manage Tasks', description: 'Manage all tasks', module: 'tasks' },
  
  // Documents Module
  { permission_name: 'documents.view', name: 'View Documents', description: 'View company documents', module: 'documents' },
  { permission_name: 'documents.upload', name: 'Upload Documents', description: 'Upload new documents', module: 'documents' },
  { permission_name: 'documents.manage', name: 'Manage Documents', description: 'Manage document categories', module: 'documents' },
  
  // Recruitment Module
  { permission_name: 'recruitment.view', name: 'View Recruitment', description: 'View job postings and applications', module: 'recruitment' },
  { permission_name: 'recruitment.create', name: 'Create Jobs', description: 'Create new job postings', module: 'recruitment' },
  { permission_name: 'recruitment.manage', name: 'Manage Recruitment', description: 'Manage recruitment process', module: 'recruitment' },
  
  // Performance Module
  { permission_name: 'performance.view', name: 'View Performance', description: 'View performance reviews', module: 'performance' },
  { permission_name: 'performance.manage', name: 'Manage Performance', description: 'Manage performance reviews', module: 'performance' },
  
  // Assets Module
  { permission_name: 'assets.view', name: 'View Assets', description: 'View company assets', module: 'assets' },
  { permission_name: 'assets.manage', name: 'Manage Assets', description: 'Manage asset assignments', module: 'assets' },
  
  // Finance Module
  { permission_name: 'finance.view', name: 'View Finance', description: 'View financial information', module: 'finance' },
  { permission_name: 'finance.manage', name: 'Manage Finance', description: 'Manage financial records', module: 'finance' },
  
  // Training Module
  { permission_name: 'training.view', name: 'View Training', description: 'View training programs', module: 'training' },
  { permission_name: 'training.manage', name: 'Manage Training', description: 'Manage training programs', module: 'training' },
  
  // Calendar Module
  { permission_name: 'calendar.view', name: 'View Calendar', description: 'View company calendar', module: 'calendar' },
  { permission_name: 'calendar.manage', name: 'Manage Calendar', description: 'Manage calendar events', module: 'calendar' },
  
  // Notifications Module
  { permission_name: 'notifications.view', name: 'View Notifications', description: 'View system notifications', module: 'notifications' },
  { permission_name: 'notifications.manage', name: 'Manage Notifications', description: 'Manage notification settings', module: 'notifications' }
];

async function seedPermissions() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Clear existing permissions
    console.log('🧹 Clearing existing permissions...');
    await connection.execute('DELETE FROM permissions');
    console.log('✅ Cleared existing permissions');
    
    // Insert sample permissions
    console.log('📝 Inserting sample permissions...');
    for (const permission of samplePermissions) {
      await connection.execute(
        'INSERT INTO permissions (permission_name, name, description, module, is_active) VALUES (?, ?, ?, ?, ?)',
        [permission.permission_name, permission.name, permission.description, permission.module, true]
      );
    }
    console.log(`✅ Inserted ${samplePermissions.length} permissions`);
    
    // Show summary
    const [rows] = await connection.execute('SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module');
    console.log('\n📊 Permissions Summary:');
    rows.forEach(row => {
      console.log(`  ${row.module}: ${row.count} permissions`);
    });
    
    console.log('\n🎉 Permissions seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
seedPermissions();
