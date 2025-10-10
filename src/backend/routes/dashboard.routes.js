const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Super Admin Dashboard Statistics
  router.get('/super-admin', authenticateToken, async (req, res) => {
    try {
      console.log('🔍 Dashboard request from user:', req.user);
      
      // Check if user is super admin (case-insensitive)
      const userRole = req.user?.role?.toLowerCase();
      if (userRole !== 'super_admin' && userRole !== 'superadmin' && userRole !== 'super admin') {
        console.error('❌ Access denied. User role:', req.user?.role);
        return res.status(403).json({
          success: false,
          message: `Access denied. Super admin role required. Current role: ${req.user?.role}`
        });
      }
      
      console.log('✅ Super admin access granted for role:', req.user?.role);

      // Get system statistics
      const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
      const [employeeCount] = await pool.query('SELECT COUNT(*) as total FROM employees');
      const [activeUsers] = await pool.query('SELECT COUNT(*) as total FROM users WHERE status = "active"');

      res.json({
        success: true,
        data: {
          totalCompanies: 15, // Mock data for now
          totalUsers: userCount[0].total,
          totalEmployees: employeeCount[0].total,
          activeUsers: activeUsers[0].total,
          recentActivity: 245,
          systemUptime: "99.9%"
        }
      });
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch super admin statistics',
        error: error.message
      });
    }
  });

  // Company Admin Dashboard Statistics
  router.get('/company-admin', authenticateToken, async (req, res) => {
    try {
      const userRole = req.user.role;
      
      // Check if user is company admin
      if (userRole !== 'company_admin' && userRole !== 'super_admin' && userRole !== 'superadmin') {
        return res.status(403).json({ 
          error: 'Access denied. Company admin role required.',
          currentRole: userRole 
        });
      }

      // Get company statistics
      const [companyStats] = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM employees WHERE status = 'active') as totalEmployees,
          (SELECT COUNT(*) FROM employees WHERE status = 'active') as activeEmployees,
          (SELECT COUNT(*) FROM employees WHERE MONTH(hire_date) = MONTH(CURRENT_DATE()) AND YEAR(hire_date) = YEAR(CURRENT_DATE())) as newHires,
          (SELECT COUNT(*) FROM employees WHERE status = 'inactive' AND MONTH(updated_at) = MONTH(CURRENT_DATE())) as departures,
          (SELECT COUNT(DISTINCT employee_id) FROM attendance WHERE DATE(check_in) = CURRENT_DATE()) as todayPresent,
          (SELECT COUNT(*) FROM employees WHERE status = 'active') - (SELECT COUNT(DISTINCT employee_id) FROM attendance WHERE DATE(check_in) = CURRENT_DATE()) as todayAbsent,
          (SELECT COUNT(*) FROM leave_requests WHERE status = 'pending') as leaveRequests,
          (SELECT COUNT(DISTINCT department_id) FROM employees WHERE department_id IS NOT NULL) as departmentCount
      `);

      // Get department data
      const [departments] = await pool.query(`
        SELECT 
          d.name,
          COUNT(e.id) as employees,
          COALESCE(AVG(CASE WHEN a.check_in IS NOT NULL THEN 1 ELSE 0 END) * 100, 0) as utilization
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
        LEFT JOIN attendance a ON e.id = a.employee_id AND DATE(a.check_in) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY d.id, d.name
        ORDER BY employees DESC
        LIMIT 10
      `);

      // Get attendance trend (last 6 months)
      const [attendanceTrend] = await pool.query(`
        SELECT 
          DATE_FORMAT(check_in, '%b') as month,
          COUNT(DISTINCT CASE WHEN check_in IS NOT NULL THEN employee_id END) as present,
          (SELECT COUNT(*) FROM employees WHERE status = 'active') - COUNT(DISTINCT CASE WHEN check_in IS NOT NULL THEN employee_id END) as absent,
          COUNT(DISTINCT CASE WHEN TIME(check_in) > '09:15:00' THEN employee_id END) as late
        FROM attendance
        WHERE check_in >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY MONTH(check_in), DATE_FORMAT(check_in, '%b')
        ORDER BY MONTH(check_in)
      `);

      // Calculate attendance rate
      const attendanceRate = companyStats[0].todayPresent > 0 
        ? ((companyStats[0].todayPresent / companyStats[0].totalEmployees) * 100).toFixed(1)
        : 0;

      res.json({
        success: true,
        companyStats: {
          ...companyStats[0],
          attendanceRate: parseFloat(attendanceRate),
          pendingApprovals: companyStats[0].leaveRequests
        },
        departmentData: departments,
        attendanceTrend
      });

    } catch (error) {
      console.error('Error fetching company admin dashboard data:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch company admin dashboard data',
        details: error.message 
      });
    }
  });

  // Employee Dashboard Statistics
  router.get('/employee', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get employee ID from user
      const [employeeData] = await pool.query(
        'SELECT id, first_name, last_name, department_id, leave_balance FROM employees WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (!employeeData || employeeData.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Employee record not found' 
        });
      }

      const employeeId = employeeData[0].id;

      // Get employee statistics
      const [employeeStats] = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status != 'completed') as totalTasks,
          (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'completed') as completedTasks,
          (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'pending') as pendingTasks,
          (SELECT COUNT(DISTINCT DATE(check_in)) FROM attendance WHERE employee_id = ? AND MONTH(check_in) = MONTH(CURRENT_DATE())) as daysPresent
      `, [employeeId, employeeId, employeeId, employeeId]);

      // Get recent tasks
      const [tasks] = await pool.query(`
        SELECT 
          id,
          title,
          priority,
          due_date as dueDate,
          status,
          COALESCE(progress, 0) as progress
        FROM tasks
        WHERE assigned_to = ?
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END,
          due_date ASC
        LIMIT 10
      `, [employeeId]);

      // Get recent attendance
      const [attendance] = await pool.query(`
        SELECT 
          DATE(check_in) as date,
          TIME(check_in) as checkIn,
          TIME(check_out) as checkOut,
          TIMESTAMPDIFF(HOUR, check_in, check_out) as hours,
          CASE 
            WHEN TIME(check_in) > '09:15:00' THEN 'late'
            ELSE 'present'
          END as status
        FROM attendance
        WHERE employee_id = ?
        ORDER BY check_in DESC
        LIMIT 10
      `, [employeeId]);

      // Calculate attendance rate
      const workingDays = 22; // Average working days per month
      const attendanceRate = employeeStats[0].daysPresent > 0 
        ? ((employeeStats[0].daysPresent / workingDays) * 100).toFixed(1)
        : 0;

      res.json({
        success: true,
        employeeStats: {
          ...employeeStats[0],
          attendanceRate: parseFloat(attendanceRate),
          leaveBalance: employeeData[0].leave_balance || 18,
          upcomingEvents: 3, // TODO: Get from calendar
          teamMembers: 8, // TODO: Get from team/department
          projects: 5 // TODO: Get from projects table
        },
        taskData: tasks,
        attendanceData: attendance
      });

    } catch (error) {
      console.error('Error fetching employee dashboard data:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch employee dashboard data',
        details: error.message 
      });
    }
  });

  return { router };
};
