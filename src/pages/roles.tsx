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
  permission_key: string;
  permission_name: string;
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
      const permissionsResponse = await apiRequest('/permissions');
      setPermissions(permissionsResponse.data || []);

      // Load roles with their permissions
      const rolesData: Role[] = [];
      for (const role of availableRoles) {
        try {
          const roleResponse = await apiRequest(`/roles/${role.name}/permissions`);
          rolesData.push({
            name: role.name,
            permissions: roleResponse.data || [],
            permission_count: roleResponse.data?.length || 0
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
      console.error('Error loading roles data:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load roles and permissions data',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (roleName: string) => {
    const role = roles.find(r => r.name === roleName);
    setSelectedRole(roleName);
    setSelectedPermissions(role?.permissions.map(p => p.id) || []);
    onEditOpen();
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      
      await apiRequest(`/roles/${selectedRole}/permissions`, {
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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search roles..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              variant="bordered"
              size="md"
            />
          </div>
          <div className="flex gap-2">
            <Chip color="success" variant="flat" size="sm">
              {roles.filter(r => r.permission_count > 0).length} Active
            </Chip>
            <Chip color="warning" variant="flat" size="sm">
              {roles.filter(r => r.permission_count === 0).length} Inactive
            </Chip>
          </div>
        </div>

        {/* Roles Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Role Management</h3>
              <div className="text-sm text-default-500">
                {filteredRoles.length} of {roles.length} roles
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table aria-label="Roles and permissions table" removeWrapper>
              <TableHeader>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>PERMISSIONS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          getRoleColor(role.name) === 'danger' ? 'bg-danger' : 
                          getRoleColor(role.name) === 'warning' ? 'bg-warning' : 
                          getRoleColor(role.name) === 'success' ? 'bg-success' : 'bg-primary'
                        }`}></div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {getRoleDisplayName(role.name)}
                          </div>
                          <div className="text-sm text-default-500 capitalize">
                            {role.name.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:key" className="w-4 h-4 text-default-400" />
                        <span className="font-medium">{role.permission_count}</span>
                        <span className="text-sm text-default-500">permissions</span>
                      </div>
                      {role.permissions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Chip
                              key={permission.id}
                              size="sm"
                              variant="flat"
                              color="default"
                              className="text-xs"
                            >
                              {permission.permission_name}
                            </Chip>
                          ))}
                          {role.permissions.length > 3 && (
                            <Chip size="sm" variant="flat" color="default" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Chip>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={role.permission_count > 0 ? "success" : "warning"}
                        variant="flat"
                        size="sm"
                      >
                        {role.permission_count > 0 ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        onPress={() => openEditModal(role.name)}
                        startContent={<Icon icon="lucide:settings" className="w-4 h-4" />}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <div key={module} className="border border-default-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="lucide:folder" className="w-4 h-4 text-default-500" />
                    <h4 className="text-base font-semibold text-foreground capitalize">
                      {module.replace('_', ' ')} Module
                    </h4>
                    <Chip size="sm" variant="flat" color="default">
                      {modulePermissions.length}
                    </Chip>
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
                            {permission.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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