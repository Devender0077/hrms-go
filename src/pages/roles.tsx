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
  Checkbox,
  Chip,
  Spinner,
  Input,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Textarea,
  Divider
} from '@heroui/react';
import { useAuth } from '../contexts/auth-context';
import { apiRequest } from '../services/api-service';
import { addToast } from '@heroui/react';
import HeroSection from '../components/common/HeroSection';
import { Icon } from '@iconify/react';

interface Permission {
  id: number;
  permission_name: string;
  name: string;
  module: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  company_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permission_count?: number;
  permissions?: Permission[];
}

const RolesPage: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isPermissionsOpen, onOpen: onPermissionsOpen, onClose: onPermissionsClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load roles from database
      const rolesResponse = await apiRequest('/users/roles');
      const rolesData = rolesResponse.data || [];
      
      // Load permissions
      const permissionsResponse = await apiRequest('/users/permissions');
      const permissionsData = permissionsResponse.data || [];
      
      setPermissions(permissionsData);
      
      // Load permission counts for each role
      const rolesWithCounts = await Promise.all(
        rolesData.map(async (role: Role) => {
          try {
            const rolePermissionsResponse = await apiRequest(`/users/roles/${role.name}/permissions`);
            const rolePermissions = rolePermissionsResponse.data || [];
            const permissionCount = rolePermissions.filter((p: any) => p.role_has_permission === 1).length;
            
            return {
              ...role,
              permission_count: permissionCount,
              permissions: rolePermissions
            };
          } catch (error) {
            console.error(`Error loading permissions for role ${role.name}:`, error);
            return {
              ...role,
              permission_count: 0,
              permissions: []
            };
          }
        })
      );
      
      setRoles(rolesWithCounts);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load roles data',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'super_admin': 'danger',
      'company_admin': 'warning',
      'hr_manager': 'primary',
      'manager': 'secondary',
      'employee': 'default'
    };
    return colors[roleName] || 'default';
  };

  const getRoleDisplayName = (roleName: string) => {
    const displayNames: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'company_admin': 'Company Admin',
      'hr_manager': 'HR Manager',
      'manager': 'Manager',
      'employee': 'Employee'
    };
    return displayNames[roleName] || roleName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      addToast({
        title: 'Error',
        description: 'Role name is required',
        color: 'danger'
      });
      return;
    }

    try {
      setSaving(true);
      await apiRequest('/users/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: newRole.name.trim(),
          description: newRole.description.trim()
        })
      });

      addToast({
        title: 'Success',
        description: 'Role created successfully',
        color: 'success'
      });

      setNewRole({ name: '', description: '' });
      onCreateClose();
      loadData();
    } catch (error) {
      console.error('Error creating role:', error);
      addToast({
        title: 'Error',
        description: 'Failed to create role',
        color: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || !selectedRole.name.trim()) {
      addToast({
        title: 'Error',
        description: 'Role name is required',
        color: 'danger'
      });
      return;
    }

    try {
      setSaving(true);
      await apiRequest(`/users/roles/${selectedRole.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: selectedRole.name.trim(),
          description: selectedRole.description.trim()
        })
      });

      addToast({
        title: 'Success',
        description: 'Role updated successfully',
        color: 'success'
      });

      onEditClose();
      loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update role',
        color: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      await apiRequest(`/users/roles/${selectedRole.id}`, {
        method: 'DELETE'
      });

      addToast({
        title: 'Success',
        description: 'Role deleted successfully',
        color: 'success'
      });

      onDeleteClose();
      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete role',
        color: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);
    
    try {
      const rolePermissionsResponse = await apiRequest(`/users/roles/${role.name}/permissions`);
      const rolePermissions = rolePermissionsResponse.data || [];
      
      const grantedPermissions = rolePermissions
        .filter((p: any) => p.role_has_permission === 1)
        .map((p: any) => p.id);
      
      setSelectedPermissions(grantedPermissions);
      onPermissionsOpen();
    } catch (error) {
      console.error(`Error loading permissions for ${role.name}:`, error);
      setSelectedPermissions([]);
      onPermissionsOpen();
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      await apiRequest(`/users/roles/${selectedRole.name}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: selectedPermissions })
      });

      addToast({
        title: 'Success',
        description: 'Permissions updated successfully',
        color: 'success'
      });

      onPermissionsClose();
      loadData();
    } catch (error) {
      console.error('Error saving permissions:', error);
      addToast({
        title: 'Error',
        description: 'Failed to save permissions',
        color: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(permissions.map(p => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSelectAllInModule = (module: string) => {
    const modulePermissions = permissions.filter(p => p.module === module);
    const modulePermissionIds = modulePermissions.map(p => p.id);
    setSelectedPermissions(prev => [...new Set([...prev, ...modulePermissionIds])]);
  };

  const handleDeselectAllInModule = (module: string) => {
    const modulePermissions = permissions.filter(p => p.module === module);
    const modulePermissionIds = modulePermissions.map(p => p.id);
    setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as { [key: string]: Permission[] });

  const canManageRoles = user?.role === 'admin' || user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroSection
        title="Role Management"
        subtitle="Manage user roles and their permissions"
        icon="lucide:shield-check"
        actions={[
          {
            label: "Create Role",
            icon: "lucide:plus",
            onPress: onCreateOpen,
            variant: "solid" as const,
            color: "primary" as const,
            isDisabled: !canManageRoles
          },
          {
            label: "Refresh",
            icon: "lucide:refresh-cw",
            onPress: loadData,
            color: "primary" as const
          }
        ]}
      />

      {/* Search and Filters */}
      <Card className="shadow-sm border border-default-200">
        <CardBody className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
                endContent={
                  searchQuery && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => setSearchQuery('')}
                    >
                      <Icon icon="lucide:x" className="w-4 h-4" />
                    </Button>
                  )
                }
                variant="bordered"
                size="md"
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip 
                color="success" 
                variant="flat" 
                size="sm"
                startContent={<Icon icon="lucide:check-circle" className="w-3 h-3" />}
              >
                {roles.filter(r => r.is_active).length} Active
              </Chip>
              <Chip 
                color="warning" 
                variant="flat" 
                size="sm"
                startContent={<Icon icon="lucide:alert-circle" className="w-3 h-3" />}
              >
                {roles.filter(r => !r.is_active).length} Inactive
              </Chip>
              <Chip 
                color="primary" 
                variant="flat" 
                size="sm"
                startContent={<Icon icon="lucide:users" className="w-3 h-3" />}
              >
                {roles.length} Total
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Roles Table */}
      <Card className="shadow-sm border border-default-200">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Icon icon="lucide:shield-check" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">System Roles</h3>
                <p className="text-sm text-default-500">Manage roles and their permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" size="sm">
                {filteredRoles.length} of {roles.length} roles
              </Chip>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table 
              aria-label="Roles table" 
              removeWrapper
              classNames={{
                wrapper: "min-h-[400px]",
                th: "bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 font-semibold",
                td: "py-4",
                tbody: "divide-y divide-default-200 dark:divide-default-700"
              }}
            >
              <TableHeader>
                <TableColumn className="w-[25%]">ROLE</TableColumn>
                <TableColumn className="w-[35%]">DESCRIPTION</TableColumn>
                <TableColumn className="w-[15%]">PERMISSIONS</TableColumn>
                <TableColumn className="w-[10%]">STATUS</TableColumn>
                <TableColumn className="w-[15%]">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No roles found">
                {filteredRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-default-50 dark:hover:bg-default-800/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full shadow-sm ${
                          getRoleColor(role.name) === 'danger' ? 'bg-danger-500' : 
                          getRoleColor(role.name) === 'warning' ? 'bg-warning-500' : 
                          getRoleColor(role.name) === 'primary' ? 'bg-primary-500' : 
                          getRoleColor(role.name) === 'secondary' ? 'bg-secondary-500' : 'bg-default-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground text-base">
                            {getRoleDisplayName(role.name)}
                          </div>
                          <div className="text-sm text-default-500 capitalize flex items-center gap-1 mt-1">
                            <Icon icon="lucide:user" className="w-3 h-3" />
                            {role.name.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-default-600">
                        {role.description || 'No description available'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:key" className="w-4 h-4 text-primary-500" />
                        <span className="font-semibold text-foreground">{role.permission_count || 0}</span>
                        <span className="text-sm text-default-500">permissions</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={role.is_active ? "success" : "warning"}
                        variant="flat"
                        size="sm"
                        startContent={
                          <Icon 
                            icon={role.is_active ? "lucide:check-circle" : "lucide:alert-circle"} 
                            className="w-3 h-3" 
                          />
                        }
                      >
                        {role.is_active ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          color="primary"
                          variant="flat"
                          size="sm"
                          onPress={() => handleManagePermissions(role)}
                          startContent={<Icon icon="lucide:key" className="w-4 h-4" />}
                          className="font-medium"
                        >
                          Permissions
                        </Button>
                        {canManageRoles && (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                              >
                                <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key="edit"
                                startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                                onPress={() => {
                                  setSelectedRole(role);
                                  onEditOpen();
                                }}
                              >
                                Edit Role
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Icon icon="lucide:trash-2" className="w-4 h-4" />}
                                onPress={() => {
                                  setSelectedRole(role);
                                  onDeleteOpen();
                                }}
                              >
                                Delete Role
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Create Role Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:plus" className="w-5 h-5 text-primary" />
              <span>Create New Role</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Role Name"
                placeholder="Enter role name (e.g., hr_specialist)"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                variant="bordered"
                isRequired
              />
              <Textarea
                label="Description"
                placeholder="Enter role description"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                variant="bordered"
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onCreateClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateRole} isLoading={saving}>
              Create Role
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:edit" className="w-5 h-5 text-primary" />
              <span>Edit Role</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Role Name"
                placeholder="Enter role name"
                value={selectedRole?.name || ''}
                onChange={(e) => setSelectedRole(prev => prev ? { ...prev, name: e.target.value } : null)}
                variant="bordered"
                isRequired
              />
              <Textarea
                label="Description"
                placeholder="Enter role description"
                value={selectedRole?.description || ''}
                onChange={(e) => setSelectedRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                variant="bordered"
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onEditClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleEditRole} isLoading={saving}>
              Update Role
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Role Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:trash-2" className="w-5 h-5 text-danger" />
              <span>Delete Role</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>? 
              This action cannot be undone.
            </p>
            {selectedRole && (
              <div className="mt-4 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                <p className="text-sm text-danger-600 dark:text-danger-400">
                  <Icon icon="lucide:alert-triangle" className="w-4 h-4 inline mr-1" />
                  This role has {selectedRole.permission_count || 0} permissions assigned.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteRole} isLoading={saving}>
              Delete Role
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Manage Permissions Modal */}
      <Modal isOpen={isPermissionsOpen} onClose={onPermissionsClose} size="5xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  selectedRole ? (getRoleColor(selectedRole.name) === 'danger' ? 'bg-danger' : 
                  getRoleColor(selectedRole.name) === 'warning' ? 'bg-warning' : 
                  getRoleColor(selectedRole.name) === 'primary' ? 'bg-primary' : 
                  getRoleColor(selectedRole.name) === 'secondary' ? 'bg-secondary' : 'bg-default') : 'bg-default'
                }`}></div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Manage Permissions - {selectedRole ? getRoleDisplayName(selectedRole.name) : ''}
                  </h3>
                  <p className="text-sm text-default-600 mt-1">
                    Select permissions for this role
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip color="primary" variant="flat" size="sm">
                  {selectedPermissions.length} of {permissions.length} selected
                </Chip>
                <Chip color="success" variant="flat" size="sm">
                  {permissions.length > 0 ? Math.round((selectedPermissions.length / permissions.length) * 100) : 0}%
                </Chip>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Bulk Actions */}
              <div className="flex flex-wrap gap-2 p-4 bg-default-50 dark:bg-default-100 rounded-lg">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={handleSelectAllPermissions}
                  startContent={<Icon icon="lucide:check-square" className="w-4 h-4" />}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  color="default"
                  variant="flat"
                  onPress={handleDeselectAllPermissions}
                  startContent={<Icon icon="lucide:square" className="w-4 h-4" />}
                >
                  Deselect All
                </Button>
              </div>

              {/* Permissions by Module */}
              {Object.keys(groupedPermissions).length > 0 ? (
                Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Icon icon="lucide:folder" className="w-5 h-5 text-primary" />
                        {module ? module.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'} Module
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          onPress={() => handleSelectAllInModule(module)}
                        >
                          All
                        </Button>
                        <Button
                          size="sm"
                          color="default"
                          variant="light"
                          onPress={() => handleDeselectAllInModule(module)}
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3 p-3 border border-default-200 rounded-lg hover:bg-default-50 dark:hover:bg-default-100 transition-colors">
                          <Checkbox
                            isSelected={selectedPermissions.includes(permission.id)}
                            onValueChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions(prev => [...prev, permission.id]);
                              } else {
                                setSelectedPermissions(prev => prev.filter(id => id !== permission.id));
                              }
                            }}
                            color="primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm">
                              {permission.permission_name}
                            </div>
                            <div className="text-xs text-default-500 mt-1">
                              {permission.description && permission.description.trim() ? permission.description : 'No description available'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Divider />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Icon icon="lucide:shield-off" className="w-12 h-12 text-default-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-default-500 mb-2">No Permissions Found</h3>
                  <p className="text-default-400">No permissions are available. Please check if the permissions table is populated.</p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onPermissionsClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSavePermissions} isLoading={saving}>
              Save Permissions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RolesPage;