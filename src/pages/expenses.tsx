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
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { useExpenses, Expense } from "../hooks/useExpenses";
import HeroSection from "../components/common/HeroSection";

const categories = [
  "Travel", "Meals", "Office Supplies", "Transportation", 
  "Training", "Software", "Equipment", "Communication", "Other"
];

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
} as const;

const categoryColorMap = {
  "Travel": "primary",
  "Meals": "secondary",
  "Office Supplies": "success",
  "Transportation": "warning",
  "Training": "danger",
  "Software": "primary",
  "Equipment": "secondary",
  "Communication": "success",
  "Other": "default",
} as const;

export default function ExpensesPage() {
  const { expenses, loading, error, createExpense, updateExpense, deleteExpense } = useExpenses();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const rowsPerPage = 10;
  
  // Form state for new expense
  const [newExpense, setNewExpense] = useState({
    employee_id: 1,
    category: "",
    description: "",
    amount: "",
    currency: "USD",
    expense_date: "",
    receipt_path: ""
  });

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = 
        (expense.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || expense.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenses, searchQuery, selectedStatus, selectedCategory]);
  
  // Paginate filtered expenses
  const paginatedExpenses = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = expenses.length;
    const pending = expenses.filter(e => e.status === "pending").length;
    const approved = expenses.filter(e => e.status === "approved").length;
    const rejected = expenses.filter(e => e.status === "rejected").length;
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = expenses
      .filter(e => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);
    
    return { total, pending, approved, rejected, totalAmount, pendingAmount };
  }, [expenses]);

  // Handle row actions
  const handleRowAction = (actionKey: string, expenseId: number) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    switch (actionKey) {
      case "view":
        setSelectedExpense(expense);
        onViewOpen();
        break;
      case "edit":
        setEditingExpense(expense);
        onOpen();
        break;
      case "delete":
        handleDeleteExpense(expenseId);
        break;
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        addToast({
          title: "Success",
          description: "Expense deleted successfully",
          color: "success"
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to delete expense",
          color: "danger"
        });
      }
    }
  };

  const handleSubmitExpense = async () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.expense_date) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        });
        addToast({
          title: "Success",
          description: "Expense updated successfully",
          color: "success"
        });
      } else {
        await createExpense({
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        });
        addToast({
          title: "Success",
          description: "Expense created successfully",
          color: "success"
        });
      }
      
      setNewExpense({
        employee_id: 1,
        category: "",
        description: "",
        amount: "",
        currency: "USD",
        expense_date: "",
        receipt_path: ""
      });
      setEditingExpense(null);
      onOpenChange();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save expense",
        color: "danger"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      employee_id: expense.employee_id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      expense_date: expense.expense_date,
      receipt_path: expense.receipt_path || ""
    });
    onOpen();
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-danger">
          <p>Error loading expenses: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Expenses"
          subtitle="Expense Management"
          description="Track and manage employee expenses efficiently. Submit, approve, and monitor expense claims with detailed reporting."
          icon="lucide:receipt"
          illustration="expenses"
          actions={[
            {
              label: "Add Expense",
              icon: "lucide:plus",
              onPress: () => handleOpenModal(null, false),
              variant: "solid"
            },
            {
              label: "Export Report",
              icon: "lucide:download",
              onPress: () => console.log("Export Report"),
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
            <div className="flex items-center gap-3">
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
                onPress={onOpen}
              >
                Add Expense
              </Button>
            </div>
          </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Expenses</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Icon icon="lucide:receipt" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Pending</p>
                <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <Icon icon="lucide:clock" className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Approved</p>
                <p className="text-2xl font-bold text-success-600">{stats.approved}</p>
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
                <p className="text-sm text-default-500">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Icon icon="lucide:dollar-sign" className="w-6 h-6 text-secondary-600" />
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
              placeholder="Search expenses..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" />}
              className="flex-1"
            />
            <Select
              placeholder="Status"
              
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-48"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="approved">Approved</SelectItem>
              <SelectItem key="rejected">Rejected</SelectItem>
            </Select>
            <Select
              placeholder="Category"
              
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48"
            >
              <SelectItem key="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} >{category}</SelectItem>
              )) as any}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Expenses</h3>
            <p className="text-sm text-default-500">
              Showing {paginatedExpenses.length} of {filteredExpenses.length} expenses
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Expenses table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No expenses found">
              {paginatedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        name={expense.employee_name || "Unknown"}
                        className="flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium">{expense.employee_name || "Unknown"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={categoryColorMap[expense.category as keyof typeof categoryColorMap] || "default"}
                      variant="flat"
                    >
                      {expense.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate">{expense.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(expense.expense_date)}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={statusColorMap[expense.status]}
                      variant="flat"
                    >
                      {expense.status}
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
                        aria-label="Expense actions"
                        onAction={(key) => handleRowAction(key as string, expense.id)}
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
              ))}
            </TableBody>
          </Table>

          {filteredExpenses.length > rowsPerPage && (
            <div className="flex justify-center mt-4">
              <Pagination
                total={Math.ceil(filteredExpenses.length / rowsPerPage)}
                page={page}
                onChange={setPage}
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>
        </motion.div>

      {/* Add/Edit Expense Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    placeholder="Select category"
                    
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    isRequired
                  >
                    {categories.map(category => (
                      <SelectItem key={category} >{category}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Amount"
                    placeholder="0.00"
                    type="number"
                    
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    startContent="$"
                    isRequired
                  />

                  <Input
                    label="Date"
                    type="date"
                    
                    onChange={(e) => setNewExpense({...newExpense, expense_date: e.target.value})}
                    isRequired
                  />

                  <Select
                    label="Currency"
                    
                    onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
                  >
                    <SelectItem key="USD">USD</SelectItem>
                    <SelectItem key="EUR">EUR</SelectItem>
                    <SelectItem key="GBP">GBP</SelectItem>
                  </Select>

                  <div className="md:col-span-2">
                    <Textarea
                      label="Description"
                      placeholder="Enter expense description"
                      
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      isRequired
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Receipt Path (Optional)"
                      placeholder="Path to receipt file"
                      
                      onChange={(e) => setNewExpense({...newExpense, receipt_path: e.target.value})}
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
                  onPress={handleSubmitExpense}
                  isLoading={isSubmitting}
                >
                  {editingExpense ? "Update" : "Create"} Expense
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Expense Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Expense Details</ModalHeader>
              <ModalBody>
                {selectedExpense && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Employee</p>
                        <p className="font-medium">{selectedExpense.employee_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Category</p>
                        <Chip
                          size="sm"
                          color={categoryColorMap[selectedExpense.category as keyof typeof categoryColorMap] || "default"}
                          variant="flat"
                        >
                          {selectedExpense.category}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Amount</p>
                        <p className="font-medium">
                          {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Date</p>
                        <p className="font-medium">{formatDate(selectedExpense.expense_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Status</p>
                        <Chip
                          size="sm"
                          color={statusColorMap[selectedExpense.status]}
                          variant="flat"
                        >
                          {selectedExpense.status}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Created</p>
                        <p className="font-medium">{formatDate(selectedExpense.created_at)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Description</p>
                      <p className="font-medium">{selectedExpense.description}</p>
                    </div>
                    {selectedExpense.receipt_path && (
                      <div>
                        <p className="text-sm text-default-500">Receipt</p>
                        <p className="font-medium">{selectedExpense.receipt_path}</p>
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
      </div>
    </div>
  );
}