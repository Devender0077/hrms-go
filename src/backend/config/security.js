/**
 * Security Configuration
 * Centralized security settings and utilities
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Security configuration
const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Password Configuration
  password: {
    saltRounds: 12,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    authWindowMs: 15 * 60 * 1000, // 15 minutes for auth endpoints
    authMax: 5 // limit auth endpoints to 5 requests per windowMs
  },

  // CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL] 
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // File Upload Security
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
  }
};

// Password utilities
const passwordUtils = {
  async hash(password) {
    return bcrypt.hash(password, securityConfig.password.saltRounds);
  },

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  },

  validate(password) {
    const errors = [];
    
    if (password.length < securityConfig.password.minLength) {
      errors.push(`Password must be at least ${securityConfig.password.minLength} characters long`);
    }
    
    if (securityConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (securityConfig.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (securityConfig.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (securityConfig.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// JWT utilities
const jwtUtils = {
  sign(payload) {
    return jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.expiresIn
    });
  },

  signRefresh(payload) {
    return jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.refreshExpiresIn
    });
  },

  verify(token) {
    return jwt.verify(token, securityConfig.jwt.secret);
  },

  decode(token) {
    return jwt.decode(token);
  }
};

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const rateLimiters = {
  general: createRateLimit(
    securityConfig.rateLimit.windowMs,
    securityConfig.rateLimit.max,
    'Too many requests, please try again later'
  ),
  
  auth: createRateLimit(
    securityConfig.rateLimit.authWindowMs,
    securityConfig.rateLimit.authMax,
    'Too many authentication attempts, please try again later'
  ),
  
  strict: createRateLimit(
    5 * 60 * 1000, // 5 minutes
    3, // 3 requests
    'Too many attempts, please wait before trying again'
  )
};

// Security middleware
const securityMiddleware = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }),

  cors: cors(securityConfig.cors),

  // Input sanitization
  sanitizeInput: (req, res, next) => {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove HTML tags and potentially dangerous characters
          obj[key] = obj[key]
            .replace(/<[^>]*>/g, '')
            .replace(/[<>]/g, '')
            .trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
  },

  // Request logging
  logRequests: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };
      
      if (res.statusCode >= 400) {
        console.error('Request Error:', logData);
      } else {
        console.log('Request:', logData);
      }
    });
    
    next();
  }
};

module.exports = {
  securityConfig,
  passwordUtils,
  jwtUtils,
  rateLimiters,
  securityMiddleware
};

