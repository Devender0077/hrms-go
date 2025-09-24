import { useState, useEffect } from 'react';
import { organizationAPI } from '../services/api-service';

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  employeeId: string;
  reportsTo: number | null;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  joinDate: string | null;
  directReports: Employee[];
  gender?: string;
}

export const useOrganizationChart = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizationChart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await organizationAPI.getOrgChart();
      
      if (response.data) {
        setEmployees(response.data);
      }
    } catch (err) {
      console.error('Error loading organization chart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizationChart();
  }, []);

  // Helper function to get employee by ID
  const getEmployee = (id: number): Employee | undefined => {
    const findEmployee = (employees: Employee[]): Employee | undefined => {
      for (const emp of employees) {
        if (emp.id === id) return emp;
        const found = findEmployee(emp.directReports);
        if (found) return found;
      }
      return undefined;
    };
    return findEmployee(employees);
  };

  // Helper function to get direct reports
  const getDirectReports = (employeeId: number): Employee[] => {
    const employee = getEmployee(employeeId);
    return employee?.directReports || [];
  };

  // Helper function to get manager
  const getManager = (employeeId: number): Employee | undefined => {
    const employee = getEmployee(employeeId);
    if (employee?.reportsTo) {
      return getEmployee(employee.reportsTo);
    }
    return undefined;
  };

  // Helper function to get all employees as flat array
  const getAllEmployees = (): Employee[] => {
    const flatten = (employees: Employee[]): Employee[] => {
      const result: Employee[] = [];
      for (const emp of employees) {
        result.push(emp);
        result.push(...flatten(emp.directReports));
      }
      return result;
    };
    return flatten(employees);
  };

  // Helper function to get departments
  const getDepartments = (): string[] => {
    const allEmployees = getAllEmployees();
    const departments = new Set(allEmployees.map(emp => emp.department).filter(dept => dept));
    return Array.from(departments);
  };

  // Helper function to filter employees by department
  const filterEmployeesByDepartment = (department: string): Employee[] => {
    if (department === 'all') return getAllEmployees();
    return getAllEmployees().filter(emp => emp.department === department);
  };

  return {
    employees,
    loading,
    error,
    loadOrganizationChart,
    getEmployee,
    getDirectReports,
    getManager,
    getAllEmployees,
    getDepartments,
    filterEmployeesByDepartment
  };
};
