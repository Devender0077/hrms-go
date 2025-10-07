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
  DropdownItem
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

interface RolePermission {
  id: number;
  role: string;
  permission_id: number;
  granted_by: number;
  granted_at: string;
}

interface Role {
  name: string;
  permissions: Permission[];
  permission_count: number;
}

const RolesPage: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Available roles in the system
  const availableRoles = [
    { name: 'super_admin', displayName: 'Super Admin', color: 'danger' },
    { name: 'company_admin', displayName: 'Company Admin', color: 'warning' },
    { name: 'hr_manager', displayName: 'HR Manager', color: 'primary' },
    { name: 'manager', displayName: 'Manager', color: 'secondary' },
    { name: 'employee', displayName: 'Employee', color: 'default' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load permissions
      console.log('🔄 Loading permissions...');
      const permissionsResponse = await apiRequest('/users/permissions');
      console.log('📡 Permissions API response:', permissionsResponse);
      
      const permissionsData = permissionsResponse.data || [];
      console.log(`📊 Raw permissions data length: ${permissionsData.length}`);
      
      // Validate permissions data structure
      const validPermissions = permissionsData.filter(permission => 
        permission && 
        permission.id && 
        permission.permission_name && 
        permission.module
      );
      
      setPermissions(validPermissions);
      console.log(`✅ Loaded ${validPermissions.length} valid permissions`);
      
      // Debug: Show sample permission structure
      if (validPermissions.length > 0) {
        console.log('📋 Sample permission structure:', validPermissions[0]);
      } else {
        console.warn('⚠️ No valid permissions found in response');
        console.log('🔍 Full response:', permissionsResponse);
      }

      // Load roles with their permissions
      const rolesData: Role[] = [];
      for (const role of availableRoles) {
        try {
          const roleResponse = await apiRequest(`/users/roles/${role.name}/permissions`);
          const rolePermissions = roleResponse.data || [];
          
          // Filter permissions that this role actually has
          const validRolePermissions = rolePermissions.filter(permission => 
            permission && permission.id && permission.role_has_permission === 1
          );
          
          rolesData.push({
            name: role.name,
            permissions: validRolePermissions,
            permission_count: validRolePermissions.length
          });
        } catch (error) {
          console.error(`Error loading permissions for ${role.name}:`, error);
          rolesData.push({
            name: role.name,
            permissions: [],
            permission_count: 0
          });
        }
      }
      
      setRoles(rolesData);
    } catch (error) {
      console.error('❌ Error loading roles data:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('Authentication required')) {
        addToast({
          title: 'Authentication Required',
          description: 'Please log in to access roles and permissions',
          color: 'warning'
        });
      } else {
        addToast({
          title: 'Error',
          description: 'Failed to load roles and permissions data',
          color: 'danger'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (roleName: string) => {
    try {
      setSelectedRole(roleName);
      
      // Fetch role permissions dynamically
      console.log(`🔄 Loading permissions for role: ${roleName}`);
      const roleResponse = await apiRequest(`/users/roles/${roleName}/permissions`);
      const rolePermissions = roleResponse.data || [];
      
      // Get permissions that this role has
      const grantedPermissions = rolePermissions
        .filter(p => p.role_has_permission === 1)
        .map(p => p.id);
      
      console.log(`📊 Role ${roleName} has ${grantedPermissions.length} permissions`);
      setSelectedPermissions(grantedPermissions);
      onEditOpen();
    } catch (error) {
      console.error(`Error loading permissions for ${roleName}:`, error);
      setSelectedPermissions([]);
      onEditOpen();
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllPermissions = () => {
    const allPermissionIds = permissions.map(p => p.id);
    setSelectedPermissions(allPermissionIds);
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSelectAllInModule = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    setSelectedPermissions(prev => {
      const otherPermissions = prev.filter(id => !modulePermissionIds.includes(id));
      return [...otherPermissions, ...modulePermissionIds];
    });
  };

  const handleDeselectAllInModule = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      
      await apiRequest(`/users/roles/${selectedRole}/permissions`, {
        method: 'PUT',
        body: {
          permission_ids: selectedPermissions
        }
      });

      addToast({
        title: 'Success',
        description: `Permissions updated for ${selectedRole}`,
        color: 'success'
      });

      onEditClose();
      loadData();
    } catch (error) {
      console.error('Error saving permissions:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update permissions',
        color: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (roleName: string) => {
    const role = availableRoles.find(r => r.name === roleName);
    return role?.color || 'default';
  };

  const getRoleDisplayName = (roleName: string) => {
    const role = availableRoles.find(r => r.name === roleName);
    return role?.displayName || roleName;
  };

  const filteredRoles = roles.filter(role =>
    getRoleDisplayName(role.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Debug logging
  console.log('🔍 Debug - Permissions count:', permissions.length);
  console.log('🔍 Debug - Grouped permissions keys:', Object.keys(groupedPermissions));
  console.log('🔍 Debug - Sample permission:', permissions[0]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroSection
          title="Roles & Permissions"
          subtitle="Access Control & Security"
          description="Manage user roles and their access permissions. Define granular access controls to ensure proper security and data protection across your HRMS platform."
          icon="lucide:shield-check"
          illustration="roles"
          actions={[
            {
              label: "Edit Permissions",
              icon: "lucide:settings",
              onPress: () => openEditModal(roles[0]?.name || ''),
              variant: "flat" as const
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
                  placeholder="Search roles by name or permissions..."
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
                  {roles.filter(r => r.permission_count > 0).length} Active
                </Chip>
                <Chip 
                  color="warning" 
                  variant="flat" 
                  size="sm"
                  startContent={<Icon icon="lucide:alert-circle" className="w-3 h-3" />}
                >
                  {roles.filter(r => r.permission_count === 0).length} Inactive
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
                  <h3 className="text-lg font-semibold text-foreground">Role Management</h3>
                  <p className="text-sm text-default-500">Manage user roles and their permissions</p>
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
                aria-label="Roles and permissions table" 
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
                  <TableColumn className="w-[35%]">PERMISSIONS</TableColumn>
                  <TableColumn className="w-[15%]">STATUS</TableColumn>
                  <TableColumn className="w-[25%]">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No roles found">
                  {filteredRoles.map((role) => (
                    <TableRow key={role.name} className="hover:bg-default-50 dark:hover:bg-default-800/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full shadow-sm ${
                            getRoleColor(role.name) === 'danger' ? 'bg-danger-500' : 
                            getRoleColor(role.name) === 'warning' ? 'bg-warning-500' : 
                            getRoleColor(role.name) === 'success' ? 'bg-success-500' : 'bg-primary-500'
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:key" className="w-4 h-4 text-primary-500" />
                            <span className="font-semibold text-foreground">{role.permission_count}</span>
                            <span className="text-sm text-default-500">permissions</span>
                            <div className="ml-2 w-16 bg-default-200 dark:bg-default-700 rounded-full h-2">
                              <div 
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${Math.min((role.permission_count / 224) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          {role.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {role.permissions.slice(0, 2).map((permission) => (
                                <Chip
                                  key={permission.id}
                                  size="sm"
                                  variant="flat"
                                  color="default"
                                  className="text-xs font-medium"
                                >
                                  {permission.permission_name.split('.')[0]}
                                </Chip>
                              ))}
                              {role.permissions.length > 2 && (
                                <Chip size="sm" variant="flat" color="primary" className="text-xs font-medium">
                                  +{role.permissions.length - 2} more
                                </Chip>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Chip
                            color={role.permission_count > 0 ? "success" : "warning"}
                            variant="flat"
                            size="sm"
                            startContent={
                              <Icon 
                                icon={role.permission_count > 0 ? "lucide:check-circle" : "lucide:alert-circle"} 
                                className="w-3 h-3" 
                              />
                            }
                          >
                            {role.permission_count > 0 ? "Active" : "Inactive"}
                          </Chip>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            color="primary"
                            variant="flat"
                            size="sm"
                            onPress={() => openEditModal(role.name)}
                            startContent={<Icon icon="lucide:settings" className="w-4 h-4" />}
                            className="font-medium"
                          >
                            Manage
                          </Button>
                          <Button
                            color="default"
                            variant="light"
                            size="sm"
                            isIconOnly
                            onPress={() => {
                              // Add view details functionality
                              console.log('View role details:', role.name);
                            }}
                          >
                            <Icon icon="lucide:eye" className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Edit Permissions Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  getRoleColor(selectedRole) === 'danger' ? 'bg-danger' : 
                  getRoleColor(selectedRole) === 'warning' ? 'bg-warning' : 
                  getRoleColor(selectedRole) === 'success' ? 'bg-success' : 'bg-primary'
                }`}></div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Manage Permissions - {getRoleDisplayName(selectedRole)}
                  </h3>
                  <p className="text-sm text-default-600 mt-1">
                    Select the permissions to grant to this role.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  onPress={handleSelectAllPermissions}
                  startContent={<Icon icon="lucide:check-square" className="w-4 h-4" />}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={handleDeselectAllPermissions}
                  startContent={<Icon icon="lucide:square" className="w-4 h-4" />}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="mb-4 p-3 bg-content1 rounded-lg border border-default-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:info" className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Selected Permissions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Chip 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                  >
                    {selectedPermissions.length} of {permissions.length}
                  </Chip>
                  <span className="text-xs text-default-500">
                    ({permissions.length > 0 ? Math.round((selectedPermissions.length / permissions.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-8">
                  <Icon icon="lucide:shield-off" className="w-12 h-12 text-default-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Permissions Found</h3>
                  <p className="text-default-500 mb-4">
                    {permissions.length === 0 
                      ? "No permissions are available. This might be due to authentication issues or empty permissions table."
                      : "Permissions are loaded but not properly grouped. Please check the console for errors."
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={loadData}
                      startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
                    >
                      Refresh Permissions
                    </Button>
                    <Button
                      color="secondary"
                      variant="flat"
                      onPress={() => window.location.href = '/login'}
                      startContent={<Icon icon="lucide:log-in" className="w-4 h-4" />}
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              ) : (
                Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <div key={module} className="border border-default-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:folder" className="w-4 h-4 text-default-500" />
                      <h4 className="text-base font-semibold text-foreground capitalize">
                        {module ? module.replace('_', ' ') : 'Unknown'} Module
                      </h4>
                      <Chip size="sm" variant="flat" color="default">
                        {modulePermissions.length}
                      </Chip>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="light"
                        color="success"
                        onPress={() => handleSelectAllInModule(modulePermissions)}
                        startContent={<Icon icon="lucide:check" className="w-3 h-3" />}
                      >
                        All
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDeselectAllInModule(modulePermissions)}
                        startContent={<Icon icon="lucide:x" className="w-3 h-3" />}
                      >
                        None
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className={`flex items-start gap-2 p-2 border rounded transition-all duration-200 cursor-pointer ${
                          selectedPermissions.includes(permission.id)
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-default-300 hover:bg-content1'
                        }`}
                        onClick={() => handlePermissionToggle(permission.id)}
                      >
                        <Checkbox
                          isSelected={selectedPermissions.includes(permission.id)}
                          onValueChange={() => handlePermissionToggle(permission.id)}
                          color="primary"
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">
                            {permission.permission_name}
                          </div>
                          <div className="text-xs text-default-500">
                            {permission.description && permission.description.trim() ? permission.description : 'No description available'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                ))
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onEditClose}
              isDisabled={saving}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSavePermissions}
              isLoading={saving}
              startContent={!saving && <Icon icon="lucide:save" className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RolesPage;