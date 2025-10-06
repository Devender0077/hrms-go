import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../services/api-service';
import { addToast } from '@heroui/react';

export interface Department {
  id: number;
  company_id: number;
  branch_id?: number;
  name: string;
  description?: string;
  branch_name?: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  branch_id?: number;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/organization/departments');
      
      if (response && response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        console.warn('Unexpected API response format:', response);
        setDepartments([]);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
      setDepartments([]);
      addToast({
        title: 'Error',
        description: 'Failed to load departments',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!Array.isArray(departments)) {
      return [];
    }
    
    return departments.filter((department) => {
      const matchesSearch = 
        (department.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (department.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (department.branch_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBranch = selectedBranch === 'all' || department.branch_name === selectedBranch;
      
      return matchesSearch && matchesBranch;
    });
  }, [departments, searchQuery, selectedBranch]);

  const addDepartment = async (departmentData: DepartmentFormData) => {
    try {
      const response = await apiRequest('/organization/departments', {
        method: 'POST',
        body: JSON.stringify(departmentData)
      });
      
      if (response && response.data) {
        setDepartments(prev => [...prev, response.data]);
        addToast({
          title: 'Success',
          description: 'Department added successfully',
          color: 'success',
        });
        return response.data;
      }
    } catch (err) {
      console.error('Error adding department:', err);
      addToast({
        title: 'Error',
        description: 'Failed to add department',
        color: 'danger',
      });
      throw err;
    }
  };

  const updateDepartment = async (id: number, departmentData: DepartmentFormData) => {
    try {
      const response = await apiRequest(`/organization/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(departmentData)
      });
      
      if (response && response.data) {
        setDepartments(prev => 
          prev.map(dept => dept.id === id ? response.data : dept)
        );
        addToast({
          title: 'Success',
          description: 'Department updated successfully',
          color: 'success',
        });
        return response.data;
      }
    } catch (err) {
      console.error('Error updating department:', err);
      addToast({
        title: 'Error',
        description: 'Failed to update department',
        color: 'danger',
      });
      throw err;
    }
  };

  const deleteDepartment = async (id: number) => {
    try {
      await apiRequest(`/organization/departments/${id}`, {
        method: 'DELETE'
      });
      
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      addToast({
        title: 'Success',
        description: 'Department deleted successfully',
        color: 'success',
      });
    } catch (err) {
      console.error('Error deleting department:', err);
      addToast({
        title: 'Error',
        description: 'Failed to delete department',
        color: 'danger',
      });
      throw err;
    }
  };

  // Get branches from API
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);

  const loadBranches = async () => {
    try {
      const response = await apiRequest('/organization/branches');
      if (response && response.data && Array.isArray(response.data)) {
        setBranches(response.data.map((branch: any) => ({
          id: branch.id,
          name: branch.name
        })));
      }
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(departments)) {
      return { total: 0, totalEmployees: 0, totalBranches: 0 };
    }
    
    const total = departments.length;
    const totalEmployees = departments.reduce((sum, dept) => sum + (dept.employee_count || 0), 0);
    const totalBranches = new Set(departments.map(dept => dept.branch_name).filter(Boolean)).size;
    
    return { total, totalEmployees, totalBranches };
  }, [departments]);

  return {
    departments,
    filteredDepartments,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedBranch,
    setSelectedBranch,
    branches,
    stats,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    loadDepartments,
  };
};
