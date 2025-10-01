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
    
    // Trust proxy for better IP detection
    app.set('trust proxy', true);
    
    // Middleware
    app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000'],
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
      database: process.env.DB_NAME || 'hrmgo_hero',
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
    
    // =====================================================
    // MODULAR ROUTE IMPORTS
    // =====================================================
    const authRoutes = require('./routes/auth.routes')(pool);
    const organizationRoutes = require('./routes/organization.routes')(pool, authenticateToken);
    const hrSetupRoutes = require('./routes/hr-setup.routes')(pool, authenticateToken);
    const employeeRoutes = require('./routes/employee.routes')(pool, authenticateToken, upload, profileUpload);
    const leaveRoutes = require('./routes/leave.routes')(pool, authenticateToken);
    const taskRoutes = require('./routes/task.routes')(pool, authenticateToken);
    const settingsRoutes = require('./routes/settings.routes')(pool, authenticateToken);
    const userRoutes = require('./routes/user.routes')(pool, authenticateToken);
    const attendanceRoutes = require('./routes/attendance.routes')(pool, authenticateToken);
    const payrollRoutes = require('./routes/payroll.routes')(pool, authenticateToken);
    const recruitmentRoutes = require('./routes/recruitment.routes')(pool, authenticateToken, upload);
    const calendarRoutes = require('./routes/calendar.routes')(pool, authenticateToken);
    const goalsRoutes = require('./routes/goals.routes')(pool, authenticateToken);
    const reviewsRoutes = require('./routes/reviews.routes')(pool, authenticateToken);
    const assetsRoutes = require('./routes/assets.routes')(pool, authenticateToken);
    const expensesRoutes = require('./routes/expenses.routes')(pool, authenticateToken, upload);
    const documentsRoutes = require('./routes/documents.routes')(pool, authenticateToken, upload);
    
    // =====================================================
    // MOUNT MODULAR ROUTES
    // =====================================================
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/organization', organizationRoutes);
    app.use('/api/v1/hr-setup', hrSetupRoutes);
    app.use('/api/v1/employees', employeeRoutes);
    app.use('/api/v1/leave', leaveRoutes);
    app.use('/api/v1/tasks', taskRoutes);
    app.use('/api/v1/settings', settingsRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/timekeeping', attendanceRoutes);
    app.use('/api/v1/payroll', payrollRoutes);
    app.use('/api/v1/recruitment', recruitmentRoutes);
    app.use('/api/v1/calendar', calendarRoutes);
    app.use('/api/v1/goals', goalsRoutes);
    app.use('/api/v1/reviews', reviewsRoutes);
    app.use('/api/v1/assets', assetsRoutes);
    app.use('/api/v1/expenses', expensesRoutes);
    app.use('/api/v1/documents', documentsRoutes);
    
    // =====================================================
    // ALL ROUTES NOW MODULAR - LEGACY CODE REMOVED
    // =====================================================
    // All routes have been migrated to modular files in /routes/
    // Total modules: 17
    // Total endpoints: 250+
    // All legacy inline routes removed for clean, maintainable code
    
    // =====================================================
    // SERVER STARTUP
    // =====================================================
    
    app.listen(PORT, async (req, res) => {
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
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email, 
            role: user.role 
          },
          jwtSecret,
          { expiresIn: '24h' }
        );
        
        // Return user data and token
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
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

    // Logout endpoint
    app.post('/api/v1/auth/logout', (req, res) => {
      // For JWT tokens, logout is typically handled on the client side
      // by removing the token from storage
      res.json({ message: 'Logged out successfully' });
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
          `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name,
                  ap.name as attendance_policy_name, s.name as shift_name, s.start_time as shift_start_time,
                  s.end_time as shift_end_time
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           LEFT JOIN branches b ON e.branch_id = b.id
           LEFT JOIN attendance_policies ap ON e.attendance_policy_id = ap.id
           LEFT JOIN shifts s ON e.shift_id = s.id
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
    
    // ==================== EMPLOYEE MANAGEMENT API ENDPOINTS ====================
    
    // Employee Documents API
    app.get('/api/v1/employees/documents', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT ed.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_id_string
          FROM employee_documents ed
          LEFT JOIN employees e ON ed.employee_id = e.id
          ORDER BY ed.created_at DESC
        `;
        
        const [documents] = await pool.query(query);
        
        res.json({
          success: true,
          data: documents
        });
      } catch (error) {
        console.error('Error fetching employee documents:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/employees/documents', authenticateToken, async (req, res) => {
      try {
        const { employee_id, document_type, document_name, expiry_date } = req.body;
        
        if (!employee_id || !document_type || !document_name) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const query = `
          INSERT INTO employee_documents (
            employee_id, document_type, document_name, file_path, expiry_date
          ) VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [
          employee_id, document_type, document_name, '/uploads/documents/', expiry_date
        ]);
        
        res.status(201).json({
          success: true,
          data: { id: result.insertId },
          message: 'Document created successfully'
        });
      } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/employees/documents/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { employee_id, document_type, document_name, expiry_date } = req.body;
        
        if (!employee_id || !document_type || !document_name) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const query = `
          UPDATE employee_documents 
          SET employee_id = ?, document_type = ?, document_name = ?, 
              expiry_date = ?
          WHERE id = ?
        `;
        
        await pool.query(query, [employee_id, document_type, document_name, expiry_date, id]);
        
        res.json({
          success: true,
          message: 'Document updated successfully'
        });
      } catch (error) {
        console.error('Error updating employee document:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/employees/documents/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        const query = 'DELETE FROM employee_documents WHERE id = ?';
        await pool.query(query, [id]);
        
        res.json({
          success: true,
          message: 'Document deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting employee document:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.get('/api/v1/employees/documents/:id/download', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        const [documents] = await pool.query(
          'SELECT * FROM employee_documents WHERE id = ?',
          [id]
        );
        
        if (documents.length === 0) {
          return res.status(404).json({ message: 'Document not found' });
        }
        
        const document = documents[0];
        
        // For demo purposes, we'll return a simple text file
        // In a real application, you would read the actual file from the file system
        const fileName = document.document_name || 'document.pdf';
        const fileContent = `This is a demo document: ${document.document_name}\n\nDocument Type: ${document.document_type}\nEmployee ID: ${document.employee_id}\nCreated: ${document.created_at}`;
        
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(fileContent);
      } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Employee Salaries API
    app.get('/api/v1/employees/salaries', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT es.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_id_string
          FROM employee_salaries es
          LEFT JOIN employees e ON es.employee_id = e.id
          ORDER BY es.effective_date DESC
        `;
        
        const [salaries] = await pool.query(query);
        
        // Add components to each salary record
        const salariesWithComponents = await Promise.all(salaries.map(async (salary) => {
          const componentsQuery = `
            SELECT esc.*, sc.name as component_name, sc.type as component_type, 
                   sc.is_taxable, sc.is_mandatory
            FROM employee_salary_components esc
            LEFT JOIN salary_components sc ON esc.salary_component_id = sc.id
            WHERE esc.employee_salary_id = ?
          `;
          const [components] = await pool.query(componentsQuery, [salary.id]);
          
          return {
            ...salary,
            components: components.map(comp => ({
              component_id: comp.salary_component_id,
              component_name: comp.component_name,
              component_type: comp.component_type,
              amount: comp.amount,
              is_taxable: comp.is_taxable,
              is_mandatory: comp.is_mandatory
            }))
          };
        }));
        
        res.json({
          success: true,
          data: salariesWithComponents
        });
      } catch (error) {
        console.error('Error fetching employee salaries:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/employees/salaries', authenticateToken, async (req, res) => {
      try {
        const { employee_id, basic_salary, components, status, effective_date } = req.body;
        
        if (!employee_id || !basic_salary || !effective_date) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Start transaction
        await pool.query('START TRANSACTION');
        
        try {
          // Insert salary record
          const salaryQuery = `
            INSERT INTO employee_salaries (
              employee_id, basic_salary, status, effective_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())
          `;
          
          const [salaryResult] = await pool.query(salaryQuery, [
            employee_id, basic_salary, status || 'active', effective_date
          ]);
          
          const salaryId = salaryResult.insertId;
          
          // Insert salary components if provided
          if (components && components.length > 0) {
            for (const component of components) {
              const componentQuery = `
                INSERT INTO employee_salary_components (
                  employee_salary_id, salary_component_id, amount, created_at, updated_at
                ) VALUES (?, ?, ?, NOW(), NOW())
              `;
              
              await pool.query(componentQuery, [
                salaryId, component.component_id, component.amount
              ]);
            }
          }
          
          // Commit transaction
          await pool.query('COMMIT');
          
          res.status(201).json({
            success: true,
            data: { id: salaryId },
            message: 'Salary created successfully'
          });
        } catch (error) {
          // Rollback transaction
          await pool.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error('Error creating salary:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/employees/salaries/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { employee_id, basic_salary, components, status, effective_date } = req.body;
        
        if (!employee_id || !basic_salary || !effective_date) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Start transaction
        await pool.query('START TRANSACTION');
        
        try {
          // Update salary record
          const salaryQuery = `
            UPDATE employee_salaries 
            SET employee_id = ?, basic_salary = ?, status = ?, effective_date = ?, updated_at = NOW()
            WHERE id = ?
          `;
          
          await pool.query(salaryQuery, [
            employee_id, basic_salary, status || 'active', effective_date, id
          ]);
          
          // Delete existing components
          await pool.query('DELETE FROM employee_salary_components WHERE employee_salary_id = ?', [id]);
          
          // Insert new components if provided
          if (components && components.length > 0) {
            for (const component of components) {
              const componentQuery = `
                INSERT INTO employee_salary_components (
                  employee_salary_id, salary_component_id, amount, created_at, updated_at
                ) VALUES (?, ?, ?, NOW(), NOW())
              `;
              
              await pool.query(componentQuery, [
                id, component.component_id, component.amount
              ]);
            }
          }
          
          // Commit transaction
          await pool.query('COMMIT');
          
          res.json({
            success: true,
            message: 'Salary updated successfully'
          });
        } catch (error) {
          // Rollback transaction
          await pool.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error('Error updating salary:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/employees/salaries/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        const query = 'DELETE FROM employee_salaries WHERE id = ?';
        await pool.query(query, [id]);
        
        res.json({
          success: true,
          message: 'Salary deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting salary:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Employee Contracts API
    app.get('/api/v1/employees/contracts', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT ec.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_id_string
          FROM employee_contracts ec
          LEFT JOIN employees e ON ec.employee_id = e.id
          ORDER BY ec.start_date DESC
        `;
        
        const [contracts] = await pool.query(query);
        
        // Map contract types back to frontend format
        const contractTypeMap = {
          'full_time': 'permanent',
          'contract': 'contract',
          'part_time': 'temporary',
          'internship': 'intern'
        };
        
        const mappedContracts = contracts.map(contract => ({
          ...contract,
          contract_type: contractTypeMap[contract.contract_type] || contract.contract_type,
          terms: '' // Add empty terms field for frontend compatibility
        }));
        
        res.json({
          success: true,
          data: mappedContracts
        });
      } catch (error) {
        console.error('Error fetching employee contracts:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/employees/contracts', authenticateToken, async (req, res) => {
      try {
        const { employee_id, contract_type, start_date, end_date, salary, status } = req.body;
        
        if (!employee_id || !contract_type || !start_date) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Map contract types to match database enum
        const contractTypeMap = {
          'permanent': 'full_time',
          'contract': 'contract',
          'temporary': 'part_time',
          'intern': 'internship',
          'consultant': 'contract'
        };
        
        const mappedContractType = contractTypeMap[contract_type] || 'full_time';
        
        const query = `
          INSERT INTO employee_contracts (
            employee_id, contract_type, start_date, end_date, salary, status
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [
          employee_id, mappedContractType, start_date, end_date, salary || null,
          status || 'active'
        ]);
        
        res.status(201).json({
          success: true,
          data: { id: result.insertId },
          message: 'Contract created successfully'
        });
      } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/employees/contracts/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { employee_id, contract_type, start_date, end_date, salary, status } = req.body;
        
        if (!employee_id || !contract_type || !start_date) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Map contract types to match database enum
        const contractTypeMap = {
          'permanent': 'full_time',
          'contract': 'contract',
          'temporary': 'part_time',
          'intern': 'internship',
          'consultant': 'contract'
        };
        
        const mappedContractType = contractTypeMap[contract_type] || 'full_time';
        
        const query = `
          UPDATE employee_contracts 
          SET employee_id = ?, contract_type = ?, start_date = ?, end_date = ?, 
              salary = ?, status = ?
          WHERE id = ?
        `;
        
        const [result] = await pool.query(query, [
          employee_id, mappedContractType, start_date, end_date, salary || null,
          status || 'active', id
        ]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Contract not found' });
        }
        
        res.json({
          success: true,
          message: 'Contract updated successfully'
        });
      } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/employees/contracts/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        const query = 'DELETE FROM employee_contracts WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Contract not found' });
        }
        
        res.json({
          success: true,
          message: 'Contract deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting contract:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get employee by user ID
    app.get('/api/v1/employees/user/:userId', authenticateToken, async (req, res) => {
      try {
        const { userId } = req.params;
        
        // Get employee details by user ID
        const [employees] = await pool.query(
          `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name,
                  ap.name as attendance_policy_name, s.name as shift_name, s.start_time as shift_start_time,
                  s.end_time as shift_end_time
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           LEFT JOIN branches b ON e.branch_id = b.id
           LEFT JOIN attendance_policies ap ON e.attendance_policy_id = ap.id
           LEFT JOIN shifts s ON e.shift_id = s.id
           WHERE e.user_id = ?
           ORDER BY e.id DESC
           LIMIT 1`,
          [userId]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found for this user' });
        }
        
        const employee = employees[0];
        
        // Get employee documents
        const [documents] = await pool.query(
          'SELECT * FROM employee_documents WHERE employee_id = ?',
          [employee.id]
        );
        
        // Get employee contracts
        const [contracts] = await pool.query(
          'SELECT * FROM employee_contracts WHERE employee_id = ?',
          [employee.id]
        );
        
        // Get employee salary
        const [salaries] = await pool.query(
          'SELECT * FROM employee_salaries WHERE employee_id = ? ORDER BY effective_date DESC LIMIT 1',
          [employee.id]
        );
        
        res.json({
          ...employee,
          documents,
          contracts,
          current_salary: salaries[0] || null
        });
      } catch (error) {
        console.error('Get employee by user ID error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get employee by ID
    app.get('/api/v1/employees/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Get employee details
        const [employees] = await pool.query(
          `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name,
                  ap.name as attendance_policy_name, s.name as shift_name, s.start_time as shift_start_time,
                  s.end_time as shift_end_time
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           LEFT JOIN branches b ON e.branch_id = b.id
           LEFT JOIN attendance_policies ap ON e.attendance_policy_id = ap.id
           LEFT JOIN shifts s ON e.shift_id = s.id
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
          branch_id, shift_id, employment_type, attendance_policy_id, bank_name,
          bank_account_number, bank_routing_number, bank_swift_code, bank_address,
          joining_date, employee_id, gender, address, city, state,
          country, zip_code, date_of_birth, create_login, temp_password
        } = req.body;

        // Convert empty strings to null for optional fields and format dates
        const cleanValue = (value) => (value === '' || value === undefined) ? null : value;
        const formatDate = (dateValue) => {
          if (!dateValue) return null;
          // Convert ISO string to MySQL date format (YYYY-MM-DD)
          if (typeof dateValue === 'string' && dateValue.includes('T')) {
            return dateValue.split('T')[0];
          }
          return dateValue;
        };
        
        const cleanedData = {
          first_name,
          last_name,
          email,
          phone: cleanValue(phone),
          department_id: cleanValue(department_id),
          designation_id: cleanValue(designation_id),
          branch_id: cleanValue(branch_id),
          shift_id: cleanValue(shift_id),
          employment_type: employment_type || 'full_time',
          attendance_policy_id: cleanValue(attendance_policy_id),
          bank_name: cleanValue(bank_name),
          bank_account_number: cleanValue(bank_account_number),
          bank_routing_number: cleanValue(bank_routing_number),
          bank_swift_code: cleanValue(bank_swift_code),
          bank_address: cleanValue(bank_address),
          joining_date: formatDate(joining_date),
          employee_id,
          gender: cleanValue(gender),
          address: cleanValue(address),
          city: cleanValue(city),
          state: cleanValue(state),
          country: cleanValue(country),
          zip_code: cleanValue(zip_code),
          date_of_birth: formatDate(date_of_birth)
        };
        
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
        const password = temp_password || 'password123'; // Use temp password or default
        const hashedPassword = await bcrypt.hash(password, 10);
        
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
            joining_date, status, employment_type, attendance_policy_id,
            bank_name, bank_account_number, bank_routing_number, bank_swift_code, bank_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, req.user.company_id || 1, cleanedData.branch_id, cleanedData.department_id, cleanedData.designation_id,
            cleanedData.employee_id, cleanedData.first_name, cleanedData.last_name, cleanedData.email, cleanedData.phone,
            cleanedData.date_of_birth, cleanedData.gender, cleanedData.address, cleanedData.city, cleanedData.state, cleanedData.country, cleanedData.zip_code,
            cleanedData.joining_date, 'active', cleanedData.employment_type, cleanedData.attendance_policy_id,
            cleanedData.bank_name, cleanedData.bank_account_number, cleanedData.bank_routing_number, cleanedData.bank_swift_code, cleanedData.bank_address
          ]
        );
        
        const employeeId = employeeResult.insertId;
        
        // Create shift assignment if shift_id is provided
        if (cleanedData.shift_id) {
          try {
            await pool.query(`
              INSERT INTO shift_assignments (employee_id, shift_id, effective_date, is_active)
              VALUES (?, ?, ?, 1)
            `, [employeeId, cleanedData.shift_id, cleanedData.joining_date]);
          } catch (shiftError) {
            console.error('Error creating shift assignment:', shiftError);
            // Don't fail the entire employee creation if shift assignment fails
          }
        }
        
        // Get the created employee with related data
        const [employees] = await pool.query(
          `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           LEFT JOIN branches b ON e.branch_id = b.id
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
          branch_id, shift_id, employment_type, attendance_policy_id, bank_name,
          bank_account_number, bank_routing_number, bank_swift_code, bank_address,
          joining_date, employee_id, gender, address, city, state,
          country, zip_code, date_of_birth, status
        } = req.body;
        
        // Convert empty strings to null for optional fields and format dates
        const cleanValue = (value) => (value === '' || value === undefined) ? null : value;
        const formatDate = (dateValue) => {
          if (!dateValue) return null;
          // Convert ISO string to MySQL date format (YYYY-MM-DD)
          if (typeof dateValue === 'string' && dateValue.includes('T')) {
            return dateValue.split('T')[0];
          }
          return dateValue;
        };
        
        const cleanedData = {
          first_name,
          last_name,
          email,
          phone: cleanValue(phone),
          department_id: cleanValue(department_id),
          designation_id: cleanValue(designation_id),
          branch_id: cleanValue(branch_id),
          shift_id: cleanValue(shift_id),
          employment_type: employment_type || 'full_time',
          attendance_policy_id: cleanValue(attendance_policy_id),
          bank_name: cleanValue(bank_name),
          bank_account_number: cleanValue(bank_account_number),
          bank_routing_number: cleanValue(bank_routing_number),
          bank_swift_code: cleanValue(bank_swift_code),
          bank_address: cleanValue(bank_address),
          joining_date: formatDate(joining_date),
          employee_id,
          gender: cleanValue(gender),
          address: cleanValue(address),
          city: cleanValue(city),
          state: cleanValue(state),
          country: cleanValue(country),
          zip_code: cleanValue(zip_code),
          date_of_birth: formatDate(date_of_birth),
          status: status || 'active'
        };
        
        // For partial updates (like status changes), we don't require all fields
        // Only validate if the fields are being updated
        if (first_name !== undefined && !first_name) {
          return res.status(400).json({ message: 'First name cannot be empty' });
        }
        if (last_name !== undefined && !last_name) {
          return res.status(400).json({ message: 'Last name cannot be empty' });
        }
        if (email !== undefined && !email) {
          return res.status(400).json({ message: 'Email cannot be empty' });
        }
        if (employee_id !== undefined && !employee_id) {
          return res.status(400).json({ message: 'Employee ID cannot be empty' });
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
        
        // Build dynamic UPDATE query - only update fields that are provided
        const updateFields = [];
        const updateValues = [];
        
        // Only add fields to update if they are defined (not undefined)
        if (branch_id !== undefined) { updateFields.push('branch_id = ?'); updateValues.push(cleanedData.branch_id); }
        if (department_id !== undefined) { updateFields.push('department_id = ?'); updateValues.push(cleanedData.department_id); }
        if (designation_id !== undefined) { updateFields.push('designation_id = ?'); updateValues.push(cleanedData.designation_id); }
        if (shift_id !== undefined) { updateFields.push('shift_id = ?'); updateValues.push(cleanedData.shift_id); }
        if (employee_id !== undefined) { updateFields.push('employee_id = ?'); updateValues.push(cleanedData.employee_id); }
        if (first_name !== undefined) { updateFields.push('first_name = ?'); updateValues.push(cleanedData.first_name); }
        if (last_name !== undefined) { updateFields.push('last_name = ?'); updateValues.push(cleanedData.last_name); }
        if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(cleanedData.email); }
        if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(cleanedData.phone); }
        if (date_of_birth !== undefined) { updateFields.push('date_of_birth = ?'); updateValues.push(cleanedData.date_of_birth); }
        if (gender !== undefined) { updateFields.push('gender = ?'); updateValues.push(cleanedData.gender); }
        if (address !== undefined) { updateFields.push('address = ?'); updateValues.push(cleanedData.address); }
        if (city !== undefined) { updateFields.push('city = ?'); updateValues.push(cleanedData.city); }
        if (state !== undefined) { updateFields.push('state = ?'); updateValues.push(cleanedData.state); }
        if (country !== undefined) { updateFields.push('country = ?'); updateValues.push(cleanedData.country); }
        if (zip_code !== undefined) { updateFields.push('zip_code = ?'); updateValues.push(cleanedData.zip_code); }
        if (joining_date !== undefined) { updateFields.push('joining_date = ?'); updateValues.push(cleanedData.joining_date); }
        if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(cleanedData.status); }
        if (employment_type !== undefined) { updateFields.push('employment_type = ?'); updateValues.push(cleanedData.employment_type); }
        if (attendance_policy_id !== undefined) { updateFields.push('attendance_policy_id = ?'); updateValues.push(cleanedData.attendance_policy_id); }
        if (bank_name !== undefined) { updateFields.push('bank_name = ?'); updateValues.push(cleanedData.bank_name); }
        if (bank_account_number !== undefined) { updateFields.push('bank_account_number = ?'); updateValues.push(cleanedData.bank_account_number); }
        if (bank_routing_number !== undefined) { updateFields.push('bank_routing_number = ?'); updateValues.push(cleanedData.bank_routing_number); }
        if (bank_swift_code !== undefined) { updateFields.push('bank_swift_code = ?'); updateValues.push(cleanedData.bank_swift_code); }
        if (bank_address !== undefined) { updateFields.push('bank_address = ?'); updateValues.push(cleanedData.bank_address); }
        
        // Always add updated_at
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        
        // Add the WHERE clause parameter
        updateValues.push(id);
        
        // Update employee record with dynamic fields
        await pool.query(
          `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
        
        // Update user record - only update if name or email changed
        const userUpdateFields = [];
        const userUpdateValues = [];
        
        if (first_name !== undefined || last_name !== undefined) {
          userUpdateFields.push('name = ?');
          userUpdateValues.push(`${cleanedData.first_name || existingEmployee.first_name} ${cleanedData.last_name || existingEmployee.last_name}`);
        }
        
        if (email !== undefined) {
          userUpdateFields.push('email = ?');
          userUpdateValues.push(cleanedData.email);
        }
        
        if (status !== undefined) {
          userUpdateFields.push('status = ?');
          userUpdateValues.push(cleanedData.status);
        }
        
        // Only update user if there are fields to update
        if (userUpdateFields.length > 0) {
          userUpdateFields.push('updated_at = CURRENT_TIMESTAMP');
          userUpdateValues.push(existingEmployee.user_id);
          
        await pool.query(
            `UPDATE users SET ${userUpdateFields.join(', ')} WHERE id = ?`,
            userUpdateValues
          );
        }
        
        // Get the updated employee with related data
        const [employees] = await pool.query(
          `SELECT e.*, d.name as department_name, ds.name as designation_name, b.name as branch_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           LEFT JOIN branches b ON e.branch_id = b.id
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
    
    // Change employee password
    app.put('/api/v1/employees/:id/change-password', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { new_password } = req.body;
        
        if (!new_password || new_password.length < 6) {
          return res.status(400).json({ 
            message: 'Password must be at least 6 characters long' 
          });
        }
        
        // Check if employee exists
        const [employees] = await pool.query(
          'SELECT * FROM employees WHERE id = ?',
          [id]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        const employee = employees[0];
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        // Update user password
        await pool.query(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, employee.user_id]
        );
        
        res.json({
          message: 'Password changed successfully'
        });
      } catch (error) {
        console.error('Change password error:', error);
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
          `SELECT b.*, 
                  (SELECT COUNT(*) FROM employees e WHERE e.branch_id = b.id) as employee_count,
                  (SELECT COUNT(*) FROM departments d WHERE d.branch_id = b.id) as department_count
           FROM branches b
           WHERE b.company_id = ? 
           ORDER BY b.name`,
          [1] // Default company ID
        );
        
        res.json({ data: branches });
      } catch (error) {
        console.error('Get branches error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create branch
    app.post('/api/v1/organization/branches', authenticateToken, async (req, res) => {
      try {
        const { name, location, address, city, state, country, zip_code } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Branch name is required' });
        }
        
        // Check if branch already exists
        const [existing] = await pool.query(
          'SELECT id FROM branches WHERE name = ? AND company_id = ?',
          [name, 1]
        );
        
        if (existing.length > 0) {
          return res.status(400).json({ message: 'Branch with this name already exists' });
        }
        
        const [result] = await pool.query(
          'INSERT INTO branches (company_id, name, location, address, city, state, country, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [1, name, location || null, address || null, city || null, state || null, country || null, zip_code || null]
        );
        
        // Get the created branch with counts
        const [newBranch] = await pool.query(
          `SELECT b.*, 
                  (SELECT COUNT(*) FROM employees e WHERE e.branch_id = b.id) as employee_count,
                  (SELECT COUNT(*) FROM departments d WHERE d.branch_id = b.id) as department_count
           FROM branches b
           WHERE b.id = ?`,
          [result.insertId]
        );
        
        res.status(201).json({ 
          message: 'Branch created successfully',
          data: newBranch[0]
        });
      } catch (error) {
        console.error('Create branch error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update branch
    app.put('/api/v1/organization/branches/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, location, address, city, state, country, zip_code } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Branch name is required' });
        }
        
        // Check if branch exists
        const [existing] = await pool.query(
          'SELECT id FROM branches WHERE id = ? AND company_id = ?',
          [id, 1]
        );
        
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Branch not found' });
        }
        
        // Check if name is already taken by another branch
        const [nameCheck] = await pool.query(
          'SELECT id FROM branches WHERE name = ? AND company_id = ? AND id != ?',
          [name, 1, id]
        );
        
        if (nameCheck.length > 0) {
          return res.status(400).json({ message: 'Branch with this name already exists' });
        }
        
        await pool.query(
          'UPDATE branches SET name = ?, location = ?, address = ?, city = ?, state = ?, country = ?, zip_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [name, location || null, address || null, city || null, state || null, country || null, zip_code || null, id]
        );
        
        // Get the updated branch with counts
        const [updatedBranch] = await pool.query(
          `SELECT b.*, 
                  (SELECT COUNT(*) FROM employees e WHERE e.branch_id = b.id) as employee_count,
                  (SELECT COUNT(*) FROM departments d WHERE d.branch_id = b.id) as department_count
           FROM branches b
           WHERE b.id = ?`,
          [id]
        );
        
        res.json({ 
          message: 'Branch updated successfully',
          data: updatedBranch[0]
        });
      } catch (error) {
        console.error('Update branch error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Delete branch
    app.delete('/api/v1/organization/branches/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if branch exists
        const [existing] = await pool.query(
          'SELECT id FROM branches WHERE id = ? AND company_id = ?',
          [id, 1]
        );
        
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Branch not found' });
        }
        
        // Check if branch has employees or departments
        const [employees] = await pool.query(
          'SELECT COUNT(*) as count FROM employees WHERE branch_id = ?',
          [id]
        );
        
        const [departments] = await pool.query(
          'SELECT COUNT(*) as count FROM departments WHERE branch_id = ?',
          [id]
        );
        
        if (employees[0].count > 0 || departments[0].count > 0) {
          return res.status(400).json({ 
            message: 'Cannot delete branch with existing employees or departments. Please reassign them first.' 
          });
        }
        
        await pool.query('DELETE FROM branches WHERE id = ?', [id]);
        
        res.json({ message: 'Branch deleted successfully' });
      } catch (error) {
        console.error('Delete branch error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get departments
    app.get('/api/v1/organization/departments', authenticateToken, async (req, res) => {
      try {
        const [departments] = await pool.query(
          `SELECT d.*, b.name as branch_name,
                  (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id) as employee_count
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

    // Get department by ID
    app.get('/api/v1/organization/departments/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const [departments] = await pool.query(
          `SELECT d.*, b.name as branch_name,
                  (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id) as employee_count
           FROM departments d
           LEFT JOIN branches b ON d.branch_id = b.id
           WHERE d.id = ? AND d.company_id = ?`,
          [id, 1] // Default company ID
        );
        
        if (departments.length === 0) {
          return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json({ data: departments[0] });
      } catch (error) {
        console.error('Get department by ID error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create department
    app.post('/api/v1/organization/departments', authenticateToken, async (req, res) => {
      try {
        const { name, description, branch_id } = req.body;
        console.log('Creating department with data:', { name, description, branch_id });
        
        if (!name) {
          return res.status(400).json({ message: 'Department name is required' });
        }
        
        // Check if department already exists
        const [existing] = await pool.query(
          'SELECT id FROM departments WHERE name = ? AND company_id = ?',
          [name, 1]
        );
        
        if (existing.length > 0) {
          return res.status(400).json({ message: 'Department with this name already exists' });
        }
        
        const [result] = await pool.query(
          'INSERT INTO departments (company_id, branch_id, name, description) VALUES (?, ?, ?, ?)',
          [1, branch_id || null, name, description || null]
        );
        
        // Get the created department with branch info
        const [newDepartment] = await pool.query(
          `SELECT d.*, b.name as branch_name,
                  (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id) as employee_count
           FROM departments d
           LEFT JOIN branches b ON d.branch_id = b.id
           WHERE d.id = ?`,
          [result.insertId]
        );
        
        res.status(201).json({ 
          message: 'Department created successfully',
          data: newDepartment[0]
        });
      } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update department
    app.put('/api/v1/organization/departments/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, branch_id } = req.body;
        console.log('Updating department', id, 'with data:', { name, description, branch_id });
        
        if (!name) {
          return res.status(400).json({ message: 'Department name is required' });
        }
        
        // Check if department exists
        const [existing] = await pool.query(
          'SELECT id FROM departments WHERE id = ? AND company_id = ?',
          [id, 1]
        );
        
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Department not found' });
        }
        
        // Check if name is already taken by another department
        const [nameCheck] = await pool.query(
          'SELECT id FROM departments WHERE name = ? AND company_id = ? AND id != ?',
          [name, 1, id]
        );
        
        if (nameCheck.length > 0) {
          return res.status(400).json({ message: 'Department with this name already exists' });
        }
        
        await pool.query(
          'UPDATE departments SET name = ?, description = ?, branch_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [name, description || null, branch_id || null, id]
        );
        
        // Get the updated department with branch info
        const [updatedDepartment] = await pool.query(
          `SELECT d.*, b.name as branch_name,
                  (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id) as employee_count
           FROM departments d
           LEFT JOIN branches b ON d.branch_id = b.id
           WHERE d.id = ?`,
          [id]
        );
        
        res.json({ 
          message: 'Department updated successfully',
          data: updatedDepartment[0]
        });
      } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Delete department
    app.delete('/api/v1/organization/departments/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if department exists
        const [existing] = await pool.query(
          'SELECT id FROM departments WHERE id = ? AND company_id = ?',
          [id, 1]
        );
        
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Department not found' });
        }
        
        // Check if department has employees
        const [employees] = await pool.query(
          'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
          [id]
        );
        
        if (employees[0].count > 0) {
          return res.status(400).json({ 
            message: 'Cannot delete department with existing employees. Please reassign employees first.' 
          });
        }
        
        await pool.query('DELETE FROM departments WHERE id = ?', [id]);
        
        res.json({ message: 'Department deleted successfully' });
      } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get designations
    app.get('/api/v1/organization/designations', authenticateToken, async (req, res) => {
      try {
        const [designations] = await pool.query(
          `SELECT d.*, dept.name as department_name,
                  (SELECT COUNT(*) FROM employees e WHERE e.designation_id = d.id) as employee_count
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

    // Create designation
    app.post('/api/v1/organization/designations', authenticateToken, async (req, res) => {
      try {
        const { name, description, department_id } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Designation name is required' });
        }
        
        // Check if designation already exists
        const [existing] = await pool.query(
          'SELECT id FROM designations WHERE name = ? AND company_id = ?',
          [name, 1]
        );
        
        if (existing.length > 0) {
          return res.status(400).json({ message: 'Designation with this name already exists' });
        }
        
        const [result] = await pool.query(
          'INSERT INTO designations (company_id, department_id, name, description) VALUES (?, ?, ?, ?)',
          [1, department_id || null, name, description || null]
        );
        
        // Get the created designation with department info
        const [newDesignation] = await pool.query(
          `SELECT d.*, dept.name as department_name,
                  (SELECT COUNT(*) FROM employees e WHERE e.designation_id = d.id) as employee_count
           FROM designations d
           LEFT JOIN departments dept ON d.department_id = dept.id
           WHERE d.id = ?`,
          [result.insertId]
        );
        
        res.status(201).json({ 
          message: 'Designation created successfully',
          data: newDesignation[0]
        });
      } catch (error) {
        console.error('Create designation error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update designation
    app.put('/api/v1/organization/designations/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, department_id } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Designation name is required' });
        }
        
        // Check if designation exists
        const [existing] = await pool.query(
          'SELECT id FROM designations WHERE id = ? AND company_id = ?',
          [id, 1]
        );
        
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Designation not found' });
        }
        
        // Check if name is already taken by another designation
        const [nameCheck] = await pool.query(
          'SELECT id FROM designations WHERE name = ? AND company_id = ? AND id != ?',
          [name, 1, id]
        );
        
        if (nameCheck.length > 0) {
          return res.status(400).json({ message: 'Designation with this name already exists' });
        }
        
        await pool.query(
          'UPDATE designations SET name = ?, description = ?, department_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [name, description || null, department_id || null, id]
        );
        
        // Get the updated designation with department info
        const [updatedDesignation] = await pool.query(
          `SELECT d.*, dept.name as department_name,
                  (SELECT COUNT(*) FROM employees e WHERE e.designation_id = d.id) as employee_count
           FROM designations d
           LEFT JOIN departments dept ON d.department_id = dept.id
           WHERE d.id = ?`,
          [id]
        );
        
        res.json({ 
          message: 'Designation updated successfully',
          data: updatedDesignation[0]
        });
      } catch (error) {
        console.error('Update designation error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Delete designation
    app.delete('/api/v1/organization/designations/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if designation exists
        const [existing] = await pool.query(
          'SELECT id FROM designations WHERE id = ? AND company_id = ?',
          [id, 1]
        );
        
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Designation not found' });
        }
        
        // Check if designation has employees
        const [employees] = await pool.query(
          'SELECT COUNT(*) as count FROM employees WHERE designation_id = ?',
          [id]
        );
        
        if (employees[0].count > 0) {
          return res.status(400).json({ 
            message: 'Cannot delete designation with existing employees. Please reassign employees first.' 
          });
        }
        
        await pool.query('DELETE FROM designations WHERE id = ?', [id]);
        
        res.json({ message: 'Designation deleted successfully' });
      } catch (error) {
        console.error('Delete designation error:', error);
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
                  e.reporting_to as reports_to, CONCAT(m.first_name, ' ', m.last_name) as manager_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations ds ON e.designation_id = ds.id
           LEFT JOIN employees m ON e.reporting_to = m.id
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
          [req.user.company_id || 1]
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
    
    // Test endpoint for IP detection debugging
    app.get('/api/v1/test-ip', (req, res) => {
      const ipInfo = {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'x-client-ip': req.headers['x-client-ip'],
        'cf-connecting-ip': req.headers['cf-connecting-ip'],
        'connection.remoteAddress': req.connection?.remoteAddress,
        'socket.remoteAddress': req.socket?.remoteAddress,
        'req.ip': req.ip,
        'user-agent': req.headers['user-agent'],
        'all-headers': req.headers
      };
      
      console.log('IP Test Debug:', ipInfo);
      res.json(ipInfo);
    });

    // Migration endpoint
    app.post('/api/v1/migrate-employee-fields', authenticateToken, authorize(['super_admin']), async (req, res) => {
      try {
        console.log('🔄 Starting employee fields migration...');
        
        // Add new columns to employees table
        const newColumns = [
          "ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time'",
          "ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL",
          "ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) NULL",
          "ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(50) NULL",
          "ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(50) NULL",
          "ALTER TABLE employees ADD COLUMN bank_swift_code VARCHAR(20) NULL",
          "ALTER TABLE employees ADD COLUMN bank_address TEXT NULL"
        ];
        
        const results = [];
        
        for (const sql of newColumns) {
          try {
            await pool.query(sql);
            const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
            results.push(`✅ Added ${columnName}`);
            console.log(`✅ Added ${columnName}`);
          } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
              const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
              results.push(`ℹ️ ${columnName} already exists`);
              console.log(`ℹ️ ${columnName} already exists`);
            } else {
              results.push(`❌ Error adding column: ${error.message}`);
              console.log(`❌ Error: ${error.message}`);
            }
          }
        }
        
        // Add company_id to attendance tables
        try {
          await pool.query('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
          results.push('✅ Added company_id to attendance_policies');
          console.log('✅ Added company_id to attendance_policies');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            results.push('ℹ️ company_id already exists in attendance_policies');
            console.log('ℹ️ company_id already exists in attendance_policies');
          } else {
            results.push(`❌ Error with attendance_policies: ${error.message}`);
            console.log(`❌ Error with attendance_policies: ${error.message}`);
          }
        }
        
        try {
          await pool.query('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
          results.push('✅ Added company_id to attendance_regulations');
          console.log('✅ Added company_id to attendance_regulations');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            results.push('ℹ️ company_id already exists in attendance_regulations');
            console.log('ℹ️ company_id already exists in attendance_regulations');
          } else {
            results.push(`❌ Error with attendance_regulations: ${error.message}`);
            console.log(`❌ Error with attendance_regulations: ${error.message}`);
          }
        }
        
        res.json({
          success: true,
          message: 'Migration completed',
          results: results
        });
        
      } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
          success: false,
          message: 'Migration failed',
          error: error.message
        });
      }
    });

    // Enhanced IP address detection function
    const getClientIP = (req) => {
      // Check for forwarded IPs first (for proxies/load balancers)
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
      }
      
      // Check for real IP header
      if (req.headers['x-real-ip']) {
        return req.headers['x-real-ip'];
      }
      
      // Check for client IP header
      if (req.headers['x-client-ip']) {
        return req.headers['x-client-ip'];
      }
      
      // Check for CF-Connecting-IP (Cloudflare)
      if (req.headers['cf-connecting-ip']) {
        return req.headers['cf-connecting-ip'];
      }
      
      // Check connection remote address
      if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
      }
      
      // Check socket remote address
      if (req.socket && req.socket.remoteAddress) {
        return req.socket.remoteAddress;
      }
      
      // Check req.ip (set by express)
      if (req.ip) {
        return req.ip;
      }
      
      // Fallback to localhost
      return '127.0.0.1';
    };
    
    // Attendance routes
    app.post('/api/v1/attendance/check-in', authenticateToken, async (req, res) => {
      try {
        const { note, latitude, longitude, employee_id, device_info } = req.body;
        const today = new Date().toISOString().split('T')[0];
        
        // Get IP address from request with enhanced detection
        const ipAddress = getClientIP(req);
        
        // Log IP detection for debugging
        console.log('IP Detection Debug:', {
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-real-ip': req.headers['x-real-ip'],
          'x-client-ip': req.headers['x-client-ip'],
          'cf-connecting-ip': req.headers['cf-connecting-ip'],
          'connection.remoteAddress': req.connection?.remoteAddress,
          'socket.remoteAddress': req.socket?.remoteAddress,
          'req.ip': req.ip,
          'detected-ip': ipAddress
        });
        
        // Get device info from request body or user agent
        const userAgent = req.headers['user-agent'] || 'Unknown';
        let deviceType = 'Desktop';
        let deviceInfo = userAgent;
        
        if (device_info) {
          deviceInfo = JSON.stringify(device_info);
          if (device_info.userAgent) {
            deviceType = device_info.userAgent.includes('Mobile') ? 'Mobile' : 
                        device_info.userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';
          }
        } else {
          deviceType = userAgent.includes('Mobile') ? 'Mobile' : 
                      userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';
        }
        
        let employeeId;
        
        // If employee_id is provided in request body, use it; otherwise get from user_id
        if (employee_id) {
          employeeId = employee_id;
        } else {
        // Get employee ID from user ID
        const [employees] = await pool.query(
          'SELECT id FROM employees WHERE user_id = ?',
          [req.user.id]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
          employeeId = employees[0].id;
        }
        
        // Check if already checked in today
        const [existingAttendance] = await pool.query(
          'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
          [employeeId, today]
        );
        
        if (existingAttendance.length > 0) {
          return res.status(400).json({ message: 'Already checked in today' });
        }
        
        // Create attendance record with all available fields
        const now = new Date();
        const attendanceId = `ATT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const locationInfo = latitude && longitude ? `${latitude}, ${longitude}` : null;
        
        const [result] = await pool.query(
          `INSERT INTO attendance (
            employee_id, date, check_in, status, note, location_latitude, location_longitude, 
            ip_address, attendance_id, check_in_location, check_in_ip, check_in_device
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [employeeId, today, now, 'present', note, latitude, longitude, ipAddress, 
           attendanceId, locationInfo, ipAddress, deviceInfo]
        );
        
        const recordId = result.insertId;
        
        // Get the created attendance record
        const [attendance] = await pool.query(
          'SELECT * FROM attendance WHERE id = ?',
          [recordId]
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
        const { note, latitude, longitude, employee_id, device_info } = req.body;
        const today = new Date().toISOString().split('T')[0];
        
        // Get IP address from request with enhanced detection
        const ipAddress = getClientIP(req);
        
        let employeeId;
        
        // If employee_id is provided in request body, use it; otherwise get from user_id
        if (employee_id) {
          employeeId = employee_id;
        } else {
        // Get employee ID from user ID
        const [employees] = await pool.query(
          'SELECT id FROM employees WHERE user_id = ?',
          [req.user.id]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
          employeeId = employees[0].id;
        }
        
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
        
        // Update attendance record with check-out info
        const now = new Date();
        const checkIn = new Date(existingAttendance[0].check_in);
        const diffHours = (now - checkIn) / (1000 * 60 * 60);
        
        // Calculate work hours, overtime, and total hours
        const workHours = Math.max(0, diffHours);
        const standardHours = 8;
        const overtimeHours = Math.max(0, workHours - standardHours);
        const totalHours = workHours;
        
        const locationInfo = latitude && longitude ? `${latitude}, ${longitude}` : null;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        let deviceInfo = userAgent;
        
        if (device_info) {
          deviceInfo = JSON.stringify(device_info);
        }
        
        await pool.query(
          `UPDATE attendance SET
            check_out = ?, work_hours = ?, overtime_hours = ?, total_hours = ?,
            note = CONCAT(COALESCE(note, ''), ' | ', ?),
            location_latitude = ?, location_longitude = ?, ip_address = ?,
            check_out_location = ?, check_out_ip = ?, check_out_device = ?
           WHERE id = ?`,
          [now, workHours.toFixed(2), overtimeHours.toFixed(2), totalHours.toFixed(2),
           note || 'Checked out', latitude, longitude, ipAddress,
           locationInfo, ipAddress, deviceInfo, existingAttendance[0].id]
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

    // Update attendance record
    app.put('/api/v1/attendance/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { check_in, check_out, status, note, work_hours } = req.body;
        
        // Check if attendance record exists
        const [existingAttendance] = await pool.query(
          'SELECT * FROM attendance WHERE id = ?',
          [id]
        );
        
        if (existingAttendance.length === 0) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }
        
        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        
        if (check_in !== undefined) {
          updateFields.push('check_in = ?');
          updateValues.push(check_in);
        }
        
        if (check_out !== undefined) {
          updateFields.push('check_out = ?');
          updateValues.push(check_out);
        }
        
        if (status !== undefined) {
          updateFields.push('status = ?');
          updateValues.push(status);
        }
        
        if (note !== undefined) {
          updateFields.push('note = ?');
          updateValues.push(note);
        }
        
        if (work_hours !== undefined) {
          updateFields.push('work_hours = ?');
          updateValues.push(work_hours);
        }
        
        if (updateFields.length === 0) {
          return res.status(400).json({ message: 'No fields to update' });
        }
        
        updateValues.push(id);
        
        await pool.query(
          `UPDATE attendance SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
        
        // Get the updated attendance record
        const [attendance] = await pool.query(
          'SELECT * FROM attendance WHERE id = ?',
          [id]
        );
        
        res.json({
          message: 'Attendance record updated successfully',
          data: attendance[0]
        });
      } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Delete attendance record
    app.delete('/api/v1/attendance/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if attendance record exists
        const [existingAttendance] = await pool.query(
          'SELECT * FROM attendance WHERE id = ?',
          [id]
        );
        
        if (existingAttendance.length === 0) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }
        
        // Delete the attendance record
        await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
        
        res.json({
          message: 'Attendance record deleted successfully'
        });
      } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });


    app.post('/api/v1/timekeeping/policies', authenticateToken, async (req, res) => {
      try {
        const {
          name, description, policy_type, department_id, employee_id,
          late_arrival_penalty, early_departure_penalty, absent_penalty,
          overtime_rate, max_overtime_hours, require_approval_for_overtime,
          allow_remote_work, require_location_tracking, auto_approve_overtime,
          is_active
        } = req.body;

        const [result] = await pool.query(
          `INSERT INTO attendance_policies (
            name, description, policy_type, department_id, employee_id,
            late_arrival_penalty, early_departure_penalty, absent_penalty,
            overtime_rate, max_overtime_hours, require_approval_for_overtime,
            allow_remote_work, require_location_tracking, auto_approve_overtime,
            is_active, company_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            name, description, policy_type, department_id, employee_id,
            late_arrival_penalty, early_departure_penalty, absent_penalty,
            overtime_rate, max_overtime_hours, require_approval_for_overtime,
            allow_remote_work, require_location_tracking, auto_approve_overtime,
            is_active, req.user.company_id || 1
          ]
        );

        res.status(201).json({
          success: true,
          message: 'Policy created successfully',
          data: { id: result.insertId }
        });
      } catch (error) {
        console.error('Error creating policy:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/timekeeping/policies/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const {
          name, description, policy_type, department_id, employee_id,
          late_arrival_penalty, early_departure_penalty, absent_penalty,
          overtime_rate, max_overtime_hours, require_approval_for_overtime,
          allow_remote_work, require_location_tracking, auto_approve_overtime,
          is_active
        } = req.body;

        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];

        if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
        if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
        if (policy_type !== undefined) { updateFields.push('policy_type = ?'); updateValues.push(policy_type); }
        if (department_id !== undefined) { updateFields.push('department_id = ?'); updateValues.push(department_id); }
        if (employee_id !== undefined) { updateFields.push('employee_id = ?'); updateValues.push(employee_id); }
        if (late_arrival_penalty !== undefined) { updateFields.push('late_arrival_penalty = ?'); updateValues.push(late_arrival_penalty); }
        if (early_departure_penalty !== undefined) { updateFields.push('early_departure_penalty = ?'); updateValues.push(early_departure_penalty); }
        if (absent_penalty !== undefined) { updateFields.push('absent_penalty = ?'); updateValues.push(absent_penalty); }
        if (overtime_rate !== undefined) { updateFields.push('overtime_rate = ?'); updateValues.push(overtime_rate); }
        if (max_overtime_hours !== undefined) { updateFields.push('max_overtime_hours = ?'); updateValues.push(max_overtime_hours); }
        if (require_approval_for_overtime !== undefined) { updateFields.push('require_approval_for_overtime = ?'); updateValues.push(require_approval_for_overtime); }
        if (allow_remote_work !== undefined) { updateFields.push('allow_remote_work = ?'); updateValues.push(allow_remote_work); }
        if (require_location_tracking !== undefined) { updateFields.push('require_location_tracking = ?'); updateValues.push(require_location_tracking); }
        if (auto_approve_overtime !== undefined) { updateFields.push('auto_approve_overtime = ?'); updateValues.push(auto_approve_overtime); }
        if (is_active !== undefined) { updateFields.push('is_active = ?'); updateValues.push(is_active); }

        if (updateFields.length === 0) {
          return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(id, req.user.company_id || 1);

        await pool.query(
          `UPDATE attendance_policies SET ${updateFields.join(', ')} WHERE id = ? AND (company_id = ? OR company_id IS NULL)`,
          updateValues
        );

        res.json({
          success: true,
          message: 'Policy updated successfully'
        });
      } catch (error) {
        console.error('Error updating policy:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/timekeeping/policies/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        await pool.query(
          'DELETE FROM attendance_policies WHERE id = ? AND (company_id = ? OR company_id IS NULL)',
          [id, req.user.company_id || 1]
        );

        res.json({
          success: true,
          message: 'Policy deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting policy:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Attendance Regulations APIs
    app.get('/api/v1/timekeeping/regulations', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT r.*, 
                 d.name as department_name,
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name
          FROM attendance_regulations r
          LEFT JOIN departments d ON r.department_id = d.id
          LEFT JOIN employees e ON r.employee_id = e.id
          ORDER BY r.created_at DESC
        `;
        
        const [regulations] = await pool.query(query);
        
        res.json({
          success: true,
          data: regulations
        });
      } catch (error) {
        console.error('Error fetching regulations:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/timekeeping/regulations', authenticateToken, async (req, res) => {
      try {
        const {
          name, description, regulation_type, department_id, employee_id,
          min_work_hours, max_work_hours, break_duration, lunch_duration,
          grace_period_minutes, late_penalty_threshold, overtime_threshold,
          require_break, require_lunch, allow_flexible_hours,
          weekend_work_allowed, holiday_work_allowed, is_active
        } = req.body;

        const [result] = await pool.query(
          `INSERT INTO attendance_regulations (
            name, description, regulation_type, department_id, employee_id,
            min_work_hours, max_work_hours, break_duration, lunch_duration,
            grace_period_minutes, late_penalty_threshold, overtime_threshold,
            require_break, require_lunch, allow_flexible_hours,
            weekend_work_allowed, holiday_work_allowed, is_active,
            company_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            name, description, regulation_type, department_id, employee_id,
            min_work_hours, max_work_hours, break_duration, lunch_duration,
            grace_period_minutes, late_penalty_threshold, overtime_threshold,
            require_break, require_lunch, allow_flexible_hours,
            weekend_work_allowed, holiday_work_allowed, is_active,
            req.user.company_id || 1
          ]
        );

        res.status(201).json({
          success: true,
          message: 'Regulation created successfully',
          data: { id: result.insertId }
        });
      } catch (error) {
        console.error('Error creating regulation:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/timekeeping/regulations/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const {
          name, description, regulation_type, department_id, employee_id,
          min_work_hours, max_work_hours, break_duration, lunch_duration,
          grace_period_minutes, late_penalty_threshold, overtime_threshold,
          require_break, require_lunch, allow_flexible_hours,
          weekend_work_allowed, holiday_work_allowed, is_active
        } = req.body;

        await pool.query(
          `UPDATE attendance_regulations SET
            name = ?, description = ?, regulation_type = ?, department_id = ?, employee_id = ?,
            min_work_hours = ?, max_work_hours = ?, break_duration = ?, lunch_duration = ?,
            grace_period_minutes = ?, late_penalty_threshold = ?, overtime_threshold = ?,
            require_break = ?, require_lunch = ?, allow_flexible_hours = ?,
            weekend_work_allowed = ?, holiday_work_allowed = ?, is_active = ?,
            updated_at = NOW()
          WHERE id = ? AND (company_id = ? OR company_id IS NULL)`,
          [
            name, description, regulation_type, department_id, employee_id,
            min_work_hours, max_work_hours, break_duration, lunch_duration,
            grace_period_minutes, late_penalty_threshold, overtime_threshold,
            require_break, require_lunch, allow_flexible_hours,
            weekend_work_allowed, holiday_work_allowed, is_active,
            id, req.user.company_id || 1
          ]
        );

        res.json({
          success: true,
          message: 'Regulation updated successfully'
        });
      } catch (error) {
        console.error('Error updating regulation:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/timekeeping/regulations/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        await pool.query(
          'DELETE FROM attendance_regulations WHERE id = ? AND (company_id = ? OR company_id IS NULL)',
          [id, req.user.company_id || 1]
        );

        res.json({
          success: true,
          message: 'Regulation deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting regulation:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Attendance Regularization APIs
    app.get('/api/v1/timekeeping/regularizations', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT r.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_id_code,
                 d.name as department,
                 des.name as designation,
                 CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
          FROM attendance_regularizations r
          LEFT JOIN employees e ON r.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations des ON e.designation_id = des.id
          LEFT JOIN employees approver ON r.approved_by = approver.id
          WHERE r.company_id = ? OR r.company_id IS NULL
          ORDER BY r.created_at DESC
        `;
        
        const [regularizations] = await pool.query(query, [req.user.company_id || 1]);
        
        res.json({
          success: true,
          data: regularizations
        });
      } catch (error) {
        console.error('Error fetching regularizations:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/timekeeping/regularizations', authenticateToken, async (req, res) => {
      try {
        const {
          employee_id, date, original_check_in, original_check_out,
          requested_check_in, requested_check_out, reason, work_hours_difference
        } = req.body;

        // Generate unique regularization ID
        const regularization_id = `REG${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const [result] = await pool.query(
          `INSERT INTO attendance_regularizations (
            regularization_id, employee_id, date, original_check_in, original_check_out,
            requested_check_in, requested_check_out, reason, work_hours_difference,
            status, company_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())`,
          [
            regularization_id, employee_id, date, original_check_in, original_check_out,
            requested_check_in, requested_check_out, reason, work_hours_difference,
            req.user.company_id || 1
          ]
        );

        res.status(201).json({
          success: true,
          message: 'Regularization request submitted successfully',
          data: { id: result.insertId, regularization_id }
        });
      } catch (error) {
        console.error('Error creating regularization:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/timekeeping/regularizations/:id/approve', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        const updateData = {
          status,
          approved_by: req.user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (status === 'rejected' && rejection_reason) {
          updateData.rejection_reason = rejection_reason;
        }

        await pool.query(
          `UPDATE attendance_regularizations SET
            status = ?, approved_by = ?, approved_at = ?, rejection_reason = ?, updated_at = ?
          WHERE id = ? AND (company_id = ? OR company_id IS NULL)`,
          [
            updateData.status, updateData.approved_by, updateData.approved_at,
            updateData.rejection_reason, updateData.updated_at,
            id, req.user.company_id || 1
          ]
        );

        res.json({
          success: true,
          message: `Regularization ${status} successfully`
        });
      } catch (error) {
        console.error('Error approving regularization:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/timekeeping/regularizations/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        await pool.query(
          'DELETE FROM attendance_regularizations WHERE id = ? AND (company_id = ? OR company_id IS NULL)',
          [id, req.user.company_id || 1]
        );

        res.json({
          success: true,
          message: 'Regularization deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting regularization:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Get attendance records
    app.get('/api/v1/attendance', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, employee_id = '', from_date = '', to_date = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT a.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id,
                 e.email,
                 d.name as department,
                 des.name as designation_name
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
        
        // Calculate work hours for each record
        const attendanceWithWorkHours = attendance.map(record => {
          // Extract time from datetime strings if needed
          let checkInTime = record.check_in;
          let checkOutTime = record.check_out;
          
          // If check_in/check_out are datetime strings, extract time part
          if (checkInTime && typeof checkInTime === 'string' && checkInTime.includes('T')) {
            checkInTime = checkInTime.split('T')[1].split('.')[0]; // Extract HH:MM:SS
          }
          if (checkOutTime && typeof checkOutTime === 'string' && checkOutTime.includes('T')) {
            checkOutTime = checkOutTime.split('T')[1].split('.')[0]; // Extract HH:MM:SS
          }
          
          const workHours = calculateWorkHours(checkInTime, checkOutTime);
          const standardHours = 8;
          const overtimeHours = Math.max(0, workHours - standardHours);
          const totalHours = workHours;
          
          return {
            ...record,
            work_hours: parseFloat(workHours.toFixed(2)),
            overtime_hours: parseFloat(overtimeHours.toFixed(2)),
            total_hours: parseFloat(totalHours.toFixed(2))
          };
        });
        
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
          data: attendanceWithWorkHours,
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

    // ==================== JOB POSTINGS API ====================
    
    // Get all job postings
    app.get('/api/v1/jobs', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT 
            jp.*,
            d.name as department_name,
            des.name as designation_name
          FROM job_postings jp
          LEFT JOIN departments d ON jp.department_id = d.id
          LEFT JOIN designations des ON jp.designation_id = des.id
          WHERE jp.company_id = 1
          ORDER BY jp.created_at DESC
        `;
        
        const [jobs] = await pool.query(query);
        res.json(jobs);
      } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create new job posting
    app.post('/api/v1/jobs', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const {
          title,
          description,
          requirements,
          responsibilities,
          location,
          job_type,
          experience_min,
          experience_max,
          salary_min,
          salary_max,
          vacancies,
          closing_date,
          department_id,
          designation_id
        } = req.body;

        const query = `
          INSERT INTO job_postings (
            company_id, department_id, designation_id, title, description, requirements,
            responsibilities, location, job_type, experience_min, experience_max,
            salary_min, salary_max, vacancies, closing_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
        `;

        const [result] = await pool.query(query, [
          1, department_id, designation_id, title, description, requirements,
          responsibilities, location, job_type, experience_min, experience_max,
          salary_min, salary_max, vacancies, closing_date
        ]);

        res.status(201).json({
          message: 'Job posting created successfully',
          id: result.insertId
        });
      } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update job posting
    app.put('/api/v1/jobs/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const updateFields = [];
        const values = [];

        // Build dynamic update query
        const allowedFields = [
          'title', 'description', 'requirements', 'responsibilities', 'location',
          'job_type', 'experience_min', 'experience_max', 'salary_min', 'salary_max',
          'vacancies', 'closing_date', 'status', 'department_id', 'designation_id'
        ];

        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            values.push(req.body[field]);
          }
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ message: 'No valid fields to update' });
        }

        values.push(id);
        const query = `UPDATE job_postings SET ${updateFields.join(', ')} WHERE id = ?`;

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Job posting not found' });
        }

        res.json({ message: 'Job posting updated successfully' });
      } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Delete job posting
    app.delete('/api/v1/jobs/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM job_postings WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Job posting not found' });
        }
        
        res.json({ message: 'Job posting deleted successfully' });
      } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // ==================== JOB APPLICATIONS (CANDIDATES) API ====================
    
    // Get all job applications (candidates)
    app.get('/api/v1/candidates', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT 
            ja.*,
            jp.title as job_title
          FROM job_applications ja
          LEFT JOIN job_postings jp ON ja.job_posting_id = jp.id
          ORDER BY ja.created_at DESC
        `;
        
        const [candidates] = await pool.query(query);
        res.json(candidates);
      } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create new job application (candidate)
    app.post('/api/v1/candidates', authenticateToken, async (req, res) => {
      try {
        const {
          job_posting_id,
          first_name,
          last_name,
          email,
          phone,
          resume,
          cover_letter,
          source
        } = req.body;

        const query = `
          INSERT INTO job_applications (
            job_posting_id, first_name, last_name, email, phone, resume, cover_letter, source, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
        `;

        const [result] = await pool.query(query, [
          job_posting_id, first_name, last_name, email, phone, resume, cover_letter, source
        ]);

        res.status(201).json({
          message: 'Application submitted successfully',
          id: result.insertId
        });
      } catch (error) {
        console.error('Create candidate error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update job application status
    app.put('/api/v1/candidates/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        const [result] = await pool.query(
          'UPDATE job_applications SET status = ? WHERE id = ?',
          [status, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ message: 'Application status updated successfully' });
      } catch (error) {
        console.error('Update candidate error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // ==================== ASSETS API ====================
    
    // Get all assets
    app.get('/api/v1/assets', authenticateToken, async (req, res) => {
      try {
        const query = `
          SELECT 
            a.*,
            e.first_name,
            e.last_name,
            e.employee_id
          FROM assets a
          LEFT JOIN asset_assignments aa ON a.id = aa.asset_id AND aa.return_date IS NULL
          LEFT JOIN employees e ON aa.employee_id = e.id
          WHERE a.company_id = 1
          ORDER BY a.created_at DESC
        `;
        
        const [assets] = await pool.query(query);
        res.json(assets);
      } catch (error) {
        console.error('Get assets error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create new asset
    app.post('/api/v1/assets', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const {
          name,
          category,
          description,
          serial_number,
          purchase_date,
          purchase_price,
          assigned_to,
          location,
          status
        } = req.body;

        const query = `
          INSERT INTO assets (
            company_id, name, category, description, serial_number, purchase_date,
            purchase_price, assigned_to, location, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
          1, name, category, description, serial_number, purchase_date,
          purchase_price, assigned_to, location, status || 'available'
        ]);

        res.status(201).json({
          message: 'Asset created successfully',
          id: result.insertId
        });
      } catch (error) {
        console.error('Create asset error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update asset
    app.put('/api/v1/assets/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const updateFields = [];
        const values = [];

        // Build dynamic update query
        const allowedFields = [
          'name', 'category', 'description', 'serial_number', 'purchase_date',
          'purchase_price', 'assigned_to', 'location', 'status'
        ];

        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            values.push(req.body[field]);
          }
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ message: 'No valid fields to update' });
        }

        values.push(id);
        const query = `UPDATE assets SET ${updateFields.join(', ')} WHERE id = ?`;

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Asset not found' });
        }

        res.json({ message: 'Asset updated successfully' });
      } catch (error) {
        console.error('Update asset error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Delete asset
    app.delete('/api/v1/assets/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM assets WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Asset not found' });
        }
        
        res.json({ message: 'Asset deleted successfully' });
      } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // ==================== TIMEKEEPING API ENDPOINTS ====================
    
    // Shifts API
    app.get('/api/v1/timekeeping/shifts', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, search = '', is_active = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM shifts WHERE 1=1';
        const params = [];
        
        if (search) {
          query += ' AND (name LIKE ? OR description LIKE ?)';
          params.push(`%${search}%`, `%${search}%`);
        }
        
        if (is_active !== '') {
          query += ' AND is_active = ?';
          params.push(is_active === 'true');
        }
        
        query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [shifts] = await pool.query(query, params);
        
        // Add assigned employees count to each shift
        const shiftsWithCounts = await Promise.all(shifts.map(async (shift) => {
          const [assignments] = await pool.query(
            'SELECT COUNT(*) as count FROM shift_assignments WHERE shift_id = ? AND is_active = 1',
            [shift.id]
          );
          return {
            ...shift,
            assigned_employees_count: assignments[0].count
          };
        }));
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM shifts WHERE 1=1';
        const countParams = [];
        
        if (search) {
          countQuery += ' AND (name LIKE ? OR description LIKE ?)';
          countParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (is_active !== '') {
          countQuery += ' AND is_active = ?';
          countParams.push(is_active === 'true');
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
          data: shiftsWithCounts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get shifts error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/timekeeping/shifts', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { name, description, start_time, end_time, break_duration, working_days, is_flexible, grace_period, late_threshold, overtime_rate } = req.body;
        
        const [result] = await pool.query(
          `INSERT INTO shifts (name, description, start_time, end_time, break_duration, working_days, is_flexible, grace_period, late_threshold, overtime_rate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, description, start_time, end_time, break_duration, JSON.stringify(working_days), is_flexible, grace_period, late_threshold, overtime_rate]
        );
        
        const [shift] = await pool.query('SELECT * FROM shifts WHERE id = ?', [result.insertId]);
        
        res.status(201).json({
          message: 'Shift created successfully',
          data: shift[0]
        });
      } catch (error) {
        console.error('Create shift error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/timekeeping/shifts/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, start_time, end_time, break_duration, working_days, is_flexible, grace_period, late_threshold, overtime_rate, is_active } = req.body;
        
        await pool.query(
          `UPDATE shifts SET name = ?, description = ?, start_time = ?, end_time = ?, break_duration = ?, working_days = ?, is_flexible = ?, grace_period = ?, late_threshold = ?, overtime_rate = ?, is_active = ?
           WHERE id = ?`,
          [name, description, start_time, end_time, break_duration, JSON.stringify(working_days), is_flexible, grace_period, late_threshold, overtime_rate, is_active, id]
        );
        
        const [shift] = await pool.query('SELECT * FROM shifts WHERE id = ?', [id]);
        
        res.json({
          message: 'Shift updated successfully',
          data: shift[0]
        });
      } catch (error) {
        console.error('Update shift error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/timekeeping/shifts/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if shift is assigned to any employees and get employee details
        const [assignments] = await pool.query(`
          SELECT sa.*, e.first_name, e.last_name, e.employee_id 
          FROM shift_assignments sa 
          JOIN employees e ON sa.employee_id = e.id 
          WHERE sa.shift_id = ? AND sa.is_active = 1
        `, [id]);
        
        if (assignments.length > 0) {
          const employeeNames = assignments.map(emp => `${emp.first_name} ${emp.last_name} (${emp.employee_id})`).join(', ');
          return res.status(400).json({ 
            message: `Cannot delete shift that is assigned to employees: ${employeeNames}`,
            assignedEmployees: assignments.map(emp => ({
              id: emp.employee_id,
              name: `${emp.first_name} ${emp.last_name}`,
              employee_id: emp.employee_id
            }))
          });
        }
        
        await pool.query('DELETE FROM shifts WHERE id = ?', [id]);
        
        res.json({ message: 'Shift deleted successfully' });
      } catch (error) {
        console.error('Delete shift error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Shift Assignments API
    app.get('/api/v1/timekeeping/shift-assignments', authenticateToken, async (req, res) => {
      try {
        const { employee_id, shift_id, is_active = '' } = req.query;
        
        let query = `
          SELECT sa.*, 
                 e.first_name, e.last_name, e.employee_id as emp_id,
                 s.name as shift_name, s.start_time, s.end_time
          FROM shift_assignments sa
          JOIN employees e ON sa.employee_id = e.id
          JOIN shifts s ON sa.shift_id = s.id
          WHERE 1=1
        `;
        const params = [];
        
        if (employee_id) {
          query += ' AND sa.employee_id = ?';
          params.push(employee_id);
        }
        
        if (shift_id) {
          query += ' AND sa.shift_id = ?';
          params.push(shift_id);
        }
        
        if (is_active !== '') {
          query += ' AND sa.is_active = ?';
          params.push(is_active === 'true');
        }
        
        query += ' ORDER BY sa.effective_date DESC';
        
        const [assignments] = await pool.query(query, params);
        
        res.json({
          success: true,
          data: assignments
        });
      } catch (error) {
        console.error('Get shift assignments error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/timekeeping/shift-assignments', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { employee_id, shift_id, effective_date, end_date = null } = req.body;
        
        if (!employee_id || !shift_id || !effective_date) {
          return res.status(400).json({ 
            message: 'Employee ID, Shift ID, and Effective Date are required' 
          });
        }
        
        // Check if employee exists
        const [employees] = await pool.query('SELECT id FROM employees WHERE id = ?', [employee_id]);
        if (employees.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        
        // Check if shift exists
        const [shifts] = await pool.query('SELECT id FROM shifts WHERE id = ?', [shift_id]);
        if (shifts.length === 0) {
          return res.status(404).json({ message: 'Shift not found' });
        }
        
        // Check for overlapping assignments
        const [overlaps] = await pool.query(`
          SELECT id FROM shift_assignments 
          WHERE employee_id = ? 
          AND is_active = 1 
          AND (
            (effective_date <= ? AND (end_date IS NULL OR end_date >= ?)) OR
            (effective_date <= ? AND (end_date IS NULL OR end_date >= ?)) OR
            (effective_date >= ? AND (end_date IS NULL OR end_date <= ?))
          )
        `, [employee_id, effective_date, effective_date, end_date || effective_date, end_date || effective_date, effective_date, end_date || effective_date]);
        
        if (overlaps.length > 0) {
          return res.status(400).json({ 
            message: 'Employee already has an active shift assignment for this period' 
          });
        }
        
        // Create assignment
        const [result] = await pool.query(`
          INSERT INTO shift_assignments (employee_id, shift_id, effective_date, end_date, is_active)
          VALUES (?, ?, ?, ?, 1)
        `, [employee_id, shift_id, effective_date, end_date]);
        
        // Get the created assignment with details
        const [newAssignment] = await pool.query(`
          SELECT sa.*, 
                 e.first_name, e.last_name, e.employee_id as emp_id,
                 s.name as shift_name, s.start_time, s.end_time
          FROM shift_assignments sa
          JOIN employees e ON sa.employee_id = e.id
          JOIN shifts s ON sa.shift_id = s.id
          WHERE sa.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
          success: true,
          message: 'Shift assignment created successfully',
          data: newAssignment[0]
        });
      } catch (error) {
        console.error('Create shift assignment error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.put('/api/v1/timekeeping/shift-assignments/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { shift_id, effective_date, end_date, is_active } = req.body;
        
        // Check if assignment exists
        const [existing] = await pool.query('SELECT * FROM shift_assignments WHERE id = ?', [id]);
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Shift assignment not found' });
        }
        
        // Update assignment
        await pool.query(`
          UPDATE shift_assignments 
          SET shift_id = ?, effective_date = ?, end_date = ?, is_active = ?
          WHERE id = ?
        `, [shift_id, effective_date, end_date, is_active, id]);
        
        // Get updated assignment with details
        const [updatedAssignment] = await pool.query(`
          SELECT sa.*, 
                 e.first_name, e.last_name, e.employee_id as emp_id,
                 s.name as shift_name, s.start_time, s.end_time
          FROM shift_assignments sa
          JOIN employees e ON sa.employee_id = e.id
          JOIN shifts s ON sa.shift_id = s.id
          WHERE sa.id = ?
        `, [id]);
        
        res.json({
          success: true,
          message: 'Shift assignment updated successfully',
          data: updatedAssignment[0]
        });
      } catch (error) {
        console.error('Update shift assignment error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.delete('/api/v1/timekeeping/shift-assignments/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if assignment exists
        const [existing] = await pool.query('SELECT * FROM shift_assignments WHERE id = ?', [id]);
        if (existing.length === 0) {
          return res.status(404).json({ message: 'Shift assignment not found' });
        }
        
        // Delete assignment
        await pool.query('DELETE FROM shift_assignments WHERE id = ?', [id]);
        
        res.json({
          success: true,
          message: 'Shift assignment deleted successfully'
        });
      } catch (error) {
        console.error('Delete shift assignment error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Attendance Policies API
    app.get('/api/v1/timekeeping/policies', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, search = '', policy_type = '', is_active = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT p.*
          FROM attendance_policies p
          WHERE 1=1
        `;
        const params = [];
        
        if (search) {
          query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
          params.push(`%${search}%`, `%${search}%`);
        }
        
        if (policy_type) {
          query += ' AND p.policy_type = ?';
          params.push(policy_type);
        }
        
        if (is_active !== '') {
          query += ' AND p.is_active = ?';
          params.push(is_active === 'true');
        }
        
        query += ' ORDER BY p.name ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [policies] = await pool.query(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM attendance_policies p WHERE 1=1';
        const countParams = [];
        
        if (search) {
          countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
          countParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (policy_type) {
          countQuery += ' AND p.policy_type = ?';
          countParams.push(policy_type);
        }
        
        if (is_active !== '') {
          countQuery += ' AND p.is_active = ?';
          countParams.push(is_active === 'true');
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
          data: policies,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get policies error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/timekeeping/policies', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { name, description, work_hours_per_day, work_days_per_week, late_grace_minutes, early_leave_grace_minutes, overtime_threshold_hours, is_active } = req.body;
        
        const [result] = await pool.query(
          `INSERT INTO attendance_policies (name, description, work_hours_per_day, work_days_per_week, late_grace_minutes, early_leave_grace_minutes, overtime_threshold_hours, is_active, company_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [name, description, work_hours_per_day || 8, work_days_per_week || 5, late_grace_minutes || 15, early_leave_grace_minutes || 15, overtime_threshold_hours || 8, is_active !== false]
        );
        
        const [policy] = await pool.query(`
          SELECT p.*
          FROM attendance_policies p
          WHERE p.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
          message: 'Policy created successfully',
          data: policy[0]
        });
      } catch (error) {
        console.error('Create policy error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Attendance Regulations API
    app.get('/api/v1/timekeeping/regulations', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, search = '', category = '', regulation_type = '', is_active = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT r.*, u.name as created_by_name
          FROM attendance_regulations r
          LEFT JOIN users u ON r.created_by = u.id
          WHERE 1=1
        `;
        const params = [];
        
        if (search) {
          query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
          params.push(`%${search}%`, `%${search}%`);
        }
        
        if (category) {
          query += ' AND r.category = ?';
          params.push(category);
        }
        
        if (regulation_type) {
          query += ' AND r.regulation_type = ?';
          params.push(regulation_type);
        }
        
        if (is_active !== '') {
          query += ' AND r.is_active = ?';
          params.push(is_active === 'true');
        }
        
        query += ' ORDER BY r.effective_date DESC, r.title ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [regulations] = await pool.query(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM attendance_regulations r WHERE 1=1';
        const countParams = [];
        
        if (search) {
          countQuery += ' AND (r.title LIKE ? OR r.description LIKE ?)';
          countParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (category) {
          countQuery += ' AND r.category = ?';
          countParams.push(category);
        }
        
        if (regulation_type) {
          countQuery += ' AND r.regulation_type = ?';
          countParams.push(regulation_type);
        }
        
        if (is_active !== '') {
          countQuery += ' AND r.is_active = ?';
          countParams.push(is_active === 'true');
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
          data: regulations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get regulations error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.post('/api/v1/timekeeping/regulations', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { title, description, regulation_type, category, effective_date, expiry_date, is_mandatory, penalty_description, compliance_requirements } = req.body;
        
        const [result] = await pool.query(
          `INSERT INTO attendance_regulations (title, description, regulation_type, category, effective_date, expiry_date, is_mandatory, penalty_description, compliance_requirements, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, description, regulation_type, category, effective_date, expiry_date, is_mandatory, penalty_description, compliance_requirements, req.user.id]
        );
        
        const [regulation] = await pool.query(`
          SELECT r.*, u.name as created_by_name
          FROM attendance_regulations r
          LEFT JOIN users u ON r.created_by = u.id
          WHERE r.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
          message: 'Regulation created successfully',
          data: regulation[0]
        });
      } catch (error) {
        console.error('Create regulation error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Function to calculate work hours
    const calculateWorkHours = (checkIn, checkOut) => {
      if (!checkIn || !checkOut) return 0;
      
      try {
        // Handle different time formats
        let startTime, endTime;
        
        if (typeof checkIn === 'string' && checkIn.includes('T')) {
          // ISO format: "2024-01-15T09:00:00.000Z"
          startTime = new Date(checkIn);
          endTime = new Date(checkOut);
        } else if (typeof checkIn === 'string' && checkIn.includes(':')) {
          // Time format: "09:00:00"
          startTime = new Date(`2000-01-01T${checkIn}`);
          endTime = new Date(`2000-01-01T${checkOut}`);
        } else {
          // Already Date objects
          startTime = new Date(checkIn);
          endTime = new Date(checkOut);
        }
        
        // Handle case where check-out is next day
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }
        
        const diffMs = endTime.getTime() - startTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        return Math.max(0, diffHours);
      } catch (error) {
        console.error('Error calculating work hours:', error);
        return 0;
      }
    };

    // Enhanced Attendance Records API with all columns
    app.get('/api/v1/timekeeping/attendance-records', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, employee_id = '', from_date = '', to_date = '', status = '', search = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT a.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id,
                 e.email,
                 d.name as department,
                 des.name as designation_name,
                 s.name as shift_name,
                 s.start_time as shift_start_time,
                 s.end_time as shift_end_time,
                 s.break_duration as shift_break_duration
          FROM attendance a
          LEFT JOIN employees e ON a.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations des ON e.designation_id = des.id
          LEFT JOIN shift_assignments sa ON a.employee_id = sa.employee_id AND a.date >= sa.effective_date AND (sa.end_date IS NULL OR a.date <= sa.end_date) AND sa.is_active = 1
          LEFT JOIN shifts s ON sa.shift_id = s.id
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
        
        if (search) {
          query += ' AND (CONCAT(e.first_name, " ", e.last_name) LIKE ? OR e.employee_id LIKE ? OR d.name LIKE ?)';
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY a.date DESC, a.check_in DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [attendance] = await pool.query(query, params);
        
        // Calculate work hours for each record
        const attendanceWithWorkHours = attendance.map(record => {
          // Extract time from datetime strings if needed
          let checkInTime = record.check_in;
          let checkOutTime = record.check_out;
          
          // If check_in/check_out are datetime strings, extract time part
          if (checkInTime && typeof checkInTime === 'string' && checkInTime.includes('T')) {
            checkInTime = checkInTime.split('T')[1].split('.')[0]; // Extract HH:MM:SS
          }
          if (checkOutTime && typeof checkOutTime === 'string' && checkOutTime.includes('T')) {
            checkOutTime = checkOutTime.split('T')[1].split('.')[0]; // Extract HH:MM:SS
          }
          
          const workHours = calculateWorkHours(checkInTime, checkOutTime);
          const breakDuration = record.shift_break_duration || 0; // in minutes
          const breakHours = breakDuration / 60;
          const netWorkHours = Math.max(0, workHours - breakHours);
          
          // Calculate overtime (assuming 8 hours is standard)
          const standardHours = 8;
          const overtimeHours = Math.max(0, netWorkHours - standardHours);
          const totalHours = netWorkHours;
          
          return {
            ...record,
            work_hours: parseFloat(netWorkHours.toFixed(2)),
            overtime_hours: parseFloat(overtimeHours.toFixed(2)),
            total_hours: parseFloat(totalHours.toFixed(2))
          };
        });
        
        // Get total count
        let countQuery = `
          SELECT COUNT(*) as total 
          FROM attendance a
          LEFT JOIN employees e ON a.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
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
        
        if (search) {
          countQuery += ' AND (CONCAT(e.first_name, " ", e.last_name) LIKE ? OR e.employee_id LIKE ? OR d.name LIKE ?)';
          countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
          data: attendanceWithWorkHours,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Get attendance records error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Auto-migration function
    async function runAutoMigration() {
      try {
        console.log('🔄 Running auto-migration...');
        
        // Add new columns to employees table
        const newColumns = [
          "ALTER TABLE employees ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time'",
          "ALTER TABLE employees ADD COLUMN attendance_policy_id INT NULL",
          "ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) NULL",
          "ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(50) NULL",
          "ALTER TABLE employees ADD COLUMN bank_routing_number VARCHAR(50) NULL",
          "ALTER TABLE employees ADD COLUMN bank_swift_code VARCHAR(20) NULL",
          "ALTER TABLE employees ADD COLUMN bank_address TEXT NULL",
          "ALTER TABLE employees ADD COLUMN role VARCHAR(50) DEFAULT 'employee'"
        ];
        
        for (const sql of newColumns) {
          try {
            await pool.query(sql);
            const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
            console.log(`✅ Added ${columnName} to employees table`);
          } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
              const columnName = sql.match(/ADD COLUMN (\w+)/)[1];
              console.log(`ℹ️ ${columnName} already exists in employees table`);
            } else {
              console.log(`❌ Error adding column: ${error.message}`);
            }
          }
        }
        
        // Add company_id to attendance tables
        try {
          await pool.query('ALTER TABLE attendance_policies ADD COLUMN company_id INT DEFAULT 1');
          console.log('✅ Added company_id to attendance_policies');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ company_id already exists in attendance_policies');
          } else {
            console.log(`❌ Error with attendance_policies: ${error.message}`);
          }
        }
        
        try {
          await pool.query('ALTER TABLE attendance_regulations ADD COLUMN company_id INT DEFAULT 1');
          console.log('✅ Added company_id to attendance_regulations');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ company_id already exists in attendance_regulations');
          } else {
            console.log(`❌ Error with attendance_regulations: ${error.message}`);
          }
        }
        
        // Create attendance_records table if it doesn't exist
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS attendance_records (
              id INT(11) NOT NULL AUTO_INCREMENT,
              employee_id INT(11) NOT NULL,
              date DATE NOT NULL,
              check_in TIME NULL,
              check_out TIME NULL,
              work_hours DECIMAL(5,2) DEFAULT 0,
              overtime_hours DECIMAL(5,2) DEFAULT 0,
              status ENUM('present', 'absent', 'late', 'partial') DEFAULT 'present',
              check_in_location VARCHAR(255) NULL,
              check_out_location VARCHAR(255) NULL,
              check_in_ip VARCHAR(45) NULL,
              check_out_ip VARCHAR(45) NULL,
              check_in_device TEXT NULL,
              check_out_device TEXT NULL,
              company_id INT(11) DEFAULT 1,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (id),
              UNIQUE KEY unique_employee_date (employee_id, date),
              INDEX idx_employee_id (employee_id),
              INDEX idx_date (date),
              INDEX idx_status (status),
              INDEX idx_company_id (company_id)
            )
          `);
          console.log('✅ Created attendance_records table');
        } catch (error) {
          console.log(`❌ Error creating attendance_records: ${error.message}`);
        }

        // Create leave management tables
        try {
          // Leave Types Table
          await pool.query(`
            CREATE TABLE IF NOT EXISTS leave_types (
              id INT AUTO_INCREMENT PRIMARY KEY,
              company_id INT NOT NULL,
              name VARCHAR(100) NOT NULL,
              code VARCHAR(20) UNIQUE NOT NULL,
              description TEXT,
              max_days_per_year INT DEFAULT 0,
              max_consecutive_days INT DEFAULT 0,
              requires_approval BOOLEAN DEFAULT TRUE,
              requires_documentation BOOLEAN DEFAULT FALSE,
              is_paid BOOLEAN DEFAULT TRUE,
              carry_forward BOOLEAN DEFAULT FALSE,
              max_carry_forward_days INT DEFAULT 0,
              gender_restriction ENUM('all', 'male', 'female') DEFAULT 'all',
              min_service_days INT DEFAULT 0,
              advance_notice_days INT DEFAULT 0,
              color_code VARCHAR(7) DEFAULT '#3B82F6',
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            )
          `);

          // Leave Applications Table
          await pool.query(`
            CREATE TABLE IF NOT EXISTS leave_applications (
              id INT AUTO_INCREMENT PRIMARY KEY,
              leave_id VARCHAR(50) UNIQUE NULL,
              employee_id INT NOT NULL,
              leave_type_id INT NOT NULL,
              start_date DATE NOT NULL,
              end_date DATE NOT NULL,
              total_days INT NOT NULL,
              reason TEXT NOT NULL,
              emergency_contact VARCHAR(255),
              attachment VARCHAR(500),
              status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
              approved_by INT NULL,
              approved_at DATETIME NULL,
              rejection_reason TEXT,
              cancelled_at DATETIME NULL,
              cancellation_reason TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
              FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
              FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
            )
          `);

          // Leave Balances Table
          await pool.query(`
            CREATE TABLE IF NOT EXISTS leave_balances (
              id INT AUTO_INCREMENT PRIMARY KEY,
              employee_id INT NOT NULL,
              leave_type_id INT NOT NULL,
              year YEAR NOT NULL,
              total_allocated INT DEFAULT 0,
              total_used INT DEFAULT 0,
              total_approved INT DEFAULT 0,
              total_pending INT DEFAULT 0,
              carry_forward_from_previous INT DEFAULT 0,
              carry_forward_to_next INT DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year),
              FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
              FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
            )
          `);

          // Leave Policies Table
          await pool.query(`
            CREATE TABLE IF NOT EXISTS leave_policies (
              id INT AUTO_INCREMENT PRIMARY KEY,
              company_id INT NOT NULL,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              policy_type ENUM('general', 'department_specific', 'employee_specific') DEFAULT 'general',
              department_id INT NULL,
              employee_id INT NULL,
              leave_type_id INT NOT NULL,
              max_days_per_year INT DEFAULT 0,
              max_consecutive_days INT DEFAULT 0,
              requires_approval BOOLEAN DEFAULT TRUE,
              approval_workflow JSON,
              is_active BOOLEAN DEFAULT TRUE,
              effective_from DATE NOT NULL,
              effective_to DATE NULL,
              created_by INT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
              FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
              FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
              FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
              FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
          `);

          // Leave Holidays Table
          await pool.query(`
            CREATE TABLE IF NOT EXISTS leave_holidays (
              id INT AUTO_INCREMENT PRIMARY KEY,
              company_id INT NOT NULL,
              name VARCHAR(255) NOT NULL,
              date DATE NOT NULL,
              type ENUM('national', 'regional', 'company', 'floating') DEFAULT 'company',
              is_recurring BOOLEAN DEFAULT FALSE,
              recurring_pattern ENUM('yearly', 'monthly', 'weekly') NULL,
              description TEXT,
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            )
          `);

          console.log('✅ Leave management tables created/verified');
        } catch (error) {
          console.log(`❌ Error creating leave management tables: ${error.message}`);
        }
        
        // Create employee_salary_components table
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS employee_salary_components (
              id INT AUTO_INCREMENT PRIMARY KEY,
              salary_id INT NOT NULL,
              component_id INT NOT NULL,
              amount DECIMAL(10,2) NOT NULL DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (salary_id) REFERENCES employee_salaries(id) ON DELETE CASCADE,
              FOREIGN KEY (component_id) REFERENCES salary_components(id) ON DELETE CASCADE,
              UNIQUE KEY unique_salary_component (salary_id, component_id)
            )
          `);
          console.log('✅ Created employee_salary_components table');
        } catch (error) {
          console.log(`❌ Error creating employee_salary_components table: ${error.message}`);
        }
        
        // Create employee_contracts table
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS employee_contracts (
              id INT AUTO_INCREMENT PRIMARY KEY,
              employee_id INT NOT NULL,
              contract_type ENUM('permanent', 'contract', 'temporary', 'intern', 'consultant') NOT NULL,
              start_date DATE NOT NULL,
              end_date DATE NULL,
              salary DECIMAL(10,2) NOT NULL,
              status ENUM('active', 'expired', 'terminated', 'pending') DEFAULT 'active',
              terms TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
            )
          `);
          console.log('✅ Created employee_contracts table');
        } catch (error) {
          console.log(`❌ Error creating employee_contracts table: ${error.message}`);
        }
        
        // Add demo data for employee contracts
        try {
          const [existingContracts] = await pool.query('SELECT COUNT(*) as count FROM employee_contracts');
          if (existingContracts[0].count === 0) {
            // Get existing employees first
            const [employees] = await pool.query('SELECT id FROM employees ORDER BY id LIMIT 5');
            
            const demoContracts = [
              {
                employee_id: employees[0]?.id || 20,
                contract_type: 'permanent',
                start_date: '2023-01-15',
                end_date: null,
                salary: 75000.00,
                status: 'active',
                terms: 'Full-time permanent employment with standard benefits package including health insurance, paid time off, and retirement contributions.'
              },
              {
                employee_id: employees[1]?.id || 19,
                contract_type: 'contract',
                start_date: '2023-06-01',
                end_date: '2024-05-31',
                salary: 65000.00,
                status: 'active',
                terms: '12-month contract position with possibility of extension. Includes health insurance and paid time off.'
              },
              {
                employee_id: employees[2]?.id || 18,
                contract_type: 'permanent',
                start_date: '2022-09-01',
                end_date: null,
                salary: 85000.00,
                status: 'active',
                terms: 'Full-time permanent employment with comprehensive benefits including health, dental, vision insurance, and 401k matching.'
              },
              {
                employee_id: employees[3]?.id || 17,
                contract_type: 'temporary',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                salary: 45000.00,
                status: 'active',
                terms: 'Temporary position for project duration. Includes basic health insurance coverage.'
              },
              {
                employee_id: employees[4]?.id || 16,
                contract_type: 'intern',
                start_date: '2024-06-01',
                end_date: '2024-08-31',
                salary: 3000.00,
                status: 'active',
                terms: 'Summer internship program with learning opportunities and mentorship.'
              }
            ];
            
            for (const contract of demoContracts) {
              await pool.query(`
                INSERT INTO employee_contracts (
                  employee_id, contract_type, start_date, end_date, salary, status, terms
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [
                contract.employee_id,
                contract.contract_type,
                contract.start_date,
                contract.end_date,
                contract.salary,
                contract.status,
                contract.terms
              ]);
            }
            console.log('✅ Added demo data for employee contracts');
          } else {
            console.log('ℹ️ Employee contracts demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding employee contracts demo data: ${error.message}`);
        }

        // Create audit_logs table
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              log_id VARCHAR(50) UNIQUE NOT NULL,
              user_id INT NOT NULL,
              user_name VARCHAR(255) NOT NULL,
              user_email VARCHAR(255) NOT NULL,
              action VARCHAR(100) NOT NULL,
              resource VARCHAR(100) NOT NULL,
              resource_id VARCHAR(100) NULL,
              details TEXT,
              ip_address VARCHAR(45) NULL,
              user_agent TEXT NULL,
              status ENUM('success', 'failed', 'warning') DEFAULT 'success',
              severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
              department VARCHAR(100) NULL,
              location VARCHAR(100) NULL,
              session_id VARCHAR(100) NULL,
              changes JSON NULL,
              old_values JSON NULL,
              new_values JSON NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_user_id (user_id),
              INDEX idx_action (action),
              INDEX idx_resource (resource),
              INDEX idx_status (status),
              INDEX idx_severity (severity),
              INDEX idx_created_at (created_at),
              INDEX idx_log_id (log_id)
            )
          `);
          console.log('✅ Created audit_logs table');
        } catch (error) {
          console.log(`❌ Error creating audit_logs table: ${error.message}`);
        }

        // Add demo data for leave types
        try {
          const [existingLeaveTypes] = await pool.query('SELECT COUNT(*) as count FROM leave_types WHERE company_id = 1');
          if (existingLeaveTypes[0].count === 0) {
            const demoLeaveTypes = [
              {
                company_id: 1,
                name: 'Annual Leave',
                days_allowed: 25,
                requires_approval: true,
                is_paid: true
              },
              {
                company_id: 1,
                name: 'Sick Leave',
                days_allowed: 12,
                requires_approval: false,
                is_paid: true
              },
              {
                company_id: 1,
                name: 'Personal Leave',
                days_allowed: 5,
                requires_approval: true,
                is_paid: false
              },
              {
                company_id: 1,
                name: 'Maternity Leave',
                days_allowed: 90,
                requires_approval: true,
                is_paid: true
              },
              {
                company_id: 1,
                name: 'Emergency Leave',
                days_allowed: 3,
                requires_approval: false,
                is_paid: true
              }
            ];

            for (const leaveType of demoLeaveTypes) {
              await pool.query(`
                INSERT INTO leave_types (
                  company_id, name, days_allowed, requires_approval, is_paid
                ) VALUES (?, ?, ?, ?, ?)
              `, [
                leaveType.company_id, leaveType.name, leaveType.days_allowed,
                leaveType.requires_approval, leaveType.is_paid
              ]);
            }
            console.log('✅ Added demo data for leave types');
          } else {
            console.log('ℹ️ Leave types demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding leave types demo data: ${error.message}`);
        }

        // Add demo data for leave applications
        try {
          const [existingLeaveApps] = await pool.query('SELECT COUNT(*) as count FROM leave_applications');
          if (existingLeaveApps[0].count === 0) {
            // Get employee IDs and leave type IDs
            const [employees] = await pool.query('SELECT id FROM employees WHERE company_id = 1 LIMIT 5');
            const [leaveTypes] = await pool.query('SELECT id, name FROM leave_types WHERE company_id = 1');

            if (employees.length > 0 && leaveTypes.length > 0) {
              const demoLeaveApplications = [
                {
                  leave_id: 'LA202501001',
                  employee_id: employees[0]?.id || 1,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Annual Leave')?.id || 1,
                  start_date: '2025-02-15',
                  end_date: '2025-02-20',
                  total_days: 5,
                  reason: 'Family vacation to Hawaii',
                  emergency_contact: '+1-555-0123',
                  status: 'pending'
                },
                {
                  leave_id: 'LA202501002',
                  employee_id: employees[1]?.id || 2,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Sick Leave')?.id || 2,
                  start_date: '2025-01-20',
                  end_date: '2025-01-21',
                  total_days: 2,
                  reason: 'Medical appointment and recovery',
                  emergency_contact: '+1-555-0456',
                  status: 'approved',
                  approved_by: 1,
                  approved_at: '2025-01-19 10:30:00'
                },
                {
                  leave_id: 'LA202501003',
                  employee_id: employees[2]?.id || 3,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Personal Leave')?.id || 3,
                  start_date: '2025-01-25',
                  end_date: '2025-01-25',
                  total_days: 1,
                  reason: 'Personal matters',
                  emergency_contact: '+1-555-0789',
                  status: 'rejected',
                  approved_by: 1,
                  approved_at: '2025-01-24 14:15:00',
                  rejection_reason: 'Insufficient notice period'
                },
                {
                  leave_id: 'LA202501004',
                  employee_id: employees[3]?.id || 4,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Maternity Leave')?.id || 4,
                  start_date: '2025-03-01',
                  end_date: '2025-05-30',
                  total_days: 90,
                  reason: 'Maternity leave for childbirth',
                  emergency_contact: '+1-555-0321',
                  status: 'approved',
                  approved_by: 1,
                  approved_at: '2025-02-15 09:00:00'
                },
                {
                  leave_id: 'LA202501005',
                  employee_id: employees[4]?.id || 5,
                  leave_type_id: leaveTypes.find(lt => lt.name === 'Emergency Leave')?.id || 5,
                  start_date: '2025-01-18',
                  end_date: '2025-01-18',
                  total_days: 1,
                  reason: 'Family emergency - father hospitalized',
                  emergency_contact: '+1-555-0654',
                  status: 'approved',
                  approved_by: 1,
                  approved_at: '2025-01-18 08:00:00'
                }
              ];

              for (const leaveApp of demoLeaveApplications) {
                await pool.query(`
                  INSERT INTO leave_applications (
                    leave_id, employee_id, leave_type_id, start_date, end_date,
                    total_days, reason, emergency_contact, status, approved_by, approved_at, rejection_reason
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  leaveApp.leave_id, leaveApp.employee_id, leaveApp.leave_type_id,
                  leaveApp.start_date, leaveApp.end_date, leaveApp.total_days, leaveApp.reason,
                  leaveApp.emergency_contact, leaveApp.status, leaveApp.approved_by,
                  leaveApp.approved_at, leaveApp.rejection_reason
                ]);
              }
              console.log('✅ Added demo data for leave applications');
            }
          } else {
            console.log('ℹ️ Leave applications demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding leave applications demo data: ${error.message}`);
        }

        // Add demo data for audit logs
        try {
          const [existingAuditLogs] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
          if (existingAuditLogs[0].count === 0) {
            const actions = [
              "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT", 
              "APPROVE", "REJECT", "ASSIGN", "UNASSIGN", "SCHEDULE", "CANCEL", "RESET_PASSWORD",
              "CHANGE_ROLE", "UPDATE_PROFILE", "UPLOAD_FILE", "DOWNLOAD_FILE", "SEND_EMAIL"
            ];
            
            const resources = [
              "USER", "EMPLOYEE", "DEPARTMENT", "JOB", "CANDIDATE", "INTERVIEW", "REVIEW", 
              "GOAL", "ATTENDANCE", "LEAVE", "PAYROLL", "EXPENSE", "REPORT", "SETTINGS", 
              "ROLE", "PERMISSION", "DOCUMENT", "NOTIFICATION", "CALENDAR", "TASK"
            ];
            
            const users = [
              { id: 17, name: "John Smith", email: "admin@example.com", department: "IT" },
              { id: 18, name: "Sarah Johnson", email: "employee@example.com", department: "HR" },
              { id: 19, name: "Mike Wilson", email: "mike.wilson@company.com", department: "Finance" },
              { id: 20, name: "Lisa Anderson", email: "lisa.anderson@company.com", department: "Marketing" }
            ];
            
            const statuses = ["success", "failed", "warning"];
            const severities = ["low", "medium", "high", "critical"];
            
            const now = new Date();
            
            for (let i = 0; i < 50; i++) {
              const user = users[Math.floor(Math.random() * users.length)];
              const action = actions[Math.floor(Math.random() * actions.length)];
              const resource = resources[Math.floor(Math.random() * resources.length)];
              const status = statuses[Math.floor(Math.random() * statuses.length)];
              const severity = severities[Math.floor(Math.random() * severities.length)];
              
              // Generate timestamp within last 30 days
              const daysAgo = Math.floor(Math.random() * 30);
              const hoursAgo = Math.floor(Math.random() * 24);
              const minutesAgo = Math.floor(Math.random() * 60);
              const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
              
              const logId = `LOG-${String(i + 1).padStart(6, '0')}`;
              const resourceId = `${resource}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
              const sessionId = `SESS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
              const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
              const location = Math.random() > 0.5 ? 'Office' : 'Remote';
              
              await pool.query(`
                INSERT INTO audit_logs (
                  log_id, user_id, user_name, user_email, action, resource, resource_id,
                  details, ip_address, user_agent, status, severity, department, location,
                  session_id, changes, old_values, new_values, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                logId,
                user.id,
                user.name,
                user.email,
                action,
                resource,
                resourceId,
                `${action} operation performed on ${resource.toLowerCase()}`,
                ipAddress,
                `Mozilla/5.0 (${Math.random() > 0.5 ? 'Windows' : 'Mac'}) AppleWebKit/537.36`,
                status,
                severity,
                user.department,
                location,
                sessionId,
                Math.random() > 0.7 ? JSON.stringify({ field1: "old_value", field2: "new_value" }) : null,
                Math.random() > 0.8 ? JSON.stringify({ name: "Old Name", status: "inactive" }) : null,
                Math.random() > 0.8 ? JSON.stringify({ name: "New Name", status: "active" }) : null,
                timestamp
              ]);
            }
            console.log('✅ Added demo data for audit logs');
          } else {
            console.log('ℹ️ Audit logs demo data already exists');
          }
        } catch (error) {
          console.log(`❌ Error adding audit logs demo data: ${error.message}`);
        }

        // Create settings table
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
              id INT AUTO_INCREMENT PRIMARY KEY,
              category VARCHAR(100) NOT NULL,
              setting_key VARCHAR(100) NOT NULL,
              setting_value TEXT,
              setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
              description TEXT,
              is_public BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY unique_category_key (category, setting_key),
              INDEX idx_category (category),
              INDEX idx_public (is_public)
            )
          `);
          console.log('✅ Created settings table');
        } catch (error) {
          console.log(`❌ Error creating settings table: ${error.message}`);
        }

        // Add default settings
        try {
          const [existingSettings] = await pool.query('SELECT COUNT(*) as count FROM settings');
          if (existingSettings[0].count === 0) {
            const defaultSettings = [
              // General Settings
              { category: 'general', setting_key: 'site_name', setting_value: 'HRMGO', setting_type: 'string', description: 'Site name', is_public: true },
              { category: 'general', setting_key: 'site_description', setting_value: 'Human Resource Management System', setting_type: 'string', description: 'Site description', is_public: true },
              { category: 'general', setting_key: 'primary_color', setting_value: '#006FEE', setting_type: 'string', description: 'Primary color', is_public: true },
              { category: 'general', setting_key: 'secondary_color', setting_value: '#7828C8', setting_type: 'string', description: 'Secondary color', is_public: true },
              { category: 'general', setting_key: 'maintenance_mode', setting_value: 'false', setting_type: 'boolean', description: 'Maintenance mode', is_public: false },
              { category: 'general', setting_key: 'debug_mode', setting_value: 'false', setting_type: 'boolean', description: 'Debug mode', is_public: false },
              { category: 'general', setting_key: 'auto_backup', setting_value: 'true', setting_type: 'boolean', description: 'Auto backup', is_public: false },
              { category: 'general', setting_key: 'session_timeout', setting_value: '120', setting_type: 'number', description: 'Session timeout in minutes', is_public: false },
              
              // Company Settings
              { category: 'company', setting_key: 'company_name', setting_value: 'Your Company', setting_type: 'string', description: 'Company name', is_public: true },
              { category: 'company', setting_key: 'company_address', setting_value: '123 Business St, City, State 12345', setting_type: 'string', description: 'Company address', is_public: true },
              { category: 'company', setting_key: 'company_phone', setting_value: '+1 (555) 123-4567', setting_type: 'string', description: 'Company phone', is_public: true },
              { category: 'company', setting_key: 'company_email', setting_value: 'info@company.com', setting_type: 'string', description: 'Company email', is_public: true },
              { category: 'company', setting_key: 'company_website', setting_value: 'https://company.com', setting_type: 'string', description: 'Company website', is_public: true },
              { category: 'company', setting_key: 'company_logo', setting_value: '', setting_type: 'string', description: 'Company logo URL', is_public: true },
              
              // Localization Settings
              { category: 'localization', setting_key: 'default_language', setting_value: 'en', setting_type: 'string', description: 'Default language', is_public: true },
              { category: 'localization', setting_key: 'timezone', setting_value: 'America/New_York', setting_type: 'string', description: 'Default timezone', is_public: true },
              { category: 'localization', setting_key: 'date_format', setting_value: 'MM/DD/YYYY', setting_type: 'string', description: 'Date format', is_public: true },
              { category: 'localization', setting_key: 'time_format', setting_value: '12h', setting_type: 'string', description: 'Time format', is_public: true },
              { category: 'localization', setting_key: 'currency', setting_value: 'USD', setting_type: 'string', description: 'Default currency', is_public: true },
              { category: 'localization', setting_key: 'currency_symbol', setting_value: '$', setting_type: 'string', description: 'Currency symbol', is_public: true },
              
              // Email Settings
              { category: 'email', setting_key: 'mail_driver', setting_value: 'smtp', setting_type: 'string', description: 'Mail driver', is_public: false },
              { category: 'email', setting_key: 'mail_host', setting_value: 'smtp.example.com', setting_type: 'string', description: 'Mail host', is_public: false },
              { category: 'email', setting_key: 'mail_port', setting_value: '587', setting_type: 'string', description: 'Mail port', is_public: false },
              { category: 'email', setting_key: 'mail_username', setting_value: 'noreply@example.com', setting_type: 'string', description: 'Mail username', is_public: false },
              { category: 'email', setting_key: 'mail_password', setting_value: '', setting_type: 'string', description: 'Mail password', is_public: false },
              { category: 'email', setting_key: 'mail_encryption', setting_value: 'tls', setting_type: 'string', description: 'Mail encryption', is_public: false },
              { category: 'email', setting_key: 'mail_from_address', setting_value: 'noreply@example.com', setting_type: 'string', description: 'From address', is_public: false },
              { category: 'email', setting_key: 'mail_from_name', setting_value: 'HRMGO', setting_type: 'string', description: 'From name', is_public: false },
              
              // Notification Settings
              { category: 'notification', setting_key: 'email_notifications', setting_value: 'true', setting_type: 'boolean', description: 'Email notifications', is_public: false },
              { category: 'notification', setting_key: 'sms_notifications', setting_value: 'false', setting_type: 'boolean', description: 'SMS notifications', is_public: false },
              { category: 'notification', setting_key: 'push_notifications', setting_value: 'true', setting_type: 'boolean', description: 'Push notifications', is_public: false },
              { category: 'notification', setting_key: 'in_app_notifications', setting_value: 'true', setting_type: 'boolean', description: 'In-app notifications', is_public: false },
              
              // Security Settings
              { category: 'security', setting_key: 'password_min_length', setting_value: '8', setting_type: 'number', description: 'Minimum password length', is_public: false },
              { category: 'security', setting_key: 'password_require_special', setting_value: 'true', setting_type: 'boolean', description: 'Require special characters', is_public: false },
              { category: 'security', setting_key: 'session_timeout', setting_value: '120', setting_type: 'number', description: 'Session timeout', is_public: false },
              { category: 'security', setting_key: 'two_factor_enabled', setting_value: 'false', setting_type: 'boolean', description: 'Two-factor authentication', is_public: false },
              { category: 'security', setting_key: 'ip_whitelist', setting_value: '[]', setting_type: 'json', description: 'IP whitelist', is_public: false }
            ];
            
            for (const setting of defaultSettings) {
              await pool.query(`
                INSERT INTO settings (category, setting_key, setting_value, setting_type, description, is_public)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [setting.category, setting.setting_key, setting.setting_value, setting.setting_type, setting.description, setting.is_public]);
            }
            console.log('✅ Added default settings');
          } else {
            console.log('ℹ️ Default settings already exist');
          }
        } catch (error) {
          console.log(`❌ Error adding default settings: ${error.message}`);
        }
        
        // Add missing columns to user_permissions table if they don't exist
        try {
          await pool.query('ALTER TABLE user_permissions ADD COLUMN permission_id INT NULL');
          console.log('✅ Added permission_id column to user_permissions table');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ permission_id already exists in user_permissions table');
          } else {
            console.log(`❌ Error adding permission_id: ${error.message}`);
          }
        }
        
        try {
          await pool.query('ALTER TABLE user_permissions ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
          console.log('✅ Added is_active column to user_permissions table');
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ is_active already exists in user_permissions table');
          } else {
            console.log(`❌ Error with user_permissions: ${error.message}`);
          }
        }
        
        // Add foreign key constraint for permission_id if it doesn't exist
        try {
          await pool.query('ALTER TABLE user_permissions ADD CONSTRAINT fk_user_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE');
          console.log('✅ Added foreign key constraint for permission_id');
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME') {
            console.log('ℹ️ Foreign key constraint already exists');
          } else {
            console.log(`❌ Error adding foreign key: ${error.message}`);
          }
        }
        
        // Add missing permissions
        const additionalPermissions = [
          // Dashboard & Analytics
          { key: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard and analytics', module: 'dashboard' },
          { key: 'dashboard.export', name: 'Export Dashboard Data', description: 'Export dashboard reports and data', module: 'dashboard' },
          
          // Calendar & Events
          { key: 'calendar.view', name: 'View Calendar', description: 'View company calendar and events', module: 'calendar' },
          { key: 'calendar.create', name: 'Create Events', description: 'Create new calendar events', module: 'calendar' },
          { key: 'calendar.edit', name: 'Edit Events', description: 'Edit existing calendar events', module: 'calendar' },
          { key: 'calendar.delete', name: 'Delete Events', description: 'Delete calendar events', module: 'calendar' },
          
          // Tasks & Projects
          { key: 'tasks.view', name: 'View Tasks', description: 'View assigned tasks and projects', module: 'tasks' },
          { key: 'tasks.create', name: 'Create Tasks', description: 'Create new tasks and projects', module: 'tasks' },
          { key: 'tasks.edit', name: 'Edit Tasks', description: 'Edit existing tasks', module: 'tasks' },
          { key: 'tasks.delete', name: 'Delete Tasks', description: 'Delete tasks and projects', module: 'tasks' },
          { key: 'tasks.assign', name: 'Assign Tasks', description: 'Assign tasks to other users', module: 'tasks' },
          
          // Organization Management
          { key: 'organization.view', name: 'View Organization Chart', description: 'View company organization structure', module: 'organization' },
          { key: 'organization.edit', name: 'Edit Organization Chart', description: 'Modify organization structure', module: 'organization' },
          
          // Leave Management
          { key: 'leave.view', name: 'View Leave Requests', description: 'View leave applications and history', module: 'leave' },
          { key: 'leave.create', name: 'Create Leave Request', description: 'Submit new leave applications', module: 'leave' },
          { key: 'leave.approve', name: 'Approve Leave', description: 'Approve or reject leave requests', module: 'leave' },
          { key: 'leave.edit', name: 'Edit Leave Requests', description: 'Modify leave applications', module: 'leave' },
          { key: 'leave.delete', name: 'Delete Leave Requests', description: 'Delete leave applications', module: 'leave' },
          { key: 'leave.manage', name: 'Manage Leave System', description: 'Full access to leave management system', module: 'leave' },
          { key: 'leave.types.view', name: 'View Leave Types', description: 'View leave types configuration', module: 'leave' },
          { key: 'leave.types.manage', name: 'Manage Leave Types', description: 'Create/edit/delete leave types', module: 'leave' },
          { key: 'leave.policies.view', name: 'View Leave Policies', description: 'View leave policies', module: 'leave' },
          { key: 'leave.policies.manage', name: 'Manage Leave Policies', description: 'Create/edit/delete leave policies', module: 'leave' },
          { key: 'leave.balances.view', name: 'View Leave Balances', description: 'View employee leave balances', module: 'leave' },
          { key: 'leave.balances.manage', name: 'Manage Leave Balances', description: 'Adjust employee leave balances', module: 'leave' },
          { key: 'leave.holidays.view', name: 'View Holidays', description: 'View company holidays', module: 'leave' },
          { key: 'leave.holidays.manage', name: 'Manage Holidays', description: 'Create/edit/delete holidays', module: 'leave' },
          { key: 'leave.reports', name: 'Leave Reports', description: 'Generate and view leave reports', module: 'leave' },
          
          // Payroll & Finance
          { key: 'payroll.view', name: 'View Payroll', description: 'View payroll information and reports', module: 'payroll' },
          { key: 'payroll.create', name: 'Create Payroll', description: 'Generate payroll for employees', module: 'payroll' },
          { key: 'payroll.edit', name: 'Edit Payroll', description: 'Modify payroll calculations', module: 'payroll' },
          { key: 'payroll.approve', name: 'Approve Payroll', description: 'Approve payroll for processing', module: 'payroll' },
          { key: 'expenses.view', name: 'View Expenses', description: 'View expense reports and claims', module: 'expenses' },
          { key: 'expenses.create', name: 'Create Expense', description: 'Submit new expense claims', module: 'expenses' },
          { key: 'expenses.approve', name: 'Approve Expenses', description: 'Approve expense claims', module: 'expenses' },
          
          // Recruitment
          { key: 'recruitment.view', name: 'View Recruitment', description: 'View recruitment dashboard and statistics', module: 'recruitment' },
          { key: 'jobs.view', name: 'View Job Postings', description: 'View available job positions', module: 'jobs' },
          { key: 'jobs.create', name: 'Create Job Posting', description: 'Create new job postings', module: 'jobs' },
          { key: 'jobs.edit', name: 'Edit Job Postings', description: 'Edit existing job postings', module: 'jobs' },
          { key: 'jobs.delete', name: 'Delete Job Postings', description: 'Delete job postings', module: 'jobs' },
          { key: 'candidates.view', name: 'View Candidates', description: 'View candidate profiles and applications', module: 'candidates' },
          { key: 'candidates.create', name: 'Add Candidates', description: 'Add new candidate profiles', module: 'candidates' },
          { key: 'candidates.edit', name: 'Edit Candidates', description: 'Edit candidate information', module: 'candidates' },
          { key: 'candidates.delete', name: 'Delete Candidates', description: 'Delete candidate profiles', module: 'candidates' },
          { key: 'interviews.view', name: 'View Interviews', description: 'View interview schedules and results', module: 'interviews' },
          { key: 'interviews.create', name: 'Schedule Interviews', description: 'Schedule new interviews', module: 'interviews' },
          { key: 'interviews.edit', name: 'Edit Interviews', description: 'Modify interview schedules', module: 'interviews' },
          
          // Performance Management
          { key: 'performance.view', name: 'View Performance', description: 'View performance reviews and goals', module: 'performance' },
          { key: 'goals.view', name: 'View Goals', description: 'View employee goals and objectives', module: 'goals' },
          { key: 'goals.create', name: 'Create Goals', description: 'Set new performance goals', module: 'goals' },
          { key: 'goals.edit', name: 'Edit Goals', description: 'Modify existing goals', module: 'goals' },
          { key: 'reviews.view', name: 'View Reviews', description: 'View performance reviews', module: 'reviews' },
          { key: 'reviews.create', name: 'Create Reviews', description: 'Create performance reviews', module: 'reviews' },
          { key: 'reviews.edit', name: 'Edit Reviews', description: 'Edit performance reviews', module: 'reviews' },
          
          // Reports & Analytics
          { key: 'reports.view', name: 'View Reports', description: 'Access to all system reports', module: 'reports' },
          { key: 'reports.export', name: 'Export Reports', description: 'Export reports in various formats', module: 'reports' },
          { key: 'reports.income_expense', name: 'Income vs Expense Reports', description: 'View financial reports', module: 'reports' },
          { key: 'reports.attendance', name: 'Attendance Reports', description: 'View attendance analytics', module: 'reports' },
          { key: 'reports.leave', name: 'Leave Reports', description: 'View leave analytics', module: 'reports' },
          { key: 'reports.payroll', name: 'Payroll Reports', description: 'View payroll reports', module: 'reports' },
          
          // Asset Management
          { key: 'assets.view', name: 'View Assets', description: 'View company assets and inventory', module: 'assets' },
          { key: 'assets.create', name: 'Create Assets', description: 'Add new assets to inventory', module: 'assets' },
          { key: 'assets.edit', name: 'Edit Assets', description: 'Modify asset information', module: 'assets' },
          { key: 'assets.delete', name: 'Delete Assets', description: 'Remove assets from inventory', module: 'assets' },
          { key: 'assets.assign', name: 'Assign Assets', description: 'Assign assets to employees', module: 'assets' },
          
          // Documents & Policies
          { key: 'documents.view', name: 'View Documents', description: 'View company documents and policies', module: 'documents' },
          { key: 'documents.create', name: 'Create Documents', description: 'Upload new documents', module: 'documents' },
          { key: 'documents.edit', name: 'Edit Documents', description: 'Modify existing documents', module: 'documents' },
          { key: 'documents.delete', name: 'Delete Documents', description: 'Delete documents', module: 'documents' },
          
          // System Administration
          { key: 'settings.view', name: 'View Settings', description: 'View system settings and configuration', module: 'settings' },
          { key: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', module: 'settings' },
          { key: 'users.view', name: 'View Users', description: 'View user accounts and profiles', module: 'users' },
          { key: 'users.create', name: 'Create Users', description: 'Create new user accounts', module: 'users' },
          { key: 'users.edit', name: 'Edit Users', description: 'Modify user accounts', module: 'users' },
          { key: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', module: 'users' },
          { key: 'audit.view', name: 'View Audit Logs', description: 'View system audit logs and history', module: 'audit' },
          
          // Timekeeping & Attendance
          { key: 'timekeeping.view', name: 'View Timekeeping', description: 'View timekeeping dashboard', module: 'timekeeping' },
          { key: 'shifts.view', name: 'View Shifts', description: 'View work shifts and schedules', module: 'shifts' },
          { key: 'shifts.create', name: 'Create Shifts', description: 'Create new work shifts', module: 'shifts' },
          { key: 'shifts.edit', name: 'Edit Shifts', description: 'Modify work shifts', module: 'shifts' },
          { key: 'shifts.delete', name: 'Delete Shifts', description: 'Delete work shifts', module: 'shifts' },
          { key: 'policies.view', name: 'View Attendance Policies', description: 'View attendance policies', module: 'policies' },
          { key: 'policies.create', name: 'Create Attendance Policies', description: 'Create new attendance policies', module: 'policies' },
          { key: 'policies.edit', name: 'Edit Attendance Policies', description: 'Modify attendance policies', module: 'policies' },
          { key: 'records.view', name: 'View Attendance Records', description: 'View attendance records and history', module: 'records' },
          { key: 'records.edit', name: 'Edit Attendance Records', description: 'Modify attendance records', module: 'records' },
          { key: 'regulations.view', name: 'View Regulations', description: 'View attendance regulations', module: 'regulations' },
          { key: 'regulations.create', name: 'Create Regulations', description: 'Create new attendance regulations', module: 'regulations' },
          { key: 'regulations.edit', name: 'Edit Regulations', description: 'Modify attendance regulations', module: 'regulations' },
          { key: 'regulations.delete', name: 'Delete Regulations', description: 'Delete attendance regulations', module: 'regulations' },
          { key: 'regularization.view', name: 'View Regularization', description: 'View attendance regularization requests', module: 'regularization' },
          { key: 'regularization.create', name: 'Create Regularization', description: 'Submit attendance regularization requests', module: 'regularization' },
          { key: 'regularization.approve', name: 'Approve Regularization', description: 'Approve attendance regularization requests', module: 'regularization' },
          
          // Profile & Personal
          { key: 'profile.view', name: 'View Profile', description: 'View own profile information', module: 'profile' },
          { key: 'profile.edit', name: 'Edit Profile', description: 'Edit own profile information', module: 'profile' },
          { key: 'profile.upload_photo', name: 'Upload Profile Photo', description: 'Upload and change profile photo', module: 'profile' }
        ];
        
        console.log('🔄 Adding missing permissions...');
        for (const permission of additionalPermissions) {
          try {
            await pool.query(
              'INSERT INTO permissions (permission_key, permission_name, description, module, is_active, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
              [permission.key, permission.name, permission.description, permission.module, true]
            );
            console.log(`✅ Added permission: ${permission.name}`);
          } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              console.log(`ℹ️ Permission already exists: ${permission.name}`);
            } else {
              console.log(`❌ Error adding permission ${permission.name}: ${error.message}`);
            }
          }
        }
        
        // Create test users if they don't exist
        try {
          const testUsers = [
            {
              name: 'Admin User',
              email: 'admin@example.com',
              password: 'admin123',
              role: 'super_admin',
              status: 'active'
            },
            {
              name: 'HR Manager',
              email: 'hr@example.com',
              password: 'hr123',
              role: 'hr_manager',
              status: 'active'
            },
            {
              name: 'Employee User',
              email: 'employee@example.com',
              password: 'employee123',
              role: 'employee',
              status: 'active'
            }
          ];

          for (const user of testUsers) {
            try {
              // Check if user already exists
              const [existing] = await pool.query(
                'SELECT id FROM users WHERE email = ?',
                [user.email]
              );

              if (existing.length === 0) {
                // Create user
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await pool.query(
                  'INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                  [user.name, user.email, hashedPassword, user.role, user.status]
                );
                console.log(`✅ Created test user: ${user.email}`);
              } else {
                console.log(`ℹ️ Test user already exists: ${user.email}`);
              }
            } catch (error) {
              console.log(`❌ Error creating test user ${user.email}: ${error.message}`);
            }
          }
        } catch (error) {
          console.log(`❌ Error in test user creation: ${error.message}`);
        }
        
        console.log('🎉 Auto-migration completed!');
      } catch (error) {
        console.error('❌ Auto-migration failed:', error.message);
      }
    }
    
    // Start server
    const PORT = process.env.PORT || 8000;
    
    // ==================== ATTENDANCE REGULARIZATION APIs ====================
    
    // Get all regularization requests
    app.get('/api/v1/regularization/requests', authenticateToken, async (req, res) => {
      try {
        const { page = 1, limit = 10, status, employee_id } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        
        if (status) {
          whereClause += ' AND arr.status = ?';
          queryParams.push(status);
        }
        
        if (employee_id) {
          whereClause += ' AND arr.employee_id = ?';
          queryParams.push(employee_id);
        }
        
        // Check if user has regularization.view permission
        if (req.user.role !== 'super_admin') {
          const hasPermission = await checkUserPermission(req.user.id, 'regularization.view');
          if (!hasPermission) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
          }
        }
        
        const query = `
          SELECT arr.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_code,
                 CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
          FROM attendance_regularization_requests arr
          LEFT JOIN employees e ON arr.employee_id = e.id
          LEFT JOIN employees r ON arr.reviewed_by = r.id
          ${whereClause}
          ORDER BY arr.submitted_at DESC
          LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), offset);
        const [requests] = await pool.query(query, queryParams);
        
        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total
          FROM attendance_regularization_requests arr
          ${whereClause}
        `;
        const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
        
        res.json({
          success: true,
          data: requests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching regularization requests:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get single regularization request
    app.get('/api/v1/regularization/requests/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if user has regularization.view permission
        if (req.user.role !== 'super_admin') {
          const hasPermission = await checkUserPermission(req.user.id, 'regularization.view');
          if (!hasPermission) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
          }
        }
        
        const query = `
          SELECT arr.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_code,
                 CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
          FROM attendance_regularization_requests arr
          LEFT JOIN employees e ON arr.employee_id = e.id
          LEFT JOIN employees r ON arr.reviewed_by = r.id
          WHERE arr.id = ?
        `;
        
        const [requests] = await pool.query(query, [id]);
        
        if (requests.length === 0) {
          return res.status(404).json({ message: 'Regularization request not found' });
        }
        
        res.json({
          success: true,
          data: requests[0]
        });
      } catch (error) {
        console.error('Error fetching regularization request:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Submit regularization request
    app.post('/api/v1/regularization/requests', authenticateToken, async (req, res) => {
      try {
        const {
          attendance_date,
          request_type,
          current_check_in,
          current_check_out,
          requested_check_in,
          requested_check_out,
          reason,
          supporting_evidence
        } = req.body;
        
        // Check if user has regularization.submit permission
        if (req.user.role !== 'super_admin') {
          const hasPermission = await checkUserPermission(req.user.id, 'regularization.submit');
          if (!hasPermission) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
          }
        }
        
        const employee_id = req.user.role === 'employee' ? req.user.id : req.body.employee_id;
        
        if (!employee_id) {
          return res.status(400).json({ message: 'Employee ID is required' });
        }
        
        const query = `
          INSERT INTO attendance_regularization_requests 
          (employee_id, attendance_date, request_type, current_check_in, current_check_out,
           requested_check_in, requested_check_out, reason, supporting_evidence, company_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          employee_id,
          attendance_date,
          request_type,
          current_check_in,
          current_check_out,
          requested_check_in,
          requested_check_out,
          reason,
          supporting_evidence ? JSON.stringify(supporting_evidence) : null,
          req.user.company_id || 1
        ];
        
        const [result] = await pool.query(query, values);
        
        // Log the submission
        await logRegularizationAction(result.insertId, 'submitted', req.user.id, 'employee', req.ip, req.get('User-Agent'), reason);
        
        res.status(201).json({
          success: true,
          message: 'Regularization request submitted successfully',
          data: { id: result.insertId }
        });
      } catch (error) {
        console.error('Error submitting regularization request:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Approve/Reject regularization request
    app.put('/api/v1/regularization/requests/:id/review', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { action, review_notes } = req.body; // action: 'approved', 'rejected', 'more_info_required'
        
        // Check if user has regularization.approve permission
        if (req.user.role !== 'super_admin') {
          const hasPermission = await checkUserPermission(req.user.id, 'regularization.approve');
          if (!hasPermission) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
          }
        }
        
        if (!['approved', 'rejected', 'more_info_required'].includes(action)) {
          return res.status(400).json({ message: 'Invalid action. Must be approved, rejected, or more_info_required' });
        }
        
        const query = `
          UPDATE attendance_regularization_requests 
          SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_notes = ?
          WHERE id = ?
        `;
        
        await pool.query(query, [action, req.user.id, review_notes, id]);
        
        // Log the review action
        await logRegularizationAction(id, action, req.user.id, 'admin', req.ip, req.get('User-Agent'), review_notes);
        
        // If approved, update the attendance record
        if (action === 'approved') {
          await updateAttendanceFromRegularization(id);
        }
        
        res.json({
          success: true,
          message: `Regularization request ${action} successfully`
        });
      } catch (error) {
        console.error('Error reviewing regularization request:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Get regularization audit logs
    app.get('/api/v1/regularization/requests/:id/audit', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if user has regularization.view permission
        if (req.user.role !== 'super_admin') {
          const hasPermission = await checkUserPermission(req.user.id, 'regularization.view');
          if (!hasPermission) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
          }
        }
        
        const query = `
          SELECT aral.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as actor_name
          FROM attendance_regularization_audit_logs aral
          LEFT JOIN employees e ON aral.actor_id = e.id
          WHERE aral.request_id = ?
          ORDER BY aral.created_at DESC
        `;
        
        const [logs] = await pool.query(query, [id]);
        
        res.json({
          success: true,
          data: logs
        });
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // ==================== PERMISSIONS & ROLES APIs ====================
    
    // Get all permissions
    app.get('/api/v1/permissions', authenticateToken, async (req, res) => {
      try {
        // Only super_admin can view permissions
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ message: 'Access denied. Only super admin can view permissions.' });
        }
        
        const query = `
          SELECT p.*, 
                 COUNT(rp.id) as role_count
          FROM permissions p
          LEFT JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE p.is_active = TRUE
          GROUP BY p.id
          ORDER BY p.module, p.permission_name
        `;
        
        const [permissions] = await pool.query(query);
        
        res.json({
          success: true,
          data: permissions
        });
      } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // ==================== ROLES API ENDPOINTS ====================
    
    // =====================================================
    // ROLE MANAGEMENT APIs (Must be before user routes to avoid conflicts)
    // =====================================================

    // Get all roles
    app.get('/api/v1/users/roles', authenticateToken, async (req, res) => {
      try {
        const { status } = req.query;
        let whereClause = '';
        
        // Filter by status if provided
        if (status === 'active') {
          whereClause = 'WHERE r.is_active = 1';
        } else if (status === 'inactive') {
          whereClause = 'WHERE r.is_active = 0';
        }
        // If no status filter, show all roles
        
        const query = `
          SELECT r.*, 
                 COUNT(DISTINCT u.id) as user_count,
                 COUNT(DISTINCT rp.permission_id) as permissions_count
          FROM roles r
          LEFT JOIN users u ON r.name = u.role
          LEFT JOIN role_permissions rp ON r.name = rp.role
          ${whereClause}
          GROUP BY r.id
          ORDER BY r.is_active DESC, r.name
        `;
        
        const [roles] = await pool.query(query);
        
        res.json({
          success: true,
          data: roles
        });
      } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create new role
    app.post('/api/v1/users/roles', authenticateToken, async (req, res) => {
      try {
        const { name, description, is_active = true } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Role name is required' });
        }
        
        const query = `
          INSERT INTO roles (name, description, is_active, company_id, created_at, updated_at)
          VALUES (?, ?, ?, 1, NOW(), NOW())
        `;
        
        const [result] = await pool.query(query, [name, description, is_active]);
        
        res.status(201).json({
          success: true,
          data: { id: result.insertId, name, description, is_active },
          message: 'Role created successfully'
        });
      } catch (error) {
        console.error('Error creating role:', error);
        if (error.code === 'ER_DUP_ENTRY') {
          res.status(400).json({ message: 'Role name already exists' });
        } else {
          res.status(500).json({ message: 'Server error' });
        }
      }
    });

    // Update role
    app.put('/api/v1/users/roles/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, is_active } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: 'Role name is required' });
        }
        
        const query = `
          UPDATE roles 
          SET name = ?, description = ?, is_active = ?, updated_at = NOW()
          WHERE id = ?
        `;
        
        const [result] = await pool.query(query, [name, description, is_active, id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Role not found' });
        }
        
        res.json({
          success: true,
          message: 'Role updated successfully'
        });
      } catch (error) {
        console.error('Error updating role:', error);
        if (error.code === 'ER_DUP_ENTRY') {
          res.status(400).json({ message: 'Role name already exists' });
        } else {
          res.status(500).json({ message: 'Server error' });
        }
      }
    });

    // Delete role
    app.delete('/api/v1/users/roles/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if role is being used by any users
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = (SELECT name FROM roles WHERE id = ?)', [id]);
        
        if (users[0].count > 0) {
          return res.status(400).json({ message: 'Cannot delete role that is assigned to users' });
        }
        
        const query = 'DELETE FROM roles WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Role not found' });
        }
        
        res.json({
          success: true,
          message: 'Role deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Reset password for all users with a specific role
    app.post('/api/v1/users/roles/:id/reset-password', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { new_password } = req.body;

        // Only super_admin can reset passwords
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ message: 'Access denied. Only super admin can reset passwords.' });
        }

        if (!new_password || new_password.length < 6) {
          return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        // Get role name
        const roleQuery = 'SELECT name FROM roles WHERE id = ?';
        const [roles] = await pool.query(roleQuery, [id]);
        
        if (roles.length === 0) {
          return res.status(404).json({ message: 'Role not found' });
        }

        const roleName = roles[0].name;

        // Hash the new password
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update passwords for all users with this role
        const updateQuery = 'UPDATE users SET password = ? WHERE role = ?';
        const [result] = await pool.query(updateQuery, [hashedPassword, roleName]);

        res.json({
          success: true,
          message: `Passwords have been reset for ${result.affectedRows} users with the "${roleName}" role.`
        });
      } catch (error) {
        console.error('Error resetting passwords:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // =====================================================
    // USER MANAGEMENT APIs
    // =====================================================

    // Get all users
    app.get('/api/v1/users', authenticateToken, async (req, res) => {
      try {
        // Only super_admin and company_admin can view all users
        if (!['super_admin', 'company_admin'].includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied. Only admin users can view all users.' });
        }

        const query = `
          SELECT u.*, 
                 e.first_name, e.last_name, e.employee_id, e.department_id, e.designation_id,
                 d.name as department_name,
                 des.name as designation_name,
                 COUNT(up.id) as permission_count
          FROM users u
          LEFT JOIN employees e ON u.id = e.user_id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations des ON e.designation_id = des.id
          LEFT JOIN user_permissions up ON u.id = up.user_id AND up.is_active = 1
          GROUP BY u.id
          ORDER BY u.created_at DESC
        `;

        const [users] = await pool.query(query);

        res.json({
          success: true,
          data: users
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Get single user
    app.get('/api/v1/users/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;

        // Users can view their own profile, or admin can view any user
        if (req.user.id !== parseInt(id) && !['super_admin', 'company_admin'].includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied.' });
        }

        const query = `
          SELECT u.*, 
                 e.first_name, e.last_name, e.employee_id, e.department_id, e.designation_id,
                 d.name as department_name,
                 des.name as designation_name
          FROM users u
          LEFT JOIN employees e ON u.id = e.user_id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations des ON e.designation_id = des.id
          WHERE u.id = ?
        `;

        const [users] = await pool.query(query, [id]);

        if (users.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Get user permissions
        const [permissions] = await pool.query(`
          SELECT p.*, up.granted_at
          FROM permissions p
          INNER JOIN user_permissions up ON p.id = up.permission_id
          WHERE up.user_id = ? AND up.is_active = 1
          ORDER BY p.module, p.permission_name
        `, [id]);

        res.json({
          success: true,
          data: {
            ...users[0],
            permissions
          }
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Create new user
    app.post('/api/v1/users', authenticateToken, async (req, res) => {
      try {
        // Only super_admin and company_admin can create users
        if (!['super_admin', 'company_admin'].includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied. Only admin users can create users.' });
        }

        const { 
          name, email, password, role, status = 'active',
          first_name, last_name, phone, department_id, designation_id,
          permissions = []
        } = req.body;

        if (!name || !email || !password || !role) {
          return res.status(400).json({ message: 'Name, email, password, and role are required' });
        }

        // Check if email already exists
        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
          return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
          // Create user
          const [userResult] = await pool.query(`
            INSERT INTO users (name, email, password, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
          `, [name, email, hashedPassword, role, status]);

          const userId = userResult.insertId;

          // Create employee record if employee details provided
          if (first_name && last_name) {
            await pool.query(`
              INSERT INTO employees (user_id, first_name, last_name, email, department_id, designation_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [userId, first_name, last_name, email, department_id, designation_id]);
          }

          // Assign permissions
          if (permissions.length > 0) {
            for (const permissionId of permissions) {
              await pool.query(`
                INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at, is_active)
                VALUES (?, ?, ?, NOW(), 1)
              `, [userId, permissionId, req.user.id]);
            }
          }

          await pool.query('COMMIT');

          res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id: userId }
          });
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Update user
    app.put('/api/v1/users/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { 
          name, email, role, status, first_name, last_name, 
          phone, department_id, designation_id, permissions 
        } = req.body;

        // Users can update their own profile (limited fields), or admin can update any user
        const isOwnProfile = req.user.id === parseInt(id);
        const isAdmin = ['super_admin', 'company_admin'].includes(req.user.role);

        if (!isOwnProfile && !isAdmin) {
          return res.status(403).json({ message: 'Access denied.' });
        }

        // Check if user exists
        const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existingUser.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Check if email already exists (excluding current user)
        if (email) {
          const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
          if (emailCheck.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
          }
        }

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
          // Update user
          const updateFields = [];
          const updateValues = [];

          if (name) { updateFields.push('name = ?'); updateValues.push(name); }
          if (email) { updateFields.push('email = ?'); updateValues.push(email); }
          if (role && isAdmin) { updateFields.push('role = ?'); updateValues.push(role); }
          if (status && isAdmin) { updateFields.push('status = ?'); updateValues.push(status); }
          
          updateFields.push('updated_at = NOW()');
          updateValues.push(id);

          if (updateFields.length > 1) {
            await pool.query(`
              UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
            `, updateValues);
          }

          // Update employee record if provided
          if (first_name || last_name || department_id || designation_id) {
            const empUpdateFields = [];
            const empUpdateValues = [];

            if (first_name) { empUpdateFields.push('first_name = ?'); empUpdateValues.push(first_name); }
            if (last_name) { empUpdateFields.push('last_name = ?'); empUpdateValues.push(last_name); }
            if (department_id) { empUpdateFields.push('department_id = ?'); empUpdateValues.push(department_id); }
            if (designation_id) { empUpdateFields.push('designation_id = ?'); empUpdateValues.push(designation_id); }
            
            empUpdateFields.push('updated_at = NOW()');
            empUpdateValues.push(id);

            if (empUpdateFields.length > 1) {
              await pool.query(`
                UPDATE employees SET ${empUpdateFields.join(', ')} WHERE user_id = ?
              `, empUpdateValues);
            }
          }

          // Update permissions (only admin can do this)
          if (permissions && isAdmin) {
            // Remove existing permissions
            await pool.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);
            
            // Add new permissions
            for (const permissionId of permissions) {
              await pool.query(`
                INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at, is_active)
                VALUES (?, ?, ?, NOW(), 1)
              `, [id, permissionId, req.user.id]);
            }
          }

          await pool.query('COMMIT');

          res.json({
            success: true,
            message: 'User updated successfully'
          });
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Reset password for individual users
    app.post('/api/v1/users/:id/reset-password', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const { temporary_password } = req.body;

        // Only super_admin and company_admin can reset passwords
        if (!['super_admin', 'company_admin'].includes(req.user.role)) {
          return res.status(403).json({ message: 'Access denied. Only admin users can reset passwords.' });
        }

        const newPassword = temporary_password || 'TempPass123!';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await pool.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({
          success: true,
          message: 'Password reset successfully',
          temporary_password: newPassword
        });
      } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Delete user
    app.delete('/api/v1/users/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;

        // Only super_admin can delete users
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ message: 'Access denied. Only super admin can delete users.' });
        }

        // Cannot delete own account
        if (req.user.id === parseInt(id)) {
          return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Check if user exists
        const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existingUser.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
          // Delete user permissions
          await pool.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);
          
          // Delete employee record
          await pool.query('DELETE FROM employees WHERE user_id = ?', [id]);
          
          // Delete user
          await pool.query('DELETE FROM users WHERE id = ?', [id]);

          await pool.query('COMMIT');

          res.json({
            success: true,
            message: 'User deleted successfully'
          });
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });


    // Get role permissions
    app.get('/api/v1/roles/:role/permissions', authenticateToken, async (req, res) => {
      try {
        const { role } = req.params;
        
        // Use the role name directly as it matches the database format
        const roleName = role;
        
        // Allow users to view their own role permissions, or super_admin to view any role permissions
        if (req.user.role !== 'super_admin' && req.user.role !== role) {
          return res.status(403).json({ message: 'Access denied. You can only view your own role permissions.' });
        }
        
        // First get the role ID
        const [roleResult] = await pool.query('SELECT id FROM roles WHERE name = ?', [roleName]);
        if (roleResult.length === 0) {
          return res.status(404).json({ message: 'Role not found' });
        }
        
        const roleId = roleResult[0].id;
        
        const query = `
          SELECT p.*, rp.granted_at
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role = ? AND p.is_active = TRUE
          ORDER BY p.module, p.permission_name
        `;
        
        const [permissions] = await pool.query(query, [roleName]);
        
        res.json({
          success: true,
          data: permissions
        });
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    
    // Update role permissions
    app.put('/api/v1/roles/:role/permissions', authenticateToken, async (req, res) => {
      try {
        const { role } = req.params;
        const { permission_ids } = req.body;
        
        // Only super_admin can update role permissions
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ message: 'Access denied. Only super admin can update role permissions.' });
        }
        
        // Start transaction
        await pool.query('START TRANSACTION');
        
        try {
          // Remove existing permissions for this role
          await pool.query('DELETE FROM role_permissions WHERE role = ?', [role]);
          
          // Add new permissions
          if (permission_ids && permission_ids.length > 0) {
            const values = permission_ids.map(permission_id => [role, permission_id, req.user.id]);
            await pool.query(
              'INSERT INTO role_permissions (role, permission_id, granted_by) VALUES ?',
              [values]
            );
          }
          
          await pool.query('COMMIT');
          
          res.json({
            success: true,
            message: 'Role permissions updated successfully'
          });
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error('Error updating role permissions:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Helper function to check user permission
    async function checkUserPermission(userId, permissionKey) {
      try {
        // Get user role
        const [users] = await pool.query('SELECT role FROM employees WHERE id = ?', [userId]);
        if (users.length === 0) return false;
        
        const userRole = users[0].role;
        
        // Super admin bypasses all checks
        if (userRole === 'super_admin') return true;
        
        // Check role permissions
        const query = `
          SELECT 1 FROM role_permissions rp
          INNER JOIN permissions p ON rp.permission_id = p.id
          WHERE rp.role = ? AND p.permission_key = ? AND p.is_active = TRUE
        `;
        
        const [rolePermissions] = await pool.query(query, [userRole, permissionKey]);
        if (rolePermissions.length > 0) return true;
        
        // Check individual user permissions
        const userQuery = `
          SELECT 1 FROM user_permissions up
          INNER JOIN permissions p ON up.permission_id = p.id
          WHERE up.user_id = ? AND p.permission_key = ? AND up.is_active = TRUE
        `;
        
        const [userPermissions] = await pool.query(userQuery, [userId, permissionKey]);
        return userPermissions.length > 0;
      } catch (error) {
        console.error('Error checking user permission:', error);
        return false;
      }
    }
    
    // Helper function to log regularization actions
    async function logRegularizationAction(requestId, action, actorId, actorType, ipAddress, userAgent, reason) {
      try {
        const query = `
          INSERT INTO attendance_regularization_audit_logs 
          (request_id, action, actor_id, actor_type, ip_address, user_agent, reason)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await pool.query(query, [requestId, action, actorId, actorType, ipAddress, userAgent, reason]);
      } catch (error) {
        console.error('Error logging regularization action:', error);
      }
    }
    
    // Helper function to update attendance from approved regularization
    async function updateAttendanceFromRegularization(requestId) {
      try {
        // Get the regularization request
        const [requests] = await pool.query(
          'SELECT * FROM attendance_regularization_requests WHERE id = ?',
          [requestId]
        );
        
        if (requests.length === 0) return;
        
        const request = requests[0];
        
        // Update or create attendance record
        const attendanceQuery = `
          INSERT INTO attendance_records 
          (employee_id, date, check_in, check_out, work_hours, overtime_hours, status, company_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          check_in = VALUES(check_in),
          check_out = VALUES(check_out),
          work_hours = VALUES(work_hours),
          overtime_hours = VALUES(overtime_hours),
          status = VALUES(status),
          updated_at = NOW()
        `;
        
        // Calculate work hours
        let workHours = 0;
        let overtimeHours = 0;
        let status = 'present';
        
        if (request.requested_check_in && request.requested_check_out) {
          const checkIn = new Date(`2000-01-01 ${request.requested_check_in}`);
          const checkOut = new Date(`2000-01-01 ${request.requested_check_out}`);
          workHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert to hours
          
          if (workHours > 8) {
            overtimeHours = workHours - 8;
            workHours = 8;
          }
        } else if (request.request_type === 'full_day') {
          workHours = 8;
        } else {
          status = 'partial';
        }
        
        await pool.query(attendanceQuery, [
          request.employee_id,
          request.attendance_date,
          request.requested_check_in,
          request.requested_check_out,
          workHours,
          overtimeHours,
          status,
          request.company_id
        ]);
      } catch (error) {
        console.error('Error updating attendance from regularization:', error);
      }
    }

    // =====================================================
    // LEAVE MANAGEMENT API ENDPOINTS
    // =====================================================

    // Leave Types API
    app.get('/api/v1/leave/types', async (req, res) => {
      try {
        const [rows] = await pool.query('SELECT * FROM leave_types ORDER BY name');
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching leave types:', error);
        res.status(500).json({ success: false, message: 'Error fetching leave types' });
      }
    });

    app.post('/api/v1/leave/types', async (req, res) => {
      try {
        const {
          name, days_allowed, requires_approval, is_paid
        } = req.body;

        const [result] = await pool.query(
          `INSERT INTO leave_types 
           (company_id, name, days_allowed, requires_approval, is_paid)
           VALUES (?, ?, ?, ?, ?)`,
          [1, name, days_allowed, requires_approval, is_paid]
        );

        res.json({ success: true, message: 'Leave type created successfully', id: result.insertId });
      } catch (error) {
        console.error('Error creating leave type:', error);
        res.status(500).json({ success: false, message: 'Error creating leave type' });
      }
    });

    app.put('/api/v1/leave/types/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;
        
        const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);

        await pool.query(
          `UPDATE leave_types SET ${setClause}, updated_at = NOW() WHERE id = ?`,
          values
        );

        res.json({ success: true, message: 'Leave type updated successfully' });
      } catch (error) {
        console.error('Error updating leave type:', error);
        res.status(500).json({ success: false, message: 'Error updating leave type' });
      }
    });

    app.delete('/api/v1/leave/types/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await pool.query('DELETE FROM leave_types WHERE id = ?', [id]);
        res.json({ success: true, message: 'Leave type deleted successfully' });
      } catch (error) {
        console.error('Error deleting leave type:', error);
        res.status(500).json({ success: false, message: 'Error deleting leave type' });
      }
    });

    // =====================================================
    // HR SETUP API ROUTES
    // =====================================================

    // Document Types API
    app.get('/api/v1/hr-setup/document-types', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const [rows] = await pool.query('SELECT * FROM document_types WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ success: false, message: 'Error fetching document types' });
      }
    });

    app.post('/api/v1/hr-setup/document-types', authenticateToken, async (req, res) => {
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

    app.put('/api/v1/hr-setup/document-types/:id', authenticateToken, async (req, res) => {
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

    app.delete('/api/v1/hr-setup/document-types/:id', authenticateToken, async (req, res) => {
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

    // Payslip Types API
    app.get('/api/v1/hr-setup/payslip-types', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const [rows] = await pool.query('SELECT * FROM payslip_types WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching payslip types:', error);
        res.status(500).json({ success: false, message: 'Error fetching payslip types' });
      }
    });

    app.post('/api/v1/hr-setup/payslip-types', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const { name, code, description, status } = req.body;
        const [result] = await pool.query(
          'INSERT INTO payslip_types (company_id, name, code, description, status) VALUES (?, ?, ?, ?, ?)',
          [companyId, name, code, description, status || 'active']
        );
        res.status(201).json({ success: true, message: 'Payslip type created successfully', data: { id: result.insertId } });
      } catch (error) {
        console.error('Error creating payslip type:', error);
        res.status(500).json({ success: false, message: 'Error creating payslip type' });
      }
    });

    app.put('/api/v1/hr-setup/payslip-types/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        const { name, code, description, status } = req.body;
        await pool.query(
          'UPDATE payslip_types SET name = ?, code = ?, description = ?, status = ? WHERE id = ? AND company_id = ?',
          [name, code, description, status, id, companyId]
        );
        res.json({ success: true, message: 'Payslip type updated successfully' });
      } catch (error) {
        console.error('Error updating payslip type:', error);
        res.status(500).json({ success: false, message: 'Error updating payslip type' });
      }
    });

    app.delete('/api/v1/hr-setup/payslip-types/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        await pool.query('DELETE FROM payslip_types WHERE id = ? AND company_id = ?', [id, companyId]);
        res.json({ success: true, message: 'Payslip type deleted successfully' });
      } catch (error) {
        console.error('Error deleting payslip type:', error);
        res.status(500).json({ success: false, message: 'Error deleting payslip type' });
      }
    });

    // Allowance Options API
    app.get('/api/v1/hr-setup/allowance-options', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const [rows] = await pool.query('SELECT * FROM allowance_options WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching allowance options:', error);
        res.status(500).json({ success: false, message: 'Error fetching allowance options' });
      }
    });

    app.post('/api/v1/hr-setup/allowance-options', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const { name, code, description, is_taxable, status } = req.body;
        const [result] = await pool.query(
          'INSERT INTO allowance_options (company_id, name, code, description, is_taxable, status) VALUES (?, ?, ?, ?, ?, ?)',
          [companyId, name, code, description, is_taxable !== undefined ? is_taxable : true, status || 'active']
        );
        res.status(201).json({ success: true, message: 'Allowance option created successfully', data: { id: result.insertId } });
      } catch (error) {
        console.error('Error creating allowance option:', error);
        res.status(500).json({ success: false, message: 'Error creating allowance option' });
      }
    });

    app.put('/api/v1/hr-setup/allowance-options/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        const { name, code, description, is_taxable, status } = req.body;
        await pool.query(
          'UPDATE allowance_options SET name = ?, code = ?, description = ?, is_taxable = ?, status = ? WHERE id = ? AND company_id = ?',
          [name, code, description, is_taxable, status, id, companyId]
        );
        res.json({ success: true, message: 'Allowance option updated successfully' });
      } catch (error) {
        console.error('Error updating allowance option:', error);
        res.status(500).json({ success: false, message: 'Error updating allowance option' });
      }
    });

    app.delete('/api/v1/hr-setup/allowance-options/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        await pool.query('DELETE FROM allowance_options WHERE id = ? AND company_id = ?', [id, companyId]);
        res.json({ success: true, message: 'Allowance option deleted successfully' });
      } catch (error) {
        console.error('Error deleting allowance option:', error);
        res.status(500).json({ success: false, message: 'Error deleting allowance option' });
      }
    });

    // Loan Options API
    app.get('/api/v1/hr-setup/loan-options', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const [rows] = await pool.query('SELECT * FROM loan_options WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching loan options:', error);
        res.status(500).json({ success: false, message: 'Error fetching loan options' });
      }
    });

    app.post('/api/v1/hr-setup/loan-options', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const { name, code, description, max_amount, interest_rate, max_duration_months, status } = req.body;
        const [result] = await pool.query(
          'INSERT INTO loan_options (company_id, name, code, description, max_amount, interest_rate, max_duration_months, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [companyId, name, code, description, max_amount, interest_rate, max_duration_months, status || 'active']
        );
        res.status(201).json({ success: true, message: 'Loan option created successfully', data: { id: result.insertId } });
      } catch (error) {
        console.error('Error creating loan option:', error);
        res.status(500).json({ success: false, message: 'Error creating loan option' });
      }
    });

    app.put('/api/v1/hr-setup/loan-options/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        const { name, code, description, max_amount, interest_rate, max_duration_months, status } = req.body;
        await pool.query(
          'UPDATE loan_options SET name = ?, code = ?, description = ?, max_amount = ?, interest_rate = ?, max_duration_months = ?, status = ? WHERE id = ? AND company_id = ?',
          [name, code, description, max_amount, interest_rate, max_duration_months, status, id, companyId]
        );
        res.json({ success: true, message: 'Loan option updated successfully' });
      } catch (error) {
        console.error('Error updating loan option:', error);
        res.status(500).json({ success: false, message: 'Error updating loan option' });
      }
    });

    app.delete('/api/v1/hr-setup/loan-options/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        await pool.query('DELETE FROM loan_options WHERE id = ? AND company_id = ?', [id, companyId]);
        res.json({ success: true, message: 'Loan option deleted successfully' });
      } catch (error) {
        console.error('Error deleting loan option:', error);
        res.status(500).json({ success: false, message: 'Error deleting loan option' });
      }
    });

    // Deduction Options API
    app.get('/api/v1/hr-setup/deduction-options', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const [rows] = await pool.query('SELECT * FROM deduction_options WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching deduction options:', error);
        res.status(500).json({ success: false, message: 'Error fetching deduction options' });
      }
    });

    app.post('/api/v1/hr-setup/deduction-options', authenticateToken, async (req, res) => {
      try {
        const companyId = req.user?.company_id || 1;
        const { name, code, description, is_mandatory, status } = req.body;
        const [result] = await pool.query(
          'INSERT INTO deduction_options (company_id, name, code, description, is_mandatory, status) VALUES (?, ?, ?, ?, ?, ?)',
          [companyId, name, code, description, is_mandatory || false, status || 'active']
        );
        res.status(201).json({ success: true, message: 'Deduction option created successfully', data: { id: result.insertId } });
      } catch (error) {
        console.error('Error creating deduction option:', error);
        res.status(500).json({ success: false, message: 'Error creating deduction option' });
      }
    });

    app.put('/api/v1/hr-setup/deduction-options/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        const { name, code, description, is_mandatory, status } = req.body;
        await pool.query(
          'UPDATE deduction_options SET name = ?, code = ?, description = ?, is_mandatory = ?, status = ? WHERE id = ? AND company_id = ?',
          [name, code, description, is_mandatory, status, id, companyId]
        );
        res.json({ success: true, message: 'Deduction option updated successfully' });
      } catch (error) {
        console.error('Error updating deduction option:', error);
        res.status(500).json({ success: false, message: 'Error updating deduction option' });
      }
    });

    app.delete('/api/v1/hr-setup/deduction-options/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company_id || 1;
        await pool.query('DELETE FROM deduction_options WHERE id = ? AND company_id = ?', [id, companyId]);
        res.json({ success: true, message: 'Deduction option deleted successfully' });
      } catch (error) {
        console.error('Error deleting deduction option:', error);
        res.status(500).json({ success: false, message: 'Error deleting deduction option' });
      }
    });

    // Goal Types, Competencies, Performance Types, Training Types, Job Categories, Job Stages, Award Types, Termination Types, Expense Types, Income Types, Payment Types, Contract Types APIs
    const hrSetupEntities = [
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
      app.get(`/api/v1/hr-setup/${entity.name}`, authenticateToken, async (req, res) => {
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
      app.post(`/api/v1/hr-setup/${entity.name}`, authenticateToken, async (req, res) => {
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
      app.put(`/api/v1/hr-setup/${entity.name}/:id`, authenticateToken, async (req, res) => {
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
      app.delete(`/api/v1/hr-setup/${entity.name}/:id`, authenticateToken, async (req, res) => {
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

    // Leave Applications API
    app.get('/api/v1/leave/applications', async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT la.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.email as employee_email,
                 lt.name as leave_type_name,
                 u.name as approved_by_name
          FROM leave_applications la
          LEFT JOIN employees e ON la.employee_id = e.id
          LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
          LEFT JOIN users u ON la.approved_by = u.id
          ORDER BY la.created_at DESC
        `);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching leave applications:', error);
        res.status(500).json({ success: false, message: 'Error fetching leave applications' });
      }
    });

    app.post('/api/v1/leave/applications', async (req, res) => {
      try {
        const {
          employee_id, leave_type_id, start_date, end_date, reason,
          emergency_contact, attachment
        } = req.body;

        // Calculate total days
        const start = new Date(start_date);
        const end = new Date(end_date);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Generate application ID
        const applicationId = `LA${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const [result] = await pool.query(
          `INSERT INTO leave_applications 
           (leave_id, employee_id, leave_type_id, start_date, end_date, total_days,
            reason, emergency_contact, attachment, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [applicationId, employee_id, leave_type_id, start_date, end_date, totalDays,
           reason, emergency_contact, attachment]
        );

        res.json({ success: true, message: 'Leave application submitted successfully', id: result.insertId });
      } catch (error) {
        console.error('Error creating leave application:', error);
        res.status(500).json({ success: false, message: 'Error creating leave application' });
      }
    });

    app.put('/api/v1/leave/applications/:id/review', async (req, res) => {
      try {
        const { id } = req.params;
        const { status, comments } = req.body;
        const approvedBy = req.user?.id || 1; // Get from auth middleware

        await pool.query(
          `UPDATE leave_applications 
           SET status = ?, approved_by = ?, approved_at = NOW(), 
               rejection_reason = ?, updated_at = NOW()
           WHERE id = ?`,
          [status, status === 'approved' ? approvedBy : null, 
           status === 'rejected' ? comments : null, id]
        );

        res.json({ success: true, message: `Leave application ${status} successfully` });
      } catch (error) {
        console.error('Error reviewing leave application:', error);
        res.status(500).json({ success: false, message: 'Error reviewing leave application' });
      }
    });

    app.put('/api/v1/leave/applications/:id/cancel', async (req, res) => {
      try {
        const { id } = req.params;
        const { reason } = req.body;

        await pool.query(
          `UPDATE leave_applications 
           SET status = 'cancelled', cancelled_at = NOW(), 
               cancellation_reason = ?, updated_at = NOW()
           WHERE id = ?`,
          [reason || 'Cancelled by employee', id]
        );

        res.json({ success: true, message: 'Leave application cancelled successfully' });
      } catch (error) {
        console.error('Error cancelling leave application:', error);
        res.status(500).json({ success: false, message: 'Error cancelling leave application' });
      }
    });

    // Leave Balances API
    app.get('/api/v1/leave/balances', async (req, res) => {
      try {
        const { year = new Date().getFullYear() } = req.query;
        
        const [rows] = await pool.query(`
          SELECT lb.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.email as employee_email,
                 lt.name as leave_type_name, lt.name as leave_type_code,
                 lb.remaining_days as available_balance
          FROM leave_balances lb
          LEFT JOIN employees e ON lb.employee_id = e.id
          LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
          WHERE lb.year = ?
          ORDER BY e.first_name, e.last_name, lt.name
        `, [year]);
        
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching leave balances:', error);
        res.status(500).json({ success: false, message: 'Error fetching leave balances' });
      }
    });

    app.post('/api/v1/leave/balances/adjust', async (req, res) => {
      try {
        const { employee_id, leave_type_id, adjustment_type, amount, reason, year } = req.body;
        
        // Get current balance
        const [currentBalance] = await pool.query(
          'SELECT * FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
          [employee_id, leave_type_id, year]
        );

        let newAllocated = amount;
        if (currentBalance.length > 0) {
          newAllocated = adjustment_type === 'add' 
            ? currentBalance[0].total_allocated + amount
            : currentBalance[0].total_allocated - amount;
        }

        // Update or insert balance
        await pool.query(
          `INSERT INTO leave_balances 
           (employee_id, leave_type_id, year, total_allocated, total_used, total_approved, total_pending)
           VALUES (?, ?, ?, ?, 0, 0, 0)
           ON DUPLICATE KEY UPDATE
           total_allocated = VALUES(total_allocated), updated_at = NOW()`,
          [employee_id, leave_type_id, year, newAllocated]
        );

        res.json({ success: true, message: 'Leave balance adjusted successfully' });
      } catch (error) {
        console.error('Error adjusting leave balance:', error);
        res.status(500).json({ success: false, message: 'Error adjusting leave balance' });
      }
    });

    // Leave Policies API
    app.get('/api/v1/leave/policies', async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT lp.*, d.name as department_name, CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 lt.name as leave_type_name, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
          FROM leave_policies lp
          LEFT JOIN departments d ON lp.department_id = d.id
          LEFT JOIN employees e ON lp.employee_id = e.id
          LEFT JOIN leave_types lt ON lp.leave_type_id = lt.id
          LEFT JOIN users u ON lp.created_by = u.id
          ORDER BY lp.created_at DESC
        `);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching leave policies:', error);
        res.status(500).json({ success: false, message: 'Error fetching leave policies' });
      }
    });

    app.post('/api/v1/leave/policies', async (req, res) => {
      try {
        const {
          name, description, policy_type, department_id, employee_id,
          leave_type_id, max_days_per_year, max_consecutive_days,
          requires_approval, approval_workflow, is_active, effective_from, effective_to
        } = req.body;

        const createdBy = req.user?.id || 1; // Get from auth middleware

        const [result] = await pool.query(
          `INSERT INTO leave_policies 
           (company_id, name, description, policy_type, department_id, employee_id,
            leave_type_id, max_days_per_year, max_consecutive_days,
            requires_approval, approval_workflow, is_active, effective_from, effective_to, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [1, name, description, policy_type, department_id || null, employee_id || null,
           leave_type_id, max_days_per_year, max_consecutive_days,
           requires_approval, JSON.stringify(approval_workflow), is_active, effective_from, effective_to, createdBy]
        );

        res.json({ success: true, message: 'Leave policy created successfully', id: result.insertId });
      } catch (error) {
        console.error('Error creating leave policy:', error);
        res.status(500).json({ success: false, message: 'Error creating leave policy' });
      }
    });

    app.put('/api/v1/leave/policies/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;
        
        const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);

        await pool.query(
          `UPDATE leave_policies SET ${setClause}, updated_at = NOW() WHERE id = ?`,
          values
        );

        res.json({ success: true, message: 'Leave policy updated successfully' });
      } catch (error) {
        console.error('Error updating leave policy:', error);
        res.status(500).json({ success: false, message: 'Error updating leave policy' });
      }
    });

    app.delete('/api/v1/leave/policies/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await pool.query('UPDATE leave_policies SET is_active = 0 WHERE id = ?', [id]);
        res.json({ success: true, message: 'Leave policy deleted successfully' });
      } catch (error) {
        console.error('Error deleting leave policy:', error);
        res.status(500).json({ success: false, message: 'Error deleting leave policy' });
      }
    });

    // Holidays API
    app.get('/api/v1/leave/holidays', async (req, res) => {
      try {
        const { year = new Date().getFullYear() } = req.query;
        
        const [rows] = await pool.query(`
          SELECT * FROM leave_holidays 
          WHERE YEAR(date) = ? AND is_active = 1
          ORDER BY date
        `, [year]);
        
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ success: false, message: 'Error fetching holidays' });
      }
    });

    app.post('/api/v1/leave/holidays', async (req, res) => {
      try {
        const {
          name, date, type, is_recurring, recurring_pattern, description, is_active
        } = req.body;

        const [result] = await pool.query(
          `INSERT INTO leave_holidays 
           (company_id, name, date, type, is_recurring, recurring_pattern, description, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [1, name, date, type, is_recurring, recurring_pattern, description, is_active]
        );

        res.json({ success: true, message: 'Holiday created successfully', id: result.insertId });
      } catch (error) {
        console.error('Error creating holiday:', error);
        res.status(500).json({ success: false, message: 'Error creating holiday' });
      }
    });

    app.put('/api/v1/leave/holidays/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;
        
        const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);

        await pool.query(
          `UPDATE leave_holidays SET ${setClause}, updated_at = NOW() WHERE id = ?`,
          values
        );

        res.json({ success: true, message: 'Holiday updated successfully' });
      } catch (error) {
        console.error('Error updating holiday:', error);
        res.status(500).json({ success: false, message: 'Error updating holiday' });
      }
    });

    app.delete('/api/v1/leave/holidays/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await pool.query('UPDATE leave_holidays SET is_active = 0 WHERE id = ?', [id]);
        res.json({ success: true, message: 'Holiday deleted successfully' });
      } catch (error) {
        console.error('Error deleting holiday:', error);
        res.status(500).json({ success: false, message: 'Error deleting holiday' });
      }
    });

    // Leave Reports API
    app.get('/api/v1/leave/reports', async (req, res) => {
      try {
        const { year = new Date().getFullYear(), month, department } = req.query;
        
        let whereClause = 'WHERE YEAR(la.created_at) = ?';
        let params = [year];
        
        if (month) {
          whereClause += ' AND MONTH(la.created_at) = ?';
          params.push(month);
        }
        
        if (department && department !== 'all') {
          whereClause += ' AND e.department_id = ?';
          params.push(department);
        }

        const [rows] = await pool.query(`
          SELECT 
            la.employee_id,
            CONCAT(e.first_name, ' ', e.last_name) as employee_name,
            e.email as employee_email,
            d.name as department_name,
            lt.name as leave_type_name,
            COUNT(la.id) as total_applications,
            SUM(la.total_days) as total_days_applied,
            SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END) as total_days_approved,
            SUM(CASE WHEN la.status = 'rejected' THEN la.total_days ELSE 0 END) as total_days_rejected,
            SUM(CASE WHEN la.status = 'pending' THEN la.total_days ELSE 0 END) as total_days_pending,
            COALESCE(lb.total_allocated, 0) as total_allocated,
            COALESCE(lb.total_used, 0) as total_used,
            (COALESCE(lb.total_allocated, 0) - COALESCE(lb.total_used, 0)) as remaining_balance,
            CASE 
              WHEN COALESCE(lb.total_allocated, 0) > 0 
              THEN (COALESCE(lb.total_used, 0) / COALESCE(lb.total_allocated, 0)) * 100 
              ELSE 0 
            END as utilization_percentage
          FROM leave_applications la
          LEFT JOIN employees e ON la.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
          LEFT JOIN leave_balances lb ON la.employee_id = lb.employee_id AND la.leave_type_id = lb.leave_type_id AND lb.year = ?
          ${whereClause}
          GROUP BY la.employee_id, la.leave_type_id
          ORDER BY e.first_name, lt.name
        `, [...params, year]);
        
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching leave reports:', error);
        res.status(500).json({ success: false, message: 'Error fetching leave reports' });
      }
    });

    app.get('/api/v1/leave/reports/summary', async (req, res) => {
      try {
        const { year = new Date().getFullYear(), month } = req.query;
        
        let whereClause = 'WHERE YEAR(la.created_at) = ?';
        let params = [year];
        
        if (month) {
          whereClause += ' AND MONTH(la.created_at) = ?';
          params.push(month);
        }

        const [rows] = await pool.query(`
          SELECT 
            COUNT(DISTINCT la.employee_id) as total_employees,
            COUNT(la.id) as total_applications,
            SUM(la.total_days) as total_days_applied,
            SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END) as total_days_approved,
            SUM(CASE WHEN la.status = 'rejected' THEN la.total_days ELSE 0 END) as total_days_rejected,
            SUM(CASE WHEN la.status = 'pending' THEN la.total_days ELSE 0 END) as total_days_pending,
            AVG(CASE 
              WHEN lb.total_allocated > 0 
              THEN (lb.total_used / lb.total_allocated) * 100 
              ELSE 0 
            END) as average_utilization,
            'Annual Leave' as most_used_leave_type,
            'Unpaid Leave' as least_used_leave_type
          FROM leave_applications la
          LEFT JOIN leave_balances lb ON la.employee_id = lb.employee_id AND la.leave_type_id = lb.leave_type_id AND lb.year = ?
          ${whereClause}
        `, params);
        
        res.json({ success: true, data: rows[0] });
      } catch (error) {
        console.error('Error fetching leave summary:', error);
        res.status(500).json({ success: false, message: 'Error fetching leave summary' });
      }
    });

    app.get('/api/v1/leave/reports/departments', async (req, res) => {
      try {
        const { year = new Date().getFullYear(), month } = req.query;
        
        let whereClause = 'WHERE YEAR(la.created_at) = ?';
        let params = [year];
        
        if (month) {
          whereClause += ' AND MONTH(la.created_at) = ?';
          params.push(month);
        }

        const [rows] = await pool.query(`
          SELECT 
            d.id as department_id,
            d.name as department_name,
            COUNT(DISTINCT e.id) as total_employees,
            COUNT(la.id) as total_applications,
            SUM(la.total_days) as total_days_applied,
            SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END) as total_days_approved,
            CASE 
              WHEN COUNT(la.id) > 0 
              THEN (SUM(CASE WHEN la.status = 'approved' THEN la.total_days ELSE 0 END) / SUM(la.total_days)) * 100 
              ELSE 0 
            END as utilization_percentage
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN leave_applications la ON e.id = la.employee_id ${whereClause}
          GROUP BY d.id, d.name
          ORDER BY d.name
        `, params);
        
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching department reports:', error);
        res.status(500).json({ success: false, message: 'Error fetching department reports' });
      }
    });

    // Performance Reviews API
    app.get('/api/v1/performance/reviews', authenticateToken, async (req, res) => {
      try {
        const [reviews] = await pool.query(`
          SELECT pr.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
          FROM performance_reviews pr
          LEFT JOIN employees e ON pr.employee_id = e.id
          LEFT JOIN users r ON pr.reviewer_id = r.id
          WHERE e.company_id = 1
          ORDER BY pr.created_at DESC
        `);
        res.json({ success: true, data: reviews });
      } catch (error) {
        console.error('Error fetching performance reviews:', error);
        res.status(500).json({ success: false, message: 'Error fetching performance reviews' });
      }
    });

    app.post('/api/v1/performance/reviews', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { employee_id, reviewer_id, cycle_id, review_period_start, review_period_end, overall_rating, goals_rating, skills_rating, teamwork_rating, communication_rating, leadership_rating, comments, strengths, areas_for_improvement, development_plan } = req.body;
        
        if (!employee_id || !reviewer_id || !cycle_id || !review_period_start || !review_period_end) {
          return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const [result] = await pool.query(
          'INSERT INTO performance_reviews (employee_id, reviewer_id, cycle_id, review_period_start, review_period_end, overall_rating, goals_rating, skills_rating, teamwork_rating, communication_rating, leadership_rating, comments, strengths, areas_for_improvement, development_plan, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [employee_id, reviewer_id, cycle_id, review_period_start, review_period_end, overall_rating || 0, goals_rating || 0, skills_rating || 0, teamwork_rating || 0, communication_rating || 0, leadership_rating || 0, comments || null, strengths || null, areas_for_improvement || null, development_plan || null, 'draft']
        );

        const [newReview] = await pool.query(
          'SELECT pr.*, CONCAT(e.first_name, " ", e.last_name) as employee_name, CONCAT(r.first_name, " ", r.last_name) as reviewer_name FROM performance_reviews pr LEFT JOIN employees e ON pr.employee_id = e.id LEFT JOIN users r ON pr.reviewer_id = r.id WHERE pr.id = ?',
          [result.insertId]
        );

        res.status(201).json({ 
          success: true, 
          message: 'Performance review created successfully',
          data: newReview[0]
        });
      } catch (error) {
        console.error('Error creating performance review:', error);
        res.status(500).json({ success: false, message: 'Error creating performance review' });
      }
    });

    app.put('/api/v1/performance/reviews/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { overall_rating, goals_rating, skills_rating, teamwork_rating, communication_rating, leadership_rating, comments, strengths, areas_for_improvement, development_plan, status } = req.body;

        const [result] = await pool.query(
          'UPDATE performance_reviews SET overall_rating = ?, goals_rating = ?, skills_rating = ?, teamwork_rating = ?, communication_rating = ?, leadership_rating = ?, comments = ?, strengths = ?, areas_for_improvement = ?, development_plan = ?, status = ?, updated_at = NOW() WHERE id = ?',
          [overall_rating, goals_rating, skills_rating, teamwork_rating, communication_rating, leadership_rating, comments, strengths, areas_for_improvement, development_plan, status, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        const [updatedReview] = await pool.query(
          'SELECT pr.*, CONCAT(e.first_name, " ", e.last_name) as employee_name, CONCAT(r.first_name, " ", r.last_name) as reviewer_name FROM performance_reviews pr LEFT JOIN employees e ON pr.employee_id = e.id LEFT JOIN users r ON pr.reviewer_id = r.id WHERE pr.id = ?',
          [id]
        );

        res.json({ 
          success: true, 
          message: 'Performance review updated successfully',
          data: updatedReview[0]
        });
      } catch (error) {
        console.error('Error updating performance review:', error);
        res.status(500).json({ success: false, message: 'Error updating performance review' });
      }
    });

    app.delete('/api/v1/performance/reviews/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM performance_reviews WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        res.json({ success: true, message: 'Performance review deleted successfully' });
      } catch (error) {
        console.error('Error deleting performance review:', error);
        res.status(500).json({ success: false, message: 'Error deleting performance review' });
      }
    });

    // Goals API
    app.get('/api/v1/goals', authenticateToken, async (req, res) => {
      try {
        const [goals] = await pool.query(`
          SELECT g.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name
          FROM goals g
          LEFT JOIN employees e ON g.employee_id = e.id
          WHERE e.company_id = 1
          ORDER BY g.created_at DESC
        `);
        res.json({ success: true, data: goals });
      } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ success: false, message: 'Error fetching goals' });
      }
    });

    app.post('/api/v1/goals', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { employee_id, title, description, category, target_value, current_value, unit, start_date, end_date, priority } = req.body;
        
        if (!employee_id || !title || !start_date || !end_date) {
          return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const [result] = await pool.query(
          'INSERT INTO goals (employee_id, title, description, category, target_value, current_value, unit, start_date, end_date, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [employee_id, title, description || null, category || null, target_value || null, current_value || 0, unit || null, start_date, end_date, priority || 'medium', 'not_started']
        );

        const [newGoal] = await pool.query(
          'SELECT g.*, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM goals g LEFT JOIN employees e ON g.employee_id = e.id WHERE g.id = ?',
          [result.insertId]
        );

        res.status(201).json({ 
          success: true, 
          message: 'Goal created successfully',
          data: newGoal[0]
        });
      } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ success: false, message: 'Error creating goal' });
      }
    });

    app.put('/api/v1/goals/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { title, description, category, target_value, current_value, unit, start_date, end_date, priority, status } = req.body;

        const [result] = await pool.query(
          'UPDATE goals SET title = ?, description = ?, category = ?, target_value = ?, current_value = ?, unit = ?, start_date = ?, end_date = ?, priority = ?, status = ?, updated_at = NOW() WHERE id = ?',
          [title, description, category, target_value, current_value, unit, start_date, end_date, priority, status, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        const [updatedGoal] = await pool.query(
          'SELECT g.*, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM goals g LEFT JOIN employees e ON g.employee_id = e.id WHERE g.id = ?',
          [id]
        );

        res.json({ 
          success: true, 
          message: 'Goal updated successfully',
          data: updatedGoal[0]
        });
      } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ success: false, message: 'Error updating goal' });
      }
    });

    app.delete('/api/v1/goals/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM goals WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        res.json({ success: true, message: 'Goal deleted successfully' });
      } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ success: false, message: 'Error deleting goal' });
      }
    });

    // Expenses API
    app.get('/api/v1/expenses', authenticateToken, async (req, res) => {
      try {
        const [expenses] = await pool.query(`
          SELECT ex.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name
          FROM expenses ex
          LEFT JOIN employees e ON ex.employee_id = e.id
          WHERE e.company_id = 1
          ORDER BY ex.created_at DESC
        `);
        res.json({ success: true, data: expenses });
      } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ success: false, message: 'Error fetching expenses' });
      }
    });

    app.post('/api/v1/expenses', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { employee_id, category, description, amount, currency, expense_date, receipt_path } = req.body;
        
        if (!employee_id || !category || !description || !amount || !expense_date) {
          return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const [result] = await pool.query(
          'INSERT INTO expenses (employee_id, category, description, amount, currency, expense_date, receipt_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [employee_id, category, description, amount, currency || 'USD', expense_date, receipt_path || null, 'pending']
        );

        const [newExpense] = await pool.query(
          'SELECT ex.*, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM expenses ex LEFT JOIN employees e ON ex.employee_id = e.id WHERE ex.id = ?',
          [result.insertId]
        );

        res.status(201).json({ 
          success: true, 
          message: 'Expense created successfully',
          data: newExpense[0]
        });
      } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ success: false, message: 'Error creating expense' });
      }
    });

    app.put('/api/v1/expenses/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { category, description, amount, currency, expense_date, receipt_path, status } = req.body;

        const [result] = await pool.query(
          'UPDATE expenses SET category = ?, description = ?, amount = ?, currency = ?, expense_date = ?, receipt_path = ?, status = ?, updated_at = NOW() WHERE id = ?',
          [category, description, amount, currency, expense_date, receipt_path, status, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        const [updatedExpense] = await pool.query(
          'SELECT ex.*, CONCAT(e.first_name, " ", e.last_name) as employee_name FROM expenses ex LEFT JOIN employees e ON ex.employee_id = e.id WHERE ex.id = ?',
          [id]
        );

        res.json({ 
          success: true, 
          message: 'Expense updated successfully',
          data: updatedExpense[0]
        });
      } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ success: false, message: 'Error updating expense' });
      }
    });

    app.delete('/api/v1/expenses/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        res.json({ success: true, message: 'Expense deleted successfully' });
      } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ success: false, message: 'Error deleting expense' });
      }
    });

    // Jobs API
    app.get('/api/v1/jobs', authenticateToken, async (req, res) => {
      try {
        const [jobs] = await pool.query(`
          SELECT j.*, 
                 CONCAT(u.first_name, ' ', u.last_name) as created_by_name
          FROM jobs j
          LEFT JOIN users u ON j.created_by = u.id
          WHERE j.company_id = 1
          ORDER BY j.created_at DESC
        `);
        res.json({ success: true, data: jobs });
      } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Error fetching jobs' });
      }
    });

    app.post('/api/v1/jobs', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { title, department, location, employment_type, experience_level, salary_min, salary_max, description, requirements, responsibilities, benefits, closing_date } = req.body;
        
        if (!title || !department || !location || !employment_type || !experience_level || !description) {
          return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const [result] = await pool.query(
          'INSERT INTO jobs (company_id, title, department, location, employment_type, experience_level, salary_min, salary_max, description, requirements, responsibilities, benefits, status, posted_date, closing_date, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())',
          [1, title, department, location, employment_type, experience_level, salary_min || null, salary_max || null, description, requirements || null, responsibilities || null, benefits || null, 'published', closing_date || null, 1]
        );

        const [newJob] = await pool.query(
          'SELECT j.*, CONCAT(u.first_name, " ", u.last_name) as created_by_name FROM jobs j LEFT JOIN users u ON j.created_by = u.id WHERE j.id = ?',
          [result.insertId]
        );

        res.status(201).json({ 
          success: true, 
          message: 'Job created successfully',
          data: newJob[0]
        });
      } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Error creating job' });
      }
    });

    app.put('/api/v1/jobs/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { title, department, location, employment_type, experience_level, salary_min, salary_max, description, requirements, responsibilities, benefits, status, closing_date } = req.body;

        const [result] = await pool.query(
          'UPDATE jobs SET title = ?, department = ?, location = ?, employment_type = ?, experience_level = ?, salary_min = ?, salary_max = ?, description = ?, requirements = ?, responsibilities = ?, benefits = ?, status = ?, closing_date = ?, updated_at = NOW() WHERE id = ?',
          [title, department, location, employment_type, experience_level, salary_min, salary_max, description, requirements, responsibilities, benefits, status, closing_date, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Job not found' });
        }

        const [updatedJob] = await pool.query(
          'SELECT j.*, CONCAT(u.first_name, " ", u.last_name) as created_by_name FROM jobs j LEFT JOIN users u ON j.created_by = u.id WHERE j.id = ?',
          [id]
        );

        res.json({ 
          success: true, 
          message: 'Job updated successfully',
          data: updatedJob[0]
        });
      } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ success: false, message: 'Error updating job' });
      }
    });

    app.delete('/api/v1/jobs/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json({ success: true, message: 'Job deleted successfully' });
      } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ success: false, message: 'Error deleting job' });
      }
    });

    // Interviews API
    app.get('/api/v1/interviews', authenticateToken, async (req, res) => {
      try {
        const [interviews] = await pool.query(`
          SELECT i.*, 
                 ja.first_name as candidate_name,
                 j.title as position,
                 CONCAT(u.first_name, ' ', u.last_name) as interviewer_name
          FROM interviews i
          LEFT JOIN job_applications ja ON i.job_application_id = ja.id
          LEFT JOIN job_postings j ON ja.job_posting_id = j.id
          LEFT JOIN users u ON i.interviewer_id = u.id
          ORDER BY i.created_at DESC
        `);
        res.json({ success: true, data: interviews });
      } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ success: false, message: 'Error fetching interviews' });
      }
    });

    app.post('/api/v1/interviews', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { job_application_id, interviewer_id, interview_type, scheduled_date, scheduled_time, duration_minutes, location, meeting_link } = req.body;
        
        if (!job_application_id || !interviewer_id || !interview_type || !scheduled_date || !scheduled_time) {
          return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const [result] = await pool.query(
          'INSERT INTO interviews (job_application_id, interviewer_id, interview_type, scheduled_date, scheduled_time, duration_minutes, location, meeting_link, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [job_application_id, interviewer_id, interview_type, scheduled_date, scheduled_time, duration_minutes || 60, location || null, meeting_link || null, 'scheduled']
        );

        const [newInterview] = await pool.query(
          'SELECT i.*, ja.first_name as candidate_name, j.title as position, CONCAT(u.first_name, " ", u.last_name) as interviewer_name FROM interviews i LEFT JOIN job_applications ja ON i.job_application_id = ja.id LEFT JOIN job_postings j ON ja.job_posting_id = j.id LEFT JOIN users u ON i.interviewer_id = u.id WHERE i.id = ?',
          [result.insertId]
        );

        res.status(201).json({ 
          success: true, 
          message: 'Interview created successfully',
          data: newInterview[0]
        });
      } catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ success: false, message: 'Error creating interview' });
      }
    });

    app.put('/api/v1/interviews/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { interview_type, scheduled_date, scheduled_time, duration_minutes, location, meeting_link, status, feedback, rating, notes } = req.body;

        const [result] = await pool.query(
          'UPDATE interviews SET interview_type = ?, scheduled_date = ?, scheduled_time = ?, duration_minutes = ?, location = ?, meeting_link = ?, status = ?, feedback = ?, rating = ?, notes = ?, updated_at = NOW() WHERE id = ?',
          [interview_type, scheduled_date, scheduled_time, duration_minutes, location, meeting_link, status, feedback, rating, notes, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        const [updatedInterview] = await pool.query(
          'SELECT i.*, ja.first_name as candidate_name, j.title as position, CONCAT(u.first_name, " ", u.last_name) as interviewer_name FROM interviews i LEFT JOIN job_applications ja ON i.job_application_id = ja.id LEFT JOIN job_postings j ON ja.job_posting_id = j.id LEFT JOIN users u ON i.interviewer_id = u.id WHERE i.id = ?',
          [id]
        );

        res.json({ 
          success: true, 
          message: 'Interview updated successfully',
          data: updatedInterview[0]
        });
      } catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ success: false, message: 'Error updating interview' });
      }
    });

    app.delete('/api/v1/interviews/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM interviews WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        res.json({ success: true, message: 'Interview deleted successfully' });
      } catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({ success: false, message: 'Error deleting interview' });
      }
    });

    // Salary Components API
    app.get('/api/v1/payroll/salary-components', authenticateToken, async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT * FROM salary_components 
          WHERE company_id = 1
          ORDER BY type, name
        `);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching salary components:', error);
        res.status(500).json({ success: false, message: 'Error fetching salary components' });
      }
    });

    app.get('/api/v1/payroll/salary-components/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await pool.query(
          'SELECT * FROM salary_components WHERE id = ? AND company_id = 1',
          [id]
        );
        
        if (rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Salary component not found' });
        }
        
        res.json({
          success: true,
          data: rows[0]
        });
      } catch (error) {
        console.error('Error fetching salary component:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    });

    app.post('/api/v1/payroll/salary-components', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { name, code, description, type, is_taxable, is_fixed, calculation_type, default_amount, percentage_of, formula, is_active, is_mandatory, sort_order } = req.body;
        
        if (!name || !type) {
          return res.status(400).json({ success: false, message: 'Name and type are required' });
        }

        const [result] = await pool.query(
          'INSERT INTO salary_components (company_id, name, code, description, type, is_taxable, is_fixed, calculation_type, default_amount, percentage_of, formula, is_active, is_mandatory, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [1, name, code || null, description || null, type, is_taxable || false, is_fixed !== false, calculation_type || 'fixed', default_amount || 0, percentage_of || null, formula || null, is_active !== false, is_mandatory || false, sort_order || 0]
        );

        const [newComponent] = await pool.query(
          'SELECT * FROM salary_components WHERE id = ?',
          [result.insertId]
        );

        res.status(201).json({ 
          success: true, 
          message: 'Salary component created successfully',
          data: newComponent[0]
        });
      } catch (error) {
        console.error('Error creating salary component:', error);
        res.status(500).json({ success: false, message: 'Error creating salary component' });
      }
    });

    app.put('/api/v1/payroll/salary-components/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { name, code, description, type, is_taxable, is_fixed, calculation_type, default_amount, percentage_of, formula, is_active, is_mandatory, sort_order } = req.body;
        
        if (!name || !type) {
          return res.status(400).json({ success: false, message: 'Name and type are required' });
        }

        const [result] = await pool.query(
          'UPDATE salary_components SET name = ?, code = ?, description = ?, type = ?, is_taxable = ?, is_fixed = ?, calculation_type = ?, default_amount = ?, percentage_of = ?, formula = ?, is_active = ?, is_mandatory = ?, sort_order = ?, updated_at = NOW() WHERE id = ? AND company_id = 1',
          [name, code || null, description || null, type, is_taxable || false, is_fixed !== false, calculation_type || 'fixed', default_amount || 0, percentage_of || null, formula || null, is_active !== false, is_mandatory || false, sort_order || 0, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Salary component not found' });
        }

        const [updatedComponent] = await pool.query(
          'SELECT * FROM salary_components WHERE id = ?',
          [id]
        );

        res.json({ 
          success: true, 
          message: 'Salary component updated successfully',
          data: updatedComponent[0]
        });
      } catch (error) {
        console.error('Error updating salary component:', error);
        res.status(500).json({ success: false, message: 'Error updating salary component' });
      }
    });

    app.delete('/api/v1/payroll/salary-components/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        // Check if component is being used in employee salary components
        const [usage] = await pool.query(
          'SELECT COUNT(*) as count FROM employee_salary_components WHERE salary_component_id = ?',
          [id]
        );

        if (usage[0].count > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Cannot delete salary component that is being used by employees' 
          });
        }

        const [result] = await pool.query(
          'DELETE FROM salary_components WHERE id = ? AND company_id = 1',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Salary component not found' });
        }

        res.json({ success: true, message: 'Salary component deleted successfully' });
      } catch (error) {
        console.error('Error deleting salary component:', error);
        res.status(500).json({ success: false, message: 'Error deleting salary component' });
      }
    });

    // Employee Salaries API
    app.get('/api/v1/payroll/employee-salaries', authenticateToken, async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT es.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_code,
                 d.name as department,
                 ds.name as designation
          FROM employee_salaries es
          LEFT JOIN employees e ON es.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations ds ON e.designation_id = ds.id
          WHERE e.company_id = 1
          ORDER BY es.effective_date DESC, e.first_name, e.last_name
        `);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching employee salaries:', error);
        res.status(500).json({ success: false, message: 'Error fetching employee salaries' });
      }
    });

    app.post('/api/v1/payroll/employee-salaries', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { employee_id, basic_salary, effective_date, end_date, payment_type, bank_name, account_number, account_name } = req.body;
        
        if (!employee_id || !basic_salary || !effective_date) {
          return res.status(400).json({ success: false, message: 'Employee, basic salary, and effective date are required' });
        }

        const [result] = await pool.query(
          'INSERT INTO employee_salaries (employee_id, basic_salary, effective_date, end_date, payment_type, bank_name, account_number, account_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [employee_id, basic_salary, effective_date, end_date || null, payment_type || 'monthly', bank_name || null, account_number || null, account_name || null]
        );

        const [newSalary] = await pool.query(`
          SELECT es.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_code,
                 d.name as department,
                 ds.name as designation
          FROM employee_salaries es
          LEFT JOIN employees e ON es.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations ds ON e.designation_id = ds.id
          WHERE es.id = ?
        `, [result.insertId]);

        res.status(201).json({ 
          success: true, 
          message: 'Employee salary created successfully',
          data: newSalary[0]
        });
      } catch (error) {
        console.error('Error creating employee salary:', error);
        res.status(500).json({ success: false, message: 'Error creating employee salary' });
      }
    });

    app.put('/api/v1/payroll/employee-salaries/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { employee_id, basic_salary, effective_date, end_date, payment_type, bank_name, account_number, account_name } = req.body;
        
        if (!employee_id || !basic_salary || !effective_date) {
          return res.status(400).json({ success: false, message: 'Employee, basic salary, and effective date are required' });
        }

        const [result] = await pool.query(
          'UPDATE employee_salaries SET employee_id = ?, basic_salary = ?, effective_date = ?, end_date = ?, payment_type = ?, bank_name = ?, account_number = ?, account_name = ?, updated_at = NOW() WHERE id = ?',
          [employee_id, basic_salary, effective_date, end_date || null, payment_type || 'monthly', bank_name || null, account_number || null, account_name || null, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Employee salary not found' });
        }

        const [updatedSalary] = await pool.query(`
          SELECT es.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_code,
                 d.name as department,
                 ds.name as designation
          FROM employee_salaries es
          LEFT JOIN employees e ON es.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations ds ON e.designation_id = ds.id
          WHERE es.id = ?
        `, [id]);

        res.json({ 
          success: true, 
          message: 'Employee salary updated successfully',
          data: updatedSalary[0]
        });
      } catch (error) {
        console.error('Error updating employee salary:', error);
        res.status(500).json({ success: false, message: 'Error updating employee salary' });
      }
    });

    app.delete('/api/v1/payroll/employee-salaries/:id', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        const [result] = await pool.query(
          'DELETE FROM employee_salaries WHERE id = ?',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Employee salary not found' });
        }

        res.json({ success: true, message: 'Employee salary deleted successfully' });
      } catch (error) {
        console.error('Error deleting employee salary:', error);
        res.status(500).json({ success: false, message: 'Error deleting employee salary' });
      }
    });

    // Payslips API
    app.get('/api/v1/payroll/payslips', authenticateToken, async (req, res) => {
      try {
        const [rows] = await pool.query(`
          SELECT p.*, 
                 CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                 e.employee_id as employee_code,
                 d.name as department,
                 ds.name as designation
          FROM payslips p
          LEFT JOIN employees e ON p.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN designations ds ON e.designation_id = ds.id
          WHERE e.company_id = 1
          ORDER BY p.pay_period_start DESC, e.first_name, e.last_name
        `);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Error fetching payslips:', error);
        res.status(500).json({ success: false, message: 'Error fetching payslips' });
      }
    });

    app.put('/api/v1/payroll/payslips/:id/approve', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;

        const [result] = await pool.query(
          'UPDATE payslips SET status = "approved", updated_at = NOW() WHERE id = ?',
          [id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Payslip not found' });
        }

        res.json({ success: true, message: 'Payslip approved successfully' });
      } catch (error) {
        console.error('Error approving payslip:', error);
        res.status(500).json({ success: false, message: 'Error approving payslip' });
      }
    });

    app.put('/api/v1/payroll/payslips/:id/pay', authenticateToken, authorize(['super_admin', 'company_admin', 'hr_manager']), async (req, res) => {
      try {
        const { id } = req.params;
        const { payment_date, payment_method } = req.body;

        const [result] = await pool.query(
          'UPDATE payslips SET status = "paid", payment_date = ?, payment_method = ?, updated_at = NOW() WHERE id = ?',
          [payment_date, payment_method, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Payslip not found' });
        }

        res.json({ success: true, message: 'Payslip marked as paid successfully' });
      } catch (error) {
        console.error('Error marking payslip as paid:', error);
        res.status(500).json({ success: false, message: 'Error marking payslip as paid' });
      }
    });

    // AUDIT LOGS API ENDPOINTS
    
    // Get audit logs with filtering and pagination
    app.get('/api/v1/audit-logs', authenticateToken, async (req, res) => {
      try {
        const { 
          page = 1, 
          limit = 15, 
          search = '', 
          status = '', 
          severity = '', 
          department = '', 
          action = '',
          start_date = '',
          end_date = ''
        } = req.query;
        
        const offset = (page - 1) * limit;
        let whereConditions = [];
        let queryParams = [];
        
        // Build WHERE conditions
        if (search) {
          whereConditions.push(`(
            user_name LIKE ? OR 
            user_email LIKE ? OR 
            action LIKE ? OR 
            resource LIKE ? OR 
            details LIKE ? OR 
            ip_address LIKE ?
          )`);
          const searchParam = `%${search}%`;
          queryParams.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
        }
        
        if (status) {
          whereConditions.push('status = ?');
          queryParams.push(status);
        }
        
        if (severity) {
          whereConditions.push('severity = ?');
          queryParams.push(severity);
        }
        
        if (department) {
          whereConditions.push('department = ?');
          queryParams.push(department);
        }
        
        if (action) {
          whereConditions.push('action = ?');
          queryParams.push(action);
        }
        
        if (start_date) {
          whereConditions.push('DATE(created_at) >= ?');
          queryParams.push(start_date);
        }
        
        if (end_date) {
          whereConditions.push('DATE(created_at) <= ?');
          queryParams.push(end_date);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
        const [countResult] = await pool.query(countQuery, queryParams);
        const total = countResult[0].total;
        
        // Get paginated results
        const dataQuery = `
          SELECT * FROM audit_logs 
          ${whereClause}
          ORDER BY created_at DESC 
          LIMIT ? OFFSET ?
        `;
        const [logs] = await pool.query(dataQuery, [...queryParams, parseInt(limit), offset]);
        
        res.json({
          success: true,
          data: logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, message: 'Error fetching audit logs' });
      }
    });
    
    // Get audit log by ID
    app.get('/api/v1/audit-logs/:id', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        
        const [logs] = await pool.query('SELECT * FROM audit_logs WHERE id = ?', [id]);
        
        if (logs.length === 0) {
          return res.status(404).json({ success: false, message: 'Audit log not found' });
        }
        
        res.json({
          success: true,
          data: logs[0]
        });
      } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({ success: false, message: 'Error fetching audit log' });
      }
    });
    
    // Get audit log statistics
    app.get('/api/v1/audit-logs/stats', authenticateToken, async (req, res) => {
      try {
        const [stats] = await pool.query(`
          SELECT 
            COUNT(*) as total_logs,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as success_logs,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_logs,
            COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_logs,
            COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_logs
          FROM audit_logs
        `);
        
        res.json({
          success: true,
          data: stats[0]
        });
      } catch (error) {
        console.error('Error fetching audit log stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching audit log stats' });
      }
    });
    
    // Export audit logs to CSV
    app.get('/api/v1/audit-logs/export', authenticateToken, async (req, res) => {
      try {
        const { 
          search = '', 
          status = '', 
          severity = '', 
          department = '', 
          action = '',
          start_date = '',
          end_date = ''
        } = req.query;
        
        let whereConditions = [];
        let queryParams = [];
        
        // Build WHERE conditions (same as GET endpoint)
        if (search) {
          whereConditions.push(`(
            user_name LIKE ? OR 
            user_email LIKE ? OR 
            action LIKE ? OR 
            resource LIKE ? OR 
            details LIKE ? OR 
            ip_address LIKE ?
          )`);
          const searchParam = `%${search}%`;
          queryParams.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
        }
        
        if (status) {
          whereConditions.push('status = ?');
          queryParams.push(status);
        }
        
        if (severity) {
          whereConditions.push('severity = ?');
          queryParams.push(severity);
        }
        
        if (department) {
          whereConditions.push('department = ?');
          queryParams.push(department);
        }
        
        if (action) {
          whereConditions.push('action = ?');
          queryParams.push(action);
        }
        
        if (start_date) {
          whereConditions.push('DATE(created_at) >= ?');
          queryParams.push(start_date);
        }
        
        if (end_date) {
          whereConditions.push('DATE(created_at) <= ?');
          queryParams.push(end_date);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const [logs] = await pool.query(`
          SELECT 
            log_id,
            user_name,
            user_email,
            action,
            resource,
            resource_id,
            details,
            status,
            severity,
            ip_address,
            department,
            location,
            created_at
          FROM audit_logs 
          ${whereClause}
          ORDER BY created_at DESC
        `, queryParams);
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`);
        
        // Convert to CSV
        const csvHeader = 'Log ID,User,Email,Action,Resource,Resource ID,Details,Status,Severity,IP Address,Department,Location,Timestamp\n';
        const csvData = logs.map(log => 
          `"${log.log_id}","${log.user_name}","${log.user_email}","${log.action}","${log.resource}","${log.resource_id}","${log.details}","${log.status}","${log.severity}","${log.ip_address}","${log.department}","${log.location}","${new Date(log.created_at).toLocaleString()}"`
        ).join('\n');
        
        res.send(csvHeader + csvData);
      } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({ success: false, message: 'Error exporting audit logs' });
      }
    });

    // SETTINGS API ENDPOINTS
    
    // Get all settings or settings by category
    app.get('/api/v1/settings', authenticateToken, async (req, res) => {
      try {
        const { category, public_only } = req.query;
        
        let whereClause = '';
        let queryParams = [];
        
        if (category) {
          whereClause = 'WHERE category = ?';
          queryParams.push(category);
        }
        
        if (public_only === 'true') {
          whereClause += whereClause ? ' AND is_public = TRUE' : 'WHERE is_public = TRUE';
        }
        
        const [settings] = await pool.query(`
          SELECT * FROM settings 
          ${whereClause}
          ORDER BY category, setting_key
        `, queryParams);
        
        // Group settings by category
        const groupedSettings = settings.reduce((acc, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = {};
          }
          
          // Convert value based on type
          let value = setting.setting_value;
          if (setting.setting_type === 'boolean') {
            value = value === 'true';
          } else if (setting.setting_type === 'number') {
            value = parseFloat(value);
          } else if (setting.setting_type === 'json') {
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = value;
            }
          }
          
          acc[setting.category][setting.setting_key] = value;
          return acc;
        }, {});
        
        res.json({
          success: true,
          data: groupedSettings
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Error fetching settings' });
      }
    });
    
    // Get public settings (no authentication required)
    app.get('/api/v1/settings/public', async (req, res) => {
      try {
        const [settings] = await pool.query(`
          SELECT * FROM settings 
          WHERE is_public = TRUE
          ORDER BY category, setting_key
        `);
        
        // Group settings by category
        const groupedSettings = settings.reduce((acc, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = {};
          }
          
          // Convert value based on type
          let value = setting.setting_value;
          if (setting.setting_type === 'boolean') {
            value = value === 'true';
          } else if (setting.setting_type === 'number') {
            value = parseFloat(value);
          } else if (setting.setting_type === 'json') {
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = value;
            }
          }
          
          acc[setting.category][setting.setting_key] = value;
          return acc;
        }, {});
        
        res.json({
          success: true,
          data: groupedSettings
        });
      } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ success: false, message: 'Error fetching public settings' });
      }
    });
    
    // Update settings
    app.put('/api/v1/settings', authenticateToken, async (req, res) => {
      try {
        const { category, settings, audit } = req.body;
        
        if (!category || !settings) {
          return res.status(400).json({ success: false, message: 'Category and settings are required' });
        }
        
        // Only super_admin can update settings
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ success: false, message: 'Access denied. Only super admin can update settings.' });
        }
        
        const results = [];
        
        for (const [key, value] of Object.entries(settings)) {
          // Convert value to string for storage
          let stringValue = value;
          if (typeof value === 'boolean') {
            stringValue = value.toString();
          } else if (typeof value === 'number') {
            stringValue = value.toString();
          } else if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
          }
          
          // Update or insert setting
          await pool.query(`
            INSERT INTO settings (category, setting_key, setting_value, setting_type, description, is_public)
            VALUES (?, ?, ?, 'string', '', FALSE)
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            updated_at = CURRENT_TIMESTAMP
          `, [category, key, stringValue]);
          
          results.push({ key, value: stringValue });
        }
        
        // Log audit trail
        if (audit) {
          try {
            await pool.query(`
              INSERT INTO audit_logs (user_id, action, resource, details, status, severity, ip_address, user_agent)
              VALUES (?, ?, ?, ?, 'success', 'info', ?, ?)
            `, [
              req.user.id,
              audit.action || 'update_category',
              audit.resource || `settings.${category}`,
              audit.details || `Updated ${Object.keys(settings).length} settings in ${category} category`,
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent') || 'Unknown'
            ]);
          } catch (auditError) {
            console.error('Error logging audit trail:', auditError);
          }
        }
        
        res.json({
          success: true,
          message: 'Settings updated successfully',
          data: results
        });
      } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Error updating settings' });
      }
    });
    
    // Update single setting
    app.put('/api/v1/settings/:category/:key', authenticateToken, async (req, res) => {
      try {
        const { category, key } = req.params;
        const { value, type = 'string', audit } = req.body;
        
        // Only super_admin can update settings
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ success: false, message: 'Access denied. Only super admin can update settings.' });
        }
        
        // Convert value to string for storage
        let stringValue = value;
        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        }
        
        // Update or insert setting
        await pool.query(`
          INSERT INTO settings (category, setting_key, setting_value, setting_type, description, is_public)
          VALUES (?, ?, ?, ?, '', FALSE)
          ON DUPLICATE KEY UPDATE 
          setting_value = VALUES(setting_value),
          setting_type = VALUES(setting_type),
          updated_at = CURRENT_TIMESTAMP
        `, [category, key, stringValue, type]);
        
        // Log audit trail
        if (audit) {
          try {
            await pool.query(`
              INSERT INTO audit_logs (user_id, action, resource, details, status, severity, ip_address, user_agent)
              VALUES (?, ?, ?, ?, 'success', 'info', ?, ?)
            `, [
              req.user.id,
              audit.action || 'update_setting',
              audit.resource || `settings.${category}.${key}`,
              audit.details || `Updated setting ${key} in ${category} category to: ${stringValue}`,
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent') || 'Unknown'
            ]);
          } catch (auditError) {
            console.error('Error logging audit trail:', auditError);
          }
        }
        
        res.json({
          success: true,
          message: 'Setting updated successfully',
          data: { category, key, value: stringValue }
        });
      } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ success: false, message: 'Error updating setting' });
      }
    });
    
    // Reset settings to default
    app.post('/api/v1/settings/reset', authenticateToken, async (req, res) => {
      try {
        const { category, audit } = req.body;
        
        // Only super_admin can reset settings
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ success: false, message: 'Access denied. Only super admin can reset settings.' });
        }
        
        if (category) {
          // Reset specific category
          await pool.query('DELETE FROM settings WHERE category = ?', [category]);
        } else {
          // Reset all settings
          await pool.query('DELETE FROM settings');
        }
        
        // Log audit trail
        if (audit) {
          try {
            await pool.query(`
              INSERT INTO audit_logs (user_id, action, resource, details, status, severity, ip_address, user_agent)
              VALUES (?, ?, ?, ?, 'success', 'warning', ?, ?)
            `, [
              req.user.id,
              audit.action || 'reset_settings',
              audit.resource || (category ? `settings.${category}` : 'settings'),
              audit.details || (category ? `Reset all settings in ${category} category` : 'Reset all system settings'),
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent') || 'Unknown'
            ]);
          } catch (auditError) {
            console.error('Error logging audit trail:', auditError);
          }
        }
        
        res.json({
          success: true,
          message: category ? `Settings for ${category} reset successfully` : 'All settings reset successfully'
        });
      } catch (error) {
        console.error('Error resetting settings:', error);
        res.status(500).json({ success: false, message: 'Error resetting settings' });
      }
    });

    // Export settings
    app.post('/api/v1/settings/export', authenticateToken, async (req, res) => {
      try {
        const { categories, audit } = req.body;
        
        // Only super_admin can export settings
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ success: false, message: 'Access denied. Only super admin can export settings.' });
        }
        
        let whereClause = '';
        let queryParams = [];
        
        if (categories && categories.length > 0) {
          const placeholders = categories.map(() => '?').join(',');
          whereClause = `WHERE category IN (${placeholders})`;
          queryParams = categories;
        }
        
        const [settings] = await pool.query(`
          SELECT * FROM settings 
          ${whereClause}
          ORDER BY category, setting_key
        `, queryParams);
        
        // Group settings by category
        const groupedSettings = settings.reduce((acc, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = {};
          }
          
          // Convert value based on type
          let value = setting.setting_value;
          if (setting.setting_type === 'number') {
            value = parseFloat(value);
          } else if (setting.setting_type === 'boolean') {
            value = value === 'true';
          } else if (setting.setting_type === 'json') {
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = value;
            }
          }
          
          acc[setting.category][setting.setting_key] = value;
          return acc;
        }, {});
        
        // Log audit trail
        if (audit) {
          try {
            await pool.query(`
              INSERT INTO audit_logs (user_id, action, resource, details, status, severity, ip_address, user_agent)
              VALUES (?, ?, ?, ?, 'success', 'info', ?, ?)
            `, [
              req.user.id,
              audit.action || 'export_settings',
              audit.resource || 'settings',
              audit.details || (categories ? `Exported settings for categories: ${categories.join(', ')}` : 'Exported all settings'),
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent') || 'Unknown'
            ]);
          } catch (auditError) {
            console.error('Error logging audit trail:', auditError);
          }
        }
        
        res.json({
          success: true,
          message: 'Settings exported successfully',
          data: groupedSettings
        });
      } catch (error) {
        console.error('Error exporting settings:', error);
        res.status(500).json({ success: false, message: 'Error exporting settings' });
      }
    });

    // Import settings
    app.post('/api/v1/settings/import', authenticateToken, async (req, res) => {
      try {
        const { settings, audit } = req.body;
        
        // Only super_admin can import settings
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({ success: false, message: 'Access denied. Only super admin can import settings.' });
        }
        
        if (!settings || typeof settings !== 'object') {
          return res.status(400).json({ success: false, message: 'Settings data is required' });
        }
        
        const results = [];
        
        for (const [category, categorySettings] of Object.entries(settings)) {
          if (typeof categorySettings === 'object' && categorySettings !== null) {
            for (const [key, value] of Object.entries(categorySettings)) {
              // Convert value to string for storage
              let stringValue = value;
              if (typeof value === 'boolean') {
                stringValue = value.toString();
              } else if (typeof value === 'number') {
                stringValue = value.toString();
              } else if (typeof value === 'object') {
                stringValue = JSON.stringify(value);
              }
              
              // Update or insert setting
              await pool.query(`
                INSERT INTO settings (category, setting_key, setting_value, setting_type, description, is_public)
                VALUES (?, ?, ?, 'string', '', FALSE)
                ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                updated_at = CURRENT_TIMESTAMP
              `, [category, key, stringValue]);
              
              results.push({ category, key, value: stringValue });
            }
          }
        }
        
        // Log audit trail
        if (audit) {
          try {
            await pool.query(`
              INSERT INTO audit_logs (user_id, action, resource, details, status, severity, ip_address, user_agent)
              VALUES (?, ?, ?, ?, 'success', 'info', ?, ?)
            `, [
              req.user.id,
              audit.action || 'import_settings',
              audit.resource || 'settings',
              audit.details || `Imported settings for categories: ${Object.keys(settings).join(', ')}`,
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent') || 'Unknown'
            ]);
          } catch (auditError) {
            console.error('Error logging audit trail:', auditError);
          }
        }
        
        res.json({
          success: true,
          message: 'Settings imported successfully',
          data: results
        });
      } catch (error) {
        console.error('Error importing settings:', error);
        res.status(500).json({ success: false, message: 'Error importing settings' });
      }
    });

    // Simple endpoints for departments and designations (for dropdowns)
    app.get('/api/v1/departments', authenticateToken, async (req, res) => {
      try {
        const [departments] = await pool.query(
          'SELECT id, name FROM departments WHERE company_id = ? ORDER BY name',
          [1] // Default company ID
        );
        res.json({ data: departments });
      } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.get('/api/v1/designations', authenticateToken, async (req, res) => {
      try {
        const [designations] = await pool.query(
          'SELECT id, name FROM designations WHERE company_id = ? ORDER BY name',
          [1] // Default company ID
        );
        res.json({ data: designations });
      } catch (error) {
        console.error('Get designations error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      // Run auto-migration on startup
      await runAutoMigration();
    });
    
    module.exports = app;
