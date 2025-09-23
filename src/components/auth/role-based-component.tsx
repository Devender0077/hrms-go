// Create role-based component for conditional rendering
    import React from 'react';
    import { useAuth } from '../../contexts/auth-context';
    
    // Role-based component props interface
    interface RoleBasedComponentProps {
      children: React.ReactNode;
      roles?: string[];
      permissions?: string[];
      fallback?: React.ReactNode;
    }
    
    const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
      children,
      roles,
      permissions,
      fallback = null
    }) => {
      const { hasRole, hasPermission } = useAuth();
      
      // Check if user has required roles
      const hasRequiredRoles = !roles || roles.length === 0 || hasRole(roles);
      
      // Check if user has required permissions
      const hasRequiredPermissions = !permissions || permissions.length === 0 || hasPermission(permissions);
      
      // Render children if user has required roles and permissions
      if (hasRequiredRoles && hasRequiredPermissions) {
        return <>{children}</>;
      }
      
      // Otherwise render fallback
      return <>{fallback}</>;
    };
    
    export default RoleBasedComponent;
