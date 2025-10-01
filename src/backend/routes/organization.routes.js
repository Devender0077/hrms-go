/**
 * Organization Routes
 * Routes for branches, departments, designations, and org chart
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // =====================================================
  // BRANCHES
  // =====================================================
  
  router.get('/branches', authenticateToken, async (req, res) => {
    try {
      const [branches] = await pool.query(
        'SELECT * FROM branches WHERE company_id = ? ORDER BY created_at DESC',
        [req.user?.company_id || 1]
      );
      res.json({ success: true, data: branches });
    } catch (error) {
      console.error('Error fetching branches:', error);
      res.status(500).json({ success: false, message: 'Error fetching branches', error: error.message });
    }
  });

  router.post('/branches', authenticateToken, async (req, res) => {
    try {
      const { name, code, location, address, phone, email, city, state, country, zip_code, status } = req.body;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        `INSERT INTO branches (company_id, name, code, location, address, phone, email, city, state, country, zip_code, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, code, location, address, phone, email, city, state, country, zip_code, status || 'active']
      );
      
      res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: { id: result.insertId, name, code }
      });
    } catch (error) {
      console.error('Error creating branch:', error);
      res.status(500).json({ success: false, message: 'Error creating branch', error: error.message });
    }
  });

  router.put('/branches/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, location, address, phone, email, city, state, country, zip_code, status } = req.body;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        `UPDATE branches SET name = ?, code = ?, location = ?, address = ?, phone = ?, email = ?, 
         city = ?, state = ?, country = ?, zip_code = ?, status = ? 
         WHERE id = ? AND company_id = ?`,
        [name, code, location, address, phone, email, city, state, country, zip_code, status, id, companyId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }
      
      res.json({ success: true, message: 'Branch updated successfully' });
    } catch (error) {
      console.error('Error updating branch:', error);
      res.status(500).json({ success: false, message: 'Error updating branch', error: error.message });
    }
  });

  router.delete('/branches/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        'DELETE FROM branches WHERE id = ? AND company_id = ?',
        [id, companyId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }
      
      res.json({ success: true, message: 'Branch deleted successfully' });
    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).json({ success: false, message: 'Error deleting branch', error: error.message });
    }
  });

  // =====================================================
  // DEPARTMENTS
  // =====================================================
  
  router.get('/departments', authenticateToken, async (req, res) => {
    try {
      const [departments] = await pool.query(
        `SELECT d.*, b.name as branch_name 
         FROM departments d 
         LEFT JOIN branches b ON d.branch_id = b.id 
         WHERE d.company_id = ? 
         ORDER BY d.created_at DESC`,
        [req.user?.company_id || 1]
      );
      res.json({ success: true, data: departments });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ success: false, message: 'Error fetching departments', error: error.message });
    }
  });

  router.get('/departments/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [departments] = await pool.query(
        'SELECT * FROM departments WHERE id = ? AND company_id = ?',
        [id, req.user?.company_id || 1]
      );
      
      if (departments.length === 0) {
        return res.status(404).json({ success: false, message: 'Department not found' });
      }
      
      res.json({ success: true, data: departments[0] });
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({ success: false, message: 'Error fetching department', error: error.message });
    }
  });

  router.post('/departments', authenticateToken, async (req, res) => {
    try {
      const { name, code, description, branch_id, manager_id, status } = req.body;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        `INSERT INTO departments (company_id, name, code, description, branch_id, manager_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, code, description, branch_id, manager_id, status || 'active']
      );
      
      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: { id: result.insertId, name, code }
      });
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({ success: false, message: 'Error creating department', error: error.message });
    }
  });

  router.put('/departments/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, description, branch_id, manager_id, status } = req.body;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        `UPDATE departments SET name = ?, code = ?, description = ?, branch_id = ?, manager_id = ?, status = ? 
         WHERE id = ? AND company_id = ?`,
        [name, code, description, branch_id, manager_id, status, id, companyId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Department not found' });
      }
      
      res.json({ success: true, message: 'Department updated successfully' });
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({ success: false, message: 'Error updating department', error: error.message });
    }
  });

  router.delete('/departments/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        'DELETE FROM departments WHERE id = ? AND company_id = ?',
        [id, companyId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Department not found' });
      }
      
      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({ success: false, message: 'Error deleting department', error: error.message });
    }
  });

  // =====================================================
  // DESIGNATIONS
  // =====================================================
  
  router.get('/designations', authenticateToken, async (req, res) => {
    try {
      const [designations] = await pool.query(
        `SELECT d.*, dep.name as department_name 
         FROM designations d 
         LEFT JOIN departments dep ON d.department_id = dep.id 
         WHERE d.company_id = ? 
         ORDER BY d.created_at DESC`,
        [req.user?.company_id || 1]
      );
      res.json({ success: true, data: designations });
    } catch (error) {
      console.error('Error fetching designations:', error);
      res.status(500).json({ success: false, message: 'Error fetching designations', error: error.message });
    }
  });

  router.post('/designations', authenticateToken, async (req, res) => {
    try {
      const { name, code, description, department_id, status } = req.body;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        `INSERT INTO designations (company_id, name, code, description, department_id, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [companyId, name, code, description, department_id, status || 'active']
      );
      
      res.status(201).json({
        success: true,
        message: 'Designation created successfully',
        data: { id: result.insertId, name, code }
      });
    } catch (error) {
      console.error('Error creating designation:', error);
      res.status(500).json({ success: false, message: 'Error creating designation', error: error.message });
    }
  });

  router.put('/designations/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, description, department_id, status } = req.body;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        `UPDATE designations SET name = ?, code = ?, description = ?, department_id = ?, status = ? 
         WHERE id = ? AND company_id = ?`,
        [name, code, description, department_id, status, id, companyId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Designation not found' });
      }
      
      res.json({ success: true, message: 'Designation updated successfully' });
    } catch (error) {
      console.error('Error updating designation:', error);
      res.status(500).json({ success: false, message: 'Error updating designation', error: error.message });
    }
  });

  router.delete('/designations/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || 1;
      
      const [result] = await pool.query(
        'DELETE FROM designations WHERE id = ? AND company_id = ?',
        [id, companyId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Designation not found' });
      }
      
      res.json({ success: true, message: 'Designation deleted successfully' });
    } catch (error) {
      console.error('Error deleting designation:', error);
      res.status(500).json({ success: false, message: 'Error deleting designation', error: error.message });
    }
  });

  // =====================================================
  // ORGANIZATION CHART
  // =====================================================
  
  router.get('/chart', authenticateToken, async (req, res) => {
    try {
      const [employees] = await pool.query(
        `SELECT e.id, e.first_name, e.last_name, e.employee_id, e.profile_photo,
                d.name as department, des.name as designation,
                m.first_name as manager_first_name, m.last_name as manager_last_name,
                e.reports_to as manager_id
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations des ON e.designation_id = des.id
         LEFT JOIN employees m ON e.reports_to = m.id
         WHERE e.company_id = ? AND e.status = 'active'
         ORDER BY e.id`,
        [req.user?.company_id || 1]
      );
      
      const employeeMap = {};
      employees.forEach(emp => {
        employeeMap[emp.id] = {
          ...emp,
          subordinates: []
        };
      });
      
      const chart = [];
      employees.forEach(emp => {
        if (emp.manager_id && employeeMap[emp.manager_id]) {
          employeeMap[emp.manager_id].subordinates.push(employeeMap[emp.id]);
        } else {
          chart.push(employeeMap[emp.id]);
        }
      });
      
      res.json({ success: true, data: chart });
    } catch (error) {
      console.error('Error fetching org chart:', error);
      res.status(500).json({ success: false, message: 'Error fetching organization chart', error: error.message });
    }
  });

  return router;
};

