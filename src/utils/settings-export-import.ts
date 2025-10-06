// Settings export/import utilities

export interface SettingsExportData {
  version: string;
  timestamp: string;
  settings: Record<string, any>;
  metadata: {
    exportedBy: string;
    exportType: 'full' | 'category';
    categories?: string[];
  };
}

export const exportSettings = (
  settings: Record<string, any>,
  categories?: string[],
  exportedBy: string = 'admin'
): SettingsExportData => {
  const filteredSettings = categories 
    ? Object.keys(settings)
        .filter(category => categories.includes(category))
        .reduce((acc, category) => {
          acc[category] = settings[category];
          return acc;
        }, {} as Record<string, any>)
    : settings;

  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    settings: filteredSettings,
    metadata: {
      exportedBy,
      exportType: categories ? 'category' : 'full',
      categories
    }
  };
};

export const importSettings = (exportData: SettingsExportData): Record<string, any> => {
  // Validate export data structure
  if (!exportData.version || !exportData.settings) {
    throw new Error('Invalid settings export file format');
  }

  // Check version compatibility
  if (exportData.version !== '1.0.0') {
    throw new Error(`Unsupported export version: ${exportData.version}`);
  }

  return exportData.settings;
};

export const downloadSettingsFile = (exportData: SettingsExportData, filename?: string): void => {
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `hrms-settings-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const readSettingsFile = (file: File): Promise<SettingsExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const exportData = JSON.parse(content) as SettingsExportData;
        resolve(exportData);
      } catch (error) {
        reject(new Error('Failed to parse settings file. Please ensure it\'s a valid JSON file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read settings file.'));
    };
    
    reader.readAsText(file);
  });
};

// Settings categories for selective export/import
export const SETTINGS_CATEGORIES = [
  { key: 'general', label: 'General Settings', description: 'Basic application settings' },
  { key: 'company', label: 'Company Settings', description: 'Company information and branding' },
  { key: 'localization', label: 'Localization', description: 'Language, timezone, and regional settings' },
  { key: 'email', label: 'Email Settings', description: 'SMTP and email configuration' },
  { key: 'notification', label: 'Notifications', description: 'Notification preferences and templates' },
  { key: 'security', label: 'Security', description: 'Security policies and authentication' },
  { key: 'backup', label: 'Backup Settings', description: 'Backup configuration and schedules' },
  { key: 'workflow', label: 'Workflow Settings', description: 'Approval workflows and automation' },
  { key: 'reports', label: 'Reports Settings', description: 'Report generation and scheduling' },
  { key: 'integrations', label: 'Integrations', description: 'Third-party service integrations' },
  { key: 'offerLetter', label: 'Offer Letter', description: 'Offer letter templates and automation' },
  { key: 'joiningLetter', label: 'Joining Letter', description: 'Joining letter templates and automation' },
  { key: 'certificate', label: 'Experience Certificate', description: 'Certificate templates and automation' },
  { key: 'noc', label: 'NOC Settings', description: 'No Objection Certificate templates' },
  { key: 'seo', label: 'SEO Settings', description: 'Search engine optimization settings' },
  { key: 'cache', label: 'Cache Settings', description: 'Caching configuration and management' },
  { key: 'webhook', label: 'Webhook Settings', description: 'Webhook configuration and events' },
  { key: 'cookieConsent', label: 'Cookie Consent', description: 'Cookie consent banner settings' },
  { key: 'chatgpt', label: 'ChatGPT Integration', description: 'AI assistant configuration' },
  { key: 'googleCalendar', label: 'Google Calendar', description: 'Google Calendar integration settings' }
] as const;

export type SettingsCategory = typeof SETTINGS_CATEGORIES[number]['key'];
