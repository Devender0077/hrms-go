import React from 'react';
import { useAuth } from '../contexts/auth-context';
import { usePermissions } from '../hooks/usePermissions';
import { Card, CardBody, CardHeader, Chip, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function PermissionDebugger() {
  const { user } = useAuth();
  const { permissions, hasPermission, loading } = usePermissions();

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
            <span>Loading permissions...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  const testPermissions = [
    'dashboard.view',
    'calendar.view',
    'tasks.view',
    'attendance.view',
    'employees.view',
    'roles.view',
    'settings.view'
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="lucide:shield-check" className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Permission Debugger</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Current User:</h4>
          <div className="flex items-center gap-2">
            <Chip color="primary" variant="flat">
              {user?.name || 'Unknown'}
            </Chip>
            <Chip color="secondary" variant="flat">
              {user?.role || 'Unknown Role'}
            </Chip>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Total Permissions: {permissions.length}</h4>
          <div className="flex flex-wrap gap-2">
            {permissions.slice(0, 10).map((permission) => (
              <Chip key={permission.id} size="sm" variant="flat" color="default">
                {permission.permission_key}
              </Chip>
            ))}
            {permissions.length > 10 && (
              <Chip size="sm" variant="flat" color="default">
                +{permissions.length - 10} more
              </Chip>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Permission Tests:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {testPermissions.map((permission) => (
              <div key={permission} className="flex items-center gap-2">
                <Icon 
                  icon={hasPermission(permission) ? "lucide:check-circle" : "lucide:x-circle"} 
                  className={`w-4 h-4 ${hasPermission(permission) ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className="text-sm font-mono">{permission}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            size="sm"
            variant="flat"
            onPress={() => window.location.reload()}
            startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
          >
            Refresh Permissions
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
