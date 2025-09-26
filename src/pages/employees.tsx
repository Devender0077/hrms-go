import React, { useState, useMemo } from "react";
import { Button, Spinner, useDisclosure } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { useEmployees } from "../hooks/useEmployees";
import { Employee, EmployeeFilters, EmployeeFormData } from "../types/employee";
import EmployeeStats from "../components/employees/EmployeeStats";
import EmployeeFiltersComponent from "../components/employees/EmployeeFilters";
import EmployeeTable from "../components/employees/EmployeeTable";
import EmployeeModals from "../components/employees/EmployeeModals";
import ChangePasswordModal from "../components/employees/ChangePasswordModal";

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    branches,
    departments,
    designations,
    shifts,
    attendancePolicies,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    filterEmployees,
    getEmployeeStats
  } = useEmployees();

  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const { isOpen: isChangePasswordOpen, onOpen: onChangePasswordOpen, onOpenChange: onChangePasswordOpenChange } = useDisclosure();

  // Component states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [passwordChangeEmployee, setPasswordChangeEmployee] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filters state
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchQuery: "",
    selectedDepartment: "all",
    selectedStatus: "all",
    selectedBranch: "all"
  });

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return filterEmployees(filters);
  }, [employees, filters, filterEmployees]);

  // Paginated employees
  const paginatedEmployees = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
    return filteredEmployees.slice(start, start + rowsPerPage);
  }, [filteredEmployees, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => getEmployeeStats(), [employees, getEmployeeStats]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  // Event handlers
  const handleAddEmployee = async (data: Partial<EmployeeFormData>) => {
    const success = await createEmployee(data);
    if (success) {
      onAddOpenChange();
    }
  };

  const handleEditEmployee = async (data: Partial<EmployeeFormData>) => {
    if (editingEmployee) {
      const success = await updateEmployee(editingEmployee.id, data);
      if (success) {
        onEditOpenChange();
        setEditingEmployee(null);
      }
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    await deleteEmployee(id);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    onViewOpen();
  };

  const handleEditEmployeeClick = (employee: Employee) => {
    setEditingEmployee(employee);
    onEditOpen();
  };

  const handleChangePassword = (employee: Employee) => {
    setPasswordChangeEmployee(employee);
    onChangePasswordOpen();
  };

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    try {
      await updateEmployee(employee.id, { status: newStatus });
        } catch (error) {
      console.error('Error toggling employee status:', error);
    }
  };

  // Loading state
  if (loading || !Array.isArray(employees)) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading employees...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Employees</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button color="primary" onPress={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
      
      return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Icon icon="lucide:users" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-gray-600 mt-1">Manage your organization's employees</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />} 
              onPress={onAddOpen}
              className="font-medium"
            >
                Add Employee
              </Button>
          </div>
        </div>

        {/* Statistics */}
        <EmployeeStats stats={stats} />

        {/* Filters */}
        <EmployeeFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          departments={departments}
          branches={branches}
        />

        {/* Employee Table */}
        <EmployeeTable
          employees={paginatedEmployees}
          onView={handleViewEmployee}
          onEdit={handleEditEmployeeClick}
          onDelete={handleDeleteEmployee}
          onChangePassword={handleChangePassword}
          onToggleStatus={handleToggleStatus}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* Modals */}
        <EmployeeModals
          isAddOpen={isAddOpen}
          onAddOpenChange={onAddOpenChange}
          onAddSubmit={handleAddEmployee}
          isEditOpen={isEditOpen}
          onEditOpenChange={onEditOpenChange}
          editingEmployee={editingEmployee}
          onEditSubmit={handleEditEmployee}
          isViewOpen={isViewOpen}
          onViewOpenChange={onViewOpenChange}
          selectedEmployee={selectedEmployee}
          branches={branches}
          departments={departments}
          designations={designations}
          shifts={shifts}
          attendancePolicies={attendancePolicies}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={onChangePasswordOpenChange}
          employee={passwordChangeEmployee}
          onSuccess={() => {
            // Refresh employees list or show success message
            console.log('Password changed successfully');
          }}
        />
      </div>
        </div>
      );
    }
