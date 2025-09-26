import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { usePermissions } from '../hooks/usePermissions';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermissions, 
  fallbackPath = '/dashboard' 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAnyPermission, loading: permissionsLoading } = usePermissions();
  const location = useLocation();

  // Show loading while authentication or permissions are loading
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific permissions are required, grant access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required permissions
  const hasPermission = hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="lucide:shield-x" className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Required permissions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {requiredPermissions && requiredPermissions.map((permission) => (
                <span
                  key={permission}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-mono"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
          <Button
            color="primary"
            className="mt-6"
            onPress={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
