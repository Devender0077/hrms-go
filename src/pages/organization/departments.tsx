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
      Chip,
      Input,
      Pagination,
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      useDisclosure,
      Textarea,
      Select,
      SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Divider
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

// Enhanced Department interface
interface Department {
  id: number;
  name: string;
  description: string;
  branch: string;
  branchId: number;
  employees: number;
  status: "active" | "inactive";
  manager?: string;
  managerId?: string;
  budget?: number;
  location?: string;
  phone?: string;
  email?: string;
  establishedDate: string;
  color?: string;
  icon?: string;
}
    
    // Sample departments data
const departmentsData: Department[] = [
      { 
        id: 1, 
        name: "Human Resources", 
        description: "Manages employee relations, recruitment, and HR policies",
        branch: "Headquarters",
    branchId: 1,
        employees: 12,
    status: "active",
    manager: "Emma Wilson",
    managerId: "EMP005",
    budget: 500000,
    location: "Floor 3, Building A",
    phone: "+1 (555) 123-4567",
    email: "hr@company.com",
    establishedDate: "2020-01-15",
    color: "#3B82F6",
    icon: "lucide:users"
      },
      { 
        id: 2, 
        name: "Information Technology", 
        description: "Manages company IT infrastructure and software development",
        branch: "Headquarters",
    branchId: 1,
        employees: 28,
    status: "active",
    manager: "Zoey Lang",
    managerId: "EMP002",
    budget: 1200000,
    location: "Floor 2, Building A",
    phone: "+1 (555) 234-5678",
    email: "it@company.com",
    establishedDate: "2020-02-01",
    color: "#10B981",
    icon: "lucide:monitor"
      },
      { 
        id: 3, 
        name: "Finance", 
        description: "Handles financial operations, accounting, and budgeting",
        branch: "Headquarters",
    branchId: 1,
        employees: 15,
    status: "active",
    manager: "William Smith",
    managerId: "EMP004",
    budget: 800000,
    location: "Floor 4, Building A",
    phone: "+1 (555) 345-6789",
    email: "finance@company.com",
    establishedDate: "2020-01-20",
    color: "#F59E0B",
    icon: "lucide:calculator"
      },
      { 
        id: 4, 
        name: "Marketing", 
        description: "Responsible for brand management and marketing campaigns",
        branch: "West Coast Office",
    branchId: 2,
        employees: 18,
    status: "active",
    manager: "Jane Doe",
    managerId: "EMP003",
    budget: 900000,
    location: "Floor 1, Building B",
    phone: "+1 (555) 456-7890",
    email: "marketing@company.com",
    establishedDate: "2020-03-10",
    color: "#EF4444",
    icon: "lucide:megaphone"
      },
      { 
        id: 5, 
        name: "Sales", 
        description: "Manages sales operations and client relationships",
        branch: "European Branch",
    branchId: 3,
        employees: 22,
    status: "active",
    budget: 1100000,
    location: "Floor 2, Building C",
    phone: "+1 (555) 567-8901",
    email: "sales@company.com",
    establishedDate: "2020-02-15",
    color: "#8B5CF6",
    icon: "lucide:trending-up"
      },
      { 
        id: 6, 
        name: "Research & Development", 
        description: "Focuses on product innovation and development",
        branch: "Research Center",
    branchId: 6,
        employees: 16,
    status: "inactive",
    budget: 1500000,
    location: "Floor 1, Research Building",
    phone: "+1 (555) 678-9012",
    email: "rnd@company.com",
    establishedDate: "2020-04-01",
    color: "#06B6D4",
    icon: "lucide:flask"
      },
      { 
        id: 7, 
        name: "Customer Support", 
        description: "Provides customer service and technical support",
        branch: "Asia Pacific Office",
    branchId: 4,
        employees: 24,
    status: "active",
    budget: 600000,
    location: "Floor 3, Building D",
    phone: "+1 (555) 789-0123",
    email: "support@company.com",
    establishedDate: "2020-05-15",
    color: "#84CC16",
    icon: "lucide:headphones"
      },
      { 
        id: 8, 
        name: "Operations", 
        description: "Manages day-to-day business operations",
        branch: "Headquarters",
    branchId: 1,
        employees: 30,
    status: "active",
    budget: 700000,
    location: "Floor 1, Building A",
    phone: "+1 (555) 890-1234",
    email: "operations@company.com",
    establishedDate: "2020-01-10",
    color: "#F97316",
    icon: "lucide:settings"
  }
    ];
    
    // Sample branches for dropdown
    const branches = [
      { id: 1, name: "Headquarters" },
      { id: 2, name: "West Coast Office" },
      { id: 3, name: "European Branch" },
      { id: 4, name: "Asia Pacific Office" },
      { id: 5, name: "Remote Office" },
      { id: 6, name: "Research Center" },
    ];

