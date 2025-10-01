/**
 * User Management Routes  
 * User CRUD, roles, permissions, password management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

module.exports = (pool, authenticateToken) => {
  
  // Get all users
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const [users] = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.profile_photo, u.phone, u.department_id, u.designation_id,
                u.created_at, u.last_login,
                d.name as department_name, des.name as designation_name,
                COUNT(DISTINCT up.permission_id) as permission_count
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN designations des ON u.designation_id = des.id
         LEFT JOIN user_permissions up ON u.id = up.user_id AND up.is_active = true
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Error fetching users' });
    }
  });

  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [users] = await pool.query(
        `SELECT u.*, d.name as department_name, des.name as designation_name
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN designations des ON u.designation_id = des.id
         WHERE u.id = ?`,
        [id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.json({ success: true, data: users[0] });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Error fetching user' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { name, email, password, role, phone, department_id, designation_id, status } = req.body;
      
      // Check if email exists
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.query(
        `INSERT INTO users (name, email, password, role, phone, department_id, designation_id, status, company_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role, phone, department_id, designation_id, status || 'active', req.user?.company_id || 1]
      );
      
      res.status(201).json({ success: true, message: 'User created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, message: 'Error creating user' });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, phone, department_id, designation_id, status } = req.body;
      
      await pool.query(
        `UPDATE users SET name = ?, email = ?, role = ?, phone = ?, department_id = ?, designation_id = ?, status = ?
         WHERE id = ?`,
        [name, email, role, phone, department_id, designation_id, status, id]
      );
      
      res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, message: 'Error updating user' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Don't allow deleting own account
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      }
      
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Error deleting user' });
    }
  });

  router.post('/:id/reset-password', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
      
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ success: false, message: 'Error resetting password' });
    }
  });

  // =====================================================
  // ROLES & PERMISSIONS
  // =====================================================
  
  router.get('/roles', authenticateToken, async (req, res) => {
    try {
      const [roles] = await pool.query('SELECT * FROM roles ORDER BY created_at DESC');
      res.json({ success: true, data: roles });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ success: false, message: 'Error fetching roles' });
    }
  });
  
  return router;
};

