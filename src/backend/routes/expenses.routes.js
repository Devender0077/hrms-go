/**
 * Expenses Management Routes
 * Expense claims, approvals, reimbursements
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken, upload) => {
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { employee_id, status, expense_type_id, from_date, to_date } = req.query;
      let query = `
        SELECT ex.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_id,
               et.name as expense_type_name, u.name as approved_by_name
        FROM expenses ex
        LEFT JOIN employees e ON ex.employee_id = e.id
        LEFT JOIN expense_types et ON ex.expense_type_id = et.id
        LEFT JOIN users u ON ex.approved_by = u.id
        WHERE 1=1
      `;
      let params = [];
      
      if (employee_id) {
        query += ' AND ex.employee_id = ?';
        params.push(employee_id);
      }
      
      if (status) {
        query += ' AND ex.status = ?';
        params.push(status);
      }
      
      if (expense_type_id) {
        query += ' AND ex.expense_type_id = ?';
        params.push(expense_type_id);
      }
      
      if (from_date) {
        query += ' AND ex.expense_date >= ?';
        params.push(from_date);
      }
      
      if (to_date) {
        query += ' AND ex.expense_date <= ?';
        params.push(to_date);
      }
      
      query += ' ORDER BY ex.expense_date DESC';
      
      const [expenses] = await pool.query(query, params);
      res.json({ success: true, data: expenses });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ success: false, message: 'Error fetching expenses' });
    }
  });

  router.post('/', authenticateToken, upload.single('receipt'), async (req, res) => {
    try {
      const { employee_id, expense_type_id, amount, expense_date, description, status } = req.body;
      const receipt_path = req.file ? `/uploads/receipts/${req.file.filename}` : null;
      
      const [result] = await pool.query(
        `INSERT INTO expenses (employee_id, expense_type_id, amount, expense_date, description, receipt_path, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, expense_type_id, amount, expense_date, description, receipt_path, status || 'pending']
      );
      
      res.status(201).json({ success: true, message: 'Expense created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ success: false, message: 'Error creating expense' });
    }
  });

  router.put('/:id', authenticateToken, upload.single('receipt'), async (req, res) => {
    try {
      const { id } = req.params;
      const { expense_type_id, amount, expense_date, description, status } = req.body;
      
      let updateFields = 'expense_type_id = ?, amount = ?, expense_date = ?, description = ?, status = ?';
      let params = [expense_type_id, amount, expense_date, description, status];
      
      if (req.file) {
        updateFields += ', receipt_path = ?';
        params.push(`/uploads/receipts/${req.file.filename}`);
      }
      
      params.push(id);
      
      await pool.query(`UPDATE expenses SET ${updateFields} WHERE id = ?`, params);
      
      res.json({ success: true, message: 'Expense updated successfully' });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ success: false, message: 'Error updating expense' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
      res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ success: false, message: 'Error deleting expense' });
    }
  });

  router.put('/:id/approve', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        `UPDATE expenses SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?`,
        [req.user.id, id]
      );
      res.json({ success: true, message: 'Expense approved successfully' });
    } catch (error) {
      console.error('Error approving expense:', error);
      res.status(500).json({ success: false, message: 'Error approving expense' });
    }
  });

  router.put('/:id/reject', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;
      
      await pool.query(
        `UPDATE expenses SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE id = ?`,
        [req.user.id, rejection_reason, id]
      );
      res.json({ success: true, message: 'Expense rejected successfully' });
    } catch (error) {
      console.error('Error rejecting expense:', error);
      res.status(500).json({ success: false, message: 'Error rejecting expense' });
    }
  });

  router.get('/pending', authenticateToken, async (req, res) => {
    try {
      const [expenses] = await pool.query(
        `SELECT ex.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, et.name as expense_type_name
         FROM expenses ex
         LEFT JOIN employees e ON ex.employee_id = e.id
         LEFT JOIN expense_types et ON ex.expense_type_id = et.id
         WHERE ex.status = 'pending'
         ORDER BY ex.expense_date DESC`
      );
      res.json({ success: true, data: expenses });
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
      res.status(500).json({ success: false, message: 'Error fetching pending expenses' });
    }
  });
  
  return router;
};

