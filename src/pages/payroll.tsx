import React, { useState, useMemo } from "react";
    import { 
      Card, 
      CardBody, 
      CardHeader,
      CardFooter,
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
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      useDisclosure,
  Select,
  SelectItem,
  DatePicker,
  Divider
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { PayrollHeroSection } from "../components/common/HeroSection";

// Enhanced payroll interface
interface PayrollRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    loan: number;
    other: number;
  };
  overtime: number;
  bonus: number;
  netSalary: number;
  status: "paid" | "pending" | "processing" | "failed";
  paymentDate: string | null;
  paymentMethod: "bank_transfer" | "cash" | "check";
  avatar: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
}
    
    // Sample payroll data
const payrollData: PayrollRecord[] = [
      { 
        id: 1, 
        employeeId: "EMP001", 
        employeeName: "Tony Reichert", 
        designation: "CEO",
    department: "Executive",
    month: "January",
    year: "2025",
        basicSalary: 10000,
    allowances: {
      housing: 2000,
      transport: 800,
      medical: 500,
      other: 200
    },
    deductions: {
      tax: 1200,
      insurance: 300,
      loan: 500,
      other: 100
    },
    overtime: 0,
    bonus: 1000,
        netSalary: 10800,
        status: "paid",
    paymentDate: "2025-01-30",
    paymentMethod: "bank_transfer",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    bankDetails: {
      accountNumber: "****1234",
      bankName: "Chase Bank",
      routingNumber: "021000021"
    }
      },
      { 
        id: 2, 
        employeeId: "EMP002", 
        employeeName: "Zoey Lang", 
        designation: "Tech Lead",
    department: "IT",
    month: "January",
    year: "2025",
    basicSalary: 8000,
    allowances: {
      housing: 1500,
      transport: 600,
      medical: 400,
      other: 150
    },
    deductions: {
      tax: 960,
      insurance: 240,
      loan: 300,
      other: 80
    },
    overtime: 200,
    bonus: 500,
    netSalary: 8170,
    status: "pending",
    paymentDate: null,
    paymentMethod: "bank_transfer",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    bankDetails: {
      accountNumber: "****5678",
      bankName: "Wells Fargo",
      routingNumber: "121000248"
    }
      },
      { 
        id: 3, 
        employeeId: "EMP003", 
        employeeName: "Jane Doe", 
        designation: "Designer",
    department: "Marketing",
    month: "January",
    year: "2025",
        basicSalary: 6000,
    allowances: {
      housing: 1200,
      transport: 500,
      medical: 300,
      other: 100
    },
    deductions: {
      tax: 720,
      insurance: 180,
      loan: 200,
      other: 50
    },
    overtime: 150,
    bonus: 300,
    netSalary: 6100,
    status: "processing",
        paymentDate: null,
    paymentMethod: "bank_transfer",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    bankDetails: {
      accountNumber: "****9012",
      bankName: "Bank of America",
      routingNumber: "026009593"
    }
      },
      { 
        id: 4, 
        employeeId: "EMP004", 
        employeeName: "William Smith", 
    designation: "Accountant",
    department: "Finance",
    month: "January",
    year: "2025",
        basicSalary: 7000,
    allowances: {
      housing: 1400,
      transport: 550,
      medical: 350,
      other: 120
    },
    deductions: {
      tax: 840,
      insurance: 210,
      loan: 250,
      other: 60
    },
    overtime: 100,
    bonus: 400,
    netSalary: 7220,
        status: "paid",
    paymentDate: "2025-01-30",
    paymentMethod: "bank_transfer",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
    bankDetails: {
      accountNumber: "****3456",
      bankName: "Citibank",
      routingNumber: "021000089"
    }
      },
      { 
        id: 5, 
        employeeId: "EMP005", 
        employeeName: "Emma Wilson", 
    designation: "HR Manager",
    department: "HR",
    month: "January",
    year: "2025",
    basicSalary: 7500,
    allowances: {
      housing: 1500,
      transport: 600,
      medical: 400,
      other: 150
    },
    deductions: {
      tax: 900,
      insurance: 225,
      loan: 300,
      other: 75
    },
    overtime: 0,
    bonus: 600,
    netSalary: 7650,
    status: "failed",
    paymentDate: null,
    paymentMethod: "bank_transfer",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
    bankDetails: {
      accountNumber: "****7890",
      bankName: "PNC Bank",
      routingNumber: "031000053"
    }
  }
    ];
    
    const statusColorMap = {
      paid: "success",
      pending: "warning",
      processing: "primary",
      failed: "danger",
    };

