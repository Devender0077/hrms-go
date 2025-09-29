import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import ReportHeader from "../../components/reports/ReportHeader";
import ReportStats from "../../components/reports/ReportStats";
import ReportFilters from "../../components/reports/ReportFilters";

// Leave report data interface
interface LeaveReportRecord {
  id: number;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "approved" | "pending" | "rejected";
  reason: string;
  appliedDate: string;
  approvedBy?: string;
}

// Sample data
const leaveReportData: LeaveReportRecord[] = [
  {
    id: 1,
    employeeName: "John Doe",
    department: "IT",
    leaveType: "Annual Leave",
    startDate: "2025-01-15",
    endDate: "2025-01-20",
    days: 5,
    status: "approved",
    reason: "Family vacation",
    appliedDate: "2025-01-10",
    approvedBy: "Jane Smith"
  },
  {
    id: 2,
    employeeName: "Sarah Wilson",
    department: "HR",
    leaveType: "Sick Leave",
    startDate: "2025-01-18",
    endDate: "2025-01-19",
    days: 2,
    status: "approved",
    reason: "Medical appointment",
    appliedDate: "2025-01-17",
    approvedBy: "Mike Johnson"
  },
  {
    id: 3,
    employeeName: "David Brown",
    department: "Finance",
    leaveType: "Personal Leave",
    startDate: "2025-01-22",
    endDate: "2025-01-24",
    days: 3,
    status: "pending",
    reason: "Personal matters",
    appliedDate: "2025-01-20"
  },
  {
    id: 4,
    employeeName: "Emily Davis",
    department: "Marketing",
    leaveType: "Maternity Leave",
    startDate: "2025-02-01",
    endDate: "2025-05-01",
    days: 90,
    status: "approved",
    reason: "Maternity leave",
    appliedDate: "2025-01-15",
    approvedBy: "Lisa Anderson"
  },
  {
    id: 5,
    employeeName: "Michael Chen",
    department: "Operations",
    leaveType: "Emergency Leave",
    startDate: "2025-01-25",
    endDate: "2025-01-26",
    days: 2,
    status: "rejected",
    reason: "Family emergency",
    appliedDate: "2025-01-24"
  }
];

const departments = ["All", "IT", "HR", "Finance", "Marketing", "Operations"];
const leaveTypes = ["All", "Annual Leave", "Sick Leave", "Personal Leave", "Maternity Leave", "Emergency Leave"];
const statuses = ["All", "approved", "pending", "rejected"];

const statusColorMap = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

const leaveTypeColorMap = {
  "Annual Leave": "primary",
  "Sick Leave": "secondary",
  "Personal Leave": "default",
  "Maternity Leave": "success",
  "Emergency Leave": "danger",
};

export default function LeaveReport() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedLeaveType, setSelectedLeaveType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rowsPerPage = 10;
  
  // Filter data
  const filteredData = useMemo(() => {
    return leaveReportData.filter(record => {
      const matchesSearch = 
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "All" || record.department === selectedDepartment;
      const matchesLeaveType = selectedLeaveType === "All" || record.leaveType === selectedLeaveType;
      const matchesStatus = selectedStatus === "All" || record.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesLeaveType && matchesStatus;
    });
  }, [searchQuery, selectedDepartment, selectedLeaveType, selectedStatus]);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLeaves = leaveReportData.length;
    const approvedLeaves = leaveReportData.filter(record => record.status === "approved").length;
    const pendingLeaves = leaveReportData.filter(record => record.status === "pending").length;
    const totalDays = leaveReportData.reduce((sum, record) => sum + record.days, 0);
    
    return [
      {
        label: "Total Leave Requests",
        value: totalLeaves,
        icon: "lucide:calendar",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Approved Leaves",
        value: approvedLeaves,
        icon: "lucide:check-circle",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Pending Leaves",
        value: pendingLeaves,
        icon: "lucide:clock",
        color: "text-warning-600",
        bgColor: "bg-warning-100"
      },
      {
        label: "Total Leave Days",
        value: totalDays,
        icon: "lucide:calendar-days",
        color: "text-secondary-600",
        bgColor: "bg-secondary-100"
      }
    ];
  }, []);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addToast({
        title: "Export Successful",
        description: "Leave report has been exported successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export the report. Please try again.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      addToast({
        title: "Data Refreshed",
        description: "Leave data has been refreshed successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Refresh Failed",
        description: "Failed to refresh the data. Please try again.",
        color: "danger",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ReportHeader
          title="Leave Report"
          description="Comprehensive leave management and tracking analysis"
          icon="lucide:calendar-x"
          iconColor="from-warning-500 to-danger-600"
          onExport={handleExport}
          onRefresh={handleRefresh}
          isExporting={isExporting}
          isRefreshing={isRefreshing}
        />
        
        {/* Statistics */}
        <ReportStats stats={stats} />

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="flex items-end">
                <div className="text-sm text-default-600">
                  Showing {filteredData.length} of {leaveReportData.length} records
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-warning-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Leave Records</h3>
                <p className="text-default-500 text-sm">Employee leave requests and approvals</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Leave report table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>LEAVE TYPE</TableColumn>
                <TableColumn>DATES</TableColumn>
                <TableColumn>DAYS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>REASON</TableColumn>
                <TableColumn>APPROVED BY</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{record.employeeName}</p>
                        <p className="text-sm text-default-500">Applied: {new Date(record.appliedDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {record.department}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color={leaveTypeColorMap[record.leaveType as keyof typeof leaveTypeColorMap] as any}
                      >
                        {record.leaveType}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{new Date(record.startDate).toLocaleDateString()}</p>
                        <p className="text-sm text-default-500">to {new Date(record.endDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{record.days}</span>
                        </div>
                        <span className="text-sm text-default-600">days</span>
                      </div>
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
                      <p className="text-sm text-default-700 max-w-32 truncate" title={record.reason}>
                        {record.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      {record.approvedBy ? (
                        <p className="text-sm font-medium text-foreground">{record.approvedBy}</p>
                      ) : (
                        <span className="text-sm text-default-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredData.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredData.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
