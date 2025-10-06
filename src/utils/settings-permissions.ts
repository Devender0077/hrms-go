// Settings permissions and role-based access control

export interface UserRole {
  id: number;
  name: string;
  permissions: string[];
}

export interface SettingsPermission {
  category: string;
  permission: string;
  description: string;
  requiredRole?: string;
}

// Define permissions for each settings category
export const SETTINGS_PERMISSIONS: Record<string, SettingsPermission[]> = {
  general: [
    { category: 'general', permission: 'settings.general.view', description: 'View general settings' },
    { category: 'general', permission: 'settings.general.edit', description: 'Edit general settings' }
  ],
  company: [
    { category: 'company', permission: 'settings.company.view', description: 'View company settings' },
    { category: 'company', permission: 'settings.company.edit', description: 'Edit company settings' }
  ],
  localization: [
    { category: 'localization', permission: 'settings.localization.view', description: 'View localization settings' },
    { category: 'localization', permission: 'settings.localization.edit', description: 'Edit localization settings' }
  ],
  email: [
    { category: 'email', permission: 'settings.email.view', description: 'View email settings' },
    { category: 'email', permission: 'settings.email.edit', description: 'Edit email settings' },
    { category: 'email', permission: 'settings.email.test', description: 'Test email configuration' }
  ],
  notification: [
    { category: 'notification', permission: 'settings.notification.view', description: 'View notification settings' },
    { category: 'notification', permission: 'settings.notification.edit', description: 'Edit notification settings' }
  ],
  integration: [
    { category: 'integration', permission: 'settings.integration.view', description: 'View integration settings' },
    { category: 'integration', permission: 'settings.integration.edit', description: 'Edit integration settings' },
    { category: 'integration', permission: 'settings.integration.connect', description: 'Connect third-party services' }
  ],
  security: [
    { category: 'security', permission: 'settings.security.view', description: 'View security settings' },
    { category: 'security', permission: 'settings.security.edit', description: 'Edit security settings' },
    { category: 'security', permission: 'settings.security.advanced', description: 'Access advanced security settings' }
  ],
  backup: [
    { category: 'backup', permission: 'settings.backup.view', description: 'View backup settings' },
    { category: 'backup', permission: 'settings.backup.edit', description: 'Edit backup settings' },
    { category: 'backup', permission: 'settings.backup.execute', description: 'Execute backup operations' }
  ],
  api: [
    { category: 'api', permission: 'settings.api.view', description: 'View API settings' },
    { category: 'api', permission: 'settings.api.edit', description: 'Edit API settings' },
    { category: 'api', permission: 'settings.api.manage', description: 'Manage API keys' }
  ],
  workflow: [
    { category: 'workflow', permission: 'settings.workflow.view', description: 'View workflow settings' },
    { category: 'workflow', permission: 'settings.workflow.edit', description: 'Edit workflow settings' }
  ],
  reports: [
    { category: 'reports', permission: 'settings.reports.view', description: 'View reports settings' },
    { category: 'reports', permission: 'settings.reports.edit', description: 'Edit reports settings' }
  ],
  'offer-letter': [
    { category: 'offer-letter', permission: 'settings.offer-letter.view', description: 'View offer letter settings' },
    { category: 'offer-letter', permission: 'settings.offer-letter.edit', description: 'Edit offer letter settings' }
  ],
  'joining-letter': [
    { category: 'joining-letter', permission: 'settings.joining-letter.view', description: 'View joining letter settings' },
    { category: 'joining-letter', permission: 'settings.joining-letter.edit', description: 'Edit joining letter settings' }
  ],
  certificate: [
    { category: 'certificate', permission: 'settings.certificate.view', description: 'View certificate settings' },
    { category: 'certificate', permission: 'settings.certificate.edit', description: 'Edit certificate settings' }
  ],
  noc: [
    { category: 'noc', permission: 'settings.noc.view', description: 'View NOC settings' },
    { category: 'noc', permission: 'settings.noc.edit', description: 'Edit NOC settings' }
  ],
  seo: [
    { category: 'seo', permission: 'settings.seo.view', description: 'View SEO settings' },
    { category: 'seo', permission: 'settings.seo.edit', description: 'Edit SEO settings' }
  ],
  cache: [
    { category: 'cache', permission: 'settings.cache.view', description: 'View cache settings' },
    { category: 'cache', permission: 'settings.cache.edit', description: 'Edit cache settings' },
    { category: 'cache', permission: 'settings.cache.clear', description: 'Clear cache' }
  ],
  webhook: [
    { category: 'webhook', permission: 'settings.webhook.view', description: 'View webhook settings' },
    { category: 'webhook', permission: 'settings.webhook.edit', description: 'Edit webhook settings' },
    { category: 'webhook', permission: 'settings.webhook.manage', description: 'Manage webhooks' }
  ],
  'cookie-consent': [
    { category: 'cookie-consent', permission: 'settings.cookie-consent.view', description: 'View cookie consent settings' },
    { category: 'cookie-consent', permission: 'settings.cookie-consent.edit', description: 'Edit cookie consent settings' }
  ],
  chatgpt: [
    { category: 'chatgpt', permission: 'settings.chatgpt.view', description: 'View ChatGPT settings' },
    { category: 'chatgpt', permission: 'settings.chatgpt.edit', description: 'Edit ChatGPT settings' }
  ],
  'google-calendar': [
    { category: 'google-calendar', permission: 'settings.google-calendar.view', description: 'View Google Calendar settings' },
    { category: 'google-calendar', permission: 'settings.google-calendar.edit', description: 'Edit Google Calendar settings' }
  ],
  'export-import': [
    { category: 'export-import', permission: 'settings.export-import.view', description: 'View export/import settings' },
    { category: 'export-import', permission: 'settings.export-import.export', description: 'Export settings' },
    { category: 'export-import', permission: 'settings.export-import.import', description: 'Import settings' }
  ]
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'super_admin': [
    // All permissions
    'settings.*'
  ],
  'admin': [
    'settings.general.view', 'settings.general.edit',
    'settings.company.view', 'settings.company.edit',
    'settings.localization.view', 'settings.localization.edit',
    'settings.email.view', 'settings.email.edit', 'settings.email.test',
    'settings.notification.view', 'settings.notification.edit',
    'settings.integration.view', 'settings.integration.edit', 'settings.integration.connect',
    'settings.security.view', 'settings.security.edit',
    'settings.backup.view', 'settings.backup.edit', 'settings.backup.execute',
    'settings.api.view', 'settings.api.edit', 'settings.api.manage',
    'settings.workflow.view', 'settings.workflow.edit',
    'settings.reports.view', 'settings.reports.edit',
    'settings.offer-letter.view', 'settings.offer-letter.edit',
    'settings.joining-letter.view', 'settings.joining-letter.edit',
    'settings.certificate.view', 'settings.certificate.edit',
    'settings.noc.view', 'settings.noc.edit',
    'settings.seo.view', 'settings.seo.edit',
    'settings.cache.view', 'settings.cache.edit', 'settings.cache.clear',
    'settings.webhook.view', 'settings.webhook.edit', 'settings.webhook.manage',
    'settings.cookie-consent.view', 'settings.cookie-consent.edit',
    'settings.chatgpt.view', 'settings.chatgpt.edit',
    'settings.google-calendar.view', 'settings.google-calendar.edit',
    'settings.export-import.view', 'settings.export-import.export', 'settings.export-import.import'
  ],
  'hr_manager': [
    'settings.general.view',
    'settings.company.view',
    'settings.localization.view',
    'settings.email.view',
    'settings.notification.view', 'settings.notification.edit',
    'settings.workflow.view', 'settings.workflow.edit',
    'settings.reports.view', 'settings.reports.edit',
    'settings.offer-letter.view', 'settings.offer-letter.edit',
    'settings.joining-letter.view', 'settings.joining-letter.edit',
    'settings.certificate.view', 'settings.certificate.edit',
    'settings.noc.view', 'settings.noc.edit'
  ],
  'manager': [
    'settings.general.view',
    'settings.company.view',
    'settings.notification.view',
    'settings.workflow.view',
    'settings.reports.view'
  ],
  'employee': [
    'settings.general.view'
  ]
};

