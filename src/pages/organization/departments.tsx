import React, { useState, useRef } from "react";
import { Button, Card, CardBody, CardHeader, Spinner, useDisclosure } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { useDepartments, Department } from "../../hooks/useDepartments";
import DepartmentStats from "../../components/departments/DepartmentStats";
import DepartmentFilters from "../../components/departments/DepartmentFilters";
import DepartmentTable from "../../components/departments/DepartmentTable";
import DepartmentModals from "../../components/departments/DepartmentModals";
    
    export default function Departments() {
  const {
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
  } = useDepartments();

  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onOpenChange: onOpenChangeAdd } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenView, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Paginate filtered departments
  const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleViewDepartment = (department: Department) => {
          setSelectedDepartment(department);
    onViewOpen();
  };

  const handleEditDepartmentClick = (department: Department) => {
    setEditingDepartment(department);
    onOpenEdit();
  };

  const handleDeleteDepartmentClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        // Error is already handled in the hook
      }
    }
  };

  const handleAddDepartmentSubmit = async (data: any) => {
    try {
      await addDepartment(data);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleEditDepartmentSubmit = async (id: number, data: any) => {
    try {
      await updateDepartment(id, data);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleExportDepartments = async () => {
    setIsExporting(true);
    try {
      // Simple CSV export
      const csvContent = [
        ['Name', 'Description', 'Branch', 'Employee Count', 'Created'],
        ...filteredDepartments.map(dept => [
          dept.name,
          dept.description || '',
          dept.branch_name || '',
          dept.employee_count.toString(),
          new Date(dept.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `departments-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
      
  if (loading) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-default-600 mt-4">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Departments</h2>
          <p className="text-default-600 mb-4">{error}</p>
          <Button color="primary" onPress={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
      
      return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Icon icon="lucide:building" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Departments</h1>
              <p className="text-default-600 mt-1">Manage company departments and teams</p>
            </div>
          </div>
                  </div>

        {/* Statistics Cards */}
        <DepartmentStats stats={stats} loading={loading} />

        {/* Filters and Actions */}
        <DepartmentFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          onAddDepartment={onOpenAdd}
          onExportDepartments={handleExportDepartments}
          isExporting={isExporting}
          branches={branches}
          totalCount={departments.length}
          filteredCount={filteredDepartments.length}
        />

        {/* Departments Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-primary-600 text-xl" />
                  <div>
                <h3 className="text-lg font-semibold text-foreground">Department Directory</h3>
                <p className="text-default-500 text-sm">Click on actions to view, edit, or manage departments</p>
                  </div>
          </div>
            </CardHeader>
          <CardBody className="pt-0">
            <DepartmentTable
              departments={paginatedDepartments}
                      page={page}
              totalPages={totalPages}
              setPage={setPage}
              onView={handleViewDepartment}
              onEdit={handleEditDepartmentClick}
              onDelete={handleDeleteDepartmentClick}
            />
            </CardBody>
          </Card>
          
        {/* Modals */}
        <DepartmentModals
          isOpenAdd={isOpenAdd}
          onOpenChangeAdd={onOpenChangeAdd}
          isOpenEdit={isOpenEdit}
          onOpenChangeEdit={onOpenChangeEdit}
          isOpenView={isOpenView}
          onOpenChangeView={onViewOpenChange}
          selectedDepartment={selectedDepartment}
          editingDepartment={editingDepartment}
          handleAddDepartment={handleAddDepartmentSubmit}
          handleEditDepartment={handleEditDepartmentSubmit}
          branches={branches}
        />
      </div>
                    </div>
      );
    }