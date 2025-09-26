// Employee types and interfaces

export interface Employee {
  id: number;
  user_id: number;
  company_id: number;
  branch_id?: number;
  department_id?: number;
  designation_id?: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  joining_date?: string;
  exit_date?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  profile_photo?: string;
  department_name?: string;
  designation_name?: string;
  branch_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_id: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  joining_date: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  department_id?: number;
  designation_id?: number;
  branch_id?: number;
}

export interface EmployeeFilters {
  searchQuery: string;
  selectedDepartment: string;
  selectedStatus: string;
  selectedBranch: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  departments: number;
}
