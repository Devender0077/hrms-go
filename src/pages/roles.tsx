import React from "react";
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
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Checkbox,
  addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

const sampleRoles: Role[] = [
  {
    id: 1,
    name: "super_admin",
    displayName: "Super Administrator",
    description: "Full system access with all permissions",
    permissions: ["*"],
    userCount: 2,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 2,
    name: "company_admin",
    displayName: "Company Administrator",
    description: "Company-wide administrative access",
    permissions: [
      "dashboard.view", "employees.view", "employees.create", "employees.edit", "employees.delete", "employees.export",
      "departments.view", "departments.create", "departments.edit", "departments.delete",
      "designations.view", "designations.create", "designations.edit", "designations.delete",
      "branches.view", "branches.create", "branches.edit", "branches.delete",
      "attendance.view", "attendance.manage", "attendance.approve", "attendance.export",
      "leave.view", "leave.manage", "leave.approve", "leave.export",
      "payroll.view", "payroll.manage", "payroll.process", "payroll.export",
      "expenses.view", "expenses.manage", "expenses.approve", "expenses.export",
      "reports.view", "reports.attendance", "reports.payroll", "reports.financial", "reports.export",
      "jobs.view", "jobs.create", "jobs.edit", "jobs.delete",
      "candidates.view", "candidates.manage",
      "interviews.view", "interviews.schedule",
      "goals.view", "goals.manage",
      "reviews.view", "reviews.manage",
      "assets.view", "assets.manage", "assets.assign", "assets.export",
      "users.view", "users.create", "users.edit", "users.delete", "users.roles",
      "roles.view", "roles.create", "roles.edit", "roles.delete",
      "org_chart.view", "org_chart.manage",
      "calendar.view", "calendar.manage",
      "tasks.view", "tasks.manage",
      "settings.view", "settings.manage", "settings.company", "settings.system",
      "profile.view", "profile.edit", "profile.others",
      "audit.view", "audit.export"
    ],
    userCount: 5,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 3,
    name: "hr_manager",
    displayName: "HR Manager",
    description: "Human resources management and employee oversight",
    permissions: [
      "dashboard.view", "employees.view", "employees.create", "employees.edit", "employees.export",
      "departments.view", "departments.create", "departments.edit",
      "designations.view", "designations.create", "designations.edit",
      "branches.view", "branches.create", "branches.edit",
      "attendance.view", "attendance.manage", "attendance.approve", "attendance.export",
      "leave.view", "leave.manage", "leave.approve", "leave.export",
      "reports.view", "reports.attendance", "reports.export",
      "jobs.view", "jobs.create", "jobs.edit", "jobs.delete",
      "candidates.view", "candidates.manage",
      "interviews.view", "interviews.schedule",
      "goals.view", "goals.manage",
      "reviews.view", "reviews.manage",
      "org_chart.view", "org_chart.manage",
      "calendar.view", "calendar.manage",
      "tasks.view", "tasks.manage",
      "profile.view", "profile.edit", "profile.others"
    ],
    userCount: 8,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 4,
    name: "manager",
    displayName: "Department Manager",
    description: "Department-level management and team oversight",
    permissions: [
      "dashboard.view", "employees.view", "employees.edit",
      "attendance.view", "attendance.manage", "attendance.approve",
      "leave.view", "leave.approve",
      "reports.view", "reports.attendance",
      "goals.view", "goals.manage",
      "reviews.view", "reviews.manage",
      "org_chart.view",
      "calendar.view", "calendar.manage",
      "tasks.view", "tasks.manage",
      "profile.view", "profile.edit", "profile.others"
    ],
    userCount: 15,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 5,
    name: "employee",
    displayName: "Employee",
    description: "Basic employee access with limited permissions",
    permissions: [
      "dashboard.view", "profile.view", "profile.edit", 
      "attendance.view", "attendance.clock", 
      "leave.view", "leave.request",
      "expenses.view", "expenses.create",
      "goals.view", "reviews.view",
      "org_chart.view",
      "calendar.view", "tasks.view"
    ],
    userCount: 120,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 6,
    name: "finance_manager",
    displayName: "Finance Manager",
    description: "Financial management and payroll oversight",
    permissions: [
      "dashboard.view", "payroll.view", "payroll.manage", "payroll.process", "payroll.export",
      "expenses.view", "expenses.approve", "expenses.export",
      "reports.view", "reports.payroll", "reports.financial", "reports.export",
      "profile.view", "profile.edit"
    ],
    userCount: 3,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 7,
    name: "recruiter",
    displayName: "Recruiter",
    description: "Recruitment and talent acquisition specialist",
    permissions: [
      "dashboard.view", "jobs.view", "jobs.create", "jobs.edit", "jobs.delete",
      "candidates.view", "candidates.manage",
      "interviews.view", "interviews.schedule",
      "reports.view",
      "profile.view", "profile.edit"
    ],
    userCount: 4,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 8,
    name: "guest",
    displayName: "Guest User",
    description: "Limited access for external users",
    permissions: ["profile.view"],
    userCount: 0,
    status: "inactive",
    createdAt: "2024-01-01",
    updatedAt: "2024-12-01"
  }
];

