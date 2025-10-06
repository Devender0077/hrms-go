/**
 * Token Manager Utility
 * Handles JWT token validation, refresh, and cleanup
 */

import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  permissions?: string[];
  name?: string;
  exp: number;
  iat: number;
}

export class TokenManager {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly USER_KEY = 'user';
  private static readonly REMEMBER_KEY = 'rememberMe';

  /**
   * Get the current authentication token
   */
  static getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    return token;
  }

  /**
   * Check if token is valid and not expired
   */
  static isTokenValid(token?: string): boolean {
    const authToken = token || this.getToken();
    
    if (!authToken) {
      return false;
    }

    try {
      const payload = jwtDecode<JwtPayload>(authToken);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired (with 5 minute buffer)
      if (payload.exp < currentTime + 300) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Store authentication token and user data
   */
  static setAuthData(token: string, user: any, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.REMEMBER_KEY, 'true');
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(this.REMEMBER_KEY, 'false');
    }
  }

  /**
   * Get stored user data
   */
  static getUser(): any | null {
    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.REMEMBER_KEY);
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token?: string): Date | null {
    const authToken = token || this.getToken();
    
    if (!authToken) {
      return null;
    }

    try {
      const payload = jwtDecode<JwtPayload>(authToken);
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Token expiration check error:', error);
      return null;
    }
  }

  /**
   * Check if token will expire soon (within 30 minutes)
   */
  static isTokenExpiringSoon(token?: string): boolean {
    const authToken = token || this.getToken();
    
    if (!authToken) {
      return true;
    }

    try {
      const payload = jwtDecode<JwtPayload>(authToken);
      const currentTime = Date.now() / 1000;
      const thirtyMinutes = 30 * 60; // 30 minutes in seconds
      
      return payload.exp < currentTime + thirtyMinutes;
    } catch (error) {
      console.error('Token expiration check error:', error);
      return true;
    }
  }

  /**
   * Force logout and redirect to login
   */
  static forceLogout(): void {
    this.clearAuthData();
    
    // Redirect to login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
    }
  }
}

export default TokenManager;