// Sample managers for dropdown
const managers = [
  { id: "EMP001", name: "Tony Reichert", department: "Executive" },
  { id: "EMP002", name: "Zoey Lang", department: "IT" },
  { id: "EMP003", name: "Jane Doe", department: "Marketing" },
  { id: "EMP004", name: "William Smith", department: "Finance" },
  { id: "EMP005", name: "Emma Wilson", department: "HR" },
    ];
    
    const statusColorMap = {
      active: "success",
      inactive: "danger",
    };
    
    export default function Departments() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [departmentList, setDepartmentList] = useState(departmentsData);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const rowsPerPage = 10;
  
  // Filter departments
  const filteredDepartments = useMemo(() => {
    return departmentList.filter(department => {
      const matchesSearch = 
        department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.manager?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBranch = selectedBranch === "all" || department.branch === selectedBranch;
      const matchesStatus = selectedStatus === "all" || department.status === selectedStatus;
      
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [departmentList, searchQuery, selectedBranch, selectedStatus]);
  
  // Paginate filtered departments
  const paginatedDepartments = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredDepartments.slice(startIndex, endIndex);
  }, [filteredDepartments, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = departmentList.length;
    const active = departmentList.filter(d => d.status === "active").length;
    const inactive = departmentList.filter(d => d.status === "inactive").length;
    const totalEmployees = departmentList.reduce((sum, d) => sum + d.employees, 0);
    const totalBudget = departmentList.reduce((sum, d) => sum + (d.budget || 0), 0);
    
    return { total, active, inactive, totalEmployees, totalBudget };
  }, [departmentList]);

  // Handle row actions
  const handleRowAction = (actionKey: string, departmentId: number) => {
    const department = departmentList.find(d => d.id === departmentId);
    if (!department) return;

    switch (actionKey) {
      case "view":
          setSelectedDepartment(department);
        onViewOpen();
        break;
      case "edit":
        setEditingDepartment({ ...department });
        onOpen();
        break;
      case "delete":
        handleDeleteDepartment(departmentId);
        break;
      default:
        break;
    }
  };

  // Handle add department
  const handleAddDepartment = () => {
    const newDepartment: Department = {
      id: Math.max(...departmentList.map(d => d.id)) + 1,
            name: "",
            description: "",
            branch: "",
      branchId: 1,
      employees: 0,
      status: "active",
      budget: 0,
      location: "",
      phone: "",
      email: "",
      establishedDate: new Date().toISOString().split('T')[0],
      color: "#3B82F6",
      icon: "lucide:building"
    };
    setEditingDepartment(newDepartment);
        onOpen();
      };
      
  // Handle save department
  const handleSaveDepartment = () => {
    if (!editingDepartment) return;

    if (!editingDepartment.name || !editingDepartment.description || !editingDepartment.branch) {
          addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
          });
          return;
        }
        
    const isNewDepartment = !departmentList.find(d => d.id === editingDepartment.id);
    
    if (isNewDepartment) {
      setDepartmentList(prev => [...prev, editingDepartment]);
          addToast({
        title: "Department Added",
        description: `${editingDepartment.name} has been added successfully.`,
            color: "success",
          });
        } else {
      setDepartmentList(prev => 
        prev.map(d => d.id === editingDepartment.id ? editingDepartment : d)
      );
          addToast({
        title: "Department Updated",
        description: `${editingDepartment.name} has been updated successfully.`,
            color: "success",
          });
        }
        
    setEditingDepartment(null);
    onOpenChange();
  };

  // Handle delete department
  const handleDeleteDepartment = (departmentId: number) => {
    const department = departmentList.find(d => d.id === departmentId);
    if (!department) return;

    setDepartmentList(prev => prev.filter(d => d.id !== departmentId));
    addToast({
      title: "Department Deleted",
      description: `${department.name} has been removed from the system.`,
      color: "success",
    });
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredDepartments);
      downloadFile(csvContent, `departments-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Department data has been exported to CSV.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export department data.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import from CSV
  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const importedDepartments = parseCSV(csvContent);
        
        // Generate new IDs for imported departments
        const newDepartments = importedDepartments.map((dept, index) => ({
          ...dept,
          id: Math.max(...departmentList.map(d => d.id)) + index + 1
        }));
        
        setDepartmentList(prev => [...prev, ...newDepartments]);
        addToast({
          title: "Import Successful",
          description: `${newDepartments.length} departments have been imported successfully.`,
          color: "success",
        });
      } catch (error) {
        addToast({
          title: "Import Failed",
          description: "Failed to parse CSV file. Please check the format.",
          color: "danger",
        });
      }
    };
    reader.readAsText(file);
  };

  // Generate CSV content
  const generateCSV = (departments: Department[]) => {
    const headers = [
      'ID', 'Name', 'Description', 'Branch', 'Employees', 'Status', 'Manager', 
      'Budget', 'Location', 'Phone', 'Email', 'Established Date'
    ];
    
    const rows = departments.map(department => [
      department.id,
      department.name,
      department.description,
      department.branch,
      department.employees,
      department.status,
      department.manager || '',
      department.budget || 0,
      department.location || '',
      department.phone || '',
      department.email || '',
      department.establishedDate
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Parse CSV content
  const parseCSV = (csvContent: string): Department[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const departments: Department[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const department: Department = {
          id: parseInt(values[0]) || 0,
          name: values[1] || '',
          description: values[2] || '',
          branch: values[3] || '',
          branchId: branches.find(b => b.name === values[3])?.id || 1,
          employees: parseInt(values[4]) || 0,
          status: (values[5] as Department['status']) || 'active',
          manager: values[6] || '',
          budget: parseFloat(values[7]) || 0,
          location: values[8] || '',
          phone: values[9] || '',
          email: values[10] || '',
          establishedDate: values[11] || new Date().toISOString().split('T')[0],
          color: "#3B82F6",
          icon: "lucide:building"
        };
        departments.push(department);
      }
    }
    
    return departments;
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
      
      return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Icon icon="lucide:building" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
              <p className="text-gray-600 mt-1">Manage company departments and teams</p>
            </div>
          </div>
          <div className="flex gap-3">
              <Button 
                color="primary" 
              variant="flat"
                startContent={<Icon icon="lucide:plus" />} 
              onPress={handleAddDepartment}
              className="font-medium"
              >
                Add Department
              </Button>
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:upload" />}
              onPress={handleImportCSV}
              className="font-medium"
            >
              Import
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
                    <Icon icon="lucide:layout-grid" className="text-2xl text-primary" />
                  </div>
                  <div>
                    <p className="text-default-500">Total Departments</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <Icon icon="lucide:users" className="text-2xl text-success" />
                  </div>
                  <div>
                    <p className="text-default-500">Total Employees</p>
                  <h3 className="text-2xl font-bold">{stats.totalEmployees}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Icon icon="lucide:building" className="text-2xl text-warning" />
                  </div>
                  <div>
                    <p className="text-default-500">Branches</p>
                  <h3 className="text-2xl font-bold">{branches.length}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-danger/10">
                    <Icon icon="lucide:alert-circle" className="text-2xl text-danger" />
                  </div>
                  <div>
                  <p className="text-default-500">Inactive</p>
                  <h3 className="text-2xl font-bold">{stats.inactive}</h3>
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
                  <p className="text-default-500">Total Budget</p>
                  <h3 className="text-lg font-bold">${(stats.totalBudget / 1000000).toFixed(1)}M</h3>
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
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Branch"
                placeholder="All Branches"
                selectedKeys={[selectedBranch]}
                onSelectionChange={(keys) => setSelectedBranch(Array.from(keys)[0] as string)}
                items={branches.map(branch => ({ key: branch.name, label: branch.name }))}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                label="Status"
                placeholder="All Status"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                items={[
                  { key: "all", label: "All Status" },
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" }
                ]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredDepartments.length} of {departmentList.length} departments
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Departments Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-blue-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Department Directory</h3>
                <p className="text-gray-500 text-sm">Click on actions to view, edit, or manage departments</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Departments table">
                <TableHeader>
                  <TableColumn>DEPARTMENT</TableColumn>
                  <TableColumn>BRANCH</TableColumn>
                  <TableColumn>EMPLOYEES</TableColumn>
                <TableColumn>MANAGER</TableColumn>
                <TableColumn>BUDGET</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
              <TableBody>
                {paginatedDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: department.color + '20' }}
                        >
                          <Icon 
                            icon={department.icon || "lucide:building"} 
                            className="w-5 h-5"
                            style={{ color: department.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{department.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{department.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{department.branch}</p>
                      </TableCell>
                      <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{department.employees}</span>
                        </div>
                        <span className="text-sm text-gray-600">employees</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{department.manager || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        {department.budget ? `$${(department.budget / 1000).toFixed(0)}K` : 'N/A'}
                      </p>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                        color={statusColorMap[department.status] as any}
                          variant="flat"
                        >
                          {department.status}
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
                            onPress={() => handleRowAction("view", department.id)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleRowAction("edit", department.id)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" />}
                            onPress={() => handleRowAction("delete", department.id)}
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
            
            {filteredDepartments.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredDepartments.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
            </CardBody>
          </Card>
          
        {/* View Department Modal */}
        <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:eye" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Department Details</h3>
                      <p className="text-sm text-gray-500">Complete department information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedDepartment && (
                    <div className="space-y-6">
                      {/* Department Header */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div 
                          className="w-16 h-16 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: selectedDepartment.color + '20' }}
                        >
                          <Icon 
                            icon={selectedDepartment.icon || "lucide:building"} 
                            className="w-8 h-8"
                            style={{ color: selectedDepartment.color }}
                          />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{selectedDepartment.name}</h4>
                          <p className="text-gray-600">{selectedDepartment.branch}</p>
                          <Chip
                            size="sm"
                            color={statusColorMap[selectedDepartment.status] as any}
                            variant="flat"
                            className="mt-1"
                          >
                            {selectedDepartment.status}
                          </Chip>
                        </div>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Description</span>
                            <p className="font-medium">{selectedDepartment.description}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Manager</span>
                            <p className="font-medium">{selectedDepartment.manager || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Established Date</span>
                            <p className="font-medium">{new Date(selectedDepartment.establishedDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Location</span>
                            <p className="font-medium">{selectedDepartment.location || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Total Employees</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-blue-600">{selectedDepartment.employees}</span>
                              </div>
                              <span className="text-sm text-gray-600">employees</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Budget</span>
                            <p className="font-medium">
                              {selectedDepartment.budget ? `$${selectedDepartment.budget.toLocaleString()}` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Phone</span>
                            <p className="font-medium">{selectedDepartment.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Email</span>
                            <p className="font-medium">{selectedDepartment.email || 'N/A'}</p>
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

        {/* Edit Department Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:edit" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {editingDepartment?.id && departmentList.find(d => d.id === editingDepartment.id) ? 'Edit Department' : 'Add Department'}
                      </h3>
                      <p className="text-sm text-gray-500">Update department information</p>
                    </div>
                  </div>
                  </ModalHeader>
                  <ModalBody>
                  {editingDepartment && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Department Name"
                        placeholder="Enter department name"
                          value={editingDepartment.name}
                          onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})}
                        isRequired
                        />
                        <Select
                          label="Branch"
                          placeholder="Select branch"
                          selectedKeys={[editingDepartment.branch]}
                          onSelectionChange={(keys) => {
                            const branchName = Array.from(keys)[0] as string;
                            const branch = branches.find(b => b.name === branchName);
                            setEditingDepartment({
                              ...editingDepartment, 
                              branch: branchName,
                              branchId: branch?.id || 1
                            });
                          }}
                          isRequired
                          items={branches.map(branch => ({ key: branch.name, label: branch.name }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                      </div>

                      <Textarea
                        label="Description"
                        placeholder="Enter department description"
                        value={editingDepartment.description}
                        onChange={(e) => setEditingDepartment({...editingDepartment, description: e.target.value})}
                        isRequired
                        minRows={3}
                      />

                      {/* Additional Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Manager"
                          placeholder="Enter manager name"
                          value={editingDepartment.manager || ''}
                          onChange={(e) => setEditingDepartment({...editingDepartment, manager: e.target.value})}
                        />
                        <Input
                          label="Budget"
                          type="number"
                          placeholder="Enter budget amount"
                          value={editingDepartment.budget?.toString() || ''}
                          onChange={(e) => setEditingDepartment({...editingDepartment, budget: parseFloat(e.target.value) || 0})}
                        />
                        <Input
                          label="Location"
                          placeholder="Enter location"
                          value={editingDepartment.location || ''}
                          onChange={(e) => setEditingDepartment({...editingDepartment, location: e.target.value})}
                        />
                        <Input
                          label="Phone"
                          placeholder="Enter phone number"
                          value={editingDepartment.phone || ''}
                          onChange={(e) => setEditingDepartment({...editingDepartment, phone: e.target.value})}
                        />
                        <Input
                          label="Email"
                          type="email"
                          placeholder="Enter email address"
                          value={editingDepartment.email || ''}
                          onChange={(e) => setEditingDepartment({...editingDepartment, email: e.target.value})}
                        />
                        <Input
                          label="Established Date"
                          type="date"
                          value={editingDepartment.establishedDate}
                          onChange={(e) => setEditingDepartment({...editingDepartment, establishedDate: e.target.value})}
                        />
                      </div>

                      {/* Status and Styling */}
                      <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Status"
                          selectedKeys={[editingDepartment.status]}
                          onSelectionChange={(keys) => setEditingDepartment({...editingDepartment, status: Array.from(keys)[0] as Department['status']})}
                          items={[
                            { key: "active", label: "Active" },
                            { key: "inactive", label: "Inactive" }
                          ]}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                      </Select>
                        <Input
                          label="Color (Hex)"
                          placeholder="#3B82F6"
                          value={editingDepartment.color || '#3B82F6'}
                          onChange={(e) => setEditingDepartment({...editingDepartment, color: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                  </ModalBody>
                  <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                    </Button>
                  <Button color="primary" onPress={handleSaveDepartment}>
                    {editingDepartment?.id && departmentList.find(d => d.id === editingDepartment.id) ? 'Update Department' : 'Add Department'}
                      </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>

        {/* Hidden file input for CSV import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
      );
    }