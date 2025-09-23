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
  Textarea,
  DatePicker,
  Divider,
  FileUpload
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
    
// Enhanced Employee interface
    interface Employee {
  id: string;
  name: string;
      email: string;
      phone: string;
  department: string;
  designation: string;
  joinDate: string;
  status: "active" | "inactive" | "leave" | "terminated";
  avatar: string;
  salary?: number;
  manager?: string;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  notes?: string;
    }
    
    // Sample employee data
const employees: Employee[] = [
      { 
        id: "EMP001", 
        name: "Tony Reichert", 
        email: "tony.reichert@example.com",
    phone: "+1 (555) 123-4567",
        department: "Executive", 
        designation: "CEO", 
    joinDate: "2020-01-15",
        status: "active",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    salary: 150000,
    manager: "Board of Directors",
    address: "123 Executive Ave, New York, NY 10001",
    emergencyContact: "+1 (555) 987-6543",
    skills: ["Leadership", "Strategy", "Management"],
    notes: "Founder and CEO of the company"
      },
      { 
        id: "EMP002", 
        name: "Zoey Lang", 
        email: "zoey.lang@example.com",
    phone: "+1 (555) 234-5678",
        department: "IT", 
        designation: "Tech Lead", 
    joinDate: "2020-03-20",
        status: "active",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    salary: 120000,
    manager: "Tony Reichert",
    address: "456 Tech Street, San Francisco, CA 94105",
    emergencyContact: "+1 (555) 876-5432",
    skills: ["JavaScript", "React", "Node.js", "Leadership"],
    notes: "Lead developer with 8+ years experience"
      },
      { 
        id: "EMP003", 
        name: "Jane Doe", 
        email: "jane.doe@example.com",
    phone: "+1 (555) 345-6789",
        department: "Marketing", 
        designation: "Designer", 
    joinDate: "2021-06-10",
    status: "active",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    salary: 75000,
    manager: "Marketing Director",
    address: "789 Design Blvd, Los Angeles, CA 90210",
    emergencyContact: "+1 (555) 765-4321",
    skills: ["UI/UX Design", "Photoshop", "Figma", "Branding"],
    notes: "Creative designer with strong visual skills"
      },
      { 
        id: "EMP004", 
        name: "William Smith", 
        email: "william.smith@example.com",
    phone: "+1 (555) 456-7890",
    department: "Finance", 
    designation: "Accountant", 
    joinDate: "2021-08-15",
        status: "active",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
    salary: 65000,
    manager: "CFO",
    address: "321 Finance Lane, Chicago, IL 60601",
    emergencyContact: "+1 (555) 654-3210",
    skills: ["Accounting", "QuickBooks", "Tax Preparation", "Financial Analysis"],
    notes: "Certified public accountant with 5 years experience"
      },
      { 
        id: "EMP005", 
        name: "Emma Wilson", 
        email: "emma.wilson@example.com",
    phone: "+1 (555) 567-8901",
    department: "HR", 
    designation: "HR Manager", 
    joinDate: "2021-09-01",
        status: "active",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
    salary: 80000,
    manager: "Tony Reichert",
    address: "654 HR Avenue, Boston, MA 02101",
    emergencyContact: "+1 (555) 543-2109",
    skills: ["Recruitment", "Employee Relations", "HR Policies", "Training"],
    notes: "Experienced HR professional with strong people skills"
      },
      { 
        id: "EMP006", 
        name: "Michael Brown", 
        email: "michael.brown@example.com",
    phone: "+1 (555) 678-9012",
        department: "Operations", 
        designation: "Operations Manager", 
        joinDate: "2021-07-18",
        status: "leave",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=6",
    salary: 85000,
    manager: "COO",
    address: "987 Operations Drive, Seattle, WA 98101",
    emergencyContact: "+1 (555) 432-1098",
    skills: ["Operations Management", "Process Improvement", "Team Leadership"],
    notes: "Currently on maternity leave"
  }
    ];
    
    const statusColorMap = {
      active: "success",
  inactive: "default",
      leave: "warning",
  terminated: "danger",
};

const departments = [
  "Executive", "IT", "Marketing", "Finance", "HR", "Operations", "Sales", "Customer Service"
];

