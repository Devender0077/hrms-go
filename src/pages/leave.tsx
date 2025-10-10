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
  Textarea,
  DatePicker,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { useAuthenticatedAPI } from "../hooks/useAuthenticatedAPI";
import HeroSection from "../components/common/HeroSection";
import { useTranslation } from "../contexts/translation-context";

// Leave request interface
interface LeaveRequest {
  id: number;
  application_id: string;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  leave_type_id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  emergency_contact?: string;
  attachment?: string;
  department?: string;
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

// Leave type interface
interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
  is_paid: boolean;
  description?: string;
}

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

const leaveTypeColors = {
  "Annual Leave": "primary",
  "Sick Leave": "warning", 
  "Personal Leave": "secondary",
  "Maternity Leave": "success",
  "Emergency Leave": "danger",
  "Bereavement Leave": "default",
  "Study Leave": "primary"
};

export default function LeaveManagement() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [leaveList, setLeaveList] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { apiRequest } = useAuthenticatedAPI();
  
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

  // Fetch leave applications and types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch leave applications
        const applicationsResponse = await apiRequest('/leave/applications', { method: 'GET' });
        if (applicationsResponse.success) {
          setLeaveList(applicationsResponse.data);
        }
        
        // Fetch leave types
        const typesResponse = await apiRequest('/leave/types', { method: 'GET' });
        if (typesResponse.success) {
          setLeaveTypes(typesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching leave data:', error);
        addToast({
          title: "Error",
          description: "Failed to load leave data",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiRequest]);
  
  // Filter leave requests
  const filteredRequests = useMemo(() => {
    return leaveList.filter(request => {
      const matchesSearch = 
        request.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.department && request.department.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
      const matchesLeaveType = selectedLeaveType === "all" || request.leave_type_name === selectedLeaveType;
      
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
  const handleApproveLeave = async (request: LeaveRequest) => {
    try {
      const response = await apiRequest(`/leave/applications/${request.id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'approved',
          comments: 'Approved by HR Manager'
        })
      });

      if (response.success) {
        setLeaveList(prev => 
          prev.map(req => 
            req.id === request.id 
              ? { 
                  ...req, 
                  status: "approved" as const,
                  approved_by_name: "HR Manager",
                  approved_at: new Date().toISOString()
                }
              : req
          )
        );
        addToast({
          title: "Leave Approved",
          description: `Leave request for ${request.employee_name} has been approved.`,
          color: "success",
        });
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      addToast({
        title: "Error",
        description: "Failed to approve leave request",
        color: "danger",
      });
    }
  };

  // Handle reject leave
  const handleRejectLeave = async (request: LeaveRequest) => {
    try {
      const response = await apiRequest(`/leave/applications/${request.id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'rejected',
          comments: 'Request rejected by HR Manager'
        })
      });

      if (response.success) {
        setLeaveList(prev => 
          prev.map(req => 
            req.id === request.id 
              ? { 
                  ...req, 
                  status: "rejected" as const,
                  approved_by_name: "HR Manager",
                  approved_at: new Date().toISOString(),
                  rejection_reason: "Request rejected by HR Manager"
                }
              : req
          )
        );
        addToast({
          title: "Leave Rejected",
          description: `Leave request for ${request.employee_name} has been rejected.`,
          color: "danger",
        });
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      addToast({
        title: "Error",
        description: "Failed to reject leave request",
        color: "danger",
      });
    }
  };

  // Handle apply leave
  const handleApplyLeave = async () => {
    if (!newLeaveRequest.leaveType || !newLeaveRequest.startDate || !newLeaveRequest.endDate || !newLeaveRequest.reason) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    try {
      const days = calculateDays(newLeaveRequest.startDate, newLeaveRequest.endDate);
      
      const response = await apiRequest('/leave/applications', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: 1, // In real app, this would come from auth context
          leave_type_id: parseInt(newLeaveRequest.leaveType),
          start_date: newLeaveRequest.startDate,
          end_date: newLeaveRequest.endDate,
          reason: newLeaveRequest.reason,
          emergency_contact: newLeaveRequest.emergencyContact
        })
      });

      if (response.success) {
        // Refresh the leave list
        const applicationsResponse = await apiRequest('/leave/applications', { method: 'GET' });
        if (applicationsResponse.success) {
          setLeaveList(applicationsResponse.data);
        }
        
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
      }
    } catch (error) {
      console.error('Error applying leave:', error);
      addToast({
        title: "Error",
        description: "Failed to submit leave request",
        color: "danger",
      });
    }
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
      request.employee_id,
      request.employee_name,
      request.department,
      request.leave_type_id,
      request.start_date,
      request.end_date,
      (request as any).days,
      request.reason,
      request.status,
      (request as any).applied_date,
      request.approved_by || 'N/A',
      request.approved_at || 'N/A'
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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroSection
          title={t("Leave Management")}
          subtitle={t("Employee Time Off")}
          description="Manage employee leave requests, track attendance, and maintain work-life balance. Streamline your leave approval process with comprehensive insights."
          icon="lucide:calendar-off"
          illustration="leave"
          actions={[
            {
              label: "Apply Leave",
              icon: "lucide:plus",
              onPress: onApplyOpen,
              variant: "solid"
            },
            {
              label: "Export Report",
              icon: "lucide:download",
              onPress: handleExportCSV,
              variant: "bordered",
              isLoading: isExporting
            }
          ]}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div 
            whileHover={{ y: -5 }} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Card className="shadow-sm bg-content1 dark:bg-content1">
              <CardBody className="flex flex-row items-center gap-4 p-4 sm:p-6">
                <div className="p-2 sm:p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                  <Icon icon="lucide:calendar-days" className="text-xl sm:text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-default-500 text-xs sm:text-sm">Total Requests</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <Card className="shadow-sm bg-content1 dark:bg-content1">
              <CardBody className="flex flex-row items-center gap-4 p-4 sm:p-6">
                <div className="p-2 sm:p-3 rounded-full bg-warning/10 dark:bg-warning/20">
                  <Icon icon="lucide:clock" className="text-xl sm:text-2xl text-warning" />
                </div>
                <div>
                  <p className="text-default-500 text-xs sm:text-sm">Pending</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{stats.pending}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            <Card className="shadow-sm bg-content1 dark:bg-content1">
              <CardBody className="flex flex-row items-center gap-4 p-4 sm:p-6">
                <div className="p-2 sm:p-3 rounded-full bg-success/10 dark:bg-success/20">
                  <Icon icon="lucide:check-circle" className="text-xl sm:text-2xl text-success" />
                </div>
                <div>
                  <p className="text-default-500 text-xs sm:text-sm">Approved</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{stats.approved}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.4 }}
          >
            <Card className="shadow-sm bg-content1 dark:bg-content1">
              <CardBody className="flex flex-row items-center gap-4 p-4 sm:p-6">
                <div className="p-2 sm:p-3 rounded-full bg-danger/10 dark:bg-danger/20">
                  <Icon icon="lucide:x-circle" className="text-xl sm:text-2xl text-danger" />
                </div>
                <div>
                  <p className="text-default-500 text-xs sm:text-sm">Rejected</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{stats.rejected}</h3>
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
                
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
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
                  ...leaveTypes.map(lt => ({ key: lt.name, label: lt.name }))
                ]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-default-600">
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
              <Icon icon="lucide:table" className="text-success-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Leave Requests</h3>
                <p className="text-default-500 text-sm">Click on actions to view, approve, or reject leave requests</p>
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
              <TableBody emptyContent={loading ? "Loading..." : "No leave requests found"}>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.employee_name}`} 
                          alt={request.employee_name} 
                          size="sm" 
                        />
                        <div>
                          <p className="font-medium text-foreground">{request.employee_name}</p>
                          <p className="text-sm text-default-500">{request.employee_code}</p>
                          {request.department && (
                            <p className="text-xs text-default-400">{request.department}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={leaveTypeColors[request.leave_type_name as keyof typeof leaveTypeColors] as any || "default"}
                        variant="flat"
                      >
                        {request.leave_type_name}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(request.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-default-500">
                          to {new Date(request.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{request.total_days}</span>
                        </div>
                        <span className="text-sm text-default-600">days</span>
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
                      <p className="text-sm text-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
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
                    <Icon icon="lucide:eye" className="text-success-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Leave Request Details</h3>
                      <p className="text-sm text-default-500">Complete leave request information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedRequest && (
                    <div className="space-y-6">
                      {/* Employee Info */}
                      <div className="flex items-center gap-4 p-4 bg-content1 rounded-lg">
                        <Avatar 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRequest.employee_name}`} 
                          alt={selectedRequest.employee_name} 
                          size="lg" 
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{selectedRequest.employee_name}</h4>
                          <p className="text-default-600">{selectedRequest.employee_code}</p>
                          {selectedRequest.department && (
                            <p className="text-sm text-default-500">{selectedRequest.department}</p>
                          )}
                        </div>
                      </div>

                      {/* Leave Details */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-default-500 text-sm">Leave Type</span>
                            <Chip
                              size="sm"
                              color={leaveTypeColors[selectedRequest.leave_type_name as keyof typeof leaveTypeColors] as any || "default"}
                              variant="flat"
                              className="ml-2"
                            >
                              {selectedRequest.leave_type_name}
                            </Chip>
                          </div>
                          <div>
                            <span className="text-default-500 text-sm">Start Date</span>
                            <p className="font-medium">{new Date(selectedRequest.start_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-default-500 text-sm">End Date</span>
                            <p className="font-medium">{new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-default-500 text-sm">Total Days</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-primary-600">{selectedRequest.total_days}</span>
                              </div>
                              <span className="text-sm text-default-600">days</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-default-500 text-sm">Status</span>
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
                            <span className="text-default-500 text-sm">Applied Date</span>
                            <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                          </div>
                          {selectedRequest.approved_by_name && (
                            <div>
                              <span className="text-default-500 text-sm">Approved By</span>
                              <p className="font-medium">{selectedRequest.approved_by_name}</p>
                            </div>
                          )}
                          {selectedRequest.approved_at && (
                            <div>
                              <span className="text-default-500 text-sm">Approved Date</span>
                              <p className="font-medium">{new Date(selectedRequest.approved_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <span className="text-default-500 text-sm">Reason</span>
                        <p className="mt-1 p-3 bg-content1 rounded-lg text-sm">{selectedRequest.reason}</p>
                      </div>

                      {/* Emergency Contact */}
                      {selectedRequest.emergency_contact && (
                        <div>
                          <span className="text-default-500 text-sm">Emergency Contact</span>
                          <p className="font-medium">{selectedRequest.emergency_contact}</p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {selectedRequest.rejection_reason && (
                        <div>
                          <span className="text-default-500 text-sm">Rejection Reason</span>
                          <p className="mt-1 p-3 bg-danger-50 rounded-lg text-sm text-danger-700">{selectedRequest.rejection_reason}</p>
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
                    <Icon icon="lucide:plus" className="text-success-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Apply for Leave</h3>
                      <p className="text-sm text-default-500">Submit a new leave request</p>
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
                      items={leaveTypes.map(lt => ({ key: lt.id.toString(), label: lt.name }))}
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
                        
                        onChange={(e) => setNewLeaveRequest({
                          ...newLeaveRequest,
                          startDate: e.target.value
                        })}
                        isRequired
                      />
                      <Input
                        label="End Date"
                        type="date"
                        
                        onChange={(e) => setNewLeaveRequest({
                          ...newLeaveRequest,
                          endDate: e.target.value
                        })}
                        isRequired
                      />
                    </div>
                    
                    {newLeaveRequest.startDate && newLeaveRequest.endDate && (
                      <div className="p-3 bg-primary-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:calendar" className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-medium text-primary-900">
                            Total Days: {calculateDays(newLeaveRequest.startDate, newLeaveRequest.endDate)} days
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Textarea
                      label="Reason"
                      placeholder="Please provide a reason for your leave request"
                      
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