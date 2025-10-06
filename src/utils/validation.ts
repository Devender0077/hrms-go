/**
 * Validation Utilities
 * Provides consistent validation functions for forms and API data
 */

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Field validation function type
export type ValidationFunction = (value: any) => string | null;

// Common validation functions
export const validators = {
  /**
   * Required field validation
   */
  required: (message: string = 'This field is required'): ValidationFunction => {
    return (value: any) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return null;
    };
  },

  /**
   * Email validation
   */
  email: (message: string = 'Please enter a valid email address'): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    };
  },

  /**
   * Phone number validation
   */
  phone: (message: string = 'Please enter a valid phone number'): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? null : message;
    };
  },

  /**
   * Minimum length validation
   */
  minLength: (min: number, message?: string): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const msg = message || `Must be at least ${min} characters long`;
      return value.length >= min ? null : msg;
    };
  },

  /**
   * Maximum length validation
   */
  maxLength: (max: number, message?: string): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const msg = message || `Must be no more than ${max} characters long`;
      return value.length <= max ? null : msg;
    };
  },

  /**
   * Numeric validation
   */
  numeric: (message: string = 'Must be a valid number'): ValidationFunction => {
    return (value: any) => {
      if (!value) return null; // Allow empty if not required
      return !isNaN(Number(value)) ? null : message;
    };
  },

  /**
   * Positive number validation
   */
  positive: (message: string = 'Must be a positive number'): ValidationFunction => {
    return (value: any) => {
      if (!value) return null; // Allow empty if not required
      const num = Number(value);
      return !isNaN(num) && num > 0 ? null : message;
    };
  },

  /**
   * Date validation
   */
  date: (message: string = 'Please enter a valid date'): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const date = new Date(value);
      return !isNaN(date.getTime()) ? null : message;
    };
  },

  /**
   * Future date validation
   */
  futureDate: (message: string = 'Date must be in the future'): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today ? null : message;
    };
  },

  /**
   * Past date validation
   */
  pastDate: (message: string = 'Date must be in the past'): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today ? null : message;
    };
  },

  /**
   * URL validation
   */
  url: (message: string = 'Please enter a valid URL'): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    };
  },

  /**
   * Password strength validation
   */
  password: (message: string = 'Password must be at least 8 characters with uppercase, lowercase, number and special character'): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 8;

      if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasMinLength) {
        return null;
      }
      return message;
    };
  },

  /**
   * Custom regex validation
   */
  regex: (pattern: RegExp, message: string): ValidationFunction => {
    return (value: string) => {
      if (!value) return null; // Allow empty if not required
      return pattern.test(value) ? null : message;
    };
  },

  /**
   * File type validation
   */
  fileType: (allowedTypes: string[], message?: string): ValidationFunction => {
    return (value: File) => {
      if (!value) return null; // Allow empty if not required
      const msg = message || `File type must be one of: ${allowedTypes.join(', ')}`;
      return allowedTypes.includes(value.type) ? null : msg;
    };
  },

  /**
   * File size validation
   */
  fileSize: (maxSizeInMB: number, message?: string): ValidationFunction => {
    return (value: File) => {
      if (!value) return null; // Allow empty if not required
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      const msg = message || `File size must be less than ${maxSizeInMB}MB`;
      return value.size <= maxSizeInBytes ? null : msg;
    };
  }
};

/**
 * Validate a single field
 */
export function validateField(value: any, validators: ValidationFunction[]): string | null {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
        }
        return null;
      }

/**
 * Validate multiple fields
 */
