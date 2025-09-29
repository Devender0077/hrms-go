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
  Switch
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../services/api-service';

interface SalaryComponent {
  id: number;
  company_id: number;
  name: string;
  code?: string;
  description?: string;
  type: 'earning' | 'deduction';
  is_taxable: boolean;
  is_fixed: boolean;
  calculation_type?: 'fixed' | 'percentage' | 'formula';
  default_amount?: number;
  percentage_of?: string;
  formula?: string;
  is_active?: boolean;
  is_mandatory?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

interface ComponentFilters {
  searchQuery: string;
  selectedType: string;
  selectedStatus: string;
}

const SalaryComponentsPage: React.FC = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<SalaryComponent | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filters state
  const [filters, setFilters] = useState<ComponentFilters>({
    searchQuery: "",
    selectedType: "all",
    selectedStatus: "all"
  });

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'earning' as 'earning' | 'deduction',
    is_taxable: false,
    is_fixed: true,
    calculation_type: 'fixed' as 'fixed' | 'percentage' | 'formula',
    default_amount: 0,
    percentage_of: '',
    formula: '',
    is_active: true,
    is_mandatory: false,
    sort_order: 0
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  useEffect(() => {
    fetchComponents();
  }, []);

  // Filtered components
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      const matchesSearch = filters.searchQuery === "" || 
        component.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (component.code && component.code.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      const matchesType = filters.selectedType === "all" || 
        component.type === filters.selectedType;
      
      const matchesStatus = filters.selectedStatus === "all" || 
        (filters.selectedStatus === "active" && component.is_active !== false) ||
        (filters.selectedStatus === "inactive" && component.is_active === false);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [components, filters]);

