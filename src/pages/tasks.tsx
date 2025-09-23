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
import { useAuth } from "../contexts/auth-context";
import { useTaskContext } from "../contexts/task-context";

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
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    dueDate: "",
    tags: "",
    estimatedHours: "",
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


  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Icon icon="lucide:check-square" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-1">Manage and track your tasks</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onOpen}
              className="font-medium"
            >
              Add Task
            </Button>
            <Button 
              color="secondary" 
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              className="font-medium"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
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
                tabContent: "group-data-[selected=true]:text-primary"
              }}
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center space-x-2">
                    <span>All Tasks</span>
                    <Badge content={taskCounts.all} color="primary" size="sm">{taskCounts.all}</Badge>
                  </div>
                }
              />
              <Tab
                key="pending"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Pending</span>
                    <Badge content={taskCounts.pending} color="default" size="sm">{taskCounts.pending}</Badge>
                  </div>
                }
              />
              <Tab
                key="in_progress"
                title={
                  <div className="flex items-center space-x-2">
                    <span>In Progress</span>
                    <Badge content={taskCounts.in_progress} color="primary" size="sm">{taskCounts.in_progress}</Badge>
                  </div>
                }
              />
              <Tab
                key="completed"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Completed</span>
                    <Badge content={taskCounts.completed} color="success" size="sm">{taskCounts.completed}</Badge>
                  </div>
                }
              />
              <Tab
                key="cancelled"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Cancelled</span>
                    <Badge content={taskCounts.cancelled} color="danger" size="sm">{taskCounts.cancelled}</Badge>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
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
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{task.progress}%</span>
                    </div>
                    <Progress
                      value={task.progress}
                      color={task.progress === 100 ? "success" : task.progress > 50 ? "primary" : "warning"}
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
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
              <Icon icon="lucide:check-square" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or create a new task.</p>
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
                    <Icon icon="lucide:plus" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Add New Task</h3>
                      <p className="text-sm text-gray-500">Create a new task for your team</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Task Title"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      isRequired
                    />
                    
                    <Textarea
                      label="Description"
                      placeholder="Enter task description"
                      value={newTask.description}
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
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        isRequired
                      />
                      
                      <Input
                        label="Estimated Hours"
                        type="number"
                        placeholder="Enter estimated hours"
                        value={newTask.estimatedHours}
                        onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Project"
                        placeholder="Enter project name"
                        value={newTask.project}
                        onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                      />
                      
                      <Input
                        label="Department"
                        placeholder="Enter department"
                        value={newTask.department}
                        onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                      />
                    </div>
                    
                    <Input
                      label="Tags"
                      placeholder="Enter tags (comma separated)"
                      value={newTask.tags}
                      onChange={(e) => setNewTask({...newTask, tags: e.target.value})}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleAddTask}>
                    Add Task
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}