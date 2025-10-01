/**
 * Authentication Routes
 * Login, register, password management, face recognition
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const user = users[0];
      
      if (user.status !== 'active') {
        return res.status(401).json({ success: false, message: 'Account is inactive' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, company_id: user.company_id || 1 },
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
          name: user.name,
          email: user.email,
          role: user.role,
          profile_photo: user.profile_photo,
          company_id: user.company_id
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

  return router;
};

