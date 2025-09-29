import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
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
  Spinner,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Divider,
  Checkbox
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { apiRequest } from "../../services/api-service";

interface AttendanceRegulation {
  id: number;
  title: string;
  description: string;
  regulation_type: 'policy' | 'rule' | 'guideline' | 'procedure';
  category: 'attendance' | 'overtime' | 'leave' | 'remote_work' | 'breaks' | 'holidays';
  department_id?: number;
  employee_id?: number;
  department_name?: string;
  employee_name?: string;
  effective_date: string;
  expiry_date?: string;
  is_mandatory: boolean;
  penalty_description?: string;
  compliance_requirements?: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  company_id: number;
}

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const RegulationsPage: React.FC = () => {
  const [regulations, setRegulations] = useState<AttendanceRegulation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const { isOpen: isAddModalOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  
  const [selectedRegulation, setSelectedRegulation] = useState<AttendanceRegulation | null>(null);
  const [editingRegulation, setEditingRegulation] = useState<AttendanceRegulation | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    regulation_type: 'policy' as 'policy' | 'rule' | 'guideline' | 'procedure',
    category: 'attendance' as 'attendance' | 'overtime' | 'leave' | 'remote_work' | 'breaks' | 'holidays',
    department_id: '',
    employee_id: '',
    effective_date: '',
    expiry_date: '',
    is_mandatory: true,
    penalty_description: '',
    compliance_requirements: '',
    is_active: true
  });

  useEffect(() => {
    loadRegulations();
    loadDepartments();
    loadEmployees();
  }, []);

  const loadRegulations = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/timekeeping/regulations');
      setRegulations(response.data || []);
    } catch (error) {
      console.error('Error loading regulations:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load attendance regulations',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiRequest('/organization/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiRequest('/employees');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const filteredRegulations = useMemo(() => {
    return regulations.filter(regulation => {
      const matchesSearch = 
        (regulation.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (regulation.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || regulation.regulation_type === selectedType;
      const matchesCategory = selectedCategory === 'all' || regulation.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && regulation.is_active) ||
        (selectedStatus === 'inactive' && !regulation.is_active);
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [regulations, searchQuery, selectedType, selectedCategory, selectedStatus]);

  const handleAddRegulation = async () => {
    try {
      const regulationData = {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null,
        expiry_date: formData.expiry_date || null
      };

      await apiRequest('/timekeeping/regulations', {
        method: 'POST',
        body: regulationData
      });

      addToast({
        title: 'Success',
        description: 'Attendance regulation created successfully',
        color: 'success'
      });

      loadRegulations();
      resetForm();
      onAddClose();
    } catch (error) {
      console.error('Error creating regulation:', error);
      addToast({
        title: 'Error',
        description: 'Failed to create attendance regulation',
        color: 'danger'
      });
    }
  };

  const handleEditRegulation = async () => {
    if (!editingRegulation) return;

    try {
      const regulationData = {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null,
        expiry_date: formData.expiry_date || null
      };

      await apiRequest(`/timekeeping/regulations/${editingRegulation.id}`, {
        method: 'PUT',
        body: regulationData
      });

      addToast({
        title: 'Success',
        description: 'Attendance regulation updated successfully',
        color: 'success'
      });

      loadRegulations();
      resetForm();
      onEditClose();
    } catch (error) {
      console.error('Error updating regulation:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update attendance regulation',
        color: 'danger'
      });
    }
  };

  const handleDeleteRegulation = async (regulationId: number) => {
    if (!confirm('Are you sure you want to delete this regulation?')) return;

    try {
      await apiRequest(`/timekeeping/regulations/${regulationId}`, {
        method: 'DELETE'
      });

      addToast({
        title: 'Success',
        description: 'Attendance regulation deleted successfully',
        color: 'success'
      });

      loadRegulations();
    } catch (error) {
      console.error('Error deleting regulation:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete attendance regulation',
        color: 'danger'
      });
    }
  };

  const handleToggleRegulationStatus = async (regulation: AttendanceRegulation) => {
    const newStatus = !regulation.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this regulation?`)) return;

    try {
      await apiRequest(`/timekeeping/regulations/${regulation.id}`, {
        method: 'PUT',
        body: {
          is_active: newStatus
        }
      });

      addToast({
        title: 'Success',
        description: `Attendance regulation ${action}d successfully`,
        color: 'success'
      });

      loadRegulations();
    } catch (error) {
      console.error(`Error ${action}ing regulation:`, error);
      addToast({
        title: 'Error',
        description: `Failed to ${action} attendance regulation`,
        color: 'danger'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      regulation_type: 'policy',
      category: 'attendance',
      department_id: '',
      employee_id: '',
      effective_date: '',
      expiry_date: '',
      is_mandatory: true,
      penalty_description: '',
      compliance_requirements: '',
      is_active: true
    });
  };

  const openEditModal = (regulation: AttendanceRegulation) => {
    setEditingRegulation(regulation);
    setFormData({
      title: regulation.title || '',
      description: regulation.description || '',
      regulation_type: regulation.regulation_type || 'policy',
      category: regulation.category || 'attendance',
      department_id: regulation.department_id?.toString() || '',
      employee_id: regulation.employee_id?.toString() || '',
      effective_date: regulation.effective_date ? regulation.effective_date.split('T')[0] : '',
      expiry_date: regulation.expiry_date ? regulation.expiry_date.split('T')[0] : '',
      is_mandatory: regulation.is_mandatory || false,
      penalty_description: regulation.penalty_description || '',
      compliance_requirements: regulation.compliance_requirements || '',
      is_active: regulation.is_active || false
    });
    onEditOpen();
  };

  const openViewModal = (regulation: AttendanceRegulation) => {
    setSelectedRegulation(regulation);
    onViewOpen();
  };

  const getRegulationTypeColor = (type: string) => {
    switch (type) {
      case 'policy': return 'primary';
      case 'rule': return 'secondary';
      case 'guideline': return 'success';
      case 'procedure': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attendance': return 'primary';
      case 'overtime': return 'secondary';
      case 'leave': return 'success';
      case 'remote_work': return 'warning';
      case 'breaks': return 'danger';
      case 'holidays': return 'default';
      default: return 'default';
    }
  };

  if (loading && regulations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Regulations</h1>
          <p className="text-default-600 mt-2">
            Manage attendance regulations and compliance requirements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onAddOpen}
          >
            Add Regulation
          </Button>
          <Icon icon="lucide:file-text" className="text-4xl text-primary-600" />
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search regulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="flex-1"
            />
            <Select
              placeholder="Type"
              selectedKeys={selectedType ? [selectedType] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedType(selected);
              }}
              className="w-full lg:w-48"
            >
              <SelectItem key="all">All Types</SelectItem>
              <SelectItem key="policy">Policy</SelectItem>
              <SelectItem key="rule">Rule</SelectItem>
              <SelectItem key="guideline">Guideline</SelectItem>
              <SelectItem key="procedure">Procedure</SelectItem>
            </Select>
            <Select
              placeholder="Category"
              selectedKeys={selectedCategory ? [selectedCategory] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedCategory(selected);
              }}
              className="w-full lg:w-48"
            >
              <SelectItem key="all">All Categories</SelectItem>
              <SelectItem key="attendance">Attendance</SelectItem>
              <SelectItem key="overtime">Overtime</SelectItem>
              <SelectItem key="leave">Leave</SelectItem>
              <SelectItem key="remote_work">Remote Work</SelectItem>
              <SelectItem key="breaks">Breaks</SelectItem>
              <SelectItem key="holidays">Holidays</SelectItem>
            </Select>
            <Select
              placeholder="Status"
              selectedKeys={selectedStatus ? [selectedStatus] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedStatus(selected);
              }}
              className="w-full lg:w-48"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="active">Active</SelectItem>
              <SelectItem key="inactive">Inactive</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Regulations Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:table" className="text-success-600 text-xl" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Attendance Regulations</h3>
              <p className="text-default-500 text-sm">
                {filteredRegulations.length} of {regulations.length} regulations
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <Table aria-label="Attendance regulations table">
            <TableHeader>
              <TableColumn>REGULATION TITLE</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>APPLIES TO</TableColumn>
              <TableColumn>EFFECTIVE DATE</TableColumn>
              <TableColumn>MANDATORY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No attendance regulations found">
              {filteredRegulations.map((regulation) => (
                <TableRow key={regulation.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{regulation.title || 'N/A'}</p>
                      <p className="text-sm text-default-500 truncate max-w-xs">
                        {regulation.description || 'No description'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getRegulationTypeColor(regulation.regulation_type) as any}
                      variant="flat"
                      size="sm"
                    >
                      {regulation.regulation_type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getCategoryColor(regulation.category) as any}
                      variant="flat"
                      size="sm"
                    >
                      {regulation.category.replace('_', ' ')}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {regulation.department_name && (
                      <span className="text-sm text-foreground">{regulation.department_name}</span>
                    )}
                    {regulation.employee_name && (
                      <span className="text-sm text-foreground">{regulation.employee_name}</span>
                    )}
                    {!regulation.department_name && !regulation.employee_name && (
                      <span className="text-sm text-default-500">All Employees</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(regulation.effective_date).toLocaleDateString()}</div>
                      {regulation.expiry_date && (
                        <div className="text-default-500">Expires: {new Date(regulation.expiry_date).toLocaleDateString()}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={regulation.is_mandatory ? 'warning' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {regulation.is_mandatory ? 'Mandatory' : 'Optional'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={regulation.is_active ? 'success' : 'danger'}
                      variant="flat"
                      size="sm"
                    >
                      {regulation.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown closeOnSelect>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label={`Actions for regulation ${regulation.title || 'N/A'}`}>
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label={`Regulation actions for ${regulation.title || 'N/A'}`}>
                        <DropdownItem
                          key="view"
                          startContent={<Icon icon="lucide:eye" />}
                          onPress={() => openViewModal(regulation)}
                          textValue="View regulation details"
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => openEditModal(regulation)}
                          textValue="Edit regulation information"
                        >
                          Edit Regulation
                        </DropdownItem>
                        <DropdownItem
                          key="toggle"
                          startContent={<Icon icon={regulation.is_active ? "lucide:user-x" : "lucide:user-check"} />}
                          onPress={() => handleToggleRegulationStatus(regulation)}
                          className={regulation.is_active ? "text-warning" : "text-success"}
                          textValue={regulation.is_active ? "Deactivate regulation" : "Activate regulation"}
                        >
                          {regulation.is_active ? 'Deactivate Regulation' : 'Activate Regulation'}
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<Icon icon="lucide:trash" />}
                          className="text-danger"
                          color="danger"
                          onPress={() => handleDeleteRegulation(regulation.id)}
                          textValue="Delete regulation"
                        >
                          Delete Regulation
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

      {/* Add Regulation Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Attendance Regulation
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Regulation Title"
                      placeholder="Enter regulation title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      isRequired
                    />
                    <Select
                      label="Regulation Type"
                      selectedKeys={[formData.regulation_type]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, regulation_type: selected as any});
                      }}
                      isRequired
                    >
                      <SelectItem key="policy">Policy</SelectItem>
                      <SelectItem key="rule">Rule</SelectItem>
                      <SelectItem key="guideline">Guideline</SelectItem>
                      <SelectItem key="procedure">Procedure</SelectItem>
                    </Select>
                  </div>

                  <Select
                    label="Category"
                    selectedKeys={[formData.category]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({...formData, category: selected as any});
                    }}
                    isRequired
                  >
                    <SelectItem key="attendance">Attendance</SelectItem>
                    <SelectItem key="overtime">Overtime</SelectItem>
                    <SelectItem key="leave">Leave</SelectItem>
                    <SelectItem key="remote_work">Remote Work</SelectItem>
                    <SelectItem key="breaks">Breaks</SelectItem>
                    <SelectItem key="holidays">Holidays</SelectItem>
                  </Select>

                  <Textarea
                    label="Description"
                    placeholder="Enter regulation description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Effective Date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Expiry Date (Optional)"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    />
                  </div>

                  <Textarea
                    label="Penalty Description (Optional)"
                    placeholder="Describe penalties for non-compliance"
                    value={formData.penalty_description}
                    onChange={(e) => setFormData({...formData, penalty_description: e.target.value})}
                    rows={2}
                  />

                  <Textarea
                    label="Compliance Requirements (Optional)"
                    placeholder="Describe compliance requirements"
                    value={formData.compliance_requirements}
                    onChange={(e) => setFormData({...formData, compliance_requirements: e.target.value})}
                    rows={2}
                  />

                  <div className="flex items-center gap-4">
                    <Checkbox
                      isSelected={formData.is_mandatory}
                      onValueChange={(checked) => setFormData({...formData, is_mandatory: checked})}
                    >
                      Mandatory Regulation
                    </Checkbox>
                    <Checkbox
                      isSelected={formData.is_active}
                      onValueChange={(checked) => setFormData({...formData, is_active: checked})}
                    >
                      Active
                    </Checkbox>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddRegulation}>
                  Add Regulation
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Regulation Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Attendance Regulation
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Regulation Title"
                      placeholder="Enter regulation title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      isRequired
                    />
                    <Select
                      label="Regulation Type"
                      selectedKeys={[formData.regulation_type]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, regulation_type: selected as any});
                      }}
                      isRequired
                    >
                      <SelectItem key="policy">Policy</SelectItem>
                      <SelectItem key="rule">Rule</SelectItem>
                      <SelectItem key="guideline">Guideline</SelectItem>
                      <SelectItem key="procedure">Procedure</SelectItem>
                    </Select>
                  </div>

                  <Select
                    label="Category"
                    selectedKeys={[formData.category]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({...formData, category: selected as any});
                    }}
                    isRequired
                  >
                    <SelectItem key="attendance">Attendance</SelectItem>
                    <SelectItem key="overtime">Overtime</SelectItem>
                    <SelectItem key="leave">Leave</SelectItem>
                    <SelectItem key="remote_work">Remote Work</SelectItem>
                    <SelectItem key="breaks">Breaks</SelectItem>
                    <SelectItem key="holidays">Holidays</SelectItem>
                  </Select>

                  <Textarea
                    label="Description"
                    placeholder="Enter regulation description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Effective Date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Expiry Date (Optional)"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    />
                  </div>

                  <Textarea
                    label="Penalty Description (Optional)"
                    placeholder="Describe penalties for non-compliance"
                    value={formData.penalty_description}
                    onChange={(e) => setFormData({...formData, penalty_description: e.target.value})}
                    rows={2}
                  />

                  <Textarea
                    label="Compliance Requirements (Optional)"
                    placeholder="Describe compliance requirements"
                    value={formData.compliance_requirements}
                    onChange={(e) => setFormData({...formData, compliance_requirements: e.target.value})}
                    rows={2}
                  />

                  <div className="flex items-center gap-4">
                    <Checkbox
                      isSelected={formData.is_mandatory}
                      onValueChange={(checked) => setFormData({...formData, is_mandatory: checked})}
                    >
                      Mandatory Regulation
                    </Checkbox>
                    <Checkbox
                      isSelected={formData.is_active}
                      onValueChange={(checked) => setFormData({...formData, is_active: checked})}
                    >
                      Active
                    </Checkbox>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleEditRegulation}>
                  Update Regulation
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Regulation Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Regulation Details
              </ModalHeader>
              <ModalBody>
                {selectedRegulation && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Regulation Title</label>
                        <p className="text-sm text-foreground">{selectedRegulation.title || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Type</label>
                        <Chip 
                          color={getRegulationTypeColor(selectedRegulation.regulation_type) as any}
                          variant="flat"
                          size="sm"
                        >
                          {selectedRegulation.regulation_type}
                        </Chip>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-default-700">Description</label>
                      <p className="text-sm text-foreground">{selectedRegulation.description || 'No description'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Category</label>
                        <Chip 
                          color={getCategoryColor(selectedRegulation.category) as any}
                          variant="flat"
                          size="sm"
                        >
                          {selectedRegulation.category.replace('_', ' ')}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Mandatory</label>
                        <Chip 
                          color={selectedRegulation.is_mandatory ? 'warning' : 'default'}
                          variant="flat"
                          size="sm"
                        >
                          {selectedRegulation.is_mandatory ? 'Mandatory' : 'Optional'}
                        </Chip>
                      </div>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Effective Date</label>
                        <p className="text-sm text-foreground">{new Date(selectedRegulation.effective_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Expiry Date</label>
                        <p className="text-sm text-foreground">
                          {selectedRegulation.expiry_date ? new Date(selectedRegulation.expiry_date).toLocaleDateString() : 'No expiry'}
                        </p>
                      </div>
                    </div>

                    {selectedRegulation.penalty_description && (
                      <div>
                        <label className="text-sm font-medium text-default-700">Penalty Description</label>
                        <p className="text-sm text-foreground">{selectedRegulation.penalty_description}</p>
                      </div>
                    )}

                    {selectedRegulation.compliance_requirements && (
                      <div>
                        <label className="text-sm font-medium text-default-700">Compliance Requirements</label>
                        <p className="text-sm text-foreground">{selectedRegulation.compliance_requirements}</p>
                      </div>
                    )}

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Status</label>
                        <Chip 
                          color={selectedRegulation.is_active ? 'success' : 'danger'}
                          variant="flat"
                          size="sm"
                        >
                          {selectedRegulation.is_active ? 'Active' : 'Inactive'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Created</label>
                        <p className="text-sm text-foreground">
                          {new Date(selectedRegulation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegulationsPage;