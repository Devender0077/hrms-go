import { useState, useEffect, useMemo } from "react";
import { employeeAPI } from "../services/api-service";
import { addToast } from "@heroui/react";
import { Employee, EmployeeFormData, EmployeeFilters, EmployeeStats } from "../types/employee";
import { apiRequest } from "../services/api-service";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Array<{ id: number; name: string; start_time: string; end_time: string; is_active: boolean }>>([]);
  const [attendancePolicies, setAttendancePolicies] = useState<Array<{ id: number; name: string; policy_type: string }>>([]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.getAll();
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setEmployees(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        console.warn('Unexpected API response format:', response);
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees');
      setEmployees([]);
      addToast({
        title: "Error",
        description: "Failed to load employees",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: Partial<EmployeeFormData>) => {
    try {
      await employeeAPI.create(employeeData);
      addToast({
        title: "Success",
        description: "Employee added successfully",
        color: "success"
      });
      loadEmployees();
      return true;
    } catch (err) {
      console.error('Error adding employee:', err);
      addToast({
        title: "Error",
        description: "Failed to add employee",
        color: "danger"
      });
      return false;
    }
  };

  const updateEmployee = async (id: number, employeeData: Partial<EmployeeFormData>) => {
    try {
      await employeeAPI.update(id, employeeData);
      addToast({
        title: "Success",
        description: "Employee updated successfully",
        color: "success"
      });
      loadEmployees();
      return true;
    } catch (err) {
      console.error('Error updating employee:', err);
      addToast({
        title: "Error",
        description: "Failed to update employee",
        color: "danger"
      });
      return false;
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await employeeAPI.delete(id);
      addToast({
        title: "Success",
        description: "Employee deleted successfully",
        color: "success"
      });
      loadEmployees();
      return true;
    } catch (err) {
      console.error('Error deleting employee:', err);
      addToast({
        title: "Error",
        description: "Failed to delete employee",
        color: "danger"
      });
      return false;
    }
  };

  const filterEmployees = (filters: EmployeeFilters) => {
    if (!Array.isArray(employees)) {
      return [];
    }
    
    return employees.filter(employee => {
      const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(filters.searchQuery.toLowerCase()) ||
        (employee.email || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (employee.employee_id || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (employee.department_name || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (employee.designation_name || '').toLowerCase().includes(filters.searchQuery.toLowerCase());
    
      const matchesDepartment = filters.selectedDepartment === "all" || employee.department_name === filters.selectedDepartment;
      const matchesStatus = filters.selectedStatus === "all" || employee.status === filters.selectedStatus;
      const matchesBranch = filters.selectedBranch === "all" || employee.branch_name === filters.selectedBranch;
          
      return matchesSearch && matchesDepartment && matchesStatus && matchesBranch;
    });
  };

  const getEmployeeStats = (): EmployeeStats => {
    if (!Array.isArray(employees)) {
      return { total: 0, active: 0, onLeave: 0, departments: 0 };
    }

    return {
      total: employees.length,
      active: employees.filter(emp => emp.status === 'active').length,
      onLeave: employees.filter(emp => emp.status === 'on_leave').length,
      departments: new Set(employees.map(emp => emp.department_name).filter(Boolean)).size
    };
  };

  const getUniqueDepartments = () => {
    if (!Array.isArray(employees)) return [];
    return Array.from(new Set(employees.map(emp => emp.department_name).filter(Boolean)));
  };

  const getUniqueBranches = () => {
    if (!Array.isArray(employees)) return [];
    return Array.from(new Set(employees.map(emp => emp.branch_name).filter(Boolean)));
  };

  // Fetch branches, departments, and designations from API
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([]);
  const [designations, setDesignations] = useState<Array<{ id: number; name: string }>>([]);

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

  const loadDepartments = async () => {
    try {
      const response = await apiRequest('/organization/departments');
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

  const loadDesignations = async () => {
    try {
      const response = await apiRequest('/organization/designations');
      if (response && response.data && Array.isArray(response.data)) {
        setDesignations(response.data.map((desig: any) => ({
          id: desig.id,
          name: desig.name
        })));
      }
    } catch (err) {
      console.error('Error loading designations:', err);
    }
  };

  const loadShifts = async () => {
    try {
      const response = await apiRequest('/timekeeping/shifts');
      if (response && response.data && Array.isArray(response.data)) {
        setShifts(response.data.map((shift: any) => ({
          id: shift.id,
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          is_active: shift.is_active
        })));
      }
    } catch (err) {
      console.error('Error loading shifts:', err);
    }
  };

  const loadAttendancePolicies = async () => {
    try {
      const response = await apiRequest('/timekeeping/policies');
      if (response && response.data && Array.isArray(response.data)) {
        setAttendancePolicies(response.data.map((policy: any) => ({
          id: policy.id,
          name: policy.name,
          policy_type: policy.policy_type
        })));
      }
    } catch (err) {
      console.error('Error loading attendance policies:', err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadBranches();
    loadDepartments();
    loadDesignations();
    loadShifts();
    loadAttendancePolicies();
  }, []);

  return {
    employees,
    loading,
    error,
    branches,
    departments,
    designations,
    shifts,
    attendancePolicies,
    loadEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    filterEmployees,
    getEmployeeStats,
    getUniqueDepartments,
    getUniqueBranches
  };
};
