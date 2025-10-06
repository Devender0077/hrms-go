/**
 * Enhanced API Service
 * Provides standardized API communication with proper error handling, authentication, and TypeScript support
 */

// Base API URL - configured from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Request options interface
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

// Enhanced error class
export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number = 500, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Helper function to handle API responses
const handleResponse = async <T = any>(response: Response): Promise<ApiResponse<T>> => {
  // Handle 304 Not Modified responses (cached responses)
  if (response.status === 304) {
    return { success: true, data: null as T, message: "Data not modified (cached)" };
  }

  // Handle no content responses
  if (response.status === 204) {
    return { success: true, data: null as T, message: "No content" };
  }

  // Parse response body
  let data: any;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (error) {
      throw new ApiError('Invalid JSON response', response.status);
    }
  } else {
    data = await response.text();
  }

  // Handle error responses
  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(errorMessage, response.status, data?.errors);
  }

  // Ensure success field exists for consistency
  if (data && typeof data === 'object' && !data.hasOwnProperty('success')) {
    data.success = true;
  }

  return data as ApiResponse<T>;
};

// Helper function to get authentication token
const getAuthToken = (): string | null => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  
  if (!token) {
    return null;
  }
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Add 5 minute buffer to prevent edge cases
    if (payload.exp < currentTime + 300) {
      // Token is expired or expiring soon, clear it
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      return null;
    }
  } catch (error) {
    // Invalid token format, clear it
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return null;
  }
  
  return token;
};

// Helper function to make API requests with authentication and retry logic
export const apiRequest = async <T = any>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 10000,
    retries = 3
  } = options;

  // Get auth token
  const token = getAuthToken();

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  // Handle body serialization
  if (body) {
    if (body instanceof FormData) {
      // For FormData, don't set Content-Type header
      delete (requestOptions.headers as any)['Content-Type'];
      requestOptions.body = body;
    } else if (typeof body === 'object') {
      requestOptions.body = JSON.stringify(body);
    } else {
      requestOptions.body = body;
    }
  }

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  requestOptions.signal = controller.signal;

  let lastError: Error;

  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
      clearTimeout(timeoutId);
      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  clearTimeout(timeoutId);
  
  // Handle timeout
  if (lastError.name === 'AbortError') {
    throw new ApiError('Request timeout', 408);
  }

  // Handle network errors
  if (lastError.message.includes('fetch')) {
    throw new ApiError('Network error. Please check your connection.', 0);
  }

  throw lastError;
};

// Authentication API
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  loginWithFace: (faceData) =>
    apiRequest("/auth/face-login", {
      method: "POST",
      body: JSON.stringify(faceData),
    }),

  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  verifyEmail: (token) =>
    apiRequest(`/auth/verify-email/${token}`),

  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