export function validateFields(data: Record<string, any>, fieldValidators: Record<string, ValidationFunction[]>): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, validators] of Object.entries(fieldValidators)) {
    const value = data[fieldName];
    const error = validateField(value, validators);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate form data with field definitions
 */
export function validateFormData(data: Record<string, any>, fieldDefinitions: Record<string, {
  required?: boolean;
  validators?: ValidationFunction[];
  label?: string;
}>): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, definition] of Object.entries(fieldDefinitions)) {
    const value = data[fieldName];
    const fieldValidators: ValidationFunction[] = [];

    // Add required validator if needed
    if (definition.required) {
      const label = definition.label || fieldName;
      fieldValidators.push(validators.required(`${label} is required`));
    }

    // Add custom validators
    if (definition.validators) {
      fieldValidators.push(...definition.validators);
    }

    // Validate field
    const error = validateField(value, fieldValidators);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize input data
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

/**
 * Validate and sanitize form data
 */
export function validateAndSanitizeFormData(
  data: Record<string, any>,
  fieldDefinitions: Record<string, {
    required?: boolean;
    validators?: ValidationFunction[];
    label?: string;
    sanitize?: boolean;
  }>
): { data: Record<string, any>; validation: ValidationResult } {
  // Sanitize data first
  const sanitizedData: Record<string, any> = {};
  for (const [fieldName, value] of Object.entries(data)) {
    const definition = fieldDefinitions[fieldName];
    if (definition?.sanitize !== false) {
      sanitizedData[fieldName] = sanitizeInput(value);
    } else {
      sanitizedData[fieldName] = value;
    }
  }

  // Validate sanitized data
  const validation = validateFormData(sanitizedData, fieldDefinitions);

  return {
    data: sanitizedData,
    validation
  };
}

// Common field definitions for HRMS forms
export const commonFieldDefinitions = {
  email: {
    required: true,
    validators: [validators.email()],
    label: 'Email',
    sanitize: true
  },
  password: {
    required: true,
    validators: [validators.password()],
    label: 'Password',
    sanitize: false
  },
  name: {
    required: true,
    validators: [validators.minLength(2), validators.maxLength(100)],
    label: 'Name',
    sanitize: true
  },
  phone: {
    required: false,
    validators: [validators.phone()],
    label: 'Phone Number',
    sanitize: true
  },
  date: {
    required: true,
    validators: [validators.date()],
    label: 'Date',
    sanitize: true
  },
  amount: {
    required: true,
    validators: [validators.numeric(), validators.positive()],
    label: 'Amount',
    sanitize: true
  }
};

// Settings validation rules
export const settingsValidationRules = {
  general: {
    companyName: [validators.required('Company name is required')],
    companyEmail: [validators.required('Company email is required'), validators.email('Invalid email format')],
    companyPhone: [validators.required('Company phone is required')],
    companyAddress: [validators.required('Company address is required')],
    timezone: [validators.required('Timezone is required')],
    dateFormat: [validators.required('Date format is required')],
    currency: [validators.required('Currency is required')],
    language: [validators.required('Language is required')],
    workingHours: [validators.required('Working hours are required')],
    overtimeRate: [validators.required('Overtime rate is required'), validators.numeric('Overtime rate must be a number')],
    leaveAccrualRate: [validators.required('Leave accrual rate is required'), validators.numeric('Leave accrual rate must be a number')],
    maxLeaveDays: [validators.required('Max leave days is required'), validators.numeric('Max leave days must be a number')],
    probationPeriod: [validators.required('Probation period is required'), validators.numeric('Probation period must be a number')],
    noticePeriod: [validators.required('Notice period is required'), validators.numeric('Notice period must be a number')],
    taxRate: [validators.required('Tax rate is required'), validators.numeric('Tax rate must be a number')],
    socialSecurityRate: [validators.required('Social security rate is required'), validators.numeric('Social security rate must be a number')],
    healthInsuranceRate: [validators.required('Health insurance rate is required'), validators.numeric('Health insurance rate must be a number')],
    pensionRate: [validators.required('Pension rate is required'), validators.numeric('Pension rate must be a number')],
    bonusRate: [validators.required('Bonus rate is required'), validators.numeric('Bonus rate must be a number')],
    performanceReviewCycle: [validators.required('Performance review cycle is required')],
    goalSettingCycle: [validators.required('Goal setting cycle is required')],
    trainingBudget: [validators.required('Training budget is required'), validators.numeric('Training budget must be a number')],
    recruitmentBudget: [validators.required('Recruitment budget is required'), validators.numeric('Recruitment budget must be a number')],
    assetDepreciationRate: [validators.required('Asset depreciation rate is required'), validators.numeric('Asset depreciation rate must be a number')],
    maintenanceBudget: [validators.required('Maintenance budget is required'), validators.numeric('Maintenance budget must be a number')],
    securityLevel: [validators.required('Security level is required')],
    dataRetentionPeriod: [validators.required('Data retention period is required'), validators.numeric('Data retention period must be a number')],
    backupFrequency: [validators.required('Backup frequency is required')],
    auditFrequency: [validators.required('Audit frequency is required')],
    complianceLevel: [validators.required('Compliance level is required')],
    reportingFrequency: [validators.required('Reporting frequency is required')],
    notificationSettings: [validators.required('Notification settings are required')],
    emailNotifications: [validators.required('Email notifications setting is required')],
    smsNotifications: [validators.required('SMS notifications setting is required')],
    pushNotifications: [validators.required('Push notifications setting is required')],
    systemMaintenance: [validators.required('System maintenance setting is required')],
    autoBackup: [validators.required('Auto backup setting is required')],
    dataEncryption: [validators.required('Data encryption setting is required')],
    twoFactorAuth: [validators.required('Two factor authentication setting is required')],
    sessionTimeout: [validators.required('Session timeout is required'), validators.numeric('Session timeout must be a number')],
    passwordPolicy: [validators.required('Password policy is required')],
    loginAttempts: [validators.required('Login attempts limit is required'), validators.numeric('Login attempts must be a number')],
    accountLockout: [validators.required('Account lockout setting is required')],
    ipWhitelist: [validators.required('IP whitelist setting is required')],
    apiRateLimit: [validators.required('API rate limit is required'), validators.numeric('API rate limit must be a number')],
    logLevel: [validators.required('Log level is required')],
    debugMode: [validators.required('Debug mode setting is required')],
    maintenanceMode: [validators.required('Maintenance mode setting is required')],
    systemVersion: [validators.required('System version is required')],
    lastUpdated: [validators.required('Last updated is required')],
    updatedBy: [validators.required('Updated by is required')],
    createdBy: [validators.required('Created by is required')],
    createdAt: [validators.required('Created at is required')],
    updatedAt: [validators.required('Updated at is required')]
  },
  email: {
    smtpHost: [validators.required('SMTP host is required')],
    smtpPort: [validators.required('SMTP port is required'), validators.numeric('SMTP port must be a number')],
    smtpUsername: [validators.required('SMTP username is required')],
    smtpPassword: [validators.required('SMTP password is required')],
    smtpSecure: [validators.required('SMTP secure setting is required')],
    fromEmail: [validators.required('From email is required'), validators.email('Invalid from email format')],
    fromName: [validators.required('From name is required')],
    replyToEmail: [validators.email('Invalid reply-to email format')],
    replyToName: [validators.required('Reply-to name is required')],
    emailTemplate: [validators.required('Email template is required')],
    emailSignature: [validators.required('Email signature is required')],
    emailFooter: [validators.required('Email footer is required')],
    emailHeader: [validators.required('Email header is required')],
    emailLogo: [validators.required('Email logo is required')],
    emailTheme: [validators.required('Email theme is required')],
    emailFont: [validators.required('Email font is required')],
    emailFontSize: [validators.required('Email font size is required'), validators.numeric('Email font size must be a number')],
    emailLineHeight: [validators.required('Email line height is required'), validators.numeric('Email line height must be a number')],
    emailMargin: [validators.required('Email margin is required'), validators.numeric('Email margin must be a number')],
    emailPadding: [validators.required('Email padding is required'), validators.numeric('Email padding must be a number')],
    emailBackgroundColor: [validators.required('Email background color is required')],
    emailTextColor: [validators.required('Email text color is required')],
    emailLinkColor: [validators.required('Email link color is required')],
    emailBorderColor: [validators.required('Email border color is required')],
    emailBorderWidth: [validators.required('Email border width is required'), validators.numeric('Email border width must be a number')],
    emailBorderRadius: [validators.required('Email border radius is required'), validators.numeric('Email border radius must be a number')],
    emailShadow: [validators.required('Email shadow setting is required')],
    emailShadowColor: [validators.required('Email shadow color is required')],
    emailShadowBlur: [validators.required('Email shadow blur is required'), validators.numeric('Email shadow blur must be a number')],
    emailShadowSpread: [validators.required('Email shadow spread is required'), validators.numeric('Email shadow spread must be a number')],
    emailShadowX: [validators.required('Email shadow X offset is required'), validators.numeric('Email shadow X offset must be a number')],
    emailShadowY: [validators.required('Email shadow Y offset is required'), validators.numeric('Email shadow Y offset must be a number')],
    emailTestMode: [validators.required('Email test mode setting is required')],
    emailTestRecipient: [validators.email('Invalid test recipient email format')],
    emailTestSubject: [validators.required('Email test subject is required')],
    emailTestBody: [validators.required('Email test body is required')],
    emailTestAttachment: [validators.required('Email test attachment setting is required')],
    emailTestSchedule: [validators.required('Email test schedule is required')],
    emailTestFrequency: [validators.required('Email test frequency is required')],
    emailTestLastSent: [validators.required('Email test last sent is required')],
    emailTestNextSend: [validators.required('Email test next send is required')],
    emailTestStatus: [validators.required('Email test status is required')],
    emailTestError: [validators.required('Email test error is required')],
    emailTestSuccess: [validators.required('Email test success is required')],
    emailTestCount: [validators.required('Email test count is required'), validators.numeric('Email test count must be a number')],
    emailTestLimit: [validators.required('Email test limit is required'), validators.numeric('Email test limit must be a number')],
    emailTestRemaining: [validators.required('Email test remaining is required'), validators.numeric('Email test remaining must be a number')],
    emailTestExpiry: [validators.required('Email test expiry is required')],
    emailTestCreated: [validators.required('Email test created is required')],
    emailTestUpdated: [validators.required('Email test updated is required')]
  }
};

export default {
  validators,
  validateField,
  validateFields,
  validateFormData,
  validateAndSanitizeFormData,
  sanitizeInput,
  commonFieldDefinitions,
  settingsValidationRules
};