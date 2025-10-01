/**
 * Documents Management Routes
 * Document upload, management, categorization, access control
 */

const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken, upload) => {
  
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const { document_type_id, employee_id, status, is_confidential } = req.query;
      let query = `
        SELECT d.*, dt.name as document_type_name, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN document_types dt ON d.document_type_id = dt.id
        LEFT JOIN employees e ON d.employee_id = e.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE 1=1
      `;
      let params = [];
      
      if (document_type_id) {
        query += ' AND d.document_type_id = ?';
        params.push(document_type_id);
      }
      
      if (employee_id) {
        query += ' AND d.employee_id = ?';
        params.push(employee_id);
      }
      
      if (status) {
        query += ' AND d.status = ?';
        params.push(status);
      }
      
      if (is_confidential !== undefined) {
        query += ' AND d.is_confidential = ?';
        params.push(is_confidential === 'true' || is_confidential === true ? 1 : 0);
      }
      
      query += ' ORDER BY d.created_at DESC';
      
      const [documents] = await pool.query(query, params);
      res.json({ success: true, data: documents });
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ success: false, message: 'Error fetching documents' });
    }
  });

  router.post('/', authenticateToken, upload.single('document'), async (req, res) => {
    try {
      const { title, document_type_id, employee_id, expiry_date, is_confidential, tags, status } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const file_path = `/uploads/documents/${req.file.filename}`;
      const file_size = req.file.size;
      const uploaded_by = req.user.id;
      
      const [result] = await pool.query(
        `INSERT INTO documents (title, document_type_id, file_path, file_size, uploaded_by, employee_id, expiry_date, is_confidential, tags, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, document_type_id, file_path, file_size, uploaded_by, employee_id, expiry_date, is_confidential || false, JSON.stringify(tags || []), status || 'active']
      );
      
      res.status(201).json({ success: true, message: 'Document uploaded successfully', data: { id: result.insertId, file_path } });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ success: false, message: 'Error uploading document' });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, document_type_id, expiry_date, is_confidential, tags, status } = req.body;
      
      await pool.query(
        `UPDATE documents SET title = ?, document_type_id = ?, expiry_date = ?, is_confidential = ?, tags = ?, status = ?
         WHERE id = ?`,
        [title, document_type_id, expiry_date, is_confidential, JSON.stringify(tags || []), status, id]
      );
      
      res.json({ success: true, message: 'Document updated successfully' });
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ success: false, message: 'Error updating document' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM documents WHERE id = ?', [id]);
      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ success: false, message: 'Error deleting document' });
    }
  });

  router.get('/:id/download', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [documents] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
      
      if (documents.length === 0) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      
      const document = documents[0];
      res.json({ success: true, data: { file_path: document.file_path, title: document.title } });
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ success: false, message: 'Error downloading document' });
    }
  });

  router.get('/employee/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [documents] = await pool.query(
        `SELECT d.*, dt.name as document_type_name
         FROM documents d
         LEFT JOIN document_types dt ON d.document_type_id = dt.id
         WHERE d.employee_id = ?
         ORDER BY d.created_at DESC`,
        [id]
      );
      res.json({ success: true, data: documents });
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      res.status(500).json({ success: false, message: 'Error fetching employee documents' });
    }
  });

  router.post('/bulk-upload', authenticateToken, upload.array('documents', 10), async (req, res) => {
    try {
      const { document_type_id, employee_id, is_confidential, tags } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }
      
      const uploaded_by = req.user.id;
      const uploadedDocs = [];
      
      for (const file of req.files) {
        const file_path = `/uploads/documents/${file.filename}`;
        const file_size = file.size;
        const title = file.originalname;
        
        const [result] = await pool.query(
          `INSERT INTO documents (title, document_type_id, file_path, file_size, uploaded_by, employee_id, is_confidential, tags, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, document_type_id, file_path, file_size, uploaded_by, employee_id, is_confidential || false, JSON.stringify(tags || []), 'active']
        );
        
        uploadedDocs.push({ id: result.insertId, title, file_path });
      }
      
      res.status(201).json({ success: true, message: `${uploadedDocs.length} documents uploaded successfully`, data: uploadedDocs });
    } catch (error) {
      console.error('Error bulk uploading documents:', error);
      res.status(500).json({ success: false, message: 'Error bulk uploading documents' });
    }
  });
  
  return router;
};

