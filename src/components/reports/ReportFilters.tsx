import React from "react";
import { Card, CardBody, Input, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";

interface FilterOption {
  key: string;
  label: string;
}

interface ReportFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  filterLabel: string;
  additionalFilters?: React.ReactNode;
}

export default function ReportFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filterOptions,
  filterLabel,
  additionalFilters
}: ReportFiltersProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
          />
          <Select
            label={filterLabel}
            placeholder={`All ${filterLabel}`}
            selectedKeys={[selectedFilter]}
            onSelectionChange={(keys) => onFilterChange(Array.from(keys)[0] as string)}
            items={filterOptions}
          >
            {(item) => (
              <SelectItem key={item.key}>
                {item.label}
              </SelectItem>
            )}
          </Select>
          {additionalFilters}
        </div>
      </CardBody>
    </Card>
  );
}
