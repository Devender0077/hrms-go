const { WebClient } = require('@slack/web-api');
const axios = require('axios');
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');

/**
 * Get integration settings from database
 */
async function getIntegrationSettings(pool, integrationName) {
  try {
    const [settings] = await pool.query(
      `SELECT setting_value FROM settings 
       WHERE category = 'integration' AND setting_key = ? 
       LIMIT 1`,
      [integrationName]
    );

    if (settings.length === 0) {
      return null;
    }

    return JSON.parse(settings[0].setting_value);
  } catch (error) {
    console.error(`Error getting ${integrationName} settings:`, error.message);
    return null;
  }
}

/**
 * Slack Integration
 */
async function testSlackConnection(webhookUrl) {
  try {
    await axios.post(webhookUrl, {
      text: '✅ Slack integration test successful!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*HRMS Integration Test*\n✅ Connection successful!'
          }
        }
      ]
    });
    return { success: true, message: 'Slack connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendSlackNotification(webhookUrl, message, channel = null) {
  try {
    const payload = {
      text: message,
      ...(channel && { channel })
    };
    await axios.post(webhookUrl, payload);
    return true;
  } catch (error) {
    console.error('Slack notification error:', error);
    return false;
  }
}

/**
 * Microsoft Teams Integration
 */
async function testTeamsConnection(webhookUrl) {
  try {
    await axios.post(webhookUrl, {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: 'HRMS Integration Test',
      themeColor: '0078D4',
      title: 'HRMS Integration Test',
      sections: [{
        activityTitle: 'Connection Test',
        activitySubtitle: 'Testing Microsoft Teams integration',
        activityImage: 'https://adaptivecards.io/content/cats/1.png',
        text: '✅ Microsoft Teams integration is working correctly!'
      }]
    });
    return { success: true, message: 'Microsoft Teams connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendTeamsNotification(webhookUrl, title, message) {
  try {
    await axios.post(webhookUrl, {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: title,
      themeColor: '0078D4',
      title: title,
      text: message
    });
    return true;
  } catch (error) {
    console.error('Teams notification error:', error);
    return false;
  }
}

/**
 * Twilio Integration
 */
async function testTwilioConnection(accountSid, authToken, fromNumber) {
  try {
    const client = twilio(accountSid, authToken);
    // Validate credentials by fetching account info
    await client.api.accounts(accountSid).fetch();
    return { success: true, message: 'Twilio connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendSMS(accountSid, authToken, fromNumber, toNumber, message) {
  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

/**
 * SendGrid Integration
 */
async function testSendGridConnection(apiKey, fromEmail) {
  try {
    sgMail.setApiKey(apiKey);
    // Validate by checking if we can access the API
    const request = {
      method: 'GET',
      url: '/v3/user/profile'
    };
    await sgMail.client.request(request);
    return { success: true, message: 'SendGrid connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendEmail(apiKey, fromEmail, toEmail, subject, html) {
  try {
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to: toEmail,
      from: fromEmail,
      subject: subject,
      html: html
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * AWS S3 Integration
 */
async function testS3Connection(accessKeyId, secretAccessKey, region, bucket) {
  try {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region
    });
    
    // Test by checking if bucket exists
    await s3.headBucket({ Bucket: bucket }).promise();
    return { success: true, message: 'AWS S3 connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function uploadToS3(accessKeyId, secretAccessKey, region, bucket, key, body) {
  try {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region
    });
    
    await s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: body
    }).promise();
    
    return true;
  } catch (error) {
    console.error('S3 upload error:', error);
    return false;
  }
}

/**
 * Zoom Integration
 */
async function testZoomConnection(apiKey, apiSecret) {
  try {
    // Zoom uses JWT for authentication
    // This is a basic test - in production you'd generate a proper JWT
    const response = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}` // In real implementation, generate JWT
      }
    });
    return { success: true, message: 'Zoom connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  getIntegrationSettings,
  // Slack
  testSlackConnection,
  sendSlackNotification,
  // Microsoft Teams
  testTeamsConnection,
  sendTeamsNotification,
  // Twilio
  testTwilioConnection,
  sendSMS,
  // SendGrid
  testSendGridConnection,
  sendEmail,
  // AWS S3
  testS3Connection,
  uploadToS3,
  // Zoom
  testZoomConnection
};
