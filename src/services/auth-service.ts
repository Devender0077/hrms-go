// Create a new authentication service
import { jwtDecode } from "jwt-decode";
import api from "./api-service";

// JWT token interface
interface JwtToken {
  id: number;
  email: string;
  role: string;
  permissions?: string[];
  name?: string;
  exp: number;
  iat: number;
}

// User interface
export interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  name?: string;
  avatar?: string;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration data interface
export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  companyName?: string;
}

// Authentication service
const AuthService = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      // Always use real API login
      const response = await api.auth.login(credentials);
      const { token, user } = response;

      // Store token in localStorage or sessionStorage based on rememberMe
      if (credentials.rememberMe) {
        localStorage.setItem("authToken", token);
      } else {
        sessionStorage.setItem("authToken", token);
      }

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Login with face recognition
  loginWithFace: async (faceData: any): Promise<User> => {
    try {
      // Demo mode - if faceData has success property, it's from our demo
      if (faceData.success && faceData.user && faceData.token) {
        // Store token in localStorage (face login implies remember me)
        localStorage.setItem("authToken", faceData.token);
        sessionStorage.setItem("authToken", faceData.token);
        localStorage.setItem("user", JSON.stringify(faceData.user));
        
        return faceData.user;
      }
      
      // Real API call for production
      const response = await api.auth.loginWithFace(faceData);
      const { token, user } = response;

      // Store token in localStorage (face login implies remember me)
      localStorage.setItem("authToken", token);

      return user;
    } catch (error) {
      console.error("Face login error:", error);
      throw error;
    }
  },

  // Register new user
  register: async (data: RegistrationData): Promise<void> => {
    try {
      await api.auth.register(data);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    // Get token before removing it
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    // Remove token from storage
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");

    // Call logout API to invalidate token on server, but don't wait for it
    // Use a try-catch to prevent errors from bubbling up
    if (token) {
      try {
        api.auth.logout().catch((error) => {
          // Log error but don't throw it - we still want to complete the local logout
          console.warn("Logout API call failed:", error);
        });
      } catch (error) {
        // Catch any synchronous errors
        console.warn("Error initiating logout API call:", error);
      }
    }
  },

  // Get current user from token
  getCurrentUser: (): User | null => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        return null;
      }

      // Check if token is a valid JWT format before decoding
      if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
        console.warn("Invalid token format");
        AuthService.logout();
        return null;
      }

      try {
        // Decode token with better error handling
        const decoded = jwtDecode<JwtToken>(token);

        // Validate decoded token has required fields
        if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
          console.warn("Token missing required fields");
          AuthService.logout();
          return null;
        }

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log("Token expired");
          AuthService.logout();
          return null;
        }

        return {
          id: decoded.id.toString(),
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions || [],
          name: decoded.name,
        };
      } catch (decodeError) {
        console.error("JWT decode error:", decodeError);
        AuthService.logout();
        return null;
      }
    } catch (error) {
      console.error("Get current user error:", error);
      AuthService.logout();
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return AuthService.getCurrentUser() !== null;
  },

  // Check if user has specific role
  hasRole: (role: string | string[]): boolean => {
    const user = AuthService.getCurrentUser();

    if (!user) {
      return false;
    }

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  },

  // Check if user has specific permission
  hasPermission: (permission: string | string[]): boolean => {
    const user = AuthService.getCurrentUser();

    if (!user || !user.permissions) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.some((p) => user.permissions.includes(p));
    }

    return user.permissions.includes(permission);
  },

  // Request password reset
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await api.auth.forgotPassword(email);
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      await api.auth.resetPassword(token, password);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<void> => {
    try {
      await api.auth.verifyEmail(token);
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  },
};

export default AuthService;
