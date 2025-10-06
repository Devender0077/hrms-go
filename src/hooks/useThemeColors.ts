import { useState, useEffect } from 'react';
import { useAuthenticatedAPI } from './useAuthenticatedAPI';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export const useThemeColors = (): { colors: ThemeColors; loading: boolean; error: string | null } => {
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#3b82f6',
    secondary: '#1e40af', 
    accent: '#60a5fa'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiRequest } = useAuthenticatedAPI();

  useEffect(() => {
    const fetchThemeColors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get colors from settings
        const response = await apiRequest('/settings', { method: 'GET' });
        const settings = response.data;
        
        // Extract colors from settings
        let primaryColor = '#3b82f6';
        let secondaryColor = '#1e40af';
        let accentColor = '#60a5fa';
        
        // Check different possible locations for color settings
        if (settings?.general?.primaryColor) {
          primaryColor = settings.general.primaryColor;
        } else if (settings?.primaryColor) {
          primaryColor = settings.primaryColor;
        }
        
        // Calculate secondary and accent colors based on primary
        if (primaryColor !== '#3b82f6') {
          // Convert hex to RGB for manipulation
          const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : null;
          };
          
          const rgbToHex = (r: number, g: number, b: number) => {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          };
          
          const primaryRgb = hexToRgb(primaryColor);
          if (primaryRgb) {
            // Darker version for secondary
            secondaryColor = rgbToHex(
              Math.max(0, primaryRgb.r - 40),
              Math.max(0, primaryRgb.g - 40),
              Math.max(0, primaryRgb.b - 40)
            );
            
            // Lighter version for accent
            accentColor = rgbToHex(
              Math.min(255, primaryRgb.r + 40),
              Math.min(255, primaryRgb.g + 40),
              Math.min(255, primaryRgb.b + 40)
            );
          }
        }
        
        setColors({
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor
        });
        
      } catch (err) {
        console.error('Error fetching theme colors:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch theme colors');
        // Keep default colors on error
      } finally {
        setLoading(false);
      }
    };

    fetchThemeColors();
  }, [apiRequest]);

  return { colors, loading, error };
};

export default useThemeColors;
