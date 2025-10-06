import React from 'react';
import { Card, CardBody, Alert } from '@heroui/react';
import { Icon } from '@iconify/react';
import { 
  canViewSettingsCategory, 
  canEditSettingsCategory, 
  canPerformAction,
  SETTINGS_PERMISSIONS 
} from '../../utils/settings-permissions';

interface SettingsPermissionWrapperProps {
  userRole: string;
  category: string;
  action?: 'view' | 'edit' | 'manage' | 'test' | 'execute' | 'clear';
  children: React.ReactNode;
  fallbackMessage?: string;
  showPermissionInfo?: boolean;
}

export default function SettingsPermissionWrapper({
  userRole,
  category,
  action = 'view',
  children,
  fallbackMessage,
  showPermissionInfo = true
}: SettingsPermissionWrapperProps) {
  // Check if user has permission for the specified action
  const hasPermission = action === 'view' 
    ? canViewSettingsCategory(userRole, category)
    : canPerformAction(userRole, category, action);

  // If user doesn't have permission, show fallback
  if (!hasPermission) {
    const defaultMessage = `You don't have permission to ${action} ${category} settings.`;
    const message = fallbackMessage || defaultMessage;
    
    return (
      <Card>
        <CardBody>
          <Alert
            color="warning"
            variant="flat"
            startContent={<Icon icon="lucide:shield-alert" />}
            title="Access Restricted"
            description={message}
          />
        </CardBody>
      </Card>
    );
  }

  // If user has permission but we want to show permission info
  if (showPermissionInfo && action !== 'view') {
    const categoryPermissions = SETTINGS_PERMISSIONS[category] || [];
    const requiredPermission = categoryPermissions.find(p => p.permission.includes(action));
    
    return (
      <div className="space-y-4">
        {requiredPermission && (
          <Alert
            color="success"
            variant="flat"
            startContent={<Icon icon="lucide:shield-check" />}
            title="Permission Granted"
            description={`You have permission to ${action} ${category} settings.`}
            className="text-sm"
          />
        )}
        {children}
      </div>
    );
  }

  // User has permission, render children
  return <>{children}</>;
}

// Higher-order component for settings pages
export function withSettingsPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  category: string,
  action: 'view' | 'edit' | 'manage' | 'test' | 'execute' | 'clear' = 'view'
) {
  return function SettingsPermissionComponent(props: P & { userRole: string }) {
    const { userRole, ...restProps } = props;
    
    return (
      <SettingsPermissionWrapper userRole={userRole} category={category} action={action}>
        <WrappedComponent {...(restProps as P)} />
      </SettingsPermissionWrapper>
    );
  };
}

// Hook for checking settings permissions
export function useSettingsPermissions(userRole: string, category: string) {
  return {
    canView: canViewSettingsCategory(userRole, category),
    canEdit: canEditSettingsCategory(userRole, category),
    canManage: canPerformAction(userRole, category, 'manage'),
    canTest: canPerformAction(userRole, category, 'test'),
    canExecute: canPerformAction(userRole, category, 'execute'),
    canClear: canPerformAction(userRole, category, 'clear'),
    permissions: SETTINGS_PERMISSIONS[category] || []
  };
}
