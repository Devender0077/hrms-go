/**
 * Authentication Routes
 * Login, register, password management, face recognition
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('🔐 Login attempt for:', email, 'Password length:', password?.length);
      
      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        console.log('❌ User not found for email:', email);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const user = users[0];
      console.log('👤 User found:', user.email, 'Status:', user.status, 'Role:', user.role);
      
      if (user.status !== 'active') {
        console.log('❌ Account is inactive');
        return res.status(401).json({ success: false, message: 'Account is inactive' });
      }
      
      // Validate password and hash before comparison
      if (!password || !user.password) {
        console.error('Login error: Missing password or hash', { 
          hasPassword: !!password, 
          hasUserPassword: !!user.password,
          userId: user.id 
        });
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔐 Password validation result:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for user:', user.email);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Fetch user permissions
      const [permissions] = await pool.query(
        `SELECT p.permission_name 
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN roles r ON rp.role_id = r.id
         WHERE r.name = ? AND rp.is_active = 1`,
        [user.role]
      );
      
      const userPermissions = permissions.map(p => p.permission_name);
      
      console.log('✅ Creating JWT token with role:', user.role);
      
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, // Use actual role from database
          company_id: 1,
          permissions: userPermissions
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      
      console.log('✅ Login successful for user:', user.email, 'with role:', user.role);
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role, // Use actual role from database
          profile_photo: user.avatar,
          company_id: 1, // Default company ID
          permissions: userPermissions
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  });

  // Register
  // Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Removed company_id (no such column in DB)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'employee']
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

  // Forgot Password
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      const [users] = await pool.query('SELECT id, email FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        return res.json({ success: true, message: 'If email exists, reset link will be sent' });
      }
      
      // Generate reset token (in production, send email with token)
      const resetToken = jwt.sign({ userId: users[0].id }, JWT_SECRET, { expiresIn: '1h' });
      
      await pool.query(
        'UPDATE users SET remember_token = ? WHERE id = ?',
        [resetToken, users[0].id]
      );
      
      res.json({
        success: true,
        message: 'Password reset link sent',
        resetToken // In production, don't send this, only send via email
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, message: 'Failed to process request' });
    }
  });

  // Reset Password
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await pool.query(
          'UPDATE users SET password = ?, remember_token = NULL WHERE id = ?',
          [hashedPassword, decoded.userId]
        );
        
        res.json({ success: true, message: 'Password reset successfully' });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  });

  // Verify Token
  router.get('/verify', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET);
      const [users] = await pool.query('SELECT id, name, email, role, profile_photo, company_id FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      res.json({ success: true, user: users[0] });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  });

  // Logout (client-side token removal)
  router.post('/logout', async (req, res) => {
    try {
      // For JWT, logout is typically handled client-side by removing the token
      // This endpoint can be used for logging logout events or clearing server-side sessions
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  });

  // Face login endpoint
  router.post('/face-login', async (req, res) => {
    try {
      const { face_descriptor } = req.body;

      if (!face_descriptor || !Array.isArray(face_descriptor)) {
        return res.status(400).json({
          success: false,
          message: 'Face descriptor is required'
        });
      }

      // ✅ Find ALL users with face data - Check BOTH tables (employees AND users)
      // Employees table for regular employees
      const [employees] = await pool.query(
        'SELECT e.*, u.id as user_id, u.email, u.role, "employee" as source_table FROM employees e JOIN users u ON e.user_id = u.id WHERE e.face_descriptor IS NOT NULL AND e.status = "active"'
      );
      
      // Users table for management (super_admin, company_admin without employee records)
      const [managementUsers] = await pool.query(
        'SELECT id as user_id, email, role, first_name, last_name, profile_photo, face_descriptor, "user" as source_table FROM users WHERE face_descriptor IS NOT NULL AND status = "active" AND role IN ("super_admin", "company_admin")'
      );
      
      // Combine both result sets
      const allUsersWithFaces = [...employees, ...managementUsers];

      if (allUsersWithFaces.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No users with face recognition data found. Please register first or use password login.'
        });
      }

      console.log(`🔍 Comparing face descriptor with ${allUsersWithFaces.length} registered faces (${employees.length} employees + ${managementUsers.length} management users)...`);

      // ✅ SECURITY: Find BEST match using Euclidean distance (most accurate)
      let bestMatch = null;
      let bestDistance = Infinity; // Lower distance = better match
      const threshold = 0.6; // Distance threshold (lower = stricter)

      for (const userRecord of allUsersWithFaces) {
        try {
          // Parse stored descriptor
          const storedData = JSON.parse(userRecord.face_descriptor);
          const storedDescriptor = storedData.descriptor || storedData;
          
          // ✅ CRITICAL: Ensure both arrays have same length (128)
          if (!Array.isArray(storedDescriptor) || storedDescriptor.length !== face_descriptor.length) {
            console.warn(`⚠️ Skipping ${userRecord.source_table} user ID ${userRecord.user_id}: Invalid descriptor length`);
            continue;
          }
          
          // Calculate Euclidean distance (industry standard)
          let sum = 0;
          for (let i = 0; i < face_descriptor.length; i++) {
            const diff = storedDescriptor[i] - face_descriptor[i];
            sum += diff * diff;
          }
          const distance = Math.sqrt(sum);
          
          const displayName = userRecord.first_name && userRecord.last_name 
            ? `${userRecord.first_name} ${userRecord.last_name}` 
            : userRecord.email;
          console.log(`📊 ${userRecord.source_table === 'employee' ? 'Employee' : 'Management'} ${displayName} (User ID: ${userRecord.user_id}): distance = ${distance.toFixed(4)}`);
          
          // ✅ Track best match (lowest distance)
          if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = userRecord;
          }
        } catch (parseError) {
          console.error(`❌ Error parsing face descriptor for ${userRecord.source_table} user ${userRecord.user_id}:`, parseError);
        }
      }

      // ✅ SECURITY: Verify match meets threshold before allowing login
      if (!bestMatch || bestDistance > threshold) {
        console.log(`❌ Face not recognized. Best distance: ${bestDistance?.toFixed(4)} (threshold: ${threshold})`);
        return res.status(401).json({
          success: false,
          message: 'Face not recognized. Please register first or use password login.'
        });
      }

      console.log(`✅ MATCH CONFIRMED! Employee: ${bestMatch.first_name} ${bestMatch.last_name} (ID: ${bestMatch.id}, User ID: ${bestMatch.user_id})`);
      console.log(`✅ Distance: ${bestDistance.toFixed(4)} (threshold: ${threshold}) - SECURE LOGIN`);

      // ✅ Generate JWT token for THE CORRECT USER
      const token = jwt.sign(
        {
          id: bestMatch.user_id, // ✅ Correct user ID
          email: bestMatch.email,
          role: bestMatch.role,
          company_id: bestMatch.company_id
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // ✅ Return correct user data
      res.json({
        success: true,
        message: `Face recognition successful! Welcome ${bestMatch.first_name}!`,
        user: {
          id: bestMatch.user_id, // ✅ Correct user ID (will load correct dashboard)
          name: `${bestMatch.first_name} ${bestMatch.last_name}`,
          email: bestMatch.email,
          role: bestMatch.role,
          company_id: bestMatch.company_id,
          profile_photo: bestMatch.profile_photo
        },
        token,
        matchQuality: {
          distance: bestDistance,
          threshold: threshold,
          confidence: ((1 - (bestDistance / threshold)) * 100).toFixed(2) + '%'
        }
      });

    } catch (error) {
      console.error('Face login error:', error);
      res.status(500).json({
        success: false,
        message: 'Face login failed. Please try again or use password login.'
      });
    }
  });

  return router;
};
