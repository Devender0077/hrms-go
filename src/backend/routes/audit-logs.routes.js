const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get audit logs with pagination and filtering
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        action, 
        userId, 
        startDate, 
        endDate 
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = '1=1';
      const params = [];

      if (action) {
        whereClause += ' AND action = ?';
        params.push(action);
      }

      if (userId) {
        whereClause += ' AND user_id = ?';
        params.push(userId);
      }

      if (startDate) {
        whereClause += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND created_at <= ?';
        params.push(endDate);
      }

      // Get total count
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM audit_logs WHERE ${whereClause}`,
        params
      );

      // Get paginated results with user information
      const [logs] = await pool.query(`
        SELECT 
          al.*,
          u.username,
          u.email,
          u.first_name,
          u.last_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs',
        error: error.message
      });
    }
  });

  // Get audit log statistics
  router.get('/stats', authenticateToken, async (req, res) => {
    try {
      const [stats] = await pool.query(`
        SELECT 
          action,
          COUNT(*) as count,
          DATE(created_at) as date
        FROM audit_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY action, DATE(created_at)
        ORDER BY date DESC
      `);

      res.json({
        success: true,
        data: {
          dailyStats: stats,
          totalActions: stats.length,
          mostActiveAction: stats[0]?.action || 'none'
        }
      });
    } catch (error) {
      console.error('Error fetching audit log stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit log statistics',
        error: error.message
      });
    }
  });

  // Create audit log entry
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { action, details, ip_address, user_agent } = req.body;
      
      const [result] = await pool.query(`
        INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [req.user.id, action, details, ip_address, user_agent]);

      res.json({
        success: true,
        data: { id: result.insertId },
        message: 'Audit log created successfully'
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create audit log',
        error: error.message
      });
    }
  });

  return { router };
};
