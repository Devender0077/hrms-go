const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

// ATTENDANCE RECORDS ROUTES

// Get all attendance records
router.get('/attendance-records', authenticateToken, async (req, res) => {
  try {
    const { employee_id, start_date, end_date, status } = req.query;
    
    let query = `
      SELECT ar.*, u.first_name, u.last_name, u.email
      FROM attendance_records ar
      LEFT JOIN users u ON ar.employee_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (employee_id) {
      query += ' AND ar.employee_id = ?';
      params.push(employee_id);
    }
    
    if (start_date) {
      query += ' AND ar.date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND ar.date <= ?';
      params.push(end_date);
    }
    
    if (status) {
      query += ' AND ar.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ar.date DESC, ar.check_in_time DESC';
    
    const [records] = await pool.query(query, params);
    
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance records' });
  }
});

// Get attendance record by ID
router.get('/attendance-records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [records] = await pool.query(`
      SELECT ar.*, u.first_name, u.last_name, u.email
      FROM attendance_records ar
      LEFT JOIN users u ON ar.employee_id = u.id
      WHERE ar.id = ?
    `, [id]);
    
    if (records.length === 0) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    res.json({ success: true, data: records[0] });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance record' });
  }
});

// Create attendance record (check-in)
router.post('/attendance-records/check-in', authenticateToken, async (req, res) => {
  try {
    const { employee_id, date } = req.body;
    const check_in_time = new Date();
    
    // Check if record already exists for this date
    const [existing] = await pool.query(
      'SELECT id FROM attendance_records WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );
    
    if (existing.length > 0) {
      // Update existing record
      await pool.query(`
        UPDATE attendance_records 
        SET check_in_time = ?, status = 'present'
        WHERE employee_id = ? AND date = ?
      `, [check_in_time, employee_id, date]);
      
      res.json({ success: true, message: 'Check-in updated successfully' });
    } else {
      // Create new record
      const [result] = await pool.query(`
        INSERT INTO attendance_records (employee_id, date, check_in_time, status)
        VALUES (?, ?, ?, 'present')
      `, [employee_id, date, check_in_time]);
      
      res.json({ success: true, data: { id: result.insertId } });
    }
  } catch (error) {
    console.error('Error creating check-in record:', error);
    res.status(500).json({ success: false, message: 'Error creating check-in record' });
  }
});

// Update attendance record (check-out)
router.put('/attendance-records/check-out', authenticateToken, async (req, res) => {
  try {
    const { employee_id, date } = req.body;
    const check_out_time = new Date();
    
    const [existing] = await pool.query(
      'SELECT check_in_time FROM attendance_records WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'No check-in record found' });
    }
    
    const check_in_time = new Date(existing[0].check_in_time);
    const total_hours = (check_out_time - check_in_time) / (1000 * 60 * 60); // Convert to hours
    const overtime_hours = Math.max(0, total_hours - 8); // Assuming 8-hour workday
    
    await pool.query(`
      UPDATE attendance_records 
      SET check_out_time = ?, total_hours = ?, overtime_hours = ?
      WHERE employee_id = ? AND date = ?
    `, [check_out_time, total_hours, overtime_hours, employee_id, date]);
    
    res.json({ success: true, message: 'Check-out recorded successfully' });
  } catch (error) {
    console.error('Error updating check-out record:', error);
    res.status(500).json({ success: false, message: 'Error updating check-out record' });
  }
});

// Update attendance record
router.put('/attendance-records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    await pool.query(`UPDATE attendance_records SET ${setClause} WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Attendance record updated successfully' });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ success: false, message: 'Error updating attendance record' });
  }
});

// Delete attendance record
router.delete('/attendance-records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM attendance_records WHERE id = ?', [id]);
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ success: false, message: 'Error deleting attendance record' });
  }
});

// LEAVE APPLICATIONS ROUTES

// Get all leave applications
router.get('/leave-applications', authenticateToken, async (req, res) => {
  try {
    const [applications] = await pool.query(`
      SELECT la.*, u.first_name, u.last_name, u.email, lt.name as leave_type_name,
             a.first_name as approver_first_name, a.last_name as approver_last_name
      FROM leave_applications la
      LEFT JOIN users u ON la.employee_id = u.id
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      LEFT JOIN users a ON la.approved_by = a.id
      ORDER BY la.applied_at DESC
    `);
    
    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    res.status(500).json({ success: false, message: 'Error fetching leave applications' });
  }
});

// Get leave application by ID
router.get('/leave-applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [applications] = await pool.query(`
      SELECT la.*, u.first_name, u.last_name, u.email, lt.name as leave_type_name,
             a.first_name as approver_first_name, a.last_name as approver_last_name
      FROM leave_applications la
      LEFT JOIN users u ON la.employee_id = u.id
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      LEFT JOIN users a ON la.approved_by = a.id
      WHERE la.id = ?
    `, [id]);
    
    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }
    
    res.json({ success: true, data: applications[0] });
  } catch (error) {
    console.error('Error fetching leave application:', error);
    res.status(500).json({ success: false, message: 'Error fetching leave application' });
  }
});

// Create leave application
router.post('/leave-applications', authenticateToken, async (req, res) => {
  try {
    const {
      employee_id, leave_type_id, start_date, end_date, days_requested, reason
    } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, days_requested, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employee_id, leave_type_id, start_date, end_date, days_requested, reason]);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating leave application:', error);
    res.status(500).json({ success: false, message: 'Error creating leave application' });
  }
});

// Update leave application status
router.put('/leave-applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    const approver_id = req.user.id;
    
    const updateFields = ['status = ?', 'approved_by = ?'];
    const values = [status, approver_id];
    
    if (status === 'approved') {
      updateFields.push('approved_at = NOW()');
    } else if (status === 'rejected' && rejection_reason) {
      updateFields.push('rejection_reason = ?');
      values.push(rejection_reason);
    }
    
    values.push(id);
    
    await pool.query(`
      UPDATE leave_applications 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, values);
    
    res.json({ success: true, message: 'Leave application status updated successfully' });
  } catch (error) {
    console.error('Error updating leave application status:', error);
    res.status(500).json({ success: false, message: 'Error updating leave application status' });
  }
});

// Update leave application
router.put('/leave-applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    await pool.query(`UPDATE leave_applications SET ${setClause} WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Leave application updated successfully' });
  } catch (error) {
    console.error('Error updating leave application:', error);
    res.status(500).json({ success: false, message: 'Error updating leave application' });
  }
});

// Delete leave application
router.delete('/leave-applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM leave_applications WHERE id = ?', [id]);
    res.json({ success: true, message: 'Leave application deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave application:', error);
    res.status(500).json({ success: false, message: 'Error deleting leave application' });
  }
});

// TIMEKEEPING STATISTICS

// Get timekeeping statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE ar.date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT ar.employee_id) as total_employees,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_days,
        AVG(ar.total_hours) as average_hours,
        SUM(ar.overtime_hours) as total_overtime
      FROM attendance_records ar
      ${dateFilter}
    `, params);
    
    const [recentRecords] = await pool.query(`
      SELECT ar.*, u.first_name, u.last_name
      FROM attendance_records ar
      LEFT JOIN users u ON ar.employee_id = u.id
      ${dateFilter}
      ORDER BY ar.date DESC
      LIMIT 10
    `, params);
    
    res.json({
      success: true,
      data: {
        ...stats[0],
        recent_records: recentRecords
      }
    });
  } catch (error) {
    console.error('Error fetching timekeeping stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching timekeeping statistics' });
  }
});

  return router;
};
