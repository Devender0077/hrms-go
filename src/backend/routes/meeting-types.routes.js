/**
 * Meeting Types Routes
 * Manage different types of meetings
 */

const express = require('express');

module.exports = (pool, authenticateToken) => {
  const router = express.Router();

  /**
   * GET /api/v1/meeting-types
   * Get all meeting types
   */
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user.company_id || 1;
      const [rows] = await pool.query(
        'SELECT * FROM meeting_types WHERE company_id = ? ORDER BY name ASC',
        [companyId]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching meeting types:', error);
      res.status(500).json({ success: false, message: 'Error fetching meeting types' });
    }
  });

  /**
   * POST /api/v1/meeting-types
   * Create a new meeting type
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { name, description, color, default_duration } = req.body;
      const companyId = req.user.company_id || 1;

      const [result] = await pool.query(
        'INSERT INTO meeting_types (company_id, name, description, color, default_duration, status) VALUES (?, ?, ?, ?, ?, ?)',
        [companyId, name, description, color || '#3b82f6', default_duration || 60, 'active']
      );

      res.json({ 
        success: true, 
        message: 'Meeting type created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error creating meeting type:', error);
      res.status(500).json({ success: false, message: 'Error creating meeting type' });
    }
  });

  /**
   * PUT /api/v1/meeting-types/:id
   * Update a meeting type
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, color, default_duration, status } = req.body;
      const companyId = req.user.company_id || 1;

      await pool.query(
        'UPDATE meeting_types SET name = ?, description = ?, color = ?, default_duration = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?',
        [name, description, color, default_duration, status, id, companyId]
      );

      res.json({ success: true, message: 'Meeting type updated successfully' });
    } catch (error) {
      console.error('Error updating meeting type:', error);
      res.status(500).json({ success: false, message: 'Error updating meeting type' });
    }
  });

  /**
   * DELETE /api/v1/meeting-types/:id
   * Delete a meeting type
   */
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.company_id || 1;

      await pool.query(
        'DELETE FROM meeting_types WHERE id = ? AND company_id = ?',
        [id, companyId]
      );

      res.json({ success: true, message: 'Meeting type deleted successfully' });
    } catch (error) {
      console.error('Error deleting meeting type:', error);
      res.status(500).json({ success: false, message: 'Error deleting meeting type' });
    }
  });

  return router;
};
