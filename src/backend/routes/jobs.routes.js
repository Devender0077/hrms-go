const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

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
router.get('/:id', authenticateToken, async (req, res) => {
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
router.post('/', authenticateToken, async (req, res) => {
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
router.put('/:id', authenticateToken, async (req, res) => {
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Error deleting job' });
  }
});

  return router;
};
