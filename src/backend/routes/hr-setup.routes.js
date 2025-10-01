/**
 * HR Setup Routes
 * All routes for HR system configuration and setup
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Document Types API
  router.get('/document-types', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const [rows] = await pool.query('SELECT * FROM document_types WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching document types:', error);
      res.status(500).json({ success: false, message: 'Error fetching document types' });
    }
  });

  router.post('/document-types', authenticateToken, async (req, res) => {
    try {
      const companyId = req.user?.company_id || 1;
      const { name, code, description, is_required, status } = req.body;
      const [result] = await pool.query(
        'INSERT INTO document_types (company_id, name, code, description, is_required, status) VALUES (?, ?, ?, ?, ?, ?)',
        [companyId, name, code, description, is_required || false, status || 'active']
      );
      res.status(201).json({ success: true, message: 'Document type created successfully', data: { id: result.insertId } });
    } catch (error) {
      console.error('Error creating document type:', error);
      res.status(500).json({ success: false, message: 'Error creating document type' });
    }
  });

  router.put('/document-types/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || 1;
      const { name, code, description, is_required, status } = req.body;
      await pool.query(
        'UPDATE document_types SET name = ?, code = ?, description = ?, is_required = ?, status = ? WHERE id = ? AND company_id = ?',
        [name, code, description, is_required, status, id, companyId]
      );
      res.json({ success: true, message: 'Document type updated successfully' });
    } catch (error) {
      console.error('Error updating document type:', error);
      res.status(500).json({ success: false, message: 'Error updating document type' });
    }
  });

  router.delete('/document-types/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || 1;
      await pool.query('DELETE FROM document_types WHERE id = ? AND company_id = ?', [id, companyId]);
      res.json({ success: true, message: 'Document type deleted successfully' });
    } catch (error) {
      console.error('Error deleting document type:', error);
      res.status(500).json({ success: false, message: 'Error deleting document type' });
    }
  });

  // Generic CRUD routes for other HR setup entities
  const hrSetupEntities = [
    { name: 'payslip-types', table: 'payslip_types', singular: 'Payslip type' },
    { name: 'allowance-options', table: 'allowance_options', singular: 'Allowance option' },
    { name: 'loan-options', table: 'loan_options', singular: 'Loan option' },
    { name: 'deduction-options', table: 'deduction_options', singular: 'Deduction option' },
    { name: 'goal-types', table: 'goal_types', singular: 'Goal type' },
    { name: 'competencies', table: 'competencies', singular: 'Competency' },
    { name: 'performance-types', table: 'performance_types', singular: 'Performance type' },
    { name: 'training-types', table: 'training_types', singular: 'Training type' },
    { name: 'job-categories', table: 'job_categories', singular: 'Job category' },
    { name: 'job-stages', table: 'job_stages', singular: 'Job stage' },
    { name: 'award-types', table: 'award_types', singular: 'Award type' },
    { name: 'termination-types', table: 'termination_types', singular: 'Termination type' },
    { name: 'expense-types', table: 'expense_types', singular: 'Expense type' },
    { name: 'income-types', table: 'income_types', singular: 'Income type' },
    { name: 'payment-types', table: 'payment_types', singular: 'Payment type' },
    { name: 'contract-types', table: 'contract_types', singular: 'Contract type' }
  ];

  hrSetupEntities.forEach(entity => {
    // GET - List all
    router.get(`/${entity.name}`, authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const [rows] = await pool.query(`SELECT * FROM ${entity.table} WHERE company_id = ? ORDER BY created_at DESC`, [companyId]);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error(`Error fetching ${entity.name}:`, error);
        res.status(500).json({ success: false, message: `Error fetching ${entity.name}` });
      }
    });

    // POST - Create
    router.post(`/${entity.name}`, authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const data = { ...req.body, company_id: companyId };
        delete data.id;
        delete data.created_at;
        delete data.updated_at;
        
        const columns = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '').join(', ');
        const values = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '').map(k => data[k]);
        const placeholders = values.map(() => '?').join(', ');
        
        const [result] = await pool.query(`INSERT INTO ${entity.table} (${columns}) VALUES (${placeholders})`, values);
        res.status(201).json({ success: true, message: `${entity.singular} created successfully`, data: { id: result.insertId } });
      } catch (error) {
        console.error(`Error creating ${entity.singular}:`, error);
        res.status(500).json({ success: false, message: `Error creating ${entity.singular}` });
      }
    });

    // PUT - Update
    router.put(`/${entity.name}/:id`, authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        const data = { ...req.body };
        delete data.id;
        delete data.company_id;
        delete data.created_at;
        delete data.updated_at;
        
        const setClause = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '').map(key => `${key} = ?`).join(', ');
        const values = [...Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '').map(k => data[k]), id, companyId];
        
        await pool.query(`UPDATE ${entity.table} SET ${setClause} WHERE id = ? AND company_id = ?`, values);
        res.json({ success: true, message: `${entity.singular} updated successfully` });
      } catch (error) {
        console.error(`Error updating ${entity.singular}:`, error);
        res.status(500).json({ success: false, message: `Error updating ${entity.singular}` });
      }
    });

    // DELETE - Delete
    router.delete(`/${entity.name}/:id`, authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        await pool.query(`DELETE FROM ${entity.table} WHERE id = ? AND company_id = ?`, [id, companyId]);
        res.json({ success: true, message: `${entity.singular} deleted successfully` });
      } catch (error) {
        console.error(`Error deleting ${entity.singular}:`, error);
        res.status(500).json({ success: false, message: `Error deleting ${entity.singular}` });
      }
    });
  });

  return router;
};

