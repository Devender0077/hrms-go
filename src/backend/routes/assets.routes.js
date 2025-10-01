/**
 * Assets Management Routes
 * Assets, assignments, tracking, maintenance
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { status, category, location } = req.query;
      let query = 'SELECT * FROM assets WHERE 1=1';
      let params = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      if (location) {
        query += ' AND location = ?';
        params.push(location);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [assets] = await pool.query(query, params);
      res.json({ success: true, data: assets });
    } catch (error) {
      console.error('Error fetching assets:', error);
      res.status(500).json({ success: false, message: 'Error fetching assets' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { name, asset_code, category, serial_number, purchase_date, purchase_price, status, condition, location, warranty_expires } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO assets (name, asset_code, category, serial_number, purchase_date, purchase_price, status, \`condition\`, location, warranty_expires)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, asset_code, category, serial_number, purchase_date, purchase_price, status || 'available', condition || 'good', location, warranty_expires]
      );
      
      res.status(201).json({ success: true, message: 'Asset created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating asset:', error);
      res.status(500).json({ success: false, message: 'Error creating asset' });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, asset_code, category, serial_number, purchase_date, purchase_price, status, condition, location, warranty_expires } = req.body;
      
      await pool.query(
        `UPDATE assets SET name = ?, asset_code = ?, category = ?, serial_number = ?, purchase_date = ?, 
         purchase_price = ?, status = ?, \`condition\` = ?, location = ?, warranty_expires = ?
         WHERE id = ?`,
        [name, asset_code, category, serial_number, purchase_date, purchase_price, status, condition, location, warranty_expires, id]
      );
      
      res.json({ success: true, message: 'Asset updated successfully' });
    } catch (error) {
      console.error('Error updating asset:', error);
      res.status(500).json({ success: false, message: 'Error updating asset' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM assets WHERE id = ?', [id]);
      res.json({ success: true, message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Error deleting asset:', error);
      res.status(500).json({ success: false, message: 'Error deleting asset' });
    }
  });

  router.post('/:id/assign', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { employee_id, assigned_date, notes } = req.body;
      const assigned_by = req.user.id;
      
      await pool.query('UPDATE assets SET status = ? WHERE id = ?', ['assigned', id]);
      
      const [result] = await pool.query(
        `INSERT INTO asset_assignments (asset_id, employee_id, assigned_date, assigned_by, status, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, employee_id, assigned_date, assigned_by, 'active', notes]
      );
      
      res.status(201).json({ success: true, message: 'Asset assigned successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error assigning asset:', error);
      res.status(500).json({ success: false, message: 'Error assigning asset' });
    }
  });

  router.put('/:id/return', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { return_date, notes, condition } = req.body;
      
      await pool.query('UPDATE assets SET status = ?, \`condition\` = ? WHERE id = ?', ['available', condition || 'good', id]);
      
      await pool.query(
        `UPDATE asset_assignments SET status = ?, return_date = ?, notes = CONCAT(IFNULL(notes, ''), ' | Return: ', ?)
         WHERE asset_id = ? AND status = 'active'`,
        ['returned', return_date, notes || '', id]
      );
      
      res.json({ success: true, message: 'Asset returned successfully' });
    } catch (error) {
      console.error('Error returning asset:', error);
      res.status(500).json({ success: false, message: 'Error returning asset' });
    }
  });

  router.get('/employee/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [assignments] = await pool.query(
        `SELECT aa.*, a.name as asset_name, a.asset_code, a.category, u.name as assigned_by_name
         FROM asset_assignments aa
         LEFT JOIN assets a ON aa.asset_id = a.id
         LEFT JOIN users u ON aa.assigned_by = u.id
         WHERE aa.employee_id = ?
         ORDER BY aa.assigned_date DESC`,
        [id]
      );
      res.json({ success: true, data: assignments });
    } catch (error) {
      console.error('Error fetching employee assets:', error);
      res.status(500).json({ success: false, message: 'Error fetching employee assets' });
    }
  });
  
  return router;
};

