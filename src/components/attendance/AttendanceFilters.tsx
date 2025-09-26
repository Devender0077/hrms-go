import React from 'react';
import { Card, CardBody, Input, Select, SelectItem, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface AttendanceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filterDate: string;
  onApplyDateFilter: () => void;
  onClearFilters: () => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedDate,
  setSelectedDate,
  filterDate,
  onApplyDateFilter,
  onClearFilters
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            placeholder="Search attendance records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Icon icon="lucide:search" className="text-gray-400" />}
            className="flex-1"
          />
          
          <Select
            placeholder="Status"
            selectedKeys={selectedStatus ? [selectedStatus] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setSelectedStatus(selected);
            }}
            className="w-full lg:w-48"
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="present">Present</SelectItem>
            <SelectItem key="late">Late</SelectItem>
            <SelectItem key="absent">Absent</SelectItem>
            <SelectItem key="leave">On Leave</SelectItem>
            <SelectItem key="half-day">Half Day</SelectItem>
          </Select>
          
          <Input
            type="date"
            placeholder="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full lg:w-48"
          />
          
          <div className="flex gap-2">
            <Button
              color="primary"
              onPress={onApplyDateFilter}
              startContent={<Icon icon="lucide:filter" />}
            >
              Apply Filter
            </Button>
            <Button
              variant="light"
              onPress={onClearFilters}
              startContent={<Icon icon="lucide:x" />}
            >
              Clear
            </Button>
          </div>
        </div>
        
        {filterDate && (
          <div className="mt-3 flex items-center gap-2">
            <Chip color="primary" variant="flat">
              Filtered by: {new Date(filterDate).toLocaleDateString()}
            </Chip>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={() => setSelectedDate('')}
              aria-label="Remove date filter"
            >
              <Icon icon="lucide:x" />
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AttendanceFilters;
