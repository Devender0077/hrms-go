import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Avatar,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  Divider,
  addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// Organization structure interface
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  reportsTo?: string;
  directReports?: string[];
  status: "active" | "inactive";
  joinDate: string;
}

// Sample organization data
const organizationData: Employee[] = [
  {
    id: "CEO001",
    name: "John Smith",
    position: "Chief Executive Officer",
    department: "Executive",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    directReports: ["CTO001", "CFO001", "CHRO001"],
    status: "active",
    joinDate: "2020-01-15"
  },
  {
    id: "CTO001",
    name: "Sarah Johnson",
    position: "Chief Technology Officer",
    department: "Technology",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4568",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    reportsTo: "CEO001",
    directReports: ["DEV001", "QA001", "IT001"],
    status: "active",
    joinDate: "2020-03-20"
  },
  {
    id: "CFO001",
    name: "Michael Brown",
    position: "Chief Financial Officer",
    department: "Finance",
    email: "michael.brown@company.com",
    phone: "+1 (555) 123-4569",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    reportsTo: "CEO001",
    directReports: ["ACC001", "FIN001"],
    status: "active",
    joinDate: "2020-02-10"
  },
  {
    id: "CHRO001",
    name: "Emily Davis",
    position: "Chief Human Resources Officer",
    department: "Human Resources",
    email: "emily.davis@company.com",
    phone: "+1 (555) 123-4570",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
    reportsTo: "CEO001",
    directReports: ["HR001", "REC001"],
    status: "active",
    joinDate: "2020-04-05"
  },
  {
    id: "DEV001",
    name: "David Wilson",
    position: "Senior Software Engineer",
    department: "Technology",
    email: "david.wilson@company.com",
    phone: "+1 (555) 123-4571",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
    reportsTo: "CTO001",
    status: "active",
    joinDate: "2021-01-15"
  },
  {
    id: "QA001",
    name: "Lisa Anderson",
    position: "QA Manager",
    department: "Technology",
    email: "lisa.anderson@company.com",
    phone: "+1 (555) 123-4572",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=6",
    reportsTo: "CTO001",
    status: "active",
    joinDate: "2021-03-10"
  },
  {
    id: "IT001",
    name: "Robert Taylor",
    position: "IT Manager",
    department: "Technology",
    email: "robert.taylor@company.com",
    phone: "+1 (555) 123-4573",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=7",
    reportsTo: "CTO001",
    status: "active",
    joinDate: "2021-02-20"
  },
  {
    id: "ACC001",
    name: "Jennifer Martinez",
    position: "Senior Accountant",
    department: "Finance",
    email: "jennifer.martinez@company.com",
    phone: "+1 (555) 123-4574",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=8",
    reportsTo: "CFO001",
    status: "active",
    joinDate: "2021-05-15"
  },
  {
    id: "FIN001",
    name: "Christopher Lee",
    position: "Financial Analyst",
    department: "Finance",
    email: "christopher.lee@company.com",
    phone: "+1 (555) 123-4575",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=9",
    reportsTo: "CFO001",
    status: "active",
    joinDate: "2021-07-20"
  },
  {
    id: "HR001",
    name: "Amanda White",
    position: "HR Manager",
    department: "Human Resources",
    email: "amanda.white@company.com",
    phone: "+1 (555) 123-4576",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=10",
    reportsTo: "CHRO001",
    status: "active",
    joinDate: "2021-06-10"
  },
  {
    id: "REC001",
    name: "Kevin Garcia",
    position: "Recruitment Specialist",
    department: "Human Resources",
    email: "kevin.garcia@company.com",
    phone: "+1 (555) 123-4577",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=11",
    reportsTo: "CHRO001",
    status: "active",
    joinDate: "2021-08-15"
  }
];

