import React, { useState, useMemo, useRef, useEffect } from "react";
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
  FileUpload,
  Spinner
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
    import { employeeAPI } from "../services/api-service";
import { useAuth } from "../contexts/auth-context";
    
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

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const rowsPerPage = 10;
    
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

  // Load employees from database
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.getAll();
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees');
      addToast({
        title: "Error",
        description: "Failed to load employees",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
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
  }, [employees, searchQuery, selectedDepartment, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const paginatedEmployees = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
    return filteredEmployees.slice(start, start + rowsPerPage);
  }, [filteredEmployees, page, rowsPerPage]);

  const handleAddEmployee = async (employeeData: Partial<Employee>) => {
    try {
      await employeeAPI.create(employeeData);
      addToast({
        title: "Success",
        description: "Employee added successfully",
        color: "success"
      });
      loadEmployees(); // Reload employees
      onOpenChange();
    } catch (err) {
      console.error('Error adding employee:', err);
      addToast({
        title: "Error",
        description: "Failed to add employee",
        color: "danger"
      });
    }
  };

  const handleEditEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      await employeeAPI.update(id, employeeData);
      addToast({
        title: "Success",
        description: "Employee updated successfully",
        color: "success"
      });
      loadEmployees(); // Reload employees
      onEditOpenChange();
    } catch (err) {
      console.error('Error updating employee:', err);
      addToast({
        title: "Error",
        description: "Failed to update employee",
        color: "danger"
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await employeeAPI.delete(id);
      addToast({
        title: "Success",
        description: "Employee deleted successfully",
        color: "success"
      });
      loadEmployees(); // Reload employees
    } catch (err) {
      console.error('Error deleting employee:', err);
      addToast({
        title: "Error",
        description: "Failed to delete employee",
        color: "danger"
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await employeeAPI.export('csv');
      addToast({
        title: "Success",
        description: "Employees exported successfully",
        color: "success"
      });
    } catch (err) {
      console.error('Error exporting employees:', err);
      addToast({
        title: "Error",
        description: "Failed to export employees",
        color: "danger"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append('file', file);
      
      await employeeAPI.bulkImport(formData);
      addToast({
        title: "Success",
        description: "Employees imported successfully",
        color: "success"
      });
      loadEmployees(); // Reload employees
    } catch (err) {
      console.error('Error importing employees:', err);
      addToast({
        title: "Error",
        description: "Failed to import employees",
        color: "danger"
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Employees</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button color="primary" onPress={loadEmployees}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
      
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
              <p className="text-gray-600 mt-1">Manage your team members and their information</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="default" 
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              isLoading={isExporting}
            >
              Export CSV
            </Button>
            <Button 
              color="default" 
              variant="flat"
              startContent={<Icon icon="lucide:upload" />}
              onPress={handleImportCSV}
              isLoading={isImporting}
            >
              Import CSV
            </Button>
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onOpen}
            >
                Add Employee
              </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icon icon="lucide:users" className="text-blue-600 text-xl" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {employees.filter(emp => emp.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Icon icon="lucide:user-check" className="text-green-600 text-xl" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Leave</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {employees.filter(emp => emp.status === 'leave').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Icon icon="lucide:user-x" className="text-yellow-600 text-xl" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(employees.map(emp => emp.department)).size}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Icon icon="lucide:building" className="text-purple-600 text-xl" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
                className="flex-1"
              />
              <Select
                placeholder="Department"
                selectedKeys={selectedDepartment ? [selectedDepartment] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedDepartment(selected);
                }}
                className="w-full lg:w-48"
              >
                <SelectItem key="all" value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </Select>
              <Select
                placeholder="Status"
                selectedKeys={selectedStatus ? [selectedStatus] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedStatus(selected);
                }}
                className="w-full lg:w-48"
              >
                <SelectItem key="all" value="all">All Status</SelectItem>
                <SelectItem key="active" value="active">Active</SelectItem>
                <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                <SelectItem key="leave" value="leave">On Leave</SelectItem>
                <SelectItem key="terminated" value="terminated">Terminated</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Employees Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-green-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Employee List</h3>
                <p className="text-gray-500 text-sm">
                  {filteredEmployees.length} of {employees.length} employees
                </p>
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
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No employees found">
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={employee.avatar}
                          name={employee.name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:building" className="text-gray-400 text-sm" />
                        <span className="text-sm">{employee.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:briefcase" className="text-gray-400 text-sm" />
                        <span className="text-sm">{employee.designation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:calendar" className="text-gray-400 text-sm" />
                        <span className="text-sm">{employee.joinDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={statusColorMap[employee.status] as any}
                        variant="flat"
                        size="sm"
                      >
                        {employee.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:more-horizontal" className="text-gray-400" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => {
                              setSelectedEmployee(employee);
                              onViewOpen();
                            }}
                          >
                            View
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => {
                              setEditingEmployee(employee);
                              onEditOpen();
                            }}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash-2" />}
                            onPress={() => handleDeleteEmployee(employee.id)}
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
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

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