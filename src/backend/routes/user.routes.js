/**
 * User Routes - Face Recognition for Management Users
 * Handles face descriptor updates for users (especially management) 
 * who may not have employee records
 */

module.exports = (pool, authenticateToken) => {
  const express = require('express');
  const router = express.Router();

  /**
   * Get all roles with permissions
   * GET /api/v1/users/roles
   */
  router.get('/roles', authenticateToken, async (req, res) => {
    try {
      // Fetch all roles with their permissions
      const [roles] = await pool.query(`
        SELECT 
          r.id,
          r.company_id,
          r.name,
          r.description,
          r.is_active,
          r.created_at,
          r.updated_at
        FROM roles r
        ORDER BY 
          CASE 
            WHEN r.name = 'super_admin' THEN 1
            WHEN r.name = 'company_admin' THEN 2
            WHEN r.name = 'hr_manager' THEN 3
            WHEN r.name = 'manager' THEN 4
            WHEN r.name = 'employee' THEN 5
            ELSE 6
          END,
          r.id
      `);

      // Fetch permissions for each role
      for (let role of roles) {
        const [permissions] = await pool.query(`
          SELECT 
            p.id,
            p.permission_name,
            p.name,
            p.description,
            p.module,
            rp.role_id,
            1 as role_has_permission
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id = ?
        `, [role.id]);
        
        role.permissions = permissions;
      }

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('❌ Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  /**
   * Get permissions for a specific role
   * GET /api/v1/users/roles/:roleName/permissions
   */
  router.get('/roles/:roleName/permissions', authenticateToken, async (req, res) => {
    try {
      const { roleName } = req.params;
      
      // Get role by name
      const [roles] = await pool.query('SELECT id FROM roles WHERE name = ?', [roleName]);
      
      if (roles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      const roleId = roles[0].id;
      
      // Fetch permissions for this role
      const [permissions] = await pool.query(`
        SELECT 
          p.id,
          p.permission_name,
          p.name,
          p.module,
          p.description,
          rp.role_id,
          1 as role_has_permission
         FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `, [roleId]);
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('❌ Error fetching role permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  /**
   * Update permissions for a specific role
   * PUT /api/v1/users/roles/:roleName/permissions
   */
  router.put('/roles/:roleName/permissions', authenticateToken, async (req, res) => {
    try {
      const { roleName } = req.params;
      const { permissions: permissionIds } = req.body;
      
      // Get role by name
      const [roles] = await pool.query('SELECT id FROM roles WHERE name = ?', [roleName]);
      
      if (roles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      const roleId = roles[0].id;

      // Delete existing permissions
      await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

      // Insert new permissions
      if (permissionIds && permissionIds.length > 0) {
        const values = permissionIds.map((permId) => [roleId, permId]);
        await pool.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
          [values]
        );
      }

      res.json({
        success: true,
        message: 'Permissions updated successfully'
      });
    } catch (error) {
      console.error('❌ Error updating role permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  /**
   * Get all permissions (for roles page)
   * GET /api/v1/users/permissions
   * NOTE: Can return list of all permissions OR user's permissions depending on query
   */
  router.get('/permissions', authenticateToken, async (req, res) => {
    try {
      // Check if this is a request for all permissions (from roles page)
      // or user's own permissions (from auth)
      const { all } = req.query;
      
      if (all === 'true') {
        // Return all available permissions for roles management
        const [permissions] = await pool.query(`
          SELECT 
            id,
            name,
            module,
            description,
            created_at
          FROM permissions
          ORDER BY module, name
        `);
        
        return res.json({
          success: true,
          data: permissions
        });
      }
      
      // Return user's own permissions
      const userId = req.user.id;
      
      // Get user with permissions
      const [users] = await pool.query(
        'SELECT id, role, permissions FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = users[0];
      
      // Parse permissions JSON if exists
      let permissions = {};
      if (user.permissions) {
        try {
          permissions = typeof user.permissions === 'string' 
            ? JSON.parse(user.permissions) 
            : user.permissions;
        } catch (err) {
          console.error('Error parsing permissions:', err);
        }
      }

      res.json({
        success: true,
        data: {
          role: user.role,
          permissions: permissions
        }
      });

    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  /**
   * Update user's face descriptor
   * PUT /api/v1/users/:id/face
   * 
   * This route is for management users who don't have employee records
   * Regular employees use the employee route instead
   */
  router.put('/:id/face', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { face_descriptor } = req.body;

      console.log(`💾 Updating face descriptor for user ID: ${id} (Management user)`);

      if (!face_descriptor) {
        return res.status(400).json({
          success: false,
          message: 'Face descriptor is required'
        });
      }

      // Verify user exists and requester has permission
      const [users] = await pool.query(
        'SELECT id, role FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // ✅ Allow users to update their own face, or admin/super_admin to update anyone
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      const isOwnProfile = req.user.id === parseInt(id);
      
      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this user'
        });
      }

      // Update face_descriptor in users table
      const [result] = await pool.query(
        'UPDATE users SET face_descriptor = ? WHERE id = ?',
        [face_descriptor, id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update face descriptor'
        });
      }

      console.log(`✅ Face descriptor updated for user ${id} in users table`);

      res.json({
        success: true,
        message: 'Face descriptor saved successfully'
      });

    } catch (error) {
      console.error('❌ Error updating user face descriptor:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   * NOTE: Must come AFTER all specific routes (permissions, :id/face, etc.)
   */
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // ✅ Allow users to get their own data, or super_admin/company_admin to get anyone
      const userRole = req.user?.role?.toLowerCase();
      const isAdmin = userRole === 'super_admin' || userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'hr_manager';
      const isOwnProfile = req.user.id === parseInt(id);
      
      console.log('🔍 GET /users/:id - User:', req.user.id, 'Role:', req.user.role, 'Requesting:', id, 'isAdmin:', isAdmin, 'isOwnProfile:', isOwnProfile);
      
      if (!isOwnProfile && !isAdmin) {
        console.log('❌ 403 Forbidden: User', req.user.id, 'role', req.user.role, 'tried to access user', id);
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this user data'
        });
      }
      
      console.log('✅ Access granted to user', id);
      
      console.log('✅ Authorized: User', req.user.id, 'role', req.user.role, 'accessing user', id);
      
      const [users] = await pool.query(
        'SELECT id, email, role, first_name, last_name, phone, profile_photo, status, face_descriptor, created_at FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log(`✅ Fetched user ${id} from users table, face_descriptor:`, users[0].face_descriptor ? 'SET' : 'NULL');
      
      res.json({
        success: true,
        data: users[0]
      });
      
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });
  
  return router;
};