export default function OrganizationChart() {
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [viewMode, setViewMode] = React.useState<"chart" | "list">("chart");
  const [selectedDepartment, setSelectedDepartment] = React.useState("all");
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const [panX, setPanX] = React.useState(0);
  const [panY, setPanY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Get departments
  const departments = React.useMemo(() => {
    const deptSet = new Set(organizationData.map(emp => emp.department));
    return Array.from(deptSet);
  }, []);

  // Filter employees by department
  const filteredEmployees = React.useMemo(() => {
    if (selectedDepartment === "all") return organizationData;
    return organizationData.filter(emp => emp.department === selectedDepartment);
  }, [selectedDepartment]);

  // Get employee by ID
  const getEmployee = (id: string) => organizationData.find(emp => emp.id === id);

  // Get direct reports
  const getDirectReports = (employeeId: string) => {
    return organizationData.filter(emp => emp.reportsTo === employeeId);
  };

  // Get manager
  const getManager = (employeeId: string) => {
    const employee = organizationData.find(emp => emp.id === employeeId);
    if (employee?.reportsTo) {
      return organizationData.find(emp => emp.id === employee.reportsTo);
    }
    return null;
  };

  // Handle employee click
  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    onOpen();
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    setPanX(0);
    setPanY(0);
  };

  // Pan functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoomLevel(prev => Math.max(50, Math.min(300, prev + delta)));
  };

  // Render organization chart node with proper tree alignment
  const renderOrgNode = (employee: Employee, level: number = 0) => {
    const directReports = getDirectReports(employee.id);
    
    return (
      <div key={employee.id} className="flex flex-col items-center">
        {/* Employee Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: level * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:border-primary-300 hover:shadow-xl cursor-pointer transition-all duration-300 w-[200px]"
          onClick={() => handleEmployeeClick(employee)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <Avatar
                src={employee.avatar}
                alt={employee.name}
                className="w-14 h-14 ring-4 ring-white shadow-md"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                employee.status === "active" ? "bg-green-500" : "bg-gray-400"
              }`}></div>
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
              {employee.name}
            </h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-tight">
              {employee.position}
            </p>
            <Chip
              size="sm"
              color={employee.status === "active" ? "success" : "default"}
              variant="flat"
              className="text-xs"
            >
              {employee.status}
            </Chip>
          </div>
        </motion.div>

        {/* Direct Reports Container */}
        {directReports.length > 0 && (
          <div className="mt-8 relative">
            {/* Vertical line from manager to children */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
            
            {/* Horizontal line connecting all children */}
            {directReports.length > 1 && (
              <div 
                className="absolute top-8 h-px bg-gray-300"
                style={{
                  left: `${50 - (directReports.length - 1) * 12.5}%`,
                  right: `${50 - (directReports.length - 1) * 12.5}%`
                }}
              ></div>
            )}
            
            {/* Children nodes */}
            <div className="flex justify-center items-start pt-8" style={{ gap: `${Math.max(16, 200 - directReports.length * 20)}px` }}>
              {directReports.map((report, index) => (
                <div key={report.id} className="flex flex-col items-center relative">
                  {/* Vertical line from horizontal line to child */}
                  {directReports.length > 1 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
                  )}
                  {renderOrgNode(report, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get root employees (those who don't report to anyone)
  const rootEmployees = organizationData.filter(emp => !emp.reportsTo);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Organization Chart</h1>
            <p className="text-gray-600 mt-1">Company structure and reporting relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              color={viewMode === "chart" ? "primary" : "default"}
              variant={viewMode === "chart" ? "solid" : "bordered"}
              onPress={() => setViewMode("chart")}
              startContent={<Icon icon="lucide:network" />}
              className="min-w-[120px]"
            >
              Chart View
            </Button>
            <Button
              color={viewMode === "list" ? "primary" : "default"}
              variant={viewMode === "list" ? "solid" : "bordered"}
              onPress={() => setViewMode("list")}
              startContent={<Icon icon="lucide:list" />}
              className="min-w-[120px]"
            >
              List View
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Filters */}
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredEmployees.length} of {organizationData.length} employees
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

      {/* Organization Chart */}
      {viewMode === "chart" && (
        <Card className="bg-gradient-to-br from-gray-50 to-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Organization Structure</h2>
                <p className="text-sm text-gray-600 mt-1">Click on any employee to view details • Drag to pan • Scroll to zoom</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={handleZoomOut}
                    isDisabled={zoomLevel <= 50}
                    className="min-w-8 h-8"
                  >
                    <Icon icon="lucide:minus" className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                    {zoomLevel}%
                  </span>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={handleZoomIn}
                    isDisabled={zoomLevel >= 300}
                    className="min-w-8 h-8"
                  >
                    <Icon icon="lucide:plus" className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={handleResetZoom}
                    className="min-w-8 h-8"
                    title="Reset Zoom"
                  >
                    <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Inactive</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="relative">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}></div>
              </div>
              
              {/* Chart Container */}
              <div 
                className="relative overflow-hidden max-h-[80vh] cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ userSelect: 'none' }}
              >
                <div 
                  className="flex justify-center py-8 transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel / 100})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <div className="flex flex-col items-center space-y-12">
                    {rootEmployees.map((employee, index) => (
                      <div key={employee.id} className="flex flex-col items-center">
                        {renderOrgNode(employee)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Zoom indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon icon="lucide:zoom-in" className="w-4 h-4" />
                    <span className="font-medium">{zoomLevel}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Employee Directory</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(employee => {
                const manager = getManager(employee.id);
                const directReports = getDirectReports(employee.id);
                
                return (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-12 h-12"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {employee.position}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {employee.department}
                        </p>
                        {manager && (
                          <p className="text-xs text-gray-400 mt-1">
                            Reports to: {manager.name}
                          </p>
                        )}
                        {directReports.length > 0 && (
                          <p className="text-xs text-gray-400">
                            Manages: {directReports.length} employee(s)
                          </p>
                        )}
                      </div>
                      <Chip
                        size="sm"
                        color={employee.status === "active" ? "success" : "default"}
                        variant="flat"
                      >
                        {employee.status}
                      </Chip>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Employee Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Employee Details
              </ModalHeader>
              <ModalBody>
                {selectedEmployee && (
                  <div className="space-y-6">
                    {/* Employee Info */}
                    <div className="flex items-center space-x-4">
                      <Avatar
                        src={selectedEmployee.avatar}
                        alt={selectedEmployee.name}
                        className="w-20 h-20"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                        <p className="text-gray-600">{selectedEmployee.position}</p>
                        <p className="text-sm text-gray-500">{selectedEmployee.department}</p>
                        <Chip
                          size="sm"
                          color={selectedEmployee.status === "active" ? "success" : "default"}
                          variant="flat"
                          className="mt-2"
                        >
                          {selectedEmployee.status}
                        </Chip>
                      </div>
                    </div>

                    <Divider />

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-semibold mb-3">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedEmployee.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedEmployee.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Join Date</p>
                          <p className="font-medium">
                            {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Reporting Structure */}
                    <div>
                      <h4 className="font-semibold mb-3">Reporting Structure</h4>
                      <div className="space-y-3">
                        {/* Manager */}
                        {getManager(selectedEmployee.id) && (
                          <div>
                            <p className="text-sm text-gray-500">Reports to</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Avatar
                                src={getManager(selectedEmployee.id)?.avatar}
                                alt={getManager(selectedEmployee.id)?.name}
                                className="w-8 h-8"
                              />
                              <span className="font-medium">
                                {getManager(selectedEmployee.id)?.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({getManager(selectedEmployee.id)?.position})
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Direct Reports */}
                        {getDirectReports(selectedEmployee.id).length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Direct Reports ({getDirectReports(selectedEmployee.id).length})
                            </p>
                            <div className="mt-2 space-y-2">
                              {getDirectReports(selectedEmployee.id).map(report => (
                                <div key={report.id} className="flex items-center space-x-2">
                                  <Avatar
                                    src={report.avatar}
                                    alt={report.name}
                                    className="w-8 h-8"
                                  />
                                  <span className="font-medium">{report.name}</span>
                                  <span className="text-sm text-gray-500">({report.position})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
      </div>
    </div>
  );
}
