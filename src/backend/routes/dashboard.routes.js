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
      const companyId = req.user.company_id;
      
      const [stats] = await pool.query(`
        SELECT 
          COUNT(DISTINCT e.id) as totalEmployees,
          COUNT(DISTINCT d.id) as totalDepartments,
          COUNT(DISTINCT a.id) as todayAttendance
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN attendance a ON e.id = a.employee_id AND DATE(a.check_in_time) = CURDATE()
        WHERE e.company_id = ? AND e.status = 'active'
      `, [companyId]);

      res.json({
        success: true,
        data: {
          totalEmployees: stats[0].totalEmployees,
          totalDepartments: stats[0].totalDepartments,
          todayAttendance: stats[0].todayAttendance,
          pendingTasks: 15,
          upcomingEvents: 8
        }
      });
    } catch (error) {
      console.error('Error fetching company admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company admin statistics',
        error: error.message
      });
    }
  });

  // Employee Dashboard Statistics
  router.get('/employee', authenticateToken, async (req, res) => {
    try {
      const employeeId = req.user.id;
      
      const [stats] = await pool.query(`
        SELECT 
          COUNT(*) as completedTasks,
          (SELECT COUNT(*) FROM attendance WHERE employee_id = ? AND DATE(check_in_time) = CURDATE()) as todayAttendance,
          (SELECT COUNT(*) FROM leaves WHERE employee_id = ? AND status = 'pending') as pendingLeaves
        FROM tasks t
        WHERE t.assigned_to = ? AND t.status = 'completed'
      `, [employeeId, employeeId, employeeId]);

      res.json({
        success: true,
        data: {
          completedTasks: stats[0].completedTasks,
          todayAttendance: stats[0].todayAttendance,
          pendingLeaves: stats[0].pendingLeaves,
          upcomingDeadlines: 3,
          teamMembers: 8
        }
      });
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee statistics',
        error: error.message
      });
    }
  });

  return { router };
};
