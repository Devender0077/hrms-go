import React, { useState, useEffect } from 'react';
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Spinner,
  Divider
} from '@heroui/react';
import { PlusIcon, PencilIcon, TrashIcon, MoreVerticalIcon, DollarSignIcon } from 'lucide-react';
import { apiRequest } from '../../services/api-service';

interface EmployeeSalary {
  id: number;
  employee_id: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  effective_date: string;
  status: string;
  employee_name?: string;
  employee_id_string?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const EmployeeSalariesPage: React.FC = () => {
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSalary, setEditingSalary] = useState<EmployeeSalary | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    allowances: '',
    deductions: '',
    effective_date: '',
    status: 'active'
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/v1/employees/salaries');
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
      const response = await apiRequest('GET', '/api/v1/employees');
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreateSalary = () => {
    setEditingSalary(null);
    setFormData({
      employee_id: '',
      basic_salary: '',
      allowances: '',
      deductions: '',
      effective_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    onOpen();
  };

  const handleEditSalary = (salary: EmployeeSalary) => {
    setEditingSalary(salary);
    setFormData({
      employee_id: salary.employee_id.toString(),
      basic_salary: salary.basic_salary.toString(),
      allowances: salary.allowances.toString(),
      deductions: salary.deductions.toString(),
      effective_date: salary.effective_date,
      status: salary.status
    });
    onOpen();
  };

  const handleSaveSalary = async () => {
    try {
      setSaving(true);
      
      const basicSalary = parseFloat(formData.basic_salary);
      const allowances = parseFloat(formData.allowances) || 0;
      const deductions = parseFloat(formData.deductions) || 0;
      const netSalary = basicSalary + allowances - deductions;

      const salaryData = {
        employee_id: parseInt(formData.employee_id),
        basic_salary: basicSalary,
        allowances: allowances,
        deductions: deductions,
        net_salary: netSalary,
        effective_date: formData.effective_date,
        status: formData.status
      };

      const url = editingSalary 
        ? `/api/v1/employees/salaries/${editingSalary.id}`
        : '/api/v1/employees/salaries';
      const method = editingSalary ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, salaryData);
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
        const response = await apiRequest('DELETE', `/api/v1/employees/salaries/${salaryId}`);
        if (response.success) {
          await fetchSalaries();
        }
      } catch (error) {
        console.error('Error deleting salary:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    return basic + allowances - deductions;
  };

  const statusOptions = [
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'pending', label: 'Pending' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Salaries</h1>
          <p className="text-gray-600">Manage employee salary information</p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon size={20} />}
          onPress={handleCreateSalary}
        >
          Add Salary
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSignIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Salaries</p>
                <p className="text-xl font-semibold">{salaries.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSignIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Salaries</p>
                <p className="text-xl font-semibold">
                  {salaries.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSignIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(salaries.reduce((sum, s) => sum + s.net_salary, 0))}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSignIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Salary</p>
                <p className="text-xl font-semibold">
                  {salaries.length > 0 ? formatCurrency(salaries.reduce((sum, s) => sum + s.net_salary, 0) / salaries.length) : '$0'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Salaries Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Salary Records ({salaries.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Salaries table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>BASIC SALARY</TableColumn>
              <TableColumn>ALLOWANCES</TableColumn>
              <TableColumn>DEDUCTIONS</TableColumn>
              <TableColumn>NET SALARY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>EFFECTIVE DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {salaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{salary.employee_name || `Employee ${salary.employee_id}`}</div>
                      {salary.employee_id_string && (
                        <div className="text-sm text-gray-500">{salary.employee_id_string}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(salary.basic_salary)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-green-600">{formatCurrency(salary.allowances)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-red-600">{formatCurrency(salary.deductions)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-lg">{formatCurrency(salary.net_salary)}</div>
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
                    {new Date(salary.effective_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                        >
                          <MoreVerticalIcon size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<PencilIcon size={16} />}
                          onPress={() => handleEditSalary(salary)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<TrashIcon size={16} />}
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

      {/* Create/Edit Salary Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {editingSalary ? 'Edit Salary' : 'Add New Salary'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
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
                  <SelectItem key={employee.id.toString()} value={employee.id.toString()}>
                    {employee.first_name} {employee.last_name} ({employee.employee_id})
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Basic Salary"
                placeholder="Enter basic salary"
                type="number"
                value={formData.basic_salary}
                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                startContent="$"
                isRequired
              />

              <Input
                label="Allowances"
                placeholder="Enter allowances"
                type="number"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                startContent="$"
              />

              <Input
                label="Deductions"
                placeholder="Enter deductions"
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                startContent="$"
              />

              <Divider />

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net Salary:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(calculateNetSalary())}
                  </span>
                </div>
              </div>

              <Input
                label="Effective Date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                isRequired
              />

              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={formData.status ? [formData.status] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, status: selected || 'active' });
                }}
                isRequired
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.key} value={status.key}>
                    {status.label}
                  </SelectItem>
                ))}
              </Select>
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
    </div>
  );
};

export default EmployeeSalariesPage;
