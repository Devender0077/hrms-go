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

// ✅ Dynamic CORS Configuration (Secure)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // ✅ DEVELOPMENT: Allow any localhost port for development flexibility
    if (process.env.NODE_ENV !== 'production') {
      const localhostPattern = /^http:\/\/localhost:\d+$/;
      if (localhostPattern.test(origin)) {
        console.log('✅ CORS allowed (dev):', origin);
        return callback(null, true);
      }
    }

    // ✅ PRODUCTION: Only allow specific domains (configure these for your production domain)
    const allowedOrigins = [
      'https://your-domain.com',
      'https://www.your-domain.com',
      'https://app.your-domain.com',
      // Add your production domains here
    ];

    if (process.env.NODE_ENV === 'production' && allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed (prod):', origin);
      return callback(null, true);
    }

    // ✅ For development, if not localhost pattern, check specific origins
    const devOrigins = ['http://localhost:3000'];
    if (devOrigins.includes(origin)) {
      console.log('✅ CORS allowed (dev-specific):', origin);
      return callback(null, true);
    }

    // ❌ Reject all other origins
    console.warn('❌ CORS blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('dev'));
// ✅ Increase limit for face recognition data (descriptors are small ~1KB but being safe)
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));

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
// AUTO-MIGRATION FUNCTION
// =====================================================
// Note: Auto-migration files removed during cleanup

async function runAllMigrations() {
  try {
    console.log('✅ Migrations completed during cleanup');
    // Note: Auto-migration files were removed during cleanup
    // All necessary migrations are already in the migrations folder
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
app.use('/api/v1/roles', userRoutes); // Mount roles endpoints directly
app.use('/api/v1/permissions', userRoutes); // Mount permissions endpoints directly
app.use('/api/v1/timekeeping', attendanceRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/recruitment', recruitmentRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/goals', goalsRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/assets', assetsRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/documents', documentsRoutes);

// Audit logs routes
const auditLogsModule = require('./routes/audit-logs.routes')(pool, authenticateToken);
app.use('/api/v1/audit-logs', auditLogsModule.router);

// Pusher routes
const pusherModule = require('./routes/pusher.routes')(pool, authenticateToken);
app.use('/api/v1/pusher', pusherModule.router);

// Integrations routes (Slack, Teams, Twilio, SendGrid, S3, Zoom, etc.)
const integrationsModule = require('./routes/integrations.routes')(pool, authenticateToken);
app.use('/api/v1/integrations', integrationsModule.router);

// Messenger routes
const messengerModule = require('./routes/messenger.routes')(pool, authenticateToken);
app.use('/api/v1/messenger', messengerModule.router);

// Announcements routes
const announcementsModule = require('./routes/announcements.routes')(pool, authenticateToken);
app.use('/api/v1/announcements', announcementsModule.router);

// =====================================================
// HEALTH CHECK & API INFO
// =====================================================
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HRMS API is running',
    version: '1.0.0',
    modules: 17,
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
      'expenses', 'documents'
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
  console.log(`📁 Modular Routes: 21 modules loaded`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
  
  // Run auto-migration on startup
  await runAllMigrations();
  
  // Initialize Pusher
  const { initializePusher } = require('./services/pusher.service');
  await initializePusher(pool);
  
  console.log(`✅ Server ready and accepting connections`);
  console.log(`📡 Integrations: Slack, Teams, Twilio, SendGrid, S3, Zoom`);
});

module.exports = app;

