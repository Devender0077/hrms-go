import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import Papa from "papaparse";

// User interface
interface User {
  id: number;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "super_admin" | "company_admin" | "hr_manager" | "manager" | "employee";
  status: "active" | "inactive" | "suspended" | "pending";
  department: string;
  position: string;
  phone?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockedUntil?: string;
}

// Sample users data
const initialUsers: User[] = [
  {
    id: 1,
    userId: "USR-001",
    username: "john.smith",
    email: "john.smith@company.com",
    firstName: "John",
    lastName: "Smith",
    fullName: "John Smith",
    role: "employee",
    status: "active",
    department: "IT",
    position: "Senior Software Engineer",
    phone: "+1-555-0123",
    lastLogin: "2024-12-15T10:30:00Z",
    createdAt: "2024-01-15",
    updatedAt: "2024-12-15",
    permissions: ["read:profile", "update:profile", "read:tasks", "update:tasks"],
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFactorEnabled: false,
    loginAttempts: 0
  },
  {
    id: 2,
    userId: "USR-002",
    username: "sarah.johnson",
    email: "sarah.johnson@company.com",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    role: "hr_manager",
    status: "active",
    department: "HR",
    position: "HR Manager",
    phone: "+1-555-0124",
    lastLogin: "2024-12-15T09:15:00Z",
    createdAt: "2024-02-01",
    updatedAt: "2024-12-15",
    permissions: ["read:all", "create:employees", "update:employees", "delete:employees", "read:reports"],
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFactorEnabled: true,
    loginAttempts: 0
  },
  {
    id: 3,
    userId: "USR-003",
    username: "mike.wilson",
    email: "mike.wilson@company.com",
    firstName: "Mike",
    lastName: "Wilson",
    fullName: "Mike Wilson",
    role: "company_admin",
    status: "active",
    department: "Finance",
    position: "Finance Director",
    phone: "+1-555-0125",
    lastLogin: "2024-12-14T16:45:00Z",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-14",
    permissions: ["read:all", "create:all", "update:all", "delete:all", "admin:all"],
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFactorEnabled: true,
    loginAttempts: 0
  },
  {
    id: 4,
    userId: "USR-004",
    username: "lisa.anderson",
    email: "lisa.anderson@company.com",
    firstName: "Lisa",
    lastName: "Anderson",
    fullName: "Lisa Anderson",
    role: "manager",
    status: "active",
    department: "Marketing",
    position: "Marketing Manager",
    phone: "+1-555-0126",
    lastLogin: "2024-12-15T08:20:00Z",
    createdAt: "2024-03-10",
    updatedAt: "2024-12-15",
    permissions: ["read:team", "create:team", "update:team", "read:reports"],
    isEmailVerified: true,
    isPhoneVerified: false,
    twoFactorEnabled: false,
    loginAttempts: 0
  },
  {
    id: 5,
    userId: "USR-005",
    username: "david.chen",
    email: "david.chen@company.com",
    firstName: "David",
    lastName: "Chen",
    fullName: "David Chen",
    role: "employee",
    status: "inactive",
    department: "Operations",
    position: "Operations Specialist",
    phone: "+1-555-0127",
    lastLogin: "2024-11-30T14:10:00Z",
    createdAt: "2024-04-15",
    updatedAt: "2024-11-30",
    permissions: ["read:profile", "update:profile"],
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFactorEnabled: false,
    loginAttempts: 0
  }
];

const roleColorMap = {
  super_admin: "danger",
  company_admin: "warning",
  hr_manager: "primary",
  manager: "secondary",
  employee: "default",
};

const statusColorMap = {
  active: "success",
  inactive: "default",
  suspended: "warning",
  pending: "primary",
};

const departments = [
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "Customer Success"
];

const positions = [
  "Software Engineer",
  "Senior Software Engineer",
  "HR Manager",
  "Finance Director",
  "Marketing Manager",
  "Operations Specialist",
  "Sales Representative",
  "Customer Success Manager"
];

