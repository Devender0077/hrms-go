import React from 'react';
import { Spinner } from '@heroui/react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
  fullScreen = false
}) => {
  const spinnerElement = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <Spinner size={size} color={color} />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-default-600 text-sm"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

// Inline loading spinner for buttons and small components
export const InlineSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}> = ({ size = 'sm', color = 'default' }) => (
  <Spinner size={size} color={color} />
);

// Page loading spinner
export const PageLoadingSpinner: React.FC<{
  text?: string;
}> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Card loading spinner
export const CardLoadingSpinner: React.FC<{
  text?: string;
}> = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);

// Table loading spinner
export const TableLoadingSpinner: React.FC<{
  text?: string;
}> = ({ text = 'Loading data...' }) => (
  <div className="flex items-center justify-center p-4">
    <LoadingSpinner size="sm" text={text} />
  </div>
);

export default LoadingSpinner;