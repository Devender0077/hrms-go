import React, { useState, useMemo } from "react";
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
  Textarea
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

// Enhanced attendance interface with IP addresses and detailed clock-in/out data
interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: {
    time: string;
    ipAddress: string;
    location: string;
    device: string;
    status: "on-time" | "late";
    coordinates?: { lat: number; lng: number };
  } | null;
  checkOut: {
    time: string;
    ipAddress: string;
    location: string;
    device: string;
    coordinates?: { lat: number; lng: number };
  } | null;
  status: "present" | "late" | "absent" | "leave" | "half-day";
  workHours: string;
  overtime: string;
  avatar: string;
  department: string;
  designation: string;
  notes?: string;
}

// Enhanced sample attendance data with IP addresses and detailed information
const attendanceRecords: AttendanceRecord[] = [
      { 
        id: 1, 
        employeeId: "EMP001", 
        employeeName: "Tony Reichert", 
    date: "2025-01-15", 
    checkIn: {
      time: "09:00 AM",
      ipAddress: "192.168.1.105",
      location: "Office Building A, Floor 3",
      device: "Windows PC - Chrome Browser",
      status: "on-time",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    checkOut: {
      time: "06:00 PM",
      ipAddress: "192.168.1.105",
      location: "Office Building A, Floor 3",
      device: "Windows PC - Chrome Browser",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
        status: "present",
        workHours: "9h 0m",
    overtime: "0h 0m",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    department: "Executive",
    designation: "CEO"
      },
      { 
        id: 2, 
        employeeId: "EMP002", 
        employeeName: "Zoey Lang", 
    date: "2025-01-15", 
    checkIn: {
      time: "09:15 AM",
      ipAddress: "192.168.1.112",
      location: "Office Building B, Floor 2",
      device: "MacBook Pro - Safari Browser",
      status: "late",
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    checkOut: {
      time: "06:30 PM",
      ipAddress: "192.168.1.112",
      location: "Office Building B, Floor 2",
      device: "MacBook Pro - Safari Browser",
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    status: "late",
        workHours: "9h 15m",
    overtime: "0h 15m",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    department: "IT",
    designation: "Tech Lead"
      },
      { 
        id: 3, 
        employeeId: "EMP003", 
        employeeName: "Jane Doe", 
    date: "2025-01-15", 
    checkIn: {
      time: "08:45 AM",
      ipAddress: "192.168.1.98",
      location: "Office Building A, Floor 1",
      device: "iPhone 14 - Mobile App",
      status: "on-time",
      coordinates: { lat: 40.7505, lng: -73.9934 }
    },
    checkOut: {
      time: "05:45 PM",
      ipAddress: "192.168.1.98",
      location: "Office Building A, Floor 1",
      device: "iPhone 14 - Mobile App",
      coordinates: { lat: 40.7505, lng: -73.9934 }
    },
        status: "present",
        workHours: "9h 0m",
    overtime: "0h 0m",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    department: "Marketing",
    designation: "Designer"
      },
      { 
        id: 4, 
        employeeId: "EMP004", 
        employeeName: "William Smith", 
    date: "2025-01-15", 
    checkIn: {
      time: "09:30 AM",
      ipAddress: "192.168.1.87",
      location: "Office Building C, Floor 4",
      device: "Android Phone - Mobile App",
      status: "late",
      coordinates: { lat: 40.7614, lng: -73.9776 }
    },
    checkOut: {
      time: "07:00 PM",
      ipAddress: "192.168.1.87",
      location: "Office Building C, Floor 4",
      device: "Android Phone - Mobile App",
      coordinates: { lat: 40.7614, lng: -73.9776 }
    },
        status: "late",
    workHours: "9h 30m",
    overtime: "1h 30m",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
    department: "Finance",
    designation: "Accountant"
      },
      { 
        id: 5, 
        employeeId: "EMP005", 
    employeeName: "Sarah Johnson", 
    date: "2025-01-15", 
    checkIn: null,
    checkOut: null,
        status: "absent",
        workHours: "0h 0m",
    overtime: "0h 0m",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
    department: "HR",
    designation: "HR Manager"
  }
    ];
    
    const statusColorMap = {
      present: "success",
      late: "warning",
      absent: "danger",
      leave: "primary",
  "half-day": "secondary",
    };
    
    export default function Attendance() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2025-01-15");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceList, setAttendanceList] = useState(attendanceRecords);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const rowsPerPage = 10;
  
  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return attendanceList.filter(record => {
          const matchesSearch = 
            record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = record.date === selectedDate;
      const matchesStatus = selectedStatus === "all" || record.status === selectedStatus;
      
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [attendanceList, searchQuery, selectedDate, selectedStatus]);
  
  // Paginate filtered records
  const paginatedRecords = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, page]);
  
  // Get unique departments
  const departments = useMemo(() => {
    return Array.from(new Set(attendanceList.map(record => record.department)));
  }, [attendanceList]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = attendanceList.length;
    const present = attendanceList.filter(r => r.status === "present").length;
    const late = attendanceList.filter(r => r.status === "late").length;
    const absent = attendanceList.filter(r => r.status === "absent").length;
    const onLeave = attendanceList.filter(r => r.status === "leave").length;
    
    return { total, present, late, absent, onLeave };
  }, [attendanceList]);
  
  // Handle row actions
  const handleRowAction = (actionKey: string, record: AttendanceRecord) => {
    switch (actionKey) {
      case "view":
        setSelectedRecord(record);
        onOpen();
        break;
      case "edit":
        setEditingRecord(record);
        onEditOpen();
        break;
      case "approve":
        handleApproveAttendance(record);
        break;
      case "reject":
        handleRejectAttendance(record);
        break;
      default:
        break;
    }
  };

  // Handle approve attendance
  const handleApproveAttendance = (record: AttendanceRecord) => {
    setAttendanceList(prev => 
      prev.map(att => 
        att.id === record.id 
          ? { ...att, status: "present" as const }
          : att
      )
    );
    addToast({
      title: "Attendance Approved",
      description: `Attendance for ${record.employeeName} has been approved.`,
      color: "success",
    });
  };

  // Handle reject attendance
  const handleRejectAttendance = (record: AttendanceRecord) => {
    setAttendanceList(prev => 
      prev.map(att => 
        att.id === record.id 
          ? { ...att, status: "absent" as const }
          : att
      )
    );
    addToast({
      title: "Attendance Rejected",
      description: `Attendance for ${record.employeeName} has been rejected.`,
      color: "danger",
    });
  };

  // Handle edit attendance
  const handleEditAttendance = (updatedRecord: AttendanceRecord) => {
    setAttendanceList(prev => 
      prev.map(att => 
        att.id === updatedRecord.id ? updatedRecord : att
      )
    );
    setEditingRecord(null);
    onEditOpenChange();
        addToast({
      title: "Attendance Updated",
      description: `Attendance for ${updatedRecord.employeeName} has been updated.`,
          color: "success",
        });
      };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredRecords);
      downloadFile(csvContent, `attendance-report-${selectedDate}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Attendance report has been exported to CSV.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export attendance report.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdfContent = generatePDF(filteredRecords);
      downloadFile(pdfContent, `attendance-report-${selectedDate}.pdf`, 'application/pdf');
      addToast({
        title: "Export Successful",
        description: "Attendance report has been exported to PDF.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export attendance report.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      addToast({
        title: "Report Generated",
        description: "Attendance report has been generated successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Report Generation Failed",
        description: "Failed to generate attendance report.",
        color: "danger",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Generate CSV content
  const generateCSV = (records: AttendanceRecord[]) => {
    const headers = [
      'Employee ID', 'Employee Name', 'Department', 'Designation', 'Date',
      'Check In Time', 'Check In IP', 'Check In Location', 'Check In Device',
      'Check Out Time', 'Check Out IP', 'Check Out Location', 'Check Out Device',
      'Status', 'Work Hours', 'Overtime'
    ];
    
    const rows = records.map(record => [
      record.employeeId,
      record.employeeName,
      record.department,
      record.designation,
      record.date,
      record.checkIn?.time || 'N/A',
      record.checkIn?.ipAddress || 'N/A',
      record.checkIn?.location || 'N/A',
      record.checkIn?.device || 'N/A',
      record.checkOut?.time || 'N/A',
      record.checkOut?.ipAddress || 'N/A',
      record.checkOut?.location || 'N/A',
      record.checkOut?.device || 'N/A',
      record.status,
      record.workHours,
      record.overtime
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Generate PDF content (simplified)
  const generatePDF = (records: AttendanceRecord[]) => {
    // In a real application, you would use a library like jsPDF or html2pdf
    // For now, we'll create a simple HTML content that can be converted to PDF
    const htmlContent = `
      <html>
        <head>
          <title>Attendance Report - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance Report</h1>
            <p>Date: ${selectedDate}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Work Hours</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(record => `
                <tr>
                  <td>${record.employeeId}</td>
                  <td>${record.employeeName}</td>
                  <td>${record.department}</td>
                  <td>${record.checkIn?.time || 'N/A'}</td>
                  <td>${record.checkOut?.time || 'N/A'}</td>
                  <td>${record.status}</td>
                  <td>${record.workHours}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    return htmlContent;
  };

  // Download file utility
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
      
      return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Icon icon="lucide:clock" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-600 mt-1">Track employee attendance and clock-in/out details</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  color="primary" 
                  variant="flat"
                  startContent={<Icon icon="lucide:download" />}
                  isLoading={isExporting}
                  className="font-medium"
                >
                  Export Report
              </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="csv"
                  startContent={<Icon icon="lucide:file-text" />}
                  onPress={handleExportCSV}
                >
                  Export as CSV
                </DropdownItem>
                <DropdownItem
                  key="pdf"
                  startContent={<Icon icon="lucide:file-pdf" />}
                  onPress={handleExportPDF}
                >
                  Export as PDF
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:bar-chart" />}
              onPress={handleGenerateReport}
              isLoading={isGeneratingReport}
              className="font-medium"
            >
              Generate Report
              </Button>
            </div>
          </div>
          
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon icon="lucide:users" className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-default-500">Total Employees</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Icon icon="lucide:user-check" className="text-2xl text-success" />
                </div>
                <div>
                  <p className="text-default-500">Present</p>
                  <h3 className="text-2xl font-bold">{stats.present}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
            
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Icon icon="lucide:clock" className="text-2xl text-warning" />
                </div>
                <div>
                  <p className="text-default-500">Late</p>
                  <h3 className="text-2xl font-bold">{stats.late}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
            
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-danger/10">
                  <Icon icon="lucide:user-x" className="text-2xl text-danger" />
                </div>
                <div>
                  <p className="text-default-500">Absent</p>
                  <h3 className="text-2xl font-bold">{stats.absent}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
            
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Icon icon="lucide:calendar-off" className="text-2xl text-secondary" />
                </div>
                <div>
                  <p className="text-default-500">On Leave</p>
                  <h3 className="text-2xl font-bold">{stats.onLeave}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          </div>
          
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
                />
                <Input
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Select
                label="Status"
                placeholder="All Status"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                items={[
                  { key: "all", label: "All Status" },
                  { key: "present", label: "Present" },
                  { key: "late", label: "Late" },
                  { key: "absent", label: "Absent" },
                  { key: "leave", label: "On Leave" },
                  { key: "half-day", label: "Half Day" }
                ]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredRecords.length} of {attendanceList.length} records
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Attendance Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-blue-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                <p className="text-gray-500 text-sm">Click on actions to view, edit, approve, or reject attendance</p>
              </div>
              </div>
            </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Attendance table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>CHECK IN</TableColumn>
                  <TableColumn>CHECK OUT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                <TableColumn>HOURS</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar src={record.avatar} alt={record.employeeName} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{record.employeeName}</p>
                          <p className="text-sm text-gray-500">{record.employeeId}</p>
                          <p className="text-xs text-gray-400">{record.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.checkIn ? (
                          <div>
                          <p className="font-medium text-gray-900">{record.checkIn.time}</p>
                          <p className="text-xs text-gray-500">{record.checkIn.device}</p>
                          <p className="text-xs text-gray-400">{record.checkIn.ipAddress}</p>
                          </div>
                      ) : (
                        <span className="text-gray-400">No check-in</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? (
                        <div>
                          <p className="font-medium text-gray-900">{record.checkOut.time}</p>
                          <p className="text-xs text-gray-500">{record.checkOut.device}</p>
                          <p className="text-xs text-gray-400">{record.checkOut.ipAddress}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">No check-out</span>
                      )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                        color={statusColorMap[record.status] as any}
                          variant="flat"
                        >
                          {record.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{record.workHours}</p>
                        {record.overtime !== "0h 0m" && (
                          <p className="text-xs text-orange-600">+{record.overtime} OT</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.checkIn?.location && (
                        <div className="flex items-center gap-1">
                          <Icon icon="lucide:map-pin" className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate max-w-[120px]">
                            {record.checkIn.location}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => handleRowAction("view", record)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleRowAction("edit", record)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="approve"
                            startContent={<Icon icon="lucide:check" />}
                            onPress={() => handleRowAction("approve", record)}
                          >
                            Approve
                          </DropdownItem>
                          <DropdownItem
                            key="reject"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:x" />}
                            onPress={() => handleRowAction("reject", record)}
                          >
                            Reject
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            
            {filteredRecords.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredRecords.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
            </CardBody>
          </Card>

        {/* View Details Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:eye" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Attendance Details</h3>
                      <p className="text-sm text-gray-500">Complete attendance information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedRecord && (
                    <div className="space-y-6">
                      {/* Employee Info */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar src={selectedRecord.avatar} alt={selectedRecord.employeeName} size="lg" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{selectedRecord.employeeName}</h4>
                          <p className="text-gray-600">{selectedRecord.employeeId}</p>
                          <p className="text-sm text-gray-500">{selectedRecord.department} • {selectedRecord.designation}</p>
                        </div>
                      </div>

                      {/* Check In Details */}
                      {selectedRecord.checkIn && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Icon icon="lucide:log-in" className="w-4 h-4 text-green-600" />
                            Check In Details
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <p className="font-medium">{selectedRecord.checkIn.time}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <Chip size="sm" color={selectedRecord.checkIn.status === "on-time" ? "success" : "warning"} variant="flat">
                                {selectedRecord.checkIn.status}
                              </Chip>
                            </div>
                            <div>
                              <span className="text-gray-500">IP Address:</span>
                              <p className="font-mono text-xs">{selectedRecord.checkIn.ipAddress}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Device:</span>
                              <p className="text-xs">{selectedRecord.checkIn.device}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Location:</span>
                              <p className="text-xs">{selectedRecord.checkIn.location}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Check Out Details */}
                      {selectedRecord.checkOut && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Icon icon="lucide:log-out" className="w-4 h-4 text-red-600" />
                            Check Out Details
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <p className="font-medium">{selectedRecord.checkOut.time}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">IP Address:</span>
                              <p className="font-mono text-xs">{selectedRecord.checkOut.ipAddress}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Device:</span>
                              <p className="text-xs">{selectedRecord.checkOut.device}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <p className="text-xs">{selectedRecord.checkOut.location}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-3">Summary</h5>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <Chip size="sm" color={statusColorMap[selectedRecord.status] as any} variant="flat">
                              {selectedRecord.status}
                            </Chip>
                          </div>
                          <div>
                            <span className="text-gray-500">Work Hours:</span>
                            <p className="font-medium">{selectedRecord.workHours}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Overtime:</span>
                            <p className="font-medium">{selectedRecord.overtime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:edit" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Edit Attendance</h3>
                      <p className="text-sm text-gray-500">Update attendance record</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {editingRecord && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Check In Time"
                          type="time"
                          value={editingRecord.checkIn?.time || ""}
                          onChange={(e) => {
                            if (editingRecord.checkIn) {
                              setEditingRecord({
                                ...editingRecord,
                                checkIn: { ...editingRecord.checkIn, time: e.target.value }
                              });
                            }
                          }}
                        />
                        <Input
                          label="Check Out Time"
                          type="time"
                          value={editingRecord.checkOut?.time || ""}
                          onChange={(e) => {
                            if (editingRecord.checkOut) {
                              setEditingRecord({
                                ...editingRecord,
                                checkOut: { ...editingRecord.checkOut, time: e.target.value }
                              });
                            }
                          }}
                        />
                      </div>
                      <Select
                        label="Status"
                        selectedKeys={[editingRecord.status]}
                        onSelectionChange={(keys) => setEditingRecord({
                          ...editingRecord,
                          status: Array.from(keys)[0] as AttendanceRecord['status']
                        })}
                        items={[
                          { key: "present", label: "Present" },
                          { key: "late", label: "Late" },
                          { key: "absent", label: "Absent" },
                          { key: "leave", label: "On Leave" },
                          { key: "half-day", label: "Half Day" }
                        ]}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                      <Textarea
                        label="Notes"
                        placeholder="Add any notes about this attendance record"
                        value={editingRecord.notes || ""}
                        onChange={(e) => setEditingRecord({
                          ...editingRecord,
                          notes: e.target.value
                        })}
                      />
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={() => editingRecord && handleEditAttendance(editingRecord)}>
                    Save Changes
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