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
  Spinner
} from '@heroui/react';
import { PlusIcon, PencilIcon, TrashIcon, MoreVerticalIcon } from 'lucide-react';
import { apiRequest } from '../../services/api-service';

interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  module: string;
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/v1/users/roles');
      if (response.success) {
        setRoles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await apiRequest('GET', '/api/v1/permissions');
      if (response.success) {
        setPermissions(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    onOpen();
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      is_active: role.is_active
    });
    onOpen();
  };

  const handleSaveRole = async () => {
    try {
      setSaving(true);
      const url = editingRole 
        ? `/api/v1/users/roles/${editingRole.id}`
        : '/api/v1/users/roles';
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, formData);
      if (response.success) {
        await fetchRoles();
        onClose();
      }
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        const response = await apiRequest('DELETE', `/api/v1/users/roles/${roleId}`);
        if (response.success) {
          await fetchRoles();
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'danger';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

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
          <h1 className="text-2xl font-bold text-foreground">Role Management</h1>
          <p className="text-default-600">Manage user roles and permissions</p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon size={20} />}
          onPress={handleCreateRole}
        >
          Add Role
        </Button>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Roles ({roles.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Roles table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="font-medium">{role.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-default-600">{role.description}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(role.is_active)}
                      size="sm"
                      variant="flat"
                    >
                      {getStatusText(role.is_active)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString()}
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
                          onPress={() => handleEditRole(role)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<TrashIcon size={16} />}
                          onPress={() => handleDeleteRole(role.id)}
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

      {/* Create/Edit Role Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Role Name"
                placeholder="Enter role name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              <Textarea
                label="Description"
                placeholder="Enter role description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  isSelected={formData.is_active}
                  onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                />
                <span className="text-sm text-default-600">Active</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveRole}
              isLoading={saving}
            >
              {editingRole ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RolesPage;
