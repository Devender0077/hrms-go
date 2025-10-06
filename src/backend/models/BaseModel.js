/**
 * Base Model Class
 * Provides common validation and data handling methods
 */

class BaseModel {
  constructor(tableName, requiredFields = [], searchFields = []) {
    this.tableName = tableName;
    this.requiredFields = requiredFields;
    this.searchFields = searchFields;
    this.name = this.constructor.name.replace('Model', '');
  }

  /**
   * Validate data against model rules
   */
  validate(data, isUpdate = false) {
    const errors = {};
    const fieldsToValidate = isUpdate ? Object.keys(data) : this.requiredFields;

    fieldsToValidate.forEach(field => {
      const value = data[field];
      const rules = this.getFieldRules(field);

      if (rules) {
        const error = this.validateField(value, rules, field);
        if (error) {
          errors[field] = error;
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get validation rules for a specific field
   * Override in child classes
   */
  getFieldRules(field) {
    return this.fieldRules?.[field] || null;
  }

  /**
   * Validate a single field
   */
  validateField(value, rules, fieldName) {
    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${fieldName} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
      return null;
    }

    const stringValue = value.toString();

    // Min length validation
    if (rules.minLength && stringValue.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return `${fieldName} format is invalid`;
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }

  /**
   * Sanitize data before saving
   */
  sanitize(data) {
    const sanitized = { ...data };

    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    // Trim string values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim();
      }
    });

    return sanitized;
  }

  /**
   * Transform data for API response
   */
  transform(data) {
    // Remove sensitive fields
    const sensitiveFields = ['password', 'remember_token'];
    const transformed = { ...data };

    sensitiveFields.forEach(field => {
      if (transformed[field]) {
        delete transformed[field];
      }
    });

    return transformed;
  }

  /**
   * Get table schema information
   */
  async getSchema(pool) {
    try {
      const [columns] = await pool.query(
        `DESCRIBE ${this.tableName}`
      );
      return columns;
    } catch (error) {
      console.error(`Error getting schema for ${this.tableName}:`, error);
      return [];
    }
  }

  /**
   * Check if table exists
   */
  async tableExists(pool) {
    try {
      const [result] = await pool.query(
        `SHOW TABLES LIKE '${this.tableName}'`
      );
      return result.length > 0;
    } catch (error) {
      console.error(`Error checking table existence for ${this.tableName}:`, error);
      return false;
    }
  }
}

module.exports = BaseModel;

