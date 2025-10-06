// Mapping of pages to their appropriate SVG illustrations
export const ILLUSTRATION_MAPPING = {
  // Authentication
  'login': 'login.svg',
  'signup': 'sign-up.svg',

  // Dashboard
  'dashboard': 'dashboard.svg',

  // Employee Management
  'employee': 'employee.svg',
  'employees': 'employee.svg',

  // Recruitment
  'recruitment': 'recruitment.svg',
  'jobs': 'job-offers.svg',
  'candidates': 'resume.svg',
  'interviews': 'interview.svg',

  // Payroll
  'payroll': 'payroll.svg',

  // Time & Attendance
  'attendance': 'time-management.svg',
  'timekeeping': 'time-management.svg',

  // Leave Management
  'leave': 'date-picker.svg',

  // Tasks & Goals
  'tasks': 'add-tasks.svg',
  'task': 'add-tasks.svg',
  'goals': 'goals.svg',
  'goal': 'goals.svg',

  // Assets
  'assets': 'file-manager.svg',
  'asset': 'file-manager.svg',

  // Reports
  'reports': 'report.svg',
  'report': 'report.svg',

  // Expenses
  'expenses': 'spreadsheets.svg',
  'expense': 'spreadsheets.svg',

  // Settings
  'settings': 'settings.svg',
  'setting': 'settings.svg',

  // User Management
  'users': 'team.svg',
  'user': 'team.svg',
  'roles': 'roles.svg',
  'role': 'roles.svg',

  // Audit & Reviews
  'audit': 'lighthouse.svg',
  'audit-logs': 'lighthouse.svg',
  'reviews': 'certificate.svg',
  'review': 'certificate.svg',
  'performance': 'growth-analytics.svg',

  // Communication
  'trips': 'walk-in-the-city.svg',
  'announcements': 'happy-announcement.svg',
  'meetings': 'video-call.svg',

  // Calendar
  'calendar': 'date-picker.svg',

  // Documents
  'documents': 'google-docs.svg',
  'document': 'google-docs.svg',

  // HR Setup
  'hr-setup': 'hr-presentation.svg',
  'hr-system-setup': 'hr-presentation.svg',

  // Training
  'training': 'certificate.svg',
  'training-programs': 'certificate.svg',

  // Employee Lifecycle
  'awards': 'certificate.svg',
  'promotions': 'growth-analytics.svg',
  'warnings': 'alert.svg',
  'resignations': 'log-out.svg',
  'terminations': 'user-x.svg',
  'transfers': 'arrow-right-left.svg',
  'complaints': 'message-square.svg',

  // Time Tracking
  'time-tracking': 'time-management.svg',
  'time-entries': 'time-management.svg',

  // Media & Content
  'media-library': 'file-manager.svg',
  'landing-page': 'globe.svg',

  // Default fallback
  'default': 'dashboard.svg'
};

export const getIllustrationPath = (pageType: string): string => {
  return ILLUSTRATION_MAPPING[pageType as keyof typeof ILLUSTRATION_MAPPING] || ILLUSTRATION_MAPPING.default;
};

export default ILLUSTRATION_MAPPING;
