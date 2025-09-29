import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Spinner,
  Divider,
  Switch,
  Badge
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../services/api-service';

interface EmployeeSalary {
  id: number;
  employee_id: number;
  basic_salary: number;
  components: SalaryComponentAssignment[];
  status: 'active' | 'inactive';
  effective_date: string;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  employee_id_string?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface SalaryComponent {
  id: number;
  name: string;
  type: 'earning' | 'deduction';
  is_taxable: boolean;
  is_fixed: boolean;
  calculation_type: 'fixed' | 'percentage' | 'formula';
  default_amount: number;
  percentage_of?: string;
  formula?: string;
  is_active: boolean;
  is_mandatory: boolean;
}

interface SalaryComponentAssignment {
  component_id: number;
  component_name: string;
  component_type: 'earning' | 'deduction';
  amount: number;
  is_taxable: boolean;
  is_mandatory: boolean;
}

interface SalaryFilters {
  searchQuery: string;
  selectedEmployee: string;
  selectedStatus: string;
}

const EmployeeSalariesPage: React.FC = () => {
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSalary, setEditingSalary] = useState<EmployeeSalary | null>(null);
  const [selectedSalary, setSelectedSalary] = useState<EmployeeSalary | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filters state
  const [filters, setFilters] = useState<SalaryFilters>({
    searchQuery: "",
    selectedEmployee: "all",
    selectedStatus: "all"
  });

