import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../services/api-service';
import { addToast } from '@heroui/react';

export interface Branch {
  id: number;
  company_id: number;
  name: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  employee_count: number;
  department_count: number;
  created_at: string;
  updated_at: string;
}

export interface BranchFormData {
  name: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/organization/branches', 'GET');
      
      if (response && response.data && Array.isArray(response.data)) {
        setBranches(response.data);
      } else {
        console.warn('Unexpected API response format:', response);
        setBranches([]);
      }
    } catch (err) {
      console.error('Error loading branches:', err);
      setError('Failed to load branches');
      setBranches([]);
      addToast({
        title: 'Error',
        description: 'Failed to load branches',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const filteredBranches = useMemo(() => {
    if (!Array.isArray(branches)) {
      return [];
    }
    
    return branches.filter((branch) => {
      const matchesSearch = 
        (branch.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (branch.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (branch.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (branch.country || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = selectedCountry === 'all' || branch.country === selectedCountry;
      
      return matchesSearch && matchesCountry;
    });
  }, [branches, searchQuery, selectedCountry]);

  const addBranch = async (branchData: BranchFormData) => {
    try {
      const response = await apiRequest('/organization/branches', { method: 'POST', body: branchData });
      
      if (response && response.data) {
        setBranches(prev => [...prev, response.data]);
        addToast({
          title: 'Success',
          description: 'Branch added successfully',
          color: 'success',
        });
        return response.data;
      }
    } catch (err) {
      console.error('Error adding branch:', err);
      addToast({
        title: 'Error',
        description: 'Failed to add branch',
        color: 'danger',
      });
      throw err;
    }
  };

  const updateBranch = async (id: number, branchData: BranchFormData) => {
    try {
      const response = await apiRequest(`/organization/branches/${id}`, { method: 'PUT', body: branchData });
      
      if (response && response.data) {
        setBranches(prev => 
          prev.map(branch => branch.id === id ? response.data : branch)
        );
        addToast({
          title: 'Success',
          description: 'Branch updated successfully',
          color: 'success',
        });
        return response.data;
      }
    } catch (err) {
      console.error('Error updating branch:', err);
      addToast({
        title: 'Error',
        description: 'Failed to update branch',
        color: 'danger',
      });
      throw err;
    }
  };

  const deleteBranch = async (id: number) => {
    try {
      await apiRequest(`/organization/branches/${id}`, { method: 'DELETE' });
      
      setBranches(prev => prev.filter(branch => branch.id !== id));
      addToast({
        title: 'Success',
        description: 'Branch deleted successfully',
        color: 'success',
      });
    } catch (err) {
      console.error('Error deleting branch:', err);
      addToast({
        title: 'Error',
        description: 'Failed to delete branch',
        color: 'danger',
      });
      throw err;
    }
  };

  // Get unique countries for filtering
  const countries = useMemo(() => {
    if (!Array.isArray(branches)) {
      return [];
    }
    
    const uniqueCountries = new Set(
      branches
        .map(branch => branch.country)
        .filter(Boolean)
    );
    
    return Array.from(uniqueCountries).map(country => ({
      id: country,
      name: country
    }));
  }, [branches]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(branches)) {
      return { total: 0, totalEmployees: 0, totalDepartments: 0, totalCountries: 0 };
    }
    
    const total = branches.length;
    const totalEmployees = branches.reduce((sum, branch) => sum + (branch.employee_count || 0), 0);
    const totalDepartments = branches.reduce((sum, branch) => sum + (branch.department_count || 0), 0);
    const totalCountries = new Set(branches.map(branch => branch.country).filter(Boolean)).size;
    
    return { total, totalEmployees, totalDepartments, totalCountries };
  }, [branches]);

  return {
    branches,
    filteredBranches,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCountry,
    setSelectedCountry,
    countries,
    stats,
    addBranch,
    updateBranch,
    deleteBranch,
    loadBranches,
  };
};