const availablePermissions = [
  { 
    category: "Dashboard", 
    permissions: [
      { id: "dashboard.view", name: "View Dashboard", description: "Access to main dashboard" }
    ] 
  },
  { 
    category: "Employee Management", 
    permissions: [
      { id: "employees.view", name: "View Employees", description: "View employee list and details" },
      { id: "employees.create", name: "Create Employee", description: "Add new employees" },
      { id: "employees.edit", name: "Edit Employee", description: "Edit employee information" },
      { id: "employees.delete", name: "Delete Employee", description: "Remove employees" },
      { id: "employees.export", name: "Export Employees", description: "Export employee data" }
    ] 
  },
  { 
    category: "Department Management", 
    permissions: [
      { id: "departments.view", name: "View Departments", description: "View department list" },
      { id: "departments.create", name: "Create Department", description: "Add new departments" },
      { id: "departments.edit", name: "Edit Department", description: "Edit department details" },
      { id: "departments.delete", name: "Delete Department", description: "Remove departments" }
    ] 
  },
  { 
    category: "Designation Management", 
    permissions: [
      { id: "designations.view", name: "View Designations", description: "View designation list" },
      { id: "designations.create", name: "Create Designation", description: "Add new designations" },
      { id: "designations.edit", name: "Edit Designation", description: "Edit designation details" },
      { id: "designations.delete", name: "Delete Designation", description: "Remove designations" }
    ] 
  },
  { 
    category: "Branch Management", 
    permissions: [
      { id: "branches.view", name: "View Branches", description: "View branch list" },
      { id: "branches.create", name: "Create Branch", description: "Add new branches" },
      { id: "branches.edit", name: "Edit Branch", description: "Edit branch details" },
      { id: "branches.delete", name: "Delete Branch", description: "Remove branches" }
    ] 
  },
  { 
    category: "Attendance Management", 
    permissions: [
      { id: "attendance.view", name: "View Attendance", description: "View attendance records" },
      { id: "attendance.clock", name: "Clock In/Out", description: "Record attendance" },
      { id: "attendance.manage", name: "Manage Attendance", description: "Edit attendance records" },
      { id: "attendance.approve", name: "Approve Attendance", description: "Approve attendance requests" },
      { id: "attendance.export", name: "Export Attendance", description: "Export attendance data" }
    ] 
  },
  { 
    category: "Leave Management", 
    permissions: [
      { id: "leave.view", name: "View Leave", description: "View leave requests" },
      { id: "leave.request", name: "Request Leave", description: "Submit leave requests" },
      { id: "leave.approve", name: "Approve Leave", description: "Approve/reject leave requests" },
      { id: "leave.manage", name: "Manage Leave", description: "Full leave management" },
      { id: "leave.export", name: "Export Leave", description: "Export leave data" }
    ] 
  },
  { 
    category: "Payroll Management", 
    permissions: [
      { id: "payroll.view", name: "View Payroll", description: "View payroll information" },
      { id: "payroll.manage", name: "Manage Payroll", description: "Manage payroll settings" },
      { id: "payroll.process", name: "Process Payroll", description: "Process monthly payroll" },
      { id: "payroll.export", name: "Export Payroll", description: "Export payroll reports" }
    ] 
  },
  { 
    category: "Expense Management", 
    permissions: [
      { id: "expenses.view", name: "View Expenses", description: "View expense claims" },
      { id: "expenses.create", name: "Create Expense", description: "Submit expense claims" },
      { id: "expenses.approve", name: "Approve Expense", description: "Approve expense claims" },
      { id: "expenses.manage", name: "Manage Expenses", description: "Full expense management" },
      { id: "expenses.export", name: "Export Expenses", description: "Export expense data" }
    ] 
  },
  { 
    category: "Reports & Analytics", 
    permissions: [
      { id: "reports.view", name: "View Reports", description: "Access to reports section" },
      { id: "reports.attendance", name: "Attendance Reports", description: "Generate attendance reports" },
      { id: "reports.payroll", name: "Payroll Reports", description: "Generate payroll reports" },
      { id: "reports.financial", name: "Financial Reports", description: "Generate financial reports" },
      { id: "reports.export", name: "Export Reports", description: "Export report data" }
    ] 
  },
  { 
    category: "Recruitment", 
    permissions: [
      { id: "jobs.view", name: "View Jobs", description: "View job postings" },
      { id: "jobs.create", name: "Create Job", description: "Create job postings" },
      { id: "jobs.edit", name: "Edit Job", description: "Edit job postings" },
      { id: "jobs.delete", name: "Delete Job", description: "Delete job postings" },
      { id: "candidates.view", name: "View Candidates", description: "View candidate applications" },
      { id: "candidates.manage", name: "Manage Candidates", description: "Manage candidate pipeline" },
      { id: "interviews.view", name: "View Interviews", description: "View interview schedules" },
      { id: "interviews.schedule", name: "Schedule Interview", description: "Schedule interviews" }
    ] 
  },
  { 
    category: "Performance Management", 
    permissions: [
      { id: "goals.view", name: "View Goals", description: "View performance goals" },
      { id: "goals.manage", name: "Manage Goals", description: "Create and manage goals" },
      { id: "reviews.view", name: "View Reviews", description: "View performance reviews" },
      { id: "reviews.manage", name: "Manage Reviews", description: "Create and manage reviews" }
    ] 
  },
  { 
    category: "Asset Management", 
    permissions: [
      { id: "assets.view", name: "View Assets", description: "View company assets" },
      { id: "assets.manage", name: "Manage Assets", description: "Add, edit, delete assets" },
      { id: "assets.assign", name: "Assign Assets", description: "Assign assets to employees" },
      { id: "assets.export", name: "Export Assets", description: "Export asset data" }
    ] 
  },
  { 
    category: "User Management", 
    permissions: [
      { id: "users.view", name: "View Users", description: "View system users" },
      { id: "users.create", name: "Create User", description: "Create new users" },
      { id: "users.edit", name: "Edit User", description: "Edit user information" },
      { id: "users.delete", name: "Delete User", description: "Remove users" },
      { id: "users.roles", name: "Manage User Roles", description: "Assign roles to users" }
    ] 
  },
  { 
    category: "Role Management", 
    permissions: [
      { id: "roles.view", name: "View Roles", description: "View system roles" },
      { id: "roles.create", name: "Create Role", description: "Create new roles" },
      { id: "roles.edit", name: "Edit Role", description: "Edit role permissions" },
      { id: "roles.delete", name: "Delete Role", description: "Remove roles" }
    ] 
  },
  { 
    category: "Organization Chart", 
    permissions: [
      { id: "org_chart.view", name: "View Organization Chart", description: "View company structure" },
      { id: "org_chart.manage", name: "Manage Organization Chart", description: "Edit organization structure" }
    ] 
  },
  { 
    category: "Calendar & Tasks", 
    permissions: [
      { id: "calendar.view", name: "View Calendar", description: "Access calendar view" },
      { id: "calendar.manage", name: "Manage Calendar", description: "Create and manage events" },
      { id: "tasks.view", name: "View Tasks", description: "View task list" },
      { id: "tasks.manage", name: "Manage Tasks", description: "Create and manage tasks" }
    ] 
  },
  { 
    category: "Settings & Configuration", 
    permissions: [
      { id: "settings.view", name: "View Settings", description: "View system settings" },
      { id: "settings.manage", name: "Manage Settings", description: "Edit system settings" },
      { id: "settings.company", name: "Company Settings", description: "Manage company information" },
      { id: "settings.system", name: "System Settings", description: "Advanced system configuration" }
    ] 
  },
  { 
    category: "Profile Management", 
    permissions: [
      { id: "profile.view", name: "View Profile", description: "View own profile" },
      { id: "profile.edit", name: "Edit Profile", description: "Edit own profile" },
      { id: "profile.others", name: "View Other Profiles", description: "View other user profiles" }
    ] 
  },
  { 
    category: "Audit & Logs", 
    permissions: [
      { id: "audit.view", name: "View Audit Logs", description: "View system audit logs" },
      { id: "audit.export", name: "Export Audit Logs", description: "Export audit data" }
    ] 
  },
  { 
    category: "System Administration", 
    permissions: [
      { id: "*", name: "Super Admin Access", description: "Full system access" },
      { id: "system.backup", name: "System Backup", description: "Create system backups" },
      { id: "system.maintenance", name: "System Maintenance", description: "Perform system maintenance" }
    ] 
  }
];

