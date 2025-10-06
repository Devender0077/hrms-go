import React from 'react';
import { Input, Select, SelectItem, Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface DesignationFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  onAddDesignation: () => void;
  onExportDesignations: () => void;
  isExporting: boolean;
  departments: Array<{ id: number; name: string }>;
  totalCount: number;
  filteredCount: number;
}

const DesignationFilters: React.FC<DesignationFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  onAddDesignation,
  onExportDesignations,
  isExporting,
  departments,
  totalCount,
  filteredCount,
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Input
            placeholder="Search designations..."
            
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            className="max-w-xs"
            aria-label="Search designations"
          />
          <div className="flex flex-wrap gap-3">
            <Select
              label="Department"
              placeholder="All Departments"
              selectedKeys={[selectedDepartment]}
              onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
              items={[{ key: 'all', label: 'All Departments' }, ...departments.map(dept => ({ key: dept.name, label: dept.name }))]}
              className="max-w-[180px]"
              aria-label="Filter by Department"
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
              onPress={onAddDesignation}
              className="font-medium"
              aria-label="Add Designation"
            >
              Add Designation
            </Button>
            <Button
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              onPress={onExportDesignations}
              isLoading={isExporting}
              className="font-medium"
              aria-label="Export Designations"
            >
              Export
            </Button>
          </div>
        </div>
        <div className="mt-4 text-sm text-default-600">
          Showing {filteredCount} of {totalCount} designations
        </div>
      </CardBody>
    </Card>
  );
};

export default DesignationFilters;
