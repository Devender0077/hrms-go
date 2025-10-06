/**
 * Settings Routes
 * System settings, configuration, export/import
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      // Get settings from system_settings table
      const [rows] = await pool.query('SELECT * FROM system_settings ORDER BY setting_key');
      const settings = {
        general: {},
        company: {},
        email: {},
        notification: {},
        security: {},
        integration: {},
        backup: {},
        workflow: {},
        reports: {},
        api: {}
      };
      
      rows.forEach(row => {
        // Map setting_key to appropriate category
        let category = 'general';
        if (row.setting_key.includes('company_')) category = 'company';
        else if (row.setting_key.includes('email_')) category = 'email';
        else if (row.setting_key.includes('notification_')) category = 'notification';
        else if (row.setting_key.includes('security_')) category = 'security';
        else if (row.setting_key.includes('integration_')) category = 'integration';
        else if (row.setting_key.includes('backup_')) category = 'backup';
        else if (row.setting_key.includes('workflow_')) category = 'workflow';
        else if (row.setting_key.includes('reports_')) category = 'reports';
        else if (row.setting_key.includes('api_')) category = 'api';
        
        // Parse the value based on its type
        let parsedValue = row.setting_value;
        if (row.setting_value === 'true') {
          parsedValue = true;
        } else if (row.setting_value === 'false') {
          parsedValue = false;
        } else if (!isNaN(row.setting_value) && !isNaN(parseFloat(row.setting_value))) {
          parsedValue = parseFloat(row.setting_value);
        }
        
        settings[category][row.setting_key] = parsedValue;
      });
      
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ success: false, message: 'Error fetching settings' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { category, settings: categorySettings } = req.body;
      const companyId = req.user.company_id || 1; // Default to company 1 if not specified
      
      for (const [key, value] of Object.entries(categorySettings)) {
        await pool.query(
          `INSERT INTO system_settings (company_id, setting_key, setting_value) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
          [companyId, key, value, value]
        );
      }
      
      res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ success: false, message: 'Error saving settings' });
    }
  });

  router.put('/', authenticateToken, async (req, res) => {
    try {
      const settings = req.body;
      const companyId = req.user.company_id || 1; // Default to company 1 if not specified
      
      for (const [category, categorySettings] of Object.entries(settings)) {
        for (const [key, value] of Object.entries(categorySettings)) {
          await pool.query(
            `INSERT INTO system_settings (company_id, setting_key, setting_value) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
            [companyId, key, value, value]
          );
        }
      }
      
      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ success: false, message: 'Error updating settings' });
    }
  });

  // Handle specific setting updates (e.g., /settings/general/siteName)
  router.put('/:category/:key', authenticateToken, async (req, res) => {
    try {
      const { category, key } = req.params;
      const { value, type = 'string' } = req.body;
      const companyId = req.user.company_id || 1; // Default to company 1 if not specified
      
      // Debug logging
      console.log('Setting update request:', { category, key, value, type, companyId });
      
      // Ensure value is properly serialized
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      await pool.query(
        `INSERT INTO system_settings (company_id, setting_key, setting_value) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
        [companyId, key, serializedValue, serializedValue]
      );
      
      res.json({ success: true, message: 'Setting updated successfully' });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ success: false, message: 'Error updating setting' });
    }
  });

  router.get('/export', authenticateToken, async (req, res) => {
    try {
      const { categories } = req.query;
      let query = 'SELECT * FROM system_settings';
      let params = [];
      
      if (categories) {
        const categoryList = categories.split(',');
        query += ' WHERE setting_key LIKE ?';
        params.push(`%${categoryList[0]}%`);
      }
      
      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error exporting settings:', error);
      res.status(500).json({ success: false, message: 'Error exporting settings' });
    }
  });

  router.post('/import', authenticateToken, async (req, res) => {
    try {
      const { settings } = req.body;
      const companyId = req.user.company_id || 1;
      
      for (const setting of settings) {
        await pool.query(
          `INSERT INTO system_settings (company_id, setting_key, setting_value) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
          [companyId, setting.setting_key, setting.setting_value, setting.setting_value]
        );
      }
      
      res.json({ success: true, message: 'Settings imported successfully' });
    } catch (error) {
      console.error('Error importing settings:', error);
      res.status(500).json({ success: false, message: 'Error importing settings' });
    }
  });
  
  return router;
};

