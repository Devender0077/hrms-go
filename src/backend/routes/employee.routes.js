/**
 * Employee Routes
 * Employee CRUD, documents, salaries, contracts, profile management
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken, upload, profileUpload) => {
  
  // =====================================================
  // EMPLOYEE CRUD
  // =====================================================
  
  // Get all employees with pagination and filters
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', department = '', status = '' } = req.query;
      const offset = (page - 1) * limit;
      
      let conditions = [];
      let params = [];
      
      if (search) {
        conditions.push('(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.employee_id LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }
      
      if (department) {
        conditions.push('d.name = ?');
        params.push(department);
      }
      
      if (status) {
        conditions.push('e.status = ?');
        params.push(status);
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const [employees] = await pool.query(
        `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name,
                ap.name as attendance_policy_name, s.name as shift_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations ds ON e.designation_id = ds.id
         LEFT JOIN branches b ON e.branch_id = b.id
         LEFT JOIN attendance_policies ap ON e.attendance_policy_id = ap.id
         LEFT JOIN shifts s ON e.shift_id = s.id
         ${whereClause}
         ORDER BY e.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)]
      );
      
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         ${whereClause}`,
        params
      );
      
      res.json({
        success: true,
        data: employees,
        pagination: {
          total: parseInt(total),
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  // =====================================================
  // EMPLOYEE DOCUMENTS
  // =====================================================
  
  router.get('/documents', authenticateToken, async (req, res) => {
    try {
      const [documents] = await pool.query(
        `SELECT ed.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as employee_id_string
         FROM employee_documents ed
         LEFT JOIN employees e ON ed.employee_id = e.id
         ORDER BY ed.created_at DESC`
      );
      
      res.json({ success: true, data: documents });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  router.post('/documents', authenticateToken, async (req, res) => {
    try {
      const { employee_id, document_type, document_name, expiry_date } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO employee_documents (employee_id, document_type, document_name, file_path, expiry_date)
         VALUES (?, ?, ?, ?, ?)`,
        [employee_id, document_type, document_name, '/uploads/documents/', expiry_date]
      );
      
      res.status(201).json({ success: true, message: 'Document created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Create document error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  // =====================================================
  // EMPLOYEE SALARIES
  // =====================================================
  
  router.get('/salaries', authenticateToken, async (req, res) => {
    try {
      const [salaries] = await pool.query(
        `SELECT es.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id
         FROM employee_salaries es
         LEFT JOIN employees e ON es.employee_id = e.id
         ORDER BY es.created_at DESC`
      );
      
      res.json({ success: true, data: salaries });
    } catch (error) {
      console.error('Get salaries error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  router.post('/salaries', authenticateToken, async (req, res) => {
    try {
      const { employee_id, basic_salary, status, effective_date, components } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO employee_salaries (employee_id, basic_salary, status, effective_date)
         VALUES (?, ?, ?, ?)`,
        [employee_id, basic_salary, status || 'active', effective_date]
      );
      
      res.status(201).json({ success: true, message: 'Salary created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Create salary error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  // =====================================================
  // EMPLOYEE CONTRACTS
  // =====================================================
  
  router.get('/contracts', authenticateToken, async (req, res) => {
    try {
      const [contracts] = await pool.query(
        `SELECT ec.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id
         FROM employee_contracts ec
         LEFT JOIN employees e ON ec.employee_id = e.id
         ORDER BY ec.created_at DESC`
      );
      
      res.json({ success: true, data: contracts });
    } catch (error) {
      console.error('Get contracts error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  router.post('/contracts', authenticateToken, async (req, res) => {
    try {
      const { employee_id, contract_type, start_date, end_date, status, terms } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO employee_contracts (employee_id, contract_type, start_date, end_date, status, terms)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, contract_type, start_date, end_date, status || 'active', terms]
      );
      
      res.status(201).json({ success: true, message: 'Contract created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Create contract error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  // Get employee by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [employees] = await pool.query(
        `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations ds ON e.designation_id = ds.id
         LEFT JOIN branches b ON e.branch_id = b.id
         WHERE e.id = ?`,
        [id]
      );
      
      if (employees.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      
      res.json({ success: true, data: employees[0] });
    } catch (error) {
      console.error('Get employee error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  // Get employee by user ID
  router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [employees] = await pool.query(
        `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations ds ON e.designation_id = ds.id
         LEFT JOIN branches b ON e.branch_id = b.id
         WHERE e.user_id = ?`,
        [userId]
      );
      
      if (employees.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      
      res.json({ success: true, data: employees[0] });
    } catch (error) {
      console.error('Get employee by user error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  // Create employee
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const employeeData = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO employees (
          user_id, company_id, branch_id, department_id, designation_id, shift_id,
          employee_id, first_name, last_name, email, phone, date_of_birth, gender,
          address, city, state, country, zip_code, joining_date, exit_date,
          employment_type, attendance_policy_id, bank_name, bank_account_number,
          bank_routing_number, bank_swift_code, bank_address, role, reports_to, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeData.user_id, employeeData.company_id || 1, employeeData.branch_id,
          employeeData.department_id, employeeData.designation_id, employeeData.shift_id,
          employeeData.employee_id, employeeData.first_name, employeeData.last_name,
          employeeData.email, employeeData.phone, employeeData.date_of_birth,
          employeeData.gender, employeeData.address, employeeData.city,
          employeeData.state, employeeData.country, employeeData.zip_code,
          employeeData.joining_date, employeeData.exit_date, employeeData.employment_type,
          employeeData.attendance_policy_id, employeeData.bank_name,
          employeeData.bank_account_number, employeeData.bank_routing_number,
          employeeData.bank_swift_code, employeeData.bank_address, employeeData.role,
          employeeData.reports_to, employeeData.status || 'active'
        ]
      );
      
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  // Update employee
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const employeeData = req.body;
      
      const [result] = await pool.query(
        `UPDATE employees SET
          user_id = ?, company_id = ?, branch_id = ?, department_id = ?, designation_id = ?,
          shift_id = ?, employee_id = ?, first_name = ?, last_name = ?, email = ?,
          phone = ?, date_of_birth = ?, gender = ?, address = ?, city = ?,
          state = ?, country = ?, zip_code = ?, joining_date = ?, exit_date = ?,
          employment_type = ?, attendance_policy_id = ?, bank_name = ?,
          bank_account_number = ?, bank_routing_number = ?, bank_swift_code = ?,
          bank_address = ?, role = ?, reports_to = ?, status = ?
         WHERE id = ?`,
        [
          employeeData.user_id, employeeData.company_id, employeeData.branch_id,
          employeeData.department_id, employeeData.designation_id, employeeData.shift_id,
          employeeData.employee_id, employeeData.first_name, employeeData.last_name,
          employeeData.email, employeeData.phone, employeeData.date_of_birth,
          employeeData.gender, employeeData.address, employeeData.city,
          employeeData.state, employeeData.country, employeeData.zip_code,
          employeeData.joining_date, employeeData.exit_date, employeeData.employment_type,
          employeeData.attendance_policy_id, employeeData.bank_name,
          employeeData.bank_account_number, employeeData.bank_routing_number,
          employeeData.bank_swift_code, employeeData.bank_address, employeeData.role,
          employeeData.reports_to, employeeData.status, id
        ]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      
      res.json({ success: true, message: 'Employee updated successfully' });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  // Delete employee
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      
      res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  return router;
};