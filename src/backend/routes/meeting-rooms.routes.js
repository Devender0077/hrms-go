/**
 * Meeting Rooms Routes
 * Manage meeting rooms and locations
 */

const express = require('express');

module.exports = (pool, authenticateToken) => {
  const router = express.Router();

  /**
   * GET /api/v1/meeting-rooms
   * Get all meeting rooms
   */
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user.company_id || 1;
      const [rows] = await pool.query(
        'SELECT * FROM meeting_rooms WHERE company_id = ? ORDER BY name ASC',
        [companyId]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching meeting rooms:', error);
      res.status(500).json({ success: false, message: 'Error fetching meeting rooms' });
    }
  });

  /**
   * POST /api/v1/meeting-rooms
   * Create a new meeting room
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { name, location, capacity, equipment, status } = req.body;
      const companyId = req.user.company_id || 1;

      const [result] = await pool.query(
        'INSERT INTO meeting_rooms (company_id, name, location, capacity, equipment, status) VALUES (?, ?, ?, ?, ?, ?)',
        [companyId, name, location, capacity || 10, equipment || '', status || 'active']
      );

      res.json({ 
        success: true, 
        message: 'Meeting room created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error creating meeting room:', error);
      res.status(500).json({ success: false, message: 'Error creating meeting room' });
    }
  });

  /**
   * PUT /api/v1/meeting-rooms/:id
   * Update a meeting room
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, location, capacity, equipment, status } = req.body;
      const companyId = req.user.company_id || 1;

      await pool.query(
        'UPDATE meeting_rooms SET name = ?, location = ?, capacity = ?, equipment = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND company_id = ?',
        [name, location, capacity, equipment, status, id, companyId]
      );

      res.json({ success: true, message: 'Meeting room updated successfully' });
    } catch (error) {
      console.error('Error updating meeting room:', error);
      res.status(500).json({ success: false, message: 'Error updating meeting room' });
    }
  });

  /**
   * DELETE /api/v1/meeting-rooms/:id
   * Delete a meeting room
   */
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.company_id || 1;

      await pool.query(
        'DELETE FROM meeting_rooms WHERE id = ? AND company_id = ?',
        [id, companyId]
      );

      res.json({ success: true, message: 'Meeting room deleted successfully' });
    } catch (error) {
      console.error('Error deleting meeting room:', error);
      res.status(500).json({ success: false, message: 'Error deleting meeting room' });
    }
  });

  return router;
};
