import React, { useState, useEffect, useRef } from "react";
    import { 
      Card, 
      CardBody, 
      CardHeader,
      Button,
      Select,
      SelectItem,
      Avatar,
      Tooltip,
      Spinner,
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      useDisclosure,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";
import { apiRequest } from "../../services/api-service";

// Employee interface
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_photo?: string;
  status: string;
  joining_date: string;
  department_name?: string;
  designation_name?: string;
  manager_name?: string;
  manager_id?: number;
  shift_name?: string;
}

interface Department {
  id: number;
  name: string;
}

const OrganizationChartPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "list">("chart");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);
  
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load employees (with cache-busting to avoid 304 responses)
      const employeesResponse = await apiRequest(`/employees?_t=${Date.now()}`, {
        method: 'GET',
      });
      
      console.log('Employees response:', employeesResponse);
      
      // Handle the API response structure
      if (employeesResponse && employeesResponse.success && employeesResponse.data) {
        setEmployees(employeesResponse.data || []);
        console.log('Employees loaded:', employeesResponse.data?.length || 0);
      } else if (employeesResponse && employeesResponse.success === false) {
        console.error('Failed to load employees:', employeesResponse.message);
      } else {
        console.error('Invalid employees response structure:', employeesResponse);
      }

      // Load departments (with cache-busting to avoid 304 responses)
      const departmentsResponse = await apiRequest(`/organization/departments?_t=${Date.now()}`, {
        method: 'GET',
      });
      
      console.log('Departments response:', departmentsResponse);
      
      // Handle the API response structure
      if (departmentsResponse && departmentsResponse.success && departmentsResponse.data) {
        setDepartments(departmentsResponse.data || []);
        console.log('Departments loaded:', departmentsResponse.data?.length || 0);
      } else if (departmentsResponse && departmentsResponse.success === false) {
        console.error('Failed to load departments:', departmentsResponse.message);
      } else {
        console.error('Invalid departments response structure:', departmentsResponse);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchQuery || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.designation_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || 
      employee.department_name === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    onDetailsOpen();
  };

  // Build hierarchical tree structure
  const buildTreeStructure = (employees: Employee[]) => {
    const employeeMap = new Map();
    const rootEmployees: Employee[] = [];

    // Create a map of all employees
    employees.forEach(emp => {
      employeeMap.set(emp.id, { ...emp, children: [] });
    });

    // Build the tree structure
    employees.forEach(emp => {
      const employeeNode = employeeMap.get(emp.id);
      if (emp.manager_id && employeeMap.has(emp.manager_id)) {
        const manager = employeeMap.get(emp.manager_id);
        manager.children.push(employeeNode);
      } else {
        rootEmployees.push(employeeNode);
      }
    });

    return rootEmployees;
  };

  // Enhanced tree node component with modern design
  const TreeNode = ({ employee, level = 0, isLast = false }: { employee: any, level: number, isLast: boolean }) => {
    const hasChildren = employee.children && employee.children.length > 0;
    
      return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: level * 0.1 }}
        className="relative"
      >
        <div className="flex items-start mb-8">
          {/* Connector lines */}
          {level > 0 && (
            <div className="flex items-start mr-6 mt-8">
              <div className="w-px bg-gradient-to-b from-blue-300 to-purple-300 h-12"></div>
              <div className="w-8 h-px bg-gradient-to-r from-blue-300 to-purple-300 -ml-8 mt-6"></div>
            </div>
          )}
          
          {/* Employee card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex-shrink-0"
          >
            <Card 
              className="hover:shadow-2xl transition-all duration-300 cursor-pointer w-80 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-blue-200/50"
              isPressable 
              onPress={() => handleViewEmployee(employee)}
            >
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                <Avatar 
                      src={getAvatarUrl(employee)}
                      name={`${employee.first_name} ${employee.last_name}`}
                  size="lg" 
                      className="ring-4 ring-blue-100"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      employee.status === "active" ? "bg-green-500" : 
                      employee.status === "inactive" ? "bg-red-500" : "bg-yellow-500"
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-lg">
                      {employee.first_name} {employee.last_name}
                    </h4>
                    <p className="text-sm text-blue-600 truncate font-semibold">
                      {employee.designation_name || 'No Designation'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {employee.department_name || 'No Department'}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Chip
                    size="sm" 
                        variant="flat"
                        color={getStatusColor(employee.status)}
                        className="font-medium"
                      >
                        {employee.status || 'Unknown'}
                      </Chip>
                      {hasChildren && (
                        <Chip
                    size="sm" 
                          variant="flat"
                          color="primary"
                          className="font-medium"
                        >
                          {employee.children.length} report{employee.children.length !== 1 ? 's' : ''}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Render children */}
        {hasChildren && (
          <div className="ml-12 relative">
            <div className="absolute left-0 top-0 w-px bg-gradient-to-b from-blue-200 to-purple-200 h-full"></div>
            <AnimatePresence>
              {employee.children.map((child: any, index: number) => 
                <TreeNode 
                  key={child.id}
                  employee={child} 
                  level={level + 1} 
                  isLast={index === employee.children.length - 1}
                />
              )}
            </AnimatePresence>
              </div>
        )}
      </motion.div>
    );
  };
    
  // Render the complete tree view
  const renderTreeView = (employees: Employee[]) => {
    const treeStructure = buildTreeStructure(employees);
    
    if (treeStructure.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="lucide:users" className="w-12 h-12 text-blue-500" />
                  </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery || selectedDepartment !== "all" 
              ? "Try adjusting your search or filter criteria to find employees."
              : "No employees have been added to the organization yet."
            }
          </p>
        </motion.div>
      );
    }

    return (
      <div className="tree-view">
        <AnimatePresence>
          {treeStructure.map((rootEmployee, index) => 
            <TreeNode 
              key={rootEmployee.id}
              employee={rootEmployee} 
              level={0} 
              isLast={index === treeStructure.length - 1}
            />
          )}
        </AnimatePresence>
        </div>
      );
    };
    
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'on-leave': return 'warning';
      default: return 'default';
    }
  };

  const getAvatarUrl = (employee: Employee) => {
    if (employee.profile_photo) {
      return `/uploads/profiles/${employee.profile_photo}`;
    }
    return undefined;
  };

  // Pan and zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Use useEffect to add wheel event listener directly to DOM
  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoomLevel(prev => Math.max(50, Math.min(200, prev + delta)));
    };

    // Add event listener with passive: false to allow preventDefault
    chartElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      chartElement.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleResetView = () => {
    setZoomLevel(100);
    setPanX(0);
    setPanY(0);
  };

        return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Modern Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Icon icon="lucide:network" className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Organization Chart
              </h1>
              <p className="text-gray-600 text-lg mt-2">Visualize your company's structure and employee hierarchy</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
              <div className="text-sm text-gray-500 font-medium">Total Employees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{filteredEmployees.length}</div>
              <div className="text-sm text-gray-500 font-medium">Filtered</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex-1 max-w-md w-full">
                  <Input
                    placeholder="Search employees by name, email, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<Icon icon="lucide:search" className="w-5 h-5 text-gray-400" />}
                    variant="bordered"
                    size="lg"
                    className="rounded-xl"
                  />
                </div>
                <div className="flex gap-4 items-center">
              <Select
                    label="Department Filter"
                    placeholder="All Departments"
                selectedKeys={[selectedDepartment]}
                    onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys).join(','))}
                    className="w-56"
                    variant="bordered"
                    size="lg"
                    items={[
                      { key: "all", label: "All Departments" },
                      ...departments.map(dept => ({ key: dept.name, label: dept.name }))
                    ]}
                  >
                    {(item) => (
                      <SelectItem key={item.key}>
                        {item.label}
                  </SelectItem>
                    )}
              </Select>
                  <div className="flex gap-2">
                <Button 
                      color={viewMode === 'chart' ? 'primary' : 'default'}
                      variant={viewMode === 'chart' ? 'solid' : 'bordered'}
                      onPress={() => setViewMode('chart')}
                      startContent={<Icon icon="lucide:git-branch" className="w-4 h-4" />}
                      size="lg"
                      className="rounded-xl font-semibold"
                    >
                      Tree View
                </Button>
                <Button 
                      color={viewMode === 'list' ? 'primary' : 'default'}
                      variant={viewMode === 'list' ? 'solid' : 'bordered'}
                      onPress={() => setViewMode('list')}
                      startContent={<Icon icon="lucide:list" className="w-4 h-4" />}
                      size="lg"
                      className="rounded-xl font-semibold"
                    >
                      List View
                </Button>
              </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
        
        {/* Content Area */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-96"
          >
            <div className="text-center">
              <Spinner size="lg" color="primary" />
              <p className="mt-4 text-gray-600 text-lg">Loading organization chart...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardBody className="p-8">
                {viewMode === "chart" ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Organization Tree</h3>
                        <p className="text-gray-600 mt-1">Click and drag to navigate • Scroll to zoom • Click employee cards for details</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                          startContent={<Icon icon="lucide:zoom-out" className="w-4 h-4" />}
                          className="rounded-lg"
                        >
                          Zoom Out
                        </Button>
                        <span className="text-sm text-gray-600 min-w-[3rem] text-center font-semibold">{zoomLevel}%</span>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                          startContent={<Icon icon="lucide:zoom-in" className="w-4 h-4" />}
                          className="rounded-lg"
                        >
                          Zoom In
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={handleResetView}
                          startContent={<Icon icon="lucide:rotate-ccw" className="w-4 h-4" />}
                          className="rounded-lg"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      className="overflow-auto border border-gray-200 rounded-2xl p-8 relative bg-gradient-to-br from-gray-50 to-white"
                      ref={chartRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{ 
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        minHeight: '500px'
                      }}
                    >
                      <div 
                        className="transition-transform duration-200 ease-out"
                        style={{ 
                          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel / 100})`,
                          transformOrigin: 'top left'
                        }}
                      >
                        {renderTreeView(filteredEmployees)}
                      </div>
                      
                      {/* Enhanced zoom indicator */}
                      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-200">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Icon icon="lucide:zoom-in" className="w-4 h-4" />
                          <span className="font-semibold">{zoomLevel}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Employee Directory</h3>
                    {filteredEmployees.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Icon icon="lucide:users" className="w-12 h-12 text-blue-500" />
                        </div>
                        <p className="text-gray-500 text-lg">No employees found</p>
                      </motion.div>
                    ) : (
                      <Table aria-label="Employees list" removeWrapper className="rounded-xl">
                        <TableHeader>
                          <TableColumn>NAME</TableColumn>
                          <TableColumn>TITLE</TableColumn>
                          <TableColumn>DEPARTMENT</TableColumn>
                          <TableColumn>MANAGER</TableColumn>
                          <TableColumn>STATUS</TableColumn>
                          <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {filteredEmployees.map((employee) => (
                            <TableRow key={employee.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    src={getAvatarUrl(employee)}
                                    name={`${employee.first_name} ${employee.last_name}`}
                                    size="md"
                                    className="ring-2 ring-blue-100"
                                  />
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {employee.first_name} {employee.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">{employee.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900 font-medium">
                                  {employee.designation_name || 'No Designation'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900 font-medium">
                                  {employee.department_name || 'No Department'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900 font-medium">
                                  {employee.manager_name || 'No Manager'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={getStatusColor(employee.status)}
                                  className="font-medium"
                                >
                                  {employee.status || 'Unknown'}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  onPress={() => handleViewEmployee(employee)}
                                  startContent={<Icon icon="lucide:eye" className="w-4 h-4" />}
                                  className="rounded-lg"
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Enhanced Employee Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="2xl" className="rounded-2xl">
            <ModalContent>
              {(onClose) => (
                <>
              <ModalHeader className="flex flex-col gap-1 pb-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Icon icon="lucide:user" className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Employee Details</h3>
                    <p className="text-sm text-gray-500">Complete employee information</p>
                  </div>
                </div>
                  </ModalHeader>
              <ModalBody className="pt-0">
                    {selectedEmployee && (
                  <div className="space-y-6">
                    {/* Employee Header */}
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                          <Avatar 
                        src={getAvatarUrl(selectedEmployee)}
                        name={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                            size="lg" 
                        className="ring-4 ring-white shadow-lg"
                      />
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">
                          {selectedEmployee.first_name} {selectedEmployee.last_name}
                        </h4>
                        <p className="text-lg text-blue-600 font-semibold">{selectedEmployee.designation_name || 'No Designation'}</p>
                        <p className="text-sm text-gray-500">{selectedEmployee.department_name || 'No Department'}</p>
                      </div>
                    </div>
                    
                    {/* Employee Details */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <span className="text-gray-500 text-sm font-medium">Email Address</span>
                          <p className="font-semibold text-gray-900">{selectedEmployee.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm font-medium">Phone Number</span>
                          <p className="font-semibold text-gray-900">{selectedEmployee.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm font-medium">Join Date</span>
                          <p className="font-semibold text-gray-900">
                            {selectedEmployee.joining_date ? new Date(selectedEmployee.joining_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm font-medium">Status</span>
                          <Chip
                            size="md"
                            color={getStatusColor(selectedEmployee.status)}
                            variant="flat"
                            className="ml-3 font-semibold"
                          >
                            {selectedEmployee.status || 'Unknown'}
                          </Chip>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <span className="text-gray-500 text-sm font-medium">Manager</span>
                          <p className="font-semibold text-gray-900">{selectedEmployee.manager_name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm font-medium">Shift</span>
                          <p className="font-semibold text-gray-900">{selectedEmployee.shift_name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm font-medium">Employee ID</span>
                          <p className="font-semibold text-gray-900">EMP{selectedEmployee.id.toString().padStart(3, '0')}</p>
                        </div>
                      </div>
                    </div>
                      </div>
                    )}
                  </ModalBody>
              <ModalFooter className="pt-4">
                <Button color="primary" variant="flat" onPress={onClose} size="lg" className="rounded-xl font-semibold">
                  Close
                      </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
    </div>
      );
};

export default OrganizationChartPage;