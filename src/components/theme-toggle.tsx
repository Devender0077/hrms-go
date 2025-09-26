import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTheme } from '../contexts/theme-context';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'solid' | 'bordered' | 'flat' | 'faded' | 'shadow' | 'ghost';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'light'
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      isIconOnly
      variant={variant}
      size={size}
      onPress={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`rounded-lg transition-all duration-200 ${className}`}
    >
      {theme === 'light' ? (
        <Icon 
          icon="lucide:moon" 
          className="text-xl transition-transform duration-200 hover:rotate-12" 
        />
      ) : (
        <Icon 
          icon="lucide:sun" 
          className="text-xl transition-transform duration-200 hover:rotate-12" 
        />
      )}
    </Button>
  );
};

export default ThemeToggle;
