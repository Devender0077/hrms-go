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
  Textarea,
  DatePicker,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

// Leave request interface
interface LeaveRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  avatar: string;
  department: string;
  rejectionReason?: string;
  emergencyContact?: string;
  attachments?: string[];
}

// Leave balance interface
interface LeaveBalance {
  employeeId: string;
  annualLeave: number;
  sickLeave: number;
  personalLeave: number;
  maternityLeave: number;
  emergencyLeave: number;
  usedAnnualLeave: number;
  usedSickLeave: number;
  usedPersonalLeave: number;
  usedMaternityLeave: number;
  usedEmergencyLeave: number;
}

// Sample leave data
const leaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Tony Reichert",
    leaveType: "Annual Leave",
    startDate: "2025-01-20",
    endDate: "2025-01-25",
    days: 5,
    reason: "Family vacation",
    status: "pending",
    appliedDate: "2025-01-15",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    department: "Executive",
    emergencyContact: "+1-555-0123"
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Zoey Lang",
    leaveType: "Sick Leave",
    startDate: "2025-01-18",
    endDate: "2025-01-19",
    days: 2,
    reason: "Medical appointment",
    status: "approved",
    appliedDate: "2025-01-17",
    approvedBy: "HR Manager",
    approvedDate: "2025-01-17",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    department: "IT"
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Jane Doe",
    leaveType: "Personal Leave",
    startDate: "2025-01-22",
    endDate: "2025-01-22",
    days: 1,
    reason: "Personal matters",
    status: "rejected",
    appliedDate: "2025-01-20",
    approvedBy: "HR Manager",
    approvedDate: "2025-01-20",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    department: "Marketing",
    rejectionReason: "Insufficient notice period"
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "William Smith",
    leaveType: "Maternity Leave",
    startDate: "2025-02-01",
    endDate: "2025-05-01",
    days: 90,
    reason: "Maternity leave",
    status: "approved",
    appliedDate: "2025-01-10",
    approvedBy: "HR Manager",
    approvedDate: "2025-01-12",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
    department: "HR"
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "Emma Wilson",
    leaveType: "Emergency Leave",
    startDate: "2025-01-16",
    endDate: "2025-01-16",
    days: 1,
    reason: "Family emergency",
    status: "pending",
    appliedDate: "2025-01-16",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
    department: "Finance",
    emergencyContact: "+1-555-0456"
  }
];

// Sample leave balances
const leaveBalances: LeaveBalance[] = [
  {
    employeeId: "EMP001",
    annualLeave: 25,
    sickLeave: 12,
    personalLeave: 5,
    maternityLeave: 0,
    emergencyLeave: 3,
    usedAnnualLeave: 5,
    usedSickLeave: 2,
    usedPersonalLeave: 1,
    usedMaternityLeave: 0,
    usedEmergencyLeave: 0
  },
  {
    employeeId: "EMP002",
    annualLeave: 25,
    sickLeave: 12,
    personalLeave: 5,
    maternityLeave: 0,
    emergencyLeave: 3,
    usedAnnualLeave: 8,
    usedSickLeave: 4,
    usedPersonalLeave: 2,
    usedMaternityLeave: 0,
    usedEmergencyLeave: 1
  }
];

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const leaveTypes = [
  { key: "Annual Leave", label: "Annual Leave", color: "primary" },
  { key: "Sick Leave", label: "Sick Leave", color: "warning" },
  { key: "Personal Leave", label: "Personal Leave", color: "secondary" },
  { key: "Maternity Leave", label: "Maternity Leave", color: "success" },
  { key: "Emergency Leave", label: "Emergency Leave", color: "danger" },
  { key: "Bereavement Leave", label: "Bereavement Leave", color: "default" },
  { key: "Study Leave", label: "Study Leave", color: "primary" }
];

