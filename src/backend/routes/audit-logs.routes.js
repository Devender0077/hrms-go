const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

// Get audit logs with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    
    const [logs] = await pool.query(`
      SELECT al.*, u.first_name, u.last_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM audit_logs');
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Error fetching audit logs' });
  }
});

// Get audit log statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT action) as unique_actions,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_logs,
        COUNT(CASE WHEN DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 END) as yesterday_logs
      FROM audit_logs
    `);
    
    const [actionStats] = await pool.query(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        ...stats[0],
        top_actions: actionStats
      }
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching audit log statistics' });
  }
});

// Create audit log entry (internal use)
const createAuditLog = async (userId, action, tableName, recordId, oldValues, newValues, req) => {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.get('User-Agent');
    
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, action, tableName, recordId, JSON.stringify(oldValues), JSON.stringify(newValues), ipAddress, userAgent]);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

  return { router, createAuditLog };
};
