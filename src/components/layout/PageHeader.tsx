import React from 'react';
import { Icon } from '@iconify/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-default-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="p-3 bg-primary-100 rounded-xl">
                <Icon icon={icon} className="text-primary-600 text-2xl" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-default-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
