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

interface EmployeeSalary {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  department: string;
  designation: string;
  basic_salary: number;
  effective_date: string;
  end_date?: string;
  payment_type: 'monthly' | 'weekly' | 'biweekly' | 'hourly';
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  department_id: number;
  designation_id: number;
  department_name: string;
  designation_name: string;
}

export default function EmployeeSalariesPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editingSalary, setEditingSalary] = useState<EmployeeSalary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    basic_salary: 0,
    effective_date: "",
    end_date: "",
    payment_type: "monthly" as 'monthly' | 'weekly' | 'biweekly' | 'hourly',
    bank_name: "",
    account_number: "",
    account_name: ""
  });

  const rowsPerPage = 10;

  // Fetch employee salaries
  const { data: employeeSalaries = [], loading, error, refetch } = useAuthenticatedAPI<EmployeeSalary[]>(
    '/api/v1/payroll/employee-salaries',
    'GET'
  );

  // Fetch employees for dropdown
  const { data: employees = [] } = useAuthenticatedAPI<Employee[]>(
    '/api/v1/employees',
    'GET'
  );

  // Filter employee salaries
  const filteredSalaries = useMemo(() => {
    return employeeSalaries.filter(salary => {
      const matchesSearch = 
        salary.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "all" || salary.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [employeeSalaries, searchQuery, selectedStatus]);

  // Paginate filtered data
  const paginatedSalaries = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredSalaries.slice(startIndex, endIndex);
  }, [filteredSalaries, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = employeeSalaries.length;
    const active = employeeSalaries.filter(s => s.status === 'active').length;
    const inactive = employeeSalaries.filter(s => s.status === 'inactive').length;
    const totalSalary = employeeSalaries.reduce((sum, s) => sum + s.basic_salary, 0);
    
    return { total, active, inactive, totalSalary };
  }, [employeeSalaries]);

  const handleAddNew = () => {
    setEditingSalary(null);
    setFormData({
      employee_id: "",
      basic_salary: 0,
      effective_date: "",
      end_date: "",
      payment_type: "monthly",
      bank_name: "",
      account_number: "",
      account_name: ""
    });
    onOpen();
  };

  const handleEdit = (salary: EmployeeSalary) => {
    setEditingSalary(salary);
    setFormData({
      employee_id: salary.employee_id.toString(),
      basic_salary: salary.basic_salary,
      effective_date: salary.effective_date,
      end_date: salary.end_date || "",
      payment_type: salary.payment_type,
      bank_name: salary.bank_name || "",
      account_number: salary.account_number || "",
      account_name: salary.account_name || ""
    });
    onOpen();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const url = editingSalary 
        ? `/api/v1/payroll/employee-salaries/${editingSalary.id}`
        : '/api/v1/payroll/employee-salaries';
      
      const method = editingSalary ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await refetch();
        onOpenChange();
        setFormData({
          employee_id: "",
          basic_salary: 0,
          effective_date: "",
          end_date: "",
          payment_type: "monthly",
          bank_name: "",
          account_number: "",
          account_name: ""
        });
      } else {
        console.error('Failed to save employee salary');
      }
    } catch (error) {
      console.error('Error saving employee salary:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee salary record?')) {
      try {
        const response = await fetch(`/api/v1/payroll/employee-salaries/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          await refetch();
        } else {
          console.error('Failed to delete employee salary');
        }
      } catch (error) {
        console.error('Error deleting employee salary:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'danger';
  };

  return (
    <PageLayout>
      <PageHeader
        title="Employee Salaries"
        description="Manage employee salary information and payment details"
        icon="lucide:banknote"
        iconColor="from-primary-500 to-secondary-500"
        actions={
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={handleAddNew}
          >
            Add Salary
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Icon icon="lucide:users" className="text-primary-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Total Employees</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-success-100 rounded-xl">
              <Icon icon="lucide:check-circle" className="text-success-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Active Salaries</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-danger-100 rounded-xl">
              <Icon icon="lucide:x-circle" className="text-danger-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Inactive Salaries</p>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-warning-100 rounded-xl">
              <Icon icon="lucide:dollar-sign" className="text-warning-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm text-default-600">Total Salary</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSalary)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search employees..."
              value={searchQuery}
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
              <SelectItem key="active">Active</SelectItem>
              <SelectItem key="inactive">Inactive</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Employee Salaries Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Employee Salaries</h3>
            <p className="text-sm text-default-500">
              {filteredSalaries.length} of {employeeSalaries.length} records
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
              <p className="text-danger">Error loading employee salaries</p>
            </div>
          ) : (
            <Table aria-label="Employee salaries table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>BASIC SALARY</TableColumn>
                <TableColumn>PAYMENT TYPE</TableColumn>
                <TableColumn>EFFECTIVE DATE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No employee salaries found">
                {paginatedSalaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Icon icon="lucide:user" className="text-primary-600 text-lg" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{salary.employee_name}</p>
                          <p className="text-sm text-default-500">{salary.employee_code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{salary.department}</p>
                        <p className="text-sm text-default-500">{salary.designation}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{formatCurrency(salary.basic_salary)}</p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color="primary"
                        variant="flat"
                        size="sm"
                      >
                        {salary.payment_type.charAt(0).toUpperCase() + salary.payment_type.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-default-600">
                        {new Date(salary.effective_date).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(salary.status)}
                        variant="flat"
                        size="sm"
                      >
                        {salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
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
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleEdit(salary)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash-2" />}
                            onPress={() => handleDelete(salary.id)}
                          >
                            Delete
                          </DropdownItem>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-semibold">
                  {editingSalary ? 'Edit Employee Salary' : 'Add New Employee Salary'}
                </h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Employee"
                    placeholder="Select employee"
                    selectedKeys={[formData.employee_id]}
                    onSelectionChange={(keys) => setFormData({ ...formData, employee_id: Array.from(keys)[0] as string })}
                    isRequired
                  >
                    {employees.map((employee) => (
                      <SelectItem key={employee.id.toString()}>
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Basic Salary"
                      type="number"
                      placeholder="Enter basic salary"
                      value={formData.basic_salary.toString()}
                      onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) || 0 })}
                      startContent={<span className="text-default-400">$</span>}
                      isRequired
                    />

                    <Select
                      label="Payment Type"
                      placeholder="Select payment type"
                      selectedKeys={[formData.payment_type]}
                      onSelectionChange={(keys) => setFormData({ ...formData, payment_type: Array.from(keys)[0] as 'monthly' | 'weekly' | 'biweekly' | 'hourly' })}
                      isRequired
                    >
                      <SelectItem key="monthly">Monthly</SelectItem>
                      <SelectItem key="weekly">Weekly</SelectItem>
                      <SelectItem key="biweekly">Bi-weekly</SelectItem>
                      <SelectItem key="hourly">Hourly</SelectItem>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Effective Date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                      isRequired
                    />

                    <Input
                      label="End Date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>

                  <Divider />

                  <h4 className="text-md font-semibold text-default-700">Bank Details</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Bank Name"
                      placeholder="Enter bank name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />

                    <Input
                      label="Account Number"
                      placeholder="Enter account number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Account Name"
                    placeholder="Enter account holder name"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={!formData.employee_id || !formData.basic_salary || !formData.effective_date}
                >
                  {editingSalary ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageLayout>
  );
}
