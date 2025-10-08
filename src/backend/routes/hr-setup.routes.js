/**
 * HR Setup Routes
 * HR system configuration and setup
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // Get attendance calculation rules
  router.get('/attendance-rules', authenticateToken, async (req, res) => {
    try {
      const [rules] = await pool.query(
        'SELECT * FROM attendance_calculation_rules ORDER BY created_at DESC'
      );
      
      res.json({ success: true, data: rules });
    } catch (error) {
      console.error('Error fetching attendance rules:', error);
      res.status(500).json({ success: false, message: 'Error fetching attendance rules' });
    }
  });

  // Create attendance calculation rule
  router.post('/attendance-rules', authenticateToken, async (req, res) => {
    try {
      const { name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active } = req.body;

      const [result] = await pool.query(
        `INSERT INTO attendance_calculation_rules 
         (name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active]
      );

      res.status(201).json({ 
        success: true, 
        message: 'Attendance rule created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error creating attendance rule:', error);
      res.status(500).json({ success: false, message: 'Error creating attendance rule' });
    }
  });

  // Update attendance calculation rule
  router.put('/attendance-rules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active } = req.body;

      await pool.query(
        `UPDATE attendance_calculation_rules SET 
          name = ?, type = ?, min_hours = ?, max_hours = ?, grace_period_minutes = ?, 
          overtime_threshold_hours = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active, id]
      );

      res.json({ success: true, message: 'Attendance rule updated successfully' });
    } catch (error) {
      console.error('Error updating attendance rule:', error);
      res.status(500).json({ success: false, message: 'Error updating attendance rule' });
    }
  });

  // Delete attendance calculation rule
  router.delete('/attendance-rules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      await pool.query('DELETE FROM attendance_calculation_rules WHERE id = ?', [id]);

      res.json({ success: true, message: 'Attendance rule deleted successfully' });
    } catch (error) {
      console.error('Error deleting attendance rule:', error);
      res.status(500).json({ success: false, message: 'Error deleting attendance rule' });
    }
  });

          // Weekend Configuration Routes
          router.get('/weekend-configs', authenticateToken, async (req, res) => {
            try {
              const [configs] = await pool.query('SELECT * FROM weekend_configs ORDER BY day_of_week');
              res.json({ success: true, data: configs });
            } catch (error) {
              console.error('Error fetching weekend configs:', error);
              res.status(500).json({ success: false, message: 'Error fetching weekend configs' });
            }
          });

          router.post('/weekend-configs', authenticateToken, async (req, res) => {
            try {
              const { name, day_of_week, is_active, description } = req.body;

              if (!name || day_of_week === undefined) {
                return res.status(400).json({ success: false, message: 'Name and day_of_week are required' });
              }

              const [result] = await pool.query(
                `INSERT INTO weekend_configs (name, day_of_week, is_active, description)
                 VALUES (?, ?, ?, ?)`,
                [name, day_of_week, is_active !== undefined ? is_active : true, description || '']
              );

              res.status(201).json({ success: true, message: 'Weekend config created successfully', data: { id: result.insertId } });
            } catch (error) {
              console.error('Error creating weekend config:', error);
              res.status(500).json({ success: false, message: 'Error creating weekend config' });
            }
          });

          router.put('/weekend-configs/:id', authenticateToken, async (req, res) => {
            try {
              const { id } = req.params;
              const { name, day_of_week, is_active, description } = req.body;

              if (!name || day_of_week === undefined) {
                return res.status(400).json({ success: false, message: 'Name and day_of_week are required' });
              }

              await pool.query(
                `UPDATE weekend_configs SET name = ?, day_of_week = ?, is_active = ?, description = ?, updated_at = NOW()
                 WHERE id = ?`,
                [name, day_of_week, is_active !== undefined ? is_active : true, description || '', id]
              );

              res.json({ success: true, message: 'Weekend config updated successfully' });
            } catch (error) {
              console.error('Error updating weekend config:', error);
              res.status(500).json({ success: false, message: 'Error updating weekend config' });
            }
          });

          router.delete('/weekend-configs/:id', authenticateToken, async (req, res) => {
            try {
              const { id } = req.params;
              await pool.query('DELETE FROM weekend_configs WHERE id = ?', [id]);
              res.json({ success: true, message: 'Weekend config deleted successfully' });
            } catch (error) {
              console.error('Error deleting weekend config:', error);
              res.status(500).json({ success: false, message: 'Error deleting weekend config' });
            }
          });

          return router;
        };