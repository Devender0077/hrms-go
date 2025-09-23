import { useState, useEffect } from 'react';
    import { addToast } from '@heroui/react';
    import { format } from 'date-fns';
    
    export const useAttendance = () => {
      const [isLoading, setIsLoading] = useState(true);
      const [attendance, setAttendance] = useState([]);
      const [employees, setEmployees] = useState([]);
      const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
      const [filters, setFilters] = useState({
        search: '',
        status: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        onLeaveToday: 0,
        averageWorkHours: 0,
        attendanceRate: 0
      });
      const [todayAttendance, setTodayAttendance] = useState(null);
      
      const fetchAttendance = async () => {
        try {
          setIsLoading(true);
          
          // In a real implementation, this would be an API call with filters and pagination
          // For now, we'll use mock data
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock attendance data
          const mockAttendance = [
            {
              id: 1,
              employee_id: 'EMP001',
              first_name: 'John',
              last_name: 'Doe',
              date: '2023-07-03',
              check_in: '2023-07-03T09:00:00',
              check_out: '2023-07-03T17:30:00',
              status: 'present',
              work_hours: 8.5
            },
            {
              id: 2,
              employee_id: 'EMP002',
              first_name: 'Jane',
              last_name: 'Smith',
              date: '2023-07-03',
              check_in: '2023-07-03T09:15:00',
              check_out: '2023-07-03T17:45:00',
              status: 'late',
              work_hours: 8.5
            },
            {
              id: 3,
              employee_id: 'EMP003',
              first_name: 'Robert',
              last_name: 'Johnson',
              date: '2023-07-03',
              check_in: null,
              check_out: null,
              status: 'absent',
              work_hours: 0
            },
            {
              id: 4,
              employee_id: 'EMP004',
              first_name: 'Emily',
              last_name: 'Davis',
              date: '2023-07-03',
              check_in: null,
              check_out: null,
              status: 'leave',
              work_hours: 0
            },
            {
              id: 5,
              employee_id: 'EMP005',
              first_name: 'Michael',
              last_name: 'Wilson',
              date: '2023-07-03',
              check_in: '2023-07-03T08:45:00',
              check_out: '2023-07-03T17:15:00',
              status: 'present',
              work_hours: 8.5
            }
          ];
          
          // Apply filters
          let filteredAttendance = [...mockAttendance];
          
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredAttendance = filteredAttendance.filter(record => 
              record.first_name.toLowerCase().includes(searchTerm) ||
              record.last_name.toLowerCase().includes(searchTerm) ||
              record.employee_id.toLowerCase().includes(searchTerm)
            );
          }
          
          if (filters.status) {
            filteredAttendance = filteredAttendance.filter(record => 
              record.status === filters.status
            );
          }
          
          if (filters.date) {
            filteredAttendance = filteredAttendance.filter(record => 
              record.date === filters.date
            );
          }
          
          // Apply pagination
          const total = filteredAttendance.length;
          const totalPages = Math.ceil(total / pagination.limit);
          const start = (pagination.page - 1) * pagination.limit;
          const end = start + pagination.limit;
          const paginatedAttendance = filteredAttendance.slice(start, end);
          
          setAttendance(paginatedAttendance);
          setPagination({
            ...pagination,
            total,
            totalPages
          });
          
          // Mock employees
          const mockEmployees = [
            { id: 1, employee_id: 'EMP001', first_name: 'John', last_name: 'Doe' },
            { id: 2, employee_id: 'EMP002', first_name: 'Jane', last_name: 'Smith' },
            { id: 3, employee_id: 'EMP003', first_name: 'Robert', last_name: 'Johnson' },
            { id: 4, employee_id: 'EMP004', first_name: 'Emily', last_name: 'Davis' },
            { id: 5, employee_id: 'EMP005', first_name: 'Michael', last_name: 'Wilson' }
          ];
          setEmployees(mockEmployees);
          
          // Mock stats
          const mockStats = {
            totalEmployees: 42,
            presentToday: 35,
            absentToday: 3,
            lateToday: 2,
            onLeaveToday: 2,
            averageWorkHours: 7.8,
            attendanceRate: 83.3
          };
          setStats(mockStats);
          
          // Mock today's attendance for current user
          const mockTodayAttendance = {
            id: 1,
            date: format(new Date(), 'yyyy-MM-dd'),
            check_in: '2023-07-03T09:00:00',
            check_out: null,
            status: 'present'
          };
          setTodayAttendance(mockTodayAttendance);
          
        } catch (error) {
          console.error('Error fetching attendance:', error);
          addToast({
            title: 'Error',
            description: 'Failed to fetch attendance records',
            color: 'danger'
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      useEffect(() => {
        fetchAttendance();
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
      
      const handleDateChange = (date) => {
        setFilters({
          ...filters,
          date
        });
        setPagination({
          ...pagination,
          page: 1
        });
      };
      
      const refreshAttendance = () => {
        fetchAttendance();
      };
      
      const checkIn = async () => {
        try {
          // In a real implementation, this would be an API call
          // For now, we'll just simulate it
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update today's attendance
          setTodayAttendance({
            ...todayAttendance,
            check_in: new Date().toISOString(),
            status: 'present'
          });
          
          addToast({
            title: 'Success',
            description: 'Checked in successfully',
            color: 'success'
          });
          
        } catch (error) {
          console.error('Error checking in:', error);
          addToast({
            title: 'Error',
            description: 'Failed to check in',
            color: 'danger'
          });
        }
      };
      
      const checkOut = async () => {
        try {
          // In a real implementation, this would be an API call
          // For now, we'll just simulate it
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update today's attendance
          setTodayAttendance({
            ...todayAttendance,
            check_out: new Date().toISOString()
          });
          
          addToast({
            title: 'Success',
            description: 'Checked out successfully',
            color: 'success'
          });
          
        } catch (error) {
          console.error('Error checking out:', error);
          addToast({
            title: 'Error',
            description: 'Failed to check out',
            color: 'danger'
          });
        }
      };
      
      return {
        isLoading,
        attendance,
        employees,
        pagination,
        filters,
        stats,
        todayAttendance,
        handlePageChange,
        handleSearch,
        handleFilterChange,
        handleDateChange,
        refreshAttendance,
        checkIn,
        checkOut
      };
    };
