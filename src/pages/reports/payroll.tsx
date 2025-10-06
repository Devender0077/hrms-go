import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import ReportHeader from "../../components/reports/ReportHeader";
import ReportStats from "../../components/reports/ReportStats";
import ReportFilters from "../../components/reports/ReportFilters";

// Payroll report data interface
interface PayrollReportRecord {
  id: number;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  payPeriod: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: "paid" | "pending" | "processing";
  paymentDate?: string;
  paymentMethod: string;
}

// Sample data
const payrollReportData: PayrollReportRecord[] = [
  {
    id: 1,
    employeeName: "John Doe",
    employeeId: "EMP001",
    department: "IT",
    position: "Senior Developer",
    payPeriod: "January 2025",
    basicSalary: 8000,
    allowances: 1000,
    overtime: 500,
    bonuses: 2000,
    deductions: 1200,
    netSalary: 10300,
    status: "paid",
    paymentDate: "2025-01-31",
    paymentMethod: "Bank Transfer"
  },
  {
    id: 2,
    employeeName: "Sarah Wilson",
    employeeId: "EMP002",
    department: "HR",
    position: "HR Manager",
    payPeriod: "January 2025",
    basicSalary: 7000,
    allowances: 800,
    overtime: 0,
    bonuses: 1500,
    deductions: 1050,
    netSalary: 8250,
    status: "paid",
    paymentDate: "2025-01-31",
    paymentMethod: "Bank Transfer"
  },
  {
    id: 3,
    employeeName: "David Brown",
    employeeId: "EMP003",
    department: "Finance",
    position: "Accountant",
    payPeriod: "January 2025",
    basicSalary: 6000,
    allowances: 600,
    overtime: 200,
    bonuses: 1000,
    deductions: 900,
    netSalary: 6900,
    status: "paid",
    paymentDate: "2025-01-31",
    paymentMethod: "Bank Transfer"
  },
  {
    id: 4,
    employeeName: "Emily Davis",
    employeeId: "EMP004",
    department: "Marketing",
    position: "Marketing Specialist",
    payPeriod: "January 2025",
    basicSalary: 5500,
    allowances: 500,
    overtime: 300,
    bonuses: 800,
    deductions: 825,
    netSalary: 6275,
    status: "pending",
    paymentMethod: "Bank Transfer"
  },
  {
    id: 5,
    employeeName: "Michael Chen",
    employeeId: "EMP005",
    department: "Operations",
    position: "Operations Manager",
    payPeriod: "January 2025",
    basicSalary: 7500,
    allowances: 900,
    overtime: 400,
    bonuses: 1800,
    deductions: 1125,
    netSalary: 9675,
    status: "processing",
    paymentMethod: "Bank Transfer"
  }
];

const departments = ["All", "IT", "HR", "Finance", "Marketing", "Operations"];
const payPeriods = ["All", "January 2025", "February 2025", "March 2025"];
const statuses = ["All", "paid", "pending", "processing"];

const statusColorMap = {
  paid: "success",
  pending: "warning",
  processing: "primary",
};

