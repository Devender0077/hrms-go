import React, { useState, useMemo, useRef } from "react";
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
  DatePicker,
  FileUpload
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

// Enhanced Expense interface
interface Expense {
  id: number;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  receipt?: string;
  approvedBy?: string;
  approvedDate?: string;
  avatar: string;
  department: string;
  project?: string;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
  submittedDate: string;
  lastModified: string;
}

// Sample expense data
const expenses: Expense[] = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Tony Reichert",
    category: "Travel",
    description: "Business trip to client meeting",
    amount: 450.00,
    currency: "USD",
    date: "2025-01-15",
    status: "approved",
    approvedBy: "Finance Manager",
    approvedDate: "2025-01-16",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    department: "Executive",
    project: "Client Acquisition",
    vendor: "Delta Airlines",
    paymentMethod: "Corporate Card",
    notes: "Round trip to New York for client presentation",
    submittedDate: "2025-01-15",
    lastModified: "2025-01-16"
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Zoey Lang",
    category: "Meals",
    description: "Client dinner meeting",
    amount: 125.50,
    currency: "USD",
    date: "2025-01-14",
    status: "pending",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    department: "IT",
    project: "System Integration",
    vendor: "Restaurant XYZ",
    paymentMethod: "Personal Card",
    notes: "Business dinner with potential client",
    submittedDate: "2025-01-14",
    lastModified: "2025-01-14"
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Jane Doe",
    category: "Office Supplies",
    description: "Stationery and office materials",
    amount: 85.75,
    currency: "USD",
    date: "2025-01-13",
    status: "rejected",
    approvedBy: "Finance Manager",
    approvedDate: "2025-01-14",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    department: "Marketing",
    project: "Q1 Campaign",
    vendor: "Office Depot",
    paymentMethod: "Corporate Card",
    notes: "Rejected due to budget constraints",
    submittedDate: "2025-01-13",
    lastModified: "2025-01-14"
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "William Smith",
    category: "Transportation",
    description: "Taxi fare for client visits",
    amount: 65.00,
    currency: "USD",
    date: "2025-01-12",
    status: "approved",
    approvedBy: "HR Manager",
    approvedDate: "2025-01-13",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
    department: "HR",
    project: "Recruitment Drive",
    vendor: "Uber",
    paymentMethod: "Personal Card",
    notes: "Multiple client site visits",
    submittedDate: "2025-01-12",
    lastModified: "2025-01-13"
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "Emma Wilson",
    category: "Training",
    description: "Professional development course",
    amount: 299.99,
    currency: "USD",
    date: "2025-01-11",
    status: "pending",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
    department: "Finance",
    project: "Skill Development",
    vendor: "Coursera",
    paymentMethod: "Corporate Card",
    notes: "Advanced Excel and Financial Modeling course",
    submittedDate: "2025-01-11",
    lastModified: "2025-01-11"
  }
];

const categories = [
  "Travel", "Meals", "Office Supplies", "Transportation", 
  "Training", "Software", "Equipment", "Communication", "Other"
];

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

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
};

