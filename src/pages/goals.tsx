import React, { useState, useMemo } from "react";
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
  Avatar,
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  Textarea,
  Progress,
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { useGoals, Goal } from "../hooks/useGoals";
import PageLayout, { PageHeader } from "../components/layout/PageLayout";

const categories = [
  "performance", "development", "behavioral", "project", "sales", "quality"
];

const priorities = ["low", "medium", "high", "critical"];

const statusColorMap = {
  "not_started": "default",
  "in_progress": "primary",
  "completed": "success",
  "cancelled": "danger",
};

const priorityColorMap = {
  "low": "default",
  "medium": "warning",
  "high": "danger",
  "critical": "danger",
};

const categoryColorMap = {
  "performance": "primary",
  "development": "secondary",
  "behavioral": "success",
  "project": "warning",
  "sales": "danger",
  "quality": "default",
};

export default function GoalsPage() {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const rowsPerPage = 10;
  
  // Form state for new goal
  const [newGoal, setNewGoal] = useState({
    employee_id: 1,
    title: "",
    description: "",
    category: "",
    priority: "medium",
    start_date: "",
    end_date: "",
    target_value: "",
    current_value: "0",
    unit: ""
  });

  // Filter goals
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = 
        (goal.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (goal.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || goal.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || goal.category === selectedCategory;
      const matchesPriority = selectedPriority === "all" || goal.priority === selectedPriority;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [goals, searchQuery, selectedStatus, selectedCategory, selectedPriority]);
  
  // Paginate filtered goals
  const paginatedGoals = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredGoals.slice(startIndex, endIndex);
  }, [filteredGoals, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = goals.length;
    const notStarted = goals.filter(g => g.status === "not_started").length;
    const inProgress = goals.filter(g => g.status === "in_progress").length;
    const completed = goals.filter(g => g.status === "completed").length;
    const cancelled = goals.filter(g => g.status === "cancelled").length;
    
    return { total, notStarted, inProgress, completed, cancelled };
  }, [goals]);

  // Handle row actions
  const handleRowAction = (actionKey: string, goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    switch (actionKey) {
      case "view":
        setSelectedGoal(goal);
        onViewOpen();
        break;
      case "edit":
        handleEditGoal(goal);
        break;
      case "delete":
        handleDeleteGoal(goalId);
        break;
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal(id);
        addToast({
          title: "Success",
          description: "Goal deleted successfully",
          color: "success"
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to delete goal",
          color: "danger"
        });
      }
    }
  };

  const handleSubmitGoal = async () => {
    if (!newGoal.title || !newGoal.start_date || !newGoal.end_date) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          ...newGoal,
          target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
          current_value: parseFloat(newGoal.current_value)
        });
        addToast({
          title: "Success",
          description: "Goal updated successfully",
          color: "success"
        });
      } else {
        await createGoal({
          ...newGoal,
          target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
          current_value: parseFloat(newGoal.current_value)
        });
        addToast({
          title: "Success",
          description: "Goal created successfully",
          color: "success"
        });
      }
      
      setNewGoal({
        employee_id: 1,
        title: "",
        description: "",
        category: "",
        priority: "medium",
        start_date: "",
        end_date: "",
        target_value: "",
        current_value: "0",
        unit: ""
      });
      setEditingGoal(null);
      onOpenChange();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save goal",
        color: "danger"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      employee_id: goal.employee_id,
      title: goal.title,
      description: goal.description || "",
      category: goal.category || "",
      priority: goal.priority,
      start_date: goal.start_date,
      end_date: goal.end_date,
      target_value: goal.target_value?.toString() || "",
      current_value: goal.current_value?.toString() || "0",
      unit: goal.unit || ""
    });
    onOpen();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (current: number, target: number) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center text-danger">
          <p>Error loading goals: {error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Goals Management"
        description="Manage employee goals and performance objectives"
        actions={
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Goal
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Goals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Icon icon="lucide:target" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">In Progress</p>
                <p className="text-2xl font-bold text-primary-600">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Icon icon="lucide:play-circle" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Completed</p>
                <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Icon icon="lucide:check-circle" className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Not Started</p>
                <p className="text-2xl font-bold text-default-600">{stats.notStarted}</p>
              </div>
              <div className="p-3 bg-content2 rounded-full">
                <Icon icon="lucide:clock" className="w-6 h-6 text-default-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" />}
              className="flex-1"
            />
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-48"
            >
              <SelectItem key="all" value="all">All Status</SelectItem>
              <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
              <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
              <SelectItem key="completed" value="completed">Completed</SelectItem>
              <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
            </Select>
            <Select
              placeholder="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48"
            >
              <SelectItem key="all" value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </Select>
            <Select
              placeholder="Priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full md:w-48"
            >
              <SelectItem key="all" value="all">All Priorities</SelectItem>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Goals Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Goals</h3>
            <p className="text-sm text-default-500">
              Showing {paginatedGoals.length} of {filteredGoals.length} goals
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Goals table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>TITLE</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>PRIORITY</TableColumn>
              <TableColumn>PROGRESS</TableColumn>
              <TableColumn>DUE DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No goals found">
              {paginatedGoals.map((goal) => {
                const progress = calculateProgress(goal.current_value || 0, goal.target_value || 0);
                return (
                  <TableRow key={goal.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          name={goal.employee_name || "Unknown"}
                          className="flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium">{goal.employee_name || "Unknown"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{goal.title}</p>
                        {goal.description && (
                          <p className="text-sm text-default-500 truncate">{goal.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={categoryColorMap[goal.category as keyof typeof categoryColorMap] || "default"}
                        variant="flat"
                      >
                        {goal.category}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={priorityColorMap[goal.priority as keyof typeof priorityColorMap] || "default"}
                        variant="flat"
                      >
                        {goal.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={progress}
                          className="flex-1"
                          size="sm"
                          color={progress >= 100 ? "success" : progress >= 50 ? "primary" : "warning"}
                        />
                        <span className="text-sm text-default-500 min-w-[3rem]">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(goal.end_date)}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[goal.status as keyof typeof statusColorMap] || "default"}
                        variant="flat"
                      >
                        {goal.status.replace('_', ' ')}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:more-vertical" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Goal actions"
                          onAction={(key) => handleRowAction(key as string, goal.id)}
                        >
                          <DropdownItem key="view" startContent={<Icon icon="lucide:eye" />}>
                            View
                          </DropdownItem>
                          <DropdownItem key="edit" startContent={<Icon icon="lucide:edit" />}>
                            Edit
                          </DropdownItem>
                          <DropdownItem 
                            key="delete" 
                            startContent={<Icon icon="lucide:trash" />}
                            className="text-danger"
                            color="danger"
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      {/* Add/Edit Goal Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingGoal ? "Edit Goal" : "Add New Goal"}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    placeholder="Enter goal title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    isRequired
                  />

                  <Select
                    label="Category"
                    placeholder="Select category"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Priority"
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  >
                    {priorities.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Unit (Optional)"
                    placeholder="e.g., hours, tasks, %"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                  />

                  <Input
                    label="Start Date"
                    type="date"
                    value={newGoal.start_date}
                    onChange={(e) => setNewGoal({...newGoal, start_date: e.target.value})}
                    isRequired
                  />

                  <Input
                    label="End Date"
                    type="date"
                    value={newGoal.end_date}
                    onChange={(e) => setNewGoal({...newGoal, end_date: e.target.value})}
                    isRequired
                  />

                  <Input
                    label="Target Value (Optional)"
                    placeholder="0"
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({...newGoal, target_value: e.target.value})}
                  />

                  <Input
                    label="Current Value"
                    placeholder="0"
                    type="number"
                    value={newGoal.current_value}
                    onChange={(e) => setNewGoal({...newGoal, current_value: e.target.value})}
                  />

                  <div className="md:col-span-2">
                    <Textarea
                      label="Description (Optional)"
                      placeholder="Enter goal description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSubmitGoal}
                  isLoading={isSubmitting}
                >
                  {editingGoal ? "Update" : "Create"} Goal
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Goal Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Goal Details</ModalHeader>
              <ModalBody>
                {selectedGoal && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Employee</p>
                        <p className="font-medium">{selectedGoal.employee_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Category</p>
                        <Chip
                          size="sm"
                          color={categoryColorMap[selectedGoal.category as keyof typeof categoryColorMap] || "default"}
                          variant="flat"
                        >
                          {selectedGoal.category}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Priority</p>
                        <Chip
                          size="sm"
                          color={priorityColorMap[selectedGoal.priority as keyof typeof priorityColorMap] || "default"}
                          variant="flat"
                        >
                          {selectedGoal.priority}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Status</p>
                        <Chip
                          size="sm"
                          color={statusColorMap[selectedGoal.status as keyof typeof statusColorMap] || "default"}
                          variant="flat"
                        >
                          {selectedGoal.status.replace('_', ' ')}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Start Date</p>
                        <p className="font-medium">{formatDate(selectedGoal.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">End Date</p>
                        <p className="font-medium">{formatDate(selectedGoal.end_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Progress</p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={calculateProgress(selectedGoal.current_value || 0, selectedGoal.target_value || 0)}
                            className="flex-1"
                            size="sm"
                          />
                          <span className="text-sm text-default-500">
                            {Math.round(calculateProgress(selectedGoal.current_value || 0, selectedGoal.target_value || 0))}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Created</p>
                        <p className="font-medium">{formatDate(selectedGoal.created_at)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Title</p>
                      <p className="font-medium">{selectedGoal.title}</p>
                    </div>
                    {selectedGoal.description && (
                      <div>
                        <p className="text-sm text-default-500">Description</p>
                        <p className="font-medium">{selectedGoal.description}</p>
                      </div>
                    )}
                    {(selectedGoal.target_value || selectedGoal.current_value) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-default-500">Current Value</p>
                          <p className="font-medium">{selectedGoal.current_value || 0} {selectedGoal.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-default-500">Target Value</p>
                          <p className="font-medium">{selectedGoal.target_value || "N/A"} {selectedGoal.unit}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageLayout>
  );
}