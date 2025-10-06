const express = require('express');

module.exports = (pool, authenticateToken) => {
  const router = express.Router();

/**
 * GET /api/v1/training/programs
 * Get all training programs for the company
 */
router.get('/programs', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      'SELECT * FROM training_programs WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching training programs:', error);
    res.status(500).json({ success: false, message: 'Error fetching training programs' });
  }
});

/**
 * GET /api/v1/training/programs/:id
 * Get a specific training program
 */
router.get('/programs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM training_programs WHERE id = ? AND company_id = ?',
      [id, req.user.company_id || 1]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching training program:', error);
    res.status(500).json({ success: false, message: 'Error fetching training program' });
  }
});

/**
 * POST /api/v1/training/programs
 * Create a new training program
 */
router.post('/programs', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      duration,
      cost,
      trainer,
      status = 'active'
    } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO training_programs 
       (company_id, name, description, duration, cost, trainer, status, created_by, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.company_id || 1,
        name,
        description,
        duration,
        cost,
        trainer,
        status,
        req.user.id
      ]
    );
    
    res.json({ 
      success: true, 
      message: 'Training program created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating training program:', error);
    res.status(500).json({ success: false, message: 'Error creating training program' });
  }
});

/**
 * PUT /api/v1/training/programs/:id
 * Update a training program
 */
router.put('/programs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      duration,
      cost,
      trainer,
      status
    } = req.body;
    
    const [result] = await pool.query(
      `UPDATE training_programs 
       SET name = ?, description = ?, duration = ?, cost = ?, trainer = ?, status = ?, updated_at = NOW()
       WHERE id = ? AND company_id = ?`,
      [
        name,
        description,
        duration,
        cost,
        trainer,
        status,
        id,
        req.user.company_id || 1
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }
    
    res.json({ success: true, message: 'Training program updated successfully' });
  } catch (error) {
    console.error('Error updating training program:', error);
    res.status(500).json({ success: false, message: 'Error updating training program' });
  }
});

/**
 * DELETE /api/v1/training/programs/:id
 * Delete a training program
 */
router.delete('/programs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM training_programs WHERE id = ? AND company_id = ?',
      [id, req.user.company_id || 1]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }
    
    res.json({ success: true, message: 'Training program deleted successfully' });
  } catch (error) {
    console.error('Error deleting training program:', error);
    res.status(500).json({ success: false, message: 'Error deleting training program' });
  }
});

/**
 * GET /api/v1/training/enrollments
 * Get all training enrollments for the company
 */
router.get('/enrollments', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      `SELECT te.*, tp.name as program_name, e.first_name, e.last_name, e.email
       FROM training_enrollments te
       LEFT JOIN training_programs tp ON te.program_id = tp.id
       LEFT JOIN employees e ON te.employee_id = e.id
       WHERE te.company_id = ? 
       ORDER BY te.enrolled_at DESC`,
      [companyId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching training enrollments:', error);
    res.status(500).json({ success: false, message: 'Error fetching training enrollments' });
  }
});

/**
 * POST /api/v1/training/enrollments
 * Enroll an employee in a training program
 */
router.post('/enrollments', authenticateToken, async (req, res) => {
  try {
    const { employee_id, program_id, enrolled_by } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO training_enrollments 
       (company_id, employee_id, program_id, enrolled_by, enrolled_at, status) 
       VALUES (?, ?, ?, ?, NOW(), 'enrolled')`,
      [
        req.user.company_id || 1,
        employee_id,
        program_id,
        enrolled_by || req.user.id
      ]
    );
    
    res.json({ 
      success: true, 
      message: 'Employee enrolled in training program successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error enrolling employee:', error);
    res.status(500).json({ success: false, message: 'Error enrolling employee' });
  }
});

/**
 * PUT /api/v1/training/enrollments/:id/complete
 * Mark training enrollment as completed
 */
router.put('/enrollments/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { completion_date, grade, notes } = req.body;
    
    const [result] = await pool.query(
      `UPDATE training_enrollments 
       SET status = 'completed', completion_date = ?, grade = ?, notes = ?, updated_at = NOW()
       WHERE id = ? AND company_id = ?`,
      [
        completion_date || new Date().toISOString().split('T')[0],
        grade,
        notes,
        id,
        req.user.company_id || 1
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Training enrollment not found' });
    }
    
    res.json({ success: true, message: 'Training enrollment completed successfully' });
  } catch (error) {
    console.error('Error completing training enrollment:', error);
    res.status(500).json({ success: false, message: 'Error completing training enrollment' });
  }
});

return router;
};
