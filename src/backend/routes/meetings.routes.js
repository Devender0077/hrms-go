const express = require('express');

module.exports = (pool, authenticateToken) => {
  const router = express.Router();

/**
 * GET /api/v1/meetings
 * Get all meetings for the company
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      `SELECT m.*, 
              u1.name as organizer_name, 
              u1.email as organizer_email
       FROM meetings m 
       LEFT JOIN users u1 ON m.created_by = u1.id
       WHERE m.company_id = ? 
       ORDER BY m.meeting_date DESC, m.start_time DESC`,
      [companyId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, message: 'Error fetching meetings' });
  }
});

/**
 * GET /api/v1/meetings/:id
 * Get a specific meeting
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id || 1;
    const [rows] = await pool.query(
      `SELECT m.*, 
              u1.name as organizer_name, 
              u1.email as organizer_email
       FROM meetings m 
       LEFT JOIN users u1 ON m.created_by = u1.id
       WHERE m.id = ? AND m.company_id = ?`,
      [id, companyId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Get meeting attendees
    const [attendees] = await pool.query(
      `SELECT ma.*, u.name as attendee_name, u.email as attendee_email
       FROM meeting_attendees ma
       JOIN users u ON ma.user_id = u.id
       WHERE ma.meeting_id = ?`,
      [id]
    );
    
    const meeting = rows[0];
    meeting.attendees = attendees;
    
    res.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ success: false, message: 'Error fetching meeting' });
  }
});

/**
 * POST /api/v1/meetings
 * Create a new meeting
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      meeting_date,
      start_time,
      end_time,
      location,
      meeting_type = 'internal',
      department_id,
      attendees = []
    } = req.body;
    
    const companyId = req.user.company_id || 1;
    const organizerId = req.user.id;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Create meeting
      const [meetingResult] = await connection.query(
        `INSERT INTO meetings (company_id, organizer_id, title, description, meeting_date, start_time, end_time, location, meeting_type, department_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [companyId, organizerId, title, description, meeting_date, start_time, end_time, location, meeting_type, department_id]
      );
      
      const meetingId = meetingResult.insertId;
      
      // Add attendees
      if (attendees.length > 0) {
        const attendeeValues = attendees.map(userId => [meetingId, userId]);
        await connection.query(
          'INSERT INTO meeting_attendees (meeting_id, user_id) VALUES ?',
          [attendeeValues]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({ 
        success: true, 
        message: 'Meeting created successfully',
        data: { id: meetingId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ success: false, message: 'Error creating meeting' });
  }
});

/**
 * PUT /api/v1/meetings/:id
 * Update a meeting
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      meeting_date,
      start_time,
      end_time,
      location,
      meeting_type,
      department_id,
      attendees = []
    } = req.body;
    
    const companyId = req.user.company_id || 1;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update meeting
      const [result] = await connection.query(
        `UPDATE meetings SET title = ?, description = ?, meeting_date = ?, start_time = ?, end_time = ?, location = ?, meeting_type = ?, department_id = ?, updated_at = NOW() 
         WHERE id = ? AND company_id = ?`,
        [title, description, meeting_date, start_time, end_time, location, meeting_type, department_id, id, companyId]
      );
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Meeting not found' });
      }
      
      // Update attendees
      await connection.query('DELETE FROM meeting_attendees WHERE meeting_id = ?', [id]);
      
      if (attendees.length > 0) {
        const attendeeValues = attendees.map(userId => [id, userId]);
        await connection.query(
          'INSERT INTO meeting_attendees (meeting_id, user_id) VALUES ?',
          [attendeeValues]
        );
      }
      
      await connection.commit();
      
      res.json({ success: true, message: 'Meeting updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ success: false, message: 'Error updating meeting' });
  }
});

/**
 * DELETE /api/v1/meetings/:id
 * Delete a meeting
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id || 1;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete meeting attendees first
      await connection.query('DELETE FROM meeting_attendees WHERE meeting_id = ?', [id]);
      
      // Delete meeting
      const [result] = await connection.query(
        'DELETE FROM meetings WHERE id = ? AND company_id = ?',
        [id, companyId]
      );
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Meeting not found' });
      }
      
      await connection.commit();
      
      res.json({ success: true, message: 'Meeting deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ success: false, message: 'Error deleting meeting' });
  }
});

/**
 * GET /api/v1/meetings/user/:userId
 * Get meetings for a specific user
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.user.company_id || 1;
    
    const [rows] = await pool.query(
      `SELECT DISTINCT m.*, 
              u1.name as organizer_name, 
              u1.email as organizer_email,
              d.name as department_name
       FROM meetings m 
       LEFT JOIN users u1 ON m.organizer_id = u1.id
       LEFT JOIN departments d ON m.department_id = d.id
       LEFT JOIN meeting_attendees ma ON m.id = ma.meeting_id
       WHERE (m.organizer_id = ? OR ma.user_id = ?) AND m.company_id = ?
       ORDER BY m.meeting_date DESC, m.start_time DESC`,
      [userId, userId, companyId]
    );
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    res.status(500).json({ success: false, message: 'Error fetching user meetings' });
  }
});

  return router;
};
