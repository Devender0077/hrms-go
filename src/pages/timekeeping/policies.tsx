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
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { apiRequest } from "../../services/api-service";

interface AttendancePolicy {
  id: number;
  name: string;
  description: string;
  policy_type: 'general' | 'department' | 'employee';
  department_id?: number;
  employee_id?: number;
  department_name?: string;
  employee_name?: string;
  late_arrival_penalty: number;
  early_departure_penalty: number;
  absent_penalty: number;
  overtime_rate: number;
  max_overtime_hours: number;
  require_approval_for_overtime: boolean;
  allow_remote_work: boolean;
  require_location_tracking: boolean;
  auto_approve_overtime: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const { isOpen: isAddModalOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  
  const [selectedPolicy, setSelectedPolicy] = useState<AttendancePolicy | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    policy_type: 'general' as 'general' | 'department' | 'employee',
    department_id: '',
    employee_id: '',
    late_arrival_penalty: 0,
    early_departure_penalty: 0,
    absent_penalty: 0,
    overtime_rate: 1.5,
    max_overtime_hours: 4,
    require_approval_for_overtime: true,
    allow_remote_work: false,
    require_location_tracking: true,
    auto_approve_overtime: false,
    is_active: true
  });

  useEffect(() => {
    loadPolicies();
    loadDepartments();
    loadEmployees();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/timekeeping/policies');
      setPolicies(response.data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load attendance policies',
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

  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const matchesSearch = 
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || policy.policy_type === selectedType;
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && policy.is_active) ||
        (selectedStatus === 'inactive' && !policy.is_active);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [policies, searchQuery, selectedType, selectedStatus]);

  const handleAddPolicy = async () => {
    try {
      const policyData = {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null
      };

      await apiRequest('/timekeeping/policies', {
        method: 'POST',
        body: policyData
      });

      addToast({
        title: 'Success',
        description: 'Attendance policy created successfully',
        color: 'success'
      });

      loadPolicies();
      resetForm();
      onAddClose();
    } catch (error) {
      console.error('Error creating policy:', error);
      addToast({
        title: 'Error',
        description: 'Failed to create attendance policy',
        color: 'danger'
      });
    }
  };

  const handleEditPolicy = async () => {
    if (!editingPolicy) return;

    try {
      const policyData = {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null
      };

      await apiRequest(`/timekeeping/policies/${editingPolicy.id}`, {
        method: 'PUT',
        body: policyData
      });

      addToast({
        title: 'Success',
        description: 'Attendance policy updated successfully',
        color: 'success'
      });

      loadPolicies();
      resetForm();
      onEditClose();
    } catch (error) {
      console.error('Error updating policy:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update attendance policy',
        color: 'danger'
      });
    }
  };

  const handleDeletePolicy = async (policyId: number) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      await apiRequest(`/timekeeping/policies/${policyId}`, {
        method: 'DELETE'
      });

      addToast({
        title: 'Success',
        description: 'Attendance policy deleted successfully',
        color: 'success'
      });

      loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete attendance policy',
        color: 'danger'
      });
    }
  };

  const handleTogglePolicyStatus = async (policy: AttendancePolicy) => {
    const newStatus = !policy.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this policy?`)) return;

    try {
      await apiRequest(`/timekeeping/policies/${policy.id}`, {
        method: 'PUT',
        body: {
          is_active: newStatus
        }
      });

      addToast({
        title: 'Success',
        description: `Attendance policy ${action}d successfully`,
        color: 'success'
      });

      loadPolicies();
    } catch (error) {
      console.error(`Error ${action}ing policy:`, error);
      addToast({
        title: 'Error',
        description: `Failed to ${action} attendance policy`,
        color: 'danger'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      policy_type: 'general',
      department_id: '',
      employee_id: '',
      late_arrival_penalty: 0,
      early_departure_penalty: 0,
      absent_penalty: 0,
      overtime_rate: 1.5,
      max_overtime_hours: 4,
      require_approval_for_overtime: true,
      allow_remote_work: false,
      require_location_tracking: true,
      auto_approve_overtime: false,
      is_active: true
    });
  };

  const openEditModal = (policy: AttendancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      policy_type: policy.policy_type,
      department_id: policy.department_id?.toString() || '',
      employee_id: policy.employee_id?.toString() || '',
      late_arrival_penalty: policy.late_arrival_penalty,
      early_departure_penalty: policy.early_departure_penalty,
      absent_penalty: policy.absent_penalty,
      overtime_rate: policy.overtime_rate,
      max_overtime_hours: policy.max_overtime_hours,
      require_approval_for_overtime: policy.require_approval_for_overtime,
      allow_remote_work: policy.allow_remote_work,
      require_location_tracking: policy.require_location_tracking,
      auto_approve_overtime: policy.auto_approve_overtime,
      is_active: policy.is_active
    });
    onEditOpen();
  };

  const openViewModal = (policy: AttendancePolicy) => {
    setSelectedPolicy(policy);
    onViewOpen();
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'primary';
      case 'department': return 'secondary';
      case 'employee': return 'success';
      default: return 'default';
    }
  };

  if (loading && policies.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Attendance Policies</h1>
          <p className="text-gray-600 mt-2">
            Manage attendance policies and rules for your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onAddOpen}
          >
            Add Policy
          </Button>
          <Icon icon="lucide:shield-check" className="text-4xl text-blue-600" />
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              className="flex-1"
            />
            <Select
              placeholder="Policy Type"
              selectedKeys={selectedType ? [selectedType] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedType(selected);
              }}
              className="w-full lg:w-48"
            >
              <SelectItem key="all" value="all">All Types</SelectItem>
              <SelectItem key="general" value="general">General</SelectItem>
              <SelectItem key="department" value="department">Department</SelectItem>
              <SelectItem key="employee" value="employee">Employee</SelectItem>
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
              <SelectItem key="all" value="all">All Status</SelectItem>
              <SelectItem key="active" value="active">Active</SelectItem>
              <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Policies Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:table" className="text-green-600 text-xl" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Policies</h3>
              <p className="text-gray-500 text-sm">
                {filteredPolicies.length} of {policies.length} policies
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <Table aria-label="Attendance policies table">
            <TableHeader>
              <TableColumn>POLICY NAME</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>APPLIES TO</TableColumn>
              <TableColumn>PENALTIES</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No attendance policies found">
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{policy.name}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {policy.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getPolicyTypeColor(policy.policy_type) as any}
                      variant="flat"
                      size="sm"
                    >
                      {policy.policy_type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {policy.policy_type === 'department' && policy.department_name && (
                      <span className="text-sm text-gray-900">{policy.department_name}</span>
                    )}
                    {policy.policy_type === 'employee' && policy.employee_name && (
                      <span className="text-sm text-gray-900">{policy.employee_name}</span>
                    )}
                    {policy.policy_type === 'general' && (
                      <span className="text-sm text-gray-500">All Employees</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Late: ${policy.late_arrival_penalty}</div>
                      <div>Early: ${policy.early_departure_penalty}</div>
                      <div>Absent: ${policy.absent_penalty}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={policy.is_active ? 'success' : 'danger'}
                      variant="flat"
                      size="sm"
                    >
                      {policy.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown closeOnSelect>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label={`Actions for policy ${policy.name}`}>
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label={`Policy actions for ${policy.name}`}>
                        <DropdownItem
                          key="view"
                          startContent={<Icon icon="lucide:eye" />}
                          onPress={() => openViewModal(policy)}
                          textValue="View policy details"
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => openEditModal(policy)}
                          textValue="Edit policy information"
                        >
                          Edit Policy
                        </DropdownItem>
                        <DropdownItem
                          key="toggle"
                          startContent={<Icon icon={policy.is_active ? "lucide:user-x" : "lucide:user-check"} />}
                          onPress={() => handleTogglePolicyStatus(policy)}
                          className={policy.is_active ? "text-warning" : "text-success"}
                          textValue={policy.is_active ? "Deactivate policy" : "Activate policy"}
                        >
                          {policy.is_active ? 'Deactivate Policy' : 'Activate Policy'}
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<Icon icon="lucide:trash" />}
                          className="text-danger"
                          color="danger"
                          onPress={() => handleDeletePolicy(policy.id)}
                          textValue="Delete policy"
                        >
                          Delete Policy
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

      {/* Add Policy Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Attendance Policy
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Policy Name"
                      placeholder="Enter policy name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      isRequired
                    />
                    <Select
                      label="Policy Type"
                      selectedKeys={[formData.policy_type]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, policy_type: selected as any});
                      }}
                      isRequired
                    >
                      <SelectItem key="general" value="general">General</SelectItem>
                      <SelectItem key="department" value="department">Department</SelectItem>
                      <SelectItem key="employee" value="employee">Employee</SelectItem>
                    </Select>
                  </div>

                  <Textarea
                    label="Description"
                    placeholder="Enter policy description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />

                  {formData.policy_type === 'department' && (
                    <Select
                      label="Department"
                      placeholder="Select department"
                      selectedKeys={formData.department_id ? [formData.department_id] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, department_id: selected});
                      }}
                    >
                      {departments.map((dept) => (
                        <SelectItem key={dept.id.toString()} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </Select>
                  )}

                  {formData.policy_type === 'employee' && (
                    <Select
                      label="Employee"
                      placeholder="Select employee"
                      selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, employee_id: selected});
                      }}
                    >
                      {employees.map((emp) => (
                        <SelectItem key={emp.id.toString()} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </Select>
                  )}

                  <Divider />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Late Arrival Penalty ($)"
                      type="number"
                      step="0.01"
                      value={formData.late_arrival_penalty.toString()}
                      onChange={(e) => setFormData({...formData, late_arrival_penalty: parseFloat(e.target.value) || 0})}
                    />
                    <Input
                      label="Early Departure Penalty ($)"
                      type="number"
                      step="0.01"
                      value={formData.early_departure_penalty.toString()}
                      onChange={(e) => setFormData({...formData, early_departure_penalty: parseFloat(e.target.value) || 0})}
                    />
                    <Input
                      label="Absent Penalty ($)"
                      type="number"
                      step="0.01"
                      value={formData.absent_penalty.toString()}
                      onChange={(e) => setFormData({...formData, absent_penalty: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Overtime Rate"
                      type="number"
                      step="0.1"
                      value={formData.overtime_rate.toString()}
                      onChange={(e) => setFormData({...formData, overtime_rate: parseFloat(e.target.value) || 1.5})}
                    />
                    <Input
                      label="Max Overtime Hours"
                      type="number"
                      step="0.5"
                      value={formData.max_overtime_hours.toString()}
                      onChange={(e) => setFormData({...formData, max_overtime_hours: parseFloat(e.target.value) || 4})}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddPolicy}>
                  Add Policy
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Policy Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Attendance Policy
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Policy Name"
                      placeholder="Enter policy name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      isRequired
                    />
                    <Select
                      label="Policy Type"
                      selectedKeys={[formData.policy_type]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, policy_type: selected as any});
                      }}
                      isRequired
                    >
                      <SelectItem key="general" value="general">General</SelectItem>
                      <SelectItem key="department" value="department">Department</SelectItem>
                      <SelectItem key="employee" value="employee">Employee</SelectItem>
                    </Select>
                  </div>

                  <Textarea
                    label="Description"
                    placeholder="Enter policy description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />

                  {formData.policy_type === 'department' && (
                    <Select
                      label="Department"
                      placeholder="Select department"
                      selectedKeys={formData.department_id ? [formData.department_id] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, department_id: selected});
                      }}
                    >
                      {departments.map((dept) => (
                        <SelectItem key={dept.id.toString()} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </Select>
                  )}

                  {formData.policy_type === 'employee' && (
                    <Select
                      label="Employee"
                      placeholder="Select employee"
                      selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, employee_id: selected});
                      }}
                    >
                      {employees.map((emp) => (
                        <SelectItem key={emp.id.toString()} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </Select>
                  )}

                  <Divider />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Late Arrival Penalty ($)"
                      type="number"
                      step="0.01"
                      value={formData.late_arrival_penalty.toString()}
                      onChange={(e) => setFormData({...formData, late_arrival_penalty: parseFloat(e.target.value) || 0})}
                    />
                    <Input
                      label="Early Departure Penalty ($)"
                      type="number"
                      step="0.01"
                      value={formData.early_departure_penalty.toString()}
                      onChange={(e) => setFormData({...formData, early_departure_penalty: parseFloat(e.target.value) || 0})}
                    />
                    <Input
                      label="Absent Penalty ($)"
                      type="number"
                      step="0.01"
                      value={formData.absent_penalty.toString()}
                      onChange={(e) => setFormData({...formData, absent_penalty: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Overtime Rate"
                      type="number"
                      step="0.1"
                      value={formData.overtime_rate.toString()}
                      onChange={(e) => setFormData({...formData, overtime_rate: parseFloat(e.target.value) || 1.5})}
                    />
                    <Input
                      label="Max Overtime Hours"
                      type="number"
                      step="0.5"
                      value={formData.max_overtime_hours.toString()}
                      onChange={(e) => setFormData({...formData, max_overtime_hours: parseFloat(e.target.value) || 4})}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleEditPolicy}>
                  Update Policy
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Policy Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Policy Details
              </ModalHeader>
              <ModalBody>
                {selectedPolicy && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Policy Name</label>
                        <p className="text-sm text-gray-900">{selectedPolicy.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <Chip 
                          color={getPolicyTypeColor(selectedPolicy.policy_type) as any}
                          variant="flat"
                          size="sm"
                        >
                          {selectedPolicy.policy_type}
                        </Chip>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-900">{selectedPolicy.description}</p>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Late Arrival Penalty</label>
                        <p className="text-sm text-gray-900">${selectedPolicy.late_arrival_penalty}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Early Departure Penalty</label>
                        <p className="text-sm text-gray-900">${selectedPolicy.early_departure_penalty}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Absent Penalty</label>
                        <p className="text-sm text-gray-900">${selectedPolicy.absent_penalty}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Overtime Rate</label>
                        <p className="text-sm text-gray-900">{selectedPolicy.overtime_rate}x</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Max Overtime Hours</label>
                        <p className="text-sm text-gray-900">{selectedPolicy.max_overtime_hours} hours</p>
                      </div>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <Chip 
                          color={selectedPolicy.is_active ? 'success' : 'danger'}
                          variant="flat"
                          size="sm"
                        >
                          {selectedPolicy.is_active ? 'Active' : 'Inactive'}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Created</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedPolicy.created_at).toLocaleDateString()}
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

export default PoliciesPage;
