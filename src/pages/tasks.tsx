import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Chip,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Progress,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import HeroSection from "../components/common/HeroSection";
import { useAuth } from "../contexts/auth-context";
import { useTaskContext } from "../contexts/task-context";
import Papa from "papaparse";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignee: string;
  assigneeId: string;
  dueDate: string;
  progress: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
  project?: string;
  department?: string;
  // Additional database fields
  company_id?: number;
  assigned_to?: number;
  assigned_by?: number;
  task_id?: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_email?: string;
  first_name?: string;
  last_name?: string;
  completed_at?: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, taskCounts, addTask, updateTask, deleteTask } = useTaskContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    dueDate: "",
    tags: "",
    estimatedHours: "",
    actualHours: "",
    project: "",
    department: ""
  });
  const [isLoading, setIsLoading] = useState(false);


  const priorityOptions = [
    { key: "low", label: "Low", color: "success" },
    { key: "medium", label: "Medium", color: "warning" },
    { key: "high", label: "High", color: "danger" },
    { key: "urgent", label: "Urgent", color: "danger" }
  ];

  const statusOptions = [
    { key: "pending", label: "Pending", color: "default" },
    { key: "in_progress", label: "In Progress", color: "primary" },
    { key: "completed", label: "Completed", color: "success" },
    { key: "cancelled", label: "Cancelled", color: "danger" }
  ];

  const assignees = [
    { key: "user-1", label: "John Doe" },
    { key: "user-2", label: "Jane Smith" },
    { key: "user-3", label: "Mike Johnson" },
    { key: "user-4", label: "Sarah Wilson" },
    { key: "user-5", label: "David Brown" }
  ];


  useEffect(() => {
    // Apply filters
    let filtered = tasks;

    // Tab filter
    if (selectedTab !== 'all') {
      filtered = filtered.filter(task => task.status === selectedTab);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(task => task.assigneeId === assigneeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedTab, searchTerm, priorityFilter, assigneeFilter, statusFilter]);


  const handleAddTask = () => {
    if (newTask.title && newTask.assignee && newTask.dueDate) {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as Task['priority'],
        status: 'pending' as Task['status'],
        assignee: assignees.find(a => a.key === newTask.assignee)?.label || newTask.assignee,
        assigneeId: newTask.assignee,
        dueDate: newTask.dueDate,
        progress: 0,
        tags: newTask.tags ? newTask.tags.split(',').map(tag => tag.trim()) : [],
        estimatedHours: newTask.estimatedHours ? parseInt(newTask.estimatedHours) : undefined,
        actualHours: newTask.actualHours ? parseInt(newTask.actualHours) : undefined,
        project: newTask.project,
        department: newTask.department
      };

      addTask(taskData);
      
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assignee: "",
        dueDate: "",
        tags: "",
        estimatedHours: "",
        actualHours: "",
        project: "",
        department: ""
      });
      onOpenChange();
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assigneeId,
      dueDate: task.dueDate,
      tags: task.tags.join(', '),
      estimatedHours: task.estimatedHours?.toString() || "",
      actualHours: task.actualHours?.toString() || "",
      project: task.project || "",
      department: task.department || ""
    });
    onOpen();
  };

  const handleUpdateTask = () => {
    if (editingTask && newTask.title && newTask.assignee && newTask.dueDate) {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as Task['priority'],
        assignee: assignees.find(a => a.key === newTask.assignee)?.label || newTask.assignee,
        assigneeId: newTask.assignee,
        dueDate: newTask.dueDate,
        tags: newTask.tags ? newTask.tags.split(',').map(tag => tag.trim()) : [],
        estimatedHours: newTask.estimatedHours ? parseInt(newTask.estimatedHours) : undefined,
        actualHours: newTask.actualHours ? parseInt(newTask.actualHours) : undefined,
        project: newTask.project,
        department: newTask.department
      };

      updateTask(editingTask.id, taskData);
      
      setEditingTask(null);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assignee: "",
        dueDate: "",
        tags: "",
        estimatedHours: "",
        actualHours: "",
        project: "",
        department: ""
      });
      onOpenChange();
    }
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  const handleUpdateTaskProgress = (taskId: number, newProgress: number) => {
    const newStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'pending';
    updateTask(taskId, { progress: newProgress, status: newStatus });
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId);
  };

  const getPriorityColor = (priority: string) => {
    return priorityOptions.find(p => p.key === priority)?.color || 'default';
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.key === status)?.color || 'default';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'lucide:alert-triangle';
      case 'high': return 'lucide:arrow-up';
      case 'medium': return 'lucide:minus';
      case 'low': return 'lucide:arrow-down';
      default: return 'lucide:minus';
    }
  };

  const handleExportTasks = () => {
    const exportData = filteredTasks.map(task => ({
      'Task ID': task.id,
      'Title': task.title,
      'Description': task.description,
      'Priority': task.priority,
      'Status': task.status,
      'Assignee': task.assignee,
      'Due Date': task.dueDate,
      'Progress': `${task.progress}%`,
      'Tags': task.tags.join(', '),
      'Estimated Hours': task.estimatedHours || '',
      'Actual Hours': task.actualHours || '',
      'Project': task.project || '',
      'Department': task.department || '',
      'Created At': new Date(task.createdAt).toLocaleDateString(),
      'Updated At': new Date(task.updatedAt).toLocaleDateString()
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Tasks"
          subtitle="Task Management"
          description="Manage and track your tasks efficiently. Stay organized with our comprehensive task management system."
          icon="lucide:check-square"
          illustration="task"
          actions={[
            {
              label: "Add Task",
              icon: "lucide:plus",
              onPress: onOpen,
              variant: "solid"
            },
            {
              label: "Export Tasks",
              icon: "lucide:download",
              onPress: handleExportTasks,
              variant: "bordered"
            }
          ]}
        />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Export button removed - now available in hero section */}
          </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Search tasks..."
                
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                className="lg:col-span-2"
              />
              <Select
                placeholder="Priority"
                selectedKeys={[priorityFilter]}
                onSelectionChange={(keys) => setPriorityFilter(Array.from(keys)[0] as string)}
                items={[{ key: "all", label: "All Priorities" }, ...priorityOptions]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                placeholder="Assignee"
                selectedKeys={[assigneeFilter]}
                onSelectionChange={(keys) => setAssigneeFilter(Array.from(keys)[0] as string)}
                items={[{ key: "all", label: "All Assignees" }, ...assignees]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                placeholder="Status"
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
                items={[{ key: "all", label: "All Status" }, ...statusOptions]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Task Tabs */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-0">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              className="w-full"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-6 h-12",
                tabContent: "group-data-[selected=true]:text-foreground text-foreground font-medium"
              }}
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-medium">All Tasks</span>
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                      {taskCounts.all}
                    </span>
                  </div>
                }
              />
              <Tab
                key="pending"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-medium">Pending</span>
                    <span className="bg-content2 text-foreground text-xs font-medium px-2 py-1 rounded-full">
                      {taskCounts.pending}
                    </span>
                  </div>
                }
              />
              <Tab
                key="in_progress"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-medium">In Progress</span>
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                      {taskCounts.in_progress}
                    </span>
                  </div>
                }
              />
              <Tab
                key="completed"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-medium">Completed</span>
                    <span className="bg-success-100 text-success-800 text-xs font-medium px-2 py-1 rounded-full">
                      {taskCounts.completed}
                    </span>
                  </div>
                }
              />
              <Tab
                key="cancelled"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-foreground font-medium">Cancelled</span>
                    <span className="bg-danger-100 text-danger-800 text-xs font-medium px-2 py-1 rounded-full">
                      {taskCounts.cancelled}
                    </span>
                  </div>
                }
              />
            </Tabs>
          </CardBody>
        </Card>

        {/* Tasks List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{task.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Chip
                          size="sm"
                          color={getPriorityColor(task.priority) as any}
                          variant="flat"
                          startContent={<Icon icon={getPriorityIcon(task.priority)} className="w-3 h-3" />}
                        >
                          {task.priority}
                        </Chip>
                        <Chip
                          size="sm"
                          color={getStatusColor(task.status) as any}
                          variant="flat"
                        >
                          {task.status.replace('_', ' ')}
                        </Chip>
                      </div>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label="Task actions">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEditTask(task)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" />}
                          onPress={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-default-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-default-500">Progress</span>
                      <span className="text-sm font-medium text-foreground">{task.progress}%</span>
                    </div>
                    <Progress
                      
                      color={task.progress === 100 ? "success" : task.progress > 50 ? "primary" : "warning"}
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between text-sm text-default-500">
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:user" className="w-4 h-4" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:calendar" className="w-4 h-4" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Chip key={index} size="sm" variant="flat" color="default">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleUpdateTaskProgress(task.id, Math.min(task.progress + 25, 100))}
                        isDisabled={task.status === 'completed'}
                      >
                        Update Progress
                      </Button>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        onPress={() => handleUpdateTaskStatus(task.id, 'completed')}
                        isDisabled={task.status === 'completed'}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardBody className="text-center py-12">
              <Icon icon="lucide:check-square" className="w-16 h-16 text-default-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
              <p className="text-default-500 mb-4">Try adjusting your filters or create a new task.</p>
              <Button color="primary" onPress={onOpen}>
                Create Task
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Add Task Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon={editingTask ? "lucide:edit" : "lucide:plus"} className="text-primary-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                      <p className="text-sm text-default-500">{editingTask ? 'Update task details' : 'Create a new task for your team'}</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Task Title"
                      placeholder="Enter task title"
                      
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      isRequired
                    />
                    
                    <Textarea
                      label="Description"
                      placeholder="Enter task description"
                      
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      minRows={3}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Priority"
                        placeholder="Select priority"
                        selectedKeys={[newTask.priority]}
                        onSelectionChange={(keys) => setNewTask({...newTask, priority: Array.from(keys)[0] as string})}
                      >
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.key}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </Select>
                      
                      <Select
                        label="Assignee"
                        placeholder="Select assignee"
                        selectedKeys={[newTask.assignee]}
                        onSelectionChange={(keys) => setNewTask({...newTask, assignee: Array.from(keys)[0] as string})}
                        isRequired
                      >
                        {assignees.map((assignee) => (
                          <SelectItem key={assignee.key}>
                            {assignee.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Due Date"
                        type="date"
                        
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        isRequired
                      />
                      
                      <Input
                        label="Estimated Hours"
                        type="number"
                        placeholder="Enter estimated hours"
                        
                        onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                      />
                      
                      <Input
                        label="Actual Hours"
                        type="number"
                        placeholder="Enter actual hours"
                        
                        onChange={(e) => setNewTask({...newTask, actualHours: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Project"
                        placeholder="Enter project name"
                        
                        onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                      />
                      
                      <Input
                        label="Department"
                        placeholder="Enter department"
                        
                        onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                      />
                    </div>
                    
                    <Input
                      label="Tags"
                      placeholder="Enter tags (comma separated)"
                      
                      onChange={(e) => setNewTask({...newTask, tags: e.target.value})}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={editingTask ? handleUpdateTask : handleAddTask}
                  >
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        </motion.div>
      </div>
    </div>
  );
}