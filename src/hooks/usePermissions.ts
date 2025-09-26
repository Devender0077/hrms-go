import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { apiRequest } from '../services/api-service';

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  module: string;
  description: string;
  is_active: boolean;
}

interface UserPermissions {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
}

export function usePermissions(): UserPermissions {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Super admin bypasses all permission checks
        if (user.role === 'super_admin') {
          // Fetch all permissions for super admin
          const response = await apiRequest('/permissions');
          setPermissions(response.data || []);
        } else {
          // Fetch user's role permissions
          const response = await apiRequest(`/roles/${user.role}/permissions`);
          setPermissions(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching user permissions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permissionKey: string): boolean => {
    if (!user || !permissionKey || !permissions || !Array.isArray(permissions)) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    return permissions.some(permission => 
      permission.permission_key === permissionKey && permission.is_active
    );
  };

  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    if (!user || !permissionKeys || !Array.isArray(permissionKeys)) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    return permissionKeys.some(key => hasPermission(key));
  };

  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    if (!user || !permissionKeys || !Array.isArray(permissionKeys)) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}
