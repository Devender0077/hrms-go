/**
 * Announcements Routes
 * Handles announcement CRUD operations and Pusher notifications
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get all announcements (with filtering)
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { priority, category, is_active, target_audience } = req.query;
      
      let query = `
        SELECT 
          a.*,
          u.name as published_by_name,
          u.email as published_by_email,
          (SELECT COUNT(*) FROM announcement_reads WHERE announcement_id = a.id) as total_reads,
          (SELECT read_at FROM announcement_reads WHERE announcement_id = a.id AND user_id = ?) as user_read_at
        FROM announcements a
        LEFT JOIN users u ON a.published_by = u.id
        WHERE 1=1
      `;
      
      const params = [userId];
      
      if (priority) {
        query += ' AND a.priority = ?';
        params.push(priority);
      }
      
      if (category) {
        query += ' AND a.category = ?';
        params.push(category);
      }
      
      if (is_active !== undefined) {
        query += ' AND a.is_active = ?';
        params.push(is_active === 'true' ? 1 : 0);
      }
      
      if (target_audience) {
        query += ' AND a.target_audience = ?';
        params.push(target_audience);
      }
      
      // Filter by expiration
      query += ' AND (a.expires_at IS NULL OR a.expires_at > NOW())';
      
      query += ' ORDER BY a.priority DESC, a.published_at DESC';
      
      const [announcements] = await pool.query(query, params);
      
      // Parse JSON fields
      announcements.forEach(announcement => {
        if (announcement.target_departments) {
          announcement.target_departments = JSON.parse(announcement.target_departments);
        }
        if (announcement.target_designations) {
          announcement.target_designations = JSON.parse(announcement.target_designations);
        }
        if (announcement.target_users) {
          announcement.target_users = JSON.parse(announcement.target_users);
        }
        if (announcement.attachments) {
          announcement.attachments = JSON.parse(announcement.attachments);
        }
      });
      
      res.json({ success: true, data: announcements });
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({ success: false, message: 'Error fetching announcements' });
    }
  });
  
  // Get single announcement
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const [announcements] = await pool.query(`
        SELECT 
          a.*,
          u.name as published_by_name,
          u.email as published_by_email,
          (SELECT COUNT(*) FROM announcement_reads WHERE announcement_id = a.id) as total_reads,
          (SELECT read_at FROM announcement_reads WHERE announcement_id = a.id AND user_id = ?) as user_read_at
        FROM announcements a
        LEFT JOIN users u ON a.published_by = u.id
        WHERE a.id = ?
      `, [userId, id]);
      
      if (announcements.length === 0) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
      
      const announcement = announcements[0];
      
      // Parse JSON fields
      if (announcement.target_departments) {
        announcement.target_departments = JSON.parse(announcement.target_departments);
      }
      if (announcement.target_designations) {
        announcement.target_designations = JSON.parse(announcement.target_designations);
      }
      if (announcement.target_users) {
        announcement.target_users = JSON.parse(announcement.target_users);
      }
      if (announcement.attachments) {
        announcement.attachments = JSON.parse(announcement.attachments);
      }
      
      res.json({ success: true, data: announcement });
    } catch (error) {
      console.error('Error fetching announcement:', error);
      res.status(500).json({ success: false, message: 'Error fetching announcement' });
    }
  });
  
  // Create announcement (with Pusher notification)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        title,
        content,
        priority = 'medium',
        category = 'general',
        target_audience = 'all',
        target_departments,
        target_designations,
        target_users,
        expires_at,
        attachments
      } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
      }
      
      const [result] = await pool.query(`
        INSERT INTO announcements (
          title, content, priority, category, target_audience,
          target_departments, target_designations, target_users,
          published_by, expires_at, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title,
        content,
        priority,
        category,
        target_audience,
        target_departments ? JSON.stringify(target_departments) : null,
        target_designations ? JSON.stringify(target_designations) : null,
        target_users ? JSON.stringify(target_users) : null,
        userId,
        expires_at || null,
        attachments ? JSON.stringify(attachments) : null
      ]);
      
      const announcementId = result.insertId;
      
      // Send Pusher notification
      try {
        const pusherService = require('../services/pusher.service');
        const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        
        await pusherService.sendNotification({
          channel: 'announcements',
          event: 'new-announcement',
          data: {
            id: announcementId,
            title,
            priority,
            category,
            published_by: user[0]?.name || 'Unknown',
            published_at: new Date().toISOString()
          }
        });
      } catch (pusherError) {
        console.warn('Failed to send Pusher notification:', pusherError.message);
        // Don't fail the request if Pusher fails
      }
      
      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: { id: announcementId }
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({ success: false, message: 'Error creating announcement' });
    }
  });
  
  // Update announcement
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        priority,
        category,
        target_audience,
        target_departments,
        target_designations,
        target_users,
        expires_at,
        is_active,
        attachments
      } = req.body;
      
      const updates = [];
      const values = [];
      
      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (content !== undefined) {
        updates.push('content = ?');
        values.push(content);
      }
      if (priority !== undefined) {
        updates.push('priority = ?');
        values.push(priority);
      }
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category);
      }
      if (target_audience !== undefined) {
        updates.push('target_audience = ?');
        values.push(target_audience);
      }
      if (target_departments !== undefined) {
        updates.push('target_departments = ?');
        values.push(target_departments ? JSON.stringify(target_departments) : null);
      }
      if (target_designations !== undefined) {
        updates.push('target_designations = ?');
        values.push(target_designations ? JSON.stringify(target_designations) : null);
      }
      if (target_users !== undefined) {
        updates.push('target_users = ?');
        values.push(target_users ? JSON.stringify(target_users) : null);
      }
      if (expires_at !== undefined) {
        updates.push('expires_at = ?');
        values.push(expires_at || null);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active ? 1 : 0);
      }
      if (attachments !== undefined) {
        updates.push('attachments = ?');
        values.push(attachments ? JSON.stringify(attachments) : null);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }
      
      values.push(id);
      
      await pool.query(
        `UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      res.json({ success: true, message: 'Announcement updated successfully' });
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ success: false, message: 'Error updating announcement' });
    }
  });
  
  // Delete announcement
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
      
      res.json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({ success: false, message: 'Error deleting announcement' });
    }
  });
  
  // Mark announcement as read
  router.post('/:id/read', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await pool.query(`
        INSERT INTO announcement_reads (announcement_id, user_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
      `, [id, userId]);
      
      // Update read count
      await pool.query(`
        UPDATE announcements 
        SET read_count = (SELECT COUNT(*) FROM announcement_reads WHERE announcement_id = ?)
        WHERE id = ?
      `, [id, id]);
      
      res.json({ success: true, message: 'Announcement marked as read' });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      res.status(500).json({ success: false, message: 'Error marking announcement as read' });
    }
  });
  
  // Get unread count for user
  router.get('/unread/count', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const [result] = await pool.query(`
        SELECT COUNT(*) as unread_count
        FROM announcements a
        WHERE a.is_active = 1
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        AND NOT EXISTS (
          SELECT 1 FROM announcement_reads ar
          WHERE ar.announcement_id = a.id AND ar.user_id = ?
        )
      `, [userId]);
      
      res.json({ success: true, data: { unread_count: result[0].unread_count } });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ success: false, message: 'Error fetching unread count' });
    }
  });
  
  return { router };
};
