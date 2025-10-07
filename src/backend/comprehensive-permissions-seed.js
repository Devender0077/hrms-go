#!/usr/bin/env node

/**
 * Comprehensive Permissions Seed Script
 * This script populates the permissions table with a complete set of CRUD permissions
 * for all modules and operations in the HRMS system
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

const comprehensivePermissions = [
  // ==================== DASHBOARD MODULE ====================
  { permission_name: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard overview', module: 'dashboard' },
  { permission_name: 'dashboard.analytics', name: 'View Analytics', description: 'Access to analytics and statistics', module: 'dashboard' },
  { permission_name: 'dashboard.widgets', name: 'Manage Widgets', description: 'Customize dashboard widgets', module: 'dashboard' },
  { permission_name: 'dashboard.export', name: 'Export Dashboard', description: 'Export dashboard data and reports', module: 'dashboard' },

  // ==================== EMPLOYEES MODULE ====================
  { permission_name: 'employees.view', name: 'View Employees', description: 'View employee list and basic information', module: 'employees' },
  { permission_name: 'employees.create', name: 'Create Employee', description: 'Add new employees to the system', module: 'employees' },
  { permission_name: 'employees.edit', name: 'Edit Employee', description: 'Modify employee information', module: 'employees' },
  { permission_name: 'employees.delete', name: 'Delete Employee', description: 'Remove employees from the system', module: 'employees' },
  { permission_name: 'employees.export', name: 'Export Employees', description: 'Export employee data to various formats', module: 'employees' },
  { permission_name: 'employees.import', name: 'Import Employees', description: 'Import employee data from files', module: 'employees' },
  { permission_name: 'employees.profile', name: 'View Employee Profile', description: 'View detailed employee profiles', module: 'employees' },
  { permission_name: 'employees.history', name: 'View Employee History', description: 'View employee work history and changes', module: 'employees' },
  { permission_name: 'employees.documents', name: 'Manage Employee Documents', description: 'Upload and manage employee documents', module: 'employees' },
  { permission_name: 'employees.contracts', name: 'Manage Employee Contracts', description: 'Create and manage employment contracts', module: 'employees' },
  { permission_name: 'employees.salary', name: 'View Employee Salary', description: 'View employee salary information', module: 'employees' },
  { permission_name: 'employees.performance', name: 'View Employee Performance', description: 'View employee performance records', module: 'employees' },

  // ==================== ATTENDANCE MODULE ====================
  { permission_name: 'attendance.view', name: 'View Attendance', description: 'View attendance records and reports', module: 'attendance' },
  { permission_name: 'attendance.create', name: 'Create Attendance', description: 'Create attendance records', module: 'attendance' },
  { permission_name: 'attendance.edit', name: 'Edit Attendance', description: 'Modify attendance records', module: 'attendance' },
  { permission_name: 'attendance.delete', name: 'Delete Attendance', description: 'Delete attendance records', module: 'attendance' },
  { permission_name: 'attendance.manage', name: 'Manage Attendance', description: 'Full attendance management capabilities', module: 'attendance' },
  { permission_name: 'attendance.reports', name: 'Attendance Reports', description: 'Generate attendance reports', module: 'attendance' },
  { permission_name: 'attendance.export', name: 'Export Attendance', description: 'Export attendance data', module: 'attendance' },
  { permission_name: 'attendance.import', name: 'Import Attendance', description: 'Import attendance data from files', module: 'attendance' },
  { permission_name: 'attendance.checkin', name: 'Check In', description: 'Employee check-in functionality', module: 'attendance' },
  { permission_name: 'attendance.checkout', name: 'Check Out', description: 'Employee check-out functionality', module: 'attendance' },
  { permission_name: 'attendance.overtime', name: 'Manage Overtime', description: 'Manage overtime records', module: 'attendance' },
  { permission_name: 'attendance.regularization', name: 'Attendance Regularization', description: 'Regularize attendance records', module: 'attendance' },

  // ==================== LEAVE MODULE ====================
  { permission_name: 'leave.view', name: 'View Leave', description: 'View leave applications and records', module: 'leave' },
  { permission_name: 'leave.create', name: 'Create Leave', description: 'Submit leave applications', module: 'leave' },
  { permission_name: 'leave.edit', name: 'Edit Leave', description: 'Modify leave applications', module: 'leave' },
  { permission_name: 'leave.delete', name: 'Delete Leave', description: 'Delete leave applications', module: 'leave' },
  { permission_name: 'leave.approve', name: 'Approve Leave', description: 'Approve or reject leave applications', module: 'leave' },
  { permission_name: 'leave.manage', name: 'Manage Leave', description: 'Full leave management capabilities', module: 'leave' },
  { permission_name: 'leave.types', name: 'Manage Leave Types', description: 'Create and manage leave types', module: 'leave' },
  { permission_name: 'leave.policies', name: 'Manage Leave Policies', description: 'Create and manage leave policies', module: 'leave' },
  { permission_name: 'leave.balance', name: 'View Leave Balance', description: 'View employee leave balances', module: 'leave' },
  { permission_name: 'leave.reports', name: 'Leave Reports', description: 'Generate leave reports', module: 'leave' },
  { permission_name: 'leave.export', name: 'Export Leave', description: 'Export leave data', module: 'leave' },
  { permission_name: 'leave.calendar', name: 'Leave Calendar', description: 'View leave calendar', module: 'leave' },

  // ==================== PAYROLL MODULE ====================
  { permission_name: 'payroll.view', name: 'View Payroll', description: 'View payroll information and records', module: 'payroll' },
  { permission_name: 'payroll.create', name: 'Create Payroll', description: 'Create payroll records', module: 'payroll' },
  { permission_name: 'payroll.edit', name: 'Edit Payroll', description: 'Modify payroll records', module: 'payroll' },
  { permission_name: 'payroll.delete', name: 'Delete Payroll', description: 'Delete payroll records', module: 'payroll' },
  { permission_name: 'payroll.manage', name: 'Manage Payroll', description: 'Full payroll management capabilities', module: 'payroll' },
  { permission_name: 'payroll.generate', name: 'Generate Payroll', description: 'Generate payroll for employees', module: 'payroll' },
  { permission_name: 'payroll.components', name: 'Manage Salary Components', description: 'Manage salary components and structures', module: 'payroll' },
  { permission_name: 'payroll.payslips', name: 'Manage Payslips', description: 'Generate and manage employee payslips', module: 'payroll' },
  { permission_name: 'payroll.reports', name: 'Payroll Reports', description: 'Generate payroll reports', module: 'payroll' },
  { permission_name: 'payroll.export', name: 'Export Payroll', description: 'Export payroll data', module: 'payroll' },
  { permission_name: 'payroll.tax', name: 'Manage Tax', description: 'Manage tax calculations and deductions', module: 'payroll' },
  { permission_name: 'payroll.bonus', name: 'Manage Bonus', description: 'Manage bonus calculations and payments', module: 'payroll' },

  // ==================== ORGANIZATION MODULE ====================
  { permission_name: 'organization.view', name: 'View Organization', description: 'View organization structure and hierarchy', module: 'organization' },
  { permission_name: 'organization.manage', name: 'Manage Organization', description: 'Full organization management capabilities', module: 'organization' },
  { permission_name: 'departments.view', name: 'View Departments', description: 'View department information', module: 'organization' },
  { permission_name: 'departments.create', name: 'Create Department', description: 'Create new departments', module: 'organization' },
  { permission_name: 'departments.edit', name: 'Edit Department', description: 'Modify department information', module: 'organization' },
  { permission_name: 'departments.delete', name: 'Delete Department', description: 'Delete departments', module: 'organization' },
  { permission_name: 'branches.view', name: 'View Branches', description: 'View branch information', module: 'organization' },
  { permission_name: 'branches.create', name: 'Create Branch', description: 'Create new branches', module: 'organization' },
  { permission_name: 'branches.edit', name: 'Edit Branch', description: 'Modify branch information', module: 'organization' },
  { permission_name: 'branches.delete', name: 'Delete Branch', description: 'Delete branches', module: 'organization' },
  { permission_name: 'designations.view', name: 'View Designations', description: 'View job designations', module: 'organization' },
  { permission_name: 'designations.create', name: 'Create Designation', description: 'Create new job designations', module: 'organization' },
  { permission_name: 'designations.edit', name: 'Edit Designation', description: 'Modify job designations', module: 'organization' },
  { permission_name: 'designations.delete', name: 'Delete Designation', description: 'Delete job designations', module: 'organization' },
  { permission_name: 'orgchart.view', name: 'View Org Chart', description: 'View organizational chart', module: 'organization' },
  { permission_name: 'orgchart.manage', name: 'Manage Org Chart', description: 'Manage organizational structure', module: 'organization' },

  // ==================== SETTINGS MODULE ====================
  { permission_name: 'settings.view', name: 'View Settings', description: 'View system settings and configuration', module: 'settings' },
  { permission_name: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', module: 'settings' },
  { permission_name: 'settings.manage', name: 'Manage Settings', description: 'Full settings management capabilities', module: 'settings' },
  { permission_name: 'settings.company', name: 'Company Settings', description: 'Manage company information and settings', module: 'settings' },
  { permission_name: 'settings.email', name: 'Email Settings', description: 'Configure email settings and templates', module: 'settings' },
  { permission_name: 'settings.system', name: 'System Settings', description: 'Configure system-wide settings', module: 'settings' },
  { permission_name: 'settings.backup', name: 'Backup Settings', description: 'Manage backup and restore settings', module: 'settings' },
  { permission_name: 'settings.security', name: 'Security Settings', description: 'Configure security and access controls', module: 'settings' },
  { permission_name: 'settings.integration', name: 'Integration Settings', description: 'Manage third-party integrations', module: 'settings' },
  { permission_name: 'settings.notifications', name: 'Notification Settings', description: 'Configure notification preferences', module: 'settings' },
  { permission_name: 'settings.theme', name: 'Theme Settings', description: 'Manage application themes and appearance', module: 'settings' },
  { permission_name: 'settings.workflow', name: 'Workflow Settings', description: 'Configure approval workflows', module: 'settings' },

  // ==================== REPORTS MODULE ====================
  { permission_name: 'reports.view', name: 'View Reports', description: 'Access to various system reports', module: 'reports' },
  { permission_name: 'reports.create', name: 'Create Reports', description: 'Create custom reports', module: 'reports' },
  { permission_name: 'reports.edit', name: 'Edit Reports', description: 'Modify existing reports', module: 'reports' },
  { permission_name: 'reports.delete', name: 'Delete Reports', description: 'Delete custom reports', module: 'reports' },
  { permission_name: 'reports.generate', name: 'Generate Reports', description: 'Generate and run reports', module: 'reports' },
  { permission_name: 'reports.export', name: 'Export Reports', description: 'Export reports to various formats', module: 'reports' },
  { permission_name: 'reports.schedule', name: 'Schedule Reports', description: 'Schedule automated report generation', module: 'reports' },
  { permission_name: 'reports.analytics', name: 'Analytics Reports', description: 'Access to analytics and insights', module: 'reports' },
  { permission_name: 'reports.audit', name: 'Audit Reports', description: 'Generate audit trail reports', module: 'reports' },
  { permission_name: 'reports.compliance', name: 'Compliance Reports', description: 'Generate compliance reports', module: 'reports' },
  { permission_name: 'reports.financial', name: 'Financial Reports', description: 'Generate financial reports', module: 'reports' },
  { permission_name: 'reports.hr', name: 'HR Reports', description: 'Generate HR-specific reports', module: 'reports' },

  // ==================== TASKS MODULE ====================
  { permission_name: 'tasks.view', name: 'View Tasks', description: 'View task assignments and status', module: 'tasks' },
  { permission_name: 'tasks.create', name: 'Create Tasks', description: 'Create new tasks and assignments', module: 'tasks' },
  { permission_name: 'tasks.edit', name: 'Edit Tasks', description: 'Modify task information and details', module: 'tasks' },
  { permission_name: 'tasks.delete', name: 'Delete Tasks', description: 'Delete tasks and assignments', module: 'tasks' },
  { permission_name: 'tasks.assign', name: 'Assign Tasks', description: 'Assign tasks to employees', module: 'tasks' },
  { permission_name: 'tasks.manage', name: 'Manage Tasks', description: 'Full task management capabilities', module: 'tasks' },
  { permission_name: 'tasks.complete', name: 'Complete Tasks', description: 'Mark tasks as completed', module: 'tasks' },
  { permission_name: 'tasks.priority', name: 'Manage Task Priority', description: 'Set and manage task priorities', module: 'tasks' },
  { permission_name: 'tasks.projects', name: 'Manage Projects', description: 'Create and manage projects', module: 'tasks' },
  { permission_name: 'tasks.timeline', name: 'Task Timeline', description: 'View and manage task timelines', module: 'tasks' },
  { permission_name: 'tasks.reports', name: 'Task Reports', description: 'Generate task-related reports', module: 'tasks' },
  { permission_name: 'tasks.export', name: 'Export Tasks', description: 'Export task data', module: 'tasks' },

  // ==================== DOCUMENTS MODULE ====================
  { permission_name: 'documents.view', name: 'View Documents', description: 'View company documents and files', module: 'documents' },
  { permission_name: 'documents.create', name: 'Create Documents', description: 'Create new documents', module: 'documents' },
  { permission_name: 'documents.edit', name: 'Edit Documents', description: 'Modify existing documents', module: 'documents' },
  { permission_name: 'documents.delete', name: 'Delete Documents', description: 'Delete documents and files', module: 'documents' },
  { permission_name: 'documents.upload', name: 'Upload Documents', description: 'Upload new documents and files', module: 'documents' },
  { permission_name: 'documents.download', name: 'Download Documents', description: 'Download documents and files', module: 'documents' },
  { permission_name: 'documents.manage', name: 'Manage Documents', description: 'Full document management capabilities', module: 'documents' },
  { permission_name: 'documents.categories', name: 'Manage Categories', description: 'Manage document categories', module: 'documents' },
  { permission_name: 'documents.permissions', name: 'Document Permissions', description: 'Manage document access permissions', module: 'documents' },
  { permission_name: 'documents.version', name: 'Version Control', description: 'Manage document versions', module: 'documents' },
  { permission_name: 'documents.archive', name: 'Archive Documents', description: 'Archive and restore documents', module: 'documents' },
  { permission_name: 'documents.search', name: 'Search Documents', description: 'Search and filter documents', module: 'documents' },

  // ==================== RECRUITMENT MODULE ====================
  { permission_name: 'recruitment.view', name: 'View Recruitment', description: 'View job postings and applications', module: 'recruitment' },
  { permission_name: 'recruitment.create', name: 'Create Jobs', description: 'Create new job postings', module: 'recruitment' },
  { permission_name: 'recruitment.edit', name: 'Edit Jobs', description: 'Modify job postings', module: 'recruitment' },
  { permission_name: 'recruitment.delete', name: 'Delete Jobs', description: 'Delete job postings', module: 'recruitment' },
  { permission_name: 'recruitment.manage', name: 'Manage Recruitment', description: 'Full recruitment management capabilities', module: 'recruitment' },
  { permission_name: 'recruitment.applications', name: 'Manage Applications', description: 'Manage job applications', module: 'recruitment' },
  { permission_name: 'recruitment.candidates', name: 'Manage Candidates', description: 'Manage candidate information', module: 'recruitment' },
  { permission_name: 'recruitment.interviews', name: 'Manage Interviews', description: 'Schedule and manage interviews', module: 'recruitment' },
  { permission_name: 'recruitment.offers', name: 'Manage Offers', description: 'Create and manage job offers', module: 'recruitment' },
  { permission_name: 'recruitment.onboarding', name: 'Manage Onboarding', description: 'Manage new employee onboarding', module: 'recruitment' },
  { permission_name: 'recruitment.reports', name: 'Recruitment Reports', description: 'Generate recruitment reports', module: 'recruitment' },
  { permission_name: 'recruitment.export', name: 'Export Recruitment', description: 'Export recruitment data', module: 'recruitment' },

  // ==================== PERFORMANCE MODULE ====================
  { permission_name: 'performance.view', name: 'View Performance', description: 'View performance reviews and ratings', module: 'performance' },
  { permission_name: 'performance.create', name: 'Create Reviews', description: 'Create performance reviews', module: 'performance' },
  { permission_name: 'performance.edit', name: 'Edit Reviews', description: 'Modify performance reviews', module: 'performance' },
  { permission_name: 'performance.delete', name: 'Delete Reviews', description: 'Delete performance reviews', module: 'performance' },
  { permission_name: 'performance.manage', name: 'Manage Performance', description: 'Full performance management capabilities', module: 'performance' },
  { permission_name: 'performance.goals', name: 'Manage Goals', description: 'Set and manage performance goals', module: 'performance' },
  { permission_name: 'performance.appraisals', name: 'Manage Appraisals', description: 'Conduct performance appraisals', module: 'performance' },
  { permission_name: 'performance.feedback', name: 'Manage Feedback', description: 'Provide and manage feedback', module: 'performance' },
  { permission_name: 'performance.ratings', name: 'Manage Ratings', description: 'Set and manage performance ratings', module: 'performance' },
  { permission_name: 'performance.reports', name: 'Performance Reports', description: 'Generate performance reports', module: 'performance' },
  { permission_name: 'performance.export', name: 'Export Performance', description: 'Export performance data', module: 'performance' },
  { permission_name: 'performance.calibration', name: 'Performance Calibration', description: 'Calibrate performance ratings', module: 'performance' },

  // ==================== ASSETS MODULE ====================
  { permission_name: 'assets.view', name: 'View Assets', description: 'View company assets and inventory', module: 'assets' },
  { permission_name: 'assets.create', name: 'Create Assets', description: 'Add new assets to inventory', module: 'assets' },
  { permission_name: 'assets.edit', name: 'Edit Assets', description: 'Modify asset information', module: 'assets' },
  { permission_name: 'assets.delete', name: 'Delete Assets', description: 'Remove assets from inventory', module: 'assets' },
  { permission_name: 'assets.manage', name: 'Manage Assets', description: 'Full asset management capabilities', module: 'assets' },
  { permission_name: 'assets.assign', name: 'Assign Assets', description: 'Assign assets to employees', module: 'assets' },
  { permission_name: 'assets.return', name: 'Return Assets', description: 'Process asset returns', module: 'assets' },
  { permission_name: 'assets.maintenance', name: 'Asset Maintenance', description: 'Manage asset maintenance', module: 'assets' },
  { permission_name: 'assets.categories', name: 'Asset Categories', description: 'Manage asset categories', module: 'assets' },
  { permission_name: 'assets.reports', name: 'Asset Reports', description: 'Generate asset reports', module: 'assets' },
  { permission_name: 'assets.export', name: 'Export Assets', description: 'Export asset data', module: 'assets' },
  { permission_name: 'assets.audit', name: 'Asset Audit', description: 'Conduct asset audits', module: 'assets' },

  // ==================== FINANCE MODULE ====================
  { permission_name: 'finance.view', name: 'View Finance', description: 'View financial information and records', module: 'finance' },
  { permission_name: 'finance.create', name: 'Create Finance', description: 'Create financial records', module: 'finance' },
  { permission_name: 'finance.edit', name: 'Edit Finance', description: 'Modify financial records', module: 'finance' },
  { permission_name: 'finance.delete', name: 'Delete Finance', description: 'Delete financial records', module: 'finance' },
  { permission_name: 'finance.manage', name: 'Manage Finance', description: 'Full financial management capabilities', module: 'finance' },
  { permission_name: 'finance.accounts', name: 'Manage Accounts', description: 'Manage financial accounts', module: 'finance' },
  { permission_name: 'finance.transactions', name: 'Manage Transactions', description: 'Manage financial transactions', module: 'finance' },
  { permission_name: 'finance.expenses', name: 'Manage Expenses', description: 'Manage expense records', module: 'finance' },
  { permission_name: 'finance.income', name: 'Manage Income', description: 'Manage income records', module: 'finance' },
  { permission_name: 'finance.budget', name: 'Manage Budget', description: 'Create and manage budgets', module: 'finance' },
  { permission_name: 'finance.reports', name: 'Financial Reports', description: 'Generate financial reports', module: 'finance' },
  { permission_name: 'finance.export', name: 'Export Finance', description: 'Export financial data', module: 'finance' },

  // ==================== TRAINING MODULE ====================
  { permission_name: 'training.view', name: 'View Training', description: 'View training programs and courses', module: 'training' },
  { permission_name: 'training.create', name: 'Create Training', description: 'Create new training programs', module: 'training' },
  { permission_name: 'training.edit', name: 'Edit Training', description: 'Modify training programs', module: 'training' },
  { permission_name: 'training.delete', name: 'Delete Training', description: 'Delete training programs', module: 'training' },
  { permission_name: 'training.manage', name: 'Manage Training', description: 'Full training management capabilities', module: 'training' },
  { permission_name: 'training.enroll', name: 'Enroll Training', description: 'Enroll employees in training', module: 'training' },
  { permission_name: 'training.schedule', name: 'Schedule Training', description: 'Schedule training sessions', module: 'training' },
  { permission_name: 'training.track', name: 'Track Progress', description: 'Track training progress', module: 'training' },
  { permission_name: 'training.certificates', name: 'Manage Certificates', description: 'Issue and manage certificates', module: 'training' },
  { permission_name: 'training.reports', name: 'Training Reports', description: 'Generate training reports', module: 'training' },
  { permission_name: 'training.export', name: 'Export Training', description: 'Export training data', module: 'training' },
  { permission_name: 'training.evaluation', name: 'Training Evaluation', description: 'Evaluate training effectiveness', module: 'training' },

  // ==================== CALENDAR MODULE ====================
  { permission_name: 'calendar.view', name: 'View Calendar', description: 'View company calendar and events', module: 'calendar' },
  { permission_name: 'calendar.create', name: 'Create Events', description: 'Create calendar events', module: 'calendar' },
  { permission_name: 'calendar.edit', name: 'Edit Events', description: 'Modify calendar events', module: 'calendar' },
  { permission_name: 'calendar.delete', name: 'Delete Events', description: 'Delete calendar events', module: 'calendar' },
  { permission_name: 'calendar.manage', name: 'Manage Calendar', description: 'Full calendar management capabilities', module: 'calendar' },
  { permission_name: 'calendar.meetings', name: 'Manage Meetings', description: 'Schedule and manage meetings', module: 'calendar' },
  { permission_name: 'calendar.holidays', name: 'Manage Holidays', description: 'Manage company holidays', module: 'calendar' },
  { permission_name: 'calendar.reminders', name: 'Manage Reminders', description: 'Set and manage reminders', module: 'calendar' },
  { permission_name: 'calendar.sharing', name: 'Calendar Sharing', description: 'Share calendar with others', module: 'calendar' },
  { permission_name: 'calendar.export', name: 'Export Calendar', description: 'Export calendar data', module: 'calendar' },
  { permission_name: 'calendar.sync', name: 'Calendar Sync', description: 'Sync with external calendars', module: 'calendar' },
  { permission_name: 'calendar.reports', name: 'Calendar Reports', description: 'Generate calendar reports', module: 'calendar' },

  // ==================== NOTIFICATIONS MODULE ====================
  { permission_name: 'notifications.view', name: 'View Notifications', description: 'View system notifications', module: 'notifications' },
  { permission_name: 'notifications.create', name: 'Create Notifications', description: 'Create new notifications', module: 'notifications' },
  { permission_name: 'notifications.edit', name: 'Edit Notifications', description: 'Modify notifications', module: 'notifications' },
  { permission_name: 'notifications.delete', name: 'Delete Notifications', description: 'Delete notifications', module: 'notifications' },
  { permission_name: 'notifications.manage', name: 'Manage Notifications', description: 'Full notification management capabilities', module: 'notifications' },
  { permission_name: 'notifications.settings', name: 'Notification Settings', description: 'Configure notification preferences', module: 'notifications' },
  { permission_name: 'notifications.templates', name: 'Manage Templates', description: 'Manage notification templates', module: 'notifications' },
  { permission_name: 'notifications.schedule', name: 'Schedule Notifications', description: 'Schedule automated notifications', module: 'notifications' },
  { permission_name: 'notifications.broadcast', name: 'Broadcast Notifications', description: 'Send broadcast notifications', module: 'notifications' },
  { permission_name: 'notifications.reports', name: 'Notification Reports', description: 'Generate notification reports', module: 'notifications' },
  { permission_name: 'notifications.export', name: 'Export Notifications', description: 'Export notification data', module: 'notifications' },
  { permission_name: 'notifications.analytics', name: 'Notification Analytics', description: 'View notification analytics', module: 'notifications' },

  // ==================== USER MANAGEMENT MODULE ====================
  { permission_name: 'users.view', name: 'View Users', description: 'View user accounts and information', module: 'users' },
  { permission_name: 'users.create', name: 'Create Users', description: 'Create new user accounts', module: 'users' },
  { permission_name: 'users.edit', name: 'Edit Users', description: 'Modify user accounts', module: 'users' },
  { permission_name: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', module: 'users' },
  { permission_name: 'users.manage', name: 'Manage Users', description: 'Full user management capabilities', module: 'users' },
  { permission_name: 'users.roles', name: 'Manage Roles', description: 'Assign and manage user roles', module: 'users' },
  { permission_name: 'users.permissions', name: 'Manage Permissions', description: 'Assign and manage user permissions', module: 'users' },
  { permission_name: 'users.profiles', name: 'Manage Profiles', description: 'Manage user profiles', module: 'users' },
  { permission_name: 'users.activation', name: 'User Activation', description: 'Activate and deactivate users', module: 'users' },
  { permission_name: 'users.password', name: 'Reset Passwords', description: 'Reset user passwords', module: 'users' },
  { permission_name: 'users.audit', name: 'User Audit', description: 'View user activity audit logs', module: 'users' },
  { permission_name: 'users.export', name: 'Export Users', description: 'Export user data', module: 'users' },

  // ==================== SYSTEM ADMINISTRATION MODULE ====================
  { permission_name: 'admin.view', name: 'View Admin Panel', description: 'Access to system administration panel', module: 'admin' },
  { permission_name: 'admin.manage', name: 'System Administration', description: 'Full system administration capabilities', module: 'admin' },
  { permission_name: 'admin.database', name: 'Database Management', description: 'Manage database operations', module: 'admin' },
  { permission_name: 'admin.logs', name: 'View System Logs', description: 'View and manage system logs', module: 'admin' },
  { permission_name: 'admin.maintenance', name: 'System Maintenance', description: 'Perform system maintenance tasks', module: 'admin' },
  { permission_name: 'admin.updates', name: 'System Updates', description: 'Manage system updates and patches', module: 'admin' },
  { permission_name: 'admin.monitoring', name: 'System Monitoring', description: 'Monitor system performance', module: 'admin' },
  { permission_name: 'admin.security', name: 'Security Management', description: 'Manage system security settings', module: 'admin' },
  { permission_name: 'admin.backup', name: 'Backup Management', description: 'Manage system backups', module: 'admin' },
  { permission_name: 'admin.restore', name: 'Restore Operations', description: 'Perform restore operations', module: 'admin' },
  { permission_name: 'admin.audit', name: 'System Audit', description: 'Conduct system audits', module: 'admin' },
  { permission_name: 'admin.config', name: 'System Configuration', description: 'Configure system settings', module: 'admin' }
];

async function seedComprehensivePermissions() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Clear existing permissions
    console.log('🧹 Clearing existing permissions...');
    await connection.execute('DELETE FROM permissions');
    console.log('✅ Cleared existing permissions');
    
    // Insert comprehensive permissions
    console.log('📝 Inserting comprehensive permissions...');
    for (const permission of comprehensivePermissions) {
      await connection.execute(
        'INSERT INTO permissions (permission_name, name, description, module, is_active) VALUES (?, ?, ?, ?, ?)',
        [permission.permission_name, permission.name, permission.description, permission.module, true]
      );
    }
    console.log(`✅ Inserted ${comprehensivePermissions.length} permissions`);
    
    // Show summary
    const [rows] = await connection.execute('SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module');
    console.log('\n📊 Comprehensive Permissions Summary:');
    rows.forEach(row => {
      console.log(`  ${row.module}: ${row.count} permissions`);
    });
    
    console.log(`\n🎉 Successfully seeded ${comprehensivePermissions.length} comprehensive permissions!`);
    
  } catch (error) {
    console.error('❌ Error seeding comprehensive permissions:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
seedComprehensivePermissions();