export default function Users() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const rowsPerPage = 10;
  
  // New user form state
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "employee",
    status: "active",
    department: "",
    position: "",
    phone: "",
    permissions: [],
    isEmailVerified: false,
    isPhoneVerified: false,
    twoFactorEnabled: false
  });
  
  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
      const matchesDepartment = selectedDepartment === "all" || user.department === selectedDepartment;
      
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });
  }, [users, searchQuery, selectedRole, selectedStatus, selectedDepartment]);
  
  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === "active").length;
    const inactiveUsers = users.filter(u => u.status === "inactive").length;
    const suspendedUsers = users.filter(u => u.status === "suspended").length;
    const pendingUsers = users.filter(u => u.status === "pending").length;
    
    return [
      {
        label: "Total Users",
        value: totalUsers,
        icon: "lucide:users",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        label: "Active",
        value: activeUsers,
        icon: "lucide:user-check",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "Inactive",
        value: inactiveUsers,
        icon: "lucide:user-x",
        color: "text-gray-600",
        bgColor: "bg-gray-100"
      },
      {
        label: "Suspended",
        value: suspendedUsers,
        icon: "lucide:user-minus",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        label: "Pending",
        value: pendingUsers,
        icon: "lucide:user-clock",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      }
    ];
  }, [users]);

  // Handle add user
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.firstName || !newUser.lastName) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields (Username, Email, First Name, Last Name).",
        color: "warning",
      });
      return;
    }

    const user: User = {
      id: Date.now(),
      userId: `USR-${String(Date.now()).slice(-3)}`,
      username: newUser.username!,
      email: newUser.email!,
      firstName: newUser.firstName!,
      lastName: newUser.lastName!,
      fullName: `${newUser.firstName} ${newUser.lastName}`,
      role: newUser.role as User["role"] || "employee",
      status: newUser.status as User["status"] || "active",
      department: newUser.department || "",
      position: newUser.position || "",
      phone: newUser.phone || "",
      permissions: newUser.permissions || [],
      isEmailVerified: newUser.isEmailVerified || false,
      isPhoneVerified: newUser.isPhoneVerified || false,
      twoFactorEnabled: newUser.twoFactorEnabled || false,
      loginAttempts: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, user]);
    setNewUser({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "employee",
      status: "active",
      department: "",
      position: "",
      phone: "",
      permissions: [],
      isEmailVerified: false,
      isPhoneVerified: false,
      twoFactorEnabled: false
    });
    setIsAddModalOpen(false);
    
    addToast({
      title: "User Added",
      description: `User "${user.fullName}" has been added successfully.`,
      color: "success",
    });
  };

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser || !newUser.username || !newUser.email || !newUser.firstName || !newUser.lastName) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const updatedUser: User = {
      ...selectedUser,
      username: newUser.username!,
      email: newUser.email!,
      firstName: newUser.firstName!,
      lastName: newUser.lastName!,
      fullName: `${newUser.firstName} ${newUser.lastName}`,
      role: newUser.role as User["role"] || selectedUser.role,
      status: newUser.status as User["status"] || selectedUser.status,
      department: newUser.department || selectedUser.department,
      position: newUser.position || selectedUser.position,
      phone: newUser.phone || selectedUser.phone,
      permissions: newUser.permissions || selectedUser.permissions,
      isEmailVerified: newUser.isEmailVerified !== undefined ? newUser.isEmailVerified : selectedUser.isEmailVerified,
      isPhoneVerified: newUser.isPhoneVerified !== undefined ? newUser.isPhoneVerified : selectedUser.isPhoneVerified,
      twoFactorEnabled: newUser.twoFactorEnabled !== undefined ? newUser.twoFactorEnabled : selectedUser.twoFactorEnabled,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
    setIsEditModalOpen(false);
    setSelectedUser(null);
    
    addToast({
      title: "User Updated",
      description: `User "${updatedUser.fullName}" has been updated successfully.`,
      color: "success",
    });
  };

  // Handle status update
  const handleStatusUpdate = (user: User, newStatus: User["status"]) => {
    const updatedUser = {
      ...user,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
    addToast({
      title: "Status Updated",
      description: `User status updated to ${newStatus} for ${user.fullName}.`,
      color: "success",
    });
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    
    addToast({
      title: "User Deleted",
      description: `User "${user.fullName}" has been removed.`,
      color: "success",
    });
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      const csvData = filteredUsers.map(user => ({
        "User ID": user.userId,
        "Username": user.username,
        "Email": user.email,
        "Full Name": user.fullName,
        "Role": user.role,
        "Status": user.status,
        "Department": user.department,
        "Position": user.position,
        "Phone": user.phone || "N/A",
        "Last Login": user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never",
        "Email Verified": user.isEmailVerified ? "Yes" : "No",
        "Phone Verified": user.isPhoneVerified ? "Yes" : "No",
        "2FA Enabled": user.twoFactorEnabled ? "Yes" : "No",
        "Created At": new Date(user.createdAt).toLocaleDateString()
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast({
        title: "Export Successful",
        description: "Users have been exported successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export users. Please try again.",
        color: "danger",
      });
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      department: user.department,
      position: user.position,
      phone: user.phone,
      permissions: user.permissions,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      twoFactorEnabled: user.twoFactorEnabled
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
              <Icon icon="lucide:users" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              className="font-medium"
            >
              Export CSV
            </Button>
            <Button 
              color="primary" 
              startContent={<Icon icon="lucide:plus" />} 
              onPress={() => setIsAddModalOpen(true)}
              className="font-medium"
            >
              Add User
            </Button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
                </div>
                <div>
                  <p className="text-default-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Role"
                placeholder="All Roles"
                selectedKeys={[selectedRole]}
                onSelectionChange={(keys) => setSelectedRole(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Roles</SelectItem>
                <SelectItem key="super_admin">Super Admin</SelectItem>
                <SelectItem key="company_admin">Company Admin</SelectItem>
                <SelectItem key="hr_manager">HR Manager</SelectItem>
                <SelectItem key="manager">Manager</SelectItem>
                <SelectItem key="employee">Employee</SelectItem>
              </Select>
              <Select
                label="Status"
                placeholder="All Statuses"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
                <SelectItem key="suspended">Suspended</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
              </Select>
              <Select
                label="Department"
                placeholder="All Departments"
                selectedKeys={[selectedDepartment]}
                onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept}>{dept}</SelectItem>
                ))}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-blue-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Users List</h3>
                <p className="text-gray-500 text-sm">Manage system users and access</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Users table">
              <TableHeader>
                <TableColumn>USER</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>LAST LOGIN</TableColumn>
                <TableColumn>VERIFICATION</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={user.fullName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={roleColorMap[user.role] as any}
                        variant="flat"
                      >
                        {user.role.replace('_', ' ')}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[user.status] as any}
                        variant="flat"
                      >
                        {user.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{user.department}</p>
                        <p className="text-sm text-gray-500">{user.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {user.lastLogin ? (
                          <>
                            <p className="text-sm font-medium">{new Date(user.lastLogin).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(user.lastLogin).toLocaleTimeString()}</p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-gray-300'}`} title="Email Verified" />
                        <div className={`w-2 h-2 rounded-full ${user.isPhoneVerified ? 'bg-green-500' : 'bg-gray-300'}`} title="Phone Verified" />
                        <div className={`w-2 h-2 rounded-full ${user.twoFactorEnabled ? 'bg-blue-500' : 'bg-gray-300'}`} title="2FA Enabled" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedUser(user);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => openEditModal(user)}
                        >
                          <Icon icon="lucide:edit" className="w-4 h-4" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="flat">
                              <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem key="activate" onPress={() => handleStatusUpdate(user, "active")}>
                              Activate
                            </DropdownItem>
                            <DropdownItem key="deactivate" onPress={() => handleStatusUpdate(user, "inactive")}>
                              Deactivate
                            </DropdownItem>
                            <DropdownItem key="suspend" onPress={() => handleStatusUpdate(user, "suspended")}>
                              Suspend
                            </DropdownItem>
                            <DropdownItem key="delete" className="text-danger" onPress={() => handleDeleteUser(user)}>
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredUsers.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add User Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Add New User</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username *"
                  placeholder="e.g., john.smith"
                  value={newUser.username || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="e.g., john.smith@company.com"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="First Name *"
                  placeholder="e.g., John"
                  value={newUser.firstName || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                />
                <Input
                  label="Last Name *"
                  placeholder="e.g., Smith"
                  value={newUser.lastName || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                />
                <Select
                  label="Role"
                  placeholder="Select role"
                  selectedKeys={newUser.role ? [newUser.role] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, role: Array.from(keys)[0] as User["role"] }))}
                >
                  <SelectItem key="employee">Employee</SelectItem>
                  <SelectItem key="manager">Manager</SelectItem>
                  <SelectItem key="hr_manager">HR Manager</SelectItem>
                  <SelectItem key="company_admin">Company Admin</SelectItem>
                  <SelectItem key="super_admin">Super Admin</SelectItem>
                </Select>
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={newUser.status ? [newUser.status] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, status: Array.from(keys)[0] as User["status"] }))}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended">Suspended</SelectItem>
                  <SelectItem key="pending">Pending</SelectItem>
                </Select>
                <Select
                  label="Department"
                  placeholder="Select department"
                  selectedKeys={newUser.department ? [newUser.department] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, department: Array.from(keys)[0] as string }))}
                >
                  {departments.map(dept => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Position"
                  placeholder="Select position"
                  selectedKeys={newUser.position ? [newUser.position] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, position: Array.from(keys)[0] as string }))}
                >
                  {positions.map(pos => (
                    <SelectItem key={pos}>{pos}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Phone"
                  placeholder="e.g., +1-555-0123"
                  value={newUser.phone || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleAddUser}>
                Add User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit User Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Edit User</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username *"
                  placeholder="e.g., john.smith"
                  value={newUser.username || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="e.g., john.smith@company.com"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="First Name *"
                  placeholder="e.g., John"
                  value={newUser.firstName || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                />
                <Input
                  label="Last Name *"
                  placeholder="e.g., Smith"
                  value={newUser.lastName || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                />
                <Select
                  label="Role"
                  placeholder="Select role"
                  selectedKeys={newUser.role ? [newUser.role] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, role: Array.from(keys)[0] as User["role"] }))}
                >
                  <SelectItem key="employee">Employee</SelectItem>
                  <SelectItem key="manager">Manager</SelectItem>
                  <SelectItem key="hr_manager">HR Manager</SelectItem>
                  <SelectItem key="company_admin">Company Admin</SelectItem>
                  <SelectItem key="super_admin">Super Admin</SelectItem>
                </Select>
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={newUser.status ? [newUser.status] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, status: Array.from(keys)[0] as User["status"] }))}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended">Suspended</SelectItem>
                  <SelectItem key="pending">Pending</SelectItem>
                </Select>
                <Select
                  label="Department"
                  placeholder="Select department"
                  selectedKeys={newUser.department ? [newUser.department] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, department: Array.from(keys)[0] as string }))}
                >
                  {departments.map(dept => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Position"
                  placeholder="Select position"
                  selectedKeys={newUser.position ? [newUser.position] : []}
                  onSelectionChange={(keys) => setNewUser(prev => ({ ...prev, position: Array.from(keys)[0] as string }))}
                >
                  {positions.map(pos => (
                    <SelectItem key={pos}>{pos}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Phone"
                  placeholder="e.g., +1-555-0123"
                  value={newUser.phone || ""}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleEditUser}>
                Update User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View User Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="4xl">
          <ModalContent>
            <ModalHeader>User Details</ModalHeader>
            <ModalBody>
              {selectedUser && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={selectedUser.fullName}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedUser.fullName}</h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <p className="text-gray-600">@{selectedUser.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">User Information</h4>
                      <div className="space-y-2">
                        <p><strong>User ID:</strong> {selectedUser.userId}</p>
                        <p><strong>Role:</strong> 
                          <Chip size="sm" color={roleColorMap[selectedUser.role] as any} variant="flat" className="ml-2">
                            {selectedUser.role.replace('_', ' ')}
                          </Chip>
                        </p>
                        <p><strong>Status:</strong> 
                          <Chip size="sm" color={statusColorMap[selectedUser.status] as any} variant="flat" className="ml-2">
                            {selectedUser.status}
                          </Chip>
                        </p>
                        <p><strong>Department:</strong> {selectedUser.department}</p>
                        <p><strong>Position:</strong> {selectedUser.position}</p>
                        {selectedUser.phone && <p><strong>Phone:</strong> {selectedUser.phone}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Security & Verification</h4>
                      <div className="space-y-2">
                        <p><strong>Email Verified:</strong> 
                          <Chip size="sm" color={selectedUser.isEmailVerified ? "success" : "default"} variant="flat" className="ml-2">
                            {selectedUser.isEmailVerified ? "Yes" : "No"}
                          </Chip>
                        </p>
                        <p><strong>Phone Verified:</strong> 
                          <Chip size="sm" color={selectedUser.isPhoneVerified ? "success" : "default"} variant="flat" className="ml-2">
                            {selectedUser.isPhoneVerified ? "Yes" : "No"}
                          </Chip>
                        </p>
                        <p><strong>2FA Enabled:</strong> 
                          <Chip size="sm" color={selectedUser.twoFactorEnabled ? "primary" : "default"} variant="flat" className="ml-2">
                            {selectedUser.twoFactorEnabled ? "Yes" : "No"}
                          </Chip>
                        </p>
                        <p><strong>Login Attempts:</strong> {selectedUser.loginAttempts}</p>
                        {selectedUser.lastLogin && (
                          <p><strong>Last Login:</strong> {new Date(selectedUser.lastLogin).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.permissions.map((permission, index) => (
                        <Chip key={index} size="sm" variant="flat" color="secondary">
                          {permission}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Account Timeline</h4>
                      <div className="space-y-2">
                        <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                        <p><strong>Last Updated:</strong> {new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                        {selectedUser.lockedUntil && (
                          <p><strong>Locked Until:</strong> {new Date(selectedUser.lockedUntil).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}