// Permission checking utilities
export const hasPermission = (userRole: string, permission: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  // Super admin has all permissions
  if (rolePermissions.includes('settings.*')) {
    return true;
  }
  
  // Check specific permission
  return rolePermissions.includes(permission);
};

export const canViewSettingsCategory = (userRole: string, category: string): boolean => {
  return hasPermission(userRole, `settings.${category}.view`);
};

export const canEditSettingsCategory = (userRole: string, category: string): boolean => {
  return hasPermission(userRole, `settings.${category}.edit`);
};

export const canManageSettingsCategory = (userRole: string, category: string): boolean => {
  return hasPermission(userRole, `settings.${category}.manage`);
};

export const canExportSettings = (userRole: string): boolean => {
  return hasPermission(userRole, 'settings.export-import.export');
};

export const canImportSettings = (userRole: string): boolean => {
  return hasPermission(userRole, 'settings.export-import.import');
};

// Get accessible settings categories for a user role
export const getAccessibleSettingsCategories = (userRole: string): string[] => {
  const categories = Object.keys(SETTINGS_PERMISSIONS);
  return categories.filter(category => canViewSettingsCategory(userRole, category));
};

// Get editable settings categories for a user role
export const getEditableSettingsCategories = (userRole: string): string[] => {
  const categories = Object.keys(SETTINGS_PERMISSIONS);
  return categories.filter(category => canEditSettingsCategory(userRole, category));
};

// Check if user can perform specific action on settings
export const canPerformAction = (userRole: string, category: string, action: 'view' | 'edit' | 'manage' | 'test' | 'execute' | 'clear'): boolean => {
  const permission = `settings.${category}.${action}`;
  return hasPermission(userRole, permission);
};