export default function LeaveManagement() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [leaveList, setLeaveList] = useState(leaveRequests);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Apply leave modal state
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    attachments: [] as string[]
  });
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isApplyOpen, onOpen: onApplyOpen, onOpenChange: onApplyOpenChange } = useDisclosure();
  const rowsPerPage = 10;
  
  // Filter leave requests
  const filteredRequests = useMemo(() => {
    return leaveList.filter(request => {
      const matchesSearch = 
        request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
      const matchesLeaveType = selectedLeaveType === "all" || request.leaveType === selectedLeaveType;
      
      return matchesSearch && matchesStatus && matchesLeaveType;
    });
  }, [leaveList, searchQuery, selectedStatus, selectedLeaveType]);
  
  // Paginate filtered requests
  const paginatedRequests = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, page]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const total = leaveList.length;
    const pending = leaveList.filter(r => r.status === "pending").length;
    const approved = leaveList.filter(r => r.status === "approved").length;
    const rejected = leaveList.filter(r => r.status === "rejected").length;
    
    return { total, pending, approved, rejected };
  }, [leaveList]);

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Handle row actions
  const handleRowAction = (actionKey: string, request: LeaveRequest) => {
    switch (actionKey) {
      case "view":
        setSelectedRequest(request);
        onOpen();
        break;
      case "approve":
        handleApproveLeave(request);
        break;
      case "reject":
        handleRejectLeave(request);
        break;
      default:
        break;
    }
  };

  // Handle approve leave
  const handleApproveLeave = (request: LeaveRequest) => {
    setLeaveList(prev => 
      prev.map(req => 
        req.id === request.id 
          ? { 
              ...req, 
              status: "approved" as const,
              approvedBy: "HR Manager",
              approvedDate: new Date().toISOString().split('T')[0]
            }
          : req
      )
    );
    addToast({
      title: "Leave Approved",
      description: `Leave request for ${request.employeeName} has been approved.`,
      color: "success",
    });
  };

  // Handle reject leave
  const handleRejectLeave = (request: LeaveRequest) => {
    setLeaveList(prev => 
      prev.map(req => 
        req.id === request.id 
          ? { 
              ...req, 
              status: "rejected" as const,
              approvedBy: "HR Manager",
              approvedDate: new Date().toISOString().split('T')[0],
              rejectionReason: "Request rejected by HR Manager"
            }
          : req
      )
    );
    addToast({
      title: "Leave Rejected",
      description: `Leave request for ${request.employeeName} has been rejected.`,
      color: "danger",
    });
  };

  // Handle apply leave
  const handleApplyLeave = () => {
    if (!newLeaveRequest.leaveType || !newLeaveRequest.startDate || !newLeaveRequest.endDate || !newLeaveRequest.reason) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const days = calculateDays(newLeaveRequest.startDate, newLeaveRequest.endDate);
    
    const newRequest: LeaveRequest = {
      id: Date.now(),
      employeeId: "EMP001", // In real app, this would come from auth context
      employeeName: "Current User", // In real app, this would come from auth context
      leaveType: newLeaveRequest.leaveType,
      startDate: newLeaveRequest.startDate,
      endDate: newLeaveRequest.endDate,
      days: days,
      reason: newLeaveRequest.reason,
      status: "pending",
      appliedDate: new Date().toISOString().split('T')[0],
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
      department: "Current Department", // In real app, this would come from auth context
      emergencyContact: newLeaveRequest.emergencyContact,
      attachments: newLeaveRequest.attachments
    };

    setLeaveList(prev => [newRequest, ...prev]);
    setNewLeaveRequest({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      emergencyContact: "",
      attachments: []
    });
    onApplyOpenChange();
    
    addToast({
      title: "Leave Applied",
      description: "Your leave request has been submitted successfully.",
      color: "success",
    });
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredRequests);
      downloadFile(csvContent, `leave-report-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Leave report has been exported to CSV.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export leave report.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate CSV content
  const generateCSV = (requests: LeaveRequest[]) => {
    const headers = [
      'Employee ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 
      'End Date', 'Days', 'Reason', 'Status', 'Applied Date', 'Approved By', 'Approved Date'
    ];
    
    const rows = requests.map(request => [
      request.employeeId,
      request.employeeName,
      request.department,
      request.leaveType,
      request.startDate,
      request.endDate,
      request.days,
      request.reason,
      request.status,
      request.appliedDate,
      request.approvedBy || 'N/A',
      request.approvedDate || 'N/A'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
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
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Icon icon="lucide:calendar-off" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600 mt-1">Manage employee leave requests and approvals</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onApplyOpen}
              className="font-medium"
            >
              Apply Leave
            </Button>
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              isLoading={isExporting}
              className="font-medium"
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon icon="lucide:calendar-days" className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-default-500">Total Requests</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
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
                  <p className="text-default-500">Pending</p>
                  <h3 className="text-2xl font-bold">{stats.pending}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Icon icon="lucide:check-circle" className="text-2xl text-success" />
                </div>
                <div>
                  <p className="text-default-500">Approved</p>
                  <h3 className="text-2xl font-bold">{stats.approved}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-danger/10">
                  <Icon icon="lucide:x-circle" className="text-2xl text-danger" />
                </div>
                <div>
                  <p className="text-default-500">Rejected</p>
                  <h3 className="text-2xl font-bold">{stats.rejected}</h3>
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
              <Select
                label="Status"
                placeholder="All Status"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                items={[
                  { key: "all", label: "All Status" },
                  { key: "pending", label: "Pending" },
                  { key: "approved", label: "Approved" },
                  { key: "rejected", label: "Rejected" }
                ]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                label="Leave Type"
                placeholder="All Types"
                selectedKeys={[selectedLeaveType]}
                onSelectionChange={(keys) => setSelectedLeaveType(Array.from(keys)[0] as string)}
                items={[
                  { key: "all", label: "All Types" },
                  ...leaveTypes
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
                  Showing {filteredRequests.length} of {leaveList.length} requests
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Leave Requests Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-green-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
                <p className="text-gray-500 text-sm">Click on actions to view, approve, or reject leave requests</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Leave requests table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>LEAVE TYPE</TableColumn>
                <TableColumn>DATES</TableColumn>
                <TableColumn>DAYS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>APPLIED DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar src={request.avatar} alt={request.employeeName} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{request.employeeName}</p>
                          <p className="text-sm text-gray-500">{request.employeeId}</p>
                          <p className="text-xs text-gray-400">{request.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={leaveTypes.find(t => t.key === request.leaveType)?.color as any || "default"}
                        variant="flat"
                      >
                        {request.leaveType}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(request.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          to {new Date(request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{request.days}</span>
                        </div>
                        <span className="text-sm text-gray-600">days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[request.status] as any}
                        variant="flat"
                      >
                        {request.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">
                        {new Date(request.appliedDate).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label="Leave actions">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => handleRowAction("view", request)}
                          >
                            View Details
                          </DropdownItem>
                          {request.status === "pending" && (
                            <>
                              <DropdownItem
                                key="approve"
                                startContent={<Icon icon="lucide:check" />}
                                onPress={() => handleRowAction("approve", request)}
                              >
                                Approve
                              </DropdownItem>
                              <DropdownItem
                                key="reject"
                                className="text-danger"
                                color="danger"
                                startContent={<Icon icon="lucide:x" />}
                                onPress={() => handleRowAction("reject", request)}
                              >
                                Reject
                              </DropdownItem>
                            </>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredRequests.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredRequests.length / rowsPerPage)}
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
                    <Icon icon="lucide:eye" className="text-green-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Leave Request Details</h3>
                      <p className="text-sm text-gray-500">Complete leave request information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedRequest && (
                    <div className="space-y-6">
                      {/* Employee Info */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar src={selectedRequest.avatar} alt={selectedRequest.employeeName} size="lg" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{selectedRequest.employeeName}</h4>
                          <p className="text-gray-600">{selectedRequest.employeeId}</p>
                          <p className="text-sm text-gray-500">{selectedRequest.department}</p>
                        </div>
                      </div>

                      {/* Leave Details */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Leave Type</span>
                            <Chip
                              size="sm"
                              color={leaveTypes.find(t => t.key === selectedRequest.leaveType)?.color as any || "default"}
                              variant="flat"
                              className="ml-2"
                            >
                              {selectedRequest.leaveType}
                            </Chip>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Start Date</span>
                            <p className="font-medium">{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">End Date</span>
                            <p className="font-medium">{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Total Days</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-blue-600">{selectedRequest.days}</span>
                              </div>
                              <span className="text-sm text-gray-600">days</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Status</span>
                            <Chip
                              size="sm"
                              color={statusColorMap[selectedRequest.status] as any}
                              variant="flat"
                              className="ml-2"
                            >
                              {selectedRequest.status}
                            </Chip>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Applied Date</span>
                            <p className="font-medium">{new Date(selectedRequest.appliedDate).toLocaleDateString()}</p>
                          </div>
                          {selectedRequest.approvedBy && (
                            <div>
                              <span className="text-gray-500 text-sm">Approved By</span>
                              <p className="font-medium">{selectedRequest.approvedBy}</p>
                            </div>
                          )}
                          {selectedRequest.approvedDate && (
                            <div>
                              <span className="text-gray-500 text-sm">Approved Date</span>
                              <p className="font-medium">{new Date(selectedRequest.approvedDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <span className="text-gray-500 text-sm">Reason</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{selectedRequest.reason}</p>
                      </div>

                      {/* Emergency Contact */}
                      {selectedRequest.emergencyContact && (
                        <div>
                          <span className="text-gray-500 text-sm">Emergency Contact</span>
                          <p className="font-medium">{selectedRequest.emergencyContact}</p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {selectedRequest.rejectionReason && (
                        <div>
                          <span className="text-gray-500 text-sm">Rejection Reason</span>
                          <p className="mt-1 p-3 bg-red-50 rounded-lg text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                        </div>
                      )}
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

        {/* Apply Leave Modal */}
        <Modal isOpen={isApplyOpen} onOpenChange={onApplyOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:plus" className="text-green-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Apply for Leave</h3>
                      <p className="text-sm text-gray-500">Submit a new leave request</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Select
                      label="Leave Type"
                      placeholder="Select leave type"
                      selectedKeys={[newLeaveRequest.leaveType]}
                      onSelectionChange={(keys) => setNewLeaveRequest({
                        ...newLeaveRequest,
                        leaveType: Array.from(keys)[0] as string
                      })}
                      isRequired
                      items={leaveTypes}
                    >
                      {(item) => (
                        <SelectItem key={item.key}>
                          {item.label}
                        </SelectItem>
                      )}
                    </Select>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start Date"
                        type="date"
                        value={newLeaveRequest.startDate}
                        onChange={(e) => setNewLeaveRequest({
                          ...newLeaveRequest,
                          startDate: e.target.value
                        })}
                        isRequired
                      />
                      <Input
                        label="End Date"
                        type="date"
                        value={newLeaveRequest.endDate}
                        onChange={(e) => setNewLeaveRequest({
                          ...newLeaveRequest,
                          endDate: e.target.value
                        })}
                        isRequired
                      />
                    </div>
                    
                    {newLeaveRequest.startDate && newLeaveRequest.endDate && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:calendar" className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Total Days: {calculateDays(newLeaveRequest.startDate, newLeaveRequest.endDate)} days
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Textarea
                      label="Reason"
                      placeholder="Please provide a reason for your leave request"
                      value={newLeaveRequest.reason}
                      onChange={(e) => setNewLeaveRequest({
                        ...newLeaveRequest,
                        reason: e.target.value
                      })}
                      isRequired
                      minRows={3}
                    />
                    
                    <Input
                      label="Emergency Contact"
                      placeholder="Emergency contact number"
                      value={newLeaveRequest.emergencyContact}
                      onChange={(e) => setNewLeaveRequest({
                        ...newLeaveRequest,
                        emergencyContact: e.target.value
                      })}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleApplyLeave}>
                    Apply Leave
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