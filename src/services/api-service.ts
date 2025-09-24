// Create a new API service file to handle all API requests

// Base API URL - would be configured from environment variables in a real app
const API_BASE_URL = "http://localhost:8000/api/v1"; // Always use development URL

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Get error message from the response body
    const errorData = await response.json();
    throw new Error(errorData.message || "API request failed");
  }
  return response.json();
};

// Helper function to make API requests with authentication
export const apiRequest = async (endpoint, options = {}) => {
  // Get auth token from localStorage or sessionStorage
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    return handleResponse(response);
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

import { httpClient } from "./http-client";
import { API_ENDPOINTS } from "../config/api-config";

// Authentication API
export const authAPI = {
  login: (credentials) =>
    httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

  loginWithFace: (faceData) =>
    httpClient.post(API_ENDPOINTS.AUTH.FACE_LOGIN, faceData),

  register: (userData) =>
    httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData),

  forgotPassword: (email) =>
    httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token, password) =>
    httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),

  verifyEmail: (token) =>
    httpClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`),

  logout: () => httpClient.post(API_ENDPOINTS.AUTH.LOGOUT),
};

// Employee API
export const employeeAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return httpClient.get(`${API_ENDPOINTS.EMPLOYEES.BASE}?${queryParams}`);
  },

  getById: (id) => httpClient.get(`${API_ENDPOINTS.EMPLOYEES.BASE}/${id}`),

  create: (employeeData) =>
    httpClient.post(API_ENDPOINTS.EMPLOYEES.BASE, employeeData),

  update: (id, employeeData) =>
    httpClient.put(`${API_ENDPOINTS.EMPLOYEES.BASE}/${id}`, employeeData),

  delete: (id) => httpClient.delete(`${API_ENDPOINTS.EMPLOYEES.BASE}/${id}`),

  bulkImport: (formData) =>
    httpClient.upload(API_ENDPOINTS.EMPLOYEES.IMPORT, formData),

  export: (format = "csv") =>
    httpClient.download(
      `${API_ENDPOINTS.EMPLOYEES.EXPORT}?format=${format}`,
      `employees.${format}`
    ),
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
      body: formData,
    }),

  update: (id, formData) =>
    apiRequest(`/documents/${id}`, {
      method: "PUT",
      headers: {
        // Don't set Content-Type when sending FormData
        "Content-Type": undefined,
      },
      body: formData,
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
      body: formData,
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
};
