import React from 'react';
import { Card, CardBody, Button, Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  icon?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  icon,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-6 ${className}`}
    >
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs className="mb-2">
                  {breadcrumbs.map((item, index) => (
                    <BreadcrumbItem
                      key={index}
                      href={item.href}
                      className={item.href ? 'text-primary hover:text-primary-600' : 'text-default-500'}
                    >
                      {item.label}
                    </BreadcrumbItem>
                  ))}
                </Breadcrumbs>
              )}

              {/* Title and Icon */}
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Icon icon={icon} className="text-primary text-xl" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-default-600 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Common page header variants
export const DashboardPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <PageHeader
    title={title}
    subtitle={subtitle}
    actions={actions}
    icon="lucide:layout-dashboard"
    breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' }
    ]}
  />
);

export const EmployeePageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <PageHeader
    title={title}
    subtitle={subtitle}
    actions={actions}
    icon="lucide:users"
    breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Employees', href: '/dashboard/employees' }
    ]}
  />
);

export const LeavePageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <PageHeader
    title={title}
    subtitle={subtitle}
    actions={actions}
    icon="lucide:calendar-days"
    breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Leave Management', href: '/dashboard/leave' }
    ]}
  />
);

export const PayrollPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <PageHeader
    title={title}
    subtitle={subtitle}
    actions={actions}
    icon="lucide:dollar-sign"
    breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Payroll', href: '/dashboard/payroll' }
    ]}
  />
);

export const SettingsPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <PageHeader
    title={title}
    subtitle={subtitle}
    actions={actions}
    icon="lucide:settings"
    breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/dashboard/settings' }
    ]}
  />
);

export default PageHeader;