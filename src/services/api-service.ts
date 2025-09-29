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
  
  // Handle 304 Not Modified responses (cached responses)
  if (response.status === 304) {
    // For 304 responses, we don't have a body, so we need to handle this differently
    // We'll return a success response with empty data
    return { success: true, data: null, message: "Data not modified (cached)" };
  }
  
  // For other successful responses, parse the JSON
  const data = await response.json();
  
  // Add success field if it doesn't exist (for consistency with frontend expectations)
  if (data && typeof data === 'object' && !data.hasOwnProperty('success')) {
    data.success = true;
  }
  
  return data;
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

  // Handle body serialization for POST/PUT requests
  if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
    if (typeof options.body === 'object') {
      requestOptions.body = JSON.stringify(options.body);
    } else {
      requestOptions.body = options.body;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    return handleResponse(response);
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    }),

  loginWithFace: (faceData) =>
    apiRequest("/auth/face-login", {
      method: "POST",
      body: faceData,
    }),

  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: userData,
    }),

  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (token, password) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: { token, password },
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
      body: employeeData,
    }),

  update: (id, employeeData) =>
    apiRequest(`/employees/${id}`, {
      method: "PUT",
      body: employeeData,
    }),

  delete: (id) => apiRequest(`/employees/${id}`, { method: "DELETE" }),

  bulkImport: (formData) =>
    apiRequest("/employees/import", {
      method: "POST",
      headers: {
        // Don't set Content-Type when sending FormData
        "Content-Type": undefined,
      },
      body: formData,
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
      body: data,
    }),
  updateBranch: (id, data) =>
    apiRequest(`/organization/branches/${id}`, {
      method: "PUT",
      body: data,
    }),
  deleteBranch: (id) =>
    apiRequest(`/organization/branches/${id}`, { method: "DELETE" }),

  // Departments
  getDepartments: () => apiRequest("/organization/departments"),
  getDepartmentById: (id) => apiRequest(`/organization/departments/${id}`),
  createDepartment: (data) =>
    apiRequest("/organization/departments", {
      method: "POST",
      body: data,
    }),
  updateDepartment: (id, data) =>
    apiRequest(`/organization/departments/${id}`, {
      method: "PUT",
      body: data,
    }),
  deleteDepartment: (id) =>
    apiRequest(`/organization/departments/${id}`, { method: "DELETE" }),

  // Designations
  getDesignations: () => apiRequest("/organization/designations"),
  getDesignationById: (id) => apiRequest(`/organization/designations/${id}`),
  createDesignation: (data) =>
    apiRequest("/organization/designations", {
      method: "POST",
      body: data,
    }),
  updateDesignation: (id, data) =>
    apiRequest(`/organization/designations/${id}`, {
      method: "PUT",
      body: data,
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
      body: data,
    }),

  checkOut: (data) =>
    apiRequest("/attendance/check-out", {
      method: "POST",
      body: data,
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
      body: data,
    }),

  update: (id, data) =>
    apiRequest(`/leaves/${id}`, {
      method: "PUT",
      body: data,
    }),

  approve: (id) => apiRequest(`/leaves/${id}/approve`, { method: "POST" }),

  reject: (id, reason) =>
    apiRequest(`/leaves/${id}/reject`, {
      method: "POST",
      body: { reason },
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
      body: taskData,
    }),

  update: (id, taskData) =>
    apiRequest(`/tasks/${id}`, {
      method: "PUT",
      body: taskData,
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
      body: eventData,
    }),

  updateEvent: (id, eventData) =>
    apiRequest(`/calendar/events/${id}`, {
      method: "PUT",
      body: eventData,
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
      body: jobData,
    }),

  update: (id, jobData) =>
    apiRequest(`/jobs/${id}`, {
      method: "PUT",
      body: jobData,
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
      body: candidateData,
    }),

  update: (id, candidateData) =>
    apiRequest(`/candidates/${id}`, {
      method: "PUT",
      body: candidateData,
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
      body: assetData,
    }),

  update: (id, assetData) =>
    apiRequest(`/assets/${id}`, {
      method: "PUT",
      body: assetData,
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
