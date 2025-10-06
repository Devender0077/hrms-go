import React, { useState, useEffect } from "react";
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
  Select,
  SelectItem,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Spinner,
  Pagination,
  Switch,
  Textarea,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuthenticatedAPI } from "../hooks/useAuthenticatedAPI";
import HeroSection from "../components/common/HeroSection";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  first_name?: string;
  last_name?: string;
  department_name?: string;
  designation_name?: string;
  permission_count?: number;
  permissions_count?: number;
  created_at: string;
  last_login?: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  two_factor_enabled?: boolean;
  phone?: string;
  department_id?: number;
  designation_id?: number;
}

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
}

const UsersPage: React.FC = () => {
  const { apiRequest } = useAuthenticatedAPI();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const { isOpen: isResetPasswordOpen, onOpen: onResetPasswordOpen, onOpenChange: onResetPasswordOpenChange } = useDisclosure();
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "active",
    first_name: "",
    last_name: "",
    department_id: "",
    designation_id: "",
    phone: ""
  });

  // Password reset form state
  const [passwordResetData, setPasswordResetData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    department: ""
  });

  // Selection states
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/users', { method: 'GET' });
      if (response.success) {
        setUsers(response.data);
        setTotalUsers(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments and designations
  const fetchDepartmentsAndDesignations = async () => {
    try {
      const [deptResponse, desigResponse] = await Promise.all([
        apiRequest('/departments', { method: 'GET' }),
        apiRequest('/designations', { method: 'GET' })
      ]);
      
      if (deptResponse.success) setDepartments(deptResponse.data);
      if (desigResponse.success) setDesignations(desigResponse.data);
    } catch (error) {
      console.error('Error fetching departments/designations:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartmentsAndDesignations();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        designation_id: formData.designation_id ? parseInt(formData.designation_id) : null
      };

      if (isEditMode && selectedUser) {
        // Update user
        const response = await apiRequest(`/users/${selectedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        
        if (response.success) {
          await fetchUsers();
          onEditOpenChange();
          resetForm();
        }
      } else {
        // Create user
        const response = await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        if (response.success) {
          await fetchUsers();
          onAddOpenChange();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // Handle delete user
  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await apiRequest(`/users/${userId}`, { method: 'DELETE' });
        if (response.success) {
          await fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'enable' : 'disable';
    
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        const response = await apiRequest(`/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            status: newStatus,
            is_active: newStatus === 'active'
          })
        });
        
        if (response.success) {
          setUsers(users.map(u => 
            u.id === user.id ? { ...u, status: newStatus } : u
          ));
        }
      } catch (error) {
        console.error('Error toggling user status:', error);
      }
    }
  };

  // Handle reset password
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setPasswordResetData({
      newPassword: "",
      confirmPassword: ""
    });
    onResetPasswordOpen();
  };

  // Handle password reset submission
  const handlePasswordResetSubmit = async () => {
    if (!selectedUser) return;

    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (passwordResetData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      const response = await apiRequest(`/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ 
          temporary_password: passwordResetData.newPassword
        })
      });
      
      if (response.success) {
        alert(`Password reset successfully for ${selectedUser.name}!`);
        onResetPasswordOpenChange();
        setPasswordResetData({
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please try again.');
    }
  };

  // Handle view user
  const handleView = (user: User) => {
    setSelectedUser(user);
    onViewOpen();
  };

  // Handle edit user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      department_id: user.department_id?.toString() || '',
      designation_id: user.designation_id?.toString() || '',
      phone: user.phone || ''
    });
    onEditOpen();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      status: "active",
      first_name: "",
      last_name: "",
      department_id: "",
      designation_id: "",
      phone: ""
    });
    setSelectedUser(null);
    setIsEditMode(false);
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      for (const userId of selectedUsers) {
        await apiRequest(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ is_active: true })
        });
      }
      
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) 
          ? { ...user, status: 'active' }
          : user
      ));
      
      setSelectedUsers([]);
      setIsSelectAll(false);
    } catch (error) {
      console.error('Error activating users:', error);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      for (const userId of selectedUsers) {
        await apiRequest(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ is_active: false })
        });
      }
      
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) 
          ? { ...user, status: 'inactive' }
          : user
      ));
      
      setSelectedUsers([]);
      setIsSelectAll(false);
    } catch (error) {
      console.error('Error deactivating users:', error);
    }
  };

  const handleBulkResetPassword = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to reset passwords for ${selectedUsers.length} users?`)) {
      try {
        for (const userId of selectedUsers) {
          await apiRequest(`/users/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ 
              reset_password: true,
              temporary_password: 'TempPass123!'
            })
          });
        }
        
        alert(`Passwords reset successfully for ${selectedUsers.length} users. Temporary password: TempPass123!`);
        setSelectedUsers([]);
        setIsSelectAll(false);
      } catch (error) {
        console.error('Error resetting passwords:', error);
        alert('Failed to reset some passwords. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      try {
        for (const userId of selectedUsers) {
          await apiRequest(`/users/${userId}`, { method: 'DELETE' });
        }
        
        await fetchUsers();
        setSelectedUsers([]);
        setIsSelectAll(false);
      } catch (error) {
        console.error('Error deleting users:', error);
        alert('Failed to delete some users. Please try again.');
      }
    }
  };

  // Utility functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'danger';
      case 'company_admin': return 'warning';
      case 'hr_manager': return 'primary';
      case 'manager': return 'secondary';
      case 'employee': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Filter and paginate users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search || 
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Users Management"
          subtitle="System Access & Permissions"
          description="Manage system users, roles, and permissions. Control access levels, assign roles, and maintain security across your HRMS platform."
          icon="lucide:users"
          illustration="users"
          actions={[
            {
              label: "Add User",
              icon: "lucide:plus",
            onPress: onAddOpen,
            color: "primary" as const
          }
        ]}
      />
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-default-500 dark:text-default-400">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{totalUsers}</p>
              </div>
              <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full flex-shrink-0">
                <Icon icon="lucide:users" className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-default-500 dark:text-default-400">Active Users</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-success-100 dark:bg-success-900/30 rounded-full flex-shrink-0">
                <Icon icon="lucide:user-check" className="w-5 h-5 sm:w-6 sm:h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-default-500 dark:text-default-400">Admins</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{users.filter(u => ['super_admin', 'company_admin'].includes(u.role)).length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-warning-100 dark:bg-warning-900/30 rounded-full flex-shrink-0">
                <Icon icon="lucide:shield" className="w-5 h-5 sm:w-6 sm:h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-default-500 dark:text-default-400">Employees</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{users.filter(u => u.role === 'employee').length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex-shrink-0">
                <Icon icon="lucide:user" className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600 dark:text-secondary-400" />
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
              <h3 className="text-lg font-semibold">Users</h3>
              <p className="text-sm text-default-600">Manage system users and their permissions</p>
            </div>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onAddOpen}
            >
              Add User
            </Button>
          </CardHeader>

          <CardBody>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Search users..."
                
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                startContent={<Icon icon="lucide:search" />}
                className="max-w-xs"
              />
              <Select
                placeholder="Filter by role"
                
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="max-w-xs"
              >
                <SelectItem key="">All Roles</SelectItem>
                <SelectItem key="super_admin">Super Admin</SelectItem>
                <SelectItem key="company_admin">Company Admin</SelectItem>
                <SelectItem key="hr_manager">HR Manager</SelectItem>
                <SelectItem key="manager">Manager</SelectItem>
                <SelectItem key="employee">Employee</SelectItem>
              </Select>
              <Select
                placeholder="Filter by status"
                
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="max-w-xs"
              >
                <SelectItem key="">All Status</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
                <SelectItem key="suspended">Suspended</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <span className="text-sm text-primary-600 dark:text-primary-400">
                  {selectedUsers.length} user(s) selected
                </span>
                <Divider orientation="vertical" className="h-4" />
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  onPress={handleBulkActivate}
                  startContent={<Icon icon="lucide:check" />}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  onPress={handleBulkDeactivate}
                  startContent={<Icon icon="lucide:x" />}
                >
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  variant="flat"
                  onPress={handleBulkResetPassword}
                  startContent={<Icon icon="lucide:key" />}
                >
                  Reset Password
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={handleBulkDelete}
                  startContent={<Icon icon="lucide:trash-2" />}
                >
                  Delete
                </Button>
              </div>
            )}

            {/* Users Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <Table aria-label="Users table">
                  <TableHeader>
                    <TableColumn>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                        <span>USER</span>
                      </div>
                    </TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>DEPARTMENT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>PERMISSIONS</TableColumn>
                    <TableColumn>LAST LOGIN</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No users found">
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="rounded border-gray-300"
                            />
                            <Avatar
                              name={user.name}
                              size="sm"
                              className="flex-shrink-0"
                            />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-default-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getRoleColor(user.role)}
                            variant="flat"
                            size="sm"
                          >
                            {user.role.replace('_', ' ').toUpperCase()}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{user.department_name || 'N/A'}</p>
                            <p className="text-xs text-default-500">{user.designation_name || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getStatusColor(user.status)}
                            variant="flat"
                            size="sm"
                          >
                            {user.status.toUpperCase()}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon icon="lucide:key" className="w-4 h-4 text-default-500" />
                            <span className="text-sm">{user.permission_count || user.permissions_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-default-600">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
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
                                onPress={() => handleView(user)}
                              >
                                View
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                startContent={<Icon icon="lucide:edit" />}
                                onPress={() => handleEdit(user)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="toggle-status"
                                startContent={<Icon icon={user.status === 'active' ? 'lucide:user-x' : 'lucide:user-check'} />}
                                onPress={() => handleToggleStatus(user)}
                              >
                                {user.status === 'active' ? 'Disable' : 'Enable'}
                              </DropdownItem>
                              <DropdownItem
                                key="reset-password"
                                startContent={<Icon icon="lucide:key" />}
                                onPress={() => handleResetPassword(user)}
                              >
                                Reset Password
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Icon icon="lucide:trash" />}
                                onPress={() => handleDelete(user.id)}
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

      {/* Add User Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New User</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter full name"
                    
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                    
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    isRequired
                  />
                  <Select
                    label="Role"
                    placeholder="Select role"
                    
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    isRequired
                  >
                    <SelectItem key="super_admin">Super Admin</SelectItem>
                    <SelectItem key="company_admin">Company Admin</SelectItem>
                    <SelectItem key="hr_manager">HR Manager</SelectItem>
                    <SelectItem key="manager">Manager</SelectItem>
                    <SelectItem key="employee">Employee</SelectItem>
                  </Select>
                  <Select
                    label="Status"
                    placeholder="Select status"
                    
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <SelectItem key="active">Active</SelectItem>
                    <SelectItem key="inactive">Inactive</SelectItem>
                    <SelectItem key="suspended">Suspended</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                  </Select>
                  <Input
                    label="Phone"
                    placeholder="Enter phone number"
                    
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                  <Select
                    label="Department"
                    placeholder="Select department"
                    
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  >
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} >
                        {dept.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Designation"
                    placeholder="Select designation"
                    
                    onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                  >
                    {designations.map((desig) => (
                      <SelectItem key={desig.id} >
                        {desig.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Add User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit User</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter full name"
                    
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                    
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    isRequired
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Select
                    label="Role"
                    placeholder="Select role"
                    
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    isRequired
                  >
                    <SelectItem key="super_admin">Super Admin</SelectItem>
                    <SelectItem key="company_admin">Company Admin</SelectItem>
                    <SelectItem key="hr_manager">HR Manager</SelectItem>
                    <SelectItem key="manager">Manager</SelectItem>
                    <SelectItem key="employee">Employee</SelectItem>
                  </Select>
                  <Select
                    label="Status"
                    placeholder="Select status"
                    
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <SelectItem key="active">Active</SelectItem>
                    <SelectItem key="inactive">Inactive</SelectItem>
                    <SelectItem key="suspended">Suspended</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                  </Select>
                  <Input
                    label="Phone"
                    placeholder="Enter phone number"
                    
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                  <Select
                    label="Department"
                    placeholder="Select department"
                    
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  >
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} >
                        {dept.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Designation"
                    placeholder="Select designation"
                    
                    onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                  >
                    {designations.map((desig) => (
                      <SelectItem key={desig.id} >
                        {desig.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Update User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View User Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>User Details</ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar name={selectedUser.name} size="lg" />
                      <div>
                        <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                        <p className="text-default-600">{selectedUser.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Chip
                            color={getRoleColor(selectedUser.role)}
                            variant="flat"
                            size="sm"
                          >
                            {selectedUser.role.replace('_', ' ').toUpperCase()}
                          </Chip>
                          <Chip
                            color={getStatusColor(selectedUser.status)}
                            variant="flat"
                            size="sm"
                          >
                            {selectedUser.status.toUpperCase()}
                          </Chip>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Personal Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">First Name:</span> {selectedUser.first_name || 'N/A'}</p>
                          <p><span className="font-medium">Last Name:</span> {selectedUser.last_name || 'N/A'}</p>
                          <p><span className="font-medium">Phone:</span> {selectedUser.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Work Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Department:</span> {selectedUser.department_name || 'N/A'}</p>
                          <p><span className="font-medium">Designation:</span> {selectedUser.designation_name || 'N/A'}</p>
                          <p><span className="font-medium">Permissions:</span> {selectedUser.permission_count || selectedUser.permissions_count || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Account Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Created:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                        <p><span className="font-medium">Last Login:</span> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}</p>
                        <p><span className="font-medium">Email Verified:</span> {selectedUser.is_email_verified ? 'Yes' : 'No'}</p>
                        <p><span className="font-medium">Phone Verified:</span> {selectedUser.is_phone_verified ? 'Yes' : 'No'}</p>
                        <p><span className="font-medium">2FA Enabled:</span> {selectedUser.two_factor_enabled ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetPasswordOpen} onOpenChange={onResetPasswordOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Reset Password</ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
                      <Avatar name={selectedUser.name} size="sm" />
                      <div>
                        <p className="font-medium">{selectedUser.name}</p>
                        <p className="text-sm text-default-600">{selectedUser.email}</p>
                      </div>
                    </div>
                    
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      
                      onChange={(e) => setPasswordResetData({ ...passwordResetData, newPassword: e.target.value })}
                      isRequired
                    />
                    
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm new password"
                      
                      onChange={(e) => setPasswordResetData({ ...passwordResetData, confirmPassword: e.target.value })}
                      isRequired
                    />
                    
                    <div className="text-xs text-default-500">
                      Password must be at least 6 characters long.
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handlePasswordResetSubmit}
                  isDisabled={!passwordResetData.newPassword || !passwordResetData.confirmPassword}
                >
                  Reset Password
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      </div>
    </div>
  );
};

export default UsersPage;