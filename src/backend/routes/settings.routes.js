/**
 * Settings Routes
 * System settings, configuration, export/import
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM settings ORDER BY category, setting_key');
      const settings = {};
      rows.forEach(row => {
        if (!settings[row.category]) {
          settings[row.category] = {};
        }
        settings[row.category][row.setting_key] = row.setting_value;
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
      
      for (const [key, value] of Object.entries(categorySettings)) {
        await pool.query(
          `INSERT INTO settings (category, setting_key, setting_value) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [category, key, value, value]
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
      
      for (const [category, categorySettings] of Object.entries(settings)) {
        for (const [key, value] of Object.entries(categorySettings)) {
          await pool.query(
            `INSERT INTO settings (category, setting_key, setting_value) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [category, key, value, value]
          );
        }
      }
      
      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ success: false, message: 'Error updating settings' });
    }
  });

  router.get('/export', authenticateToken, async (req, res) => {
    try {
      const { categories } = req.query;
      let query = 'SELECT * FROM settings';
      let params = [];
      
      if (categories) {
        const categoryList = categories.split(',');
        query += ' WHERE category IN (?)';
        params.push(categoryList);
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
      
      for (const setting of settings) {
        await pool.query(
          `INSERT INTO settings (category, setting_key, setting_value) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [setting.category, setting.setting_key, setting.setting_value, setting.setting_value]
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

