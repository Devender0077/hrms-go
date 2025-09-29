import React from 'react';
import { Input, Select, SelectItem, Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface BranchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  onAddBranch: () => void;
  onExportBranches: () => void;
  isExporting: boolean;
  countries: Array<{ id: string; name: string }>;
  totalCount: number;
  filteredCount: number;
}

const BranchFilters: React.FC<BranchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  onAddBranch,
  onExportBranches,
  isExporting,
  countries,
  totalCount,
  filteredCount,
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Input
            placeholder="Search branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            className="max-w-xs"
            aria-label="Search branches"
          />
          <div className="flex flex-wrap gap-3">
            <Select
              label="Country"
              placeholder="All Countries"
              selectedKeys={[selectedCountry]}
              onSelectionChange={(keys) => setSelectedCountry(Array.from(keys)[0] as string)}
              items={[{ key: 'all', label: 'All Countries' }, ...countries.map(country => ({ key: country.name, label: country.name }))]}
              className="max-w-[180px]"
              aria-label="Filter by Country"
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
              onPress={onAddBranch}
              className="font-medium"
              aria-label="Add Branch"
            >
              Add Branch
            </Button>
            <Button
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              onPress={onExportBranches}
              isLoading={isExporting}
              className="font-medium"
              aria-label="Export Branches"
            >
              Export
            </Button>
          </div>
        </div>
        <div className="mt-4 text-sm text-default-600">
          Showing {filteredCount} of {totalCount} branches
        </div>
      </CardBody>
    </Card>
  );
};

export default BranchFilters;
