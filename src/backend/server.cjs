// Express server for HRM API - Clean Modular Version
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
// MIGRATION FUNCTION
// =====================================================
async function runAllMigrations() {
  try {
    console.log('🔄 Running migrations using migration manager...');
    
    // Import and run the migration manager
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // Run migrations
    await execAsync('node migration-manager.js up', { cwd: './migrations' });
    
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

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
const tripsRoutes = require('./routes/trips.routes')(pool, authenticateToken);
const announcementsRoutes = require('./routes/announcements.routes')(pool, authenticateToken);
const meetingsRoutes = require('./routes/meetings.routes')(pool, authenticateToken);
const meetingTypesRoutes = require('./routes/meeting-types.routes')(pool, authenticateToken);
const meetingRoomsRoutes = require('./routes/meeting-rooms.routes')(pool, authenticateToken);
const trainingRoutes = require('./routes/training.routes')(pool, authenticateToken);

// Extended routes
const { router: auditLogsRoutes } = require('./routes/audit-logs.routes')(pool, authenticateToken);
const performanceRoutes = require('./routes/performance.routes')(pool, authenticateToken);
const payrollExtendedRoutes = require('./routes/payroll-extended.routes')(pool, authenticateToken);
const timekeepingExtendedRoutes = require('./routes/timekeeping-extended.routes')(pool, authenticateToken);

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
app.use('/api/v1/trips', tripsRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/meetings', meetingsRoutes);
app.use('/api/v1/meeting-types', meetingTypesRoutes);
app.use('/api/v1/meeting-rooms', meetingRoomsRoutes);
app.use('/api/v1/training', trainingRoutes);

// Extended routes
app.use('/api/v1/audit-logs', auditLogsRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/payroll', payrollExtendedRoutes);
app.use('/api/v1/timekeeping', timekeepingExtendedRoutes);

// =====================================================
// HEALTH CHECK & API INFO
// =====================================================
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HRMS API is running',
    version: '1.0.0',
    modules: 20,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1', (req, res) => {
  res.json({
    message: 'HRMS API v1',
    modules: [
      'auth', 'organization', 'hr-setup', 'employees', 'leave',
      'tasks', 'settings', 'users', 'timekeeping', 'payroll',
      'recruitment', 'calendar', 'goals', 'reviews', 'assets',
      'expenses', 'documents', 'trips', 'announcements', 'meetings', 'training'
    ],
    documentation: '/api/v1/docs',
    health: '/api/v1/health'
  });
});

// Global permissions endpoint (used by multiple modules)
app.get('/api/v1/permissions', authenticateToken, async (req, res) => {
  try {
    const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY module, permission_name');
    res.json({ success: true, data: permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ success: false, message: 'Error fetching permissions' });
  }
});

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Test IP endpoint
app.get('/api/v1/test-ip', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                   req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'Unknown';
  
  res.json({
    success: true,
    data: {
      ip: clientIP,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// =====================================================
// SERVER STARTUP
// =====================================================
const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Version: v1`);
  console.log(`📁 Modular Routes: 23 modules loaded`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
  
  // Run auto-migration on startup
  await runAllMigrations();
  
  console.log(`✅ Server ready and accepting connections`);
});

module.exports = app;

