import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  permissions,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, hasRole, hasPermission, loading, user } = useAuth();
  
  // Show loading spinner while auth state is being initialized
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center p-8 gap-4"
      >
        <Spinner size="lg" color="primary" />
        <p className="text-default-600 text-lg">Authenticating...</p>
      </motion.div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} />;
  }
  
  // Check if user has required roles
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/unauthorized" />;
  }
  
  // Check if user has required permissions
  if (permissions && permissions.length > 0 && !hasPermission(permissions)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
