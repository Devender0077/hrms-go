// Express server for HRM API
    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const helmet = require('helmet');
    const compression = require('compression');
    const dotenv = require('dotenv');
    const mysql = require('mysql2/promise');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcrypt');
    const multer = require('multer');
    const path = require('path');
    
    // Load environment variables
    dotenv.config();
    
    // Create Express app
    const app = express();
    
    // Middleware
    app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    app.use(compression());
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // Serve static files from uploads directory
    app.use('/uploads', express.static('uploads'));
    app.use('/uploads/profiles', express.static('uploads/profiles'));
    
    // Database connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hrmgo',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // File upload configuration
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    });
    
    const upload = multer({ 
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only images, PDFs, Word, and Excel files are allowed.'));
        }
      }
    });

    // Profile photo upload configuration
    const profileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    });

    const profileUpload = multer({ 
      storage: profileStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for profile photos
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed for profile photos'), false);
        }
      }
    });
    
    // Authentication middleware
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
      });
    };
    
    // Role-based authorization middleware
    const authorize = (roles = []) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ message: 'Authentication required' });
        }
        
        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied' });
        }
        
        next();
      };
    };
    
    // API Routes
    
    // Auth routes
    app.post('/api/v1/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Get user from database
        const [users] = await pool.query(
          'SELECT * FROM users WHERE email = ? AND status = "active"',
          [email]
        );
        
        const user = users[0];
        
        // Check if user exists
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email, 
            role: user.role 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        // Return user data and token
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_photo: user.profile_photo
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Employee routes
    app.get('/api/v1/employees', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, search = '', department = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        
        // Build query conditions
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
        
        // Get employees with pagination
        const [employees] = await pool.query(
          `SELECT e.*, d.name as department_name, ds.name as designation_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           ${whereClause}
           ORDER BY e.id DESC
           LIMIT ? OFFSET ?`,
          [...params, parseInt(limit), parseInt(offset)]
        );
        
        // Get total count for pagination
        const [countResult] = await pool.query(
          `SELECT COUNT(*) as total
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           ${whereClause}`,
          [...params]
        );
        
        const total = countResult[0].total;
        
        res.json({
          data: employees,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get employee by ID
    app.get('/api/v1/employees/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Get employee details
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
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        const employee = employees[0];
        
        // Get employee documents
        const [documents] = await pool.query(
          'SELECT * FROM employee_documents WHERE employee_id = ?',
          [id]
        );
        
        // Get employee attendance for current month
        const [attendance] = await pool.query(
          `SELECT * FROM attendance 
           WHERE employee_id = ? 
           AND MONTH(date) = MONTH(CURRENT_DATE()) 
           AND YEAR(date) = YEAR(CURRENT_DATE())
           ORDER BY date DESC`,
          [id]
        );
        
        // Get employee leaves
        const [leaves] = await pool.query(
          `SELECT l.*, lt.name as leave_type_name
           FROM leave_applications l
           JOIN leave_types lt ON l.leave_type_id = lt.id
           WHERE l.employee_id = ?
           ORDER BY l.start_date DESC`,
          [id]
        );
        
        // Return employee data with related information
        res.json({
          ...employee,
          documents,
          attendance,
          leaves
        });
      } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Create employee
    app.post('/api/v1/employees', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const {
          first_name, last_name, email, phone, department_id, designation_id,
          branch_id, joining_date, employee_id, gender, address, city, state,
          country, zip_code, date_of_birth
        } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !email || !employee_id) {
          return res.status(400).json({ 
            message: 'Required fields missing',
            errors: {
              first_name: !first_name ? ['First name is required'] : undefined,
              last_name: !last_name ? ['Last name is required'] : undefined,
              email: !email ? ['Email is required'] : undefined,
              employee_id: !employee_id ? ['Employee ID is required'] : undefined
            }
          });
        }
        
        // Check if email already exists
        const [existingEmails] = await pool.query(
          'SELECT id FROM employees WHERE email = ?',
          [email]
        );
        
        if (existingEmails.length > 0) {
          return res.status(422).json({ 
            message: 'Email already in use',
            errors: {
              email: ['This email is already registered']
            }
          });
        }
        
        // Check if employee ID already exists
        const [existingIds] = await pool.query(
          'SELECT id FROM employees WHERE employee_id = ?',
          [employee_id]
        );
        
        if (existingIds.length > 0) {
          return res.status(422).json({ 
            message: 'Employee ID already in use',
            errors: {
              employee_id: ['This employee ID is already in use']
            }
          });
        }
        
        // Create user account
        const hashedPassword = await bcrypt.hash('password123', 10); // Default password
        
        const [userResult] = await pool.query(
          `INSERT INTO users (name, email, password, role, status)
           VALUES (?, ?, ?, ?, ?)`,
          [`${first_name} ${last_name}`, email, hashedPassword, 'employee', 'active']
        );
        
        const userId = userResult.insertId;
        
        // Create employee record
        const [employeeResult] = await pool.query(
          `INSERT INTO employees (
            user_id, company_id, branch_id, department_id, designation_id,
            employee_id, first_name, last_name, email, phone,
            date_of_birth, gender, address, city, state, country, zip_code,
            joining_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, req.user.company_id, branch_id, department_id, designation_id,
            employee_id, first_name, last_name, email, phone,
            date_of_birth, gender, address, city, state, country, zip_code,
            joining_date, 'active'
          ]
        );
        
        const employeeId = employeeResult.insertId;
        
        // Get the created employee with related data
        const [employees] = await pool.query(
          `SELECT e.*, d.name as department_name, ds.name as designation_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           WHERE e.id = ?`,
          [employeeId]
        );
        
        res.status(201).json({
          message: 'Employee created successfully',
          data: employees[0]
        });
      } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Update employee
    app.put('/api/v1/employees/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const {
          first_name, last_name, email, phone, department_id, designation_id,
          branch_id, joining_date, employee_id, gender, address, city, state,
          country, zip_code, date_of_birth, status
        } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !email || !employee_id) {
          return res.status(400).json({ 
            message: 'Required fields missing',
            errors: {
              first_name: !first_name ? ['First name is required'] : undefined,
              last_name: !last_name ? ['Last name is required'] : undefined,
              email: !email ? ['Email is required'] : undefined,
              employee_id: !employee_id ? ['Employee ID is required'] : undefined
            }
          });
        }
        
        // Check if employee exists
        const [existingEmployees] = await pool.query(
          'SELECT * FROM employees WHERE id = ?',
          [id]
        );
        
        if (existingEmployees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        const existingEmployee = existingEmployees[0];
        
        // Check if email already exists (excluding current employee)
        if (email !== existingEmployee.email) {
          const [existingEmails] = await pool.query(
            'SELECT id FROM employees WHERE email = ? AND id != ?',
            [email, id]
          );
          
          if (existingEmails.length > 0) {
            return res.status(422).json({ 
              message: 'Email already in use',
              errors: {
                email: ['This email is already registered']
              }
            });
          }
        }
        
        // Check if employee ID already exists (excluding current employee)
        if (employee_id !== existingEmployee.employee_id) {
          const [existingIds] = await pool.query(
            'SELECT id FROM employees WHERE employee_id = ? AND id != ?',
            [employee_id, id]
          );
          
          if (existingIds.length > 0) {
            return res.status(422).json({ 
              message: 'Employee ID already in use',
              errors: {
                employee_id: ['This employee ID is already in use']
              }
            });
          }
        }
        
        // Update employee record
        await pool.query(
          `UPDATE employees SET
            branch_id = ?, department_id = ?, designation_id = ?,
            employee_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?,
            date_of_birth = ?, gender = ?, address = ?, city = ?, state = ?, country = ?, zip_code = ?,
            joining_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            branch_id, department_id, designation_id,
            employee_id, first_name, last_name, email, phone,
            date_of_birth, gender, address, city, state, country, zip_code,
            joining_date, status, id
          ]
        );
        
        // Update user record
        await pool.query(
          `UPDATE users SET
            name = ?, email = ?, status = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [`${first_name} ${last_name}`, email, status, existingEmployee.user_id]
        );
        
        // Get the updated employee with related data
        const [employees] = await pool.query(
          `SELECT e.*, d.name as department_name, ds.name as designation_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           WHERE e.id = ?`,
          [id]
        );
        
        res.json({
          message: 'Employee updated successfully',
          data: employees[0]
        });
      } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Delete employee
    app.delete('/api/v1/employees/:id', authenticateToken, authorize(['super_admin', 'company_admin']), async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if employee exists
        const [employees] = await pool.query(
          'SELECT * FROM employees WHERE id = ?',
          [id]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        const employee = employees[0];
        
        // Delete employee record
        await pool.query('DELETE FROM employees WHERE id = ?', [id]);
        
        // Delete user account
        await pool.query('DELETE FROM users WHERE id = ?', [employee.user_id]);
        
        res.json({ message: 'Employee deleted successfully' });
      } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Upload employee profile photo
    app.post('/api/v1/employees/upload-photo', authenticateToken, profileUpload.single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        const { employee_id } = req.body;
        
        if (!employee_id) {
          return res.status(400).json({ message: 'Employee ID is required' });
        }

        // Verify employee exists and user has permission
        const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [employee_id]);
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }

        const employee = employees[0];
        
        // Check if user can update this employee (own profile or admin)
        if (req.user.role !== 'super_admin' && req.user.role !== 'company_admin' && req.user.id !== employee.user_id) {
          return res.status(403).json({ message: 'Permission denied' });
        }

        // Update employee profile photo
        await pool.query(
          'UPDATE employees SET profile_photo = ? WHERE id = ?',
          [req.file.filename, employee_id]
        );

        res.json({
          message: 'Profile photo uploaded successfully',
          filename: req.file.filename,
          url: `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`
        });
      } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Document routes
    app.post('/api/v1/documents', authenticateToken, upload.single('file'), async (req, res) => {
      try {
        const { title, description, category, expiry_date } = req.body;
        
        if (!req.file) {
          return res.status(400).json({ message: 'File is required' });
        }
        
        if (!title) {
          return res.status(400).json({ message: 'Title is required' });
        }
        
        const filePath = req.file.path;
        
        // Save document to database
        const [result] = await pool.query(
          `INSERT INTO documents (
            company_id, title, description, file_path, category,
            uploaded_by, visibility
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.company_id, title, description, filePath, category,
            req.user.id, 'private'
          ]
        );
        
        const documentId = result.insertId;
        
        // Get the created document
        const [documents] = await pool.query(
          `SELECT d.*, u.name as uploaded_by_name
           FROM documents d
           JOIN users u ON d.uploaded_by = u.id
           WHERE d.id = ?`,
          [documentId]
        );
        
        res.status(201).json({
          message: 'Document uploaded successfully',
          data: documents[0]
        });
      } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get documents
    app.get('/api/v1/documents', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, search = '', category = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        
        // Build query conditions
        let conditions = [`d.company_id = ${req.user.company_id}`];
        let params = [];
        
        if (search) {
          conditions.push('(d.title LIKE ? OR d.description LIKE ?)');
          const searchParam = `%${search}%`;
          params.push(searchParam, searchParam);
        }
        
        if (category) {
          conditions.push('d.category = ?');
          params.push(category);
        }
        
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Get documents with pagination
        const [documents] = await pool.query(
          `SELECT d.*, u.name as uploaded_by_name
           FROM documents d
           JOIN users u ON d.uploaded_by = u.id
           ${whereClause}
           ORDER BY d.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, parseInt(limit), parseInt(offset)]
        );
        
        // Get total count for pagination
        const [countResult] = await pool.query(
          `SELECT COUNT(*) as total
           FROM documents d
           JOIN users u ON d.uploaded_by = u.id
           ${whereClause}`,
          [...params]
        );
        
        const total = countResult[0].total;
        
        // Process documents to add status based on expiry date
        const processedDocuments = documents.map(doc => {
          let status = 'active';
          
          if (doc.expiry_date) {
            const expiryDate = new Date(doc.expiry_date);
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            
            if (expiryDate < today) {
              status = 'expired';
            } else if (expiryDate <= thirtyDaysFromNow) {
              status = 'expiring_soon';
            }
          }
          
          return {
            ...doc,
            status
          };
        });
        
        res.json({
          data: processedDocuments,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get expiring documents
    app.get('/api/v1/documents/expiring', authenticateToken, async (req, res) => {
      try {
        const { days = 30 } = req.query;
        
        // Get documents expiring within the specified days
        const [documents] = await pool.query(
          `SELECT d.*, u.name as uploaded_by_name
           FROM documents d
           JOIN users u ON d.uploaded_by = u.id
           WHERE d.company_id = ?
           AND d.expiry_date IS NOT NULL
           AND d.expiry_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL ? DAY)
           ORDER BY d.expiry_date ASC`,
          [req.user.company_id, parseInt(days)]
        );
        
        res.json({
          data: documents.map(doc => ({
            ...doc,
            status: 'expiring_soon',
            days_until_expiry: Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
          }))
        });
      } catch (error) {
        console.error('Get expiring documents error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Add missing API endpoints for all modules
    
    // Organization routes
    
    // Get branches
    app.get('/api/v1/organization/branches', authenticateToken, async (req, res) => {
      try {
        const [branches] = await pool.query(
          'SELECT * FROM branches WHERE company_id = ? ORDER BY name',
          [1] // Default company ID
        );
        
        res.json({ data: branches });
      } catch (error) {
        console.error('Get branches error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get departments
    app.get('/api/v1/organization/departments', authenticateToken, async (req, res) => {
      try {
        const [departments] = await pool.query(
          `SELECT d.*, b.name as branch_name
           FROM departments d
           LEFT JOIN branches b ON d.branch_id = b.id
           WHERE d.company_id = ?
           ORDER BY d.name`,
          [1] // Default company ID
        );
        
        res.json({ data: departments });
      } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get designations
    app.get('/api/v1/organization/designations', authenticateToken, async (req, res) => {
      try {
        const [designations] = await pool.query(
          `SELECT d.*, dept.name as department_name
           FROM designations d
           LEFT JOIN departments dept ON d.department_id = dept.id
           WHERE d.company_id = ?
           ORDER BY d.name`,
          [1] // Default company ID
        );
        
        res.json({ data: designations });
      } catch (error) {
        console.error('Get designations error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Helper function to get default avatar based on gender
    const getDefaultAvatar = (gender, id) => {
      const seed = `employee-${id}`;
      
      if (gender === 'female') {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,pastelPink,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc&gender=female`;
      } else if (gender === 'male') {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc&gender=male`;
      } else {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,pastelPink,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc`;
      }
    };

    // Get organization chart
    app.get('/api/v1/organization/chart', authenticateToken, async (req, res) => {
      try {
        // Get all employees with their managers
        const [employees] = await pool.query(
          `SELECT e.id, e.first_name, e.last_name, e.email, e.employee_id, e.phone, e.joining_date,
                  d.name as department, ds.name as designation, 
                  e.status, e.profile_photo, e.gender,
                  m.id as reports_to, CONCAT(m.first_name, ' ', m.last_name) as manager_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           LEFT JOIN employees m ON e.reports_to = m.id
           WHERE e.company_id = 1 AND e.status = 'active'
           ORDER BY e.id`
        );
        
        // Build organization chart hierarchy
        const employeeMap = {};
        employees.forEach(emp => {
          employeeMap[emp.id] = {
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            position: emp.designation || '',
            department: emp.department || '',
            email: emp.email,
            phone: emp.phone || '',
            avatar: emp.profile_photo ? `${req.protocol}://${req.get('host')}/uploads/profiles/${emp.profile_photo}` : getDefaultAvatar(emp.gender, emp.id),
            employeeId: emp.employee_id,
            reportsTo: emp.reports_to,
            status: emp.status,
            joinDate: emp.joining_date,
            directReports: []
          };
        });
        
        // Build tree structure
        const roots = [];
        Object.values(employeeMap).forEach(emp => {
          if (emp.reportsTo && employeeMap[emp.reportsTo]) {
            employeeMap[emp.reportsTo].directReports.push(emp);
          } else {
            // No manager or manager not found, this is a root node
            roots.push(emp);
          }
        });
        
        res.json({ data: roots });
      } catch (error) {
        console.error('Get org chart error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Leave routes
    
    // Get leave types
    app.get('/api/v1/leave-types', authenticateToken, async (req, res) => {
      try {
        const [leaveTypes] = await pool.query(
          'SELECT * FROM leave_types WHERE company_id = ? ORDER BY name',
          [req.user.company_id]
        );
        
        res.json({ data: leaveTypes });
      } catch (error) {
        console.error('Get leave types error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Apply for leave
    app.post('/api/v1/leaves', authenticateToken, async (req, res) => {
      try {
        const { leave_type_id, start_date, end_date, reason } = req.body;
        
        // Validate required fields
        if (!leave_type_id || !start_date || !end_date) {
          return res.status(400).json({ 
            message: 'Required fields missing',
            errors: {
              leave_type_id: !leave_type_id ? ['Leave type is required'] : undefined,
              start_date: !start_date ? ['Start date is required'] : undefined,
              end_date: !end_date ? ['End date is required'] : undefined
            }
          });
        }
        
        // Calculate total days
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const diffTime = Math.abs(endDate - startDate);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Get employee ID from user ID
        const [employees] = await pool.query(
          'SELECT id FROM employees WHERE user_id = ?',
          [req.user.id]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        const employeeId = employees[0].id;
        
        // Create leave application
        const [result] = await pool.query(
          `INSERT INTO leave_applications (
            employee_id, leave_type_id, start_date, end_date, total_days, reason, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [employeeId, leave_type_id, start_date, end_date, totalDays, reason, 'pending']
        );
        
        const leaveId = result.insertId;
        
        // Get the created leave application with related data
        const [leaves] = await pool.query(
          `SELECT l.*, lt.name as leave_type_name, e.first_name, e.last_name
           FROM leave_applications l
           JOIN leave_types lt ON l.leave_type_id = lt.id
           JOIN employees e ON l.employee_id = e.id
           WHERE l.id = ?`,
          [leaveId]
        );
        
        res.status(201).json({
          message: 'Leave application submitted successfully',
          data: leaves[0]
        });
      } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get leaves
    app.get('/api/v1/leaves', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, status = '', employee_id = '', from_date = '', to_date = '' } = req.query;
        const offset = (page - 1) * limit;
        
        // Build query conditions
        let conditions = [];
        let params = [];
        
        // If user is an employee, only show their leaves
        if (req.user.role === 'employee') {
          const [employees] = await pool.query(
            'SELECT id FROM employees WHERE user_id = ?',
            [req.user.id]
          );
          
          if (employees.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
          }
          
          conditions.push('l.employee_id = ?');
          params.push(employees[0].id);
        } else {
          // For admins and managers, filter by company
          conditions.push('e.company_id = ?');
          params.push(req.user.company_id);
          
          // Filter by employee if provided
          if (employee_id) {
            conditions.push('l.employee_id = ?');
            params.push(employee_id);
          }
        }
        
        // Filter by status if provided
        if (status) {
          conditions.push('l.status = ?');
          params.push(status);
        }
        
        // Filter by date range if provided
        if (from_date && to_date) {
          conditions.push('(l.start_date BETWEEN ? AND ? OR l.end_date BETWEEN ? AND ?)');
          params.push(from_date, to_date, from_date, to_date);
        }
        
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Get leaves with pagination
        const [leaves] = await pool.query(
          `SELECT l.*, lt.name as leave_type_name, 
                  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                  e.employee_id as employee_code
           FROM leave_applications l
           JOIN leave_types lt ON l.leave_type_id = lt.id
           JOIN employees e ON l.employee_id = e.id
           ${whereClause}
           ORDER BY l.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, parseInt(limit), parseInt(offset)]
        );
        
        // Get total count for pagination
        const [countResult] = await pool.query(
          `SELECT COUNT(*) as total
           FROM leave_applications l
           JOIN employees e ON l.employee_id = e.id
           ${whereClause}`,
          [...params]
        );
        
        const total = countResult[0].total;
        
        res.json({
          data: leaves,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Attendance routes
    app.post('/api/v1/attendance/check-in', authenticateToken, async (req, res) => {
      try {
        const { note, latitude, longitude } = req.body;
        const today = new Date().toISOString().split('T')[0];
        
        // Get employee ID from user ID
        const [employees] = await pool.query(
          'SELECT id FROM employees WHERE user_id = ?',
          [req.user.id]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        const employeeId = employees[0].id;
        
        // Check if already checked in today
        const [existingAttendance] = await pool.query(
          'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
          [employeeId, today]
        );
        
        if (existingAttendance.length > 0) {
          return res.status(400).json({ message: 'Already checked in today' });
        }
        
        // Create attendance record
        const now = new Date();
        const [result] = await pool.query(
          `INSERT INTO attendance (
            employee_id, date, check_in, status, note, location_latitude, location_longitude
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [employeeId, today, now, 'present', note, latitude, longitude]
        );
        
        const attendanceId = result.insertId;
        
        // Get the created attendance record
        const [attendance] = await pool.query(
          'SELECT * FROM attendance WHERE id = ?',
          [attendanceId]
        );
        
        res.status(201).json({
          message: 'Checked in successfully',
          data: attendance[0]
        });
      } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    app.post('/api/v1/attendance/check-out', authenticateToken, async (req, res) => {
      try {
        const { note, latitude, longitude } = req.body;
        const today = new Date().toISOString().split('T')[0];
        
        // Get employee ID from user ID
        const [employees] = await pool.query(
          'SELECT id FROM employees WHERE user_id = ?',
          [req.user.id]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        const employeeId = employees[0].id;
        
        // Check if checked in today
        const [existingAttendance] = await pool.query(
          'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
          [employeeId, today]
        );
        
        if (existingAttendance.length === 0) {
          return res.status(400).json({ message: 'Not checked in today' });
        }
        
        if (existingAttendance[0].check_out) {
          return res.status(400).json({ message: 'Already checked out today' });
        }
        
        // Update attendance record
        const now = new Date();
        const checkIn = new Date(existingAttendance[0].check_in);
        const diffHours = (now - checkIn) / (1000 * 60 * 60);
        
        await pool.query(
          `UPDATE attendance SET
            check_out = ?, work_hours = ?, note = CONCAT(note, ' | ', ?),
            location_latitude = ?, location_longitude = ?
           WHERE id = ?`,
          [now, diffHours.toFixed(2), note || 'Checked out', latitude, longitude, existingAttendance[0].id]
        );
        
        // Get the updated attendance record
        const [attendance] = await pool.query(
          'SELECT * FROM attendance WHERE id = ?',
          [existingAttendance[0].id]
        );
        
        res.json({
          message: 'Checked out successfully',
          data: attendance[0]
        });
      } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Get attendance records
    app.get('/api/v1/attendance', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, employee_id = '', from_date = '', to_date = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT a.*, e.first_name, e.last_name, e.email, e.employee_id as emp_id,
                 d.name as department_name, des.name as designation_name
          FROM attendance a
          LEFT JOIN employees e ON a.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations des ON e.designation_id = des.id
          WHERE 1=1
        `;
        const params = [];
        
        if (employee_id) {
          query += ' AND a.employee_id = ?';
          params.push(employee_id);
        }
        
        if (from_date) {
          query += ' AND a.date >= ?';
          params.push(from_date);
        }
        
        if (to_date) {
          query += ' AND a.date <= ?';
          params.push(to_date);
        }
        
        if (status) {
          query += ' AND a.status = ?';
          params.push(status);
        }
        
        query += ' ORDER BY a.date DESC, a.check_in DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [attendance] = await pool.query(query, params);
        
        // Get total count
        let countQuery = `
          SELECT COUNT(*) as total 
          FROM attendance a
          LEFT JOIN employees e ON a.employee_id = e.id
          WHERE 1=1
        `;
        const countParams = [];
        
        if (employee_id) {
          countQuery += ' AND a.employee_id = ?';
          countParams.push(employee_id);
        }
        
        if (from_date) {
          countQuery += ' AND a.date >= ?';
          countParams.push(from_date);
        }
        
        if (to_date) {
          countQuery += ' AND a.date <= ?';
          countParams.push(to_date);
        }
        
        if (status) {
          countQuery += ' AND a.status = ?';
          countParams.push(status);
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
          data: attendance,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Tasks API endpoints
    app.get('/api/v1/tasks', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, status = '', assignee = '', priority = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT t.*, e.first_name, e.last_name, e.email as assignee_email,
                 CONCAT(e.first_name, ' ', e.last_name) as assignee_name
          FROM tasks t
          LEFT JOIN employees e ON t.assigned_to = e.id
          WHERE 1=1
        `;
        const params = [];
        
        if (status) {
          query += ' AND t.status = ?';
          params.push(status);
        }
        
        if (assignee) {
          query += ' AND t.assigned_to = ?';
          params.push(assignee);
        }
        
        if (priority) {
          query += ' AND t.priority = ?';
          params.push(priority);
        }
        
        query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [tasks] = await pool.query(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE 1=1';
        const countParams = [];
        
        if (status) {
          countQuery += ' AND status = ?';
          countParams.push(status);
        }
        
        if (assignee) {
          countQuery += ' AND assigned_to = ?';
          countParams.push(assignee);
        }
        
        if (priority) {
          countQuery += ' AND priority = ?';
          countParams.push(priority);
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
          data: tasks,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/tasks', authenticateToken, async (req, res) => {
      try {
        const {
          title,
          description,
          priority = 'medium',
          status = 'pending',
          assigned_to,
          due_date,
          progress = 0,
          tags,
          estimated_hours,
          actual_hours,
          project,
          department
        } = req.body;

        const userId = req.user.id;
        const companyId = 1; // Default company ID for now

        // Generate a unique task_id
        const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const [result] = await pool.query(
          `INSERT INTO tasks (
            company_id, title, description, priority, status, assigned_to, assigned_by, due_date, 
            progress, tags, estimated_hours, actual_hours, project, department, task_id, assignee_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            companyId, title, description, priority, status, assigned_to, userId, due_date,
            progress || 0, tags || null, estimated_hours || null, actual_hours || null, 
            project || null, department || null, taskId, assigned_to
          ]
        );

        res.status(201).json({
          message: 'Task created successfully',
          task: { id: result.insertId, ...req.body }
        });
      } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/tasks/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const {
          title,
          description,
          priority,
          status,
          assigned_to,
          due_date,
          progress,
          tags,
          estimated_hours,
          actual_hours,
          project,
          department
        } = req.body;

        // Build dynamic update query with only provided fields
        const updateFields = [];
        const updateValues = [];
        
        if (title !== undefined) {
          updateFields.push('title = ?');
          updateValues.push(title);
        }
        if (description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(description);
        }
        if (priority !== undefined) {
          updateFields.push('priority = ?');
          updateValues.push(priority);
        }
        if (status !== undefined) {
          updateFields.push('status = ?');
          updateValues.push(status);
          
          // Set completed_at when status is changed to 'completed'
          if (status === 'completed') {
            updateFields.push('completed_at = NOW()');
          }
        }
        if (assigned_to !== undefined) {
          updateFields.push('assigned_to = ?');
          updateValues.push(assigned_to);
          
          // Also update assignee_id when assigned_to changes
          updateFields.push('assignee_id = ?');
          updateValues.push(assigned_to);
        }
        if (due_date !== undefined) {
          updateFields.push('due_date = ?');
          updateValues.push(due_date);
        }
        if (progress !== undefined) {
          updateFields.push('progress = ?');
          updateValues.push(progress);
        }
        if (tags !== undefined) {
          updateFields.push('tags = ?');
          updateValues.push(tags ? JSON.stringify(tags) : null);
        }
        if (estimated_hours !== undefined) {
          updateFields.push('estimated_hours = ?');
          updateValues.push(estimated_hours);
        }
        if (actual_hours !== undefined) {
          updateFields.push('actual_hours = ?');
          updateValues.push(actual_hours);
        }
        if (project !== undefined) {
          updateFields.push('project = ?');
          updateValues.push(project);
        }
        if (department !== undefined) {
          updateFields.push('department = ?');
          updateValues.push(department);
        }
        
        // Always update the updated_at field
        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        const [result] = await pool.query(
          `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task updated successfully' });
      } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/tasks/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
      } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Calendar Events API endpoints
    app.get('/api/v1/calendar/events', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 50, from_date = '', to_date = '', type = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT ce.*, u.name as created_by_name, u.role as created_by_role
          FROM calendar_events ce
          LEFT JOIN users u ON ce.created_by = u.id
          WHERE 1=1
        `;
        const params = [];
        
        if (from_date) {
          query += ' AND DATE(ce.start_date) >= ?';
          params.push(from_date);
        }
        
        if (to_date) {
          query += ' AND DATE(ce.start_date) <= ?';
          params.push(to_date);
        }
        
        if (type) {
          query += ' AND ce.event_type = ?';
          params.push(type);
        }
        
        query += ' ORDER BY ce.start_date ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [events] = await pool.query(query, params);
        
        res.json({
          data: events,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: events.length,
            pages: Math.ceil(events.length / limit)
          }
        });
      } catch (error) {
        console.error('Get calendar events error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/calendar/events', authenticateToken, async (req, res) => {
      try {
        const {
          title,
          date,
          time,
          type = 'other',
          color = '#3b82f6',
          description,
          location,
          visibility = 'all',
          visible_to,
          departments,
          is_recurring = false,
          recurrence_pattern,
          reminder_minutes,
          is_all_day = false
        } = req.body;

        const userId = req.user.id;
        const companyId = 1; // Default company ID for now

        // Generate a unique event_id
        const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Convert date and time to datetime format
        const startDateTime = `${date} ${time}:00`;
        const endDateTime = `${date} ${time}:00`; // Same as start for now

        const [result] = await pool.query(
          `INSERT INTO calendar_events (
            company_id, title, description, start_date, end_date, event_type, 
            location, attendees, created_by, color, is_recurring, recurrence_pattern, 
            reminder_minutes, event_id, is_all_day, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            companyId, title, description, startDateTime, endDateTime, type,
            location,
            visible_to ? JSON.stringify(visible_to) : null,
            userId, color, is_recurring,
            recurrence_pattern ? JSON.stringify(recurrence_pattern) : null,
            reminder_minutes, eventId, is_all_day || false
          ]
        );

        res.status(201).json({
          message: 'Event created successfully',
          event: { id: result.insertId, ...req.body }
        });
      } catch (error) {
        console.error('Create calendar event error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/calendar/events/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const {
          title,
          date,
          time,
          type,
          color,
          description,
          location,
          visibility,
          visible_to,
          departments,
          is_recurring,
          recurrence_pattern,
          reminder_minutes,
          is_all_day
        } = req.body;

        // Build dynamic update query with only provided fields
        const updateFields = [];
        const updateValues = [];
        
        if (title !== undefined) {
          updateFields.push('title = ?');
          updateValues.push(title);
        }
        if (description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(description);
        }
        if (date !== undefined && time !== undefined) {
          const startDateTime = `${date} ${time}:00`;
          const endDateTime = `${date} ${time}:00`;
          updateFields.push('start_date = ?');
          updateFields.push('end_date = ?');
          updateValues.push(startDateTime, endDateTime);
        }
        if (type !== undefined) {
          updateFields.push('event_type = ?');
          updateValues.push(type);
        }
        if (color !== undefined) {
          updateFields.push('color = ?');
          updateValues.push(color);
        }
        if (location !== undefined) {
          updateFields.push('location = ?');
          updateValues.push(location);
        }
        if (visible_to !== undefined) {
          updateFields.push('attendees = ?');
          updateValues.push(visible_to ? JSON.stringify(visible_to) : null);
        }
        if (is_recurring !== undefined) {
          updateFields.push('is_recurring = ?');
          updateValues.push(is_recurring);
        }
        if (recurrence_pattern !== undefined) {
          updateFields.push('recurrence_pattern = ?');
          updateValues.push(recurrence_pattern ? JSON.stringify(recurrence_pattern) : null);
        }
        if (reminder_minutes !== undefined) {
          updateFields.push('reminder_minutes = ?');
          updateValues.push(reminder_minutes);
        }
        if (is_all_day !== undefined) {
          updateFields.push('is_all_day = ?');
          updateValues.push(is_all_day);
        }
        
        // Always update the updated_at field
        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        const [result] = await pool.query(
          `UPDATE calendar_events SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event updated successfully' });
      } catch (error) {
        console.error('Update calendar event error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/calendar/events/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM calendar_events WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event deleted successfully' });
      } catch (error) {
        console.error('Delete calendar event error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Start server
    const PORT = process.env.PORT || 8000;
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    module.exports = app;
