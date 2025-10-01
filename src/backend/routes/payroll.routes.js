/**
 * Payroll Routes
 * Payroll processing, salary components, allowances, deductions, loans, payslips
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  
  // =====================================================
  // PAYROLL
  // =====================================================
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { month, year, status, employee_id } = req.query;
      let query = `
        SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_id
        FROM payroll p
        LEFT JOIN employees e ON p.employee_id = e.id
        WHERE 1=1
      `;
      let params = [];
      
      if (month) {
        query += ' AND p.month = ?';
        params.push(month);
      }
      
      if (year) {
        query += ' AND p.year = ?';
        params.push(year);
      }
      
      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }
      
      if (employee_id) {
        query += ' AND p.employee_id = ?';
        params.push(employee_id);
      }
      
      query += ' ORDER BY p.year DESC, p.month DESC, p.created_at DESC';
      
      const [payrolls] = await pool.query(query, params);
      res.json({ success: true, data: payrolls });
    } catch (error) {
      console.error('Error fetching payroll:', error);
      res.status(500).json({ success: false, message: 'Error fetching payroll' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { employee_id, month, year, basic_salary, total_allowances, total_deductions, net_salary, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO payroll (employee_id, month, year, basic_salary, total_allowances, total_deductions, net_salary, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, month, year, basic_salary, total_allowances, total_deductions, net_salary, status || 'draft']
      );
      
      res.status(201).json({ success: true, message: 'Payroll created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating payroll:', error);
      res.status(500).json({ success: false, message: 'Error creating payroll' });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { basic_salary, total_allowances, total_deductions, net_salary, status } = req.body;
      
      await pool.query(
        `UPDATE payroll SET basic_salary = ?, total_allowances = ?, total_deductions = ?, net_salary = ?, status = ?
         WHERE id = ?`,
        [basic_salary, total_allowances, total_deductions, net_salary, status, id]
      );
      
      res.json({ success: true, message: 'Payroll updated successfully' });
    } catch (error) {
      console.error('Error updating payroll:', error);
      res.status(500).json({ success: false, message: 'Error updating payroll' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM payroll WHERE id = ?', [id]);
      res.json({ success: true, message: 'Payroll deleted successfully' });
    } catch (error) {
      console.error('Error deleting payroll:', error);
      res.status(500).json({ success: false, message: 'Error deleting payroll' });
    }
  });
  
  // =====================================================
  // SALARY COMPONENTS
  // =====================================================
  
  router.get('/components', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const [components] = await pool.query(
        'SELECT * FROM salary_components WHERE company_id = ? ORDER BY created_at DESC',
        [companyId]
      );
      res.json({ success: true, data: components });
    } catch (error) {
      console.error('Error fetching salary components:', error);
      res.status(500).json({ success: false, message: 'Error fetching salary components' });
    }
  });

  router.post('/components', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, type, calculation_type, value, is_taxable, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO salary_components (company_id, name, type, calculation_type, value, is_taxable, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, name, type, calculation_type, value, is_taxable, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Salary component created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating salary component:', error);
      res.status(500).json({ success: false, message: 'Error creating salary component' });
    }
  });
  
  // =====================================================
  // ALLOWANCES
  // =====================================================
  
  router.get('/allowances', authenticateToken, async (req, res) => {
    try {
      const [allowances] = await pool.query(
        `SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id
         FROM employee_allowances a
         LEFT JOIN employees e ON a.employee_id = e.id
         ORDER BY a.created_at DESC`
      );
      res.json({ success: true, data: allowances });
    } catch (error) {
      console.error('Error fetching allowances:', error);
      res.status(500).json({ success: false, message: 'Error fetching allowances' });
    }
  });

  router.post('/allowances', authenticateToken, async (req, res) => {
    try {
      const { employee_id, allowance_type, amount, effective_date, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO employee_allowances (employee_id, allowance_type, amount, effective_date, status)
         VALUES (?, ?, ?, ?, ?)`,
        [employee_id, allowance_type, amount, effective_date, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Allowance created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating allowance:', error);
      res.status(500).json({ success: false, message: 'Error creating allowance' });
    }
  });
  
  // =====================================================
  // DEDUCTIONS
  // =====================================================
  
  router.get('/deductions', authenticateToken, async (req, res) => {
    try {
      const [deductions] = await pool.query(
        `SELECT d.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id
         FROM employee_deductions d
         LEFT JOIN employees e ON d.employee_id = e.id
         ORDER BY d.created_at DESC`
      );
      res.json({ success: true, data: deductions });
    } catch (error) {
      console.error('Error fetching deductions:', error);
      res.status(500).json({ success: false, message: 'Error fetching deductions' });
    }
  });

  router.post('/deductions', authenticateToken, async (req, res) => {
    try {
      const { employee_id, deduction_type, amount, effective_date, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO employee_deductions (employee_id, deduction_type, amount, effective_date, status)
         VALUES (?, ?, ?, ?, ?)`,
        [employee_id, deduction_type, amount, effective_date, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Deduction created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating deduction:', error);
      res.status(500).json({ success: false, message: 'Error creating deduction' });
    }
  });
  
  // =====================================================
  // LOANS
  // =====================================================
  
  router.get('/loans', authenticateToken, async (req, res) => {
    try {
      const [loans] = await pool.query(
        `SELECT l.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id
         FROM employee_loans l
         LEFT JOIN employees e ON l.employee_id = e.id
         ORDER BY l.created_at DESC`
      );
      res.json({ success: true, data: loans });
    } catch (error) {
      console.error('Error fetching loans:', error);
      res.status(500).json({ success: false, message: 'Error fetching loans' });
    }
  });

  router.post('/loans', authenticateToken, async (req, res) => {
    try {
      const { employee_id, loan_type, amount, installments, monthly_deduction, start_date, status } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO employee_loans (employee_id, loan_type, amount, installments, monthly_deduction, start_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, loan_type, amount, installments, monthly_deduction, start_date, status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Loan created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating loan:', error);
      res.status(500).json({ success: false, message: 'Error creating loan' });
    }
  });
  
  // =====================================================
  // PAYSLIPS
  // =====================================================
  
  router.get('/payslips', authenticateToken, async (req, res) => {
    try {
      const { employee_id, month, year } = req.query;
      let query = `
        SELECT ps.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id
        FROM payslips ps
        LEFT JOIN employees e ON ps.employee_id = e.id
        WHERE 1=1
      `;
      let params = [];
      
      if (employee_id) {
        query += ' AND ps.employee_id = ?';
        params.push(employee_id);
      }
      
      if (month) {
        query += ' AND ps.month = ?';
        params.push(month);
      }
      
      if (year) {
        query += ' AND ps.year = ?';
        params.push(year);
      }
      
      query += ' ORDER BY ps.year DESC, ps.month DESC';
      
      const [payslips] = await pool.query(query, params);
      res.json({ success: true, data: payslips });
    } catch (error) {
      console.error('Error fetching payslips:', error);
      res.status(500).json({ success: false, message: 'Error fetching payslips' });
    }
  });

  router.post('/payslips', authenticateToken, async (req, res) => {
    try {
      const { employee_id, month, year, gross_salary, total_deductions, net_salary, payment_date } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO payslips (employee_id, month, year, gross_salary, total_deductions, net_salary, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, month, year, gross_salary, total_deductions, net_salary, payment_date]
      );
      
      res.status(201).json({ success: true, message: 'Payslip created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating payslip:', error);
      res.status(500).json({ success: false, message: 'Error creating payslip' });
    }
  });
  
  // =====================================================
  // SALARY COMPONENTS
  // =====================================================
  
  router.get('/salary-components', authenticateToken, async (req, res) => {
    try {
      const [components] = await pool.query(
        'SELECT * FROM employee_salary_components ORDER BY created_at DESC'
      );
      res.json({ success: true, data: components });
    } catch (error) {
      console.error('Error fetching salary components:', error);
      res.status(500).json({ success: false, message: 'Error fetching salary components' });
    }
  });

  return router;
};

