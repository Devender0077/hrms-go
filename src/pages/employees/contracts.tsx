import React, { useState, useEffect, useMemo } from 'react';
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
  Spinner,
  Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
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

interface ContractStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}

interface ContractStatsProps {
  stats: ContractStats;
}

const ContractStats: React.FC<ContractStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Contracts",
      value: stats.total,
      icon: "lucide:file-text",
      color: "blue",
      bgColor: "bg-primary-100",
      textColor: "text-primary-600"
    },
    {
      title: "Active",
      value: stats.active,
      icon: "lucide:check-circle",
      color: "green",
      bgColor: "bg-success-100",
      textColor: "text-success-600"
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      icon: "lucide:clock",
      color: "yellow",
      bgColor: "bg-warning-100",
      textColor: "text-warning-600"
    },
    {
      title: "Expired",
      value: stats.expired,
      icon: "lucide:x-circle",
      color: "red",
      bgColor: "bg-danger-100",
      textColor: "text-danger-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-sm">
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
  );
};

interface ContractFiltersProps {
  filters: {
    searchQuery: string;
    selectedStatus: string;
    selectedType: string;
  };
  onFiltersChange: (filters: {
    searchQuery: string;
    selectedStatus: string;
    selectedType: string;
  }) => void;
}

const ContractFilters: React.FC<ContractFiltersProps> = ({ filters, onFiltersChange }) => {
  const statusOptions = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
    { key: 'terminated', label: 'Terminated' },
    { key: 'pending', label: 'Pending' }
  ];

  const typeOptions = [
    { key: 'all', label: 'All Types' },
    { key: 'permanent', label: 'Permanent' },
    { key: 'contract', label: 'Contract' },
    { key: 'temporary', label: 'Temporary' },
    { key: 'intern', label: 'Intern' },
    { key: 'consultant', label: 'Consultant' }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by employee name or ID..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            className="max-w-full"
          />
          
          <Select
            placeholder="Filter by status"
            selectedKeys={filters.selectedStatus ? [filters.selectedStatus] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              onFiltersChange({ ...filters, selectedStatus: selected || 'all' });
            }}
          >
            {statusOptions.map((status) => (
              <SelectItem key={status.key}>
                {status.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            placeholder="Filter by type"
            selectedKeys={filters.selectedType ? [filters.selectedType] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              onFiltersChange({ ...filters, selectedType: selected || 'all' });
            }}
          >
            {typeOptions.map((type) => (
              <SelectItem key={type.key}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </CardBody>
    </Card>
  );
};

const EmployeeContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<EmployeeContract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingContract, setEditingContract] = useState<EmployeeContract | null>(null);
  const [viewingContract, setViewingContract] = useState<EmployeeContract | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedStatus: 'all',
    selectedType: 'all'
  });
  const rowsPerPage = 10;
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
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  useEffect(() => {
    fetchContracts();
    fetchEmployees();
  }, []);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = !filters.searchQuery || 
        contract.employee_name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        contract.employee_id_string?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesStatus = filters.selectedStatus === 'all' || contract.status === filters.selectedStatus;
      const matchesType = filters.selectedType === 'all' || contract.contract_type === filters.selectedType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [contracts, filters]);

  // Paginated contracts
  const paginatedContracts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredContracts.slice(start, start + rowsPerPage);
  }, [filteredContracts, page, rowsPerPage]);

  // Statistics
  const stats = useMemo((): ContractStats => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const expiringSoon = contracts.filter(c => {
      if (!c.end_date) return false;
      const endDate = new Date(c.end_date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;
    const expired = contracts.filter(c => {
      if (!c.end_date) return false;
      return new Date(c.end_date) < new Date();
    }).length;

    return { total, active, expiringSoon, expired };
  }, [contracts]);

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / rowsPerPage);

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

  const handleViewContract = (contract: EmployeeContract) => {
    setViewingContract(contract);
    onViewOpen();
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-default-600 mt-4">Loading contracts...</p>
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

        {/* Statistics */}
        <ContractStats stats={stats} />

        {/* Filters */}
        <ContractFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Contracts Table */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Employee Contracts</h2>
                <p className="text-sm text-default-600 mt-1">{filteredContracts.length} contracts found</p>
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
              {paginatedContracts.map((contract) => (
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
                          key="view"
                          startContent={<Icon icon="lucide:eye" />}
                          onPress={() => handleViewContract(contract)}
                        >
                          View
                        </DropdownItem>
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
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

      {/* View Contract Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            Contract Details
          </ModalHeader>
          <ModalBody>
            {viewingContract && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-600">Employee</label>
                    <p className="text-lg font-semibold">
                      {viewingContract.employee_name || `Employee ${viewingContract.employee_id}`}
                    </p>
                    {viewingContract.employee_id_string && (
                      <p className="text-sm text-default-500">ID: {viewingContract.employee_id_string}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">Contract Type</label>
                    <div className="mt-1">
                      <Chip
                        color={getContractTypeColor(viewingContract.contract_type)}
                        size="sm"
                        variant="flat"
                      >
                        {contractTypes.find(t => t.key === viewingContract.contract_type)?.label || viewingContract.contract_type}
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-600">Start Date</label>
                    <p className="text-lg">{new Date(viewingContract.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">End Date</label>
                    <p className="text-lg">
                      {viewingContract.end_date ? new Date(viewingContract.end_date).toLocaleDateString() : 'No end date'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-600">Salary</label>
                    <p className="text-lg font-semibold text-primary-600">
                      {formatCurrency(viewingContract.salary)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">Status</label>
                    <div className="mt-1">
                      <Chip
                        color={getStatusColor(viewingContract.status)}
                        size="sm"
                        variant="flat"
                      >
                        {viewingContract.status}
                      </Chip>
                    </div>
                  </div>
                </div>

                {viewingContract.terms && (
                  <div>
                    <label className="text-sm font-medium text-default-600">Terms & Conditions</label>
                    <div className="mt-2 p-4 bg-default-50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{viewingContract.terms}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-600">Created</label>
                    <p className="text-sm">{new Date(viewingContract.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">Last Updated</label>
                    <p className="text-sm">{new Date(viewingContract.updated_at).toLocaleDateString()}</p>
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
                handleEditContract(viewingContract!);
              }}
            >
              Edit Contract
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
    </div>
  );
};

export default EmployeeContractsPage;
