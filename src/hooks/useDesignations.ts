import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../services/api-service';
import { addToast } from '@heroui/react';

export interface Designation {
  id: number;
  company_id: number;
  department_id?: number;
  name: string;
  description?: string;
  department_name?: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface DesignationFormData {
  name: string;
  description?: string;
  department_id?: number;
}

export const useDesignations = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const loadDesignations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/organization/designations', 'GET');
      
      if (response && response.data && Array.isArray(response.data)) {
        setDesignations(response.data);
      } else {
        console.warn('Unexpected API response format:', response);
        setDesignations([]);
      }
    } catch (err) {
      console.error('Error loading designations:', err);
      setError('Failed to load designations');
      setDesignations([]);
      addToast({
        title: 'Error',
        description: 'Failed to load designations',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const filteredDesignations = useMemo(() => {
    if (!Array.isArray(designations)) {
      return [];
    }
    
    return designations.filter((designation) => {
      const matchesSearch = 
        (designation.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (designation.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (designation.department_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || designation.department_name === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [designations, searchQuery, selectedDepartment]);

  const addDesignation = async (designationData: DesignationFormData) => {
    try {
      const response = await apiRequest('/organization/designations', { method: 'POST', body: JSON.stringify(designationData) });
      
      if (response && response.data) {
        setDesignations(prev => [...prev, response.data]);
        addToast({
          title: 'Success',
          description: 'Designation added successfully',
          color: 'success',
        });
        return response.data;
      }
    } catch (err) {
      console.error('Error adding designation:', err);
      addToast({
        title: 'Error',
        description: 'Failed to add designation',
        color: 'danger',
      });
      throw err;
    }
  };

  const updateDesignation = async (id: number, designationData: DesignationFormData) => {
    try {
      const response = await apiRequest(`/organization/designations/${id}`, { method: 'PUT', body: JSON.stringify(designationData) });
      
      if (response && response.data) {
        setDesignations(prev => 
          prev.map(desig => desig.id === id ? response.data : desig)
        );
        addToast({
          title: 'Success',
          description: 'Designation updated successfully',
          color: 'success',
        });
        return response.data;
      }
    } catch (err) {
      console.error('Error updating designation:', err);
      addToast({
        title: 'Error',
        description: 'Failed to update designation',
        color: 'danger',
      });
      throw err;
    }
  };

  const deleteDesignation = async (id: number) => {
    try {
      await apiRequest(`/organization/designations/${id}`, 'DELETE');
      
      setDesignations(prev => prev.filter(desig => desig.id !== id));
      addToast({
        title: 'Success',
        description: 'Designation deleted successfully',
        color: 'success',
      });
    } catch (err) {
      console.error('Error deleting designation:', err);
      addToast({
        title: 'Error',
        description: 'Failed to delete designation',
        color: 'danger',
      });
      throw err;
    }
  };

  // Get departments from API
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([]);

  const loadDepartments = async () => {
    try {
      const response = await apiRequest('/organization/departments', 'GET');
      if (response && response.data && Array.isArray(response.data)) {
        setDepartments(response.data.map((dept: any) => ({
          id: dept.id,
          name: dept.name
        })));
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(designations)) {
      return { total: 0, totalEmployees: 0, totalDepartments: 0 };
    }
    
    const total = designations.length;
    const totalEmployees = designations.reduce((sum, desig) => sum + (desig.employee_count || 0), 0);
    const totalDepartments = new Set(designations.map(desig => desig.department_name).filter(Boolean)).size;
    
    return { total, totalEmployees, totalDepartments };
  }, [designations]);

  return {
    designations,
    filteredDesignations,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    departments,
    stats,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    loadDesignations,
  };
};
