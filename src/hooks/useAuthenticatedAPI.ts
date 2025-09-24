import { useCallback } from 'react';
import { useAuth } from '../contexts/auth-context';
import { httpClient } from '../services/http-client';

/**
 * Custom hook for making authenticated API calls
 * Ensures user is authenticated before making requests
 */
export const useAuthenticatedAPI = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const makeAuthenticatedRequest = useCallback(async (
    requestFn: () => Promise<any>,
    options: { 
      requireAuth?: boolean;
      onError?: (error: Error) => void;
    } = {}
  ) => {
    const { requireAuth = true, onError } = options;

    // Check if authentication is required and user is not authenticated
    if (requireAuth && (!isAuthenticated() || !user)) {
      const error = new Error('User not authenticated');
      if (onError) {
        onError(error);
      }
      throw error;
    }

    // Wait for auth loading to complete
    if (authLoading) {
      const error = new Error('Authentication still loading');
      if (onError) {
        onError(error);
      }
      throw error;
    }

    try {
      return await requestFn();
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }, [user, authLoading, isAuthenticated]);

  return {
    makeAuthenticatedRequest,
    isAuthenticated: isAuthenticated(),
    isLoading: authLoading,
    user
  };
};
