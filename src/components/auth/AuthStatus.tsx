import React from 'react';
import { useAuth } from '../../contexts/auth-context';
import { Chip, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

/**
 * Debug component to show authentication status
 * This helps identify authentication issues
 */
export const AuthStatus: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Card className="p-2">
        <CardBody className="flex items-center gap-2">
          <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading auth...</span>
        </CardBody>
      </Card>
    );
  }

  if (!isAuthenticated() || !user) {
    return (
      <Card className="p-2">
        <CardBody className="flex items-center gap-2">
          <Icon icon="lucide:x-circle" className="w-4 h-4 text-danger" />
          <span className="text-sm text-danger">Not authenticated</span>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <CardBody className="flex items-center gap-2">
        <Icon icon="lucide:check-circle" className="w-4 h-4 text-success" />
        <span className="text-sm text-success">Authenticated as {user.name || user.email}</span>
        <Chip size="sm" color="primary">{user.role}</Chip>
      </CardBody>
    </Card>
  );
};
