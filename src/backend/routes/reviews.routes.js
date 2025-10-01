/**
 * Performance Reviews Routes
 * Performance reviews, feedback, ratings
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { employee_id, reviewer_id, status } = req.query;
      let query = `
        SELECT pr.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               CONCAT(r.name) as reviewer_name
        FROM performance_reviews pr
        LEFT JOIN employees e ON pr.employee_id = e.id
        LEFT JOIN users r ON pr.reviewer_id = r.id
        WHERE 1=1
      `;
      let params = [];
      
      if (employee_id) {
        query += ' AND pr.employee_id = ?';
        params.push(employee_id);
      }
      
      if (reviewer_id) {
        query += ' AND pr.reviewer_id = ?';
        params.push(reviewer_id);
      }
      
      if (status) {
        query += ' AND pr.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY pr.created_at DESC';
      
      const [reviews] = await pool.query(query, params);
      res.json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ success: false, message: 'Error fetching performance reviews' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { employee_id, review_period_start, review_period_end, overall_rating, status, questions } = req.body;
      const reviewer_id = req.user.id;
      
      const [result] = await pool.query(
        `INSERT INTO performance_reviews (employee_id, reviewer_id, review_period_start, review_period_end, overall_rating, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, reviewer_id, review_period_start, review_period_end, overall_rating, status || 'draft']
      );
      
      const reviewId = result.insertId;
      
      if (questions && questions.length > 0) {
        for (const q of questions) {
          await pool.query(
            `INSERT INTO review_questions (review_id, question, answer, rating)
             VALUES (?, ?, ?, ?)`,
            [reviewId, q.question, q.answer, q.rating]
          );
        }
      }
      
      res.status(201).json({ success: true, message: 'Review created successfully', data: { id: reviewId } });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ success: false, message: 'Error creating performance review' });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { review_period_start, review_period_end, overall_rating, status, questions } = req.body;
      
      await pool.query(
        `UPDATE performance_reviews SET review_period_start = ?, review_period_end = ?, overall_rating = ?, status = ?
         WHERE id = ?`,
        [review_period_start, review_period_end, overall_rating, status, id]
      );
      
      if (questions && questions.length > 0) {
        await pool.query('DELETE FROM review_questions WHERE review_id = ?', [id]);
        for (const q of questions) {
          await pool.query(
            `INSERT INTO review_questions (review_id, question, answer, rating)
             VALUES (?, ?, ?, ?)`,
            [id, q.question, q.answer, q.rating]
          );
        }
      }
      
      res.json({ success: true, message: 'Review updated successfully' });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ success: false, message: 'Error updating performance review' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM performance_reviews WHERE id = ?', [id]);
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ success: false, message: 'Error deleting performance review' });
    }
  });

  router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        `UPDATE performance_reviews SET status = 'submitted', submitted_at = NOW() WHERE id = ?`,
        [id]
      );
      res.json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ success: false, message: 'Error submitting performance review' });
    }
  });

  router.get('/pending', authenticateToken, async (req, res) => {
    try {
      const [reviews] = await pool.query(
        `SELECT pr.*, 
                CONCAT(e.first_name, ' ', e.last_name) as employee_name
         FROM performance_reviews pr
         LEFT JOIN employees e ON pr.employee_id = e.id
         WHERE pr.status = 'draft' OR pr.status = 'submitted'
         ORDER BY pr.created_at DESC`
      );
      res.json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      res.status(500).json({ success: false, message: 'Error fetching pending reviews' });
    }
  });
  
  return router;
};

