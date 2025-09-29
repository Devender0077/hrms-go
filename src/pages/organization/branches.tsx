import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader, Spinner, useDisclosure } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { useBranches, Branch } from "../../hooks/useBranches";
import BranchStats from "../../components/branches/BranchStats";
import BranchFilters from "../../components/branches/BranchFilters";
import BranchTable from "../../components/branches/BranchTable";
import BranchModals from "../../components/branches/BranchModals";
    
    export default function Branches() {
  const {
    branches,
    filteredBranches,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCountry,
    setSelectedCountry,
    countries,
    stats,
    addBranch,
    updateBranch,
    deleteBranch,
  } = useBranches();

  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onOpenChange: onOpenChangeAdd } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenView, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Paginate filtered branches
  const totalPages = Math.ceil(filteredBranches.length / rowsPerPage);
  const paginatedBranches = filteredBranches.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleViewBranch = (branch: Branch) => {
          setSelectedBranch(branch);
    onViewOpen();
  };

  const handleEditBranchClick = (branch: Branch) => {
    setEditingBranch(branch);
    onOpenEdit();
  };

  const handleDeleteBranchClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteBranch(id);
      } catch (err) {
        // Error is already handled in the hook
      }
    }
  };

  const handleAddBranchSubmit = async (data: any) => {
    try {
      await addBranch(data);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleEditBranchSubmit = async (id: number, data: any) => {
    try {
      await updateBranch(id, data);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleExportBranches = async () => {
    setIsExporting(true);
    try {
      // Simple CSV export
      const csvContent = [
        ['Name', 'Location', 'Address', 'City', 'State', 'Country', 'Zip Code', 'Employees', 'Departments', 'Created'],
        ...filteredBranches.map(branch => [
          branch.name,
          branch.location || '',
          branch.address || '',
          branch.city || '',
          branch.state || '',
          branch.country || '',
          branch.zip_code || '',
          branch.employee_count.toString(),
          branch.department_count.toString(),
          new Date(branch.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `branches-export-${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-default-600 mt-4">Loading branches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Branches</h2>
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
              <h1 className="text-3xl font-bold text-foreground">Branches</h1>
              <p className="text-default-600 mt-1">Manage company branches and locations</p>
            </div>
          </div>
                  </div>

        {/* Statistics Cards */}
        <BranchStats stats={stats} loading={loading} />

        {/* Filters and Actions */}
        <BranchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          onAddBranch={onOpenAdd}
          onExportBranches={handleExportBranches}
          isExporting={isExporting}
          countries={countries}
          totalCount={branches.length}
          filteredCount={filteredBranches.length}
        />

        {/* Branches Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-primary-600 text-xl" />
                  <div>
                <h3 className="text-lg font-semibold text-foreground">Branch Directory</h3>
                <p className="text-default-500 text-sm">Click on actions to view, edit, or manage branches</p>
                  </div>
          </div>
            </CardHeader>
          <CardBody className="pt-0">
            <BranchTable
              branches={paginatedBranches}
                      page={page}
              totalPages={totalPages}
              setPage={setPage}
              onView={handleViewBranch}
              onEdit={handleEditBranchClick}
              onDelete={handleDeleteBranchClick}
            />
            </CardBody>
          </Card>
          
        {/* Modals */}
        <BranchModals
          isOpenAdd={isOpenAdd}
          onOpenChangeAdd={onOpenChangeAdd}
          isOpenEdit={isOpenEdit}
          onOpenChangeEdit={onOpenChangeEdit}
          isOpenView={isOpenView}
          onOpenChangeView={onViewOpenChange}
          selectedBranch={selectedBranch}
          editingBranch={editingBranch}
          handleAddBranch={handleAddBranchSubmit}
          handleEditBranch={handleEditBranchSubmit}
                      />
                    </div>
    </div>
      );
    }