import React from 'react';
import { Input, Select, SelectItem, Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface DepartmentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  onAddDepartment: () => void;
  onExportDepartments: () => void;
  isExporting: boolean;
  branches: Array<{ id: number; name: string }>;
  totalCount: number;
  filteredCount: number;
}

const DepartmentFilters: React.FC<DepartmentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedBranch,
  setSelectedBranch,
  onAddDepartment,
  onExportDepartments,
  isExporting,
  branches,
  totalCount,
  filteredCount,
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Icon icon="lucide:search" className="text-gray-400" />}
            className="max-w-xs"
            aria-label="Search departments"
          />
          <div className="flex flex-wrap gap-3">
            <Select
              label="Branch"
              placeholder="All Branches"
              selectedKeys={[selectedBranch]}
              onSelectionChange={(keys) => setSelectedBranch(Array.from(keys)[0] as string)}
              items={[{ key: 'all', label: 'All Branches' }, ...branches.map(branch => ({ key: branch.name, label: branch.name }))]}
              className="max-w-[180px]"
              aria-label="Filter by Branch"
            >
              {(item) => (
                <SelectItem key={item.key} textValue={item.label}>
                  {item.label}
                </SelectItem>
              )}
            </Select>
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onAddDepartment}
              className="font-medium"
              aria-label="Add Department"
            >
              Add Department
            </Button>
            <Button
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              onPress={onExportDepartments}
              isLoading={isExporting}
              className="font-medium"
              aria-label="Export Departments"
            >
              Export
            </Button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCount} of {totalCount} departments
        </div>
      </CardBody>
    </Card>
  );
};

export default DepartmentFilters;