export default function Roles() {
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [roleList, setRoleList] = React.useState(sampleRoles);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [newRole, setNewRole] = React.useState<Omit<Role, "id" | "userCount" | "createdAt" | "updatedAt">>({
    name: "",
    displayName: "",
    description: "",
    permissions: [],
    status: "active"
  });

  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const rowsPerPage = 10;

  const filteredRoles = React.useMemo(() => {
    return roleList.filter(role => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === "all" || role.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [roleList, searchQuery, selectedStatus]);

  const pages = Math.ceil(filteredRoles.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRoles.slice(start, end);
  }, [page, filteredRoles]);

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    onViewOpen();
  };

  const handleAddRole = () => {
    if (!newRole.name || !newRole.displayName || !newRole.description) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields for the new role.",
        color: "danger",
      });
      return;
    }
    const id = roleList.length > 0 ? Math.max(...roleList.map(r => r.id)) + 1 : 1;
    setRoleList(prev => [...prev, { 
      ...newRole, 
      id, 
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }]);
    addToast({
      title: "Role Added",
      description: `Role "${newRole.displayName}" has been added.`,
      color: "success",
    });
    setNewRole({
      name: "",
      displayName: "",
      description: "",
      permissions: [],
      status: "active"
    });
    onAddOpenChange();
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions,
      status: role.status
    });
    onEditOpen();
  };

  const handleUpdateRole = () => {
    if (!selectedRole || !newRole.name || !newRole.displayName || !newRole.description) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields for the role.",
        color: "danger",
      });
      return;
    }
    setRoleList(prev =>
      prev.map(r =>
        r.id === selectedRole.id
          ? { ...r, ...newRole, updatedAt: new Date().toISOString().split('T')[0] }
          : r
      )
    );
    addToast({
      title: "Role Updated",
      description: `Role "${newRole.displayName}" has been updated.`,
      color: "success",
    });
    setSelectedRole(null);
    setNewRole({
      name: "",
      displayName: "",
      description: "",
      permissions: [],
      status: "active"
    });
    onEditOpenChange();
  };

  const handleDeleteRole = (id: number) => {
    setRoleList(prev => prev.filter(r => r.id !== id));
    addToast({
      title: "Role Deleted",
      description: "Role has been successfully deleted.",
      color: "danger",
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setNewRole(prev => ({ ...prev, permissions: [...prev.permissions, permissionId] }));
    } else {
      setNewRole(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permissionId) }));
    }
  };

  const handleSelectAllPermissions = (categoryPermissions: any[], checked: boolean) => {
    const permissionIds = categoryPermissions.map(p => p.id);
    if (checked) {
      setNewRole(prev => ({ 
        ...prev, 
        permissions: [...new Set([...prev.permissions, ...permissionIds])] 
      }));
    } else {
      setNewRole(prev => ({ 
        ...prev, 
        permissions: prev.permissions.filter(p => !permissionIds.includes(p)) 
      }));
    }
  };

  const stats = React.useMemo(() => {
    const total = roleList.length;
    const active = roleList.filter(r => r.status === "active").length;
    const totalUsers = roleList.reduce((sum, role) => sum + role.userCount, 0);
    return { total, active, totalUsers };
  }, [roleList]);

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-default-500">Manage user roles and permissions</p>
        </div>
        <Button color="primary" startContent={<Icon icon="lucide:plus" />} onPress={onAddOpen}>
          Add New Role
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-default-500">Total Roles</p>
              <h3 className="text-2xl font-semibold">{stats.total}</h3>
            </div>
            <Icon icon="lucide:shield" className="text-primary-500 text-4xl" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-default-500">Active Roles</p>
              <h3 className="text-2xl font-semibold">{stats.active}</h3>
            </div>
            <Icon icon="lucide:check-circle-2" className="text-success-500 text-4xl" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-default-500">Total Users</p>
              <h3 className="text-2xl font-semibold">{stats.totalUsers}</h3>
            </div>
            <Icon icon="lucide:users" className="text-warning-500 text-4xl" />
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search roles..."
              startContent={<Icon icon="lucide:search" />}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex-1"
            />
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" endContent={<Icon icon="lucide:chevron-down" />}>
                  Status: {selectedStatus === "all" ? "All" : selectedStatus}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
              >
                <DropdownItem key="all">All Status</DropdownItem>
                <DropdownItem key="active">Active</DropdownItem>
                <DropdownItem key="inactive">Inactive</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardBody>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardBody>
          <Table
            aria-label="Roles table"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            }
            classNames={{
              wrapper: "min-h-[222px]",
            }}
          >
            <TableHeader>
              <TableColumn key="name">ROLE NAME</TableColumn>
              <TableColumn key="displayName">DISPLAY NAME</TableColumn>
              <TableColumn key="description">DESCRIPTION</TableColumn>
              <TableColumn key="permissions">PERMISSIONS</TableColumn>
              <TableColumn key="userCount">USERS</TableColumn>
              <TableColumn key="status">STATUS</TableColumn>
              <TableColumn key="actions">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No roles found"} items={items}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="text-bold text-sm capitalize">{item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-bold text-sm">{item.displayName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-default-500">{item.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.permissions.slice(0, 2).map((permission, index) => (
                        <Chip key={index} size="sm" variant="flat" color="primary">
                          {permission}
                        </Chip>
                      ))}
                      {item.permissions.length > 2 && (
                        <Chip size="sm" variant="flat" color="default">
                          +{item.permissions.length - 2}
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{item.userCount}</p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      className="capitalize"
                      color={item.status === "active" ? "success" : "default"}
                      size="sm"
                      variant="flat"
                    >
                      {item.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="relative flex items-center gap-2">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:more-vertical" className="text-default-500" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem onPress={() => handleViewRole(item)}>
                            <Icon icon="lucide:eye" /> View Details
                          </DropdownItem>
                          <DropdownItem onPress={() => handleEditRole(item)}>
                            <Icon icon="lucide:edit" /> Edit Role
                          </DropdownItem>
                          <DropdownItem onPress={() => handleDeleteRole(item.id)} className="text-danger" color="danger">
                            <Icon icon="lucide:trash-2" /> Delete Role
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* View Role Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} placement="top-center" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Role Details</ModalHeader>
              <ModalBody>
                {selectedRole && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role Name</p>
                      <p className="text-lg font-semibold">{selectedRole.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Display Name</p>
                      <p className="text-lg">{selectedRole.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm">{selectedRole.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Chip
                        color={selectedRole.status === "active" ? "success" : "default"}
                        size="sm"
                        variant="flat"
                      >
                        {selectedRole.status}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Users with this role</p>
                      <p className="text-lg font-semibold">{selectedRole.userCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Permissions</p>
                      <div className="mt-2 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availablePermissions.map(category => {
                            const categoryPermissions = category.permissions.filter(p => 
                              selectedRole.permissions.includes(p.id)
                            );
                            
                            if (categoryPermissions.length === 0) return null;
                            
                            return (
                              <div key={category.category} className="border p-3 rounded-lg">
                                <p className="font-bold text-primary-600 mb-2 text-sm">{category.category}</p>
                                <div className="space-y-1">
                                  {categoryPermissions.map(p => (
                                    <div key={p.id} className="flex items-center gap-2">
                                      <Icon icon="lucide:check-circle" className="text-success-500 text-xs" />
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium">{p.name}</span>
                                        <span className="text-xs text-gray-500">{p.description}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Role Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="top-center" size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add New Role</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Role Name"
                      placeholder="e.g., hr_specialist"
                      value={newRole.name}
                      onValueChange={(value) => setNewRole(prev => ({ ...prev, name: value }))}
                      variant="bordered"
                    />
                    <Input
                      label="Display Name"
                      placeholder="e.g., HR Specialist"
                      value={newRole.displayName}
                      onValueChange={(value) => setNewRole(prev => ({ ...prev, displayName: value }))}
                      variant="bordered"
                    />
                  </div>
                  <Textarea
                    label="Description"
                    placeholder="Enter role description"
                    value={newRole.description}
                    onValueChange={(value) => setNewRole(prev => ({ ...prev, description: value }))}
                    variant="bordered"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Permissions</p>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {availablePermissions.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Checkbox
                              isSelected={category.permissions.every(p => newRole.permissions.includes(p))}
                              onValueChange={(checked) => handleSelectAllPermissions(category.permissions, checked)}
                            />
                            <p className="font-medium text-sm">{category.category}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                            {category.permissions.map((permission, permissionIndex) => (
                              <Checkbox
                                key={permissionIndex}
                                isSelected={newRole.permissions.includes(permission.id)}
                                onValueChange={(checked) => handlePermissionChange(permission.id, checked)}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{permission.name}</span>
                                  <span className="text-xs text-gray-500">{permission.description}</span>
                                </div>
                              </Checkbox>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleAddRole}>
                  Add Role
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top-center" size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Edit Role</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Role Name"
                      placeholder="e.g., hr_specialist"
                      value={newRole.name}
                      onValueChange={(value) => setNewRole(prev => ({ ...prev, name: value }))}
                      variant="bordered"
                    />
                    <Input
                      label="Display Name"
                      placeholder="e.g., HR Specialist"
                      value={newRole.displayName}
                      onValueChange={(value) => setNewRole(prev => ({ ...prev, displayName: value }))}
                      variant="bordered"
                    />
                  </div>
                  <Textarea
                    label="Description"
                    placeholder="Enter role description"
                    value={newRole.description}
                    onValueChange={(value) => setNewRole(prev => ({ ...prev, description: value }))}
                    variant="bordered"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Permissions</p>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {availablePermissions.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Checkbox
                              isSelected={category.permissions.every(p => newRole.permissions.includes(p))}
                              onValueChange={(checked) => handleSelectAllPermissions(category.permissions, checked)}
                            />
                            <p className="font-medium text-sm">{category.category}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                            {category.permissions.map((permission, permissionIndex) => (
                              <Checkbox
                                key={permissionIndex}
                                isSelected={newRole.permissions.includes(permission.id)}
                                onValueChange={(checked) => handlePermissionChange(permission.id, checked)}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{permission.name}</span>
                                  <span className="text-xs text-gray-500">{permission.description}</span>
                                </div>
                              </Checkbox>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleUpdateRole}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
