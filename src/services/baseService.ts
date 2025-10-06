import { apiRequest } from '../utils/api';

export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class BaseService<T extends BaseEntity> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return apiRequest(url);
  }

  async getById(id: number): Promise<T> {
    return apiRequest(`${this.endpoint}/${id}`);
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    return apiRequest(this.endpoint, {
      method: 'POST',
      body: data
    });
  }

  async update(id: number, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T> {
    return apiRequest(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  async delete(id: number): Promise<void> {
    return apiRequest(`${this.endpoint}/${id}`, {
      method: 'DELETE'
    });
  }

  async bulkDelete(ids: number[]): Promise<void> {
    return apiRequest(`${this.endpoint}/bulk-delete`, {
      method: 'POST',
      body: { ids }
    });
  }

  async export(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await fetch(`/api/v1${this.endpoint}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

