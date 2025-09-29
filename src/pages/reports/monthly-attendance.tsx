import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import ReportHeader from "../../components/reports/ReportHeader";
import ReportStats from "../../components/reports/ReportStats";
import ReportFilters from "../../components/reports/ReportFilters";

// Monthly Attendance data interface
interface MonthlyAttendanceRecord {
  id: number;
  month: string;
  department: string;
  totalEmployees: number;
  presentDays: number;
  absentDays: number;
  lateArrivals: number;
  earlyDepartures: number;
  attendanceRate: number;
  overtimeHours: number;
  status: "completed" | "pending" | "draft";
}

// Sample data
const monthlyAttendanceData: MonthlyAttendanceRecord[] = [
  {
    id: 1,
    month: "January 2025",
    department: "IT",
    totalEmployees: 25,
    presentDays: 575,
    absentDays: 25,
    lateArrivals: 18,
    earlyDepartures: 12,
    attendanceRate: 95.8,
    overtimeHours: 120,
    status: "completed"
  },
  {
    id: 2,
    month: "January 2025",
    department: "HR",
    totalEmployees: 12,
    presentDays: 276,
    absentDays: 12,
    lateArrivals: 8,
    earlyDepartures: 5,
    attendanceRate: 95.8,
    overtimeHours: 45,
    status: "completed"
  },
  {
    id: 3,
    month: "January 2025",
    department: "Finance",
    totalEmployees: 18,
    presentDays: 414,
    absentDays: 18,
    lateArrivals: 12,
    earlyDepartures: 8,
    attendanceRate: 95.8,
    overtimeHours: 80,
    status: "completed"
  },
  {
    id: 4,
    month: "February 2025",
    department: "IT",
    totalEmployees: 25,
    presentDays: 550,
    absentDays: 30,
    lateArrivals: 22,
    earlyDepartures: 15,
    attendanceRate: 94.8,
    overtimeHours: 135,
    status: "pending"
  },
  {
    id: 5,
    month: "February 2025",
    department: "Marketing",
    totalEmployees: 15,
    presentDays: 330,
    absentDays: 20,
    lateArrivals: 15,
    earlyDepartures: 10,
    attendanceRate: 94.3,
    overtimeHours: 60,
    status: "draft"
  }
];

const departments = ["All", "IT", "HR", "Finance", "Marketing", "Operations"];
const months = ["All", "January 2025", "February 2025", "March 2025", "April 2025", "May 2025"];

const statusColorMap = {
  completed: "success",
  pending: "warning",
  draft: "default",
};

export default function MonthlyAttendanceReport() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rowsPerPage = 10;
  
  // Filter data
  const filteredData = useMemo(() => {
    return monthlyAttendanceData.filter(record => {
      const matchesSearch = 
        record.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "All" || record.department === selectedDepartment;
      const matchesMonth = selectedMonth === "All" || record.month === selectedMonth;
      
      return matchesSearch && matchesDepartment && matchesMonth;
    });
  }, [searchQuery, selectedDepartment, selectedMonth]);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = monthlyAttendanceData.reduce((sum, record) => sum + record.totalEmployees, 0);
    const totalPresentDays = monthlyAttendanceData.reduce((sum, record) => sum + record.presentDays, 0);
    const totalAbsentDays = monthlyAttendanceData.reduce((sum, record) => sum + record.absentDays, 0);
    const avgAttendanceRate = monthlyAttendanceData.reduce((sum, record) => sum + record.attendanceRate, 0) / monthlyAttendanceData.length;
    
    return [
      {
        label: "Total Employees",
        value: totalEmployees,
        icon: "lucide:users",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Present Days",
        value: totalPresentDays,
        icon: "lucide:check-circle",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Absent Days",
        value: totalAbsentDays,
        icon: "lucide:x-circle",
        color: "text-danger-600",
        bgColor: "bg-danger-100"
      },
      {
        label: "Avg Attendance Rate",
        value: `${avgAttendanceRate.toFixed(1)}%`,
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
        description: "Monthly attendance report has been exported successfully.",
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
        description: "Monthly attendance data has been refreshed successfully.",
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
          title="Monthly Attendance Report"
          description="Comprehensive monthly attendance analysis and tracking"
          icon="lucide:calendar-check"
          iconColor="from-primary-500 to-primary-600"
          onExport={handleExport}
          onRefresh={handleRefresh}
          isExporting={isExporting}
          isRefreshing={isRefreshing}
        />
        
        {/* Statistics */}
        <ReportStats stats={stats} />

        {/* Filters */}
        <ReportFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedDepartment}
          onFilterChange={setSelectedDepartment}
          filterOptions={departments.map(dept => ({ key: dept, label: dept }))}
          filterLabel="Department"
          additionalFilters={
            <div className="flex items-end">
              <div className="text-sm text-default-600">
                Showing {filteredData.length} of {monthlyAttendanceData.length} records
              </div>
            </div>
          }
        />

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-primary-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Monthly Attendance Data</h3>
                <p className="text-default-500 text-sm">Department-wise attendance analysis</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Monthly attendance table">
              <TableHeader>
                <TableColumn>MONTH</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>EMPLOYEES</TableColumn>
                <TableColumn>PRESENT DAYS</TableColumn>
                <TableColumn>ABSENT DAYS</TableColumn>
                <TableColumn>LATE ARRIVALS</TableColumn>
                <TableColumn>ATTENDANCE RATE</TableColumn>
                <TableColumn>OVERTIME HOURS</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{record.month}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {record.department}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:users" className="w-4 h-4 text-primary" />
                        <span className="font-medium">{record.totalEmployees}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:check-circle" className="w-4 h-4 text-success" />
                        <span className="font-medium text-success-600">{record.presentDays}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:x-circle" className="w-4 h-4 text-danger" />
                        <span className="font-medium text-danger-600">{record.absentDays}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:clock" className="w-4 h-4 text-warning" />
                        <span className="font-medium text-warning-600">{record.lateArrivals}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-content3 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success rounded-full" 
                            style={{ width: `${Math.min(record.attendanceRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{record.attendanceRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:clock" className="w-4 h-4 text-secondary" />
                        <span className="font-medium">{record.overtimeHours}h</span>
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
