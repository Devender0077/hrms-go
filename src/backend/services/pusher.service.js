const Pusher = require('pusher');

let pusherInstance = null;

/**
 * Initialize Pusher with settings from database
 */
async function initializePusher(pool) {
  try {
    // Get Pusher settings from database
    const [settings] = await pool.query(
      `SELECT setting_value FROM system_settings 
       WHERE category = 'integration' AND setting_key = 'pusher' 
       LIMIT 1`
    );

    if (settings.length === 0) {
      console.log('⚠️  Pusher settings not found in database');
      return null;
    }

    const pusherConfig = JSON.parse(settings[0].setting_value);

    if (!pusherConfig.enabled) {
      console.log('⚠️  Pusher is disabled');
      return null;
    }

    if (!pusherConfig.appId || !pusherConfig.appKey || !pusherConfig.appSecret || !pusherConfig.cluster) {
      console.log('⚠️  Pusher configuration incomplete');
      return null;
    }

    // Initialize Pusher
    pusherInstance = new Pusher({
      appId: pusherConfig.appId,
      key: pusherConfig.appKey,
      secret: pusherConfig.appSecret,
      cluster: pusherConfig.cluster,
      useTLS: true
    });

    console.log('✅ Pusher initialized successfully');
    return pusherInstance;
  } catch (error) {
    console.error('❌ Error initializing Pusher:', error.message);
    return null;
  }
}

/**
 * Get Pusher instance
 */
function getPusher() {
  return pusherInstance;
}

/**
 * Test Pusher connection
 */
async function testPusherConnection(appId, appKey, appSecret, cluster) {
  try {
    const testPusher = new Pusher({
      appId: appId,
      key: appKey,
      secret: appSecret,
      cluster: cluster,
      useTLS: true
    });

    // Try to trigger a test event
    await testPusher.trigger('test-channel', 'test-event', {
      message: 'Connection test successful',
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Pusher connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Send notification via Pusher
 */
async function sendNotification(channel, event, data) {
  if (!pusherInstance) {
    console.warn('⚠️  Pusher not initialized, skipping notification');
    return false;
  }

  try {
    await pusherInstance.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error('❌ Error sending Pusher notification:', error.message);
    return false;
  }
}

/**
 * Send notification to specific user
 */
async function sendUserNotification(userId, event, data) {
  return sendNotification(`user-${userId}`, event, data);
}

/**
 * Send notification to all users
 */
async function sendBroadcastNotification(event, data) {
  return sendNotification('broadcast', event, data);
}

module.exports = {
  initializePusher,
  getPusher,
  testPusherConnection,
  sendNotification,
  sendUserNotification,
  sendBroadcastNotification
};
