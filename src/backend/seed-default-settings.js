/**
 * Seed Default Settings
 * Ensures all required settings exist in system_settings table
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrmgo_hero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const defaultSettings = [
  // General Settings
  { key: 'general.siteName', value: 'HRMS HUI V2' },
  { key: 'general.siteDescription', value: 'Human Resource Management System' },
  { key: 'general.logo', value: '' },
  { key: 'general.favicon', value: '' },
  { key: 'general.primaryColor', value: '#3b82f6' },
  { key: 'general.secondaryColor', value: '#8b5cf6' },
  { key: 'general.accentColor', value: '#10b981' },
  { key: 'general.transparentLayout', value: 'false' },
  { key: 'general.enableAnimations', value: 'true' },
  { key: 'general.compactMode', value: 'false' },
  
  // Company Information
  { key: 'company.name', value: 'HRMS Company' },
  { key: 'company.email', value: 'admin@hrms.com' },
  { key: 'company.phone', value: '+1-555-0123' },
  { key: 'company.address', value: '123 Business St' },
  { key: 'company.city', value: 'Business City' },
  { key: 'company.state', value: 'State' },
  { key: 'company.zipCode', value: '12345' },
  { key: 'company.country', value: 'United States' },
  { key: 'company.website', value: 'https://hrms.com' },
  { key: 'company.registrationNumber', value: '' },
  { key: 'company.taxId', value: '' },
  
  // Localization
  { key: 'localization.defaultLanguage', value: 'en' },
  { key: 'localization.timezone', value: 'America/New_York' },
  { key: 'localization.dateFormat', value: 'MM/DD/YYYY' },
  { key: 'localization.timeFormat', value: '12h' },
  { key: 'localization.currency', value: 'USD' },
  { key: 'localization.currencyPosition', value: 'before' },
  { key: 'localization.decimalSeparator', value: '.' },
  { key: 'localization.thousandSeparator', value: ',' },
  { key: 'localization.weekStart', value: 'sunday' },
  
  // Email Settings
  { key: 'email.smtpHost', value: 'smtp.gmail.com' },
  { key: 'email.smtpPort', value: '587' },
  { key: 'email.smtpUsername', value: '' },
  { key: 'email.smtpPassword', value: '' },
  { key: 'email.smtpEncryption', value: 'tls' },
  { key: 'email.fromName', value: 'HRMS' },
  { key: 'email.fromEmail', value: 'noreply@hrms.com' },
  { key: 'email.replyToEmail', value: 'support@hrms.com' },
  
  // Notification Settings
  { key: 'notification.emailNotifications', value: 'true' },
  { key: 'notification.pushNotifications', value: 'true' },
  { key: 'notification.smsNotifications', value: 'false' },
  { key: 'notification.inAppNotifications', value: 'true' },
  { key: 'notification.notifyOnLeaveRequest', value: 'true' },
  { key: 'notification.notifyOnLeaveApproval', value: 'true' },
  { key: 'notification.notifyOnAttendance', value: 'false' },
  { key: 'notification.notifyOnPayroll', value: 'true' },
  
  // Security Settings
  { key: 'security.passwordMinLength', value: '8' },
  { key: 'security.passwordRequireUppercase', value: 'true' },
  { key: 'security.passwordRequireLowercase', value: 'true' },
  { key: 'security.passwordRequireNumbers', value: 'true' },
  { key: 'security.passwordRequireSpecialChars', value: 'true' },
  { key: 'security.sessionTimeout', value: '30' },
  { key: 'security.maxLoginAttempts', value: '5' },
  { key: 'security.lockoutDuration', value: '30' },
  { key: 'security.twoFactorEnabled', value: 'false' },
  { key: 'security.ipWhitelist', value: '' },
  
  // Backup Settings
  { key: 'backup.autoBackup', value: 'true' },
  { key: 'backup.backupFrequency', value: 'daily' },
  { key: 'backup.backupTime', value: '02:00' },
  { key: 'backup.backupRetention', value: '30' },
  { key: 'backup.backupLocation', value: 'local' },
  { key: 'backup.s3Bucket', value: '' },
  { key: 'backup.s3Region', value: '' },
  
  // API Management
  { key: 'api.enableApi', value: 'true' },
  { key: 'api.apiVersion', value: 'v1' },
  { key: 'api.rateLimitEnabled', value: 'true' },
  { key: 'api.rateLimitRequests', value: '100' },
  { key: 'api.rateLimitWindow', value: '15' },
  { key: 'api.apiKey', value: '' },
  { key: 'api.webhookUrl', value: '' },
  
  // Workflow Settings
  { key: 'workflow.leaveApprovalWorkflow', value: 'single' },
  { key: 'workflow.expenseApprovalWorkflow', value: 'single' },
  { key: 'workflow.autoApproveLeave', value: 'false' },
  { key: 'workflow.autoApproveExpense', value: 'false' },
  
  // Reports Settings
  { key: 'reports.defaultReportFormat', value: 'pdf' },
  { key: 'reports.includeCharts', value: 'true' },
  { key: 'reports.includeSummary', value: 'true' },
  { key: 'reports.autoGenerateReports', value: 'false' },
  
  // Integration Settings (as JSON objects)
  { key: 'integration.pusher', value: JSON.stringify({ enabled: false, appId: '', appKey: '', appSecret: '', cluster: '' }) },
  { key: 'integration.slack', value: JSON.stringify({ enabled: false, webhookUrl: '', botToken: '' }) },
  { key: 'integration.microsoftTeams', value: JSON.stringify({ enabled: false, webhookUrl: '', tenantId: '' }) },
  { key: 'integration.zoom', value: JSON.stringify({ enabled: false, apiKey: '', apiSecret: '' }) },
  { key: 'integration.googleCalendar', value: JSON.stringify({ enabled: false, clientId: '', clientSecret: '' }) },
  { key: 'integration.googleDrive', value: JSON.stringify({ enabled: false, clientId: '', clientSecret: '' }) },
  { key: 'integration.twilio', value: JSON.stringify({ enabled: false, accountSid: '', authToken: '', phoneNumber: '' }) },
  { key: 'integration.sendgrid', value: JSON.stringify({ enabled: false, apiKey: '', fromEmail: '' }) },
  { key: 'integration.awsS3', value: JSON.stringify({ enabled: false, accessKeyId: '', secretAccessKey: '', region: '', bucket: '' }) },
  { key: 'integration.quickbooks', value: JSON.stringify({ enabled: false, clientId: '', clientSecret: '' }) },
];

async function seedSettings() {
  try {
    console.log('🌱 Seeding default settings...');
    
    let inserted = 0;
    let skipped = 0;
    
    for (const setting of defaultSettings) {
      try {
        const [result] = await pool.query(
          `INSERT INTO system_settings (company_id, setting_key, setting_value, created_at, updated_at)
           VALUES (1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON DUPLICATE KEY UPDATE 
             setting_key = setting_key`, // Don't update if exists
          [setting.key, setting.value]
        );
        
        if (result.affectedRows > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error seeding ${setting.key}:`, error.message);
      }
    }
    
    console.log(`✅ Seeding complete: ${inserted} inserted, ${skipped} skipped`);
    console.log(`📊 Total settings: ${defaultSettings.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedSettings();
}

module.exports = { seedSettings };
