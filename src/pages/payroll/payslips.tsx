import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
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
import PageLayout, { PageHeader } from "../../components/layout/PageLayout";
import { useAuthenticatedAPI } from "../../hooks/useAuthenticatedAPI";

interface Payslip {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  department: string;
  designation: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid' | 'cancelled';
  payment_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export default function PayslipsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);
  
  const rowsPerPage = 10;

  // Fetch payslips
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { apiRequest } = useAuthenticatedAPI();
  
  const fetchPayslips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/v1/payroll/payslips');
      if (response.success) {
        setPayslips(response.data || []);
      } else {
        setError('Failed to fetch payslips');
      }
    } catch (err) {
      setError('Error fetching payslips');
      console.error('Error fetching payslips:', err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);
  
  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // Filter payslips
  const filteredPayslips = useMemo(() => {
    return payslips.filter(payslip => {
      const matchesSearch = 
        payslip.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payslip.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payslip.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || payslip.status === selectedStatus;
      
      const payMonth = new Date(payslip.pay_period_start).getMonth() + 1;
      const matchesMonth = selectedMonth === "all" || payMonth.toString() === selectedMonth;
      
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payslips, searchQuery, selectedStatus, selectedMonth]);

  // Paginate filtered data
  const paginatedPayslips = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredPayslips.slice(startIndex, endIndex);
  }, [filteredPayslips, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = payslips.length;
    const draft = payslips.filter(p => p.status === 'draft').length;
    const approved = payslips.filter(p => p.status === 'approved').length;
    const paid = payslips.filter(p => p.status === 'paid').length;
    const totalNetSalary = payslips.reduce((sum, p) => sum + p.net_salary, 0);
    
    return { total, draft, approved, paid, totalNetSalary };
  }, [payslips]);

  const handleViewPayslip = (payslip: Payslip) => {
    setViewingPayslip(payslip);
    onOpen();
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/payroll/payslips/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchPayslips();
      } else {
        console.error('Failed to approve payslip');
      }
    } catch (error) {
      console.error('Error approving payslip:', error);
    }
  };

  const handlePay = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/payroll/payslips/${id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'bank_transfer'
        })
      });

      if (response.ok) {
        await fetchPayslips();
      } else {
        console.error('Failed to mark payslip as paid');
      }
    } catch (error) {
      console.error('Error marking payslip as paid:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'approved': return 'warning';
      case 'paid': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return 'lucide:file-text';
      case 'approved': return 'lucide:check-circle';
      case 'paid': return 'lucide:banknote';
      case 'cancelled': return 'lucide:x-circle';
      default: return 'lucide:file-text';
    }
  };

  const monthOptions = [
    { key: "all", label: "All Months" },
    { key: "1", label: "January" },
    { key: "2", label: "February" },
    { key: "3", label: "March" },
    { key: "4", label: "April" },
    { key: "5", label: "May" },
    { key: "6", label: "June" },
    { key: "7", label: "July" },
    { key: "8", label: "August" },
    { key: "9", label: "September" },
    { key: "10", label: "October" },
    { key: "11", label: "November" },
    { key: "12", label: "December" }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Payslips"
        description="Manage employee payslips and payment processing"
        icon="lucide:receipt"
        iconColor="from-secondary-500 to-pink-600"
        actions={
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={() => {/* TODO: Implement generate payslips */}}
          >
            Generate Payslips
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Icon icon="lucide:file-text" className="text-primary-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Total Payslips</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-content2 rounded-xl">
              <Icon icon="lucide:file-text" className="text-default-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Draft</p>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Icon icon="lucide:check-circle" className="text-warning-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Approved</p>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-success-100 rounded-xl">
              <Icon icon="lucide:banknote" className="text-success-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Paid</p>
              <p className="text-2xl font-bold text-foreground">{stats.paid}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-secondary-100 rounded-xl">
              <Icon icon="lucide:dollar-sign" className="text-secondary-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Total Paid</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalNetSalary)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search payslips..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="max-w-sm"
            />
            <Select
              placeholder="Filter by status"
              selectedKeys={[selectedStatus]}
              onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
              className="max-w-xs"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="draft">Draft</SelectItem>
              <SelectItem key="approved">Approved</SelectItem>
              <SelectItem key="paid">Paid</SelectItem>
              <SelectItem key="cancelled">Cancelled</SelectItem>
            </Select>
            <Select
              placeholder="Filter by month"
              selectedKeys={[selectedMonth]}
              onSelectionChange={(keys) => setSelectedMonth(Array.from(keys)[0] as string)}
              className="max-w-xs"
            >
              {monthOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Payslips</h3>
            <p className="text-sm text-default-500">
              {filteredPayslips.length} of {payslips.length} payslips
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Icon icon="lucide:loader-2" className="text-2xl animate-spin text-default-400" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-danger">Error loading payslips</p>
            </div>
          ) : (
            <Table aria-label="Payslips table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>PAY PERIOD</TableColumn>
                <TableColumn>GROSS SALARY</TableColumn>
                <TableColumn>DEDUCTIONS</TableColumn>
                <TableColumn>NET SALARY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No payslips found">
                {paginatedPayslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Icon icon="lucide:user" className="text-primary-600 text-lg" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{payslip.employee_name}</p>
                          <p className="text-sm text-default-500">{payslip.employee_code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">
                          {new Date(payslip.pay_period_start).toLocaleDateString()} - {new Date(payslip.pay_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{formatCurrency(payslip.gross_salary)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-danger-600">{formatCurrency(payslip.total_deductions)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-success-600">{formatCurrency(payslip.net_salary)}</p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(payslip.status)}
                        variant="flat"
                        size="sm"
                        startContent={<Icon icon={getStatusIcon(payslip.status)} className="text-xs" />}
                      >
                        {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant="light" size="sm">
                            <Icon icon="lucide:more-vertical" className="text-default-400" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => handleViewPayslip(payslip)}
                          >
                            View
                          </DropdownItem>
                          {payslip.status === 'draft' && (
                            <DropdownItem
                              key="approve"
                              startContent={<Icon icon="lucide:check" />}
                              onPress={() => handleApprove(payslip.id)}
                            >
                              Approve
                            </DropdownItem>
                          )}
                          {payslip.status === 'approved' && (
                            <DropdownItem
                              key="pay"
                              startContent={<Icon icon="lucide:banknote" />}
                              onPress={() => handlePay(payslip.id)}
                            >
                              Mark as Paid
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* View Payslip Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-semibold">
                  Payslip - {viewingPayslip?.employee_name}
                </h3>
              </ModalHeader>
              <ModalBody>
                {viewingPayslip && (
                  <div className="space-y-6">
                    {/* Employee Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-default-700 mb-2">Employee Information</h4>
                        <div className="space-y-1">
                          <p><span className="font-medium">Name:</span> {viewingPayslip.employee_name}</p>
                          <p><span className="font-medium">Code:</span> {viewingPayslip.employee_code}</p>
                          <p><span className="font-medium">Department:</span> {viewingPayslip.department}</p>
                          <p><span className="font-medium">Designation:</span> {viewingPayslip.designation}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-default-700 mb-2">Pay Period</h4>
                        <div className="space-y-1">
                          <p><span className="font-medium">From:</span> {new Date(viewingPayslip.pay_period_start).toLocaleDateString()}</p>
                          <p><span className="font-medium">To:</span> {new Date(viewingPayslip.pay_period_end).toLocaleDateString()}</p>
                          <p><span className="font-medium">Status:</span> 
                            <Chip
                              color={getStatusColor(viewingPayslip.status)}
                              variant="flat"
                              size="sm"
                              className="ml-2"
                            >
                              {viewingPayslip.status.charAt(0).toUpperCase() + viewingPayslip.status.slice(1)}
                            </Chip>
                          </p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Salary Breakdown */}
                    <div>
                      <h4 className="font-semibold text-default-700 mb-4">Salary Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Basic Salary:</span>
                          <span>{formatCurrency(viewingPayslip.basic_salary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Salary:</span>
                          <span className="font-medium">{formatCurrency(viewingPayslip.gross_salary)}</span>
                        </div>
                        <div className="flex justify-between text-danger-600">
                          <span>Total Deductions:</span>
                          <span>-{formatCurrency(viewingPayslip.total_deductions)}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-lg font-bold text-success-600">
                          <span>Net Salary:</span>
                          <span>{formatCurrency(viewingPayslip.net_salary)}</span>
                        </div>
                      </div>
                    </div>

                    {viewingPayslip.payment_date && (
                      <>
                        <Divider />
                        <div>
                          <h4 className="font-semibold text-default-700 mb-2">Payment Information</h4>
                          <div className="space-y-1">
                            <p><span className="font-medium">Payment Date:</span> {new Date(viewingPayslip.payment_date).toLocaleDateString()}</p>
                            <p><span className="font-medium">Payment Method:</span> {viewingPayslip.payment_method}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  startContent={<Icon icon="lucide:download" />}
                  onPress={() => {/* TODO: Implement PDF download */}}
                >
                  Download PDF
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageLayout>
  );
}
