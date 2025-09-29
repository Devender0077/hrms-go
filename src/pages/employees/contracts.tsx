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
  Textarea,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { apiRequest } from '../../services/api-service';

interface EmployeeContract {
  id: number;
  employee_id: number;
  contract_type: string;
  start_date: string;
  end_date?: string;
  salary: number;
  status: string;
  terms: string;
  created_at: string;
  employee_name?: string;
  employee_id_string?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const EmployeeContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<EmployeeContract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingContract, setEditingContract] = useState<EmployeeContract | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    contract_type: '',
    start_date: '',
    end_date: '',
    salary: '',
    status: 'active',
    terms: ''
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchContracts();
    fetchEmployees();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/employees/contracts', { method: 'GET' });
      if (response.success) {
        setContracts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiRequest('/employees', { method: 'GET' });
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreateContract = () => {
    setEditingContract(null);
    setFormData({
      employee_id: '',
      contract_type: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      salary: '',
      status: 'active',
      terms: ''
    });
    onOpen();
  };

  const handleEditContract = (contract: EmployeeContract) => {
    setEditingContract(contract);
    setFormData({
      employee_id: contract.employee_id.toString(),
      contract_type: contract.contract_type,
      start_date: contract.start_date,
      end_date: contract.end_date || '',
      salary: contract.salary.toString(),
      status: contract.status,
      terms: contract.terms
    });
    onOpen();
  };

  const handleSaveContract = async () => {
    try {
      setSaving(true);
      
      const contractData = {
        employee_id: parseInt(formData.employee_id),
        contract_type: formData.contract_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        salary: parseFloat(formData.salary),
        status: formData.status,
        terms: formData.terms
      };

      const url = editingContract 
        ? `/employees/contracts/${editingContract.id}`
        : '/employees/contracts';
      const method = editingContract ? 'PUT' : 'POST';
      
      const response = await apiRequest(url, { method, body: contractData });
      if (response.success) {
        await fetchContracts();
        onClose();
      }
    } catch (error) {
      console.error('Error saving contract:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContract = async (contractId: number) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        const response = await apiRequest(`/employees/contracts/${contractId}`, { method: 'DELETE' });
        if (response.success) {
          await fetchContracts();
        }
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'danger';
      case 'terminated': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getContractTypeColor = (type: string): "default" | "success" | "danger" | "warning" | "primary" | "secondary" => {
    const colors: { [key: string]: "default" | "success" | "danger" | "warning" | "primary" | "secondary" } = {
      'permanent': 'success',
      'contract': 'primary',
      'temporary': 'warning',
      'intern': 'secondary',
      'consultant': 'default'
    };
    return colors[type] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isContractExpiring = (endDate: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isContractExpired = (endDate: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
  };

  const contractTypes = [
    { key: 'permanent', label: 'Permanent' },
    { key: 'contract', label: 'Contract' },
    { key: 'temporary', label: 'Temporary' },
    { key: 'intern', label: 'Intern' },
    { key: 'consultant', label: 'Consultant' }
  ];

  const statusOptions = [
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
    { key: 'terminated', label: 'Terminated' },
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
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Icon icon="lucide:file-text" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Contracts</h1>
              <p className="text-default-600 mt-1">Manage employee employment contracts</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />} 
              onPress={handleCreateContract}
              className="font-medium"
            >
              Add Contract
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Total Contracts</p>
                  <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{contracts.length}</p>
                </div>
                <div className="p-3 bg-primary-500 rounded-xl">
                  <Icon icon="lucide:file-text" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success-600 dark:text-success-400">Active Contracts</p>
                  <p className="text-2xl font-bold text-success-900 dark:text-success-100">
                    {contracts.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-success-500 rounded-xl">
                  <Icon icon="lucide:check-circle" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning-600 dark:text-warning-400">Expiring Soon</p>
                  <p className="text-2xl font-bold text-warning-900 dark:text-warning-100">
                    {contracts.filter(c => isContractExpiring(c.end_date || '')).length}
                  </p>
                </div>
                <div className="p-3 bg-warning-500 rounded-xl">
                  <Icon icon="lucide:calendar" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-danger-200 dark:border-danger-700">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-danger-600 dark:text-danger-400">Expired</p>
                  <p className="text-2xl font-bold text-danger-900 dark:text-danger-100">
                    {contracts.filter(c => isContractExpired(c.end_date || '')).length}
                  </p>
                </div>
                <div className="p-3 bg-danger-500 rounded-xl">
                  <Icon icon="lucide:alert-circle" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Contracts Table */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Employee Contracts</h2>
                <p className="text-sm text-default-600 mt-1">{contracts.length} total contracts</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
          <Table aria-label="Contracts table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>CONTRACT TYPE</TableColumn>
              <TableColumn>START DATE</TableColumn>
              <TableColumn>END DATE</TableColumn>
              <TableColumn>SALARY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.employee_name || `Employee ${contract.employee_id}`}</div>
                      {contract.employee_id_string && (
                        <div className="text-sm text-default-500">{contract.employee_id_string}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getContractTypeColor(contract.contract_type)}
                      size="sm"
                      variant="flat"
                    >
                      {contractTypes.find(t => t.key === contract.contract_type)?.label || contract.contract_type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {new Date(contract.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {contract.end_date ? (
                      <div className={`${isContractExpiring(contract.end_date) ? 'text-warning-600 font-medium' : ''} ${isContractExpired(contract.end_date) ? 'text-danger-600 font-medium' : ''}`}>
                        {new Date(contract.end_date).toLocaleDateString()}
                        {isContractExpiring(contract.end_date) && (
                          <div className="text-xs text-warning-600">Expiring Soon</div>
                        )}
                        {isContractExpired(contract.end_date) && (
                          <div className="text-xs text-danger-600">Expired</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-default-500">No end date</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(contract.salary)}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(contract.status)}
                      size="sm"
                      variant="flat"
                    >
                      {contract.status}
                    </Chip>
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
                          key="edit"
                          startContent={<Icon icon="lucide:pencil" />}
                          onPress={() => handleEditContract(contract)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" />}
                          onPress={() => handleDeleteContract(contract.id)}
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

      {/* Create/Edit Contract Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingContract ? 'Edit Contract' : 'Add New Contract'}
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
                  <SelectItem key={employee.id.toString()}>
                    {employee.first_name} {employee.last_name} ({employee.employee_id})
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Contract Type"
                placeholder="Select contract type"
                selectedKeys={formData.contract_type ? [formData.contract_type] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, contract_type: selected || '' });
                }}
                isRequired
              >
                {contractTypes.map((type) => (
                  <SelectItem key={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  isRequired
                />

                <Input
                  label="End Date (Optional)"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <Input
                label="Salary"
                placeholder="Enter salary amount"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                startContent="$"
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
                  <SelectItem key={status.key}>
                    {status.label}
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                label="Terms & Conditions"
                placeholder="Enter contract terms and conditions"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={4}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveContract}
              isLoading={saving}
            >
              {editingContract ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
    </div>
  );
};

export default EmployeeContractsPage;
