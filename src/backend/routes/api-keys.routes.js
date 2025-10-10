const express = require('express');
const router = express.Router();
const crypto = require('crypto');

module.exports = (pool, authenticateToken) => {
  // Get all API keys for the authenticated user
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const [apiKeys] = await pool.query(`
        SELECT 
          id,
          name,
          description,
          CONCAT(SUBSTRING(api_key, 1, 8), '...', SUBSTRING(api_key, -4)) as masked_key,
          status,
          last_used_at,
          expires_at,
          created_at
        FROM api_keys
        WHERE user_id = ?
        ORDER BY created_at DESC
      `, [userId]);

      res.json({
        success: true,
        data: apiKeys
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch API keys',
        details: error.message
      });
    }
  });

  // Create a new API key
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, description, expiresIn } = req.body;

      // Validate input
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'API key name is required'
        });
      }

      // Generate a secure API key
      const apiKey = 'hrms_' + crypto.randomBytes(32).toString('hex');

      // Calculate expiration date if provided
      let expiresAt = null;
      if (expiresIn) {
        const days = parseInt(expiresIn);
        if (!isNaN(days) && days > 0) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
        }
      }

      // Insert the API key
      const [result] = await pool.query(`
        INSERT INTO api_keys (user_id, name, description, api_key, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, name.trim(), description || null, apiKey, expiresAt]);

      res.json({
        success: true,
        message: 'API key created successfully',
        data: {
          id: result.insertId,
          name: name.trim(),
          description: description || null,
          api_key: apiKey, // Only returned once during creation
          expires_at: expiresAt,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create API key',
        details: error.message
      });
    }
  });

  // Update API key status
  router.patch('/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const keyId = req.params.id;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['active', 'inactive', 'revoked'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: active, inactive, revoked'
        });
      }

      // Update the API key (only if it belongs to the user)
      const [result] = await pool.query(`
        UPDATE api_keys
        SET status = ?
        WHERE id = ? AND user_id = ?
      `, [status, keyId, userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'API key not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'API key status updated successfully'
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update API key',
        details: error.message
      });
    }
  });

  // Delete an API key
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const keyId = req.params.id;

      // Delete the API key (only if it belongs to the user)
      const [result] = await pool.query(`
        DELETE FROM api_keys
        WHERE id = ? AND user_id = ?
      `, [keyId, userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'API key not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'API key deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete API key',
        details: error.message
      });
    }
  });

  return { router };
};

