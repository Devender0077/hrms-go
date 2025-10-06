/**
 * Settings Features Utility
 * Handles various settings features and their effects
 */

import { dynamicTheme } from './dynamic-theme';

export interface SettingsFeature {
  key: string;
  category: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'color' | 'select';
  defaultValue: any;
  options?: { value: any; label: string }[];
  applyEffect: (value: any, settings: any) => void;
}

export const SETTINGS_FEATURES: SettingsFeature[] = [
  {
    key: 'primaryColor',
    category: 'general',
    name: 'Primary Color',
    description: 'Main brand color used throughout the application',
    type: 'color',
    defaultValue: '#3b82f6',
    applyEffect: (value: string, settings: any) => {
      dynamicTheme.updateColors({
        primary: value,
        secondary: settings.general?.secondaryColor || '#1e40af',
        accent: settings.general?.accentColor || '#60a5fa'
      });
    }
  },
  {
    key: 'secondaryColor',
    category: 'general',
    name: 'Secondary Color',
    description: 'Secondary brand color for accents',
    type: 'color',
    defaultValue: '#1e40af',
    applyEffect: (value: string, settings: any) => {
      dynamicTheme.updateColors({
        primary: settings.general?.primaryColor || '#3b82f6',
        secondary: value,
        accent: settings.general?.accentColor || '#60a5fa'
      });
    }
  },
  {
    key: 'accentColor',
    category: 'general',
    name: 'Accent Color',
    description: 'Accent color for highlights and special elements',
    type: 'color',
    defaultValue: '#60a5fa',
    applyEffect: (value: string, settings: any) => {
      dynamicTheme.updateColors({
        primary: settings.general?.primaryColor || '#3b82f6',
        secondary: settings.general?.secondaryColor || '#1e40af',
        accent: value
      });
    }
  },
  {
    key: 'maintenanceMode',
    category: 'general',
    name: 'Maintenance Mode',
    description: 'Enable maintenance mode to restrict access to the site',
    type: 'boolean',
    defaultValue: false,
    applyEffect: (value: boolean) => {
      dynamicTheme.applyMaintenanceMode(value);
    }
  },
  {
    key: 'debugMode',
    category: 'general',
    name: 'Debug Mode',
    description: 'Enable debug mode for development and troubleshooting',
    type: 'boolean',
    defaultValue: false,
    applyEffect: (value: boolean) => {
      dynamicTheme.applyDebugMode(value);
    }
  },
  {
    key: 'siteName',
    category: 'general',
    name: 'Site Name',
    description: 'The name of your HRMS application',
    type: 'string',
    defaultValue: 'HRMS Platform',
    applyEffect: (value: string) => {
      document.title = `${value} - Human Resource Management System`;
    }
  },
  {
    key: 'autoBackup',
    category: 'general',
    name: 'Auto Backup',
    description: 'Enable automatic backups of system data',
    type: 'boolean',
    defaultValue: false,
    applyEffect: (value: boolean) => {
      // This would typically trigger backup scheduling
      console.log('Auto backup:', value ? 'enabled' : 'disabled');
    }
  },
  {
    key: 'timezone',
    category: 'general',
    name: 'Timezone',
    description: 'Default timezone for the application',
    type: 'select',
    defaultValue: 'UTC',
    options: [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'Eastern Time' },
      { value: 'America/Chicago', label: 'Central Time' },
      { value: 'America/Denver', label: 'Mountain Time' },
      { value: 'America/Los_Angeles', label: 'Pacific Time' },
      { value: 'Europe/London', label: 'London' },
      { value: 'Europe/Paris', label: 'Paris' },
      { value: 'Asia/Tokyo', label: 'Tokyo' },
      { value: 'Asia/Shanghai', label: 'Shanghai' },
      { value: 'Australia/Sydney', label: 'Sydney' }
    ],
    applyEffect: (value: string) => {
      // This would typically update the application's timezone handling
      console.log('Timezone updated to:', value);
    }
  },
  {
    key: 'dateFormat',
    category: 'general',
    name: 'Date Format',
    description: 'Default date format for the application',
    type: 'select',
    defaultValue: 'MM/DD/YYYY',
    options: [
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
      { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
    ],
    applyEffect: (value: string) => {
      // This would typically update date formatting throughout the app
      console.log('Date format updated to:', value);
    }
  },
  {
    key: 'timeFormat',
    category: 'general',
    name: 'Time Format',
    description: 'Default time format for the application',
    type: 'select',
    defaultValue: '12',
    options: [
      { value: '12', label: '12 Hour (AM/PM)' },
      { value: '24', label: '24 Hour' }
    ],
    applyEffect: (value: string) => {
      // This would typically update time formatting throughout the app
      console.log('Time format updated to:', value);
    }
  },
  {
    key: 'currency',
    category: 'general',
    name: 'Currency',
    description: 'Default currency for the application',
    type: 'select',
    defaultValue: 'USD',
    options: [
      { value: 'USD', label: 'US Dollar ($)' },
      { value: 'EUR', label: 'Euro (€)' },
      { value: 'GBP', label: 'British Pound (£)' },
      { value: 'JPY', label: 'Japanese Yen (¥)' },
      { value: 'CAD', label: 'Canadian Dollar (C$)' },
      { value: 'AUD', label: 'Australian Dollar (A$)' },
      { value: 'INR', label: 'Indian Rupee (₹)' }
    ],
    applyEffect: (value: string) => {
      // This would typically update currency formatting throughout the app
      console.log('Currency updated to:', value);
    }
  },
  {
    key: 'language',
    category: 'general',
    name: 'Language',
    description: 'Default language for the application',
    type: 'select',
    defaultValue: 'en',
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'it', label: 'Italian' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'zh', label: 'Chinese' },
      { value: 'ja', label: 'Japanese' },
      { value: 'ko', label: 'Korean' },
      { value: 'ar', label: 'Arabic' }
    ],
    applyEffect: (value: string) => {
      // This would typically update the application's language
      console.log('Language updated to:', value);
    }
  }
];

export const applySettingsFeature = (key: string, value: any, settings: any) => {
  const feature = SETTINGS_FEATURES.find(f => f.key === key);
  if (feature) {
    try {
      feature.applyEffect(value, settings);
    } catch (error) {
      console.error(`Error applying setting ${key}:`, error);
    }
  }
};

export const applyAllSettingsFeatures = (settings: any) => {
  SETTINGS_FEATURES.forEach(feature => {
    const value = settings[feature.category]?.[feature.key];
    // For boolean values, explicitly handle false values to ensure proper cleanup
    if (value !== undefined || (feature.type === 'boolean' && settings[feature.category]?.[feature.key] === false)) {
      applySettingsFeature(feature.key, value, settings);
    }
  });
};
