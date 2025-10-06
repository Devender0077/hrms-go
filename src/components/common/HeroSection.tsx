import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import SVGIllustration from './SVGIllustration';
import { getIllustrationPath } from './IllustrationMapping';
import { useSettings } from '../../contexts/settings-context';

export interface HeroAction {
  label: string;
  icon?: string;
  onPress: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  isDisabled?: boolean;
  isLoading?: boolean;
}

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  illustration?: 'login' | 'dashboard' | 'employee' | 'recruitment' | 'payroll' | 'attendance' | 'leave' | 'settings' | 'task' | 'asset' | 'report' | 'goal' | 'expense' | 'interview' | 'performance' | 'users' | 'audit' | 'roles' | 'trips' | 'announcements' | 'meetings' | 'training' | 'awards' | 'promotions' | 'time-tracking' | 'media-library' | 'hr-setup' | 'custom';
  customIllustration?: React.ReactNode;
  actions?: HeroAction[];
  gradient?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'custom';
  customGradient?: string;
  className?: string;
}

const getGradientClasses = (gradient: string) => {
  switch (gradient) {
    case 'primary':
      return 'bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600';
    case 'secondary':
      return 'bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600';
    case 'success':
      return 'bg-gradient-to-br from-success-500 via-success-600 to-primary-600';
    case 'warning':
      return 'bg-gradient-to-br from-warning-500 via-warning-600 to-primary-600';
    case 'danger':
      return 'bg-gradient-to-br from-danger-500 via-danger-600 to-primary-600';
    default:
      return 'bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600';
  }
};

const getIllustration = (type: string, customIllustration?: React.ReactNode, colors?: { primary: string; secondary: string; accent: string }) => {
  if (customIllustration) return customIllustration;
  
  const illustrationPath = getIllustrationPath(type);
  
  return (
    <SVGIllustration
      src={illustrationPath}
      primaryColor={colors?.primary}
      secondaryColor={colors?.secondary}
      accentColor={colors?.accent}
    />
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  icon,
  illustration = 'dashboard',
  customIllustration,
  actions = [],
  gradient = 'primary',
  customGradient,
  className = '',
}) => {
  // Use settings context for dynamic colors
  const { getPrimaryColor, getSecondaryColor, getAccentColor, loading: settingsLoading } = useSettings();
  
  // Use default colors if settings are still loading or not available
  const colors = settingsLoading ? 
    { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' } :
    { 
      primary: getPrimaryColor(), 
      secondary: getSecondaryColor(), 
      accent: getAccentColor() 
    };
  
  const gradientClasses = customGradient || getGradientClasses(gradient);
  const illustrationComponent = getIllustration(illustration, customIllustration, colors);

  return (
            <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl ${gradientClasses} p-6 sm:p-8 text-white mb-6 ${className}`}
    >
      {/* Background decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 -left-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Text Content */}
        <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
            <div className="flex items-center gap-3 mb-4">
                {icon && (
                <div className="p-2 bg-white/20 rounded-xl">
                  <Icon icon={icon} className="text-white text-2xl" />
                  </div>
                )}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-white/80 text-sm sm:text-base font-medium">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
                {description && (
              <p className="text-white/90 text-sm sm:text-base mb-6 max-w-lg">
                    {description}
                  </p>
                )}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    color={action.color || 'default'}
                    variant={action.variant || 'solid'}
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                    startContent={action.icon && !action.isLoading ? <Icon icon={action.icon} className="w-4 h-4" /> : null}
                    onPress={action.onPress}
                    isDisabled={action.isDisabled}
                    isLoading={action.isLoading}
                  >
                    {action.label}
                  </Button>
                ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Illustration */}
              <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80"
            >
              {illustrationComponent}
              </motion.div>
          </div>
    </motion.div>
  );
};

// Pre-configured hero sections for common pages
export const EmployeeHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="employee"
    icon="lucide:users"
    gradient="primary"
  />
);

export const PayrollHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="payroll"
    icon="lucide:credit-card"
    gradient="success"
  />
);

export const LeaveHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="leave"
    icon="lucide:calendar-days"
    gradient="warning"
  />
);

export const AttendanceHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="attendance"
    icon="lucide:clock"
    gradient="secondary"
  />
);

export const RecruitmentHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="recruitment"
    icon="lucide:user-plus"
    gradient="primary"
  />
);

export const TasksHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="task"
    icon="lucide:check-square"
    gradient="primary"
  />
);

export const AssetsHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="asset"
    icon="lucide:package"
    gradient="secondary"
  />
);

export const SettingsHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="settings"
    icon="lucide:settings"
    gradient="primary"
  />
);

export const ReportsHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="report"
    icon="lucide:bar-chart-3"
    gradient="success"
  />
);

export const CalendarHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="leave"
    icon="lucide:calendar"
    gradient="primary"
  />
);

export const GoalsHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="goal"
    icon="lucide:target"
    gradient="warning"
  />
);

export const ExpensesHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="expense"
    icon="lucide:receipt"
    gradient="danger"
  />
);

export const OrganizationHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="employee"
    icon="lucide:building-2"
    gradient="primary"
  />
);

export const AuditHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="dashboard"
    icon="lucide:shield-check"
    gradient="secondary"
  />
);

export const ProfileHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="employee"
    icon="lucide:user"
    gradient="primary"
  />
);

export const LoginHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="login"
    icon="lucide:log-in"
    gradient="primary"
  />
);

export const DashboardHeroSection: React.FC<Omit<HeroSectionProps, 'illustration' | 'icon'>> = (props) => (
  <HeroSection
    {...props}
    illustration="dashboard"
    icon="lucide:layout-dashboard"
    gradient="primary"
  />
);

// Default export for backward compatibility
export default HeroSection;