import React from "react";
import { Card, CardBody, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { EmployeeFilters as Filters } from "../../types/employee";

interface EmployeeFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  departments: Array<{ id: number; name: string }>;
  branches: Array<{ id: number; name: string }>;
}

const EmployeeFiltersComponent: React.FC<EmployeeFiltersProps> = ({
  filters,
  onFiltersChange,
  departments,
  branches
}) => {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const statusOptions = [
    { key: "all", label: "All Status" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "on_leave", label: "On Leave" },
    { key: "terminated", label: "Terminated" }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search employees..."
            
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            aria-label="Search employees"
          />
          
          <Select
            label="Department"
            placeholder="All Departments"
            selectedKeys={[filters.selectedDepartment]}
            onSelectionChange={(keys) => handleFilterChange('selectedDepartment', Array.from(keys)[0] as string)}
            aria-label="Filter by department"
          >
            <SelectItem key="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.name}>{dept.name}</SelectItem>
            )) as any}
          </Select>
          
          <Select
            label="Status"
            placeholder="All Status"
            selectedKeys={[filters.selectedStatus]}
            onSelectionChange={(keys) => handleFilterChange('selectedStatus', Array.from(keys)[0] as string)}
            aria-label="Filter by status"
          >
            {statusOptions.map(status => (
              <SelectItem key={status.key}>
                {status.label}
              </SelectItem>
            )) as any}
          </Select>
          
          <Select
            label="Branch"
            placeholder="All Branches"
            selectedKeys={[filters.selectedBranch]}
            onSelectionChange={(keys) => handleFilterChange('selectedBranch', Array.from(keys)[0] as string)}
            aria-label="Filter by branch"
          >
            <SelectItem key="all">All Branches</SelectItem>
            {branches.map(branch => (
              <SelectItem key={branch.name}>{branch.name}</SelectItem>
            )) as any}
          </Select>
        </div>
      </CardBody>
    </Card>
  );
};

export default EmployeeFiltersComponent;
