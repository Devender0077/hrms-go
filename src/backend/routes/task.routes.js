/**
 * Task Management Routes
 * Task CRUD, assignments, comments, status updates
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // Get all tasks
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { status, priority, assignee } = req.query;
      let query = 'SELECT * FROM tasks WHERE 1=1';
      let params = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      if (priority) {
        query += ' AND priority = ?';
        params.push(priority);
      }
      
      if (assignee) {
        query += ' AND assignee_id = ?';
        params.push(assignee);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [tasks] = await pool.query(query, params);
      res.json({ success: true, data: tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { title, description, priority, status, assignee_id, due_date, estimated_hours } = req.body;
      const created_by = req.user.id;
      
      const [result] = await pool.query(
        `INSERT INTO tasks (title, description, priority, status, assignee_id, due_date, estimated_hours, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, priority, status || 'pending', assignee_id, due_date, estimated_hours, created_by]
      );
      
      res.status(201).json({ success: true, message: 'Task created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ success: false, message: 'Error creating task' });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, priority, status, assignee_id, due_date, estimated_hours, actual_hours, progress } = req.body;
      
      await pool.query(
        `UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, assignee_id = ?, 
         due_date = ?, estimated_hours = ?, actual_hours = ?, progress = ?
         WHERE id = ?`,
        [title, description, priority, status, assignee_id, due_date, estimated_hours, actual_hours, progress, id]
      );
      
      res.json({ success: true, message: 'Task updated successfully' });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ success: false, message: 'Error updating task' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ success: false, message: 'Error deleting task' });
    }
  });

  router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const user_id = req.user.id;
      
      const [result] = await pool.query(
        `INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)`,
        [id, user_id, comment]
      );
      
      res.status(201).json({ success: true, message: 'Comment added successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ success: false, message: 'Error adding comment' });
    }
  });
  
  return router;
};