export default function PayrollReport() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rowsPerPage = 10;
  
  // Filter data
  const filteredData = useMemo(() => {
    return payrollReportData.filter(record => {
      const matchesSearch = 
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "All" || record.department === selectedDepartment;
      const matchesPayPeriod = selectedPayPeriod === "All" || record.payPeriod === selectedPayPeriod;
      const matchesStatus = selectedStatus === "All" || record.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesPayPeriod && matchesStatus;
    });
  }, [searchQuery, selectedDepartment, selectedPayPeriod, selectedStatus]);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = payrollReportData.length;
    const totalGrossSalary = payrollReportData.reduce((sum, record) => 
      sum + record.basicSalary + record.allowances + record.overtime + record.bonuses, 0);
    const totalDeductions = payrollReportData.reduce((sum, record) => sum + record.deductions, 0);
    const totalNetSalary = payrollReportData.reduce((sum, record) => sum + record.netSalary, 0);
    
    return [
      {
        label: "Total Employees",
        value: totalEmployees,
        icon: "lucide:users",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Total Gross Salary",
        value: `$${(totalGrossSalary / 1000).toFixed(0)}k`,
        icon: "lucide:dollar-sign",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Total Deductions",
        value: `$${(totalDeductions / 1000).toFixed(0)}k`,
        icon: "lucide:minus-circle",
        color: "text-danger-600",
        bgColor: "bg-danger-100"
      },
      {
        label: "Total Net Salary",
        value: `$${(totalNetSalary / 1000).toFixed(0)}k`,
        icon: "lucide:wallet",
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
        description: "Payroll report has been exported successfully.",
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
        description: "Payroll data has been refreshed successfully.",
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-info-500 via-info-600 to-cyan-600 p-6 sm:p-8 text-white mb-6"
        >
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 -left-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Text Content */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Icon icon="lucide:credit-card" className="text-white text-2xl" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    Payroll Report
                  </h1>
                </div>
                <p className="text-white/90 text-sm sm:text-base mb-6 max-w-lg">
                  Comprehensive payroll analysis and salary distribution. Track employee compensation, analyze trends, and generate detailed financial reports.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    color="default"
                    variant="solid"
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                    startContent={<Icon icon="lucide:download" className="w-4 h-4" />}
                    onPress={handleExport}
                    isLoading={isExporting}
                  >
                    Export Report
                  </Button>
                  <Button
                    color="default"
                    variant="bordered"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                    startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
                    onPress={handleRefresh}
                    isLoading={isRefreshing}
                  >
                    Refresh Data
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Illustration */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Main illustration container */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Report elements */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon icon="lucide:bar-chart" className="text-white text-xl" />
                      </div>
                      <div className="w-16 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon icon="lucide:pie-chart" className="text-white text-xl" />
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon icon="lucide:trending-up" className="text-white text-xl" />
                      </div>
                    </div>
                    
                    {/* Connection lines */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-0.5 bg-white/30"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <div className="w-8 h-0.5 bg-white/30"></div>
                    </div>
                    
                    {/* Bottom elements */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:file-text" className="text-white text-lg" />
                      </div>
                      <div className="w-14 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:calculator" className="text-white text-lg" />
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:download" className="text-white text-lg" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:sparkles" className="text-white text-xs" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:zap" className="text-white text-xs" />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 4) * 15}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ReportStats stats={stats} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                placeholder="Search..."
                
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {departments.map(dept => (
                  <option key={dept} >{dept}</option>
                ))}
              </select>
              <select
                
                onChange={(e) => setSelectedPayPeriod(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {payPeriods.map(period => (
                  <option key={period} >{period}</option>
                ))}
              </select>
              <select
                
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(status => (
                  <option key={status} >{status}</option>
                ))}
              </select>
              <div className="flex items-end">
                <div className="text-sm text-default-600">
                  Showing {filteredData.length} of {payrollReportData.length} records
                </div>
              </div>
            </div>
          </CardBody>
          </Card>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-success-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Payroll Records</h3>
                <p className="text-default-500 text-sm">Employee salary details and payment status</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Payroll report table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>PAY PERIOD</TableColumn>
                <TableColumn>BASIC SALARY</TableColumn>
                <TableColumn>ALLOWANCES</TableColumn>
                <TableColumn>OVERTIME</TableColumn>
                <TableColumn>BONUSES</TableColumn>
                <TableColumn>DEDUCTIONS</TableColumn>
                <TableColumn>NET SALARY</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{record.employeeName}</p>
                        <p className="text-sm text-default-500">{record.employeeId}</p>
                        <p className="text-sm text-default-500">{record.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {record.department}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{record.payPeriod}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:dollar-sign" className="w-4 h-4 text-primary" />
                        <span className="font-medium">${record.basicSalary.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:plus" className="w-4 h-4 text-success" />
                        <span className="font-medium text-success-600">${record.allowances.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:clock" className="w-4 h-4 text-warning" />
                        <span className="font-medium text-warning-600">${record.overtime.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:gift" className="w-4 h-4 text-secondary" />
                        <span className="font-medium text-secondary-600">${record.bonuses.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:minus" className="w-4 h-4 text-danger" />
                        <span className="font-medium text-danger-600">${record.deductions.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:wallet" className="w-4 h-4 text-success" />
                        <span className="font-bold text-success-600">${record.netSalary.toLocaleString()}</span>
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
        </motion.div>
      </div>
    </div>
  );
}