const paymentMethods = [
  { key: "bank_transfer", label: "Bank Transfer", icon: "lucide:credit-card" },
  { key: "cash", label: "Cash", icon: "lucide:banknote" },
  { key: "check", label: "Check", icon: "lucide:file-text" }
];
    
    export default function Payroll() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onOpenChange: onPaymentOpenChange } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [payrollList, setPayrollList] = useState(payrollData);
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  
  const rowsPerPage = 10;
  
  // Filter payroll data
  const filteredPayroll = useMemo(() => {
    return payrollList.filter(payroll => {
          const matchesSearch = 
            payroll.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payroll.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payroll.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payroll.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || payroll.status === selectedStatus;
      const matchesMonth = selectedMonth === "all" || payroll.month === selectedMonth;
      
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payrollList, searchQuery, selectedStatus, selectedMonth]);
  
  // Paginate filtered data
  const paginatedPayroll = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredPayroll.slice(startIndex, endIndex);
  }, [filteredPayroll, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = payrollList.length;
    const paid = payrollList.filter(p => p.status === "paid").length;
    const pending = payrollList.filter(p => p.status === "pending").length;
    const processing = payrollList.filter(p => p.status === "processing").length;
    const failed = payrollList.filter(p => p.status === "failed").length;
    const totalAmount = payrollList.reduce((sum, p) => sum + p.netSalary, 0);
    
    return { total, paid, pending, processing, failed, totalAmount };
  }, [payrollList]);

  // Get unique months and statuses
  const months = useMemo(() => {
    return ["all", ...new Set(payrollList.map(p => p.month))];
  }, [payrollList]);

  const statuses = useMemo(() => {
    return ["all", ...new Set(payrollList.map(p => p.status))];
  }, [payrollList]);
  
  const handleViewPayslip = (payroll: PayrollRecord) => {
        setSelectedPayroll(payroll);
        onOpen();
      };
      
  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    try {
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPayrollList(prev => 
        prev.map(payroll => 
          payroll.status === "pending" 
            ? { ...payroll, status: "processing" as const }
            : payroll
        )
      );
      
        addToast({
          title: "Payroll Processed",
          description: "Payroll has been processed successfully",
          color: "success",
        });
    } catch (error) {
      addToast({
        title: "Processing Failed",
        description: "Failed to process payroll",
        color: "danger",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayEmployee = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll);
    onPaymentOpen();
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayroll) return;
    
    setIsPaying(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPayrollList(prev => 
        prev.map(payroll => 
          payroll.id === selectedPayroll.id 
            ? { 
                ...payroll, 
                status: "paid" as const,
                paymentDate: new Date().toISOString().split('T')[0]
              }
            : payroll
        )
      );
      
      addToast({
        title: "Payment Successful",
        description: `Payment of $${selectedPayroll.netSalary.toLocaleString()} has been processed for ${selectedPayroll.employeeName}`,
        color: "success",
      });
      
      onPaymentOpenChange();
    } catch (error) {
      addToast({
        title: "Payment Failed",
        description: "Failed to process payment",
        color: "danger",
      });
    } finally {
      setIsPaying(false);
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredPayroll);
      downloadFile(csvContent, `payroll-report-${selectedMonth}-${new Date().getFullYear()}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Payroll report has been exported to CSV.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export payroll report.",
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
      const pdfContent = generatePDF(filteredPayroll);
      downloadFile(pdfContent, `payroll-report-${selectedMonth}-${new Date().getFullYear()}.pdf`, 'application/pdf');
      addToast({
        title: "Export Successful",
        description: "Payroll report has been exported to PDF.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export payroll report.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate CSV content
  const generateCSV = (records: PayrollRecord[]) => {
    const headers = [
      'Employee ID', 'Employee Name', 'Department', 'Designation', 'Month', 'Year',
      'Basic Salary', 'Total Allowances', 'Total Deductions', 'Overtime', 'Bonus', 
      'Net Salary', 'Status', 'Payment Date', 'Payment Method'
    ];
    
    const rows = records.map(record => [
      record.employeeId,
      record.employeeName,
      record.department,
      record.designation,
      record.month,
      record.year,
      record.basicSalary,
      Object.values(record.allowances).reduce((sum, val) => sum + val, 0),
      Object.values(record.deductions).reduce((sum, val) => sum + val, 0),
      record.overtime,
      record.bonus,
      record.netSalary,
      record.status,
      record.paymentDate || 'N/A',
      record.paymentMethod
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Generate PDF content (simplified)
  const generatePDF = (records: PayrollRecord[]) => {
    const htmlContent = `
      <html>
        <head>
          <title>Payroll Report - ${selectedMonth} ${new Date().getFullYear()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payroll Report</h1>
            <p>Month: ${selectedMonth} ${new Date().getFullYear()}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Employees: ${records.length}</p>
            <p>Total Amount: $${records.reduce((sum, r) => sum + r.netSalary, 0).toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(record => `
                <tr>
                  <td>${record.employeeName}</td>
                  <td>${record.department}</td>
                  <td>$${record.basicSalary.toLocaleString()}</td>
                  <td>$${Object.values(record.allowances).reduce((sum, val) => sum + val, 0).toLocaleString()}</td>
                  <td>$${Object.values(record.deductions).reduce((sum, val) => sum + val, 0).toLocaleString()}</td>
                  <td>$${record.netSalary.toLocaleString()}</td>
                  <td>${record.status}</td>
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
  
  const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      };
      
      return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <PayrollHeroSection
          title="Payroll Management"
          subtitle="Salary Processing & Payments"
          description="Manage employee salaries, process payments, and generate comprehensive payroll reports. Streamline your payroll operations with automated calculations and secure payment processing."
          actions={[
            {
              label: "Process Payroll",
              icon: "lucide:credit-card",
              onPress: handleProcessPayroll,
              isLoading: isProcessing
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
        >
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
                    <Icon icon="lucide:check-circle" className="text-2xl text-success" />
                  </div>
                  <div>
                    <p className="text-default-500">Paid</p>
                  <h3 className="text-2xl font-bold">{stats.paid}</h3>
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
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon icon="lucide:loader" className="text-2xl text-primary" />
                  </div>
                  <div>
                  <p className="text-default-500">Processing</p>
                  <h3 className="text-2xl font-bold">{stats.processing}</h3>
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
                  <p className="text-default-500">Failed</p>
                  <h3 className="text-2xl font-bold">{stats.failed}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-success-100">
                  <Icon icon="lucide:dollar-sign" className="text-2xl text-success-600" />
                  </div>
                  <div>
                  <p className="text-default-500">Total Amount</p>
                  <h3 className="text-lg font-bold">{formatCurrency(stats.totalAmount)}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
        </motion.div>
          
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search employees..."
                
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
              />
              <Select
                label="Month"
                placeholder="All Months"
                selectedKeys={[selectedMonth]}
                onSelectionChange={(keys) => setSelectedMonth(Array.from(keys)[0] as string)}
                items={months.map(month => ({ key: month, label: month }))}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                label="Status"
                placeholder="All Status"
                    selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                items={statuses.map(status => ({ key: status, label: status }))}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-default-600">
                  Showing {filteredPayroll.length} of {payrollList.length} records
              </div>
                  </div>
            </div>
          </CardBody>
          </Card>
        </motion.div>

        {/* Payroll Table */}
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
                <p className="text-default-500 text-sm">Click on actions to view payslip or process payment</p>
              </div>
              </div>
            </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Payroll table">
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>PERIOD</TableColumn>
                  <TableColumn>BASIC SALARY</TableColumn>
                  <TableColumn>ALLOWANCES</TableColumn>
                  <TableColumn>DEDUCTIONS</TableColumn>
                  <TableColumn>NET SALARY</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
              <TableBody>
                {paginatedPayroll.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar src={payroll.avatar} size="sm" />
                          <div>
                          <p className="font-medium text-foreground">{payroll.employeeName}</p>
                          <p className="text-sm text-default-500">{payroll.employeeId}</p>
                          <p className="text-xs text-default-400">{payroll.department}</p>
                          </div>
                        </div>
                      </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{payroll.month} {payroll.year}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{formatCurrency(payroll.basicSalary)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {formatCurrency(Object.values(payroll.allowances).reduce((sum, val) => sum + val, 0))}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {formatCurrency(Object.values(payroll.deductions).reduce((sum, val) => sum + val, 0))}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-foreground">{formatCurrency(payroll.netSalary)}</p>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                        color={statusColorMap[payroll.status] as any}
                          variant="flat"
                        >
                          {payroll.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light" aria-label="Payroll actions">
                            <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => handleViewPayslip(payroll)}
                          >
                            View Payslip
                          </DropdownItem>
                          {(payroll.status === "pending" || payroll.status === "processing") && (
                            <DropdownItem
                              key="pay"
                              startContent={<Icon icon="lucide:credit-card" />}
                              onPress={() => handlePayEmployee(payroll)}
                            >
                              Process Payment
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            
            {filteredPayroll.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredPayroll.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
            </CardBody>
          </Card>
        </motion.div>
          
          {/* Payslip Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:file-text" className="text-success-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">
                    Payslip - {selectedPayroll?.month} {selectedPayroll?.year}
                      </h3>
                      <p className="text-sm text-default-500">Employee salary breakdown</p>
                    </div>
                  </div>
                  </ModalHeader>
                  <ModalBody>
                    {selectedPayroll && (
                      <div className="space-y-6">
                      {/* Header */}
                      <div className="flex justify-between items-start p-4 bg-content1 rounded-lg">
                          <div>
                          <h4 className="text-lg font-semibold text-foreground">Payslip Details</h4>
                            <p className="text-sm">Payslip #: PS-{selectedPayroll.id.toString().padStart(4, '0')}</p>
                            <p className="text-sm">Date: {selectedPayroll.paymentDate || 'Pending'}</p>
                          </div>
                        <div className="text-right">
                          <Avatar src={selectedPayroll.avatar} size="lg" />
                          </div>
                        </div>
                        
                      {/* Employee Info */}
                      <div className="p-4 border border-default-300 rounded-lg">
                        <h5 className="font-semibold text-foreground mb-3">Employee Information</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <span className="text-default-500 text-sm">Name:</span>
                            <p className="font-medium">{selectedPayroll.employeeName}</p>
                            </div>
                          <div>
                            <span className="text-default-500 text-sm">Employee ID:</span>
                            <p className="font-medium">{selectedPayroll.employeeId}</p>
                          </div>
                          <div>
                            <span className="text-default-500 text-sm">Department:</span>
                            <p className="font-medium">{selectedPayroll.department}</p>
                        </div>
                          <div>
                            <span className="text-default-500 text-sm">Designation:</span>
                            <p className="font-medium">{selectedPayroll.designation}</p>
                            </div>
                          </div>
                        </div>
                        
                      {/* Salary Breakdown */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Earnings */}
                        <div className="p-4 border border-default-300 rounded-lg">
                          <h5 className="font-semibold text-foreground mb-3">Earnings</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Basic Salary</span>
                                <span>{formatCurrency(selectedPayroll.basicSalary)}</span>
                              </div>
                              <div className="flex justify-between">
                              <span>Housing Allowance</span>
                              <span>{formatCurrency(selectedPayroll.allowances.housing)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Transport Allowance</span>
                              <span>{formatCurrency(selectedPayroll.allowances.transport)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Medical Allowance</span>
                              <span>{formatCurrency(selectedPayroll.allowances.medical)}</span>
                              </div>
                            <div className="flex justify-between">
                              <span>Other Allowances</span>
                              <span>{formatCurrency(selectedPayroll.allowances.other)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Overtime</span>
                              <span>{formatCurrency(selectedPayroll.overtime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bonus</span>
                              <span>{formatCurrency(selectedPayroll.bonus)}</span>
                              </div>
                            <Divider />
                            <div className="flex justify-between font-semibold">
                                <span>Total Earnings</span>
                              <span>{formatCurrency(selectedPayroll.basicSalary + Object.values(selectedPayroll.allowances).reduce((sum, val) => sum + val, 0) + selectedPayroll.overtime + selectedPayroll.bonus)}</span>
                              </div>
                            </div>
                          </div>
                          
                        {/* Deductions */}
                        <div className="p-4 border border-default-300 rounded-lg">
                          <h5 className="font-semibold text-foreground mb-3">Deductions</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Income Tax</span>
                              <span>{formatCurrency(selectedPayroll.deductions.tax)}</span>
                              </div>
                              <div className="flex justify-between">
                              <span>Insurance</span>
                              <span>{formatCurrency(selectedPayroll.deductions.insurance)}</span>
                              </div>
                              <div className="flex justify-between">
                              <span>Loan Deduction</span>
                              <span>{formatCurrency(selectedPayroll.deductions.loan)}</span>
                              </div>
                              <div className="flex justify-between">
                              <span>Other Deductions</span>
                              <span>{formatCurrency(selectedPayroll.deductions.other)}</span>
                              </div>
                            <Divider />
                            <div className="flex justify-between font-semibold">
                                <span>Total Deductions</span>
                              <span>{formatCurrency(Object.values(selectedPayroll.deductions).reduce((sum, val) => sum + val, 0))}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                      {/* Net Salary */}
                      <div className="p-4 bg-success-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-foreground">Net Salary</span>
                          <span className="text-2xl font-bold text-success-600">{formatCurrency(selectedPayroll.netSalary)}</span>
                          </div>
                        </div>
                        
                      {/* Payment Info */}
                      {selectedPayroll.paymentDate && (
                        <div className="p-4 border border-default-300 rounded-lg">
                          <h5 className="font-semibold text-foreground mb-3">Payment Information</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-default-500 text-sm">Payment Date:</span>
                              <p className="font-medium">{new Date(selectedPayroll.paymentDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-default-500 text-sm">Payment Method:</span>
                              <p className="font-medium">{paymentMethods.find(m => m.key === selectedPayroll.paymentMethod)?.label}</p>
                            </div>
                            {selectedPayroll.bankDetails && (
                              <>
                                <div>
                                  <span className="text-default-500 text-sm">Bank:</span>
                                  <p className="font-medium">{selectedPayroll.bankDetails.bankName}</p>
                                </div>
                                <div>
                                  <span className="text-default-500 text-sm">Account:</span>
                                  <p className="font-medium">{selectedPayroll.bankDetails.accountNumber}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      </div>
                    )}
                  </ModalBody>
                  <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                      Close
                    </Button>
                    <Button 
                      color="primary" 
                      startContent={<Icon icon="lucide:download" />}
                    onPress={() => {
                      const pdfContent = generatePDF([selectedPayroll!]);
                      downloadFile(pdfContent, `payslip-${selectedPayroll!.employeeId}-${selectedPayroll!.month}-${selectedPayroll!.year}.pdf`, 'application/pdf');
                    }}
                    >
                      Download PDF
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>

        {/* Payment Confirmation Modal */}
        <Modal isOpen={isPaymentOpen} onOpenChange={onPaymentOpenChange} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:credit-card" className="text-success-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Confirm Payment</h3>
                      <p className="text-sm text-default-500">Process payment for employee</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedPayroll && (
                    <div className="space-y-4">
                      <div className="p-4 bg-content1 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar src={selectedPayroll.avatar} size="md" />
                          <div>
                            <h4 className="font-semibold text-foreground">{selectedPayroll.employeeName}</h4>
                            <p className="text-sm text-default-500">{selectedPayroll.employeeId} • {selectedPayroll.department}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-default-300 rounded-lg">
                        <h5 className="font-semibold text-foreground mb-3">Payment Details</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Period:</span>
                            <span>{selectedPayroll.month} {selectedPayroll.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span>{paymentMethods.find(m => m.key === selectedPayroll.paymentMethod)?.label}</span>
                          </div>
                          <Divider />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Amount to Pay:</span>
                            <span className="text-success-600">{formatCurrency(selectedPayroll.netSalary)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {selectedPayroll.bankDetails && (
                        <div className="p-4 border border-default-300 rounded-lg">
                          <h5 className="font-semibold text-foreground mb-3">Bank Details</h5>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-default-500">Bank:</span> {selectedPayroll.bankDetails.bankName}</p>
                            <p><span className="text-default-500">Account:</span> {selectedPayroll.bankDetails.accountNumber}</p>
                            <p><span className="text-default-500">Routing:</span> {selectedPayroll.bankDetails.routingNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={handleConfirmPayment}
                    isLoading={isPaying}
                    startContent={<Icon icon="lucide:credit-card" />}
                  >
                    Process Payment
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