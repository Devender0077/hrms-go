/**
 * Token Refresh Utility
 * Handles automatic token refresh and retry logic for expired tokens
 */

import { apiRequest } from '../services/api-service';

// Token refresh interface
interface RefreshTokenResponse {
  success: boolean;
  data?: {
    token: string;
    user: any;
  };
  message?: string;
}

// Type guard to check if data has token and user
const hasTokenData = (data: any): data is { token: string; user: any } => {
  return data && typeof data === 'object' && 'token' in data && 'user' in data;
};

// Refresh token function
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const response = await apiRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST'
    });

    if (response.success && response.data && hasTokenData(response.data)) {
      // Store new token
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      
      if (rememberMe) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Retry request with token refresh
export const retryWithTokenRefresh = async <T = any>(
  originalRequest: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await originalRequest();
    } catch (error: any) {
      lastError = error;
      
      // If it's a 401 error and we haven't exceeded retries, try to refresh token
      if (error.status === 401 && attempt < maxRetries) {
        const refreshSuccess = await refreshAuthToken();
        
        if (!refreshSuccess) {
          // Token refresh failed, redirect to login
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login';
          }
          
          throw error;
        }
        
        // Token refreshed successfully, retry the request
        continue;
      }
      
      // If it's not a 401 error or we've exceeded retries, throw the error
      throw error;
    }
  }
  
  throw lastError;
};
