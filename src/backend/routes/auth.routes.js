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
      
      // Map super_admin to admin for frontend compatibility
      const frontendRole = user.role === 'super_admin' ? 'admin' : user.role;
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: frontendRole, company_id: 1 },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: frontendRole, // Use mapped role for frontend
          profile_photo: user.avatar,
          company_id: 1 // Default company ID
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
  });

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
      
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role || 'employee', 1]
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

      // Find employees with face data
      const [employees] = await pool.query(
        'SELECT e.*, u.email, u.role FROM employees e JOIN users u ON e.user_id = u.id WHERE e.face_descriptor IS NOT NULL'
      );

      if (employees.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No users with face recognition data found. Please register first or use password login.'
        });
      }

      // For demo purposes, we'll use a simple comparison
      // In a real implementation, you would use proper face recognition algorithms
      let bestMatch = null;
      let bestScore = 0;
      const threshold = 0.8; // Similarity threshold

      for (const employee of employees) {
        try {
          const storedDescriptor = JSON.parse(employee.face_descriptor);
          
          // Simple similarity calculation (Euclidean distance)
          if (storedDescriptor.length === face_descriptor.length) {
            let sum = 0;
            for (let i = 0; i < storedDescriptor.length; i++) {
              const diff = storedDescriptor[i] - face_descriptor[i];
              sum += diff * diff;
            }
            const distance = Math.sqrt(sum);
            const similarity = 1 / (1 + distance); // Convert distance to similarity
            
            if (similarity > bestScore && similarity > threshold) {
              bestScore = similarity;
              bestMatch = employee;
            }
          }
        } catch (parseError) {
          console.error('Error parsing face descriptor for employee', employee.id, parseError);
        }
      }

      if (bestMatch) {
        // Generate JWT token
        const token = jwt.sign(
          {
            id: bestMatch.user_id,
            email: bestMatch.email,
            role: bestMatch.role,
            company_id: bestMatch.company_id
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
          success: true,
          message: 'Face recognition successful',
          user: {
            id: bestMatch.user_id,
            name: `${bestMatch.first_name} ${bestMatch.last_name}`,
            email: bestMatch.email,
            role: bestMatch.role,
            company_id: bestMatch.company_id
          },
          token,
          similarity: bestScore
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Face not recognized. Please register first or use password login.'
        });
      }

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

