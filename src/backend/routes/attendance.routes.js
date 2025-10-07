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

      // Get all active employees
      const [employees] = await pool.query(
        `SELECT id, first_name, last_name, employee_id, designation_id, department_id
         FROM users WHERE status = 'active' AND role != 'super_admin'`
      );

      // Fetch attendance records for the given date
      const [attendanceRecords] = await pool.query(
        `SELECT a.id, a.employee_id, a.date, a.check_in_time, a.check_out_time, a.status, a.total_hours, a.overtime_hours, a.remarks,
                u.first_name, u.last_name, u.employee_id as employee_code,
                d.name as designation_name, dep.name as department_name
         FROM attendance a
         JOIN users u ON a.employee_id = u.id
         LEFT JOIN designations d ON u.designation_id = d.id
         LEFT JOIN departments dep ON u.department_id = dep.id
         WHERE a.date = ?`,
        [date]
      );

      // Map attendance records to employees
      const recordsMap = new Map(attendanceRecords.map(record => [record.employee_id, record]));

      const combinedRecords = employees.map(employee => {
        const record = recordsMap.get(employee.id);
        return {
          id: record ? record.id : null,
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_code: employee.employee_id,
          designation_name: record ? record.designation_name : null,
          department_name: record ? record.department_name : null,
          date: date,
          check_in_time: record ? record.check_in_time : null,
          check_out_time: record ? record.check_out_time : null,
          status: record ? record.status : 'Absent', // Default to Absent if no record
          total_hours: record ? record.total_hours : 0,
          overtime_hours: record ? record.overtime_hours : 0,
          remarks: record ? record.remarks : null,
        };
      });

      // Calculate statistics
      const stats = {
        totalEmployees: employees.length,
        present: combinedRecords.filter(r => r.status === 'Present').length,
        absent: combinedRecords.filter(r => r.status === 'Absent').length,
        halfDay: combinedRecords.filter(r => r.status === 'Half Day').length,
        late: combinedRecords.filter(r => r.status === 'Late').length,
        earlyLeave: combinedRecords.filter(r => r.status === 'Early Leave').length,
        onLeave: combinedRecords.filter(r => r.status === 'On Leave').length,
        holiday: combinedRecords.filter(r => r.status === 'Holiday').length,
      };

      res.json({ 
        success: true, 
        data: { 
          records: combinedRecords,
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
      const { check_in_time, check_out_time, status, remarks } = req.body;

      // Calculate total hours if both check_in_time and check_out_time are provided
      let total_hours = 0;
      let overtime_hours = 0;
      
      if (check_in_time && check_out_time) {
        const checkInTime = new Date(`2000-01-01T${check_in_time}`);
        const checkOutTime = new Date(`2000-01-01T${check_out_time}`);
        total_hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        
        // Calculate overtime (assuming 8 hours is standard)
        if (total_hours > 8) {
          overtime_hours = total_hours - 8;
        }
      }

      await pool.query(
        `UPDATE attendance SET 
          check_in_time = ?, 
          check_out_time = ?, 
          total_hours = ?, 
          status = ?, 
          overtime_hours = ?, 
          remarks = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [check_in_time, check_out_time, total_hours, status, overtime_hours, remarks, id]
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
      const { employee_id, date, check_in_time, check_out_time, status, remarks } = req.body;

      // Calculate total hours if both check_in_time and check_out_time are provided
      let total_hours = 0;
      let overtime_hours = 0;
      
      if (check_in_time && check_out_time) {
        const checkInTime = new Date(`2000-01-01T${check_in_time}`);
        const checkOutTime = new Date(`2000-01-01T${check_out_time}`);
        total_hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        
        // Calculate overtime (assuming 8 hours is standard)
        if (total_hours > 8) {
          overtime_hours = total_hours - 8;
        }
      }

      const [result] = await pool.query(
        `INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, total_hours, status, overtime_hours, remarks, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [employee_id, date, check_in_time, check_out_time, total_hours, status, overtime_hours, remarks]
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