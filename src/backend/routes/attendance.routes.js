/**
 * Attendance & Timekeeping Routes
 * Shifts, policies, attendance records, regularization
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // =====================================================
  // SHIFTS
  // =====================================================
  
  router.get('/shifts', authenticateToken, async (req, res) => {
    try {
      const [shifts] = await pool.query(
        'SELECT * FROM shifts WHERE is_active = 1 ORDER BY created_at DESC'
      );
      res.json({ success: true, data: shifts });
    } catch (error) {
      console.error('Error fetching shifts:', error);
      res.status(500).json({ success: false, message: 'Error fetching shifts' });
    }
  });

  router.post('/shifts', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, start_time, end_time, break_duration, grace_period, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO shifts (company_id, name, start_time, end_time, break_duration, grace_period, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, start_time, end_time, break_duration, grace_period, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Shift created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating shift:', error);
      res.status(500).json({ success: false, message: 'Error creating shift' });
    }
  });

  router.put('/shifts/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, start_time, end_time, break_duration, grace_period, status } = req.body;
      
      await pool.query(
        `UPDATE shifts SET name = ?, start_time = ?, end_time = ?, break_duration = ?, grace_period = ?, status = ?
         WHERE id = ?`,
        [name, start_time, end_time, break_duration, grace_period, status, id]
      );
      
      res.json({ success: true, message: 'Shift updated successfully' });
    } catch (error) {
      console.error('Error updating shift:', error);
      res.status(500).json({ success: false, message: 'Error updating shift' });
    }
  });

  router.delete('/shifts/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM shifts WHERE id = ?', [id]);
      res.json({ success: true, message: 'Shift deleted successfully' });
    } catch (error) {
      console.error('Error deleting shift:', error);
      res.status(500).json({ success: false, message: 'Error deleting shift' });
    }
  });
  
  // =====================================================
  // ATTENDANCE POLICIES
  // =====================================================
  
  router.get('/policies', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const [policies] = await pool.query(
        'SELECT * FROM attendance_policies WHERE company_id = ? ORDER BY created_at DESC',
        [companyId]
      );
      res.json({ success: true, data: policies });
    } catch (error) {
      console.error('Error fetching policies:', error);
      res.status(500).json({ success: false, message: 'Error fetching policies' });
    }
  });

  router.post('/policies', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, description, late_arrival_grace, early_departure_grace, half_day_hours, full_day_hours, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO attendance_policies (company_id, name, description, late_arrival_grace, early_departure_grace, half_day_hours, full_day_hours, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, description, late_arrival_grace, early_departure_grace, half_day_hours, full_day_hours, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Policy created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating policy:', error);
      res.status(500).json({ success: false, message: 'Error creating policy' });
    }
  });

  router.put('/policies/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, late_arrival_grace, early_departure_grace, half_day_hours, full_day_hours, status } = req.body;
      
      await pool.query(
        `UPDATE attendance_policies SET name = ?, description = ?, late_arrival_grace = ?, early_departure_grace = ?, 
         half_day_hours = ?, full_day_hours = ?, status = ?
         WHERE id = ?`,
        [name, description, late_arrival_grace, early_departure_grace, half_day_hours, full_day_hours, status, id]
      );
      
      res.json({ success: true, message: 'Policy updated successfully' });
    } catch (error) {
      console.error('Error updating policy:', error);
      res.status(500).json({ success: false, message: 'Error updating policy' });
    }
  });

  router.delete('/policies/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM attendance_policies WHERE id = ?', [id]);
      res.json({ success: true, message: 'Policy deleted successfully' });
    } catch (error) {
      console.error('Error deleting policy:', error);
      res.status(500).json({ success: false, message: 'Error deleting policy' });
    }
  });
  
  // =====================================================
  // ATTENDANCE RECORDS
  // =====================================================
  
  router.get('/records', authenticateToken, async (req, res) => {
    try {
      const { employee_id, date_from, date_to, status } = req.query;
      let query = `
        SELECT ar.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id
        FROM attendance_records ar
        LEFT JOIN employees e ON ar.employee_id = e.id
        WHERE 1=1
      `;
      let params = [];
      
      if (employee_id) {
        query += ' AND ar.employee_id = ?';
        params.push(employee_id);
      }
      
      if (date_from) {
        query += ' AND ar.date >= ?';
        params.push(date_from);
      }
      
      if (date_to) {
        query += ' AND ar.date <= ?';
        params.push(date_to);
      }
      
      if (status) {
        query += ' AND ar.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY ar.date DESC, ar.check_in DESC';
      
      const [records] = await pool.query(query, params);
      res.json({ success: true, data: records });
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({ success: false, message: 'Error fetching attendance records' });
    }
  });

  router.post('/records', authenticateToken, async (req, res) => {
    try {
      const { employee_id, date, check_in, check_out, status, remarks } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO attendance_records (employee_id, date, check_in, check_out, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, date, check_in, check_out, status || 'present', remarks]
      );
      
      res.status(201).json({ success: true, message: 'Attendance record created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating attendance record:', error);
      res.status(500).json({ success: false, message: 'Error creating attendance record' });
    }
  });

  router.put('/records/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { check_in, check_out, status, remarks } = req.body;
      
      await pool.query(
        `UPDATE attendance_records SET check_in = ?, check_out = ?, status = ?, remarks = ?
         WHERE id = ?`,
        [check_in, check_out, status, remarks, id]
      );
      
      res.json({ success: true, message: 'Attendance record updated successfully' });
    } catch (error) {
      console.error('Error updating attendance record:', error);
      res.status(500).json({ success: false, message: 'Error updating attendance record' });
    }
  });

  router.delete('/records/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM attendance_records WHERE id = ?', [id]);
      res.json({ success: true, message: 'Attendance record deleted successfully' });
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      res.status(500).json({ success: false, message: 'Error deleting attendance record' });
    }
  });
  
  // =====================================================
  // ATTENDANCE REGULATIONS
  // =====================================================
  
  router.get('/regulations', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const [regulations] = await pool.query(
        'SELECT * FROM attendance_regulations WHERE company_id = ? ORDER BY created_at DESC',
        [companyId]
      );
      res.json({ success: true, data: regulations });
    } catch (error) {
      console.error('Error fetching regulations:', error);
      res.status(500).json({ success: false, message: 'Error fetching regulations' });
    }
  });

  router.post('/regulations', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, description, rule_type, penalty_type, penalty_value, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO attendance_regulations (company_id, name, description, rule_type, penalty_type, penalty_value, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, description, rule_type, penalty_type, penalty_value, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Regulation created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating regulation:', error);
      res.status(500).json({ success: false, message: 'Error creating regulation' });
    }
  });
  
  // =====================================================
  // REGULARIZATION REQUESTS
  // =====================================================
  
  router.get('/regularization', authenticateToken, async (req, res) => {
    try {
      const [requests] = await pool.query(
        `SELECT rr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id,
                CONCAT(a.first_name, ' ', a.last_name) as approver_name
         FROM attendance_regularization rr
         LEFT JOIN employees e ON rr.employee_id = e.id
         LEFT JOIN users a ON rr.approved_by = a.id
         ORDER BY rr.created_at DESC`
      );
      res.json({ success: true, data: requests });
    } catch (error) {
      console.error('Error fetching regularization requests:', error);
      res.status(500).json({ success: false, message: 'Error fetching regularization requests' });
    }
  });

  router.post('/regularization', authenticateToken, async (req, res) => {
    try {
      const { employee_id, date, requested_check_in, requested_check_out, reason, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO attendance_regularization (employee_id, date, requested_check_in, requested_check_out, reason, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, date, requested_check_in, requested_check_out, reason, status || 'pending']
      );
      
      res.status(201).json({ success: true, message: 'Regularization request created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating regularization request:', error);
      res.status(500).json({ success: false, message: 'Error creating regularization request' });
    }
  });

  router.put('/regularization/:id/approve', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      await pool.query(
        `UPDATE attendance_regularization SET status = 'approved', approved_by = ?, approved_at = NOW()
         WHERE id = ?`,
        [req.user.id, id]
      );
      
      res.json({ success: true, message: 'Regularization request approved successfully' });
    } catch (error) {
      console.error('Error approving regularization:', error);
      res.status(500).json({ success: false, message: 'Error approving regularization request' });
    }
  });

  router.put('/regularization/:id/reject', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;
      
      await pool.query(
        `UPDATE attendance_regularization SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ?
         WHERE id = ?`,
        [req.user.id, rejection_reason, id]
      );
      
      res.json({ success: true, message: 'Regularization request rejected successfully' });
    } catch (error) {
      console.error('Error rejecting regularization:', error);
      res.status(500).json({ success: false, message: 'Error rejecting regularization request' });
    }
  });
  
  return router;
};

