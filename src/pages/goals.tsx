import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";

// Goal interface
interface Goal {
  id: number;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: "performance" | "development" | "behavioral" | "project" | "sales" | "quality";
  priority: "low" | "medium" | "high" | "critical";
  status: "not-started" | "in-progress" | "completed" | "on-hold" | "cancelled";
  progress: number; // 0-100
  startDate: string;
  dueDate: string;
  completionDate?: string;
  managerId: string;
  managerName: string;
  department: string;
  kpis: string[];
  milestones: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample goals data
const initialGoals: Goal[] = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "John Smith",
    title: "Complete React Certification",
    description: "Obtain React Developer Certification to enhance frontend development skills",
    category: "development",
    priority: "high",
    status: "in-progress",
    progress: 65,
    startDate: "2025-01-01",
    dueDate: "2025-03-31",
    managerId: "MGR001",
    managerName: "Jane Doe",
    department: "IT",
    kpis: ["Complete 80% of course modules", "Pass final exam with 85%+", "Build portfolio project"],
    milestones: ["Module 1-3 completed", "Module 4-6 in progress", "Final exam scheduled"],
    notes: "Employee is making good progress, on track to complete on time",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-15"
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Sarah Johnson",
    title: "Increase Team Productivity by 20%",
    description: "Implement new processes and tools to improve team efficiency",
    category: "performance",
    priority: "critical",
    status: "in-progress",
    progress: 40,
    startDate: "2025-01-01",
    dueDate: "2025-06-30",
    managerId: "MGR002",
    managerName: "Mike Wilson",
    department: "HR",
    kpis: ["Reduce task completion time by 20%", "Increase team satisfaction score", "Implement 3 new processes"],
    milestones: ["Process audit completed", "Tool evaluation in progress", "Team training scheduled"],
    notes: "Focus on automation and process optimization",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-10"
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Michael Brown",
    title: "Launch Marketing Campaign",
    description: "Develop and execute a comprehensive marketing campaign for Q2 product launch",
    category: "project",
    priority: "high",
    status: "not-started",
    progress: 0,
    startDate: "2025-02-01",
    dueDate: "2025-05-31",
    managerId: "MGR003",
    managerName: "Lisa Anderson",
    department: "Marketing",
    kpis: ["Generate 1000 leads", "Achieve 5% conversion rate", "Increase brand awareness by 30%"],
    milestones: ["Campaign strategy approved", "Creative assets developed", "Launch execution"],
    notes: "Waiting for final product specifications",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15"
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Emily Davis",
    title: "Improve Customer Satisfaction",
    description: "Enhance customer service processes to achieve 95% satisfaction rating",
    category: "quality",
    priority: "medium",
    status: "completed",
    progress: 100,
    startDate: "2024-10-01",
    dueDate: "2024-12-31",
    completionDate: "2024-12-15",
    managerId: "MGR004",
    managerName: "David Chen",
    department: "Customer Success",
    kpis: ["Achieve 95% satisfaction rating", "Reduce response time to 2 hours", "Implement feedback system"],
    milestones: ["Process improvements implemented", "Training completed", "Feedback system launched"],
    notes: "Goal completed ahead of schedule with excellent results",
    createdAt: "2024-10-01",
    updatedAt: "2024-12-15"
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "David Wilson",
    title: "Sales Target Achievement",
    description: "Meet quarterly sales targets and expand client base",
    category: "sales",
    priority: "critical",
    status: "in-progress",
    progress: 75,
    startDate: "2025-01-01",
    dueDate: "2025-03-31",
    managerId: "MGR005",
    managerName: "Sarah Miller",
    department: "Sales",
    kpis: ["Achieve $500K in sales", "Acquire 25 new clients", "Maintain 90% client retention"],
    milestones: ["Q1 target 75% achieved", "15 new clients acquired", "Client retention at 92%"],
    notes: "Strong performance, on track to exceed targets",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-20"
  }
];

const statusColorMap = {
  "not-started": "default",
  "in-progress": "primary",
  "completed": "success",
  "on-hold": "warning",
  "cancelled": "danger",
};

const priorityColorMap = {
  low: "default",
  medium: "primary",
  high: "warning",
  critical: "danger",
};

const categoryColorMap = {
  performance: "success",
  development: "primary",
  behavioral: "secondary",
  project: "warning",
  sales: "danger",
  quality: "default",
};

const employees = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Emily Davis",
  "David Wilson",
  "Lisa Anderson",
  "Tom Johnson",
  "Amy Rodriguez"
];

