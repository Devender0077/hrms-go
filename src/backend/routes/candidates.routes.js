const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

// Get all candidates
router.get('/', authenticateToken, async (req, res) => {
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
router.get('/:id', authenticateToken, async (req, res) => {
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
router.post('/', authenticateToken, async (req, res) => {
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
router.put('/:id', authenticateToken, async (req, res) => {
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM candidates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ success: false, message: 'Error deleting candidate' });
  }
});

  return router;
};
