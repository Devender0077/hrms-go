// HTTP client service for API requests
    import { API_BASE_URL, API_ENDPOINTS } from '../config/api-config';
    import { addToast } from '@heroui/react';
    
    // Base API URL
    const BASE_URL = API_BASE_URL;
    
    // Helper function to handle API responses
    const handleResponse = async (response) => {
      // Check if response is OK (status in the range 200-299)
      if (!response.ok) {
        // Get error message from the response body
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'API request failed';
        } catch (e) {
          errorMessage = 'API request failed';
        }
        
        // Show toast notification for error
        addToast({
          title: 'Error',
          description: errorMessage,
          color: 'danger',
        });
        
        throw new Error(errorMessage);
      }
      
      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();
    };
    
    // Get auth token from storage
    const getAuthToken = () => {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    };
    
    // HTTP client with methods for different request types
    export const httpClient = {
      // GET request
      get: async (endpoint, params = {}) => {
        try {
          // Add query parameters if provided
          const url = new URL(`${BASE_URL}${endpoint}`);
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
              url.searchParams.append(key, params[key]);
            }
          });
          
          // Get auth token
          const token = getAuthToken();
          
          // Make request
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          
          return handleResponse(response);
        } catch (error) {
          console.error('GET request error:', error);
          throw error;
        }
      },
      
      // POST request
      post: async (endpoint, data = {}) => {
        try {
          // Get auth token
          const token = getAuthToken();
          
          // Make request
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data)
          });
          
          return handleResponse(response);
        } catch (error) {
          console.error('POST request error:', error);
          throw error;
        }
      },
      
      // PUT request
      put: async (endpoint, data = {}) => {
        try {
          // Get auth token
          const token = getAuthToken();
          
          // Make request
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data)
          });
          
          return handleResponse(response);
        } catch (error) {
          console.error('PUT request error:', error);
          throw error;
        }
      },
      
      // DELETE request
      delete: async (endpoint) => {
        try {
          // Get auth token
          const token = getAuthToken();
          
          // Make request
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          
          return handleResponse(response);
        } catch (error) {
          console.error('DELETE request error:', error);
          throw error;
        }
      },
      
      // Upload file
      upload: async (endpoint, formData) => {
        try {
          // Get auth token
          const token = getAuthToken();
          
          // Make request
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              // Don't set Content-Type when sending FormData
            },
            body: formData
          });
          
          return handleResponse(response);
        } catch (error) {
          console.error('Upload request error:', error);
          throw error;
        }
      },
      
      // Download file
      download: async (endpoint, filename) => {
        try {
          // Get auth token
          const token = getAuthToken();
          
          // Make request
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          
          if (!response.ok) {
            throw new Error('Download failed');
          }
          
          // Create blob from response
          const blob = await response.blob();
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          
          // Trigger download
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          return true;
        } catch (error) {
          console.error('Download request error:', error);
          throw error;
        }
      }
    };
