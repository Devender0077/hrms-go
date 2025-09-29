import React from 'react';
import { Icon } from "@iconify/react";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-content2 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {children}
      </div>
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
  iconColor?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  iconColor = "from-primary-500 to-secondary-500",
  actions 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`p-3 bg-gradient-to-br ${iconColor} rounded-xl`}>
            <Icon icon={icon} className="text-foreground text-2xl" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-default-600 mt-1">{description}</p>
        </div>
      </div>
      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
export { PageHeader };