const managers = [
  "Jane Doe",
  "Mike Wilson",
  "Lisa Anderson",
  "David Chen",
  "Sarah Miller",
  "Tom Johnson",
  "Amy Rodriguez"
];

const departments = [
  "IT",
  "HR",
  "Marketing",
  "Sales",
  "Customer Success",
  "Finance",
  "Operations"
];

export default function Goals() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const rowsPerPage = 10;
  
  // New goal form state
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    employeeId: "",
    employeeName: "",
    title: "",
    description: "",
    category: "performance",
    priority: "medium",
    status: "not-started",
    progress: 0,
    startDate: "",
    dueDate: "",
    managerId: "",
    managerName: "",
    department: "",
    kpis: [],
    milestones: [],
    notes: ""
  });
  
  // Filter goals
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || goal.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || goal.category === selectedCategory;
      const matchesEmployee = selectedEmployee === "all" || goal.employeeName === selectedEmployee;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesEmployee;
    });
  }, [goals, searchQuery, selectedStatus, selectedCategory, selectedEmployee]);
  
  // Paginate filtered goals
  const paginatedGoals = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredGoals.slice(startIndex, endIndex);
  }, [filteredGoals, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === "completed").length;
    const inProgressGoals = goals.filter(g => g.status === "in-progress").length;
    const overdueGoals = goals.filter(g => 
      g.status !== "completed" && new Date(g.dueDate) < new Date()
    ).length;
    
    return [
      {
        label: "Total Goals",
        value: totalGoals,
        icon: "lucide:target",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        label: "Completed",
        value: completedGoals,
        icon: "lucide:check-circle",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "In Progress",
        value: inProgressGoals,
        icon: "lucide:clock",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        label: "Overdue",
        value: overdueGoals,
        icon: "lucide:alert-triangle",
        color: "text-red-600",
        bgColor: "bg-red-100"
      }
    ];
  }, [goals]);

  // Handle add goal
  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.employeeName || !newGoal.startDate || !newGoal.dueDate) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields (Title, Employee, Start Date, Due Date).",
        color: "warning",
      });
      return;
    }

    const goal: Goal = {
      id: Date.now(),
      employeeId: newGoal.employeeId || `EMP${Date.now()}`,
      employeeName: newGoal.employeeName!,
      title: newGoal.title!,
      description: newGoal.description || "",
      category: newGoal.category as Goal["category"] || "performance",
      priority: newGoal.priority as Goal["priority"] || "medium",
      status: newGoal.status as Goal["status"] || "not-started",
      progress: newGoal.progress || 0,
      startDate: newGoal.startDate!,
      dueDate: newGoal.dueDate!,
      managerId: newGoal.managerId || "MGR001",
      managerName: newGoal.managerName || "Manager",
      department: newGoal.department || "",
      kpis: newGoal.kpis || [],
      milestones: newGoal.milestones || [],
      notes: newGoal.notes || "",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      employeeId: "",
      employeeName: "",
      title: "",
      description: "",
      category: "performance",
      priority: "medium",
      status: "not-started",
      progress: 0,
      startDate: "",
      dueDate: "",
      managerId: "",
      managerName: "",
      department: "",
      kpis: [],
      milestones: [],
      notes: ""
    });
    setIsAddModalOpen(false);
    
    addToast({
      title: "Goal Added",
      description: `Goal "${goal.title}" has been added for ${goal.employeeName}.`,
      color: "success",
    });
  };

  // Handle edit goal
  const handleEditGoal = async () => {
    if (!selectedGoal || !newGoal.title || !newGoal.employeeName) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const updatedGoal: Goal = {
      ...selectedGoal,
      title: newGoal.title!,
      description: newGoal.description || "",
      category: newGoal.category as Goal["category"] || selectedGoal.category,
      priority: newGoal.priority as Goal["priority"] || selectedGoal.priority,
      status: newGoal.status as Goal["status"] || selectedGoal.status,
      progress: newGoal.progress || selectedGoal.progress,
      startDate: newGoal.startDate || selectedGoal.startDate,
      dueDate: newGoal.dueDate || selectedGoal.dueDate,
      managerName: newGoal.managerName || selectedGoal.managerName,
      department: newGoal.department || selectedGoal.department,
      kpis: newGoal.kpis || selectedGoal.kpis,
      milestones: newGoal.milestones || selectedGoal.milestones,
      notes: newGoal.notes || selectedGoal.notes,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setGoals(prev => prev.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    setIsEditModalOpen(false);
    setSelectedGoal(null);
    
    addToast({
      title: "Goal Updated",
      description: `Goal "${updatedGoal.title}" has been updated successfully.`,
      color: "success",
    });
  };

  // Handle progress update
  const handleProgressUpdate = (goal: Goal, newProgress: number) => {
    const updatedGoal = {
      ...goal,
      progress: newProgress,
      status: newProgress === 100 ? "completed" as const : 
              newProgress > 0 ? "in-progress" as const : "not-started" as const,
      completionDate: newProgress === 100 ? new Date().toISOString().split('T')[0] : undefined,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setGoals(prev => prev.map(g => g.id === goal.id ? updatedGoal : g));
    
    addToast({
      title: "Progress Updated",
      description: `Progress updated to ${newProgress}% for "${goal.title}".`,
      color: "success",
    });
  };

  // Handle status update
  const handleStatusUpdate = (goal: Goal, newStatus: Goal["status"]) => {
    const updatedGoal = {
      ...goal,
      status: newStatus,
      completionDate: newStatus === "completed" ? new Date().toISOString().split('T')[0] : undefined,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setGoals(prev => prev.map(g => g.id === goal.id ? updatedGoal : g));
    
    addToast({
      title: "Status Updated",
      description: `Status updated to ${newStatus} for "${goal.title}".`,
      color: "success",
    });
  };

  // Handle delete goal
  const handleDeleteGoal = (goal: Goal) => {
    setGoals(prev => prev.filter(g => g.id !== goal.id));
    
    addToast({
      title: "Goal Deleted",
      description: `Goal "${goal.title}" has been removed.`,
      color: "success",
    });
  };

  // Open edit modal
  const openEditModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
      progress: goal.progress,
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      managerName: goal.managerName,
      department: goal.department,
      kpis: goal.kpis,
      milestones: goal.milestones,
      notes: goal.notes
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Icon icon="lucide:target" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
              <p className="text-gray-600 mt-1">Set and track employee performance goals</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              startContent={<Icon icon="lucide:plus" />} 
              onPress={() => setIsAddModalOpen(true)}
              className="font-medium"
            >
              Add Goal
            </Button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Status"
                placeholder="All Statuses"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="not-started">Not Started</SelectItem>
                <SelectItem key="in-progress">In Progress</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="on-hold">On Hold</SelectItem>
                <SelectItem key="cancelled">Cancelled</SelectItem>
              </Select>
              <Select
                label="Category"
                placeholder="All Categories"
                selectedKeys={[selectedCategory]}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Categories</SelectItem>
                <SelectItem key="performance">Performance</SelectItem>
                <SelectItem key="development">Development</SelectItem>
                <SelectItem key="behavioral">Behavioral</SelectItem>
                <SelectItem key="project">Project</SelectItem>
                <SelectItem key="sales">Sales</SelectItem>
                <SelectItem key="quality">Quality</SelectItem>
              </Select>
              <Select
                label="Employee"
                placeholder="All Employees"
                selectedKeys={[selectedEmployee]}
                onSelectionChange={(keys) => setSelectedEmployee(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee}>{employee}</SelectItem>
                ))}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredGoals.length} of {goals.length} goals
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-green-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Goals List</h3>
                <p className="text-gray-500 text-sm">Track and manage employee goals</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Goals table">
              <TableHeader>
                <TableColumn>GOAL</TableColumn>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>PROGRESS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DUE DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedGoals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{goal.title}</p>
                        <p className="text-sm text-gray-500 max-w-xs truncate">{goal.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={goal.employeeName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{goal.employeeName}</p>
                          <p className="text-sm text-gray-500">{goal.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={categoryColorMap[goal.category] as any}
                        variant="flat"
                      >
                        {goal.category}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={priorityColorMap[goal.priority] as any}
                        variant="flat"
                      >
                        {goal.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={goal.progress} 
                          className="w-20"
                          color={goal.progress === 100 ? "success" : goal.progress >= 75 ? "primary" : goal.progress >= 50 ? "warning" : "danger"}
                        />
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[goal.status] as any}
                        variant="flat"
                      >
                        {goal.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{new Date(goal.dueDate).toLocaleDateString()}</p>
                        {new Date(goal.dueDate) < new Date() && goal.status !== "completed" && (
                          <p className="text-xs text-red-500">Overdue</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedGoal(goal);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => openEditModal(goal)}
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
                            <DropdownItem key="update-progress" onPress={() => {
                              const newProgress = prompt("Enter new progress (0-100):", goal.progress.toString());
                              if (newProgress && !isNaN(Number(newProgress))) {
                                handleProgressUpdate(goal, Number(newProgress));
                              }
                            }}>
                              Update Progress
                            </DropdownItem>
                            <DropdownItem key="mark-complete" onPress={() => handleStatusUpdate(goal, "completed")}>
                              Mark Complete
                            </DropdownItem>
                            <DropdownItem key="put-on-hold" onPress={() => handleStatusUpdate(goal, "on-hold")}>
                              Put on Hold
                            </DropdownItem>
                            <DropdownItem key="delete" className="text-danger" onPress={() => handleDeleteGoal(goal)}>
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
            
            {filteredGoals.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredGoals.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add Goal Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Add New Goal</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Goal Title *"
                  placeholder="Enter goal title"
                  value={newGoal.title || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
                <Select
                  label="Employee *"
                  placeholder="Select employee"
                  selectedKeys={newGoal.employeeName ? [newGoal.employeeName] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, employeeName: Array.from(keys)[0] as string }))}
                >
                  {employees.map(employee => (
                    <SelectItem key={employee}>{employee}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={newGoal.category ? [newGoal.category] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, category: Array.from(keys)[0] as Goal["category"] }))}
                >
                  <SelectItem key="performance">Performance</SelectItem>
                  <SelectItem key="development">Development</SelectItem>
                  <SelectItem key="behavioral">Behavioral</SelectItem>
                  <SelectItem key="project">Project</SelectItem>
                  <SelectItem key="sales">Sales</SelectItem>
                  <SelectItem key="quality">Quality</SelectItem>
                </Select>
                <Select
                  label="Priority"
                  placeholder="Select priority"
                  selectedKeys={newGoal.priority ? [newGoal.priority] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, priority: Array.from(keys)[0] as Goal["priority"] }))}
                >
                  <SelectItem key="low">Low</SelectItem>
                  <SelectItem key="medium">Medium</SelectItem>
                  <SelectItem key="high">High</SelectItem>
                  <SelectItem key="critical">Critical</SelectItem>
                </Select>
                <Input
                  label="Start Date *"
                  type="date"
                  value={newGoal.startDate || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <Input
                  label="Due Date *"
                  type="date"
                  value={newGoal.dueDate || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Select
                  label="Manager"
                  placeholder="Select manager"
                  selectedKeys={newGoal.managerName ? [newGoal.managerName] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, managerName: Array.from(keys)[0] as string }))}
                >
                  {managers.map(manager => (
                    <SelectItem key={manager}>{manager}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Department"
                  placeholder="Select department"
                  selectedKeys={newGoal.department ? [newGoal.department] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, department: Array.from(keys)[0] as string }))}
                >
                  {departments.map(dept => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>
              </div>
              <Textarea
                label="Description"
                placeholder="Enter goal description"
                value={newGoal.description || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                minRows={3}
              />
              <Textarea
                label="KPIs (one per line)"
                placeholder="Enter key performance indicators"
                value={newGoal.kpis?.join('\n') || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, kpis: e.target.value.split('\n').filter(kpi => kpi.trim()) }))}
                minRows={3}
              />
              <Textarea
                label="Milestones (one per line)"
                placeholder="Enter milestones"
                value={newGoal.milestones?.join('\n') || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, milestones: e.target.value.split('\n').filter(milestone => milestone.trim()) }))}
                minRows={3}
              />
              <Textarea
                label="Notes"
                placeholder="Additional notes"
                value={newGoal.notes || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, notes: e.target.value }))}
                minRows={2}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleAddGoal}>
                Add Goal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Goal Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Edit Goal</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Goal Title *"
                  placeholder="Enter goal title"
                  value={newGoal.title || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={newGoal.category ? [newGoal.category] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, category: Array.from(keys)[0] as Goal["category"] }))}
                >
                  <SelectItem key="performance">Performance</SelectItem>
                  <SelectItem key="development">Development</SelectItem>
                  <SelectItem key="behavioral">Behavioral</SelectItem>
                  <SelectItem key="project">Project</SelectItem>
                  <SelectItem key="sales">Sales</SelectItem>
                  <SelectItem key="quality">Quality</SelectItem>
                </Select>
                <Select
                  label="Priority"
                  placeholder="Select priority"
                  selectedKeys={newGoal.priority ? [newGoal.priority] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, priority: Array.from(keys)[0] as Goal["priority"] }))}
                >
                  <SelectItem key="low">Low</SelectItem>
                  <SelectItem key="medium">Medium</SelectItem>
                  <SelectItem key="high">High</SelectItem>
                  <SelectItem key="critical">Critical</SelectItem>
                </Select>
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={newGoal.status ? [newGoal.status] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, status: Array.from(keys)[0] as Goal["status"] }))}
                >
                  <SelectItem key="not-started">Not Started</SelectItem>
                  <SelectItem key="in-progress">In Progress</SelectItem>
                  <SelectItem key="completed">Completed</SelectItem>
                  <SelectItem key="on-hold">On Hold</SelectItem>
                  <SelectItem key="cancelled">Cancelled</SelectItem>
                </Select>
                <Input
                  label="Progress (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={newGoal.progress || 0}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                />
                <Input
                  label="Start Date"
                  type="date"
                  value={newGoal.startDate || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={newGoal.dueDate || ""}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Select
                  label="Manager"
                  placeholder="Select manager"
                  selectedKeys={newGoal.managerName ? [newGoal.managerName] : []}
                  onSelectionChange={(keys) => setNewGoal(prev => ({ ...prev, managerName: Array.from(keys)[0] as string }))}
                >
                  {managers.map(manager => (
                    <SelectItem key={manager}>{manager}</SelectItem>
                  ))}
                </Select>
              </div>
              <Textarea
                label="Description"
                placeholder="Enter goal description"
                value={newGoal.description || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                minRows={3}
              />
              <Textarea
                label="KPIs (one per line)"
                placeholder="Enter key performance indicators"
                value={newGoal.kpis?.join('\n') || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, kpis: e.target.value.split('\n').filter(kpi => kpi.trim()) }))}
                minRows={3}
              />
              <Textarea
                label="Milestones (one per line)"
                placeholder="Enter milestones"
                value={newGoal.milestones?.join('\n') || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, milestones: e.target.value.split('\n').filter(milestone => milestone.trim()) }))}
                minRows={3}
              />
              <Textarea
                label="Notes"
                placeholder="Additional notes"
                value={newGoal.notes || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, notes: e.target.value }))}
                minRows={2}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleEditGoal}>
                Update Goal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Goal Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="3xl">
          <ModalContent>
            <ModalHeader>Goal Details</ModalHeader>
            <ModalBody>
              {selectedGoal && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={selectedGoal.employeeName}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedGoal.title}</h3>
                      <p className="text-gray-600">{selectedGoal.employeeName} • {selectedGoal.department}</p>
                      <p className="text-gray-600">Manager: {selectedGoal.managerName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Goal Information</h4>
                      <p><strong>Category:</strong> 
                        <Chip size="sm" color={categoryColorMap[selectedGoal.category] as any} variant="flat" className="ml-2">
                          {selectedGoal.category}
                        </Chip>
                      </p>
                      <p><strong>Priority:</strong> 
                        <Chip size="sm" color={priorityColorMap[selectedGoal.priority] as any} variant="flat" className="ml-2">
                          {selectedGoal.priority}
                        </Chip>
                      </p>
                      <p><strong>Status:</strong> 
                        <Chip size="sm" color={statusColorMap[selectedGoal.status] as any} variant="flat" className="ml-2">
                          {selectedGoal.status}
                        </Chip>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Timeline</h4>
                      <p><strong>Start Date:</strong> {new Date(selectedGoal.startDate).toLocaleDateString()}</p>
                      <p><strong>Due Date:</strong> {new Date(selectedGoal.dueDate).toLocaleDateString()}</p>
                      {selectedGoal.completionDate && (
                        <p><strong>Completed:</strong> {new Date(selectedGoal.completionDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Progress</h4>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={selectedGoal.progress} 
                        className="flex-1"
                        color={selectedGoal.progress === 100 ? "success" : selectedGoal.progress >= 75 ? "primary" : selectedGoal.progress >= 50 ? "warning" : "danger"}
                      />
                      <span className="text-lg font-bold">{selectedGoal.progress}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-700">{selectedGoal.description}</p>
                  </div>
                  
                  {selectedGoal.kpis.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Performance Indicators</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedGoal.kpis.map((kpi, index) => (
                          <li key={index} className="text-gray-700">{kpi}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedGoal.milestones.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Milestones</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedGoal.milestones.map((milestone, index) => (
                          <li key={index} className="text-gray-700">{milestone}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedGoal.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-gray-700">{selectedGoal.notes}</p>
                    </div>
                  )}
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
