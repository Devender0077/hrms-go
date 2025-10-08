/**
 * Comprehensive Translation Utility
 * Auto-translates common UI elements
 */

export const translateCommonUI = (t: (key: string) => string) => {
  return {
    // Actions
    save: t('Save'),
    cancel: t('Cancel'),
    edit: t('Edit'),
    delete: t('Delete'),
    add: t('Add'),
    create: t('Create'),
    update: t('Update'),
    view: t('View'),
    search: t('Search'),
    filter: t('Filter'),
    export: t('Export'),
    import: t('Import'),
    submit: t('Submit'),
    close: t('Close'),
    
    // Status
    active: t('Active'),
    inactive: t('Inactive'),
    pending: t('Pending'),
    approved: t('Approved'),
    rejected: t('Rejected'),
    loading: t('Loading'),
    success: t('Success'),
    error: t('Error'),
    warning: t('Warning'),
    
    // Common Labels
    name: t('Name'),
    email: t('Email'),
    phone: t('Phone'),
    address: t('Address'),
    status: t('Status'),
    date: t('Date'),
    time: t('Time'),
    actions: t('Actions'),
    description: t('Description'),
    
    // Navigation
    dashboard: t('Dashboard'),
    employees: t('Employees'),
    attendance: t('Attendance'),
    leave: t('Leave Applications'),
    payroll: t('Payroll Overview'),
    settings: t('Settings'),
    users: t('Users'),
    roles: t('Roles & Permissions'),
  };
};
