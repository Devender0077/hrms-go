const express = require('express');
const router = express.Router();
const { testPusherConnection, sendNotification } = require('../services/pusher.service');

module.exports = (pool, authenticateToken) => {
  /**
   * Test Pusher connection
   */
  router.post('/test', authenticateToken, async (req, res) => {
    try {
      const { appId, appKey, appSecret, cluster } = req.body;

      if (!appId || !appKey || !appSecret || !cluster) {
        return res.status(400).json({
          success: false,
          message: 'Missing required Pusher credentials'
        });
      }

      const result = await testPusherConnection(appId, appKey, appSecret, cluster);

      res.json(result);
    } catch (error) {
      console.error('Error testing Pusher connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Send test notification
   */
  router.post('/test-notification', authenticateToken, async (req, res) => {
    try {
      const { channel, event, data } = req.body;

      if (!channel || !event) {
        return res.status(400).json({
          success: false,
          message: 'Channel and event are required'
        });
      }

      const success = await sendNotification(channel, event, data || {
        message: 'Test notification',
        timestamp: new Date().toISOString()
      });

      if (success) {
        res.json({
          success: true,
          message: 'Notification sent successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send notification'
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  return { router };
};
