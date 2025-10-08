import React, { useState, useMemo } from "react";
import { Button, Spinner, useDisclosure } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEmployees } from "../hooks/useEmployees";
import { Employee, EmployeeFilters, EmployeeFormData } from "../types/employee";
import EmployeeStats from "../components/employees/EmployeeStats";
import EmployeeFiltersComponent from "../components/employees/EmployeeFilters";
import EmployeeTable from "../components/employees/EmployeeTable";
import EmployeeModals from "../components/employees/EmployeeModals";
import ChangePasswordModal from "../components/employees/ChangePasswordModal";
import HeroSection from "../components/common/HeroSection";
import { useTranslation } from "../contexts/translation-context";

export default function EmployeesPage() {
  const { t } = useTranslation();
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 dark:text-default-400 mt-4 text-sm sm:text-base">Loading employees...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Icon icon="lucide:alert-circle" className="w-12 h-12 sm:w-16 sm:h-16 text-danger mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Error Loading Employees</h2>
          <p className="text-default-500 dark:text-default-400 mb-4 text-sm sm:text-base">{error}</p>
          <Button color="primary" onPress={() => window.location.reload()} className="font-medium">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
      
      return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title={t('Employees')}
          subtitle={t('HR Management')}
          description="Manage your organization's workforce with comprehensive employee data, performance tracking, and streamlined HR processes."
          icon="lucide:users"
          illustration="employee"
          actions={[
            {
              label: "Add Employee",
              icon: "lucide:plus",
              onPress: onAddOpen,
              variant: "solid"
            },
            {
              label: "Export Data",
              icon: "lucide:download",
              onPress: () => {},
              variant: "bordered"
            }
          ]}
        />

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EmployeeStats stats={stats} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EmployeeFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            departments={departments}
            branches={branches}
          />
        </motion.div>

        {/* Employee Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
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
        </motion.div>

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
          employees={employees}
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
