import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Divider,
  DatePicker
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { apiRequest } from "../../services/api-service";

interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_id_code: string;
  department: string;
  designation_name: string;
  shift_name: string;
  date: string;
  check_in: string;
  check_out: string;
  status: 'present' | 'late' | 'absent' | 'leave' | 'half-day';
  work_hours: number;
  overtime_hours: number;
  total_hours: number;
  note: string;
  location_latitude: number;
  location_longitude: number;
  ip_address: string;
  attendance_id: string;
  check_in_location: string;
  check_in_ip: string;
  check_in_device: string;
  check_out_location: string;
  check_out_ip: string;
  check_out_device: string;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface Department {
  id: number;
  name: string;
}

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Modal states
  const { isOpen: isViewModalOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    status: 'present' as 'present' | 'late' | 'absent' | 'leave' | 'half-day',
    work_hours: 0,
    overtime_hours: 0,
    note: ''
  });

  useEffect(() => {
    loadRecords();
    loadEmployees();
    loadDepartments();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/timekeeping/attendance-records');
      setRecords(response.data || []);
    } catch (error) {
      console.error('Error loading records:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load attendance records',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiRequest('/employees');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiRequest('/organization/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employee_id_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEmployee = selectedEmployee === 'all' || record.employee_id.toString() === selectedEmployee;
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
      
      let matchesDate = true;
      if (selectedDate) {
        matchesDate = record.date === selectedDate;
      } else if (fromDate && toDate) {
        matchesDate = record.date >= fromDate && record.date <= toDate;
      }
      
      return matchesSearch && matchesEmployee && matchesDepartment && matchesStatus && matchesDate;
    });
  }, [records, searchQuery, selectedEmployee, selectedDepartment, selectedStatus, selectedDate, fromDate, toDate]);

  const handleEditRecord = async () => {
    if (!editingRecord) return;

    try {
      await apiRequest(`/attendance/${editingRecord.id}`, {
        method: 'PUT',
        body: formData
      });

      addToast({
        title: 'Success',
        description: 'Attendance record updated successfully',
        color: 'success'
      });

      loadRecords();
      onEditClose();
    } catch (error) {
      console.error('Error updating record:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update attendance record',
        color: 'danger'
      });
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      await apiRequest(`/attendance/${recordId}`, {
        method: 'DELETE'
      });

      addToast({
        title: 'Success',
        description: 'Attendance record deleted successfully',
        color: 'success'
      });

      loadRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete attendance record',
        color: 'danger'
      });
    }
  };

  const openEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData({
      check_in: record.check_in ? new Date(record.check_in).toISOString().slice(0, 16) : '',
      check_out: record.check_out ? new Date(record.check_out).toISOString().slice(0, 16) : '',
      status: record.status,
      work_hours: record.work_hours || 0,
      overtime_hours: record.overtime_hours || 0,
      note: record.note || ''
    });
    onEditOpen();
  };

  const openViewModal = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    onViewOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'danger';
      case 'leave': return 'secondary';
      case 'half-day': return 'primary';
      default: return 'default';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    const csvData = filteredRecords.map(record => ({
      'Employee Name': record.employee_name,
      'Employee ID': record.employee_id_code,
      'Department': record.department,
      'Designation': record.designation_name,
      'Shift': record.shift_name,
      'Date': formatDate(record.date),
      'Check In': formatTime(record.check_in),
      'Check Out': formatTime(record.check_out),
      'Status': record.status,
      'Work Hours': record.work_hours,
      'Overtime Hours': record.overtime_hours,
      'Total Hours': record.total_hours,
      'Note': record.note
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && records.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground">Attendance Records</h1>
          <p className="text-default-600 mt-2">
            View and manage detailed attendance records for all employees
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="secondary"
            startContent={<Icon icon="lucide:download" />}
            onPress={exportToCSV}
          >
            Export CSV
          </Button>
          <Icon icon="lucide:file-text" className="text-4xl text-primary-600" />
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <Input
              placeholder="Search employees..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
            />
            <Select
              placeholder="Employee"
              selectedKeys={selectedEmployee ? [selectedEmployee] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedEmployee(selected);
              }}
            >
              <SelectItem key="all">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id.toString()} >
                  {emp.first_name} {emp.last_name} ({emp.employee_id})
                </SelectItem>
              )) as any}
            </Select>
            <Select
              placeholder="Department"
              selectedKeys={selectedDepartment ? [selectedDepartment] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedDepartment(selected);
              }}
            >
              <SelectItem key="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.name} >
                  {dept.name}
                </SelectItem>
              )) as any}
            </Select>
            <Select
              placeholder="Status"
              selectedKeys={selectedStatus ? [selectedStatus] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedStatus(selected);
              }}
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="present">Present</SelectItem>
              <SelectItem key="late">Late</SelectItem>
              <SelectItem key="absent">Absent</SelectItem>
              <SelectItem key="leave">Leave</SelectItem>
              <SelectItem key="half-day">Half Day</SelectItem>
            </Select>
            <Input
              type="date"
              placeholder="Specific Date"
              
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From Date"
                
                onChange={(e) => setFromDate(e.target.value)}
                label="From"
              />
              <Input
                type="date"
                placeholder="To Date"
                
                onChange={(e) => setToDate(e.target.value)}
                label="To"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Records Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:table" className="text-success-600 text-xl" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Attendance Records</h3>
              <p className="text-default-500 text-sm">
                {filteredRecords.length} of {records.length} records
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <Table aria-label="Attendance records table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>CHECK IN/OUT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>HOURS</TableColumn>
              <TableColumn>LOCATION</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No attendance records found">
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{record.employee_name}</p>
                      <p className="text-sm text-default-500">{record.employee_id_code}</p>
                      <p className="text-xs text-default-400">{record.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{formatDate(record.date)}</p>
                      {record.shift_name && (
                        <p className="text-xs text-default-500">{record.shift_name}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:log-in" className="text-success-600 text-xs" />
                        <span>{formatTime(record.check_in)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:log-out" className="text-danger-600 text-xs" />
                        <span>{formatTime(record.check_out)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(record.status) as any}
                      variant="flat"
                      size="sm"
                    >
                      {record.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Work: {record.work_hours || 0}h</div>
                      {record.overtime_hours > 0 && (
                        <div className="text-warning-600">OT: {record.overtime_hours}h</div>
                      )}
                      <div className="font-medium">Total: {record.total_hours || 0}h</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {record.check_in_location && (
                        <div className="flex items-center gap-1">
                          <Icon icon="lucide:map-pin" className="text-default-400 text-xs" />
                          <span className="text-xs text-default-600">In: {record.check_in_location}</span>
                        </div>
                      )}
                      {record.check_out_location && (
                        <div className="flex items-center gap-1">
                          <Icon icon="lucide:map-pin" className="text-default-400 text-xs" />
                          <span className="text-xs text-default-600">Out: {record.check_out_location}</span>
                        </div>
                      )}
                      {!record.check_in_location && !record.check_out_location && (
                        <span className="text-xs text-default-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label="Record actions">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="view"
                          startContent={<Icon icon="lucide:eye" />}
                          onPress={() => openViewModal(record)}
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => openEditModal(record)}
                        >
                          Edit Record
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<Icon icon="lucide:trash" />}
                          className="text-danger"
                          color="danger"
                          onPress={() => handleDeleteRecord(record.id)}
                        >
                          Delete Record
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* View Record Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Attendance Record Details
              </ModalHeader>
              <ModalBody>
                {selectedRecord && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Employee</label>
                        <p className="text-sm text-foreground">{selectedRecord.employee_name}</p>
                        <p className="text-xs text-default-500">{selectedRecord.employee_id_code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Date</label>
                        <p className="text-sm text-foreground">{formatDate(selectedRecord.date)}</p>
                      </div>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Check In</label>
                        <p className="text-sm text-foreground">{formatTime(selectedRecord.check_in)}</p>
                        {selectedRecord.check_in_location && (
                          <p className="text-xs text-default-500">{selectedRecord.check_in_location}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Check Out</label>
                        <p className="text-sm text-foreground">{formatTime(selectedRecord.check_out)}</p>
                        {selectedRecord.check_out_location && (
                          <p className="text-xs text-default-500">{selectedRecord.check_out_location}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Status</label>
                        <Chip 
                          color={getStatusColor(selectedRecord.status) as any}
                          variant="flat"
                          size="sm"
                        >
                          {selectedRecord.status}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Work Hours</label>
                        <p className="text-sm text-foreground">{selectedRecord.work_hours || 0} hours</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Overtime Hours</label>
                        <p className="text-sm text-foreground">{selectedRecord.overtime_hours || 0} hours</p>
                      </div>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Department</label>
                        <p className="text-sm text-foreground">{selectedRecord.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Designation</label>
                        <p className="text-sm text-foreground">{selectedRecord.designation_name}</p>
                      </div>
                    </div>

                    {selectedRecord.note && (
                      <div>
                        <label className="text-sm font-medium text-default-700">Note</label>
                        <p className="text-sm text-foreground">{selectedRecord.note}</p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Record Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Attendance Record
              </ModalHeader>
              <ModalBody>
                {editingRecord && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Employee</label>
                        <p className="text-sm text-foreground">{editingRecord.employee_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Date</label>
                        <p className="text-sm text-foreground">{formatDate(editingRecord.date)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Check In</label>
                        <Input
                          type="datetime-local"
                          
                          onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                          size="sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Check Out</label>
                        <Input
                          type="datetime-local"
                          
                          onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Status</label>
                        <Select
                          selectedKeys={[formData.status]}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;
                            setFormData({...formData, status: selected as any});
                          }}
                          size="sm"
                        >
                          <SelectItem key="present">Present</SelectItem>
                          <SelectItem key="late">Late</SelectItem>
                          <SelectItem key="absent">Absent</SelectItem>
                          <SelectItem key="leave">Leave</SelectItem>
                          <SelectItem key="half-day">Half Day</SelectItem>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Work Hours</label>
                        <Input
                          type="number"
                          step="0.1"
                          
                          onChange={(e) => setFormData({...formData, work_hours: parseFloat(e.target.value) || 0})}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-default-700">Note</label>
                      <Input
                        
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                        placeholder="Add notes..."
                        size="sm"
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleEditRecord}>
                  Update Record
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RecordsPage;
