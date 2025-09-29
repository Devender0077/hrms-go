import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader, Spinner, useDisclosure } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { useDesignations, Designation } from "../../hooks/useDesignations";
import DesignationStats from "../../components/designations/DesignationStats";
import DesignationFilters from "../../components/designations/DesignationFilters";
import DesignationTable from "../../components/designations/DesignationTable";
import DesignationModals from "../../components/designations/DesignationModals";
    
    export default function Designations() {
  const {
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
  } = useDesignations();

  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onOpenChange: onOpenChangeAdd } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenView, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();

  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
      const rowsPerPage = 10;
      
  // Paginate filtered designations
  const totalPages = Math.ceil(filteredDesignations.length / rowsPerPage);
  const paginatedDesignations = filteredDesignations.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleViewDesignation = (designation: Designation) => {
    setSelectedDesignation(designation);
    onViewOpen();
  };

  const handleEditDesignationClick = (designation: Designation) => {
    setEditingDesignation(designation);
    onOpenEdit();
  };

  const handleDeleteDesignationClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        await deleteDesignation(id);
      } catch (err) {
        // Error is already handled in the hook
      }
    }
  };

  const handleAddDesignationSubmit = async (data: any) => {
    try {
      await addDesignation(data);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleEditDesignationSubmit = async (id: number, data: any) => {
    try {
      await updateDesignation(id, data);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleExportDesignations = async () => {
    setIsExporting(true);
    try {
      // Simple CSV export
      const csvContent = [
        ['Name', 'Description', 'Department', 'Employee Count', 'Created'],
        ...filteredDesignations.map(desig => [
          desig.name,
          desig.description || '',
          desig.department_name || '',
          desig.employee_count.toString(),
          new Date(desig.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `designations-export-${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-default-600 mt-4">Loading designations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Designations</h2>
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
              <Icon icon="lucide:award" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Designations</h1>
              <p className="text-default-600 mt-1">Manage job titles and positions</p>
            </div>
          </div>
                  </div>

        {/* Statistics Cards */}
        <DesignationStats stats={stats} loading={loading} />

        {/* Filters and Actions */}
        <DesignationFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          onAddDesignation={onOpenAdd}
          onExportDesignations={handleExportDesignations}
          isExporting={isExporting}
          departments={departments}
          totalCount={designations.length}
          filteredCount={filteredDesignations.length}
        />

        {/* Designations Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-secondary-600 text-xl" />
                  <div>
                <h3 className="text-lg font-semibold text-foreground">Designation Directory</h3>
                <p className="text-default-500 text-sm">Click on actions to view, edit, or manage designations</p>
                  </div>
          </div>
            </CardHeader>
          <CardBody className="pt-0">
            <DesignationTable
              designations={paginatedDesignations}
                      page={page}
              totalPages={totalPages}
              setPage={setPage}
              onView={handleViewDesignation}
              onEdit={handleEditDesignationClick}
              onDelete={handleDeleteDesignationClick}
            />
            </CardBody>
          </Card>
          
        {/* Modals */}
        <DesignationModals
          isOpenAdd={isOpenAdd}
          onOpenChangeAdd={onOpenChangeAdd}
          isOpenEdit={isOpenEdit}
          onOpenChangeEdit={onOpenChangeEdit}
          isOpenView={isOpenView}
          onOpenChangeView={onViewOpenChange}
          selectedDesignation={selectedDesignation}
          editingDesignation={editingDesignation}
          handleAddDesignation={handleAddDesignationSubmit}
          handleEditDesignation={handleEditDesignationSubmit}
          departments={departments}
                      />
                    </div>
    </div>
      );
    }