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
  Progress,
  Tabs,
  Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import PageLayout, { PageHeader } from "../../components/layout/PageLayout";
import { apiRequest } from "../../services/api-service";

interface LeaveReport {
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department_name: string | null;
  leave_type_name: string;
  total_applications: number;
  total_days_applied: string | number;
  total_days_approved: string | number;
  total_days_rejected: string | number;
  total_days_pending: string | number;
  utilization_percentage: string | number;
  remaining_balance: string | number;
}

interface LeaveSummary {
  total_employees: number;
  total_applications: number;
  total_days_applied: string | number;
  total_days_approved: string | number;
  total_days_rejected: string | number;
  total_days_pending: string | number;
  average_utilization: string | number;
  most_used_leave_type: string;
  least_used_leave_type: string;
}

interface DepartmentReport {
  department_id: number;
  department_name: string;
  total_employees: number;
  total_applications: number;
  total_days_applied: string | number;
  total_days_approved: string | number;
  utilization_percentage: string | number;
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
        apiRequest(`GET`, `/leave/reports?year=${yearFilter}&month=${monthFilter}&department=${departmentFilter}`),
        apiRequest(`GET`, `/leave/reports/summary?year=${yearFilter}&month=${monthFilter}`),
        apiRequest(`GET`, `/leave/reports/departments?year=${yearFilter}&month=${monthFilter}`)
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
      report.department_name || 'N/A',
      report.leave_type_name,
      report.total_applications,
      report.total_days_applied,
      report.total_days_approved,
      report.total_days_rejected,
      report.total_days_pending,
      parseFloat(report.utilization_percentage.toString()).toFixed(1),
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

  const getUtilizationColor = (percentage: number | string): "danger" | "warning" | "success" => {
    const numPercentage = parseFloat(percentage.toString());
    if (numPercentage >= 90) return "danger";
    if (numPercentage >= 70) return "warning";
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
    <PageLayout>
      <PageHeader
        title="Leave Reports"
        description="Comprehensive leave analytics and insights"
        icon="lucide:bar-chart-3"
        actions={
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
        }
      />

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-foreground">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-100 text-sm">Total Applications</p>
                    <p className="text-2xl font-bold">{summary.total_applications}</p>
                  </div>
                  <Icon icon="lucide:file-text" className="text-3xl text-primary-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-success-500 to-success-600 text-foreground">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-success-100 text-sm">Days Approved</p>
                    <p className="text-2xl font-bold">{summary.total_days_approved}</p>
                  </div>
                  <Icon icon="lucide:check-circle" className="text-3xl text-success-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-foreground">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-warning-100 text-sm">Average Utilization</p>
                    <p className="text-2xl font-bold">{parseFloat(summary.average_utilization.toString()).toFixed(1)}%</p>
                  </div>
                  <Icon icon="lucide:trending-up" className="text-3xl text-warning-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-foreground">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-100 text-sm">Most Used Type</p>
                    <p className="text-lg font-bold">{summary.most_used_leave_type}</p>
                  </div>
                  <Icon icon="lucide:calendar-plus" className="text-3xl text-secondary-200" />
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
                  <SelectItem key="2024">2024</SelectItem>
                  <SelectItem key="2023">2023</SelectItem>
                  <SelectItem key="2025">2025</SelectItem>
                </Select>
                <Select
                  placeholder="Select month"
                  selectedKeys={[monthFilter.toString()]}
                  onSelectionChange={(keys) => setMonthFilter(parseInt(Array.from(keys)[0] as string))}
                  className="w-full md:w-40"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month.toString()}>
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
                  <SelectItem key="all">All Departments</SelectItem>
                  <SelectItem key="hr">Human Resources</SelectItem>
                  <SelectItem key="it">Information Technology</SelectItem>
                  <SelectItem key="finance">Finance</SelectItem>
                  <SelectItem key="marketing">Marketing</SelectItem>
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
                            {paginatedReports.map((report, index) => (
                              <TableRow key={`${report.employee_id}-${report.leave_type_name}-${index}`}>
                                <TableCell>
                                  <div>
                                    <p className="font-semibold">{report.employee_name}</p>
                                    <p className="text-sm text-default-500">{report.employee_email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{report.department_name || 'N/A'}</span>
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
                                      
                                      color={getUtilizationColor(report.utilization_percentage) as any}
                                      className="w-16"
                                      size="sm"
                                    />
                                    <span className="text-xs text-default-500">
                                      {parseFloat(report.utilization_percentage.toString()).toFixed(1)}%
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
                                    
                                    color={getUtilizationColor(report.utilization_percentage) as any}
                                    className="w-16"
                                    size="sm"
                                  />
                                  <span className="text-xs text-default-500">
                                    {parseFloat(report.utilization_percentage.toString()).toFixed(1)}%
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
    </PageLayout>
  );
}
