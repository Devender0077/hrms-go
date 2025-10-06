/**
 * Standardized HTTP Client Service
 * Provides consistent API communication with proper error handling, authentication, and TypeScript support
 */

import { apiRequest } from './api-service';

// Base response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Request configuration interface
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// HTTP Client class
export class HttpClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string = '/api/v1', config: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Make a GET request
   */
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  /**
   * Make a POST request
   */
  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  /**
   * Upload file with FormData
   */
  async upload<T = any>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    
    try {
      const response = await apiRequest(endpoint, {
            method: 'POST',
        body: formData,
            headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
          ...mergedConfig.headers
        }
      });

      return this.handleResponse<T>(response);
        } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Download file
   */
  async download(endpoint: string, filename?: string): Promise<void> {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: {
          'Authorization': token ? `Bearer ${token}` : '',
            }
          });
          
          if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
      console.error('Download error:', error);
          throw error;
        }
      }

  /**
   * Core request method
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await apiRequest(endpoint, {
        method,
        body: data,
        headers: mergedConfig.headers
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle successful response
   */
  private handleResponse<T>(response: any): ApiResponse<T> {
    if (response && typeof response === 'object') {
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message,
        error: response.error,
        errors: response.errors
      };
    }

    return {
      success: true,
      data: response
    };
  }

  /**
   * Handle error response
   */
  private handleError<T>(error: any): ApiResponse<T> {
    console.error('HTTP Client Error:', error);

    let message = 'An unexpected error occurred';
    let errors: Record<string, string[]> | undefined;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && error.message) {
      message = error.message;
      errors = error.errors;
    }

    return {
      success: false,
      error: message,
      errors
    };
  }
}

// Create default HTTP client instance
export const httpClient = new HttpClient();

// Export convenience methods
export const { get, post, put, patch, delete: del, upload, download } = httpClient;

// Types are exported from api-service.ts