/**
 * Authentication Utility Functions
 * Provides helper functions for managing authentication state and tokens
 */

// Clear all authentication data
export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('rememberMe');
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

// Get valid auth token
export const getValidAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  if (!token) {
    return null;
  }
  
  if (isTokenExpired(token)) {
    clearAuthData();
    return null;
  }
  
  return token;
};

// Set auth token with proper storage
export const setAuthToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('rememberMe', 'true');
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

// Set user data with proper storage
export const setUserData = (user: any, rememberMe: boolean = false): void => {
  const userString = JSON.stringify(user);
  
  if (rememberMe) {
    localStorage.setItem('user', userString);
  } else {
    sessionStorage.setItem('user', userString);
  }
};

// Get user data
export const getUserData = (): any | null => {
  const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  if (!userString) {
    return null;
  }
  
  try {
    return JSON.parse(userString);
  } catch (error) {
    return null;
  }
};

// Check if user should be remembered
export const shouldRememberUser = (): boolean => {
  return localStorage.getItem('rememberMe') === 'true';
};

// Force logout with cleanup
export const forceLogout = (): void => {
  clearAuthData();
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};

// Validate current authentication state
export const validateAuthState = (): boolean => {
  const token = getValidAuthToken();
  const user = getUserData();
  
  if (!token || !user) {
    clearAuthData();
    return false;
  }
  
  return true;
};