  // Form data
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    components: [] as SalaryComponentAssignment[],
    status: 'active' as 'active' | 'inactive',
    effective_date: new Date().toISOString().split('T')[0]
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isPayrollOpen, onOpen: onPayrollOpen, onClose: onPayrollClose } = useDisclosure();

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
    fetchSalaryComponents();
  }, []);

  // Filtered salaries
  const filteredSalaries = useMemo(() => {
    return salaries.filter(salary => {
      const matchesSearch = filters.searchQuery === "" || 
        salary.employee_name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        salary.employee_id_string?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesEmployee = filters.selectedEmployee === "all" || 
        salary.employee_id.toString() === filters.selectedEmployee;
      
      const matchesStatus = filters.selectedStatus === "all" || 
        salary.status === filters.selectedStatus;

      return matchesSearch && matchesEmployee && matchesStatus;
    });
  }, [salaries, filters]);

  // Paginated salaries
  const paginatedSalaries = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredSalaries.slice(start, start + rowsPerPage);
  }, [filteredSalaries, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const totalSalaries = salaries.length;
    const activeSalaries = salaries.filter(s => s.status === 'active').length;
    const totalPayroll = salaries.reduce((sum, s) => {
      const earnings = s.components.filter(c => c.component_type === 'earning').reduce((sum, c) => sum + c.amount, 0);
      const deductions = s.components.filter(c => c.component_type === 'deduction').reduce((sum, c) => sum + c.amount, 0);
      return sum + s.basic_salary + earnings - deductions;
    }, 0);
    const averageSalary = totalSalaries > 0 ? totalPayroll / totalSalaries : 0;

    return {
      totalSalaries,
      activeSalaries,
      totalPayroll,
      averageSalary
    };
  }, [salaries]);

  // Pagination
  const totalPages = Math.ceil(filteredSalaries.length / rowsPerPage);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/employees/salaries', 'GET');
      if (response.success) {
        setSalaries(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiRequest('/employees', 'GET');
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSalaryComponents = async () => {
    try {
      const response = await apiRequest('/payroll/salary-components', 'GET');
      if (response.success) {
        setSalaryComponents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching salary components:', error);
    }
  };

  const handleCreateSalary = () => {
    setEditingSalary(null);
    setFormData({
      employee_id: '',
      basic_salary: '',
      components: [],
      status: 'active',
      effective_date: new Date().toISOString().split('T')[0]
    });
    onOpen();
  };

  const handleEditSalary = (salary: EmployeeSalary) => {
    setEditingSalary(salary);
    setFormData({
      employee_id: salary.employee_id.toString(),
      basic_salary: salary.basic_salary.toString(),
      components: salary.components || [],
      status: salary.status,
      effective_date: salary.effective_date
    });
    onOpen();
  };

  const handleViewSalary = (salary: EmployeeSalary) => {
    setSelectedSalary(salary);
    onViewOpen();
  };

  const handleShowPayroll = (salary: EmployeeSalary) => {
    setSelectedSalary(salary);
    onPayrollOpen();
  };

  const handleSaveSalary = async () => {
    try {
      setSaving(true);
      
      const salaryData = {
        employee_id: parseInt(formData.employee_id),
        basic_salary: parseFloat(formData.basic_salary),
        components: formData.components,
        status: formData.status,
        effective_date: formData.effective_date
      };

      const url = editingSalary 
        ? `/employees/salaries/${editingSalary.id}`
        : '/employees/salaries';
      const method = editingSalary ? 'PUT' : 'POST';
      
      const response = await apiRequest(url, method, salaryData);
      if (response.success) {
        await fetchSalaries();
        onClose();
      }
    } catch (error) {
      console.error('Error saving salary:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSalary = async (salaryId: number) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        const response = await apiRequest(`/employees/salaries/${salaryId}`, 'DELETE');
        if (response.success) {
          await fetchSalaries();
        }
      } catch (error) {
        console.error('Error deleting salary:', error);
      }
    }
  };

  const handleToggleStatus = async (salary: EmployeeSalary) => {
    try {
      const newStatus = salary.status === 'active' ? 'inactive' : 'active';
      const response = await apiRequest(`/employees/salaries/${salary.id}`, 'PUT', {
        ...salary,
        status: newStatus
      });
      if (response.success) {
        await fetchSalaries();
      }
    } catch (error) {
      console.error('Error updating salary status:', error);
    }
  };

  const handleAddComponent = (component: SalaryComponent) => {
    const existingIndex = formData.components.findIndex(c => c.component_id === component.id);
    if (existingIndex >= 0) {
      // Update existing component
      const updatedComponents = [...formData.components];
      updatedComponents[existingIndex] = {
        ...updatedComponents[existingIndex],
        amount: parseFloat(component.default_amount) || 0
      };
      setFormData({ ...formData, components: updatedComponents });
    } else {
      // Add new component
      const newComponent: SalaryComponentAssignment = {
        component_id: component.id,
        component_name: component.name,
        component_type: component.type,
        amount: parseFloat(component.default_amount) || 0,
        is_taxable: component.is_taxable,
        is_mandatory: component.is_mandatory
      };
      setFormData({ ...formData, components: [...formData.components, newComponent] });
    }
  };

  const handleUpdateComponentAmount = (componentId: number, amount: number) => {
    const updatedComponents = formData.components.map(c => 
      c.component_id === componentId ? { ...c, amount } : c
    );
    setFormData({ ...formData, components: updatedComponents });
  };

  const handleRemoveComponent = (componentId: number) => {
    const updatedComponents = formData.components.filter(c => c.component_id !== componentId);
    setFormData({ ...formData, components: updatedComponents });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNetSalary = (salary: EmployeeSalary) => {
    const earnings = salary.components.filter(c => c.component_type === 'earning').reduce((sum, c) => sum + c.amount, 0);
    const deductions = salary.components.filter(c => c.component_type === 'deduction').reduce((sum, c) => sum + c.amount, 0);
    return salary.basic_salary + earnings - deductions;
  };

  const calculateFormNetSalary = () => {
    const earnings = formData.components.filter(c => c.component_type === 'earning').reduce((sum, c) => sum + c.amount, 0);
    const deductions = formData.components.filter(c => c.component_type === 'deduction').reduce((sum, c) => sum + c.amount, 0);
    return parseFloat(formData.basic_salary) + earnings - deductions;
  };

  const availableComponents = salaryComponents.filter(component => 
    component.is_active && !formData.components.some(c => c.component_id === component.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-content2 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-default-600 mt-4">Loading salaries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Icon icon="lucide:banknote" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Salaries</h1>
              <p className="text-default-600 mt-1">Manage employee salary information and payroll</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />} 
              onPress={handleCreateSalary}
              className="font-medium"
            >
              Add Salary
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Salaries",
              value: stats.totalSalaries,
              icon: "lucide:users",
              color: "blue",
              bgColor: "bg-primary-100 dark:bg-primary-900/20",
              textColor: "text-primary-600 dark:text-primary-400"
            },
            {
              title: "Active Salaries",
              value: stats.activeSalaries,
              icon: "lucide:user-check",
              color: "green",
              bgColor: "bg-success-100 dark:bg-success-900/20",
              textColor: "text-success-600 dark:text-success-400"
            },
            {
              title: "Total Payroll",
              value: formatCurrency(stats.totalPayroll),
              icon: "lucide:dollar-sign",
              color: "purple",
              bgColor: "bg-secondary-100 dark:bg-secondary-900/20",
              textColor: "text-secondary-600 dark:text-secondary-400"
            },
            {
              title: "Average Salary",
              value: formatCurrency(stats.averageSalary),
              icon: "lucide:trending-up",
              color: "yellow",
              bgColor: "bg-warning-100 dark:bg-warning-900/20",
              textColor: "text-warning-600 dark:text-warning-400"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm bg-content1">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 ${stat.bgColor} rounded-full`}>
                      <Icon icon={stat.icon} className={`${stat.textColor} text-xl`} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-content1">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Search"
                placeholder="Search by employee name or ID..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
              />
              <Select
                label="Filter by Employee"
                placeholder="Select employee"
                selectedKeys={filters.selectedEmployee ? [filters.selectedEmployee] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({...filters, selectedEmployee: selected || "all"});
                }}
              >
                <SelectItem key="all" value="all" textValue="All Employees">
                  All Employees
                </SelectItem>
                {employees.map((employee) => (
                  <SelectItem 
                    key={employee.id.toString()} 
                    value={employee.id.toString()}
                    textValue={`${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
                  >
                    {employee.first_name} {employee.last_name} ({employee.employee_id})
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Filter by Status"
                placeholder="Select status"
                selectedKeys={filters.selectedStatus ? [filters.selectedStatus] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({...filters, selectedStatus: selected || "all"});
                }}
              >
                <SelectItem key="all" value="all" textValue="All Statuses">
                  All Statuses
                </SelectItem>
                <SelectItem key="active" value="active" textValue="Active">
                  Active
                </SelectItem>
                <SelectItem key="inactive" value="inactive" textValue="Inactive">
                  Inactive
                </SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Salaries Table */}
        <Card className="border-0 shadow-sm bg-content1">
          <CardBody className="p-0">
            <Table aria-label="Salaries table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>BASIC SALARY</TableColumn>
                <TableColumn>COMPONENTS</TableColumn>
                <TableColumn>NET SALARY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>EFFECTIVE DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedSalaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          name={salary.employee_name || `Employee ${salary.employee_id}`}
                          className="flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium">{salary.employee_name || `Employee ${salary.employee_id}`}</div>
                          {salary.employee_id_string && (
                            <div className="text-sm text-default-500">{salary.employee_id_string}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(salary.basic_salary)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {salary.components.slice(0, 2).map((component) => (
                          <Badge
                            key={component.component_id}
                            content={formatCurrency(component.amount)}
                            color={component.component_type === 'earning' ? 'success' : 'danger'}
                            variant="flat"
                            size="sm"
                          >
                            <Chip
                              size="sm"
                              variant="flat"
                              color={component.component_type === 'earning' ? 'success' : 'danger'}
                            >
                              {component.component_name}
                            </Chip>
                          </Badge>
                        ))}
                        {salary.components.length > 2 && (
                          <Chip size="sm" variant="flat" color="default">
                            +{salary.components.length - 2} more
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg">{formatCurrency(calculateNetSalary(salary))}</div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(salary.status)}
                        size="sm"
                        variant="flat"
                      >
                        {salary.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:calendar" className="text-default-400" size={16} />
                        {new Date(salary.effective_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                          >
                            <Icon icon="lucide:more-vertical" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => handleViewSalary(salary)}
                          >
                            View
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:pencil" />}
                            onPress={() => handleEditSalary(salary)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="payroll"
                            startContent={<Icon icon="lucide:receipt" />}
                            onPress={() => handleShowPayroll(salary)}
                          >
                            Show Payroll
                          </DropdownItem>
                          <DropdownItem
                            key="toggle"
                            startContent={<Icon icon={salary.status === 'active' ? 'lucide:pause' : 'lucide:play'} />}
                            onPress={() => handleToggleStatus(salary)}
                          >
                            {salary.status === 'active' ? 'Disable' : 'Enable'}
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" />}
                            onPress={() => handleDeleteSalary(salary.id)}
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
          </CardBody>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              showControls
              showShadow
              color="primary"
            />
          </div>
        )}

        {/* Create/Edit Salary Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              {editingSalary ? 'Edit Salary' : 'Add New Salary'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Employee Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Employee Information</h3>
                  <Select
                    label="Employee"
                    placeholder="Select employee"
                    selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({ ...formData, employee_id: selected || '' });
                    }}
                    isRequired
                  >
                    {employees.map((employee) => (
                      <SelectItem 
                        key={employee.id.toString()} 
                        value={employee.id.toString()}
                        textValue={`${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
                      >
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <Divider />

                {/* Basic Salary */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Salary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Basic Salary"
                      placeholder="Enter basic salary"
                      type="number"
                      value={formData.basic_salary}
                      onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                      startContent="$"
                      isRequired
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-default-700">Status</p>
                        <p className="text-xs text-default-500">Active or Inactive</p>
                      </div>
                      <Switch
                        isSelected={formData.status === 'active'}
                        onValueChange={(value) => setFormData({ ...formData, status: value ? 'active' : 'inactive' })}
                      />
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Salary Components */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Salary Components</h3>
                  
                  {/* Add Components */}
                  {availableComponents.length > 0 && (
                    <div className="mb-4">
                      <Select
                        label="Add Component"
                        placeholder="Select a component to add"
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          const component = salaryComponents.find(c => c.id.toString() === selected);
                          if (component) {
                            handleAddComponent(component);
                          }
                        }}
                      >
                        {availableComponents.map((component) => (
                          <SelectItem 
                            key={component.id.toString()} 
                            value={component.id.toString()}
                            textValue={component.name}
                          >
                            {component.name} ({component.type}) - {formatCurrency(component.default_amount)}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Selected Components */}
                  {formData.components.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Selected Components:</h4>
                      {formData.components.map((component) => (
                        <div key={component.component_id} className="flex items-center gap-3 p-3 bg-content2 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Chip
                                size="sm"
                                variant="flat"
                                color={component.component_type === 'earning' ? 'success' : 'danger'}
                              >
                                {component.component_name}
                              </Chip>
                              {component.is_mandatory && (
                                <Chip size="sm" variant="flat" color="warning">
                                  Mandatory
                                </Chip>
                              )}
                              {component.is_taxable && (
                                <Chip size="sm" variant="flat" color="secondary">
                                  Taxable
                                </Chip>
                              )}
                            </div>
                          </div>
                          <Input
                            type="number"
                            value={component.amount.toString()}
                            onChange={(e) => handleUpdateComponentAmount(component.component_id, parseFloat(e.target.value) || 0)}
                            startContent="$"
                            size="sm"
                            className="w-24"
                          />
                          {!component.is_mandatory && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleRemoveComponent(component.component_id)}
                            >
                              <Icon icon="lucide:x" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Divider />

                {/* Net Salary Calculation */}
                <div className="bg-content2 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">Net Salary:</span>
                    <span className="text-2xl font-bold text-success-600">
                      {formatCurrency(calculateFormNetSalary())}
                    </span>
                  </div>
                </div>

                <Divider />

                {/* Effective Date */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Effective Date</h3>
                  <Input
                    label="Effective Date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    isRequired
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSaveSalary}
                isLoading={saving}
              >
                {editingSalary ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Salary Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <Icon icon="lucide:eye" className="text-primary" />
                Salary Details
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedSalary && (
                <div className="space-y-6">
                  {/* Employee Information */}
                  <div className="flex items-center gap-4">
                    <Avatar
                      size="lg"
                      name={selectedSalary.employee_name || `Employee ${selectedSalary.employee_id}`}
                    />
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedSalary.employee_name || `Employee ${selectedSalary.employee_id}`}
                      </h3>
                      {selectedSalary.employee_id_string && (
                        <p className="text-default-600">{selectedSalary.employee_id_string}</p>
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Basic Salary Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Basic Salary Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-default-600">Basic Salary</label>
                        <p className="text-lg font-semibold">{formatCurrency(selectedSalary.basic_salary)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-600">Status</label>
                        <Chip
                          color={getStatusColor(selectedSalary.status)}
                          size="sm"
                          variant="flat"
                        >
                          {selectedSalary.status}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Salary Components */}
                  {selectedSalary.components.length > 0 && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Salary Components</h3>
                        <div className="space-y-3">
                          {selectedSalary.components.map((component) => (
                            <div key={component.component_id} className="flex items-center justify-between p-3 bg-content2 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={component.component_type === 'earning' ? 'success' : 'danger'}
                                >
                                  {component.component_name}
                                </Chip>
                                {component.is_mandatory && (
                                  <Chip size="sm" variant="flat" color="warning">
                                    Mandatory
                                  </Chip>
                                )}
                                {component.is_taxable && (
                                  <Chip size="sm" variant="flat" color="secondary">
                                    Taxable
                                  </Chip>
                                )}
                              </div>
                              <span className="font-semibold">
                                {component.component_type === 'earning' ? '+' : '-'}{formatCurrency(component.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Divider />
                    </>
                  )}

                  {/* Net Salary */}
                  <div className="bg-content2 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">Net Salary:</span>
                      <span className="text-3xl font-bold text-success-600">
                        {formatCurrency(calculateNetSalary(selectedSalary))}
                      </span>
                    </div>
                  </div>

                  <Divider />

                  {/* Effective Date */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Effective Date</h3>
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:calendar" className="text-default-400" />
                      <span className="font-medium">{new Date(selectedSalary.effective_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onViewClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onViewClose();
                  if (selectedSalary) {
                    handleEditSalary(selectedSalary);
                  }
                }}
              >
                Edit Salary
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Show Payroll Modal */}
        <Modal isOpen={isPayrollOpen} onClose={onPayrollClose} size="4xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <Icon icon="lucide:receipt" className="text-primary" />
                Payroll Details
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedSalary && (
                <div className="space-y-6">
                  {/* Employee Information */}
                  <div className="flex items-center gap-4">
                    <Avatar
                      size="lg"
                      name={selectedSalary.employee_name || `Employee ${selectedSalary.employee_id}`}
                    />
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedSalary.employee_name || `Employee ${selectedSalary.employee_id}`}
                      </h3>
                      {selectedSalary.employee_id_string && (
                        <p className="text-default-600">{selectedSalary.employee_id_string}</p>
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Payroll Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Payroll Breakdown</h3>
                    
                    {/* Earnings */}
                    <div className="mb-4">
                      <h4 className="font-medium text-success-600 mb-2">Earnings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-success-50 dark:bg-success-900/20 rounded">
                          <span>Basic Salary</span>
                          <span className="font-semibold text-success-600">+{formatCurrency(selectedSalary.basic_salary)}</span>
                        </div>
                        {selectedSalary.components.filter(c => c.component_type === 'earning').map((component) => (
                          <div key={component.component_id} className="flex justify-between items-center p-2 bg-success-50 dark:bg-success-900/20 rounded">
                            <span>{component.component_name}</span>
                            <span className="font-semibold text-success-600">+{formatCurrency(component.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deductions */}
                    {selectedSalary.components.filter(c => c.component_type === 'deduction').length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-danger-600 mb-2">Deductions</h4>
                        <div className="space-y-2">
                          {selectedSalary.components.filter(c => c.component_type === 'deduction').map((component) => (
                            <div key={component.component_id} className="flex justify-between items-center p-2 bg-danger-50 dark:bg-danger-900/20 rounded">
                              <span>{component.component_name}</span>
                              <span className="font-semibold text-danger-600">-{formatCurrency(component.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Net Salary */}
                    <div className="bg-content2 p-4 rounded-lg border-2 border-success-200 dark:border-success-800">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Net Salary:</span>
                        <span className="text-3xl font-bold text-success-600">
                          {formatCurrency(calculateNetSalary(selectedSalary))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onPayrollClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeeSalariesPage;