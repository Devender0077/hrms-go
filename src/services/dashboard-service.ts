import { apiRequest } from './api-service';

export interface DashboardStats {
  totalUsers?: number;
  totalEmployees?: number;
  activeUsers?: number;
  activeEmployees?: number;
  totalCompanies?: number;
  recentActivity?: number;
  systemUptime?: string;
  monthlyStats?: Array<{ month: string; count: number }>;
  
  // Company Admin specific
  newHires?: number;
  departures?: number;
  attendanceRate?: number;
  leaveRequests?: number;
  pendingApprovals?: number;
  departmentCount?: number;
  departmentStats?: Array<{ department_name: string; employee_count: number }>;
  attendanceStats?: Array<{ date: string; present_count: number }>;
  
  // Employee specific
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  leaveBalance?: number;
  upcomingEvents?: number;
  teamMembers?: number;
  projects?: number;
  upcomingTasks?: Array<{
    id: number;
    title: string;
    priority: string;
    due_date: string;
    status: string;
    progress: number;
  }>;
  teamMembers?: Array<{
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    status: string;
  }>;
  attendanceStats?: {
    total_days: number;
    present_days: number;
    late_days: number;
  };
}

class DashboardService {
  /**
   * Get dashboard statistics for Super Admin
   */
  async getSuperAdminStats(): Promise<DashboardStats> {
    try {
      const response = await apiRequest('/dashboard/super-admin', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch super admin dashboard data');
      }
    } catch (error) {
      console.error('Error fetching super admin dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics for Company Admin
   */
  async getCompanyAdminStats(): Promise<DashboardStats> {
    try {
      const response = await apiRequest('/dashboard/company-admin', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch company admin dashboard data');
      }
    } catch (error) {
      console.error('Error fetching company admin dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics for Employee
   */
  async getEmployeeStats(): Promise<DashboardStats> {
    try {
      const response = await apiRequest('/dashboard/employee', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch employee dashboard data');
      }
    } catch (error) {
      console.error('Error fetching employee dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics based on user role
   */
  async getDashboardStats(userRole: string): Promise<DashboardStats> {
    switch (userRole) {
      case 'super_admin':
        return this.getSuperAdminStats();
      case 'company_admin':
      case 'hr_manager':
      case 'admin':
        return this.getCompanyAdminStats();
      case 'employee':
      case 'manager':
        return this.getEmployeeStats();
      default:
        return this.getEmployeeStats(); // Default to employee dashboard
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
