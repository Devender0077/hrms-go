/**
 * Attendance Management Routes
 * Attendance muster, calculation rules, and tracking
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // Get attendance muster for a specific date
  router.get('/muster', authenticateToken, async (req, res) => {
    try {
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }

      // Get all employees and their attendance for the date
      const [attendanceRecords] = await pool.query(
        `SELECT 
          a.id,
          a.employee_id,
          CONCAT(u.first_name, ' ', u.last_name) as employee_name,
          a.date,
          a.check_in,
          a.check_out,
          a.total_hours,
          a.status,
          a.overtime_hours,
          a.remarks
        FROM attendance a
        RIGHT JOIN users u ON a.employee_id = u.id
        WHERE a.date = ? OR a.date IS NULL
        ORDER BY u.first_name, u.last_name`,
        [date]
      );

      // Calculate statistics
      const stats = {
        total_employees: attendanceRecords.length,
        present_count: attendanceRecords.filter(r => r.status === 'present').length,
        absent_count: attendanceRecords.filter(r => r.status === 'absent' || r.status === null).length,
        half_day_count: attendanceRecords.filter(r => r.status === 'half_day').length,
        late_count: attendanceRecords.filter(r => r.status === 'late').length,
        early_leave_count: attendanceRecords.filter(r => r.status === 'early_leave').length,
        total_overtime: attendanceRecords.reduce((sum, r) => sum + (r.overtime_hours || 0), 0)
      };

      res.json({ 
        success: true, 
        data: { 
          records: attendanceRecords,
          stats 
        } 
      });
    } catch (error) {
      console.error('Error fetching attendance muster:', error);
      res.status(500).json({ success: false, message: 'Error fetching attendance muster' });
    }
  });

  // Update attendance record
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { check_in, check_out, status, remarks } = req.body;

      // Calculate total hours if both check_in and check_out are provided
      let total_hours = 0;
      let overtime_hours = 0;
      
      if (check_in && check_out) {
        const checkInTime = new Date(`2000-01-01T${check_in}`);
        const checkOutTime = new Date(`2000-01-01T${check_out}`);
        total_hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        
        // Calculate overtime (assuming 8 hours is standard)
        if (total_hours > 8) {
          overtime_hours = total_hours - 8;
        }
      }

      await pool.query(
        `UPDATE attendance SET 
          check_in = ?, 
          check_out = ?, 
          total_hours = ?, 
          status = ?, 
          overtime_hours = ?, 
          remarks = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [check_in, check_out, total_hours, status, overtime_hours, remarks, id]
      );

      res.json({ success: true, message: 'Attendance record updated successfully' });
    } catch (error) {
      console.error('Error updating attendance record:', error);
      res.status(500).json({ success: false, message: 'Error updating attendance record' });
    }
  });

  // Create attendance record
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { employee_id, date, check_in, check_out, status, remarks } = req.body;

      // Calculate total hours if both check_in and check_out are provided
      let total_hours = 0;
      let overtime_hours = 0;
      
      if (check_in && check_out) {
        const checkInTime = new Date(`2000-01-01T${check_in}`);
        const checkOutTime = new Date(`2000-01-01T${check_out}`);
        total_hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        
        // Calculate overtime (assuming 8 hours is standard)
        if (total_hours > 8) {
          overtime_hours = total_hours - 8;
        }
      }

      const [result] = await pool.query(
        `INSERT INTO attendance (employee_id, date, check_in, check_out, total_hours, status, overtime_hours, remarks, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [employee_id, date, check_in, check_out, total_hours, status, overtime_hours, remarks]
      );

      res.status(201).json({ 
        success: true, 
        message: 'Attendance record created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error creating attendance record:', error);
      res.status(500).json({ success: false, message: 'Error creating attendance record' });
    }
  });

  // Get attendance calculation rules
  router.get('/rules', authenticateToken, async (req, res) => {
    try {
      const [rules] = await pool.query(
        'SELECT * FROM attendance_calculation_rules WHERE is_active = true ORDER BY created_at DESC'
      );
      
      res.json({ success: true, data: rules });
    } catch (error) {
      console.error('Error fetching attendance rules:', error);
      res.status(500).json({ success: false, message: 'Error fetching attendance rules' });
    }
  });

  // Create attendance calculation rule
  router.post('/rules', authenticateToken, async (req, res) => {
    try {
      const { name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active } = req.body;

      const [result] = await pool.query(
        `INSERT INTO attendance_calculation_rules 
         (name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active]
      );

      res.status(201).json({ 
        success: true, 
        message: 'Attendance rule created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error creating attendance rule:', error);
      res.status(500).json({ success: false, message: 'Error creating attendance rule' });
    }
  });

  // Update attendance calculation rule
  router.put('/rules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active } = req.body;

      await pool.query(
        `UPDATE attendance_calculation_rules SET 
          name = ?, type = ?, min_hours = ?, max_hours = ?, grace_period_minutes = ?, 
          overtime_threshold_hours = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [name, type, min_hours, max_hours, grace_period_minutes, overtime_threshold_hours, description, is_active, id]
      );

      res.json({ success: true, message: 'Attendance rule updated successfully' });
    } catch (error) {
      console.error('Error updating attendance rule:', error);
      res.status(500).json({ success: false, message: 'Error updating attendance rule' });
    }
  });

  // Delete attendance calculation rule
  router.delete('/rules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      await pool.query('DELETE FROM attendance_calculation_rules WHERE id = ?', [id]);

      res.json({ success: true, message: 'Attendance rule deleted successfully' });
    } catch (error) {
      console.error('Error deleting attendance rule:', error);
      res.status(500).json({ success: false, message: 'Error deleting attendance rule' });
    }
  });

  return router;
};