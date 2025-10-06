// Create authentication context for global state management
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService, { User, LoginCredentials, RegistrationData } from '../services/auth-service';
import { addToast } from '@heroui/react';
import TokenManager from '../utils/token-manager';
    
    // Auth context interface
    interface AuthContextType {
      user: User | null;
      loading: boolean;
      login: (credentials: LoginCredentials) => Promise<User>;
      loginWithFace: (faceData: any) => Promise<void>;
      register: (data: RegistrationData) => Promise<void>;
      logout: () => void;
      forgotPassword: (email: string) => Promise<void>;
      resetPassword: (token: string, password: string) => Promise<void>;
      verifyEmail: (token: string) => Promise<void>;
      isAuthenticated: () => boolean;
      hasRole: (role: string | string[]) => boolean;
      hasPermission: (permission: string | string[]) => boolean;
    }
    
    // Create context with default values
    const AuthContext = createContext<AuthContextType>({
      user: null,
      loading: true,
      login: async () => ({} as User),
      loginWithFace: async () => {},
      register: async () => {},
      logout: () => {},
      forgotPassword: async () => {},
      resetPassword: async () => {},
      verifyEmail: async () => {},
      isAuthenticated: () => false,
      hasRole: () => false,
      hasPermission: () => false
    });
    
    // Custom hook to use auth context
    export const useAuth = () => useContext(AuthContext);
    
    // Auth provider component
    export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [user, setUser] = useState<User | null>(null);
      const [loading, setLoading] = useState<boolean>(true);
      
      // Initialize auth state on component mount
      useEffect(() => {
        const initAuth = async () => {
          try {
            // Check if tokens are valid before getting user
            if (!TokenManager.isTokenValid()) {
              TokenManager.clearAuthData();
              setLoading(false);
              return;
            }
            
            const currentUser = AuthService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            } else {
              TokenManager.clearAuthData();
            }
          } catch (error) {
            console.error('Auth initialization error:', error);
          } finally {
            setLoading(false);
          }
        };
        
        initAuth();
      }, []);
      
      // Login handler
      const login = async (credentials: LoginCredentials) => {
        try {
          const user = await AuthService.login(credentials);
          setUser(user);
          
          addToast({
            title: "Login Successful",
            description: `Welcome back, ${user.name || user.email}!`,
            color: "success",
          });
          
          // Return the user to ensure the calling component knows login was successful
          return user;
        } catch (error) {
          console.error('Login error:', error);
          
          addToast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            color: "danger",
          });
          
          throw error;
        }
      };
      
      // Face login handler
      const loginWithFace = async (faceData: any) => {
        try {
          const user = await AuthService.loginWithFace(faceData);
          setUser(user);
          
          addToast({
            title: "Login Successful",
            description: `Welcome back, ${user.name || user.email}!`,
            color: "success",
          });
        } catch (error) {
          console.error('Face login error:', error);
          
          addToast({
            title: "Face Login Failed",
            description: "Face recognition failed. Please try again or use password.",
            color: "danger",
          });
          
          throw error;
        }
      };
      
      // Register handler
      const register = async (data: RegistrationData) => {
        try {
          await AuthService.register(data);
          
          addToast({
            title: "Registration Successful",
            description: "Please check your email to verify your account.",
            color: "success",
          });
        } catch (error) {
          console.error('Registration error:', error);
          
          addToast({
            title: "Registration Failed",
            description: "Registration failed. Please try again.",
            color: "danger",
          });
          
          throw error;
        }
      };
      
      // Logout handler
      const logout = () => {
        AuthService.logout();
        setUser(null);
        
        addToast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
          color: "success",
        });
      };
      
      // Forgot password handler
      const forgotPassword = async (email: string) => {
        try {
          await AuthService.forgotPassword(email);
          
          addToast({
            title: "Password Reset Email Sent",
            description: "Please check your email for password reset instructions.",
            color: "success",
          });
        } catch (error) {
          console.error('Forgot password error:', error);
          
          addToast({
            title: "Request Failed",
            description: "Failed to send password reset email. Please try again.",
            color: "danger",
          });
          
          throw error;
        }
      };
      
      // Reset password handler
      const resetPassword = async (token: string, password: string) => {
        try {
          await AuthService.resetPassword(token, password);
          
          addToast({
            title: "Password Reset Successful",
            description: "Your password has been reset successfully. You can now login with your new password.",
            color: "success",
          });
        } catch (error) {
          console.error('Reset password error:', error);
          
          addToast({
            title: "Reset Failed",
            description: "Failed to reset password. Please try again.",
            color: "danger",
          });
          
          throw error;
        }
      };
      
      // Verify email handler
      const verifyEmail = async (token: string) => {
        try {
          await AuthService.verifyEmail(token);
          
          addToast({
            title: "Email Verified",
            description: "Your email has been verified successfully. You can now login.",
            color: "success",
          });
        } catch (error) {
          console.error('Email verification error:', error);
          
          addToast({
            title: "Verification Failed",
            description: "Failed to verify email. Please try again.",
            color: "danger",
          });
          
          throw error;
        }
      };
      
      // Check if user is authenticated
      const isAuthenticated = () => {
        return AuthService.isAuthenticated();
      };
      
      // Check if user has specific role
      const hasRole = (role: string | string[]) => {
        return AuthService.hasRole(role);
      };
      
      // Check if user has specific permission
      const hasPermission = (permission: string | string[]) => {
        return AuthService.hasPermission(permission);
      };
      
      // Context value
      const value = {
        user,
        loading,
        login,
        loginWithFace,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        isAuthenticated,
        hasRole,
        hasPermission
      };
      
      return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      );
    };
