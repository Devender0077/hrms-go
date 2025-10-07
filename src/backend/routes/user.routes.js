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
                u.created_at, u.last_login, u.first_name, u.last_name, u.is_email_verified, u.is_phone_verified, u.two_factor_enabled,
                d.name as department_name, des.name as designation_name,
                COUNT(DISTINCT rp.permission_id) as permission_count
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN designations des ON u.designation_id = des.id
         LEFT JOIN roles r ON u.role = r.name
         LEFT JOIN role_permissions rp ON r.id = rp.role_id
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Error fetching users' });
    }
  });

  // =====================================================
  // ROLES & PERMISSIONS (must be before /:id route)
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

  // Create a new role
  router.post('/roles', authenticateToken, async (req, res) => {
    try {
      const { name, description, permissions } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, message: 'Role name is required' });
      }

      // Check if role already exists
      const [existingRoles] = await pool.query('SELECT id FROM roles WHERE name = ?', [name]);
      if (existingRoles.length > 0) {
        return res.status(400).json({ success: false, message: 'Role already exists' });
      }

      // Create the role
      const [result] = await pool.query(
        'INSERT INTO roles (name, description, company_id) VALUES (?, ?, ?)',
        [name, description || '', 1]
      );

      const roleId = result.insertId;

      // Assign permissions if provided
      if (permissions && permissions.length > 0) {
        const permissionValues = permissions.map(permissionId => [roleId, permissionId, true, new Date(), new Date()]);
        await pool.query(
          'INSERT INTO role_permissions (role_id, permission_id, is_active, created_at, updated_at) VALUES ?',
          [permissionValues]
        );
      }

      res.json({ success: true, message: 'Role created successfully', data: { id: roleId, name } });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ success: false, message: 'Error creating role' });
    }
  });

  // Update a role
  router.put('/roles/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, message: 'Role name is required' });
      }

      // Check if role exists
      const [existingRoles] = await pool.query('SELECT id FROM roles WHERE id = ?', [id]);
      if (existingRoles.length === 0) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }

      // Update the role
      await pool.query(
        'UPDATE roles SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || '', id]
      );

      res.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ success: false, message: 'Error updating role' });
    }
  });

  // Delete a role
  router.delete('/roles/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if role exists
      const [existingRoles] = await pool.query('SELECT id, name FROM roles WHERE id = ?', [id]);
      if (existingRoles.length === 0) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }

      const roleName = existingRoles[0].name;

      // Check if role is being used by any users
      const [users] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', [roleName]);
      if (users[0].count > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete role that is assigned to users' });
      }

      // Delete role permissions first
      await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [id]);
      
      // Delete the role
      await pool.query('DELETE FROM roles WHERE id = ?', [id]);

      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ success: false, message: 'Error deleting role' });
    }
  });

  // Get permissions for a specific role
  router.get('/roles/:role/permissions', authenticateToken, async (req, res) => {
    try {
      const { role } = req.params;
      
      if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required' });
      }

      const [permissions] = await pool.query(
        `SELECT DISTINCT p.*, 
                CASE WHEN rp.permission_id IS NOT NULL AND rp.is_active = 1 AND r.name = ? THEN 1 ELSE 0 END as role_has_permission
         FROM permissions p
         LEFT JOIN role_permissions rp ON p.id = rp.permission_id 
         LEFT JOIN roles r ON rp.role_id = r.id
         WHERE p.is_active = true
         ORDER BY p.module, p.name`,
        [role]
      );
      
      res.json({ success: true, data: permissions });
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({ success: false, message: 'Error fetching role permissions' });
    }
  });

  // Update permissions for a role
  router.put('/roles/:role/permissions', authenticateToken, async (req, res) => {
    try {
      const { role } = req.params;
      const { permissions } = req.body;
      
      if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required' });
      }

      // Get role ID
      const [roles] = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
      if (roles.length === 0) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }
      
      const roleId = roles[0].id;

      // Clear existing permissions for this role
      await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

      // Add new permissions
      if (permissions && permissions.length > 0) {
        const permissionValues = permissions.map(permissionId => [roleId, permissionId, true, new Date(), new Date()]);
        await pool.query(
          'INSERT INTO role_permissions (role_id, permission_id, is_active, created_at, updated_at) VALUES ?',
          [permissionValues]
        );
      }

      res.json({ success: true, message: 'Role permissions updated successfully' });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      res.status(500).json({ success: false, message: 'Error updating role permissions' });
    }
  });

  // Get all permissions
  router.get('/permissions', authenticateToken, async (req, res) => {
    try {
      const [permissions] = await pool.query(
        'SELECT * FROM permissions WHERE is_active = true ORDER BY module, name'
      );
      res.json({ success: true, data: permissions });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ success: false, message: 'Error fetching permissions' });
    }
  });

  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [users] = await pool.query(
        `SELECT u.*, d.name as department_name, des.name as designation_name,
                COUNT(DISTINCT rp.permission_id) as permission_count
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN designations des ON u.designation_id = des.id
         LEFT JOIN roles r ON u.role = r.name
         LEFT JOIN role_permissions rp ON r.id = rp.role_id
         WHERE u.id = ?
         GROUP BY u.id`,
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
      const { name, email, password, role, phone, department_id, designation_id, status, first_name, last_name } = req.body;
      
      // Check if email exists
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.query(
        `INSERT INTO users (name, email, password, role, phone, department_id, designation_id, status, company_id, first_name, last_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role, phone, department_id, designation_id, status || 'active', req.user?.company_id || 1, first_name, last_name]
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
      const { name, email, role, phone, department_id, designation_id, status, first_name, last_name } = req.body;
      
      await pool.query(
        `UPDATE users SET name = ?, email = ?, role = ?, phone = ?, department_id = ?, designation_id = ?, status = ?, first_name = ?, last_name = ?
         WHERE id = ?`,
        [name, email, role, phone, department_id, designation_id, status, first_name, last_name, id]
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
  
  return router;
};

