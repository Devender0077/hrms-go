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
  Textarea,
  Switch,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Spinner,
  Pagination,
  Divider,
  Checkbox,
  CheckboxGroup,
  Select,
  SelectItem
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import PageLayout, { PageHeader } from '../../components/layout/PageLayout';
import { useAuthenticatedAPI } from '../../hooks/useAuthenticatedAPI';

interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count: number;
  permissions_count: number;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  module: string;
  description?: string;
}

const RolesPage: React.FC = () => {
  const { apiRequest } = useAuthenticatedAPI();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isSelectAllPermissions, setIsSelectAllPermissions] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRoleForReset, setSelectedRoleForReset] = useState<Role | null>(null);
  
  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    permissions: [] as number[]
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoles, setTotalRoles] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' // Show all roles by default
  });

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      const url = `/users/roles${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest(url, { method: 'GET' });
      if (response.success) {
        setRoles(response.data);
        setTotalRoles(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await apiRequest('/permissions', { method: 'GET' });
      if (response.success) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Refetch roles when status filter changes
  useEffect(() => {
    fetchRoles();
  }, [filters.status]);

  // Sync isSelectAllPermissions with selectedPermissions
  useEffect(() => {
    setIsSelectAllPermissions(selectedPermissions.length === permissions.length && permissions.length > 0);
  }, [selectedPermissions, permissions.length]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData
      };

      if (isEditMode && selectedRole) {
        // Update role (without permissions)
        const response = await apiRequest(`/users/roles/${selectedRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData)
        });
        
        if (response.success) {
          // Update permissions separately
          if (selectedPermissions.length > 0) {
            await apiRequest(`/roles/${selectedRole.name}/permissions`, {
              method: 'PUT',
              body: JSON.stringify({ permission_ids: selectedPermissions })
            });
          }
          
          await fetchRoles();
          onEditOpenChange();
          resetForm();
        }
      } else {
        // Create role
        const response = await apiRequest('/users/roles', {
          method: 'POST',
          body: JSON.stringify(submitData)
        });
        
        if (response.success) {
          // Update permissions for the new role
          if (selectedPermissions.length > 0) {
            await apiRequest(`/roles/${formData.name}/permissions`, {
              method: 'PUT',
              body: JSON.stringify({ permission_ids: selectedPermissions })
            });
          }
          
          await fetchRoles();
          onAddOpenChange();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  // Handle delete role
  const handleDelete = async (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (window.confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      try {
        const response = await apiRequest(`/users/roles/${roleId}`, { method: 'DELETE' });
        if (response.success) {
          await fetchRoles();
        }
      } catch (error: any) {
        console.error('Error deleting role:', error);
        
        // Show user-friendly error message
        if (error.message && error.message.includes('assigned to users')) {
          alert(`Cannot delete the "${role.name}" role because it is currently assigned to ${role.user_count} user(s). Please reassign these users to other roles before deleting this role.`);
        } else {
          alert('An error occurred while deleting the role. Please try again.');
        }
      }
    }
  };

  // Handle toggle role status (activate/deactivate)
  const handleToggleStatus = async (role: Role) => {
    const action = role.is_active ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this role?`)) {
      try {
        const response = await apiRequest(`/users/roles/${role.id}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            name: role.name,
            description: role.description,
            is_active: !role.is_active 
          })
        });
        if (response.success) {
          await fetchRoles();
        }
      } catch (error) {
        console.error(`Error ${action}ing role:`, error);
      }
    }
  };

  // Handle reset password for role users
  const handleResetPassword = (role: Role) => {
    setSelectedRoleForReset(role);
    setNewPassword('');
    setConfirmPassword('');
    setIsResetPasswordOpen(true);
  };

  // Handle password reset submission
  const handlePasswordResetSubmit = async () => {
    if (!selectedRoleForReset) return;
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    try {
      const response = await apiRequest(`/users/roles/${selectedRoleForReset.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword })
      });
      if (response.success) {
        alert(`Passwords have been reset for all users with the "${selectedRoleForReset.name}" role.`);
        setIsResetPasswordOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        setSelectedRoleForReset(null);
      }
    } catch (error) {
      console.error('Error resetting passwords:', error);
    }
  };

  // Select all permissions functions
  const handleSelectAllPermissions = () => {
    if (isSelectAllPermissions) {
      setSelectedPermissions([]);
      setIsSelectAllPermissions(false);
    } else {
      setSelectedPermissions(permissions.map(permission => permission.id));
      setIsSelectAllPermissions(true);
    }
  };

  const handleSelectPermission = (permissionId: number) => {
    let newSelectedPermissions;
    if (selectedPermissions.includes(permissionId)) {
      newSelectedPermissions = selectedPermissions.filter(id => id !== permissionId);
    } else {
      newSelectedPermissions = [...selectedPermissions, permissionId];
    }
    setSelectedPermissions(newSelectedPermissions);
    setIsSelectAllPermissions(newSelectedPermissions.length === permissions.length);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      permissions: []
    });
    setSelectedPermissions([]);
    setIsSelectAllPermissions(false);
    setSelectedRole(null);
    setIsEditMode(false);
  };

  // Fetch role permissions
  const fetchRolePermissions = async (roleName: string) => {
    try {
      const response = await apiRequest(`/roles/${roleName}/permissions`, { method: 'GET' });
      if (response.success) {
        return response.data.map((p: any) => p.id);
      }
      return [];
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
  };

  // Handle edit role
  const handleEdit = async (role: Role) => {
    setSelectedRole(role);
    setIsEditMode(true);
    
    // Fetch role permissions
    const rolePermissions = await fetchRolePermissions(role.name);
    
    setFormData({
      name: role.name,
      description: role.description,
      is_active: role.is_active,
      permissions: rolePermissions
    });
    setSelectedPermissions(rolePermissions);
    setIsSelectAllPermissions(rolePermissions.length === permissions.length);
    onEditOpen();
  };

  // Handle view role
  const handleView = async (role: Role) => {
    setSelectedRole(role);
    
    // Fetch role permissions for viewing
    const rolePermissions = await fetchRolePermissions(role.name);
    setSelectedPermissions(rolePermissions);
    
    onViewOpen();
  };

  // Filter roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = !filters.search || 
      role.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      role.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && role.is_active) ||
      (filters.status === 'inactive' && !role.is_active);

    return matchesSearch && matchesStatus;
  });

  // Paginate roles
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <PageLayout>
      <PageHeader
        title="Role Management"
        description="Manage user roles and their permissions"
        icon="lucide:shield"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Total Roles</p>
                <p className="text-2xl font-bold">{totalRoles}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Icon icon="lucide:shield" className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Active Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => r.is_active).length}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Icon icon="lucide:shield-check" className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Total Permissions</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <Icon icon="lucide:key" className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Modules</p>
                <p className="text-2xl font-bold">{Object.keys(groupedPermissions).length}</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Icon icon="lucide:layers" className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Roles</h3>
              <p className="text-sm text-default-600">Manage user roles and assign permissions</p>
            </div>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onAddOpen}
            >
              Add Role
            </Button>
          </CardHeader>

          <CardBody>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Search roles..."
                
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                startContent={<Icon icon="lucide:search" />}
                className="max-w-xs"
              />
              <Select
                placeholder="Filter by status"
                
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="max-w-xs"
              >
                <SelectItem key="all">All Status</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
              </Select>
            </div>

            {/* Roles Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <Table aria-label="Roles table">
                  <TableHeader>
                    <TableColumn>ROLE NAME</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>USERS</TableColumn>
                    <TableColumn>PERMISSIONS</TableColumn>
                    <TableColumn>CREATED</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No roles found">
                    {paginatedRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{role.name}</p>
                              {!role.is_active && (
                                <Chip size="sm" color="warning" variant="flat">
                                  Inactive
                                </Chip>
                              )}
                            </div>
                            <p className="text-sm text-default-600">ID: {role.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-xs truncate">{role.description}</p>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={role.is_active ? 'success' : 'default'}
                            variant="flat"
                            size="sm"
                          >
                            {role.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon icon="lucide:users" className="w-4 h-4 text-default-500" />
                            <span className="text-sm">{role.user_count}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon icon="lucide:key" className="w-4 h-4 text-default-500" />
                            <span className="text-sm">{role.permissions_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-default-600">
                            {new Date(role.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key="view"
                                startContent={<Icon icon="lucide:eye" />}
                                onPress={() => handleView(role)}
                              >
                                View
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                startContent={<Icon icon="lucide:edit" />}
                                onPress={() => handleEdit(role)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key={role.is_active ? "deactivate" : "activate"}
                                className={role.is_active ? "text-warning" : "text-success"}
                                color={role.is_active ? "warning" : "success"}
                                startContent={<Icon icon={role.is_active ? "lucide:x" : "lucide:check"} />}
                                onPress={() => handleToggleStatus(role)}
                              >
                                {role.is_active ? "Deactivate" : "Activate"}
                              </DropdownItem>
                              <DropdownItem
                                key="reset-password"
                                className="text-secondary"
                                color="secondary"
                                startContent={<Icon icon="lucide:key" />}
                                onPress={() => handleResetPassword(role)}
                              >
                                Reset Password
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Icon icon="lucide:trash" />}
                                onPress={() => handleDelete(role.id)}
                                isDisabled={role.user_count > 0}
                                description={role.user_count > 0 ? `Cannot delete - ${role.user_count} user(s) assigned` : undefined}
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
                      page={currentPage}
                      onChange={setCurrentPage}
                      showControls
                    />
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Add Role Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Role</ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Role Name"
                      placeholder="Enter role name"
                      
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        isSelected={formData.is_active}
                        onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                      />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                  
                  <Textarea
                    label="Description"
                    placeholder="Enter role description"
                    
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />

                  <Divider />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Permissions</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelectAllPermissions}
                          onChange={handleSelectAllPermissions}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-default-600">Select All</span>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                        <div key={module} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3 capitalize">{module.replace('_', ' ')}</h5>
                          <CheckboxGroup
                            
                            onValueChange={(values) => 
                              setSelectedPermissions(values.map(Number))
                            }
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {modulePermissions.map((permission) => (
                                <Checkbox
                                  key={permission.id}
                                  
                                  className="text-sm"
                                >
                                  {permission.permission_name}
                                </Checkbox>
                              ))}
                            </div>
                          </CheckboxGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Add Role
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Role</ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Role Name"
                      placeholder="Enter role name"
                      
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        isSelected={formData.is_active}
                        onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                      />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                  
                  <Textarea
                    label="Description"
                    placeholder="Enter role description"
                    
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />

                  <Divider />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Permissions</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelectAllPermissions}
                          onChange={handleSelectAllPermissions}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-default-600">Select All</span>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                        <div key={module} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3 capitalize">{module.replace('_', ' ')}</h5>
                          <CheckboxGroup
                            
                            onValueChange={(values) => 
                              setSelectedPermissions(values.map(Number))
                            }
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {modulePermissions.map((permission) => (
                                <Checkbox
                                  key={permission.id}
                                  
                                  className="text-sm"
                                >
                                  {permission.permission_name}
                                </Checkbox>
                              ))}
                            </div>
                          </CheckboxGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Update Role
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Role Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Role Details</ModalHeader>
              <ModalBody>
                {selectedRole && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedRole.name}</h3>
                      <p className="text-default-600">{selectedRole.description}</p>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-600">Status</p>
                        <Chip 
                          color={selectedRole.is_active ? 'success' : 'default'} 
                          variant="flat" 
                          size="sm"
                        >
                          {selectedRole.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-default-600">Users</p>
                        <p className="font-medium">{selectedRole.user_count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-600">Permissions</p>
                        <p className="font-medium">{selectedPermissions.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-600">Created</p>
                        <p className="font-medium">{new Date(selectedRole.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {selectedPermissions.length > 0 && (
                      <>
                        <Divider />
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Assigned Permissions</h4>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {Object.entries(
                              permissions
                                .filter(p => selectedPermissions.includes(p.id))
                                .reduce((acc, permission) => {
                                if (!acc[permission.module]) {
                                  acc[permission.module] = [];
                                }
                                acc[permission.module].push(permission);
                                return acc;
                              }, {} as Record<string, Permission[]>)
                            ).map(([module, modulePermissions]) => (
                              <div key={module} className="border rounded-lg p-3">
                                <h5 className="font-medium mb-2 capitalize text-sm">{module.replace('_', ' ')}</h5>
                                <div className="flex flex-wrap gap-1">
                                  {modulePermissions.map((permission) => (
                                    <Chip key={permission.id} size="sm" variant="flat">
                                      {permission.permission_name}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                            ))}
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
                <Button color="primary" onPress={() => {
                  onClose();
                  handleEdit(selectedRole!);
                }}>
                  Edit Role
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Reset Password for Role Users</ModalHeader>
              <ModalBody>
                {selectedRoleForReset && (
                  <div className="space-y-4">
                    <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                      <p className="text-warning-700 dark:text-warning-300">
                        This will reset the password for <strong>all users</strong> with the "{selectedRoleForReset.name}" role.
                      </p>
                    </div>
                    
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      
                      onChange={(e) => setNewPassword(e.target.value)}
                      isRequired
                      description="Password must be at least 6 characters long"
                    />
                    
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm new password"
                      
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      isRequired
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="warning" 
                  onPress={handlePasswordResetSubmit}
                  isDisabled={!newPassword || !confirmPassword}
                >
                  Reset Passwords
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default RolesPage;