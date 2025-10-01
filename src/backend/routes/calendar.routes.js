/**
 * Calendar & Events Routes
 * Calendar events, holidays, meetings, recurring events
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // =====================================================
  // CALENDAR EVENTS
  // =====================================================
  
  router.get('/events', authenticateToken, async (req, res) => {
    try {
      const { start_date, end_date, type, visibility } = req.query;
      let query = `
        SELECT e.*, u.name as created_by_name
        FROM calendar_events e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE 1=1
      `;
      let params = [];
      
      if (start_date) {
        query += ' AND e.start_date >= ?';
        params.push(start_date);
      }
      
      if (end_date) {
        query += ' AND e.start_date <= ?';
        params.push(end_date);
      }
      
      if (type) {
        query += ' AND e.type = ?';
        params.push(type);
      }
      
      if (visibility) {
        query += ' AND e.visibility = ?';
        params.push(visibility);
      }
      
      query += ' ORDER BY e.start_date ASC';
      
      const [events] = await pool.query(query, params);
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ success: false, message: 'Error fetching calendar events' });
    }
  });

  router.post('/events', authenticateToken, async (req, res) => {
    try {
      const { 
        title, description, start_date, end_date, type, color, visibility, 
        visible_to, departments, location, is_recurring, recurrence_pattern, 
        reminder_minutes, is_all_day 
      } = req.body;
      
      const created_by = req.user.id;
      
      const [result] = await pool.query(
        `INSERT INTO calendar_events (
          title, description, start_date, end_date, type, color, created_by,
          visibility, visible_to, departments, location, is_recurring, 
          recurrence_pattern, reminder_minutes, is_all_day
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, description, start_date, end_date, type, color, created_by,
          visibility, JSON.stringify(visible_to || []), JSON.stringify(departments || []), 
          location, is_recurring, JSON.stringify(recurrence_pattern), reminder_minutes, is_all_day
        ]
      );
      
      res.status(201).json({ success: true, message: 'Event created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ success: false, message: 'Error creating calendar event' });
    }
  });

  router.put('/events/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        title, description, start_date, end_date, type, color, visibility, 
        visible_to, departments, location, is_recurring, recurrence_pattern, 
        reminder_minutes, is_all_day 
      } = req.body;
      
      await pool.query(
        `UPDATE calendar_events SET
          title = ?, description = ?, start_date = ?, end_date = ?, type = ?, color = ?,
          visibility = ?, visible_to = ?, departments = ?, location = ?, is_recurring = ?,
          recurrence_pattern = ?, reminder_minutes = ?, is_all_day = ?
         WHERE id = ?`,
        [
          title, description, start_date, end_date, type, color, visibility,
          JSON.stringify(visible_to || []), JSON.stringify(departments || []), 
          location, is_recurring, JSON.stringify(recurrence_pattern), reminder_minutes, is_all_day, id
        ]
      );
      
      res.json({ success: true, message: 'Event updated successfully' });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ success: false, message: 'Error updating calendar event' });
    }
  });

  router.delete('/events/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM calendar_events WHERE id = ?', [id]);
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ success: false, message: 'Error deleting calendar event' });
    }
  });

  // Get upcoming events
  router.get('/events/upcoming', authenticateToken, async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const [events] = await pool.query(
        `SELECT e.*, u.name as created_by_name
         FROM calendar_events e
         LEFT JOIN users u ON e.created_by = u.id
         WHERE e.start_date >= CURDATE()
         ORDER BY e.start_date ASC
         LIMIT ?`,
        [parseInt(limit)]
      );
      res.json({ success: true, data: events });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({ success: false, message: 'Error fetching upcoming events' });
    }
  });
  
  // =====================================================
  // HOLIDAYS
  // =====================================================
  
  router.get('/holidays', authenticateToken, async (req, res) => {
    try {
      const { year } = req.query;
      let query = 'SELECT * FROM leave_holidays WHERE 1=1';
      let params = [];
      
      if (year) {
        query += ' AND YEAR(date) = ?';
        params.push(year);
      }
      
      query += ' ORDER BY date ASC';
      
      const [holidays] = await pool.query(query, params);
      res.json({ success: true, data: holidays });
    } catch (error) {
      console.error('Error fetching holidays:', error);
      res.status(500).json({ success: false, message: 'Error fetching holidays' });
    }
  });

  router.post('/holidays', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, date, type, is_recurring, description } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO leave_holidays (company_id, name, date, type, is_recurring, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [companyId, name, date, type, is_recurring, description]
      );
      
      res.status(201).json({ success: true, message: 'Holiday created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating holiday:', error);
      res.status(500).json({ success: false, message: 'Error creating holiday' });
    }
  });

  router.put('/holidays/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, date, type, is_recurring, description } = req.body;
      
      await pool.query(
        `UPDATE leave_holidays SET name = ?, date = ?, type = ?, is_recurring = ?, description = ?
         WHERE id = ?`,
        [name, date, type, is_recurring, description, id]
      );
      
      res.json({ success: true, message: 'Holiday updated successfully' });
    } catch (error) {
      console.error('Error updating holiday:', error);
      res.status(500).json({ success: false, message: 'Error updating holiday' });
    }
  });

  router.delete('/holidays/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM leave_holidays WHERE id = ?', [id]);
      res.json({ success: true, message: 'Holiday deleted successfully' });
    } catch (error) {
      console.error('Error deleting holiday:', error);
      res.status(500).json({ success: false, message: 'Error deleting holiday' });
    }
  });
  
  return router;
};

