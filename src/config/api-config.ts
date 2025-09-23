// API configuration file for centralized API settings
    
    // Environment-based API URL configuration
    export const API_BASE_URL = 'http://localhost:8000/api/v1'; // Always use development URL
    
    // API endpoints configuration
    export const API_ENDPOINTS = {
      // Auth endpoints
      AUTH: {
        LOGIN: '/auth/login',
        FACE_LOGIN: '/auth/face-login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email'
      },
      
      // Employee endpoints
      EMPLOYEES: {
        BASE: '/employees',
        IMPORT: '/employees/import',
        EXPORT: '/employees/export'
      },
      
      // Organization endpoints
      ORGANIZATION: {
        BRANCHES: '/organization/branches',
        DEPARTMENTS: '/organization/departments',
        DESIGNATIONS: '/organization/designations',
        ORG_CHART: '/organization/chart'
      },
      
      // Attendance endpoints
      ATTENDANCE: {
        BASE: '/attendance',
        CHECK_IN: '/attendance/check-in',
        CHECK_OUT: '/attendance/check-out',
        REPORT: '/attendance/report',
        IMPORT: '/attendance/import'
      },
      
      // Leave endpoints
      LEAVE: {
        BASE: '/leaves',
        TYPES: '/leave-types',
        BALANCE: '/leave-balance'
      },
      
      // Document endpoints
      DOCUMENTS: {
        BASE: '/documents',
        CATEGORIES: '/documents/categories',
        EXPIRING: '/documents/expiring'
      },
      
      // Payroll endpoints
      PAYROLL: {
        BASE: '/payroll',
        COMPONENTS: '/payroll/components',
        PAYSLIPS: '/payroll/payslips',
        GENERATE: '/payroll/generate'
      },
      
      // Recruitment endpoints
      RECRUITMENT: {
        JOBS: '/recruitment/jobs',
        APPLICATIONS: '/recruitment/applications',
        CANDIDATES: '/recruitment/candidates',
        INTERVIEWS: '/recruitment/interviews'
      },
      
      // Performance endpoints
      PERFORMANCE: {
        REVIEWS: '/performance/reviews',
        GOALS: '/performance/goals',
        APPRAISALS: '/performance/appraisals'
      },
      
      // Training endpoints
      TRAINING: {
        PROGRAMS: '/training/programs',
        PARTICIPANTS: '/training/participants'
      },
      
      // Asset endpoints
      ASSETS: {
        BASE: '/assets',
        ASSIGNMENTS: '/assets/assignments',
        CATEGORIES: '/assets/categories'
      },
      
      // Announcement endpoints
      ANNOUNCEMENTS: {
        BASE: '/announcements'
      },
      
      // Event endpoints
      EVENTS: {
        BASE: '/events'
      },
      
      // Task endpoints
      TASKS: {
        BASE: '/tasks'
      },
      
      // Finance endpoints
      FINANCE: {
        ACCOUNTS: '/finance/accounts',
        TRANSACTIONS: '/finance/transactions',
        EXPENSES: '/finance/expenses',
        INCOME: '/finance/income'
      },
      
      // Settings endpoints
      SETTINGS: {
        BASE: '/settings',
        COMPANY: '/settings/company',
        EMAIL: '/settings/email',
        SYSTEM: '/settings/system'
      }
    };
    
    // API request timeout in milliseconds
    export const API_TIMEOUT = 30000;
    
    // API request headers
    export const getDefaultHeaders = (token?: string) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return headers;
    };
