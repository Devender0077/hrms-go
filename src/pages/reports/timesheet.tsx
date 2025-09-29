import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import ReportHeader from "../../components/reports/ReportHeader";
import ReportStats from "../../components/reports/ReportStats";
import ReportFilters from "../../components/reports/ReportFilters";

// Timesheet report data interface
interface TimesheetReportRecord {
  id: number;
  employeeName: string;
  employeeId: string;
  department: string;
  project: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  totalHours: number;
  overtimeHours: number;
  hourlyRate: number;
  totalAmount: number;
  status: "approved" | "pending" | "rejected";
  description: string;
  approvedBy?: string;
}

// Sample data
const timesheetReportData: TimesheetReportRecord[] = [
  {
    id: 1,
    employeeName: "John Doe",
    employeeId: "EMP001",
    department: "IT",
    project: "HRMS Development",
    date: "2025-01-15",
    startTime: "09:00",
    endTime: "17:00",
    breakTime: 60,
    totalHours: 7,
    overtimeHours: 0,
    hourlyRate: 50,
    totalAmount: 350,
    status: "approved",
    description: "Frontend development and bug fixes",
    approvedBy: "Jane Smith"
  },
  {
    id: 2,
    employeeName: "Sarah Wilson",
    employeeId: "EMP002",
    department: "HR",
    project: "Employee Onboarding",
    date: "2025-01-15",
    startTime: "08:30",
    endTime: "17:30",
    breakTime: 60,
    totalHours: 8,
    overtimeHours: 0,
    hourlyRate: 45,
    totalAmount: 360,
    status: "approved",
    description: "New employee orientation and documentation",
    approvedBy: "Mike Johnson"
  },
  {
    id: 3,
    employeeName: "David Brown",
    employeeId: "EMP003",
    department: "Finance",
    project: "Monthly Reports",
    date: "2025-01-15",
    startTime: "09:00",
    endTime: "18:00",
    breakTime: 60,
    totalHours: 8,
    overtimeHours: 0,
    hourlyRate: 40,
    totalAmount: 320,
    status: "approved",
    description: "Financial analysis and report generation",
    approvedBy: "Lisa Anderson"
  },
  {
    id: 4,
    employeeName: "Emily Davis",
    employeeId: "EMP004",
    department: "Marketing",
    project: "Campaign Launch",
    date: "2025-01-15",
    startTime: "09:00",
    endTime: "19:00",
    breakTime: 60,
    totalHours: 9,
    overtimeHours: 1,
    hourlyRate: 35,
    totalAmount: 350,
    status: "pending",
    description: "Marketing campaign preparation and execution"
  },
  {
    id: 5,
    employeeName: "Michael Chen",
    employeeId: "EMP005",
    department: "Operations",
    project: "Process Optimization",
    date: "2025-01-15",
    startTime: "08:00",
    endTime: "16:00",
    breakTime: 60,
    totalHours: 7,
    overtimeHours: 0,
    hourlyRate: 42,
    totalAmount: 294,
    status: "rejected",
    description: "Workflow analysis and improvement recommendations"
  }
];

const departments = ["All", "IT", "HR", "Finance", "Marketing", "Operations"];
const projects = ["All", "HRMS Development", "Employee Onboarding", "Monthly Reports", "Campaign Launch", "Process Optimization"];
const statuses = ["All", "approved", "pending", "rejected"];

const statusColorMap = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

export default function TimesheetReport() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rowsPerPage = 10;
  
  // Filter data
  const filteredData = useMemo(() => {
    return timesheetReportData.filter(record => {
      const matchesSearch = 
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.project.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "All" || record.department === selectedDepartment;
      const matchesProject = selectedProject === "All" || record.project === selectedProject;
      const matchesStatus = selectedStatus === "All" || record.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesProject && matchesStatus;
    });
  }, [searchQuery, selectedDepartment, selectedProject, selectedStatus]);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHours = timesheetReportData.reduce((sum, record) => sum + record.totalHours, 0);
    const totalOvertimeHours = timesheetReportData.reduce((sum, record) => sum + record.overtimeHours, 0);
    const totalAmount = timesheetReportData.reduce((sum, record) => sum + record.totalAmount, 0);
    const avgHoursPerDay = totalHours / timesheetReportData.length;
    
    return [
      {
        label: "Total Hours",
        value: totalHours,
        icon: "lucide:clock",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Overtime Hours",
        value: totalOvertimeHours,
        icon: "lucide:clock-plus",
        color: "text-warning-600",
        bgColor: "bg-warning-100"
      },
      {
        label: "Total Amount",
        value: `$${totalAmount.toLocaleString()}`,
        icon: "lucide:dollar-sign",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Avg Hours/Day",
        value: avgHoursPerDay.toFixed(1),
        icon: "lucide:trending-up",
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
        description: "Timesheet report has been exported successfully.",
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
        description: "Timesheet data has been refreshed successfully.",
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
          title="Timesheet Report"
          description="Comprehensive timesheet tracking and project time analysis"
          icon="lucide:clock"
          iconColor="from-primary-500 to-secondary-600"
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
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {projects.map(project => (
                  <option key={project} value={project}>{project}</option>
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
                  Showing {filteredData.length} of {timesheetReportData.length} records
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-primary-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Timesheet Records</h3>
                <p className="text-default-500 text-sm">Employee time tracking and project hours</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Timesheet report table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>PROJECT</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>TIME</TableColumn>
                <TableColumn>HOURS</TableColumn>
                <TableColumn>OVERTIME</TableColumn>
                <TableColumn>RATE</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{record.employeeName}</p>
                        <p className="text-sm text-default-500">{record.employeeId}</p>
                        <p className="text-sm text-default-500">{record.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {record.project}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{new Date(record.date).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{record.startTime} - {record.endTime}</p>
                        <p className="text-sm text-default-500">Break: {record.breakTime}min</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:clock" className="w-4 h-4 text-primary" />
                        <span className="font-medium">{record.totalHours}h</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.overtimeHours > 0 ? (
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:clock-plus" className="w-4 h-4 text-warning" />
                          <span className="font-medium text-warning-600">{record.overtimeHours}h</span>
                        </div>
                      ) : (
                        <span className="text-default-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:dollar-sign" className="w-4 h-4 text-success" />
                        <span className="font-medium">${record.hourlyRate}/h</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:wallet" className="w-4 h-4 text-success" />
                        <span className="font-bold text-success-600">${record.totalAmount}</span>
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
                      <p className="text-sm text-default-700 max-w-32 truncate" title={record.description}>
                        {record.description}
                      </p>
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
