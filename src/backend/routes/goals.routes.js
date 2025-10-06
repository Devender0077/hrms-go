/**
 * Goals & Performance Routes
 * Goals management, tracking, performance metrics
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { employee_id, status, category } = req.query;
      let query = `
        SELECT g.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_id
        FROM goals g
        LEFT JOIN employees e ON g.employee_id = e.id
        WHERE 1=1
      `;
      let params = [];
      
      if (employee_id) {
        query += ' AND g.employee_id = ?';
        params.push(employee_id);
      }
      
      if (status) {
        query += ' AND g.status = ?';
        params.push(status);
      }
      
      if (category) {
        query += ' AND g.category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY g.created_at DESC';
      
      const [goals] = await pool.query(query, params);
      res.json({ success: true, data: goals });
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ success: false, message: 'Error fetching goals' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { employee_id, title, description, category, target_value, start_date, end_date, status, priority, created_by } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO goals (employee_id, title, description, category, target_value, start_date, end_date, status, priority, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, title, description, category, target_value, start_date, end_date, status || 'not_started', priority || 'medium', created_by || req.user.id]
      );
      
      res.status(201).json({ success: true, message: 'Goal created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ success: false, message: 'Error creating goal' });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category, target_value, start_date, end_date, status, priority } = req.body;
      
      await pool.query(
        `UPDATE goals SET title = ?, description = ?, category = ?, target_value = ?, 
         start_date = ?, end_date = ?, status = ?, priority = ?
         WHERE id = ?`,
        [title, description, category, target_value, start_date, end_date, status, priority, id]
      );
      
      res.json({ success: true, message: 'Goal updated successfully' });
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ success: false, message: 'Error updating goal' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM goals WHERE id = ?', [id]);
      res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ success: false, message: 'Error deleting goal' });
    }
  });

  router.put('/:id/progress', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { current_value, progress, notes } = req.body;
      
      await pool.query(
        `UPDATE goals SET current_value = ?, progress = ? WHERE id = ?`,
        [current_value, progress, id]
      );
      
      if (notes) {
        await pool.query(
          `INSERT INTO goal_tracking (goal_id, update_date, progress_value, notes)
           VALUES (?, CURDATE(), ?, ?)`,
          [id, current_value, notes]
        );
      }
      
      res.json({ success: true, message: 'Goal progress updated successfully' });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      res.status(500).json({ success: false, message: 'Error updating goal progress' });
    }
  });

  router.get('/:id/tracking', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [tracking] = await pool.query(
        `SELECT * FROM goal_tracking WHERE goal_id = ? ORDER BY update_date DESC`,
        [id]
      );
      res.json({ success: true, data: tracking });
    } catch (error) {
      console.error('Error fetching goal tracking:', error);
      res.status(500).json({ success: false, message: 'Error fetching goal tracking' });
    }
  });
  
  return router;
};

