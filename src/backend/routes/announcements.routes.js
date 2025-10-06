const express = require('express');

module.exports = (pool, authenticateToken) => {
  const router = express.Router();

/**
 * GET /api/v1/announcements
 * Get all announcements for the company
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      'SELECT * FROM announcements WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
});

/**
 * GET /api/v1/announcements/:id
 * Get a specific announcement
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      'SELECT * FROM announcements WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcement' });
  }
});

/**
 * POST /api/v1/announcements
 * Create a new announcement
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      priority = 'normal',
      target_audience = 'all',
      expiry_date,
      is_published = false
    } = req.body;
    
    const companyId = req.user.company_id || 1;
    const userId = req.user.id;
    
    const [result] = await pool.query(
      `INSERT INTO announcements (company_id, user_id, title, content, priority, target_audience, expiry_date, is_published, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [companyId, userId, title, content, priority, target_audience, expiry_date, is_published]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Announcement created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Error creating announcement' });
  }
});

/**
 * PUT /api/v1/announcements/:id
 * Update an announcement
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      priority,
      target_audience,
      expiry_date,
      is_published
    } = req.body;
    
    const companyId = req.user.company_id || 1;
    
    const [result] = await pool.query(
      `UPDATE announcements SET title = ?, content = ?, priority = ?, target_audience = ?, expiry_date = ?, is_published = ?, updated_at = NOW() 
       WHERE id = ? AND company_id = ?`,
      [title, content, priority, target_audience, expiry_date, is_published, id, companyId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Error updating announcement' });
  }
});

/**
 * DELETE /api/v1/announcements/:id
 * Delete an announcement
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id || 1;
    
    const [result] = await pool.query(
      'DELETE FROM announcements WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Error deleting announcement' });
  }
});

/**
 * PUT /api/v1/announcements/:id/publish
 * Publish/unpublish an announcement
 */
router.put('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    const companyId = req.user.company_id || 1;
    
    const [result] = await pool.query(
      'UPDATE announcements SET is_published = ?, updated_at = NOW() WHERE id = ? AND company_id = ?',
      [is_published, id, companyId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, message: `Announcement ${is_published ? 'published' : 'unpublished'} successfully` });
  } catch (error) {
    console.error('Error updating announcement status:', error);
    res.status(500).json({ success: false, message: 'Error updating announcement status' });
  }
});

  return router;
};
