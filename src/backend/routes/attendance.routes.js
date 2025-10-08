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
        `SELECT e.id, e.first_name, e.last_name, e.id as employee_id, e.designation_id, e.department_id
         FROM employees e
         WHERE e.status = 'active'`
      );

      // Fetch attendance records for the given date
      const [attendanceRecords] = await pool.query(
        `SELECT a.id, a.employee_id, a.date, a.check_in_time, a.check_out_time, a.status, a.total_hours, a.overtime_hours, a.remarks,
                e.first_name, e.last_name, e.employee_id as employee_code,
                d.name as designation_name, dep.name as department_name
         FROM attendance a
         JOIN employees e ON a.employee_id = e.id
         LEFT JOIN designations d ON e.designation_id = d.id
         LEFT JOIN departments dep ON e.department_id = dep.id
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

  // Update or create attendance record
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { employee_id, date, check_in_time, check_out_time, status, remarks } = req.body;

      // If id is 'null' or 'undefined', create a new record
      if (id === 'null' || id === 'undefined' || !id) {
        if (!employee_id || !date) {
          return res.status(400).json({ success: false, message: 'employee_id and date are required for creating new attendance record' });
        }

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
          `INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, status, total_hours, overtime_hours, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           check_in_time = VALUES(check_in_time),
           check_out_time = VALUES(check_out_time),
           status = VALUES(status),
           total_hours = VALUES(total_hours),
           overtime_hours = VALUES(overtime_hours),
           remarks = VALUES(remarks),
           updated_at = CURRENT_TIMESTAMP`,
          [employee_id, date, check_in_time, check_out_time, status, total_hours, overtime_hours, remarks]
        );

        return res.json({ success: true, message: 'Attendance record created/updated successfully', data: { id: result.insertId } });
      }

      // Update existing record
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

          // Get attendance records for a user or all users
          router.get('/attendance-records', authenticateToken, async (req, res) => {
            try {
              const { employee_id, start_date, end_date } = req.query;
              const userId = req.user.id;
              const userRole = req.user.role;

              let query = `
                SELECT a.*, e.first_name, e.last_name, e.employee_id as employee_code,
                       d.name as designation_name, dep.name as department_name
                FROM attendance a
                JOIN employees e ON a.employee_id = e.id
                LEFT JOIN designations d ON e.designation_id = d.id
                LEFT JOIN departments dep ON e.department_id = dep.id
                WHERE 1=1
              `;
              const params = [];

              // If employee_id is provided, filter by it
              if (employee_id) {
                query += ' AND a.employee_id = ?';
                params.push(employee_id);
              } else if (userRole !== 'super_admin' && userRole !== 'company_admin' && userRole !== 'hr') {
                // For regular employees, show only their own records
                // Get the employee ID for the current user
                const [userEmployee] = await pool.query(
                  'SELECT id FROM employees WHERE user_id = ?',
                  [userId]
                );
                if (userEmployee.length === 0) {
                  // If no employee record, return empty array instead of error
                  return res.json({ success: true, data: [] });
                }
                query += ' AND a.employee_id = ?';
                params.push(userEmployee[0].id);
              }
              // For admin roles, show all records (no filter)

              if (start_date) {
                query += ' AND a.date >= ?';
                params.push(start_date);
              }

              if (end_date) {
                query += ' AND a.date <= ?';
                params.push(end_date);
              }

              query += ' ORDER BY e.first_name, e.last_name, a.date DESC';

              const [records] = await pool.query(query, params);

              // Transform records to match the expected format
              const transformedRecords = records.map(record => ({
                id: record.id,
                employee_id: record.employee_id,
                employee_name: `${record.first_name} ${record.last_name}`,
                employee_code: record.employee_code,
                designation_name: record.designation_name,
                department_name: record.department_name,
                date: record.date,
                check_in_time: record.check_in_time,
                check_out_time: record.check_out_time,
                total_hours: record.total_hours,
                status: record.status,
                overtime_hours: record.overtime_hours,
                remarks: record.remarks
              }));

              res.json({ success: true, data: transformedRecords });
            } catch (error) {
              console.error('Error fetching attendance records:', error);
              res.status(500).json({ success: false, message: 'Error fetching attendance records' });
            }
          });

          // Get all employees' attendance for a month (for muster view)
          router.get('/monthly-muster', authenticateToken, async (req, res) => {
            try {
              const { start_date, end_date } = req.query;
              
              if (!start_date || !end_date) {
                return res.status(400).json({ success: false, message: 'start_date and end_date are required' });
              }

              // Get all active employees
              const [employees] = await pool.query(
                `SELECT e.id, e.first_name, e.last_name, e.employee_id as employee_code, e.designation_id, e.department_id,
                        d.name as designation_name, dep.name as department_name
                 FROM employees e
                 LEFT JOIN designations d ON e.designation_id = d.id
                 LEFT JOIN departments dep ON e.department_id = dep.id
                 WHERE e.status = 'active'
                 ORDER BY e.first_name, e.last_name`
              );

              // Get all attendance records for the date range
              const [attendanceRecords] = await pool.query(
                `SELECT a.*, e.first_name, e.last_name, e.id as employee_id,
                        e.employee_id as employee_code, d.name as designation_name, dep.name as department_name
                 FROM attendance a
                 JOIN employees e ON a.employee_id = e.id
                 LEFT JOIN designations d ON e.designation_id = d.id
                 LEFT JOIN departments dep ON e.department_id = dep.id
                 WHERE a.date >= ? AND a.date <= ?
                 ORDER BY e.first_name, e.last_name, a.date ASC`,
                [start_date, end_date]
              );

              // Get holidays for the date range (including both recurring and non-recurring)
              const [holidaysRaw] = await pool.query(
                `SELECT date, name, type FROM leave_holidays 
                 WHERE date >= ? AND date <= ?
                 ORDER BY date ASC`,
                [start_date, end_date]
              );
              
              // Format holiday dates as YYYY-MM-DD
              const holidays = holidaysRaw.map(h => ({
                ...h,
                date: h.date instanceof Date ? h.date.toISOString().split('T')[0] : h.date.split('T')[0]
              }));

              // Get weekend configurations
              const [weekendConfigs] = await pool.query(
                `SELECT day_of_week, name FROM weekend_configs 
                 WHERE is_active = 1 
                 ORDER BY day_of_week`
              );

              // Create a map of attendance records by employee and date
              const attendanceMap = new Map();
              attendanceRecords.forEach(record => {
                // Format date as YYYY-MM-DD to match frontend expectations
                const formattedDate = record.date instanceof Date 
                  ? record.date.toISOString().split('T')[0]
                  : record.date.split('T')[0];
                const key = `${record.employee_id}_${formattedDate}`;
                attendanceMap.set(key, {
                  id: record.id,
                  employee_id: record.employee_id,
                  employee_name: `${record.first_name} ${record.last_name}`,
                  employee_code: record.employee_code,
                  designation_name: record.designation_name,
                  department_name: record.department_name,
                  date: formattedDate,
                  check_in_time: record.check_in_time,
                  check_out_time: record.check_out_time,
                  total_hours: record.total_hours,
                  status: record.status,
                  overtime_hours: record.overtime_hours,
                  remarks: record.remarks
                });
              });

              // Calculate comprehensive statistics
              const startDate = new Date(start_date);
              const endDate = new Date(end_date);
              const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
              const totalPossibleRecords = employees.length * totalDays;

              // Count attendance records by status
              const statusCounts = {
                Present: 0,
                Absent: 0,
                'Half Day': 0,
                Late: 0,
                'Early Leave': 0,
                'On Leave': 0,
                Holiday: 0
              };

              attendanceRecords.forEach(record => {
                if (statusCounts.hasOwnProperty(record.status)) {
                  statusCounts[record.status]++;
                }
              });

              // Add holiday and weekend counts
              const weekendDays = weekendConfigs.map(config => config.day_of_week);
              const totalWeekendDays = weekendDays.length;
              
              // Calculate total weekend records for the month
              let weekendRecords = 0;
              for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                if (weekendDays.includes(d.getDay())) {
                  weekendRecords += employees.length;
                }
              }

              const stats = {
                totalEmployees: employees.length,
                totalDays: totalDays,
                totalPossibleRecords: totalPossibleRecords,
                present: statusCounts.Present,
                absent: statusCounts.Absent,
                halfDay: statusCounts['Half Day'],
                late: statusCounts.Late,
                earlyLeave: statusCounts['Early Leave'],
                onLeave: statusCounts['On Leave'],
                holiday: holidays.length,
                weekend: weekendRecords,
              };

              console.log('Calculated stats:', stats);

              res.json({ 
                success: true, 
                data: { 
                  employees: employees,
                  attendanceMap: Object.fromEntries(attendanceMap),
                  holidays: holidays,
                  weekendConfigs: weekendConfigs,
                  stats: stats
                }
              });
            } catch (error) {
              console.error('Error fetching monthly muster:', error);
              res.status(500).json({ success: false, message: 'Error fetching monthly muster' });
            }
          });

  // Check-in endpoint
  router.post('/check-in', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { location, device_info } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];

      // Get the employee ID for the current user
      const [userEmployee] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [userId]
      );
      
      if (userEmployee.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee record not found for user' 
        });
      }
      
      const employeeId = userEmployee[0].id;

      // Check if user already checked in today
      const [existing] = await pool.query(
        'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
        [employeeId, today]
      );

      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already checked in today' 
        });
      }

      // Get IP address
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      
      // Create attendance record with location and IP
      const [result] = await pool.query(
        `INSERT INTO attendance (employee_id, date, check_in_time, status, location_latitude, location_longitude, ip_address, remarks, created_at, updated_at)
         VALUES (?, ?, ?, 'Present', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          employeeId, 
          today, 
          currentTime, 
          location?.lat || null, 
          location?.lng || null, 
          ipAddress,
          `Check-in via ${device_info || 'web app'}`
        ]
      );

      res.status(201).json({ 
        success: true, 
        message: 'Check-in successful',
        data: { 
          id: result.insertId, 
          check_in_time: currentTime,
          date: today
        }
      });
    } catch (error) {
      console.error('Error during check-in:', error);
      res.status(500).json({ success: false, message: 'Error during check-in' });
    }
  });

  // Check-out endpoint
  router.post('/check-out', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { location, device_info } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];

      // Get the employee ID for the current user
      const [userEmployee] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ?',
        [userId]
      );
      
      if (userEmployee.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee record not found for user' 
        });
      }
      
      const employeeId = userEmployee[0].id;

      // Find today's attendance record
      const [records] = await pool.query(
        'SELECT id, check_in_time FROM attendance WHERE employee_id = ? AND date = ?',
        [employeeId, today]
      );

      if (records.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No check-in found for today' 
        });
      }

      const record = records[0];

      if (!record.check_in_time) {
        return res.status(400).json({ 
          success: false, 
          message: 'Check-in time not found' 
        });
      }

      // Calculate total hours
      const checkInTime = new Date(`2000-01-01T${record.check_in_time}`);
      const checkOutTime = new Date(`2000-01-01T${currentTime}`);
      const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      const overtimeHours = totalHours > 8 ? totalHours - 8 : 0;

      // Determine status based on hours
      let status = 'Present';
      if (totalHours < 4) {
        status = 'Half Day';
      } else if (totalHours < 8) {
        status = 'Early Leave';
      }

      // Get IP address
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      
      // Update attendance record with location and IP
      await pool.query(
        `UPDATE attendance SET 
          check_out_time = ?, 
          total_hours = ?, 
          overtime_hours = ?,
          status = ?,
          location_latitude = COALESCE(location_latitude, ?),
          location_longitude = COALESCE(location_longitude, ?),
          ip_address = COALESCE(ip_address, ?),
          remarks = CONCAT(IFNULL(remarks, ''), ' | Check-out via ${device_info || 'web app'}'),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [currentTime, totalHours, overtimeHours, status, location?.lat || null, location?.lng || null, ipAddress, record.id]
      );

      res.json({ 
        success: true, 
        message: 'Check-out successful',
        data: { 
          check_out_time: currentTime,
          total_hours: totalHours,
          overtime_hours: overtimeHours,
          status: status
        }
      });
    } catch (error) {
      console.error('Error during check-out:', error);
      res.status(500).json({ success: false, message: 'Error during check-out' });
    }
  });

  // Get shifts (for employee form)
  router.get('/shifts', authenticateToken, async (req, res) => {
    try {
      // Return empty array for now - shifts can be added later
      res.json({ success: true, data: [] });
    } catch (error) {
      console.error('Error fetching shifts:', error);
      res.status(500).json({ success: false, message: 'Error fetching shifts' });
    }
  });

  // Get attendance policies (for employee form)
  router.get('/policies', authenticateToken, async (req, res) => {
    try {
      // Return empty array for now - policies can be added later
      res.json({ success: true, data: [] });
    } catch (error) {
      console.error('Error fetching policies:', error);
      res.status(500).json({ success: false, message: 'Error fetching policies' });
    }
  });

  return router;
};