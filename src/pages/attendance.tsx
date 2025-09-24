import React, { useState, useMemo, useEffect } from "react";
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
      Avatar,
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
  Badge,
  Divider,
      DatePicker,
  Textarea,
  Spinner
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { attendanceAPI } from "../services/api-service";
import { useAuth } from "../contexts/auth-context";

// Enhanced attendance interface with IP addresses and detailed clock-in/out data
interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: "present" | "late" | "absent" | "leave" | "half-day";
  work_hours: string;
  overtime: string;
  avatar: string;
  department: string;
  designation: string;
  note?: string;
  location_latitude?: number;
  location_longitude?: number;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<AttendanceRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const rowsPerPage = 10;
    
    const statusColorMap = {
      present: "success",
      late: "warning",
      absent: "danger",
    leave: "default",
    "half-day": "secondary",
  };

  // Load attendance records from database
  useEffect(() => {
    loadAttendanceRecords();
  }, [page, selectedStatus, selectedDate]);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit: rowsPerPage
      };
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (selectedDate) {
        params.from_date = selectedDate;
        params.to_date = selectedDate;
      }
      
      const response = await attendanceAPI.getAll(params);
      setAttendanceRecords(response.data || []);
    } catch (err) {
      console.error('Error loading attendance records:', err);
      setError('Failed to load attendance records');
      addToast({
        title: "Error",
        description: "Failed to load attendance records",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance records
  const filteredRecords = useMemo(() => {
        return attendanceRecords.filter(record => {
          const matchesSearch = 
        record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [attendanceRecords, searchQuery]);

  const handleCheckIn = async () => {
    try {
      // Get current location
      const position = await getCurrentLocation();
      
      const checkInData = {
        note: "Checked in via web app",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      await attendanceAPI.checkIn(checkInData);
      addToast({
        title: "Success",
        description: "Checked in successfully",
        color: "success"
      });
      loadAttendanceRecords(); // Reload records
    } catch (err) {
      console.error('Error checking in:', err);
        addToast({
        title: "Error",
        description: "Failed to check in",
        color: "danger"
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      // Get current location
      const position = await getCurrentLocation();
      
      const checkOutData = {
        note: "Checked out via web app",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      await attendanceAPI.checkOut(checkOutData);
      addToast({
        title: "Success",
        description: "Checked out successfully",
        color: "success"
      });
      loadAttendanceRecords(); // Reload records
    } catch (err) {
      console.error('Error checking out:', err);
      addToast({
        title: "Error",
        description: "Failed to check out",
        color: "danger"
      });
    }
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      // Generate CSV content
      const headers = [
        'Employee ID', 'Employee Name', 'Date', 'Check In', 'Check Out', 
        'Status', 'Work Hours', 'Overtime', 'Department', 'Designation'
      ];
      
      const csvContent = [
        headers.join(','),
        ...filteredRecords.map(record => [
          record.employee_id,
          record.employee_name,
          record.date,
          record.check_in || '',
          record.check_out || '',
          record.status,
          record.work_hours,
          record.overtime,
          record.department,
          record.designation
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast({
        title: "Success",
        description: "Attendance records exported successfully",
        color: "success"
      });
    } catch (err) {
      console.error('Error exporting attendance:', err);
      addToast({
        title: "Error",
        description: "Failed to export attendance records",
        color: "danger"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Attendance</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button color="primary" onPress={loadAttendanceRecords}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
      
      return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Icon icon="lucide:clock" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-600 mt-1">Track employee attendance and working hours</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="default" 
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              isLoading={isExporting}
            >
              Export CSV
              </Button>
            <Button 
              color="success" 
              variant="flat"
              startContent={<Icon icon="lucide:log-in" />}
              onPress={handleCheckIn}
            >
              Check In
              </Button>
            <Button 
              color="warning" 
              variant="flat"
              startContent={<Icon icon="lucide:log-out" />}
              onPress={handleCheckOut}
            >
              Check Out
              </Button>
            </div>
          </div>
          
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceRecords.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icon icon="lucide:clock" className="text-blue-600 text-xl" />
                </div>
                </div>
              </CardBody>
            </Card>
            
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceRecords.filter(record => record.status === 'present').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Icon icon="lucide:user-check" className="text-green-600 text-xl" />
                </div>
                </div>
              </CardBody>
            </Card>
            
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Late Today</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {attendanceRecords.filter(record => record.status === 'late').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Icon icon="lucide:clock-3" className="text-yellow-600 text-xl" />
                </div>
                </div>
              </CardBody>
            </Card>
            
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent Today</p>
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceRecords.filter(record => record.status === 'absent').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Icon icon="lucide:user-x" className="text-red-600 text-xl" />
                </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <Input
                placeholder="Search employees..."
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
                <SelectItem key="all" value="all">All Status</SelectItem>
                <SelectItem key="present" value="present">Present</SelectItem>
                <SelectItem key="late" value="late">Late</SelectItem>
                <SelectItem key="absent" value="absent">Absent</SelectItem>
                <SelectItem key="leave" value="leave">On Leave</SelectItem>
                <SelectItem key="half-day" value="half-day">Half Day</SelectItem>
              </Select>
                <Input
                type="date"
                placeholder="Select Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full lg:w-48"
                />
              </div>
          </CardBody>
        </Card>

        {/* Attendance Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-green-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                <p className="text-gray-500 text-sm">
                  {filteredRecords.length} of {attendanceRecords.length} records
                </p>
              </div>
              </div>
            </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Attendance table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>CHECK IN</TableColumn>
                  <TableColumn>CHECK OUT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                  <TableColumn>WORK HOURS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No attendance records found">
                {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar
                          src={record.avatar}
                          name={record.employee_name}
                          size="sm"
                        />
                          <div>
                          <p className="font-medium text-gray-900">{record.employee_name}</p>
                          <p className="text-sm text-gray-500">{record.employee_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:calendar" className="text-gray-400 text-sm" />
                        <span className="text-sm">{record.date}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.check_in ? (
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:log-in" className="text-green-500 text-sm" />
                          <span className="text-sm">{record.check_in}</span>
                          </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.check_out ? (
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:log-out" className="text-red-500 text-sm" />
                          <span className="text-sm">{record.check_out}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                        color={statusColorMap[record.status] as any}
                        variant="flat"
                          size="sm" 
                        >
                          {record.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:clock" className="text-gray-400 text-sm" />
                        <span className="text-sm">{record.work_hours || '0h'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:more-horizontal" className="text-gray-400" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => {
                              setSelectedEmployee(record);
                              onViewOpen();
                            }}
                          >
                            View Details
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

        {/* View Details Modal */}
        <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:eye" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Attendance Details</h3>
                      <p className="text-sm text-gray-500">View detailed attendance information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedEmployee && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Employee</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.employee_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Employee ID</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.employee_id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.date}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Chip
                            color={statusColorMap[selectedEmployee.status] as any}
                            variant="flat"
                            size="sm"
                          >
                            {selectedEmployee.status}
                          </Chip>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check In</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.check_in || 'Not checked in'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check Out</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.check_out || 'Not checked out'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Work Hours</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.work_hours || '0h'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Department</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.department}</p>
                        </div>
                      </div>
                      {selectedEmployee.note && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Notes</p>
                          <p className="text-sm text-gray-900">{selectedEmployee.note}</p>
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
      );
    }