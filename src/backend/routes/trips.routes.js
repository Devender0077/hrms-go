const express = require('express');

module.exports = (pool, authenticateToken) => {
  const router = express.Router();

/**
 * GET /api/v1/trips
 * Get all trips for the company
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ success: false, message: 'Error fetching trips' });
  }
});

/**
 * GET /api/v1/trips/:id
 * Get a specific trip
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ success: false, message: 'Error fetching trip' });
  }
});

/**
 * POST /api/v1/trips
 * Create a new trip
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      employee_id,
      destination,
      purpose,
      start_date,
      end_date,
      estimated_cost,
      status = 'pending'
    } = req.body;
    
    const companyId = req.user.company_id || 1;
    
    const [result] = await pool.query(
      `INSERT INTO trips (company_id, employee_id, destination, purpose, start_date, end_date, estimated_cost, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [companyId, employee_id, destination, purpose, start_date, end_date, estimated_cost, status]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Trip created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ success: false, message: 'Error creating trip' });
  }
});

/**
 * PUT /api/v1/trips/:id
 * Update a trip
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      destination,
      purpose,
      start_date,
      end_date,
      estimated_cost,
      status
    } = req.body;
    
    const companyId = req.user.company_id || 1;
    
    const [result] = await pool.query(
      `UPDATE trips SET destination = ?, purpose = ?, start_date = ?, end_date = ?, estimated_cost = ?, status = ?, updated_at = NOW() 
       WHERE id = ? AND company_id = ?`,
      [destination, purpose, start_date, end_date, estimated_cost, status, id, companyId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    res.json({ success: true, message: 'Trip updated successfully' });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ success: false, message: 'Error updating trip' });
  }
});

/**
 * DELETE /api/v1/trips/:id
 * Delete a trip
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id || 1;
    
    const [result] = await pool.query(
      'DELETE FROM trips WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ success: false, message: 'Error deleting trip' });
  }
});

  return router;
};
