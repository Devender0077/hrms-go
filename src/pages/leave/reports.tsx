import React, { useState, useEffect } from "react";
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
  Select,
  SelectItem,
  Chip,
  Spinner,
  Pagination,
  DatePicker,
  parseDate,
  Progress,
  Tabs,
  Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { apiRequest } from "../../services/api-service";

interface LeaveReport {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department_name: string;
  leave_type_name: string;
  total_applications: number;
  total_days_applied: number;
  total_days_approved: number;
  total_days_rejected: number;
  total_days_pending: number;
  utilization_percentage: number;
  remaining_balance: number;
}

interface LeaveSummary {
  total_employees: number;
  total_applications: number;
  total_days_applied: number;
  total_days_approved: number;
  total_days_rejected: number;
  total_days_pending: number;
  average_utilization: number;
  most_used_leave_type: string;
  least_used_leave_type: string;
}

interface DepartmentReport {
  department_id: number;
  department_name: string;
  total_employees: number;
  total_applications: number;
  total_days_applied: number;
  total_days_approved: number;
  utilization_percentage: number;
}

export default function LeaveReports() {
  const [reports, setReports] = useState<LeaveReport[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [departmentReports, setDepartmentReports] = useState<DepartmentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [reportType, setReportType] = useState("employee");
  
  const rowsPerPage = 10;

  useEffect(() => {
    loadReports();
  }, [yearFilter, monthFilter, departmentFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [reportsResponse, summaryResponse, departmentResponse] = await Promise.all([
        apiRequest(`/leave/reports?year=${yearFilter}&month=${monthFilter}&department=${departmentFilter}`),
        apiRequest(`/leave/reports/summary?year=${yearFilter}&month=${monthFilter}`),
        apiRequest(`/leave/reports/departments?year=${yearFilter}&month=${monthFilter}`)
      ]);

      if (reportsResponse.success) {
        setReports(reportsResponse.data || []);
      }

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }

      if (departmentResponse.success) {
        setDepartmentReports(departmentResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Employee Name",
      "Department",
      "Leave Type",
      "Total Applications",
      "Days Applied",
      "Days Approved",
      "Days Rejected",
      "Days Pending",
      "Utilization %",
      "Remaining Balance"
    ];

    const rows = filteredReports.map(report => [
      report.employee_name,
      report.department_name,
      report.leave_type_name,
      report.total_applications,
      report.total_days_applied,
      report.total_days_approved,
      report.total_days_rejected,
      report.total_days_pending,
      report.utilization_percentage.toFixed(1),
      report.remaining_balance
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave-reports-${yearFilter}-${monthFilter}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // This would typically use a PDF library like jsPDF
    console.log("Export to PDF functionality would be implemented here");
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.department_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.leave_type_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Paginate filtered results
  const paginatedReports = filteredReports.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const pages = Math.ceil(filteredReports.length / rowsPerPage);

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "danger";
    if (percentage >= 70) return "warning";
    return "success";
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Icon icon="lucide:bar-chart-3" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Reports</h1>
              <p className="text-gray-600 mt-1">Comprehensive leave analytics and insights</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              className="font-medium"
            >
              Export CSV
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:file-text" />}
              onPress={handleExportPDF}
              className="font-medium"
            >
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Applications</p>
                    <p className="text-2xl font-bold">{summary.total_applications}</p>
                  </div>
                  <Icon icon="lucide:file-text" className="text-3xl text-blue-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Days Approved</p>
                    <p className="text-2xl font-bold">{summary.total_days_approved}</p>
                  </div>
                  <Icon icon="lucide:check-circle" className="text-3xl text-green-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Average Utilization</p>
                    <p className="text-2xl font-bold">{summary.average_utilization.toFixed(1)}%</p>
                  </div>
                  <Icon icon="lucide:trending-up" className="text-3xl text-orange-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Most Used Type</p>
                    <p className="text-lg font-bold">{summary.most_used_leave_type}</p>
                  </div>
                  <Icon icon="lucide:calendar-plus" className="text-3xl text-purple-200" />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4">
                <Select
                  placeholder="Select year"
                  selectedKeys={[yearFilter.toString()]}
                  onSelectionChange={(keys) => setYearFilter(parseInt(Array.from(keys)[0] as string))}
                  className="w-full md:w-32"
                >
                  <SelectItem key="2024" value="2024">2024</SelectItem>
                  <SelectItem key="2023" value="2023">2023</SelectItem>
                  <SelectItem key="2025" value="2025">2025</SelectItem>
                </Select>
                <Select
                  placeholder="Select month"
                  selectedKeys={[monthFilter.toString()]}
                  onSelectionChange={(keys) => setMonthFilter(parseInt(Array.from(keys)[0] as string))}
                  className="w-full md:w-40"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month.toString()} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by department"
                  selectedKeys={[departmentFilter]}
                  onSelectionChange={(keys) => setDepartmentFilter(Array.from(keys)[0] as string)}
                  className="w-full md:w-48"
                >
                  <SelectItem key="all" value="all">All Departments</SelectItem>
                  <SelectItem key="hr" value="hr">Human Resources</SelectItem>
                  <SelectItem key="it" value="it">Information Technology</SelectItem>
                  <SelectItem key="finance" value="finance">Finance</SelectItem>
                  <SelectItem key="marketing" value="marketing">Marketing</SelectItem>
                </Select>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Reports Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardBody>
              <Tabs
                selectedKey={reportType}
                onSelectionChange={(key) => setReportType(key as string)}
                className="w-full"
              >
                <Tab key="employee" title="Employee Reports">
                  <div className="mt-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="lg" color="primary" />
                      </div>
                    ) : (
                      <>
                        <Table aria-label="Employee leave reports table">
                          <TableHeader>
                            <TableColumn>EMPLOYEE</TableColumn>
                            <TableColumn>DEPARTMENT</TableColumn>
                            <TableColumn>LEAVE TYPE</TableColumn>
                            <TableColumn>APPLICATIONS</TableColumn>
                            <TableColumn>DAYS APPLIED</TableColumn>
                            <TableColumn>DAYS APPROVED</TableColumn>
                            <TableColumn>DAYS REJECTED</TableColumn>
                            <TableColumn>UTILIZATION</TableColumn>
                            <TableColumn>BALANCE</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {paginatedReports.map((report) => (
                              <TableRow key={report.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-semibold">{report.employee_name}</p>
                                    <p className="text-sm text-gray-500">{report.employee_email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{report.department_name}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">{report.leave_type_name}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">{report.total_applications}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">{report.total_days_applied}</span>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                  >
                                    {report.total_days_approved}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                  >
                                    {report.total_days_rejected}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={report.utilization_percentage}
                                      color={getUtilizationColor(report.utilization_percentage)}
                                      className="w-16"
                                      size="sm"
                                    />
                                    <span className="text-xs text-gray-500">
                                      {report.utilization_percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">{report.remaining_balance}</span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {pages > 1 && (
                          <div className="flex justify-center mt-4">
                            <Pagination
                              total={pages}
                              page={page}
                              onChange={setPage}
                              showControls
                              showShadow
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Tab>

                <Tab key="department" title="Department Reports">
                  <div className="mt-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="lg" color="primary" />
                      </div>
                    ) : (
                      <Table aria-label="Department leave reports table">
                        <TableHeader>
                          <TableColumn>DEPARTMENT</TableColumn>
                          <TableColumn>EMPLOYEES</TableColumn>
                          <TableColumn>APPLICATIONS</TableColumn>
                          <TableColumn>DAYS APPLIED</TableColumn>
                          <TableColumn>DAYS APPROVED</TableColumn>
                          <TableColumn>UTILIZATION</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {departmentReports.map((report) => (
                            <TableRow key={report.department_id}>
                              <TableCell>
                                <span className="font-semibold">{report.department_name}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{report.total_employees}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{report.total_applications}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{report.total_days_applied}</span>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                >
                                  {report.total_days_approved}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={report.utilization_percentage}
                                    color={getUtilizationColor(report.utilization_percentage)}
                                    className="w-16"
                                    size="sm"
                                  />
                                  <span className="text-xs text-gray-500">
                                    {report.utilization_percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
