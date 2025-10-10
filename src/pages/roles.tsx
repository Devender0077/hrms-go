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
  Divider,
  Pagination
} from '@heroui/react';
import { useAuth } from '../contexts/auth-context';
import { apiRequest } from '../services/api-service';
import { addToast } from '@heroui/react';
import HeroSection from '../components/common/HeroSection';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/translation-context';

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

interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  withPermissions: number;
}

interface RoleFilters {
  searchQuery: string;
  selectedStatus: string;
}

const RolesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filters state
  const [filters, setFilters] = useState<RoleFilters>({
    searchQuery: "",
    selectedStatus: "all"
  });

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
      
      // Load permissions - need to request ALL permissions for roles management
      const permissionsResponse = await apiRequest('/users/permissions?all=true');
      const permissionsData = permissionsResponse.data || [];
      
      // Ensure permissionsData is an array
      const permissionsArray = Array.isArray(permissionsData) ? permissionsData : [];
      setPermissions(permissionsArray);
      
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

  // Filtered roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           role.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesStatus = filters.selectedStatus === "all" || 
                           (filters.selectedStatus === "active" && role.is_active) ||
                           (filters.selectedStatus === "inactive" && !role.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [roles, filters]);

  // Paginated roles
  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRoles.slice(start, start + rowsPerPage);
  }, [filteredRoles, page, rowsPerPage]);

  // Statistics
  const stats: RoleStats = useMemo(() => {
    return {
      total: roles.length,
      active: roles.filter(r => r.is_active).length,
      inactive: roles.filter(r => !r.is_active).length,
      withPermissions: roles.filter(r => (r.permission_count || 0) > 0).length
    };
  }, [roles]);

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);

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
    if (!Array.isArray(permissions)) return;
    const modulePermissions = permissions.filter(p => p.module === module);
    const modulePermissionIds = modulePermissions.map(p => p.id);
    setSelectedPermissions(prev => [...new Set([...prev, ...modulePermissionIds])]);
  };

  const handleDeselectAllInModule = (module: string) => {
    if (!Array.isArray(permissions)) return;
    const modulePermissions = permissions.filter(p => p.module === module);
    const modulePermissionIds = modulePermissions.map(p => p.id);
    setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
  };

  // ✅ Safely group permissions with array check
  const groupedPermissions = Array.isArray(permissions) 
    ? permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      }, {} as { [key: string]: Permission[] })
    : {};

  const canManageRoles = user?.role === 'admin' || user?.role === 'super_admin';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 dark:text-default-400 mt-4 text-sm sm:text-base">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title={t("Role Management")}
          subtitle={t("Access Control")}
          description={t("Manage user roles and their permissions to control access to different parts of the system.")}
          icon="lucide:shield-check"
          illustration="role"
          actions={[
            {
              label: t("Create Role"),
              icon: "lucide:plus",
              onPress: onCreateOpen,
              variant: "solid",
              isDisabled: !canManageRoles
            },
            {
              label: "Refresh",
              icon: "lucide:refresh-cw",
              onPress: loadData,
              variant: "bordered"
            }
          ]}
        />

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Roles",
                value: stats.total,
                icon: "lucide:shield",
                color: "blue",
                bgColor: "bg-primary-100 dark:bg-primary-900/30",
                textColor: "text-primary-600 dark:text-primary-400"
              },
              {
                title: "Active",
                value: stats.active,
                icon: "lucide:shield-check",
                color: "green",
                bgColor: "bg-success-100 dark:bg-success-900/30",
                textColor: "text-success-600 dark:text-success-400"
              },
              {
                title: "With Permissions",
                value: stats.withPermissions,
                icon: "lucide:key",
                color: "yellow",
                bgColor: "bg-warning-100 dark:bg-warning-900/30",
                textColor: "text-warning-600 dark:text-warning-400"
              },
              {
                title: "Inactive",
                value: stats.inactive,
                icon: "lucide:shield-off",
                color: "purple",
                bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
                textColor: "text-secondary-600 dark:text-secondary-400"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardBody className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-default-500 dark:text-default-400 truncate">{stat.title}</p>
                        <p className={`text-xl sm:text-2xl font-bold ${stat.textColor} mt-1`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 ${stat.bgColor} rounded-full flex-shrink-0`}>
                        <Icon icon={stat.icon} className={`${stat.textColor} text-lg sm:text-xl`} />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search roles..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  aria-label="Search roles"
                />
                
                <select
                  className="px-3 py-2 border border-default-200 rounded-lg bg-background text-foreground"
                  value={filters.selectedStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, selectedStatus: e.target.value }))}
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Roles Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:table" className="text-success-600 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Role List</h3>
                  <p className="text-default-500 text-sm">
                    {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <Table aria-label="Roles table">
                <TableHeader>
                  <TableColumn>{t("Role").toUpperCase()}</TableColumn>
                  <TableColumn>{t("Description").toUpperCase()}</TableColumn>
                  <TableColumn>{t("Permissions").toUpperCase()}</TableColumn>
                  <TableColumn>{t("Status").toUpperCase()}</TableColumn>
                  <TableColumn>{t("Actions").toUpperCase()}</TableColumn>
                </TableHeader>
                <TableBody emptyContent={
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    {/* Illustration */}
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="flex flex-col items-center space-y-2">
                          {/* Shield illustration */}
                          <div className="flex items-center space-x-1">
                            <div className="w-8 h-10 bg-primary-500 rounded-sm"></div>
                            <div className="w-6 h-8 bg-primary-600 rounded-sm"></div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-primary-300 rounded-full"></div>
                            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center">
                        <Icon icon="lucide:shield-plus" className="text-warning-600 text-xs" />
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                        <Icon icon="lucide:key" className="text-success-600 text-xs" />
                      </div>
                    </div>
                    
                    {/* Text content */}
                    <h3 className="text-lg font-semibold text-foreground mb-2">No roles found</h3>
                    <p className="text-default-500 text-center max-w-sm mb-4">
                      Get started by creating your first role to manage user permissions.
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
                        onPress={onCreateOpen}
                        isDisabled={!canManageRoles}
                      >
                        Create Role
                      </Button>
                    </div>
                  </div>
                }>
                  {paginatedRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            getRoleColor(role.name) === 'danger' ? 'bg-danger-100 dark:bg-danger-900/30' : 
                            getRoleColor(role.name) === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30' : 
                            getRoleColor(role.name) === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30' : 
                            getRoleColor(role.name) === 'secondary' ? 'bg-secondary-100 dark:bg-secondary-900/30' : 'bg-default-100 dark:bg-default-900/30'
                          }`}>
                            <Icon 
                              icon="lucide:shield" 
                              className={`w-5 h-5 ${
                                getRoleColor(role.name) === 'danger' ? 'text-danger-600 dark:text-danger-400' : 
                                getRoleColor(role.name) === 'warning' ? 'text-warning-600 dark:text-warning-400' : 
                                getRoleColor(role.name) === 'primary' ? 'text-primary-600 dark:text-primary-400' : 
                                getRoleColor(role.name) === 'secondary' ? 'text-secondary-600 dark:text-secondary-400' : 'text-default-600 dark:text-default-400'
                              }`} 
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {getRoleDisplayName(role.name)}
                            </p>
                            <p className="text-sm text-default-500">{role.name}</p>
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
                          <Icon icon="lucide:key" className="text-default-400 text-sm" />
                          <span className="text-sm font-medium">{role.permission_count || 0}</span>
                          <span className="text-xs text-default-500">permissions</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={role.is_active ? "success" : "default"}
                          variant="flat"
                          size="sm"
                        >
                          {role.is_active ? "Active" : "Inactive"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Dropdown closeOnSelect>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light" aria-label={`Actions for ${role.name}`}>
                              <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label={`Role actions for ${role.name}`}>
                            <DropdownItem
                              key="permissions"
                              startContent={<Icon icon="lucide:key" />}
                              onPress={() => handleManagePermissions(role)}
                              textValue="Manage role permissions"
                            >
                              Manage Permissions
                            </DropdownItem>
                            {canManageRoles && (
                              <>
                                <DropdownItem
                                  key="edit"
                                  startContent={<Icon icon="lucide:edit" />}
                                  onPress={() => {
                                    setSelectedRole(role);
                                    onEditOpen();
                                  }}
                                  textValue="Edit role information"
                                >
                                  Edit Role
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                  color="danger"
                                  startContent={<Icon icon="lucide:trash-2" />}
                                  onPress={() => {
                                    setSelectedRole(role);
                                    onDeleteOpen();
                                  }}
                                  textValue="Delete role"
                                >
                                  Delete Role
                                </DropdownItem>
                              </>
                            )}
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

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
    </div>
  );
};

export default RolesPage;