import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Textarea,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';
import { apiRequest } from '../../services/api-service';

interface Shift {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  working_days: number[] | string;
  is_flexible: boolean;
  grace_period: number;
  late_threshold: number;
  overtime_rate: number;
  is_active: boolean;
  assigned_employees_count?: number;
  created_at: string;
  updated_at: string;
}

const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    break_duration: 60,
    working_days: [1, 2, 3, 4, 5], // Monday to Friday
    is_flexible: false,
    grace_period: 15,
    late_threshold: 30,
    overtime_rate: 1.5,
    is_active: true
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load shifts
  useEffect(() => {
    loadShifts();
  }, [page, selectedStatus]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit: rowsPerPage
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (selectedStatus !== 'all') {
        params.is_active = selectedStatus === 'active';
      }
      
      const response = await apiRequest('/timekeeping/shifts', {
        method: 'GET',
        params
      });
      
      setShifts(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      console.error('Error loading shifts:', err);
      setError('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const url = selectedShift 
        ? `/timekeeping/shifts/${selectedShift.id}`
        : '/timekeeping/shifts';
      
      const method = selectedShift ? 'PUT' : 'POST';
      
      await apiRequest(url, {
        method,
        body: formData
      });
      
      addToast({
        title: 'Success',
        description: selectedShift ? 'Shift updated successfully' : 'Shift created successfully',
        color: 'success'
      });
      
      loadShifts();
      resetForm();
      onAddClose();
      onEditClose();
    } catch (error) {
      console.error('Error saving shift:', error);
      addToast({
        title: 'Error',
        description: 'Failed to save shift',
        color: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (shift: Shift) => {
    if (!confirm(`Are you sure you want to delete "${shift.name}"?\n\nNote: This action will fail if the shift is currently assigned to any employees.`)) {
      return;
    }
    
    try {
      await apiRequest(`/timekeeping/shifts/${shift.id}`, {
        method: 'DELETE'
      });
      
      addToast({
        title: 'Success',
        description: 'Shift deleted successfully',
        color: 'success'
      });
      
      loadShifts();
    } catch (error: any) {
      console.error('Error deleting shift:', error);
      
      // Extract the actual error message from the server response
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete shift';
      
      addToast({
        title: 'Cannot Delete Shift',
        description: errorMessage,
        color: 'danger'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_time: '',
      end_time: '',
      break_duration: 60,
      working_days: [1, 2, 3, 4, 5],
      is_flexible: false,
      grace_period: 15,
      late_threshold: 30,
      overtime_rate: 1.5,
      is_active: true
    });
    setSelectedShift(null);
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    
    // Parse working_days if it's a JSON string
    let workingDays = shift.working_days;
    if (typeof workingDays === 'string') {
      try {
        workingDays = JSON.parse(workingDays);
      } catch (e) {
        console.error('Error parsing working_days in handleEdit:', e);
        workingDays = [1, 2, 3, 4, 5]; // Default to Monday-Friday
      }
    }
    
    setFormData({
      name: shift.name,
      description: shift.description,
      start_time: shift.start_time,
      end_time: shift.end_time,
      break_duration: shift.break_duration,
      working_days: workingDays as number[],
      is_flexible: shift.is_flexible,
      grace_period: shift.grace_period,
      late_threshold: shift.late_threshold,
      overtime_rate: shift.overtime_rate,
      is_active: shift.is_active
    });
    onEditOpen();
  };

  const handleView = (shift: Shift) => {
    setSelectedShift(shift);
    onViewOpen();
  };

  const toggleWorkingDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day]
    }));
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatWorkingDays = (days: number[] | string) => {
    // Handle both array and JSON string formats
    let daysArray: number[];
    if (typeof days === 'string') {
      try {
        daysArray = JSON.parse(days);
      } catch (e) {
        console.error('Error parsing working_days:', e);
        return 'Invalid format';
      }
    } else {
      daysArray = days;
    }
    
    if (!Array.isArray(daysArray)) {
      return 'Invalid format';
    }
    
    return daysArray.map(day => dayNames[day]).join(', ');
  };

  if (loading && shifts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shift Management</h1>
          <p className="text-default-600 mt-2">
            Create and manage work shifts, schedules, and shift assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onAddOpen}
          >
            Add Shift
          </Button>
          <Icon icon="lucide:calendar-days" className="text-4xl text-success-600" />
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search shifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
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
              <SelectItem key="all" value="all">All Status</SelectItem>
              <SelectItem key="active" value="active">Active</SelectItem>
              <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
            </Select>
            <Button
              color="primary"
              variant="flat"
              onPress={loadShifts}
            >
              <Icon icon="lucide:refresh-cw" />
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Shifts Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:table" className="text-success-600 text-xl" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Shifts</h3>
              <p className="text-default-500 text-sm">
                {shifts.length} shifts found
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <Table aria-label="Shifts table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>TIME</TableColumn>
              <TableColumn>WORKING DAYS</TableColumn>
              <TableColumn>BREAK</TableColumn>
              <TableColumn>FLEXIBLE</TableColumn>
              <TableColumn>ASSIGNED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No shifts found">
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{shift.name}</p>
                      <p className="text-sm text-default-500">{shift.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:clock" className="text-default-400 text-sm" />
                      <span className="text-sm">
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:calendar" className="text-default-400 text-sm" />
                      <span className="text-sm">{formatWorkingDays(shift.working_days)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{shift.break_duration} min</span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={shift.is_flexible ? "success" : "default"}
                      variant="flat"
                      size="sm"
                    >
                      {shift.is_flexible ? 'Yes' : 'No'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:users" className="text-default-400 text-sm" />
                      <span className="text-sm font-medium">
                        {shift.assigned_employees_count || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={shift.is_active ? "success" : "danger"}
                      variant="flat"
                      size="sm"
                    >
                      {shift.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label="More actions">
                          <Icon icon="lucide:more-horizontal" className="text-default-400" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="view"
                          startContent={<Icon icon="lucide:eye" />}
                          onPress={() => handleView(shift)}
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEdit(shift)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<Icon icon="lucide:trash" />}
                          className="text-danger"
                          color="danger"
                          onPress={() => handleDelete(shift)}
                          isDisabled={shift.assigned_employees_count && shift.assigned_employees_count > 0}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-600">Rows per page:</span>
              <Select
                size="sm"
                className="w-20"
                selectedKeys={[rowsPerPage.toString()]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setRowsPerPage(parseInt(selected));
                }}
              >
                <SelectItem key="10" value="10">10</SelectItem>
                <SelectItem key="25" value="25">25</SelectItem>
                <SelectItem key="50" value="50">50</SelectItem>
              </Select>
            </div>
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              showControls
            />
          </div>
        </CardBody>
      </Card>

      {/* Add/Edit Shift Modal */}
      <Modal isOpen={isAddOpen || isEditOpen} onClose={() => { onAddClose(); onEditClose(); resetForm(); }} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">
                  {selectedShift ? 'Edit Shift' : 'Add New Shift'}
                </h3>
              </ModalHeader>
              <form onSubmit={handleSubmit}>
                <ModalBody>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Shift Name"
                        placeholder="Enter shift name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        isRequired
                      />
                      <Input
                        label="Break Duration (minutes)"
                        type="number"
                        placeholder="60"
                        value={formData.break_duration.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, break_duration: parseInt(e.target.value) || 0 }))}
                        isRequired
                      />
                    </div>

                    <Textarea
                      label="Description"
                      placeholder="Enter shift description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start Time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        isRequired
                      />
                      <Input
                        label="End Time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                        isRequired
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Grace Period (minutes)"
                        type="number"
                        placeholder="15"
                        value={formData.grace_period.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, grace_period: parseInt(e.target.value) || 0 }))}
                      />
                      <Input
                        label="Late Threshold (minutes)"
                        type="number"
                        placeholder="30"
                        value={formData.late_threshold.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, late_threshold: parseInt(e.target.value) || 0 }))}
                      />
                      <Input
                        label="Overtime Rate"
                        type="number"
                        step="0.1"
                        placeholder="1.5"
                        value={formData.overtime_rate.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, overtime_rate: parseFloat(e.target.value) || 1.5 }))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-default-700 mb-2 block">Working Days</label>
                      <div className="grid grid-cols-7 gap-2">
                        {dayNames.map((day, index) => (
                          <Checkbox
                            key={index}
                            isSelected={formData.working_days.includes(index)}
                            onValueChange={() => toggleWorkingDay(index)}
                          >
                            {day.slice(0, 3)}
                          </Checkbox>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox
                        isSelected={formData.is_flexible}
                        onValueChange={(checked) => setFormData(prev => ({ ...prev, is_flexible: checked }))}
                      >
                        Flexible Hours
                      </Checkbox>
                      <Checkbox
                        isSelected={formData.is_active}
                        onValueChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      >
                        Active
                      </Checkbox>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" type="submit" isLoading={isSubmitting}>
                    {selectedShift ? 'Update' : 'Create'} Shift
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Shift Details</h3>
                <p className="text-sm text-default-600">{selectedShift?.name}</p>
              </ModalHeader>
              <ModalBody>
                {selectedShift && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Name</label>
                        <p className="text-sm text-foreground">{selectedShift.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Status</label>
                        <Chip 
                          color={selectedShift.is_active ? "success" : "danger"}
                          variant="flat"
                          size="sm"
                        >
                          {selectedShift.is_active ? 'Active' : 'Inactive'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Time</label>
                        <p className="text-sm text-foreground">
                          {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Break Duration</label>
                        <p className="text-sm text-foreground">{selectedShift.break_duration} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Working Days</label>
                        <p className="text-sm text-foreground">{formatWorkingDays(selectedShift.working_days)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Flexible Hours</label>
                        <Chip 
                          color={selectedShift.is_flexible ? "success" : "default"}
                          variant="flat"
                          size="sm"
                        >
                          {selectedShift.is_flexible ? 'Yes' : 'No'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Grace Period</label>
                        <p className="text-sm text-foreground">{selectedShift.grace_period} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Late Threshold</label>
                        <p className="text-sm text-foreground">{selectedShift.late_threshold} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Overtime Rate</label>
                        <p className="text-sm text-foreground">{selectedShift.overtime_rate}x</p>
                      </div>
                    </div>
                    {selectedShift.description && (
                      <div>
                        <label className="text-sm font-medium text-default-700">Description</label>
                        <p className="text-sm text-foreground">{selectedShift.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ShiftsPage;
