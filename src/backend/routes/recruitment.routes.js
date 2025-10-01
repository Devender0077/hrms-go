/**
 * Recruitment Routes
 * Job postings, candidates, interviews, offers
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken, upload) => {
  
  // =====================================================
  // JOB POSTINGS
  // =====================================================
  
  router.get('/jobs', authenticateToken, async (req, res) => {
    try {
      const { status, category } = req.query;
      let query = 'SELECT * FROM job_postings WHERE 1=1';
      let params = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [jobs] = await pool.query(query, params);
      res.json({ success: true, data: jobs });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ success: false, message: 'Error fetching job postings' });
    }
  });

  router.post('/jobs', authenticateToken, async (req, res) => {
    try {
      const { 
        title, description, department_id, location, employment_type, 
        experience_required, salary_range, skills, qualifications, status 
      } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO job_postings (title, description, department_id, location, employment_type, 
         experience_required, salary_range, skills, qualifications, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, department_id, location, employment_type, 
         experience_required, salary_range, skills, qualifications, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Job posting created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating job posting:', error);
      res.status(500).json({ success: false, message: 'Error creating job posting' });
    }
  });

  router.put('/jobs/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        title, description, department_id, location, employment_type, 
        experience_required, salary_range, skills, qualifications, status 
      } = req.body;
      
      await pool.query(
        `UPDATE job_postings SET title = ?, description = ?, department_id = ?, location = ?, 
         employment_type = ?, experience_required = ?, salary_range = ?, skills = ?, qualifications = ?, status = ?
         WHERE id = ?`,
        [title, description, department_id, location, employment_type, 
         experience_required, salary_range, skills, qualifications, status, id]
      );
      
      res.json({ success: true, message: 'Job posting updated successfully' });
    } catch (error) {
      console.error('Error updating job posting:', error);
      res.status(500).json({ success: false, message: 'Error updating job posting' });
    }
  });

  router.delete('/jobs/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM job_postings WHERE id = ?', [id]);
      res.json({ success: true, message: 'Job posting deleted successfully' });
    } catch (error) {
      console.error('Error deleting job posting:', error);
      res.status(500).json({ success: false, message: 'Error deleting job posting' });
    }
  });
  
  // =====================================================
  // CANDIDATES
  // =====================================================
  
  router.get('/candidates', authenticateToken, async (req, res) => {
    try {
      const { job_id, status, stage } = req.query;
      let query = `
        SELECT c.*, j.title as job_title
        FROM candidates c
        LEFT JOIN job_postings j ON c.job_id = j.id
        WHERE 1=1
      `;
      let params = [];
      
      if (job_id) {
        query += ' AND c.job_id = ?';
        params.push(job_id);
      }
      
      if (status) {
        query += ' AND c.status = ?';
        params.push(status);
      }
      
      if (stage) {
        query += ' AND c.stage = ?';
        params.push(stage);
      }
      
      query += ' ORDER BY c.created_at DESC';
      
      const [candidates] = await pool.query(query, params);
      res.json({ success: true, data: candidates });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ success: false, message: 'Error fetching candidates' });
    }
  });

  router.post('/candidates', authenticateToken, async (req, res) => {
    try {
      const { 
        job_id, first_name, last_name, email, phone, resume_path, 
        cover_letter, experience, skills, status, stage 
      } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO candidates (job_id, first_name, last_name, email, phone, resume_path, 
         cover_letter, experience, skills, status, stage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [job_id, first_name, last_name, email, phone, resume_path, 
         cover_letter, experience, skills, status || 'new', stage || 'applied']
      );
      
      res.status(201).json({ success: true, message: 'Candidate created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating candidate:', error);
      res.status(500).json({ success: false, message: 'Error creating candidate' });
    }
  });

  router.put('/candidates/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, stage, notes } = req.body;
      
      await pool.query(
        `UPDATE candidates SET status = ?, stage = ?, notes = ?
         WHERE id = ?`,
        [status, stage, notes, id]
      );
      
      res.json({ success: true, message: 'Candidate updated successfully' });
    } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(500).json({ success: false, message: 'Error updating candidate' });
    }
  });

  router.delete('/candidates/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
      res.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({ success: false, message: 'Error deleting candidate' });
    }
  });

  // Upload resume
  router.post('/candidates/:id/resume', authenticateToken, upload.single('resume'), async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const resumePath = `/uploads/resumes/${req.file.filename}`;
      
      await pool.query('UPDATE candidates SET resume_path = ? WHERE id = ?', [resumePath, id]);
      
      res.json({ success: true, message: 'Resume uploaded successfully', data: { resume_path: resumePath } });
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ success: false, message: 'Error uploading resume' });
    }
  });
  
  // =====================================================
  // INTERVIEWS
  // =====================================================
  
  router.get('/interviews', authenticateToken, async (req, res) => {
    try {
      const { candidate_id, status } = req.query;
      let query = `
        SELECT i.*, CONCAT(c.first_name, ' ', c.last_name) as candidate_name, 
               j.title as job_title, CONCAT(u.name) as interviewer_name
        FROM interviews i
        LEFT JOIN candidates c ON i.candidate_id = c.id
        LEFT JOIN job_postings j ON c.job_id = j.id
        LEFT JOIN users u ON i.interviewer_id = u.id
        WHERE 1=1
      `;
      let params = [];
      
      if (candidate_id) {
        query += ' AND i.candidate_id = ?';
        params.push(candidate_id);
      }
      
      if (status) {
        query += ' AND i.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY i.interview_date DESC, i.start_time DESC';
      
      const [interviews] = await pool.query(query, params);
      res.json({ success: true, data: interviews });
    } catch (error) {
      console.error('Error fetching interviews:', error);
      res.status(500).json({ success: false, message: 'Error fetching interviews' });
    }
  });

  router.post('/interviews', authenticateToken, async (req, res) => {
    try {
      const { candidate_id, interviewer_id, interview_date, start_time, end_time, location, notes, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO interviews (candidate_id, interviewer_id, interview_date, start_time, end_time, location, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [candidate_id, interviewer_id, interview_date, start_time, end_time, location, notes, status || 'scheduled']
      );
      
      res.status(201).json({ success: true, message: 'Interview scheduled successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      res.status(500).json({ success: false, message: 'Error scheduling interview' });
    }
  });

  router.put('/interviews/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { interview_date, start_time, end_time, location, notes, status, feedback } = req.body;
      
      await pool.query(
        `UPDATE interviews SET interview_date = ?, start_time = ?, end_time = ?, location = ?, 
         notes = ?, status = ?, feedback = ?
         WHERE id = ?`,
        [interview_date, start_time, end_time, location, notes, status, feedback, id]
      );
      
      res.json({ success: true, message: 'Interview updated successfully' });
    } catch (error) {
      console.error('Error updating interview:', error);
      res.status(500).json({ success: false, message: 'Error updating interview' });
    }
  });
  
  return router;
};

