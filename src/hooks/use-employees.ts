import { useState, useEffect } from 'react';
    import { addToast } from '@heroui/react';
    
    export const useEmployees = () => {
      const [isLoading, setIsLoading] = useState(true);
      const [employees, setEmployees] = useState([]);
      const [departments, setDepartments] = useState([]);
      const [designations, setDesignations] = useState([]);
      const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
      const [filters, setFilters] = useState({
        search: '',
        department: '',
        designation: '',
        status: '',
        sortBy: 'id',
        sortOrder: 'desc'
      });
      
      const fetchEmployees = async () => {
        try {
          setIsLoading(true);
          
          // In a real implementation, this would be an API call with filters and pagination
          // For now, we'll use mock data
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock employees data
          const mockEmployees = [
            {
              id: 1,
              employee_id: 'EMP001',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1234567890',
              department: 'IT',
              designation: 'Software Engineer',
              joining_date: '2022-01-15',
              status: 'active',
              profile_photo: null
            },
            {
              id: 2,
              employee_id: 'EMP002',
              first_name: 'Jane',
              last_name: 'Smith',
              email: 'jane.smith@example.com',
              phone: '+1234567891',
              department: 'HR',
              designation: 'HR Manager',
              joining_date: '2022-02-01',
              status: 'active',
              profile_photo: null
            },
            {
              id: 3,
              employee_id: 'EMP003',
              first_name: 'Robert',
              last_name: 'Johnson',
              email: 'robert.johnson@example.com',
              phone: '+1234567892',
              department: 'Finance',
              designation: 'Accountant',
              joining_date: '2022-03-10',
              status: 'on_leave',
              profile_photo: null
            },
            {
              id: 4,
              employee_id: 'EMP004',
              first_name: 'Emily',
              last_name: 'Davis',
              email: 'emily.davis@example.com',
              phone: '+1234567893',
              department: 'Marketing',
              designation: 'Marketing Manager',
              joining_date: '2022-04-05',
              status: 'active',
              profile_photo: null
            },
            {
              id: 5,
              employee_id: 'EMP005',
              first_name: 'Michael',
              last_name: 'Wilson',
              email: 'michael.wilson@example.com',
              phone: '+1234567894',
              department: 'IT',
              designation: 'System Administrator',
              joining_date: '2022-05-20',
              status: 'inactive',
              profile_photo: null
            }
          ];
          
          // Apply filters
          let filteredEmployees = [...mockEmployees];
          
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredEmployees = filteredEmployees.filter(emp => 
              emp.first_name.toLowerCase().includes(searchTerm) ||
              emp.last_name.toLowerCase().includes(searchTerm) ||
              emp.email.toLowerCase().includes(searchTerm) ||
              emp.employee_id.toLowerCase().includes(searchTerm)
            );
          }
          
          if (filters.department) {
            filteredEmployees = filteredEmployees.filter(emp => 
              emp.department.toLowerCase() === filters.department.toLowerCase()
            );
          }
          
          if (filters.designation) {
            filteredEmployees = filteredEmployees.filter(emp => 
              emp.designation.toLowerCase() === filters.designation.toLowerCase()
            );
          }
          
          if (filters.status) {
            filteredEmployees = filteredEmployees.filter(emp => 
              emp.status === filters.status
            );
          }
          
          // Apply sorting
          filteredEmployees.sort((a, b) => {
            const aValue = a[filters.sortBy];
            const bValue = b[filters.sortBy];
            
            if (filters.sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
          
          // Apply pagination
          const total = filteredEmployees.length;
          const totalPages = Math.ceil(total / pagination.limit);
          const start = (pagination.page - 1) * pagination.limit;
          const end = start + pagination.limit;
          const paginatedEmployees = filteredEmployees.slice(start, end);
          
          setEmployees(paginatedEmployees);
          setPagination({
            ...pagination,
            total,
            totalPages
          });
          
          // Mock departments
          const mockDepartments = [
            { id: 'IT', name: 'IT' },
            { id: 'HR', name: 'HR' },
            { id: 'Finance', name: 'Finance' },
            { id: 'Marketing', name: 'Marketing' },
            { id: 'Operations', name: 'Operations' }
          ];
          setDepartments(mockDepartments);
          
          // Mock designations
          const mockDesignations = [
            { id: 'Software Engineer', name: 'Software Engineer', department_id: 'IT' },
            { id: 'System Administrator', name: 'System Administrator', department_id: 'IT' },
            { id: 'HR Manager', name: 'HR Manager', department_id: 'HR' },
            { id: 'HR Executive', name: 'HR Executive', department_id: 'HR' },
            { id: 'Finance Manager', name: 'Finance Manager', department_id: 'Finance' },
            { id: 'Accountant', name: 'Accountant', department_id: 'Finance' },
            { id: 'Marketing Manager', name: 'Marketing Manager', department_id: 'Marketing' },
            { id: 'Marketing Executive', name: 'Marketing Executive', department_id: 'Marketing' },
            { id: 'Operations Manager', name: 'Operations Manager', department_id: 'Operations' },
            { id: 'Operations Executive', name: 'Operations Executive', department_id: 'Operations' }
          ];
          setDesignations(mockDesignations);
          
        } catch (error) {
          console.error('Error fetching employees:', error);
          addToast({
            title: 'Error',
            description: 'Failed to fetch employees',
            color: 'danger'
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      useEffect(() => {
        fetchEmployees();
      }, [pagination.page, filters]);
      
      const handlePageChange = (page) => {
        setPagination({
          ...pagination,
          page
        });
      };
      
      const handleSearch = (value) => {
        setFilters({
          ...filters,
          search: value
        });
        setPagination({
          ...pagination,
          page: 1
        });
      };
      
      const handleFilterChange = (field, value) => {
        setFilters({
          ...filters,
          [field]: value
        });
        setPagination({
          ...pagination,
          page: 1
        });
      };
      
      const handleStatusChange = (status) => {
        setFilters({
          ...filters,
          status
        });
        setPagination({
          ...pagination,
          page: 1
        });
      };
      
      const handleSort = (field) => {
        const newSortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
        setFilters({
          ...filters,
          sortBy: field,
          sortOrder: newSortOrder
        });
      };
      
      const refreshEmployees = () => {
        fetchEmployees();
      };
      
      const deleteEmployee = async (id) => {
        try {
          // In a real implementation, this would be an API call
          // For now, we'll just simulate it
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove employee from state
          setEmployees(employees.filter(emp => emp.id !== id));
          
          addToast({
            title: 'Success',
            description: 'Employee deleted successfully',
            color: 'success'
          });
          
          // Refresh employees
          refreshEmployees();
          
        } catch (error) {
          console.error('Error deleting employee:', error);
          addToast({
            title: 'Error',
            description: 'Failed to delete employee',
            color: 'danger'
          });
        }
      };
      
      return {
        isLoading,
        employees,
        departments,
        designations,
        pagination,
        filters,
        setFilters,
        handlePageChange,
        handleSearch,
        handleFilterChange,
        handleStatusChange,
        handleSort,
        refreshEmployees,
        deleteEmployee
      };
    };
