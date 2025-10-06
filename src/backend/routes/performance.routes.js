const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

// Get all performance reviews
router.get('/reviews', authenticateToken, async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT pr.*, 
             e.first_name as employee_first_name, 
             e.last_name as employee_last_name,
             r.first_name as reviewer_first_name, 
             r.last_name as reviewer_last_name
      FROM performance_reviews pr
      LEFT JOIN users e ON pr.employee_id = e.id
      LEFT JOIN users r ON pr.reviewer_id = r.id
      ORDER BY pr.created_at DESC
    `);
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching performance reviews' });
  }
});

// Get performance review by ID
router.get('/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [reviews] = await pool.query(`
      SELECT pr.*, 
             e.first_name as employee_first_name, 
             e.last_name as employee_last_name,
             r.first_name as reviewer_first_name, 
             r.last_name as reviewer_last_name
      FROM performance_reviews pr
      LEFT JOIN users e ON pr.employee_id = e.id
      LEFT JOIN users r ON pr.reviewer_id = r.id
      WHERE pr.id = ?
    `, [id]);
    
    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Performance review not found' });
    }
    
    res.json({ success: true, data: reviews[0] });
  } catch (error) {
    console.error('Error fetching performance review:', error);
    res.status(500).json({ success: false, message: 'Error fetching performance review' });
  }
});

// Get performance reviews for an employee
router.get('/reviews/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const [reviews] = await pool.query(`
      SELECT pr.*, 
             r.first_name as reviewer_first_name, 
             r.last_name as reviewer_last_name
      FROM performance_reviews pr
      LEFT JOIN users r ON pr.reviewer_id = r.id
      WHERE pr.employee_id = ?
      ORDER BY pr.review_period_end DESC
    `, [employeeId]);
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching employee performance reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching employee performance reviews' });
  }
});

// Create new performance review
router.post('/reviews', authenticateToken, async (req, res) => {
  try {
    const {
      employee_id, reviewer_id, review_period_start, review_period_end,
      review_type, overall_rating, goals_rating, skills_rating, behavior_rating,
      achievements, areas_for_improvement, goals_next_period, comments
    } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO performance_reviews (employee_id, reviewer_id, review_period_start, review_period_end,
                                     review_type, overall_rating, goals_rating, skills_rating, behavior_rating,
                                     achievements, areas_for_improvement, goals_next_period, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employee_id, reviewer_id, review_period_start, review_period_end,
        review_type, overall_rating, goals_rating, skills_rating, behavior_rating,
        achievements, areas_for_improvement, goals_next_period, comments]);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating performance review:', error);
    res.status(500).json({ success: false, message: 'Error creating performance review' });
  }
});

// Update performance review
router.put('/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    await pool.query(`UPDATE performance_reviews SET ${setClause} WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Performance review updated successfully' });
  } catch (error) {
    console.error('Error updating performance review:', error);
    res.status(500).json({ success: false, message: 'Error updating performance review' });
  }
});

// Delete performance review
router.delete('/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM performance_reviews WHERE id = ?', [id]);
    res.json({ success: true, message: 'Performance review deleted successfully' });
  } catch (error) {
    console.error('Error deleting performance review:', error);
    res.status(500).json({ success: false, message: 'Error deleting performance review' });
  }
});

// Get performance statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(overall_rating) as average_rating,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reviews,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_reviews,
        COUNT(CASE WHEN overall_rating >= 4.0 THEN 1 END) as high_performers,
        COUNT(CASE WHEN overall_rating < 3.0 THEN 1 END) as low_performers
      FROM performance_reviews
      WHERE overall_rating IS NOT NULL
    `);
    
    const [recentReviews] = await pool.query(`
      SELECT pr.*, 
             e.first_name as employee_first_name, 
             e.last_name as employee_last_name
      FROM performance_reviews pr
      LEFT JOIN users e ON pr.employee_id = e.id
      ORDER BY pr.updated_at DESC
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: {
        ...stats[0],
        recent_reviews: recentReviews
      }
    });
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching performance statistics' });
  }
});

  return router;
};
