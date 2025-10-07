import { useAuthenticatedAPI } from '../hooks/useAuthenticatedAPI';

export interface SettingsData {
  [category: string]: {
    [key: string]: any;
  };
}

// Create a settings service that uses the authenticated API hook
export const useSettingsAPI = () => {
  const { apiRequest } = useAuthenticatedAPI();

  return {
    // Get all settings
    async getAll(): Promise<SettingsData> {
      const response = await apiRequest('/settings', { method: 'GET' });
      return response.data;
    },

    // Get settings by category
    async getByCategory(category: string): Promise<SettingsData> {
      const response = await apiRequest(`/settings?category=${category}`, { method: 'GET' });
      return response.data;
    },

    // Get public settings
    async getPublic(): Promise<SettingsData> {
      const response = await fetch('/api/v1/settings/public');
      const result = await response.json();
      return result.data;
    },

    // Update settings for a category
    async updateCategory(category: string, settings: Record<string, any>): Promise<void> {
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({ 
          category, 
          settings,
          audit: {
            action: 'update_category',
            resource: `settings.${category}`,
            details: `Updated ${Object.keys(settings).length} settings in ${category} category`
          }
        })
      });
    },

    // Update single setting
    async updateSetting(category: string, key: string, value: any, type: string = 'string'): Promise<void> {
      // Ensure value is properly formatted
      const formattedValue = typeof value === 'boolean' ? value : 
                           typeof value === 'number' ? value :
                           typeof value === 'object' ? JSON.stringify(value) : 
                           String(value);
      
      console.log('Frontend setting update:', { category, key, value: formattedValue, type });
      
      await apiRequest(`/settings/${category}/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          value: formattedValue, 
          type,
          audit: {
            action: 'update_setting',
            resource: `settings.${category}.${key}`,
            details: `Updated setting ${key} in ${category} category to: ${JSON.stringify(formattedValue)}`
          }
        })
      });
    },

    // Reset settings
    async reset(category?: string): Promise<void> {
      await apiRequest('/settings/reset', {
        method: 'POST',
        body: JSON.stringify({ 
          category,
          audit: {
            action: 'reset_settings',
            resource: category ? `settings.${category}` : 'settings',
            details: category ? `Reset all settings in ${category} category` : 'Reset all system settings'
          }
        })
      });
    },

    // Export settings with audit logging
    async exportSettings(categories?: string[]): Promise<void> {
      await apiRequest('/settings/export', {
        method: 'POST',
        body: JSON.stringify({ 
          categories,
          audit: {
            action: 'export_settings',
            resource: 'settings',
            details: categories ? `Exported settings for categories: ${categories.join(', ')}` : 'Exported all settings'
          }
        })
      });
    },

    // Import settings with audit logging
    async importSettings(settings: Record<string, any>): Promise<void> {
      await apiRequest('/settings/import', {
        method: 'POST',
        body: JSON.stringify({ 
          settings,
          audit: {
            action: 'import_settings',
            resource: 'settings',
            details: `Imported settings for categories: ${Object.keys(settings).join(', ')}`
          }
        })
      });
    }
  };
};
