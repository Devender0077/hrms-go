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
import { PlusIcon, PencilIcon, TrashIcon, MoreVerticalIcon, FileTextIcon, CalendarIcon } from 'lucide-react';
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
      const response = await apiRequest('GET', '/api/v1/employees/contracts');
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
      const response = await apiRequest('GET', '/api/v1/employees');
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
        ? `/api/v1/employees/contracts/${editingContract.id}`
        : '/api/v1/employees/contracts';
      const method = editingContract ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, contractData);
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
        const response = await apiRequest('DELETE', `/api/v1/employees/contracts/${contractId}`);
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

  const getContractTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Contracts</h1>
          <p className="text-gray-600">Manage employee employment contracts</p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon size={20} />}
          onPress={handleCreateContract}
        >
          Add Contract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Contracts</p>
                <p className="text-xl font-semibold">{contracts.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileTextIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Contracts</p>
                <p className="text-xl font-semibold">
                  {contracts.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-xl font-semibold">
                  {contracts.filter(c => isContractExpiring(c.end_date || '')).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileTextIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-xl font-semibold">
                  {contracts.filter(c => isContractExpired(c.end_date || '')).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Contracts ({contracts.length})</h2>
        </CardHeader>
        <CardBody>
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
                        <div className="text-sm text-gray-500">{contract.employee_id_string}</div>
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
                      <div className={`${isContractExpiring(contract.end_date) ? 'text-yellow-600 font-medium' : ''} ${isContractExpired(contract.end_date) ? 'text-red-600 font-medium' : ''}`}>
                        {new Date(contract.end_date).toLocaleDateString()}
                        {isContractExpiring(contract.end_date) && (
                          <div className="text-xs text-yellow-600">Expiring Soon</div>
                        )}
                        {isContractExpired(contract.end_date) && (
                          <div className="text-xs text-red-600">Expired</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No end date</span>
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
                          <MoreVerticalIcon size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<PencilIcon size={16} />}
                          onPress={() => handleEditContract(contract)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<TrashIcon size={16} />}
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
                  <SelectItem key={employee.id.toString()} value={employee.id.toString()}>
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
                  <SelectItem key={type.key} value={type.key}>
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
                  <SelectItem key={status.key} value={status.key}>
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
  );
};

export default EmployeeContractsPage;
