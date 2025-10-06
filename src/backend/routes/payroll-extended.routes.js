const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

// EMPLOYEE SALARIES ROUTES

// Get all employee salaries
router.get('/employee-salaries', authenticateToken, async (req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT es.*, u.first_name, u.last_name, u.email
      FROM payroll_salaries es
      LEFT JOIN users u ON es.employee_id = u.id
      ORDER BY es.effective_date DESC
    `);
    
    res.json({ success: true, data: salaries });
  } catch (error) {
    console.error('Error fetching employee salaries:', error);
    res.status(500).json({ success: false, message: 'Error fetching employee salaries' });
  }
});

// Get salary by employee ID
router.get('/employee-salaries/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const [salaries] = await pool.query(`
      SELECT es.*, u.first_name, u.last_name, u.email
      FROM payroll_salaries es
      LEFT JOIN users u ON es.employee_id = u.id
      WHERE es.employee_id = ? AND es.status = 'active'
      ORDER BY es.effective_date DESC
      LIMIT 1
    `, [employeeId]);
    
    if (salaries.length === 0) {
      return res.status(404).json({ success: false, message: 'Salary not found' });
    }
    
    res.json({ success: true, data: salaries[0] });
  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({ success: false, message: 'Error fetching employee salary' });
  }
});

// Create new employee salary
router.post('/employee-salaries', authenticateToken, async (req, res) => {
  try {
    const {
      employee_id, basic_salary, allowances, deductions, net_salary, effective_date
    } = req.body;
    
    // Deactivate previous salary
    await pool.query(`
      UPDATE payroll_salaries 
      SET status = 'inactive' 
      WHERE employee_id = ? AND status = 'active'
    `, [employee_id]);
    
    const [result] = await pool.query(`
      INSERT INTO payroll_salaries (employee_id, basic_salary, allowances, deductions, net_salary, effective_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employee_id, basic_salary, allowances, deductions, net_salary, effective_date]);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating employee salary:', error);
    res.status(500).json({ success: false, message: 'Error creating employee salary' });
  }
});

// Update employee salary
router.put('/employee-salaries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    await pool.query(`UPDATE payroll_salaries SET ${setClause} WHERE id = ?`, values);
    
    res.json({ success: true, message: 'Employee salary updated successfully' });
  } catch (error) {
    console.error('Error updating employee salary:', error);
    res.status(500).json({ success: false, message: 'Error updating employee salary' });
  }
});

// PAYSLIPS ROUTES

// Get all payslips
router.get('/payslips', authenticateToken, async (req, res) => {
  try {
    const [payslips] = await pool.query(`
      SELECT pp.*, u.first_name, u.last_name, u.email
      FROM payroll_payslips pp
      LEFT JOIN users u ON pp.employee_id = u.id
      ORDER BY pp.pay_period_end DESC
    `);
    
    res.json({ success: true, data: payslips });
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ success: false, message: 'Error fetching payslips' });
  }
});

// Get payslip by ID
router.get('/payslips/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [payslips] = await pool.query(`
      SELECT pp.*, u.first_name, u.last_name, u.email
      FROM payroll_payslips pp
      LEFT JOIN users u ON pp.employee_id = u.id
      WHERE pp.id = ?
    `, [id]);
    
    if (payslips.length === 0) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }
    
    res.json({ success: true, data: payslips[0] });
  } catch (error) {
    console.error('Error fetching payslip:', error);
    res.status(500).json({ success: false, message: 'Error fetching payslip' });
  }
});

// Get payslips by employee ID
router.get('/payslips/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const [payslips] = await pool.query(`
      SELECT pp.*, u.first_name, u.last_name, u.email
      FROM payroll_payslips pp
      LEFT JOIN users u ON pp.employee_id = u.id
      WHERE pp.employee_id = ?
      ORDER BY pp.pay_period_end DESC
    `, [employeeId]);
    
    res.json({ success: true, data: payslips });
  } catch (error) {
    console.error('Error fetching employee payslips:', error);
    res.status(500).json({ success: false, message: 'Error fetching employee payslips' });
  }
});

// Generate payslip
router.post('/payslips/generate', authenticateToken, async (req, res) => {
  try {
    const {
      employee_id, pay_period_start, pay_period_end,
      basic_salary, allowances, overtime, bonuses, deductions, tax
    } = req.body;
    
    const net_pay = basic_salary + allowances + overtime + bonuses - deductions - tax;
    
    const [result] = await pool.query(`
      INSERT INTO payroll_payslips (employee_id, pay_period_start, pay_period_end,
                                   basic_salary, allowances, overtime, bonuses, 
                                   deductions, tax, net_pay, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated')
    `, [employee_id, pay_period_start, pay_period_end,
        basic_salary, allowances, overtime, bonuses,
        deductions, tax, net_pay]);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ success: false, message: 'Error generating payslip' });
  }
});

// Update payslip status
router.put('/payslips/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateFields = ['status = ?'];
    const values = [status];
    
    if (status === 'paid') {
      updateFields.push('paid_at = NOW()');
    }
    
    values.push(id);
    
    await pool.query(`
      UPDATE payroll_payslips 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, values);
    
    res.json({ success: true, message: 'Payslip status updated successfully' });
  } catch (error) {
    console.error('Error updating payslip status:', error);
    res.status(500).json({ success: false, message: 'Error updating payslip status' });
  }
});

// Delete payslip
router.delete('/payslips/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM payroll_payslips WHERE id = ?', [id]);
    res.json({ success: true, message: 'Payslip deleted successfully' });
  } catch (error) {
    console.error('Error deleting payslip:', error);
    res.status(500).json({ success: false, message: 'Error deleting payslip' });
  }
});

// PAYROLL STATISTICS

// Get payroll statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT employee_id) as total_employees,
        SUM(net_pay) as total_payroll,
        AVG(net_pay) as average_salary,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payslips,
        COUNT(CASE WHEN status = 'generated' THEN 1 END) as pending_payslips,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_payslips
      FROM payroll_payslips
      WHERE pay_period_end >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    
    const [recentPayslips] = await pool.query(`
      SELECT pp.*, u.first_name, u.last_name
      FROM payroll_payslips pp
      LEFT JOIN users u ON pp.employee_id = u.id
      ORDER BY pp.generated_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        ...stats[0],
        recent_payslips: recentPayslips
      }
    });
  } catch (error) {
    console.error('Error fetching payroll stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching payroll statistics' });
  }
});

  return router;
};
