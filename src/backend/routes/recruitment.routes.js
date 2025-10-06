const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

// JOBS ROUTES

// Get all jobs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT j.*, d.name as department_name, u.first_name, u.last_name
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN users u ON j.created_by = u.id
      ORDER BY j.posted_date DESC
    `);
    
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Error fetching jobs' });
  }
});

// Get job by ID
router.get('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [jobs] = await pool.query(`
      SELECT j.*, d.name as department_name, u.first_name, u.last_name
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN users u ON j.created_by = u.id
      WHERE j.id = ?
    `, [id]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    res.json({ success: true, data: jobs[0] });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Error fetching job' });
  }
});

// Create new job
router.post('/jobs', authenticateToken, async (req, res) => {
  try {
    const {
      title, description, department_id, location, employment_type,
      experience_level, salary_min, salary_max, requirements, benefits,
      closing_date
    } = req.body;
    
    const userId = req.user.id;
    
    const [result] = await pool.query(`
      INSERT INTO jobs (title, description, department_id, location, employment_type,
                       experience_level, salary_min, salary_max, requirements, benefits,
                       closing_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, department_id, location, employment_type,
        experience_level, salary_min, salary_max, requirements, benefits,
        closing_date, userId]);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Error creating job' });
  }
});

// Update job
router.put('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    await pool.query(`UPDATE jobs SET ${setClause} WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Error updating job' });
  }
});

// Delete job
router.delete('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Error deleting job' });
  }
});

// CANDIDATES ROUTES

// Get all candidates
router.get('/candidates', authenticateToken, async (req, res) => {
  try {
    const [candidates] = await pool.query(`
      SELECT c.*, j.title as job_title
      FROM candidates c
      LEFT JOIN jobs j ON c.job_id = j.id
      ORDER BY c.created_at DESC
    `);
    
    res.json({ success: true, data: candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ success: false, message: 'Error fetching candidates' });
  }
});

// Get candidate by ID
router.get('/candidates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [candidates] = await pool.query(`
      SELECT c.*, j.title as job_title
      FROM candidates c
      LEFT JOIN jobs j ON c.job_id = j.id
      WHERE c.id = ?
    `, [id]);
    
    if (candidates.length === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    
    res.json({ success: true, data: candidates[0] });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ success: false, message: 'Error fetching candidate' });
  }
});

// Create new candidate
router.post('/candidates', authenticateToken, async (req, res) => {
  try {
    const {
      job_id, first_name, last_name, email, phone, resume_url,
      cover_letter, experience_years, current_salary, expected_salary,
      availability_date, notes
    } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO candidates (job_id, first_name, last_name, email, phone, resume_url,
                             cover_letter, experience_years, current_salary, expected_salary,
                             availability_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [job_id, first_name, last_name, email, phone, resume_url,
        cover_letter, experience_years, current_salary, expected_salary,
        availability_date, notes]);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ success: false, message: 'Error creating candidate' });
  }
});

// Update candidate
router.put('/candidates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    await pool.query(`UPDATE candidates SET ${setClause} WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Candidate updated successfully' });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ success: false, message: 'Error updating candidate' });
  }
});

// Delete candidate
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

// INTERVIEWS ROUTES

// Get interviews for a candidate
router.get('/candidates/:id/interviews', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [interviews] = await pool.query(`
      SELECT i.*, u.first_name, u.last_name
      FROM interviews i
      LEFT JOIN users u ON i.interviewer_id = u.id
      WHERE i.candidate_id = ?
      ORDER BY i.scheduled_date DESC
    `, [id]);
    
    res.json({ success: true, data: interviews });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching interviews' });
  }
});

// Create interview
router.post('/interviews', authenticateToken, async (req, res) => {
  try {
    const {
      candidate_id, interviewer_id, interview_type, scheduled_date,
      duration_minutes, location, notes
    } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO interviews (candidate_id, interviewer_id, interview_type, scheduled_date,
                             duration_minutes, location, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [candidate_id, interviewer_id, interview_type, scheduled_date,
        duration_minutes, location, notes]);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ success: false, message: 'Error creating interview' });
  }
});

// Update interview
router.put('/interviews/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    await pool.query(`UPDATE interviews SET ${setClause} WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Interview updated successfully' });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ success: false, message: 'Error updating interview' });
  }
});

  return router;
};