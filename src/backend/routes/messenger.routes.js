/**
 * Messenger Routes
 * Real-time messaging with Pusher integration
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // Get all conversations for current user
  router.get('/conversations', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const [conversations] = await pool.query(`
        SELECT DISTINCT
          CASE 
            WHEN m.sender_id = ? THEN m.recipient_id
            ELSE m.sender_id
          END as user_id,
          CASE 
            WHEN m.sender_id = ? THEN CONCAT(r.first_name, ' ', r.last_name)
            ELSE CONCAT(s.first_name, ' ', s.last_name)
          END as user_name,
          CASE 
            WHEN m.sender_id = ? THEN r.profile_photo
            ELSE s.profile_photo
          END as user_photo,
          MAX(m.created_at) as last_message_time,
          (SELECT body FROM messages WHERE 
            (sender_id = ? AND recipient_id = user_id) OR 
            (sender_id = user_id AND recipient_id = ?)
           ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT COUNT(*) FROM messages WHERE 
            recipient_id = ? AND sender_id = user_id AND is_read = 0) as unread_count
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.recipient_id = r.id
        WHERE m.sender_id = ? OR m.recipient_id = ?
        GROUP BY user_id, user_name, user_photo
        ORDER BY last_message_time DESC
      `, [userId, userId, userId, userId, userId, userId, userId, userId]);
      
      res.json({ success: true, data: conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ success: false, message: 'Error fetching conversations' });
    }
  });
  
  // Get messages between current user and another user
  router.get('/messages/:userId', authenticateToken, async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = req.params.userId;
      
      const [messages] = await pool.query(`
        SELECT 
          m.id,
          m.sender_id,
          m.recipient_id as receiver_id,
          m.body as message,
          m.message_type,
          m.is_read,
          m.read_at,
          m.created_at,
          CONCAT(s.first_name, ' ', s.last_name) as sender_name,
          s.profile_photo as sender_photo
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        WHERE 
          (m.sender_id = ? AND m.recipient_id = ?) OR 
          (m.sender_id = ? AND m.recipient_id = ?)
        ORDER BY m.created_at ASC
      `, [currentUserId, otherUserId, otherUserId, currentUserId]);
      
      // Mark messages as read
      await pool.query(`
        UPDATE messages 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP
        WHERE recipient_id = ? AND sender_id = ? AND is_read = 0
      `, [currentUserId, otherUserId]);
      
      res.json({ success: true, data: messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
  });
  
  // Send a message
  router.post('/send', authenticateToken, async (req, res) => {
    try {
      const senderId = req.user.id;
      const { receiver_id, message, message_type = 'direct' } = req.body;
      
      if (!receiver_id || !message) {
        return res.status(400).json({ success: false, message: 'Receiver and message are required' });
      }
      
      const [result] = await pool.query(`
        INSERT INTO messages (sender_id, recipient_id, body, message_type, is_read, created_at)
        VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `, [senderId, receiver_id, message, message_type]);
      
      // Get sender info for notification
      const [senderInfo] = await pool.query(
        'SELECT id, CONCAT(first_name, " ", last_name) as name, profile_photo FROM users WHERE id = ?',
        [senderId]
      );
      
      // Send Pusher notification
      try {
        const { sendPusherNotification } = require('../services/pusher.service');
        await sendPusherNotification(pool, `user-${receiver_id}`, 'new-message', {
          id: result.insertId,
          sender_id: senderId,
          sender_name: senderInfo[0]?.name || 'Unknown',
          sender_photo: senderInfo[0]?.profile_photo || null,
          message: message,
          message_type: message_type,
          created_at: new Date().toISOString()
        });
      } catch (pusherError) {
        console.log('Pusher notification failed (may be disabled):', pusherError.message);
      }
      
      res.json({ 
        success: true, 
        message: 'Message sent successfully',
        data: { 
          id: result.insertId,
          sender_id: senderId,
          receiver_id,
          message,
          message_type,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, message: 'Error sending message' });
    }
  });
  
  // Mark message as read
  router.put('/read/:messageId', authenticateToken, async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const userId = req.user.id;
      
      await pool.query(`
        UPDATE messages 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP
        WHERE id = ? AND recipient_id = ?
      `, [messageId, userId]);
      
      res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ success: false, message: 'Error marking message as read' });
    }
  });
  
  // Get unread message count
  router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const [result] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE recipient_id = ? AND is_read = 0
      `, [userId]);
      
      res.json({ success: true, data: { count: result[0].count } });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ success: false, message: 'Error fetching unread count' });
    }
  });
  
  // Get all users for messaging
  router.get('/users', authenticateToken, async (req, res) => {
    try {
      const currentUserId = req.user.id;
      
      const [users] = await pool.query(`
        SELECT 
          u.id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          u.email,
          u.profile_photo,
          u.status,
          r.name as role_name,
          d.name as department_name
        FROM users u
        LEFT JOIN roles r ON u.role = r.name
        LEFT JOIN employees e ON u.id = e.user_id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE u.id != ? AND u.status = 'active'
        ORDER BY u.first_name, u.last_name
      `, [currentUserId]);
      
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Error fetching users' });
    }
  });
  
  // Delete message
  router.delete('/:messageId', authenticateToken, async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const userId = req.user.id;
      
      // Only allow sender to delete
      await pool.query(`
        DELETE FROM messages 
        WHERE id = ? AND sender_id = ?
      `, [messageId, userId]);
      
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ success: false, message: 'Error deleting message' });
    }
  });

  // =====================================================
  // GROUP MESSAGING ROUTES
  // =====================================================

  // Get all groups for current user
  router.get('/groups', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const [groups] = await pool.query(`
        SELECT 
          g.*,
          CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
          (SELECT COUNT(*) FROM message_group_members WHERE group_id = g.id) as member_count,
          (SELECT COUNT(*) FROM messages WHERE message_type = 'group' AND recipient_id = g.id AND is_read = 0) as unread_count,
          mgm.role as user_role
        FROM message_groups g
        LEFT JOIN users u ON g.created_by = u.id
        LEFT JOIN message_group_members mgm ON g.id = mgm.group_id AND mgm.user_id = ?
        WHERE mgm.user_id = ? AND g.is_active = 1
        ORDER BY g.created_at DESC
      `, [userId, userId]);
      
      res.json({ success: true, data: groups });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ success: false, message: 'Error fetching groups' });
    }
  });

  // Create a new group
  router.post('/groups', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, description, group_type = 'custom', member_ids = [] } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, message: 'Group name is required' });
      }
      
      // Create group
      const [result] = await pool.query(`
        INSERT INTO message_groups (name, description, group_type, created_by, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [name, description, group_type, userId]);
      
      const groupId = result.insertId;
      
      // Add creator as admin
      await pool.query(`
        INSERT INTO message_group_members (group_id, user_id, role)
        VALUES (?, ?, 'admin')
      `, [groupId, userId]);
      
      // Add other members
      if (member_ids.length > 0) {
        const memberValues = member_ids.map(memberId => [groupId, memberId, 'member']);
        await pool.query(`
          INSERT INTO message_group_members (group_id, user_id, role)
          VALUES ?
        `, [memberValues]);
      }
      
      res.json({ 
        success: true, 
        message: 'Group created successfully',
        data: { id: groupId, name, description, group_type }
      });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ success: false, message: 'Error creating group' });
    }
  });

  // Get group details with members
  router.get('/groups/:groupId', authenticateToken, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.user.id;
      
      // Check if user is member
      const [membership] = await pool.query(
        'SELECT role FROM message_group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId]
      );
      
      if (membership.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Get group details
      const [groups] = await pool.query(`
        SELECT 
          g.*,
          CONCAT(u.first_name, ' ', u.last_name) as created_by_name
        FROM message_groups g
        LEFT JOIN users u ON g.created_by = u.id
        WHERE g.id = ?
      `, [groupId]);
      
      if (groups.length === 0) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      
      // Get members
      const [members] = await pool.query(`
        SELECT 
          mgm.user_id,
          mgm.role,
          mgm.joined_at,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          u.email,
          u.profile_photo,
          r.name as role_name
        FROM message_group_members mgm
        LEFT JOIN users u ON mgm.user_id = u.id
        LEFT JOIN roles r ON u.role = r.name
        WHERE mgm.group_id = ?
        ORDER BY mgm.role DESC, u.first_name
      `, [groupId]);
      
      res.json({ 
        success: true, 
        data: {
          ...groups[0],
          members,
          user_role: membership[0].role
        }
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
      res.status(500).json({ success: false, message: 'Error fetching group details' });
    }
  });

  // Send message to group
  router.post('/groups/:groupId/send', authenticateToken, async (req, res) => {
    try {
      const senderId = req.user.id;
      const groupId = req.params.groupId;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }
      
      // Check if user is member
      const [membership] = await pool.query(
        'SELECT id FROM message_group_members WHERE group_id = ? AND user_id = ?',
        [groupId, senderId]
      );
      
      if (membership.length === 0) {
        return res.status(403).json({ success: false, message: 'You are not a member of this group' });
      }
      
      // Insert message (recipient_id = group_id for group messages)
      const [result] = await pool.query(`
        INSERT INTO messages (sender_id, recipient_id, body, message_type, is_read, created_at)
        VALUES (?, ?, ?, 'group', 0, CURRENT_TIMESTAMP)
      `, [senderId, groupId, message]);
      
      // Get sender info
      const [senderInfo] = await pool.query(
        'SELECT id, CONCAT(first_name, " ", last_name) as name, profile_photo FROM users WHERE id = ?',
        [senderId]
      );
      
      // Get all group members except sender
      const [members] = await pool.query(
        'SELECT user_id FROM message_group_members WHERE group_id = ? AND user_id != ?',
        [groupId, senderId]
      );
      
      // Send Pusher notification to all members
      try {
        const { sendPusherNotification } = require('../services/pusher.service');
        for (const member of members) {
          await sendPusherNotification(pool, `user-${member.user_id}`, 'new-group-message', {
            id: result.insertId,
            group_id: groupId,
            sender_id: senderId,
            sender_name: senderInfo[0]?.name || 'Unknown',
            sender_photo: senderInfo[0]?.profile_photo || null,
            message: message,
            created_at: new Date().toISOString()
          });
        }
      } catch (pusherError) {
        console.log('Pusher notification failed (may be disabled):', pusherError.message);
      }
      
      res.json({ 
        success: true, 
        message: 'Message sent to group',
        data: { 
          id: result.insertId,
          group_id: groupId,
          sender_id: senderId,
          message,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error sending group message:', error);
      res.status(500).json({ success: false, message: 'Error sending group message' });
    }
  });

  // Get group messages
  router.get('/groups/:groupId/messages', authenticateToken, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.user.id;
      
      // Check if user is member
      const [membership] = await pool.query(
        'SELECT id FROM message_group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId]
      );
      
      if (membership.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Get messages
      const [messages] = await pool.query(`
        SELECT 
          m.id,
          m.sender_id,
          m.recipient_id as group_id,
          m.body as message,
          m.message_type,
          m.is_read,
          m.read_at,
          m.created_at,
          CONCAT(s.first_name, ' ', s.last_name) as sender_name,
          s.profile_photo as sender_photo
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        WHERE m.recipient_id = ? AND m.message_type = 'group'
        ORDER BY m.created_at ASC
      `, [groupId]);
      
      res.json({ success: true, data: messages });
    } catch (error) {
      console.error('Error fetching group messages:', error);
      res.status(500).json({ success: false, message: 'Error fetching group messages' });
    }
  });

  // Add member to group
  router.post('/groups/:groupId/members', authenticateToken, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.user.id;
      const { user_id } = req.body;
      
      // Check if current user is admin
      const [membership] = await pool.query(
        'SELECT role FROM message_group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId]
      );
      
      if (membership.length === 0 || membership[0].role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only group admins can add members' });
      }
      
      // Add member
      await pool.query(`
        INSERT INTO message_group_members (group_id, user_id, role)
        VALUES (?, ?, 'member')
        ON DUPLICATE KEY UPDATE user_id = user_id
      `, [groupId, user_id]);
      
      res.json({ success: true, message: 'Member added successfully' });
    } catch (error) {
      console.error('Error adding member:', error);
      res.status(500).json({ success: false, message: 'Error adding member' });
    }
  });

  // Remove member from group
  router.delete('/groups/:groupId/members/:userId', authenticateToken, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const currentUserId = req.user.id;
      const targetUserId = req.params.userId;
      
      // Check if current user is admin
      const [membership] = await pool.query(
        'SELECT role FROM message_group_members WHERE group_id = ? AND user_id = ?',
        [groupId, currentUserId]
      );
      
      if (membership.length === 0 || membership[0].role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only group admins can remove members' });
      }
      
      // Remove member
      await pool.query(`
        DELETE FROM message_group_members 
        WHERE group_id = ? AND user_id = ?
      `, [groupId, targetUserId]);
      
      res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
      console.error('Error removing member:', error);
      res.status(500).json({ success: false, message: 'Error removing member' });
    }
  });

  // Update group
  router.put('/groups/:groupId', authenticateToken, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.user.id;
      const { name, description, group_type, is_active } = req.body;
      
      // Check if user is admin
      const [membership] = await pool.query(
        'SELECT role FROM message_group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId]
      );
      
      if (membership.length === 0 || membership[0].role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only group admins can update group' });
      }
      
      // Update group
      await pool.query(`
        UPDATE message_groups 
        SET name = ?, description = ?, group_type = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, description, group_type, is_active, groupId]);
      
      res.json({ success: true, message: 'Group updated successfully' });
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ success: false, message: 'Error updating group' });
    }
  });

  // Delete group
  router.delete('/groups/:groupId', authenticateToken, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.user.id;
      
      // Check if user is admin or creator
      const [group] = await pool.query(
        'SELECT created_by FROM message_groups WHERE id = ?',
        [groupId]
      );
      
      if (group.length === 0) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      
      if (group[0].created_by !== userId) {
        return res.status(403).json({ success: false, message: 'Only group creator can delete group' });
      }
      
      // Delete group (cascade will delete members and messages)
      await pool.query('DELETE FROM message_groups WHERE id = ?', [groupId]);
      
      res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ success: false, message: 'Error deleting group' });
    }
  });
  
  return { router };
};
