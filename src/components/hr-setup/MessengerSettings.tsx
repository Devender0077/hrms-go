import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
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
  Spinner,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../services/api-service';
import { useSettings } from '../../contexts/settings-context';

interface Group {
  id: number;
  name: string;
  description: string;
  group_type: string;
  created_by: number;
  created_by_name: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo: string | null;
  role_name: string;
  department_name: string;
}

export default function MessengerSettings() {
  const { settings, updateSetting } = useSettings();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'custom',
    member_ids: [] as number[]
  });

  // Messenger enabled state
  const [messengerEnabled, setMessengerEnabled] = useState(
    settings.general?.messengerEnabled ?? true
  );

  // Load groups
  const loadGroups = async () => {
    try {
      const response = await apiRequest<{ data: Group[] }>('/messenger/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const response = await apiRequest<{ data: User[] }>('/messenger/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  // Handle messenger toggle
  const handleMessengerToggle = async (enabled: boolean) => {
    setMessengerEnabled(enabled);
    try {
      await updateSetting('general', 'messengerEnabled', enabled, 'boolean');
      addToast({
        title: enabled ? 'Messenger Enabled' : 'Messenger Disabled',
        description: enabled 
          ? 'Users can now access the messenger' 
          : 'Messenger has been disabled for all users',
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating messenger setting:', error);
      addToast({
        title: 'Update Failed',
        description: 'Failed to update messenger setting',
        type: 'error',
        duration: 5000
      });
    }
  };

  // Handle create/edit group
  const handleSaveGroup = async () => {
    try {
      if (selectedGroup) {
        // Update existing group
        await apiRequest(`/messenger/groups/${selectedGroup.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            group_type: formData.group_type,
            is_active: true
          })
        });
        addToast({
          title: 'Group Updated',
          description: 'Message group updated successfully',
          type: 'success',
          duration: 3000
        });
      } else {
        // Create new group
        await apiRequest('/messenger/groups', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        addToast({
          title: 'Group Created',
          description: 'Message group created successfully',
          type: 'success',
          duration: 3000
        });
      }
      
      onClose();
      loadGroups();
      resetForm();
    } catch (error) {
      console.error('Error saving group:', error);
      addToast({
        title: 'Save Failed',
        description: 'Failed to save message group',
        type: 'error',
        duration: 5000
      });
    }
  };

  // Handle delete group
  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? All messages will be lost.')) {
      return;
    }

    try {
      await apiRequest(`/messenger/groups/${groupId}`, {
        method: 'DELETE'
      });
      addToast({
        title: 'Group Deleted',
        description: 'Message group deleted successfully',
        type: 'success',
        duration: 3000
      });
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      addToast({
        title: 'Delete Failed',
        description: 'Failed to delete message group',
        type: 'error',
        duration: 5000
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      group_type: 'custom',
      member_ids: []
    });
    setSelectedGroup(null);
  };

  // Open create modal
  const handleCreate = () => {
    resetForm();
    onOpen();
  };

  // Open edit modal
  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      group_type: group.group_type,
      member_ids: []
    });
    onOpen();
  };

  // Get group type color
  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'team_lead': return 'primary';
      case 'management': return 'secondary';
      case 'accounts': return 'success';
      case 'hr': return 'warning';
      case 'department': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messenger Enable/Disable */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Icon icon="lucide:message-circle" className="text-primary-600 dark:text-primary-400 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Messenger System</h3>
                <p className="text-sm text-default-500">Enable or disable the messenger feature</p>
              </div>
            </div>
            <Switch
              isSelected={messengerEnabled}
              onValueChange={handleMessengerToggle}
              size="lg"
              color="success"
            >
              {messengerEnabled ? 'Enabled' : 'Disabled'}
            </Switch>
          </div>
        </CardHeader>
      </Card>

      {/* Message Groups */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <Icon icon="lucide:users" className="text-secondary-600 dark:text-secondary-400 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Message Groups</h3>
                <p className="text-sm text-default-500">Create and manage message groups for team communication</p>
              </div>
            </div>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={handleCreate}
            >
              Create Group
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Message groups table">
            <TableHeader>
              <TableColumn>GROUP NAME</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>MEMBERS</TableColumn>
              <TableColumn>CREATED BY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No message groups found">
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{group.name}</p>
                      {group.description && (
                        <p className="text-xs text-default-500">{group.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getGroupTypeColor(group.group_type) as any} 
                      variant="flat"
                      size="sm"
                    >
                      {group.group_type.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:users" className="text-default-400" />
                      <span>{group.member_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>{group.created_by_name}</TableCell>
                  <TableCell>
                    <Chip 
                      color={group.is_active ? 'success' : 'default'} 
                      variant="flat"
                      size="sm"
                    >
                      {group.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(group)}
                      >
                        <Icon icon="lucide:edit" className="text-lg" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDeleteGroup(group.id)}
                      >
                        <Icon icon="lucide:trash-2" className="text-lg" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Group Type Info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
              <Icon icon="lucide:info" className="text-warning-600 dark:text-warning-400 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Group Types</h3>
              <p className="text-sm text-default-500">Different group types for organized communication</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-primary-200 dark:border-primary-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:user-check" className="text-primary-500 text-xl" />
                <h4 className="font-semibold text-primary-600 dark:text-primary-400">Team Lead</h4>
              </div>
              <p className="text-sm text-default-500">For team leaders and their direct reports</p>
            </div>
            
            <div className="p-4 border border-secondary-200 dark:border-secondary-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:briefcase" className="text-secondary-500 text-xl" />
                <h4 className="font-semibold text-secondary-600 dark:text-secondary-400">Management</h4>
              </div>
              <p className="text-sm text-default-500">For management and executive team</p>
            </div>
            
            <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:calculator" className="text-success-500 text-xl" />
                <h4 className="font-semibold text-success-600 dark:text-success-400">Accounts</h4>
              </div>
              <p className="text-sm text-default-500">For accounting and finance team</p>
            </div>
            
            <div className="p-4 border border-warning-200 dark:border-warning-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:users-2" className="text-warning-500 text-xl" />
                <h4 className="font-semibold text-warning-600 dark:text-warning-400">HR</h4>
              </div>
              <p className="text-sm text-default-500">For HR department communication</p>
            </div>
            
            <div className="p-4 border border-danger-200 dark:border-danger-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:building" className="text-danger-500 text-xl" />
                <h4 className="font-semibold text-danger-600 dark:text-danger-400">Department</h4>
              </div>
              <p className="text-sm text-default-500">For department-specific groups</p>
            </div>
            
            <div className="p-4 border border-default-200 dark:border-default-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:star" className="text-default-500 text-xl" />
                <h4 className="font-semibold text-default-600 dark:text-default-400">Custom</h4>
              </div>
              <p className="text-sm text-default-500">For any other custom groups</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Create/Edit Group Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {selectedGroup ? 'Edit Message Group' : 'Create Message Group'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Group Name"
                placeholder="Enter group name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                startContent={<Icon icon="lucide:tag" className="text-default-400" />}
              />

              <Textarea
                label="Description"
                placeholder="Enter group description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <Select
                label="Group Type"
                placeholder="Select group type"
                selectedKeys={[formData.group_type]}
                onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
                startContent={<Icon icon="lucide:folder" className="text-default-400" />}
              >
                <SelectItem key="team_lead" value="team_lead">
                  Team Lead
                </SelectItem>
                <SelectItem key="management" value="management">
                  Management
                </SelectItem>
                <SelectItem key="accounts" value="accounts">
                  Accounts
                </SelectItem>
                <SelectItem key="hr" value="hr">
                  HR
                </SelectItem>
                <SelectItem key="department" value="department">
                  Department
                </SelectItem>
                <SelectItem key="custom" value="custom">
                  Custom
                </SelectItem>
              </Select>

              {!selectedGroup && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Members</label>
                  <div className="border border-divider rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-default-100 dark:hover:bg-default-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          const isSelected = formData.member_ids.includes(user.id);
                          setFormData({
                            ...formData,
                            member_ids: isSelected
                              ? formData.member_ids.filter(id => id !== user.id)
                              : [...formData.member_ids, user.id]
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.member_ids.includes(user.id)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <Avatar
                          src={user.profile_photo || undefined}
                          name={user.name}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-default-500">
                            {user.role_name} {user.department_name && `• ${user.department_name}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-default-500 mt-2">
                    {formData.member_ids.length} member(s) selected
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveGroup}
              isDisabled={!formData.name}
            >
              {selectedGroup ? 'Update Group' : 'Create Group'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
