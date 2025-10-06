/**
 * Validation Middleware
 * Handles input validation and sanitization
 */

const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  id: param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  phone: body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  url: body('url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  
  date: body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  positiveNumber: body('number')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Number must be positive'),
  
  requiredString: (field) => body(field)
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage(`${field} is required and must be between 1 and 255 characters`),
  
  optionalString: (field, maxLength = 255) => body(field)
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} must be no more than ${maxLength} characters`)
};

// Validation middleware for common operations
const validateId = [commonValidations.id, handleValidationErrors];

const validateUser = [
  commonValidations.requiredString('name'),
  commonValidations.email,
  commonValidations.password,
  commonValidations.phone,
  handleValidationErrors
];

const validateEmployee = [
  commonValidations.requiredString('first_name'),
  commonValidations.requiredString('last_name'),
  commonValidations.email,
  commonValidations.phone,
  commonValidations.requiredString('employee_id'),
  handleValidationErrors
];

const validateCompany = [
  commonValidations.requiredString('name'),
  commonValidations.email,
  commonValidations.phone,
  commonValidations.url,
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 255 }).withMessage('Search term too long'),
  query('sort').optional().isLength({ max: 50 }).withMessage('Sort field name too long'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  handleValidationErrors
];

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove HTML tags from string inputs
  const sanitizeString = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<[^>]*>/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeString(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeString(req.body);
  }
  
  if (req.query) {
    sanitizeString(req.query);
  }

  next();
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  validateId,
  validateUser,
  validateEmployee,
  validateCompany,
  validatePagination,
  sanitizeInput
};

