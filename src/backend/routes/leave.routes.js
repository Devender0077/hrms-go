/**
 * Leave Management Routes
 * Leave applications, types, balances, approvals, policies, holidays
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // =====================================================
  // LEAVE TYPES
  // =====================================================
  
  router.get('/types', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const [rows] = await pool.query(
        'SELECT * FROM leave_types WHERE company_id = ? ORDER BY created_at DESC',
        [companyId]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching leave types:', error);
      res.status(500).json({ success: false, message: 'Error fetching leave types' });
    }
  });

  router.post('/types', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, code, description, days_per_year, is_paid, requires_approval, status } = req.body;
      const [result] = await pool.query(
        `INSERT INTO leave_types (company_id, name, code, description, days_per_year, is_paid, requires_approval, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, code, description, days_per_year, is_paid, requires_approval, status || 'active']
      );
      res.status(201).json({ success: true, message: 'Leave type created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating leave type:', error);
      res.status(500).json({ success: false, message: 'Error creating leave type' });
    }
  });

  router.put('/types/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || 1;
      const { name, code, description, days_per_year, is_paid, requires_approval, status } = req.body;
      await pool.query(
        `UPDATE leave_types SET name = ?, code = ?, description = ?, days_per_year = ?, is_paid = ?, requires_approval = ?, status = ?
         WHERE id = ? AND company_id = ?`,
        [name, code, description, days_per_year, is_paid, requires_approval, status, id, companyId]
      );
      res.json({ success: true, message: 'Leave type updated successfully' });
    } catch (error) {
      console.error('Error updating leave type:', error);
      res.status(500).json({ success: false, message: 'Error updating leave type' });
    }
  });

  router.delete('/types/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || 1;
      await pool.query('DELETE FROM leave_types WHERE id = ? AND company_id = ?', [id, companyId]);
      res.json({ success: true, message: 'Leave type deleted successfully' });
    } catch (error) {
      console.error('Error deleting leave type:', error);
      res.status(500).json({ success: false, message: 'Error deleting leave type' });
    }
  });
  
  // =====================================================
  // LEAVE APPLICATIONS
  // =====================================================
  
  router.get('/applications', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT la.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.email as employee_email,
                lt.name as leave_type_name, u.name as approved_by_name
         FROM leave_applications la
         LEFT JOIN employees e ON la.employee_id = e.id
         LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
         LEFT JOIN users u ON la.approved_by = u.id
         ORDER BY la.created_at DESC`
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      res.status(500).json({ success: false, message: 'Error fetching leave applications' });
    }
  });

  router.post('/applications', authenticateToken, async (req, res) => {
    try {
      const { employee_id, leave_type_id, start_date, end_date, reason, status } = req.body;
      const [result] = await pool.query(
        `INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, reason, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, leave_type_id, start_date, end_date, reason, status || 'pending']
      );
      res.status(201).json({ success: true, message: 'Leave application created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating leave application:', error);
      res.status(500).json({ success: false, message: 'Error creating leave application' });
    }
  });

  router.put('/applications/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { leave_type_id, start_date, end_date, reason, status } = req.body;
      await pool.query(
        `UPDATE leave_applications SET leave_type_id = ?, start_date = ?, end_date = ?, reason = ?, status = ?
         WHERE id = ?`,
        [leave_type_id, start_date, end_date, reason, status, id]
      );
      res.json({ success: true, message: 'Leave application updated successfully' });
    } catch (error) {
      console.error('Error updating leave application:', error);
      res.status(500).json({ success: false, message: 'Error updating leave application' });
    }
  });

  router.put('/applications/:id/approve', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        `UPDATE leave_applications SET status = 'approved', approved_by = ?, approved_at = NOW()
         WHERE id = ?`,
        [req.user.id, id]
      );
      res.json({ success: true, message: 'Leave application approved successfully' });
    } catch (error) {
      console.error('Error approving leave:', error);
      res.status(500).json({ success: false, message: 'Error approving leave application' });
    }
  });

  router.put('/applications/:id/reject', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;
      await pool.query(
        `UPDATE leave_applications SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ?
         WHERE id = ?`,
        [req.user.id, rejection_reason, id]
      );
      res.json({ success: true, message: 'Leave application rejected successfully' });
    } catch (error) {
      console.error('Error rejecting leave:', error);
      res.status(500).json({ success: false, message: 'Error rejecting leave application' });
    }
  });

  router.delete('/applications/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM leave_applications WHERE id = ?', [id]);
      res.json({ success: true, message: 'Leave application deleted successfully' });
    } catch (error) {
      console.error('Error deleting leave application:', error);
      res.status(500).json({ success: false, message: 'Error deleting leave application' });
    }
  });
  
  // =====================================================
  // LEAVE BALANCES
  // =====================================================
  
  router.get('/balances', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT lb.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, lt.name as leave_type_name
         FROM leave_balances lb
         LEFT JOIN employees e ON lb.employee_id = e.id
         LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
         ORDER BY lb.created_at DESC`
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      res.status(500).json({ success: false, message: 'Error fetching leave balances' });
    }
  });
  
  // =====================================================
  // LEAVE POLICIES
  // =====================================================
  
  router.get('/policies', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const [rows] = await pool.query(
        'SELECT * FROM leave_policies WHERE company_id = ? ORDER BY created_at DESC',
        [companyId]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching leave policies:', error);
      res.status(500).json({ success: false, message: 'Error fetching leave policies' });
    }
  });
  
  // =====================================================
  // LEAVE HOLIDAYS
  // =====================================================
  
  router.get('/holidays', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { country } = req.query;
      
      let query = 'SELECT * FROM leave_holidays WHERE company_id = ?';
      const params = [companyId];
      
      if (country && country !== 'All') {
        query += ' AND country = ?';
        params.push(country);
      }
      
      query += ' ORDER BY date ASC';
      
      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching holidays:', error);
      res.status(500).json({ success: false, message: 'Error fetching holidays' });
    }
  });

  router.post('/holidays', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, date, type, is_recurring, country } = req.body;
      const [result] = await pool.query(
        `INSERT INTO leave_holidays (company_id, name, date, type, country, is_recurring)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [companyId, name, date, type, country || 'Global', is_recurring || 0]
      );
      res.status(201).json({ success: true, message: 'Holiday created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating holiday:', error);
      res.status(500).json({ success: false, message: 'Error creating holiday' });
    }
  });

  router.put('/holidays/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, date, type, is_recurring, country } = req.body;
      
      await pool.query(
        `UPDATE leave_holidays SET name = ?, date = ?, type = ?, country = ?, is_recurring = ?
         WHERE id = ? AND company_id = ?`,
        [name, date, type, country || 'Global', is_recurring || 0, id, req.user?.company_id || 1]
      );
      
      res.json({ success: true, message: 'Holiday updated successfully' });
    } catch (error) {
      console.error('Error updating holiday:', error);
      res.status(500).json({ success: false, message: 'Error updating holiday' });
    }
  });

  router.delete('/holidays/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM leave_holidays WHERE id = ? AND company_id = ?', [id, req.user?.company_id || 1]);
      res.json({ success: true, message: 'Holiday deleted successfully' });
    } catch (error) {
      console.error('Error deleting holiday:', error);
      res.status(500).json({ success: false, message: 'Error deleting holiday' });
    }
  });
  
  return router;
};