  // Paginated components
  const paginatedComponents = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredComponents.slice(start, start + rowsPerPage);
  }, [filteredComponents, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const totalComponents = components.length;
    const earnings = components.filter(c => c.type === 'earning').length;
    const deductions = components.filter(c => c.type === 'deduction').length;
    const activeComponents = components.filter(c => c.is_active !== false).length;

    return {
      totalComponents,
      earnings,
      deductions,
      activeComponents
    };
  }, [components]);

  // Pagination
  const totalPages = Math.ceil(filteredComponents.length / rowsPerPage);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/payroll/salary-components', { method: 'GET' });
      if (response.success) {
        setComponents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching salary components:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComponent = () => {
    setEditingComponent(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'earning',
      is_taxable: false,
      is_fixed: true,
      calculation_type: 'fixed',
      default_amount: 0,
      percentage_of: '',
      formula: '',
      is_active: true,
      is_mandatory: false,
      sort_order: 0
    });
    onOpen();
  };

  const handleEditComponent = (component: SalaryComponent) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      code: component.code || '',
      description: component.description || '',
      type: component.type,
      is_taxable: component.is_taxable,
      is_fixed: component.is_fixed,
      calculation_type: component.calculation_type || 'fixed',
      default_amount: component.default_amount || 0,
      percentage_of: component.percentage_of || '',
      formula: component.formula || '',
      is_active: component.is_active !== false,
      is_mandatory: component.is_mandatory || false,
      sort_order: component.sort_order || 0
    });
    onOpen();
  };

  const handleViewComponent = (component: SalaryComponent) => {
    setSelectedComponent(component);
    onViewOpen();
  };

  const handleSaveComponent = async () => {
    try {
      setSaving(true);
      
      const componentData = {
        company_id: 1, // Default company ID
        name: formData.name,
        code: formData.code || null,
        description: formData.description || null,
        type: formData.type,
        is_taxable: formData.is_taxable,
        is_fixed: formData.is_fixed,
        calculation_type: formData.calculation_type,
        default_amount: formData.default_amount,
        percentage_of: formData.percentage_of || null,
        formula: formData.formula || null,
        is_active: formData.is_active,
        is_mandatory: formData.is_mandatory,
        sort_order: formData.sort_order
      };

      const url = editingComponent 
        ? `/payroll/salary-components/${editingComponent.id}`
        : '/payroll/salary-components';
      const method = editingComponent ? 'PUT' : 'POST';
      
      const response = await apiRequest(url, { method, body: componentData });
      if (response.success) {
        await fetchComponents();
        onClose();
      }
    } catch (error) {
      console.error('Error saving salary component:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComponent = async (componentId: number) => {
    if (window.confirm('Are you sure you want to delete this salary component?')) {
      try {
        const response = await apiRequest(`/payroll/salary-components/${componentId}`, { method: 'DELETE' });
        if (response.success) {
          await fetchComponents();
        }
      } catch (error) {
        console.error('Error deleting salary component:', error);
      }
    }
  };

  const handleToggleStatus = async (component: SalaryComponent) => {
    try {
      const newStatus = !component.is_active;
      const response = await apiRequest(`/payroll/salary-components/${component.id}`, { 
        method: 'PUT', 
        body: {
          ...component,
          is_active: newStatus
        }
      });
      if (response.success) {
        await fetchComponents();
      }
    } catch (error) {
      console.error('Error toggling component status:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earning': return 'success';
      case 'deduction': return 'danger';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earning': return 'lucide:plus-circle';
      case 'deduction': return 'lucide:minus-circle';
      default: return 'lucide:circle';
    }
  };

  const getCalculationTypeColor = (type: string) => {
    switch (type) {
      case 'fixed': return 'primary';
      case 'percentage': return 'secondary';
      case 'formula': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-content2 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-default-600 mt-4">Loading salary components...</p>
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
              <Icon icon="lucide:credit-card" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Salary Components</h1>
              <p className="text-default-600 mt-1">Manage salary components for earnings and deductions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />} 
              onPress={handleCreateComponent}
              className="font-medium"
            >
              Add Component
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Components",
              value: stats.totalComponents,
              icon: "lucide:layers",
              color: "blue",
              bgColor: "bg-primary-100 dark:bg-primary-900/20",
              textColor: "text-primary-600 dark:text-primary-400"
            },
            {
              title: "Earnings",
              value: stats.earnings,
              icon: "lucide:plus-circle",
              color: "green",
              bgColor: "bg-success-100 dark:bg-success-900/20",
              textColor: "text-success-600 dark:text-success-400"
            },
            {
              title: "Deductions",
              value: stats.deductions,
              icon: "lucide:minus-circle",
              color: "red",
              bgColor: "bg-danger-100 dark:bg-danger-900/20",
              textColor: "text-danger-600 dark:text-danger-400"
            },
            {
              title: "Active",
              value: stats.activeComponents,
              icon: "lucide:check-circle",
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
                placeholder="Search by name or code..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
              />
              <Select
                label="Filter by Type"
                placeholder="Select type"
                selectedKeys={filters.selectedType ? [filters.selectedType] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({...filters, selectedType: selected || "all"});
                }}
              >
                <SelectItem key="all" value="all" textValue="All Types">
                  All Types
                </SelectItem>
                <SelectItem key="earning" value="earning" textValue="Earnings">
                  Earnings
                </SelectItem>
                <SelectItem key="deduction" value="deduction" textValue="Deductions">
                  Deductions
                </SelectItem>
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
                <SelectItem key="all" value="all" textValue="All Status">
                  All Status
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

        {/* Components Table */}
        <Card className="border-0 shadow-sm bg-content1">
          <CardBody className="p-0">
            <Table aria-label="Salary components table">
              <TableHeader>
                <TableColumn>COMPONENT</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>CALCULATION</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>TAXABLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedComponents.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          component.type === 'earning' ? 'bg-success-100' : 'bg-danger-100'
                        }`}>
                          <Icon 
                            icon={getTypeIcon(component.type)} 
                            className={`text-lg ${
                              component.type === 'earning' ? 'text-success-600' : 'text-danger-600'
                            }`} 
                          />
                        </div>
                        <div>
                          <div className="font-medium">{component.name}</div>
                          {component.code && (
                            <div className="text-sm text-default-500">{component.code}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getTypeColor(component.type)}
                        size="sm"
                        variant="flat"
                      >
                        {component.type === 'earning' ? 'Earning' : 'Deduction'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getCalculationTypeColor(component.calculation_type || 'fixed')}
                        size="sm"
                        variant="flat"
                      >
                        {component.calculation_type || 'Fixed'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {component.calculation_type === 'percentage' ? (
                        <div className="text-sm">
                          <div className="font-medium">{component.percentage_of}%</div>
                          {component.default_amount > 0 && (
                            <div className="text-default-500">of {formatCurrency(component.default_amount)}</div>
                          )}
                        </div>
                      ) : component.calculation_type === 'formula' ? (
                        <div className="text-sm text-default-500">Formula</div>
                      ) : (
                        <div className="font-medium">{formatCurrency(component.default_amount || 0)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={component.is_taxable ? 'warning' : 'default'}
                        size="sm"
                        variant="flat"
                      >
                        {component.is_taxable ? 'Yes' : 'No'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={component.is_active !== false ? 'success' : 'danger'}
                        size="sm"
                        variant="flat"
                      >
                        {component.is_active !== false ? 'Active' : 'Inactive'}
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
                            onPress={() => handleViewComponent(component)}
                          >
                            View
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:pencil" />}
                            onPress={() => handleEditComponent(component)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="toggle"
                            startContent={<Icon icon={component.is_active !== false ? "lucide:pause" : "lucide:play"} />}
                            onPress={() => handleToggleStatus(component)}
                          >
                            {component.is_active !== false ? 'Disable' : 'Enable'}
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" />}
                            onPress={() => handleDeleteComponent(component.id)}
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

        {/* Create/Edit Component Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              {editingComponent ? 'Edit Salary Component' : 'Add New Salary Component'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Component Name"
                    placeholder="Enter component name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Component Code"
                    placeholder="Enter component code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <Input
                  label="Description"
                  placeholder="Enter component description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Type"
                    placeholder="Select component type"
                    selectedKeys={formData.type ? [formData.type] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({ ...formData, type: selected as 'earning' | 'deduction' });
                    }}
                    isRequired
                  >
                    <SelectItem key="earning" value="earning" textValue="Earning">
                      Earning
                    </SelectItem>
                    <SelectItem key="deduction" value="deduction" textValue="Deduction">
                      Deduction
                    </SelectItem>
                  </Select>

                  <Select
                    label="Calculation Type"
                    placeholder="Select calculation type"
                    selectedKeys={formData.calculation_type ? [formData.calculation_type] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({ ...formData, calculation_type: selected as 'fixed' | 'percentage' | 'formula' });
                    }}
                    isRequired
                  >
                    <SelectItem key="fixed" value="fixed" textValue="Fixed Amount">
                      Fixed Amount
                    </SelectItem>
                    <SelectItem key="percentage" value="percentage" textValue="Percentage of Basic">
                      Percentage of Basic
                    </SelectItem>
                    <SelectItem key="formula" value="formula" textValue="Formula">
                      Formula
                    </SelectItem>
                  </Select>
                </div>

                {formData.calculation_type === 'fixed' && (
                  <Input
                    label="Default Amount"
                    type="number"
                    placeholder="Enter default amount"
                    value={formData.default_amount.toString()}
                    onChange={(e) => setFormData({ ...formData, default_amount: parseFloat(e.target.value) || 0 })}
                    startContent="$"
                  />
                )}

                {formData.calculation_type === 'percentage' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Percentage"
                      type="number"
                      placeholder="Enter percentage"
                      value={formData.default_amount.toString()}
                      onChange={(e) => setFormData({ ...formData, default_amount: parseFloat(e.target.value) || 0 })}
                      endContent="%"
                    />
                    <Select
                      label="Percentage Of"
                      placeholder="Select percentage base"
                      selectedKeys={formData.percentage_of ? [formData.percentage_of] : []}
                      onSelectionChange={(keys) => setFormData({ ...formData, percentage_of: Array.from(keys)[0] as string })}
                    >
                      <SelectItem key="basic_salary" value="basic_salary">Basic Salary</SelectItem>
                      <SelectItem key="gross_salary" value="gross_salary">Gross Salary</SelectItem>
                      <SelectItem key="net_salary" value="net_salary">Net Salary</SelectItem>
                    </Select>
                  </div>
                )}

                {formData.calculation_type === 'formula' && (
                  <Input
                    label="Formula"
                    placeholder="Enter calculation formula (e.g., basic_salary * 0.1)"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                  />
                )}

                <Divider />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700">Taxable</p>
                      <p className="text-xs text-default-500">Is this component subject to tax?</p>
                    </div>
                    <Switch
                      isSelected={formData.is_taxable}
                      onValueChange={(value) => setFormData({ ...formData, is_taxable: value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700">Fixed Amount</p>
                      <p className="text-xs text-default-500">Is this a fixed amount or variable?</p>
                    </div>
                    <Switch
                      isSelected={formData.is_fixed}
                      onValueChange={(value) => setFormData({ ...formData, is_fixed: value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700">Mandatory</p>
                      <p className="text-xs text-default-500">Is this component mandatory?</p>
                    </div>
                    <Switch
                      isSelected={formData.is_mandatory}
                      onValueChange={(value) => setFormData({ ...formData, is_mandatory: value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-default-700">Active</p>
                      <p className="text-xs text-default-500">Is this component active?</p>
                    </div>
                    <Switch
                      isSelected={formData.is_active}
                      onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                    />
                  </div>
                </div>

                <Input
                  label="Sort Order"
                  type="number"
                  placeholder="Enter sort order"
                  value={formData.sort_order.toString()}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSaveComponent}
                isLoading={saving}
                isDisabled={!formData.name.trim()}
              >
                {editingComponent ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Component Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <Icon icon="lucide:eye" className="text-primary" />
                Component Details
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedComponent && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      selectedComponent.type === 'earning' ? 'bg-success-100' : 'bg-danger-100'
                    }`}>
                      <Icon 
                        icon={getTypeIcon(selectedComponent.type)} 
                        className={`text-2xl ${
                          selectedComponent.type === 'earning' ? 'text-success-600' : 'text-danger-600'
                        }`} 
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedComponent.name}</h3>
                      {selectedComponent.code && (
                        <p className="text-default-600">Code: {selectedComponent.code}</p>
                      )}
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-default-600">Type</label>
                        <Chip
                          color={getTypeColor(selectedComponent.type)}
                          size="sm"
                          variant="flat"
                        >
                          {selectedComponent.type === 'earning' ? 'Earning' : 'Deduction'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm text-default-600">Calculation Type</label>
                        <Chip
                          color={getCalculationTypeColor(selectedComponent.calculation_type || 'fixed')}
                          size="sm"
                          variant="flat"
                        >
                          {selectedComponent.calculation_type || 'Fixed'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm text-default-600">Amount</label>
                        <p className="font-medium">
                          {selectedComponent.calculation_type === 'percentage' ? (
                            `${selectedComponent.percentage_of}%${selectedComponent.default_amount > 0 ? ` of ${formatCurrency(selectedComponent.default_amount)}` : ''}`
                          ) : selectedComponent.calculation_type === 'formula' ? (
                            'Formula-based'
                          ) : (
                            formatCurrency(selectedComponent.default_amount || 0)
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-default-600">Taxable</label>
                        <Chip
                          color={selectedComponent.is_taxable ? 'warning' : 'default'}
                          size="sm"
                          variant="flat"
                        >
                          {selectedComponent.is_taxable ? 'Yes' : 'No'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm text-default-600">Fixed Amount</label>
                        <Chip
                          color={selectedComponent.is_fixed ? 'primary' : 'secondary'}
                          size="sm"
                          variant="flat"
                        >
                          {selectedComponent.is_fixed ? 'Fixed' : 'Variable'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm text-default-600">Status</label>
                        <Chip
                          color={selectedComponent.is_active !== false ? 'success' : 'danger'}
                          size="sm"
                          variant="flat"
                        >
                          {selectedComponent.is_active !== false ? 'Active' : 'Inactive'}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  {selectedComponent.description && (
                    <>
                      <Divider />
                      <div>
                        <label className="text-sm text-default-600">Description</label>
                        <p className="font-medium">{selectedComponent.description}</p>
                      </div>
                    </>
                  )}

                  {selectedComponent.formula && (
                    <>
                      <Divider />
                      <div>
                        <label className="text-sm text-default-600">Formula</label>
                        <p className="font-medium font-mono bg-content2 p-2 rounded">{selectedComponent.formula}</p>
                      </div>
                    </>
                  )}
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
                  if (selectedComponent) {
                    handleEditComponent(selectedComponent);
                  }
                }}
              >
                Edit Component
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default SalaryComponentsPage;