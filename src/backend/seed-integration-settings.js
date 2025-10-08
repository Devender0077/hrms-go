/**
 * Seed Integration Settings
 * Adds all integration settings to settings table
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

const integrationSettings = [
  { key: 'pusher', value: { enabled: false, appId: '', appKey: '', appSecret: '', cluster: '' } },
  { key: 'slack', value: { enabled: false, webhookUrl: '', botToken: '' } },
  { key: 'microsoftTeams', value: { enabled: false, webhookUrl: '', tenantId: '' } },
  { key: 'zoom', value: { enabled: false, apiKey: '', apiSecret: '' } },
  { key: 'googleCalendar', value: { enabled: false, clientId: '', clientSecret: '' } },
  { key: 'googleDrive', value: { enabled: false, clientId: '', clientSecret: '' } },
  { key: 'twilio', value: { enabled: false, accountSid: '', authToken: '', phoneNumber: '' } },
  { key: 'sendgrid', value: { enabled: false, apiKey: '', fromEmail: '' } },
  { key: 'awsS3', value: { enabled: false, accessKeyId: '', secretAccessKey: '', region: '', bucket: '' } },
  { key: 'quickbooks', value: { enabled: false, clientId: '', clientSecret: '' } },
];

async function seedIntegrations() {
  try {
    console.log('🔌 Seeding integration settings...');
    
    let inserted = 0;
    
    for (const integration of integrationSettings) {
      try {
        await pool.query(
          `INSERT INTO settings (company_id, category, setting_key, setting_value)
           VALUES (1, 'integration', ?, ?)
           ON DUPLICATE KEY UPDATE 
             setting_value = IF(setting_value = '' OR setting_value IS NULL, VALUES(setting_value), setting_value)`,
          [integration.key, JSON.stringify(integration.value)]
        );
        inserted++;
        console.log(`✓ ${integration.key}`);
      } catch (error) {
        console.error(`Error seeding ${integration.key}:`, error.message);
      }
    }
    
    console.log(`\n✅ Seeded ${inserted}/${integrationSettings.length} integrations`);
    
  } catch (error) {
    console.error('❌ Error seeding integrations:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedIntegrations();
}

module.exports = { seedIntegrations };
