import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createSettingsAPI, SettingsData } from '../services/settings-service';
import { useAuth } from './auth-context';
import { dynamicTheme, ThemeColors } from '../utils/dynamic-theme';
import { applySettingsFeature, applyAllSettingsFeatures } from '../utils/settings-features';

interface SettingsContextType {
  settings: SettingsData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateSetting: (category: string, key: string, value: any, type?: string) => Promise<void>;
  updateCategory: (category: string, settings: Record<string, any>) => Promise<void>;
  saveAllSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  getSetting: (category: string, key: string, defaultValue?: any) => any;
  getSiteName: () => string;
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getAccentColor: () => string;
  getCompanyName: () => string;
  getCompanyEmail: () => string;
  getCompanyPhone: () => string;
  getCompanyAddress: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({
    general: {},
    company: {},
    email: {},
    notification: {},
    security: {},
    integration: {},
    backup: {},
    workflow: {},
    reports: {},
    api: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settingsAPI = createSettingsAPI();

  const loadSettings = async () => {
    // Only load settings if user is authenticated
    if (!user || authLoading) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await settingsAPI.getAll();
      setSettings(data);
      
      // Update page title dynamically
      const siteName = data.general?.siteName || 'HRMS Platform';
      document.title = `${siteName} - Human Resource Management System`;
      
      // Apply all settings features
      applyAllSettingsFeatures(data);
      
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };


  const updateSetting = async (category: string, key: string, value: any, type?: string) => {
    // Only update if user is authenticated
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update local state immediately for better UX
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));

      // Persist to backend
      await settingsAPI.updateSetting(category, key, value, type);

      // Apply changes immediately - handle boolean values properly
      const updatedSettings = { ...settings, [category]: { ...settings[category], [key]: value } };
      applySettingsFeature(key, value, updatedSettings);

    } catch (err) {
      console.error('Failed to update setting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      
      // Revert local state on error
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: prev[category]?.[key] // Revert to previous value
        }
      }));
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (category: string, categorySettings: Record<string, any>) => {
    // Only update if user is authenticated
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update local state immediately
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          ...categorySettings
        }
      }));

      // Persist to backend
      await settingsAPI.updateCategory(category, categorySettings);

      // Apply all changes immediately
      const updatedSettings = { ...settings, [category]: { ...settings[category], ...categorySettings } };
      Object.keys(categorySettings).forEach(key => {
        applySettingsFeature(key, categorySettings[key], updatedSettings);
      });

    } catch (err) {
      console.error('Failed to update category:', err);
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Force apply all current settings to ensure everything is up to date
      applyAllSettingsFeatures(settings);
      
      // Show success message briefly
      setTimeout(() => {
        setSaving(false);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setSaving(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const getSetting = (category: string, key: string, defaultValue: any = null) => {
    return settings[category]?.[key] ?? defaultValue;
  };

  // Convenience methods for commonly used settings
  const getSiteName = () => getSetting('general', 'siteName', 'HRMS Platform');
  const getPrimaryColor = () => getSetting('general', 'primaryColor', '#3b82f6');
  const getSecondaryColor = () => getSetting('general', 'secondaryColor', '#1e40af');
  const getAccentColor = () => getSetting('general', 'accentColor', '#60a5fa');
  const getCompanyName = () => getSetting('company', 'company_name', 'Your Company');
  const getCompanyEmail = () => getSetting('company', 'company_email', 'contact@yourcompany.com');
  const getCompanyPhone = () => getSetting('company', 'company_phone', '+1-234-567-8900');
  const getCompanyAddress = () => getSetting('company', 'company_address', '123 Business Street, City, State 12345');

  useEffect(() => {
    loadSettings();
  }, [user, authLoading]);

  const value: SettingsContextType = {
    settings,
    loading,
    saving,
    error,
    updateSetting,
    updateCategory,
    saveAllSettings,
    refreshSettings,
    getSetting,
    getSiteName,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getCompanyName,
    getCompanyEmail,
    getCompanyPhone,
    getCompanyAddress
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