const designations = [
  "CEO", "CTO", "CFO", "COO", "Tech Lead", "Developer", "Designer", "Accountant", 
  "HR Manager", "Operations Manager", "Sales Manager", "Customer Service Rep"
];
    
    export default function Employees() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [employeeList, setEmployeeList] = useState(employees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const rowsPerPage = 10;
  
  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employeeList.filter(employee => {
          const matchesSearch = 
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
      const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
          
          return matchesSearch && matchesDepartment && matchesStatus;
        });
  }, [employeeList, searchQuery, selectedDepartment, selectedStatus]);
  
  // Paginate filtered employees
  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = employeeList.length;
    const active = employeeList.filter(emp => emp.status === "active").length;
    const onLeave = employeeList.filter(emp => emp.status === "leave").length;
    const inactive = employeeList.filter(emp => emp.status === "inactive").length;
    
    return { total, active, onLeave, inactive };
  }, [employeeList]);
      
      // Handle row actions
  const handleRowAction = (actionKey: string, employeeId: string) => {
    const employee = employeeList.find(emp => emp.id === employeeId);
    if (!employee) return;

    switch (actionKey) {
          case "view":
        setSelectedEmployee(employee);
        onViewOpen();
            break;
          case "edit":
        setEditingEmployee({ ...employee });
        onEditOpen();
            break;
          case "delete":
        handleDeleteEmployee(employeeId);
            break;
          default:
            break;
        }
      };
      
  // Handle add employee
  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: `EMP${String(employeeList.length + 1).padStart(3, '0')}`,
      name: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      joinDate: new Date().toISOString().split('T')[0],
      status: "active",
      avatar: `https://img.heroui.chat/image/avatar?w=150&h=150&u=${employeeList.length + 1}`,
      salary: 0,
      manager: "",
      address: "",
      emergencyContact: "",
      skills: [],
      notes: ""
    };
    setEditingEmployee(newEmployee);
    onEditOpen();
  };

  // Handle save employee
  const handleSaveEmployee = () => {
    if (!editingEmployee) return;

    if (!editingEmployee.name || !editingEmployee.email || !editingEmployee.department || !editingEmployee.designation) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const isNewEmployee = !employeeList.find(emp => emp.id === editingEmployee.id);
    
    if (isNewEmployee) {
      setEmployeeList(prev => [...prev, editingEmployee]);
      addToast({
        title: "Employee Added",
        description: `${editingEmployee.name} has been added successfully.`,
        color: "success",
      });
    } else {
      setEmployeeList(prev => 
        prev.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp)
      );
      addToast({
        title: "Employee Updated",
        description: `${editingEmployee.name}'s information has been updated.`,
        color: "success",
      });
    }
    
    setEditingEmployee(null);
    onEditOpenChange();
  };

  // Handle delete employee
  const handleDeleteEmployee = (employeeId: string) => {
    const employee = employeeList.find(emp => emp.id === employeeId);
    if (!employee) return;

    setEmployeeList(prev => prev.filter(emp => emp.id !== employeeId));
    addToast({
      title: "Employee Deleted",
      description: `${employee.name} has been removed from the system.`,
      color: "success",
    });
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredEmployees);
      downloadFile(csvContent, `employees-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Employee data has been exported to CSV.",
        color: "success",
      });
        } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export employee data.",
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

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const importedEmployees = parseCSV(csvContent);
        
        // Generate new IDs for imported employees
        const newEmployees = importedEmployees.map((emp, index) => ({
          ...emp,
          id: `EMP${String(employeeList.length + index + 1).padStart(3, '0')}`,
          avatar: `https://img.heroui.chat/image/avatar?w=150&h=150&u=${employeeList.length + index + 1}`
        }));
        
        setEmployeeList(prev => [...prev, ...newEmployees]);
        addToast({
          title: "Import Successful",
          description: `${newEmployees.length} employees have been imported successfully.`,
          color: "success",
        });
      } catch (error) {
        addToast({
          title: "Import Failed",
          description: "Failed to parse CSV file. Please check the format.",
          color: "danger",
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Generate CSV content
  const generateCSV = (employees: Employee[]) => {
    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Join Date', 
      'Status', 'Salary', 'Manager', 'Address', 'Emergency Contact', 'Skills', 'Notes'
    ];
    
    const rows = employees.map(employee => [
      employee.id,
      employee.name,
      employee.email,
      employee.phone || '',
      employee.department,
      employee.designation,
      employee.joinDate,
      employee.status,
      employee.salary || 0,
      employee.manager || '',
      employee.address || '',
      employee.emergencyContact || '',
      employee.skills?.join(';') || '',
      employee.notes || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Parse CSV content
  const parseCSV = (csvContent: string): Employee[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const employees: Employee[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const employee: Employee = {
          id: values[0] || '',
          name: values[1] || '',
          email: values[2] || '',
          phone: values[3] || '',
          department: values[4] || '',
          designation: values[5] || '',
          joinDate: values[6] || new Date().toISOString().split('T')[0],
          status: (values[7] as Employee['status']) || 'active',
          avatar: '',
          salary: parseFloat(values[8]) || 0,
          manager: values[9] || '',
          address: values[10] || '',
          emergencyContact: values[11] || '',
          skills: values[12] ? values[12].split(';') : [],
          notes: values[13] || ''
        };
        employees.push(employee);
      }
    }
    
    return employees;
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
              <Icon icon="lucide:users" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
              <p className="text-gray-600 mt-1">Manage your team members</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />} 
              onPress={handleAddEmployee}
              className="font-medium"
            >
                Add Employee
              </Button>
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:upload" />}
              onPress={handleImportCSV}
              isLoading={isImporting}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon icon="lucide:users" className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-default-500">Total Employees</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Icon icon="lucide:user-check" className="text-2xl text-success" />
                </div>
                <div>
                  <p className="text-default-500">Active</p>
                  <h3 className="text-2xl font-bold">{stats.active}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Icon icon="lucide:calendar-off" className="text-2xl text-warning" />
                </div>
                <div>
                  <p className="text-default-500">On Leave</p>
                  <h3 className="text-2xl font-bold">{stats.onLeave}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-default/10">
                  <Icon icon="lucide:user-x" className="text-2xl text-default" />
                </div>
                <div>
                  <p className="text-default-500">Inactive</p>
                  <h3 className="text-2xl font-bold">{stats.inactive}</h3>
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
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Department"
                placeholder="All Departments"
                selectedKeys={[selectedDepartment]}
                onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
                items={departments.map(dept => ({ key: dept, label: dept }))}
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
                  { key: "inactive", label: "Inactive" },
                  { key: "leave", label: "On Leave" },
                  { key: "terminated", label: "Terminated" }
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
                  Showing {filteredEmployees.length} of {employeeList.length} employees
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Employees Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-blue-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Employee Directory</h3>
                <p className="text-gray-500 text-sm">Click on actions to view, edit, or manage employees</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Employees table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>DESIGNATION</TableColumn>
                <TableColumn>JOIN DATE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SALARY</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar src={employee.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                          <p className="text-xs text-gray-400">{employee.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{employee.department}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{employee.designation}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[employee.status] as any}
                        variant="flat"
                      >
                        {employee.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                      </p>
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
                            onPress={() => handleRowAction("view", employee.id)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleRowAction("edit", employee.id)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" />}
                            onPress={() => handleRowAction("delete", employee.id)}
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
            
            {filteredEmployees.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredEmployees.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
            </CardBody>
          </Card>

        {/* View Employee Modal */}
        <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:eye" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Employee Details</h3>
                      <p className="text-sm text-gray-500">Complete employee information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedEmployee && (
                    <div className="space-y-6">
                      {/* Employee Info */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar src={selectedEmployee.avatar} size="lg" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</h4>
                          <p className="text-gray-600">{selectedEmployee.email}</p>
                          <p className="text-sm text-gray-500">{selectedEmployee.id}</p>
                        </div>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Department</span>
                            <p className="font-medium">{selectedEmployee.department}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Designation</span>
                            <p className="font-medium">{selectedEmployee.designation}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Join Date</span>
                            <p className="font-medium">{new Date(selectedEmployee.joinDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Status</span>
                            <Chip
                              size="sm"
                              color={statusColorMap[selectedEmployee.status] as any}
                              variant="flat"
                              className="ml-2"
                            >
                              {selectedEmployee.status}
                            </Chip>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Phone</span>
                            <p className="font-medium">{selectedEmployee.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Salary</span>
                            <p className="font-medium">
                              {selectedEmployee.salary ? `$${selectedEmployee.salary.toLocaleString()}` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Manager</span>
                            <p className="font-medium">{selectedEmployee.manager || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Emergency Contact</span>
                            <p className="font-medium">{selectedEmployee.emergencyContact || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      {selectedEmployee.address && (
                        <div>
                          <span className="text-gray-500 text-sm">Address</span>
                          <p className="font-medium">{selectedEmployee.address}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-sm">Skills</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedEmployee.skills.map((skill, index) => (
                              <Chip key={index} size="sm" variant="flat" color="primary">
                                {skill}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {selectedEmployee.notes && (
                        <div>
                          <span className="text-gray-500 text-sm">Notes</span>
                          <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{selectedEmployee.notes}</p>
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

        {/* Edit Employee Modal */}
        <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="4xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:edit" className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {editingEmployee?.id && employeeList.find(emp => emp.id === editingEmployee.id) ? 'Edit Employee' : 'Add Employee'}
                      </h3>
                      <p className="text-sm text-gray-500">Update employee information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {editingEmployee && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          placeholder="Enter full name"
                          value={editingEmployee.name}
                          onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                          isRequired
                        />
                        <Input
                          label="Email"
                          type="email"
                          placeholder="Enter email address"
                          value={editingEmployee.email}
                          onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                          isRequired
                        />
                        <Input
                          label="Phone"
                          placeholder="Enter phone number"
                          value={editingEmployee.phone}
                          onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                        />
                        <Input
                          label="Employee ID"
                          value={editingEmployee.id}
                          isReadOnly
                          variant="bordered"
                        />
                      </div>

                      {/* Work Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="Department"
                          placeholder="Select department"
                          selectedKeys={[editingEmployee.department]}
                          onSelectionChange={(keys) => setEditingEmployee({...editingEmployee, department: Array.from(keys)[0] as string})}
                          isRequired
                          items={departments.map(dept => ({ key: dept, label: dept }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Select
                          label="Designation"
                          placeholder="Select designation"
                          selectedKeys={[editingEmployee.designation]}
                          onSelectionChange={(keys) => setEditingEmployee({...editingEmployee, designation: Array.from(keys)[0] as string})}
                          isRequired
                          items={designations.map(des => ({ key: des, label: des }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Input
                          label="Join Date"
                          type="date"
                          value={editingEmployee.joinDate}
                          onChange={(e) => setEditingEmployee({...editingEmployee, joinDate: e.target.value})}
                          isRequired
                        />
                        <Select
                          label="Status"
                          selectedKeys={[editingEmployee.status]}
                          onSelectionChange={(keys) => setEditingEmployee({...editingEmployee, status: Array.from(keys)[0] as Employee['status']})}
                          items={[
                            { key: "active", label: "Active" },
                            { key: "inactive", label: "Inactive" },
                            { key: "leave", label: "On Leave" },
                            { key: "terminated", label: "Terminated" }
                          ]}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                      </div>

                      {/* Additional Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Salary"
                          type="number"
                          placeholder="Enter salary"
                          value={editingEmployee.salary?.toString() || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, salary: parseFloat(e.target.value) || 0})}
                        />
                        <Input
                          label="Manager"
                          placeholder="Enter manager name"
                          value={editingEmployee.manager || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, manager: e.target.value})}
                        />
                        <Input
                          label="Emergency Contact"
                          placeholder="Enter emergency contact"
                          value={editingEmployee.emergencyContact || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, emergencyContact: e.target.value})}
                        />
                        <Input
                          label="Address"
                          placeholder="Enter address"
                          value={editingEmployee.address || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, address: e.target.value})}
                        />
                      </div>

                      {/* Skills and Notes */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Skills (comma separated)"
                          placeholder="e.g., JavaScript, React, Node.js"
                          value={editingEmployee.skills?.join(', ') || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        />
                        <Textarea
                          label="Notes"
                          placeholder="Enter any additional notes"
                          value={editingEmployee.notes || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, notes: e.target.value})}
                          minRows={3}
                        />
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleSaveEmployee}>
                    {editingEmployee?.id && employeeList.find(emp => emp.id === editingEmployee.id) ? 'Update Employee' : 'Add Employee'}
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