export default function Expenses() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expenseList, setExpenseList] = useState(expenses);
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const rowsPerPage = 10;
  
  // Form state for new expense
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
    project: "",
    vendor: "",
    paymentMethod: "",
    notes: "",
    receipt: null as File | null
  });

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenseList.filter(expense => {
      const matchesSearch = 
        expense.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || expense.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenseList, searchQuery, selectedStatus, selectedCategory]);
  
  // Paginate filtered expenses
  const paginatedExpenses = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = expenseList.length;
    const pending = expenseList.filter(e => e.status === "pending").length;
    const approved = expenseList.filter(e => e.status === "approved").length;
    const rejected = expenseList.filter(e => e.status === "rejected").length;
    const totalAmount = expenseList.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = expenseList
      .filter(e => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);
    
    return { total, pending, approved, rejected, totalAmount, pendingAmount };
  }, [expenseList]);

  // Handle row actions
  const handleRowAction = (actionKey: string, expenseId: number) => {
    const expense = expenseList.find(e => e.id === expenseId);
    if (!expense) return;

    switch (actionKey) {
      case "view":
        setSelectedExpense(expense);
        onViewOpen();
        break;
      case "edit":
        setEditingExpense({ ...expense });
        onOpen();
        break;
      case "approve":
        handleApproveExpense(expenseId);
        break;
      case "reject":
        handleRejectExpense(expenseId);
        break;
      case "delete":
        handleDeleteExpense(expenseId);
        break;
      default:
        break;
    }
  };

  // Handle submit new expense
  const handleSubmitExpense = async () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.date) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const expense: Expense = {
        id: Math.max(...expenseList.map(e => e.id)) + 1,
        employeeId: "EMP001", // Current user
        employeeName: "Tony Reichert", // Current user
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        currency: "USD",
        date: newExpense.date,
        status: "pending",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
        department: "Executive",
        project: newExpense.project,
        vendor: newExpense.vendor,
        paymentMethod: newExpense.paymentMethod,
        notes: newExpense.notes,
        submittedDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };

      setExpenseList(prev => [expense, ...prev]);
      
      // Reset form
      setNewExpense({
        category: "",
        description: "",
        amount: "",
        date: "",
        project: "",
        vendor: "",
        paymentMethod: "",
        notes: "",
        receipt: null
      });
      
      addToast({
        title: "Expense Submitted",
        description: "Your expense has been submitted for approval.",
        color: "success",
      });
      
      onOpenChange();
    } catch (error) {
      addToast({
        title: "Submission Failed",
        description: "Failed to submit expense. Please try again.",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve expense
  const handleApproveExpense = (expenseId: number) => {
    const expense = expenseList.find(e => e.id === expenseId);
    if (!expense) return;

    setExpenseList(prev => 
      prev.map(e => 
        e.id === expenseId 
          ? { 
              ...e, 
              status: "approved" as const,
              approvedBy: "Current User",
              approvedDate: new Date().toISOString().split('T')[0],
              lastModified: new Date().toISOString().split('T')[0]
            }
          : e
      )
    );
    
    addToast({
      title: "Expense Approved",
      description: `${expense.employeeName}'s expense has been approved.`,
      color: "success",
    });
  };

  // Handle reject expense
  const handleRejectExpense = (expenseId: number) => {
    const expense = expenseList.find(e => e.id === expenseId);
    if (!expense) return;

    setExpenseList(prev => 
      prev.map(e => 
        e.id === expenseId 
          ? { 
              ...e, 
              status: "rejected" as const,
              approvedBy: "Current User",
              approvedDate: new Date().toISOString().split('T')[0],
              lastModified: new Date().toISOString().split('T')[0]
            }
          : e
      )
    );
    
    addToast({
      title: "Expense Rejected",
      description: `${expense.employeeName}'s expense has been rejected.`,
      color: "warning",
    });
  };

  // Handle delete expense
  const handleDeleteExpense = (expenseId: number) => {
    const expense = expenseList.find(e => e.id === expenseId);
    if (!expense) return;

    setExpenseList(prev => prev.filter(e => e.id !== expenseId));
    addToast({
      title: "Expense Deleted",
      description: "Expense has been removed from the system.",
      color: "success",
    });
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredExpenses);
      downloadFile(csvContent, `expenses-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Expense data has been exported to CSV.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export expense data.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate CSV content
  const generateCSV = (expenses: Expense[]) => {
    const headers = [
      'ID', 'Employee', 'Department', 'Category', 'Description', 'Amount', 'Currency', 
      'Date', 'Status', 'Project', 'Vendor', 'Payment Method', 'Submitted Date', 'Approved By', 'Approved Date'
    ];
    
    const rows = expenses.map(expense => [
      expense.id,
      expense.employeeName,
      expense.department,
      expense.category,
      expense.description,
      expense.amount,
      expense.currency,
      expense.date,
      expense.status,
      expense.project || '',
      expense.vendor || '',
      expense.paymentMethod || '',
      expense.submittedDate,
      expense.approvedBy || '',
      expense.approvedDate || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Download file utility
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewExpense(prev => ({ ...prev, receipt: file }));
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <Icon icon="lucide:receipt" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
              <p className="text-gray-600 mt-1">Track and manage employee expenses</p>
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
              Submit Expense
            </Button>
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              isLoading={isExporting}
              className="font-medium"
            >
              Export
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon icon="lucide:receipt" className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-default-500">Total Expenses</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Icon icon="lucide:clock" className="text-2xl text-warning" />
                </div>
                <div>
                  <p className="text-default-500">Pending</p>
                  <h3 className="text-2xl font-bold">{stats.pending}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Icon icon="lucide:check-circle" className="text-2xl text-success" />
                </div>
                <div>
                  <p className="text-default-500">Approved</p>
                  <h3 className="text-2xl font-bold">{stats.approved}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-danger/10">
                  <Icon icon="lucide:x-circle" className="text-2xl text-danger" />
                </div>
                <div>
                  <p className="text-default-500">Rejected</p>
                  <h3 className="text-2xl font-bold">{stats.rejected}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <Icon icon="lucide:dollar-sign" className="text-2xl text-green-600" />
                </div>
                <div>
                  <p className="text-default-500">Total Amount</p>
                  <h3 className="text-lg font-bold">${stats.totalAmount.toFixed(2)}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Status"
                placeholder="All Status"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                items={[
                  { key: "all", label: "All Status" },
                  { key: "pending", label: "Pending" },
                  { key: "approved", label: "Approved" },
                  { key: "rejected", label: "Rejected" }
                ]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                label="Category"
                placeholder="All Categories"
                selectedKeys={[selectedCategory]}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
                items={categories.map(cat => ({ key: cat, label: cat }))}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredExpenses.length} of {expenseList.length} expenses
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Expenses Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-orange-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Expense Directory</h3>
                <p className="text-gray-500 text-sm">Click on actions to view, edit, or manage expenses</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
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
              <TableBody>
                {paginatedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar src={expense.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{expense.employeeName}</p>
                          <p className="text-sm text-gray-500">{expense.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={categoryColorMap[expense.category as keyof typeof categoryColorMap] as any}
                        variant="flat"
                      >
                        {expense.category}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900 line-clamp-1">{expense.description}</p>
                      {expense.project && (
                        <p className="text-sm text-gray-500">Project: {expense.project}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        ${expense.amount.toFixed(2)} {expense.currency}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[expense.status] as any}
                        variant="flat"
                      >
                        {expense.status}
                      </Chip>
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
                            onPress={() => handleRowAction("view", expense.id)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleRowAction("edit", expense.id)}
                          >
                            Edit
                          </DropdownItem>
                          {expense.status === "pending" && (
                            <>
                              <DropdownItem
                                key="approve"
                                className="text-success"
                                color="success"
                                startContent={<Icon icon="lucide:check" />}
                                onPress={() => handleRowAction("approve", expense.id)}
                              >
                                Approve
                              </DropdownItem>
                              <DropdownItem
                                key="reject"
                                className="text-danger"
                                color="danger"
                                startContent={<Icon icon="lucide:x" />}
                                onPress={() => handleRowAction("reject", expense.id)}
                              >
                                Reject
                              </DropdownItem>
                            </>
                          )}
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" />}
                            onPress={() => handleRowAction("delete", expense.id)}
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

        {/* Submit Expense Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:plus" className="text-orange-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Submit New Expense</h3>
                      <p className="text-sm text-gray-500">Fill in the expense details below</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Category"
                        placeholder="Select category"
                        selectedKeys={newExpense.category ? [newExpense.category] : []}
                        onSelectionChange={(keys) => setNewExpense({...newExpense, category: Array.from(keys)[0] as string})}
                        isRequired
                        items={categories.map(cat => ({ key: cat, label: cat }))}
                      >
                        {(item) => (
                          <SelectItem key={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                      <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        startContent="$"
                        isRequired
                      />
                    </div>
                    
                    <Textarea
                      label="Description"
                      placeholder="Describe the expense"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      isRequired
                      minRows={3}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                        isRequired
                      />
                      <Input
                        label="Project"
                        placeholder="Project name (optional)"
                        value={newExpense.project}
                        onChange={(e) => setNewExpense({...newExpense, project: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Vendor"
                        placeholder="Vendor name (optional)"
                        value={newExpense.vendor}
                        onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                      />
                      <Input
                        label="Payment Method"
                        placeholder="Payment method (optional)"
                        value={newExpense.paymentMethod}
                        onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                      />
                    </div>
                    
                    <Textarea
                      label="Notes"
                      placeholder="Additional notes (optional)"
                      value={newExpense.notes}
                      onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                      minRows={2}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt (Optional)
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                      {newExpense.receipt && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {newExpense.receipt.name} selected
                        </p>
                      )}
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={handleSubmitExpense}
                    isLoading={isSubmitting}
                  >
                    Submit Expense
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
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:eye" className="text-orange-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Expense Details</h3>
                      <p className="text-sm text-gray-500">Complete expense information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedExpense && (
                    <div className="space-y-6">
                      {/* Expense Header */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar src={selectedExpense.avatar} size="lg" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{selectedExpense.employeeName}</h4>
                          <p className="text-gray-600">{selectedExpense.department}</p>
                          <Chip
                            size="sm"
                            color={statusColorMap[selectedExpense.status] as any}
                            variant="flat"
                            className="mt-1"
                          >
                            {selectedExpense.status}
                          </Chip>
                        </div>
                      </div>

                      {/* Expense Details */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Category</span>
                            <Chip
                              size="sm"
                              color={categoryColorMap[selectedExpense.category as keyof typeof categoryColorMap] as any}
                              variant="flat"
                              className="ml-2"
                            >
                              {selectedExpense.category}
                            </Chip>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Description</span>
                            <p className="font-medium">{selectedExpense.description}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Amount</span>
                            <p className="font-medium text-lg">
                              ${selectedExpense.amount.toFixed(2)} {selectedExpense.currency}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Date</span>
                            <p className="font-medium">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {selectedExpense.project && (
                            <div>
                              <span className="text-gray-500 text-sm">Project</span>
                              <p className="font-medium">{selectedExpense.project}</p>
                            </div>
                          )}
                          {selectedExpense.vendor && (
                            <div>
                              <span className="text-gray-500 text-sm">Vendor</span>
                              <p className="font-medium">{selectedExpense.vendor}</p>
                            </div>
                          )}
                          {selectedExpense.paymentMethod && (
                            <div>
                              <span className="text-gray-500 text-sm">Payment Method</span>
                              <p className="font-medium">{selectedExpense.paymentMethod}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500 text-sm">Submitted Date</span>
                            <p className="font-medium">{new Date(selectedExpense.submittedDate).toLocaleDateString()}</p>
                          </div>
                          {selectedExpense.approvedBy && (
                            <div>
                              <span className="text-gray-500 text-sm">Approved By</span>
                              <p className="font-medium">{selectedExpense.approvedBy}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedExpense.notes && (
                        <div>
                          <span className="text-gray-500 text-sm">Notes</span>
                          <p className="font-medium mt-1">{selectedExpense.notes}</p>
                        </div>
                      )}
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
      </div>
    </div>
  );
}