// Employee API
export const employeeAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/employees?${queryParams}`);
  },

  getById: (id) => apiRequest(`/employees/${id}`),

  getByUserId: (userId) => apiRequest(`/employees/user/${userId}`),

  create: (employeeData) =>
    apiRequest("/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    }),

  update: (id, employeeData) =>
    apiRequest(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(employeeData),
    }),

  delete: (id) => apiRequest(`/employees/${id}`, { method: "DELETE" }),

  bulkImport: (formData) =>
    apiRequest("/employees/import", {
      method: "POST",
      headers: {
        // Don't set Content-Type when sending FormData
        "Content-Type": undefined,
      },
      body: JSON.stringify(formData),
    }),

  export: (format = "csv") =>
    apiRequest(`/employees/export?format=${format}`),
};

// Organization API
export const organizationAPI = {
  // Branches
  getBranches: () => apiRequest("/organization/branches"),
  getBranchById: (id) => apiRequest(`/organization/branches/${id}`),
  createBranch: (data) =>
    apiRequest("/organization/branches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBranch: (id, data) =>
    apiRequest(`/organization/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBranch: (id) =>
    apiRequest(`/organization/branches/${id}`, { method: "DELETE" }),

  // Departments
  getDepartments: () => apiRequest("/organization/departments"),
  getDepartmentById: (id) => apiRequest(`/organization/departments/${id}`),
  createDepartment: (data) =>
    apiRequest("/organization/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDepartment: (id, data) =>
    apiRequest(`/organization/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteDepartment: (id) =>
    apiRequest(`/organization/departments/${id}`, { method: "DELETE" }),

  // Designations
  getDesignations: () => apiRequest("/organization/designations"),
  getDesignationById: (id) => apiRequest(`/organization/designations/${id}`),
  createDesignation: (data) =>
    apiRequest("/organization/designations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDesignation: (id, data) =>
    apiRequest(`/organization/designations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteDesignation: (id) =>
    apiRequest(`/organization/designations/${id}`, { method: "DELETE" }),

  // Org Chart
  getOrgChart: () => apiRequest("/organization/chart"),
};

// Document API
export const documentAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/documents?${queryParams}`);
  },

  getById: (id) => apiRequest(`/documents/${id}`),

  create: (formData) =>
    apiRequest("/documents", {
      method: "POST",
      headers: {
        // Don't set Content-Type when sending FormData
        "Content-Type": undefined,
      },
      body: JSON.stringify(formData),
    }),

  update: (id, formData) =>
    apiRequest(`/documents/${id}`, {
      method: "PUT",
      headers: {
        // Don't set Content-Type when sending FormData
        "Content-Type": undefined,
      },
      body: JSON.stringify(formData),
    }),

  delete: (id) => apiRequest(`/documents/${id}`, { method: "DELETE" }),

  getEmployeeDocuments: (employeeId) =>
    apiRequest(`/employees/${employeeId}/documents`),

  // Get documents expiring soon
  getExpiringDocuments: (days = 30) =>
    apiRequest(`/documents/expiring?days=${days}`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/attendance?${queryParams}`);
  },

  checkIn: (data) =>
    apiRequest("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkOut: (data) =>
    apiRequest("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getEmployeeAttendance: (employeeId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/employees/${employeeId}/attendance?${queryParams}`);
  },

  bulkImport: (formData) =>
    apiRequest("/attendance/import", {
      method: "POST",
      headers: {
        // Don't set Content-Type when sending FormData
        "Content-Type": undefined,
      },
      body: JSON.stringify(formData),
    }),

  getReport: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/attendance/report?${queryParams}`);
  },
};

// Leave API
export const leaveAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/leaves?${queryParams}`);
  },

  getById: (id) => apiRequest(`/leaves/${id}`),

  apply: (data) =>
    apiRequest("/leaves", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/leaves/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  approve: (id) => apiRequest(`/leaves/${id}/approve`, { method: "POST" }),

  reject: (id, reason) =>
    apiRequest(`/leaves/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  cancel: (id) => apiRequest(`/leaves/${id}/cancel`, { method: "POST" }),

  getEmployeeLeaves: (employeeId) =>
    apiRequest(`/employees/${employeeId}/leaves`),

  getLeaveBalance: (employeeId) =>
    apiRequest(`/employees/${employeeId}/leave-balance`),

  getLeaveTypes: () => apiRequest("/leave-types"),
};

// Task API
export const taskAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/tasks?${queryParams}`);
  },

  getById: (id) => apiRequest(`/tasks/${id}`),

  create: (taskData) =>
    apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),

  update: (id, taskData) =>
    apiRequest(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    }),

  delete: (id) => apiRequest(`/tasks/${id}`, { method: "DELETE" }),
};

// Calendar API
export const calendarAPI = {
  getEvents: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/calendar/events?${queryParams}`);
  },

  getEventById: (id) => apiRequest(`/calendar/events/${id}`),

  createEvent: (eventData) =>
    apiRequest("/calendar/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),

  updateEvent: (id, eventData) =>
    apiRequest(`/calendar/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }),

  deleteEvent: (id) => apiRequest(`/calendar/events/${id}`, { method: "DELETE" }),
};

// Jobs API
export const jobsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/jobs?${queryParams}`);
  },

  getById: (id) => apiRequest(`/jobs/${id}`),

  create: (jobData) =>
    apiRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    }),

  update: (id, jobData) =>
    apiRequest(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    }),

  delete: (id) => apiRequest(`/jobs/${id}`, { method: "DELETE" }),
};

// Candidates API
export const candidatesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/candidates?${queryParams}`);
  },

  getById: (id) => apiRequest(`/candidates/${id}`),

  create: (candidateData) =>
    apiRequest("/candidates", {
      method: "POST",
      body: JSON.stringify(candidateData),
    }),

  update: (id, candidateData) =>
    apiRequest(`/candidates/${id}`, {
      method: "PUT",
      body: JSON.stringify(candidateData),
    }),

  delete: (id) => apiRequest(`/candidates/${id}`, { method: "DELETE" }),
};

// Assets API
export const assetsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/assets?${queryParams}`);
  },

  getById: (id) => apiRequest(`/assets/${id}`),

  create: (assetData) =>
    apiRequest("/assets", {
      method: "POST",
      body: JSON.stringify(assetData),
    }),

  update: (id, assetData) =>
    apiRequest(`/assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(assetData),
    }),

  delete: (id) => apiRequest(`/assets/${id}`, { method: "DELETE" }),
};

// Export all APIs
export default {
  auth: authAPI,
  employees: employeeAPI,
  organization: organizationAPI,
  documents: documentAPI,
  attendance: attendanceAPI,
  leave: leaveAPI,
  tasks: taskAPI,
  calendar: calendarAPI,
  jobs: jobsAPI,
  candidates: candidatesAPI,
  assets: assetsAPI,
};
