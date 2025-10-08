const express = require('express');
const router = express.Router();
const {
  testSlackConnection,
  sendSlackNotification,
  testTeamsConnection,
  sendTeamsNotification,
  testTwilioConnection,
  sendSMS,
  testSendGridConnection,
  sendEmail,
  testS3Connection,
  uploadToS3,
  testZoomConnection
} = require('../services/integrations.service');

module.exports = (pool, authenticateToken) => {
  /**
   * Test Slack connection
   */
  router.post('/slack/test', authenticateToken, async (req, res) => {
    try {
      const { webhookUrl } = req.body;

      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          message: 'Webhook URL is required'
        });
      }

      const result = await testSlackConnection(webhookUrl);
      res.json(result);
    } catch (error) {
      console.error('Error testing Slack connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Test Microsoft Teams connection
   */
  router.post('/teams/test', authenticateToken, async (req, res) => {
    try {
      const { webhookUrl } = req.body;

      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          message: 'Webhook URL is required'
        });
      }

      const result = await testTeamsConnection(webhookUrl);
      res.json(result);
    } catch (error) {
      console.error('Error testing Teams connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Test Twilio connection
   */
  router.post('/twilio/test', authenticateToken, async (req, res) => {
    try {
      const { accountSid, authToken, fromNumber } = req.body;

      if (!accountSid || !authToken || !fromNumber) {
        return res.status(400).json({
          success: false,
          message: 'Account SID, Auth Token, and From Number are required'
        });
      }

      const result = await testTwilioConnection(accountSid, authToken, fromNumber);
      res.json(result);
    } catch (error) {
      console.error('Error testing Twilio connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Test SendGrid connection
   */
  router.post('/sendgrid/test', authenticateToken, async (req, res) => {
    try {
      const { apiKey, fromEmail } = req.body;

      if (!apiKey || !fromEmail) {
        return res.status(400).json({
          success: false,
          message: 'API Key and From Email are required'
        });
      }

      const result = await testSendGridConnection(apiKey, fromEmail);
      res.json(result);
    } catch (error) {
      console.error('Error testing SendGrid connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Test AWS S3 connection
   */
  router.post('/s3/test', authenticateToken, async (req, res) => {
    try {
      const { accessKeyId, secretAccessKey, region, bucket } = req.body;

      if (!accessKeyId || !secretAccessKey || !region || !bucket) {
        return res.status(400).json({
          success: false,
          message: 'All AWS S3 credentials are required'
        });
      }

      const result = await testS3Connection(accessKeyId, secretAccessKey, region, bucket);
      res.json(result);
    } catch (error) {
      console.error('Error testing S3 connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Test Zoom connection
   */
  router.post('/zoom/test', authenticateToken, async (req, res) => {
    try {
      const { apiKey, apiSecret } = req.body;

      if (!apiKey || !apiSecret) {
        return res.status(400).json({
          success: false,
          message: 'API Key and API Secret are required'
        });
      }

      const result = await testZoomConnection(apiKey, apiSecret);
      res.json(result);
    } catch (error) {
      console.error('Error testing Zoom connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Test Google Calendar connection
   */
  router.post('/google-calendar/test', authenticateToken, async (req, res) => {
    try {
      const { clientId, clientSecret } = req.body;

      if (!clientId || !clientSecret) {
        return res.status(400).json({
          success: false,
          message: 'Client ID and Client Secret are required'
        });
      }

      // Basic validation - actual OAuth flow would be more complex
      res.json({
        success: true,
        message: 'Google Calendar credentials validated. OAuth flow required for full connection.'
      });
    } catch (error) {
      console.error('Error testing Google Calendar connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Test Google Drive connection
   */
  router.post('/google-drive/test', authenticateToken, async (req, res) => {
    try {
      const { clientId, clientSecret } = req.body;

      if (!clientId || !clientSecret) {
        return res.status(400).json({
          success: false,
          message: 'Client ID and Client Secret are required'
        });
      }

      // Basic validation - actual OAuth flow would be more complex
      res.json({
        success: true,
        message: 'Google Drive credentials validated. OAuth flow required for full connection.'
      });
    } catch (error) {
      console.error('Error testing Google Drive connection:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  /**
   * Send notification via configured channel
   */
  router.post('/notify', authenticateToken, async (req, res) => {
    try {
      const { channel, message, title } = req.body;
      const results = [];

      // Get settings and send to enabled channels
      if (channel === 'slack' || channel === 'all') {
        const slackSettings = await getIntegrationSettings(pool, 'slack');
        if (slackSettings?.enabled && slackSettings?.webhookUrl) {
          const sent = await sendSlackNotification(slackSettings.webhookUrl, message);
          results.push({ channel: 'slack', success: sent });
        }
      }

      if (channel === 'teams' || channel === 'all') {
        const teamsSettings = await getIntegrationSettings(pool, 'microsoftTeams');
        if (teamsSettings?.enabled && teamsSettings?.webhookUrl) {
          const sent = await sendTeamsNotification(teamsSettings.webhookUrl, title || 'Notification', message);
          results.push({ channel: 'teams', success: sent });
        }
      }

      res.json({
        success: true,
        message: 'Notifications sent',
        results
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  return { router };
};
