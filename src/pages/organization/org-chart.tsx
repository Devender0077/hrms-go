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
  Textarea,
  Chip,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

// Enhanced Employee interface
interface Employee {
  id: number;
  name: string;
  title: string;
  department: string;
  email: string;
  phone?: string;
  avatar: string;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  manager?: string;
  directReports?: number;
  children: Employee[];
}
    
    // Sample organization data
const orgData: Employee = {
      id: 1,
  name: "Tony Reichert",
      title: "Chief Executive Officer",
      department: "Executive",
  email: "tony.reichert@company.com",
  phone: "+1 (555) 123-4567",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
  status: "active",
  joinDate: "2020-01-15",
  directReports: 3,
      children: [
        {
          id: 2,
      name: "Zoey Lang",
          title: "Chief Technology Officer",
          department: "Information Technology",
      email: "zoey.lang@company.com",
      phone: "+1 (555) 234-5678",
          avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
      status: "active",
      joinDate: "2020-03-20",
      manager: "Tony Reichert",
      directReports: 2,
          children: [
            {
              id: 3,
          name: "John Doe",
              title: "Senior Software Engineer",
              department: "Information Technology",
          email: "john.doe@company.com",
          phone: "+1 (555) 345-6789",
              avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
          status: "active",
          joinDate: "2021-06-10",
          manager: "Zoey Lang",
          directReports: 1,
              children: [
                {
                  id: 4,
              name: "Jane Smith",
                  title: "Software Engineer",
              department: "Information Technology",
              email: "jane.smith@company.com",
              phone: "+1 (555) 456-7890",
              avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
              status: "active",
              joinDate: "2022-01-15",
              manager: "John Doe",
              directReports: 0,
              children: []
            }
          ]
        },
        {
          id: 5,
          name: "Mike Johnson",
          title: "DevOps Engineer",
          department: "Information Technology",
          email: "mike.johnson@company.com",
          phone: "+1 (555) 567-8901",
          avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
          status: "active",
          joinDate: "2021-08-15",
          manager: "Zoey Lang",
          directReports: 0,
              children: []
            }
          ]
        },
        {
      id: 6,
      name: "Emma Wilson",
          title: "HR Manager",
          department: "Human Resources",
      email: "emma.wilson@company.com",
      phone: "+1 (555) 678-9012",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=6",
      status: "active",
      joinDate: "2021-09-01",
      manager: "Tony Reichert",
      directReports: 1,
          children: [
            {
          id: 7,
          name: "Sarah Davis",
              title: "HR Specialist",
              department: "Human Resources",
          email: "sarah.davis@company.com",
          phone: "+1 (555) 789-0123",
          avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=7",
          status: "active",
          joinDate: "2022-03-10",
          manager: "Emma Wilson",
          directReports: 0,
              children: []
            }
          ]
        },
        {
      id: 8,
      name: "William Smith",
      title: "Finance Manager",
      department: "Finance",
      email: "william.smith@company.com",
      phone: "+1 (555) 890-1234",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=8",
      status: "active",
      joinDate: "2021-08-15",
      manager: "Tony Reichert",
      directReports: 0,
              children: []
        }
      ]
    };
    
    // Sample departments for filter
    const departments = [
      { id: 1, name: "All Departments" },
      { id: 2, name: "Executive" },
  { id: 3, name: "Information Technology" },
  { id: 4, name: "Human Resources" },
      { id: 5, name: "Finance" },
      { id: 6, name: "Marketing" },
      { id: 7, name: "Sales" },
  { id: 8, name: "Operations" }
];

const statusColorMap = {
  active: "success",
  inactive: "danger",
  "on-leave": "warning"
    };
    
    // Enhanced OrgNode component with better styling and interactions
const OrgNode = ({ node, isRoot = false, onEdit, onView, zoomLevel = 100 }) => {
  const nodeRef = useRef<HTMLDivElement>(null);

      return (
    <div className="flex flex-col items-center" ref={nodeRef}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
        style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <Tooltip content={`${node.name} - ${node.title}`}>
          <div className={`flex flex-col items-center p-4 rounded-xl ${
            isRoot 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
              : 'bg-white border border-gray-200 shadow-md hover:shadow-lg'
          } mb-2 w-[200px] transition-all duration-300`}>
            <div className="relative mb-3">
                <Avatar 
                  src={node.avatar} 
                  size="lg" 
                className={isRoot ? "ring-4 ring-white/30" : "ring-2 ring-gray-200"}
                isBordered
                  color={isRoot ? "primary" : "default"}
                />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                isRoot ? "border-white" : "border-white"
              } ${
                node.status === "active" ? "bg-green-500" : 
                node.status === "inactive" ? "bg-red-500" : "bg-yellow-500"
              }`}></div>
            </div>
            <h3 className="font-semibold text-center text-sm mb-1">{node.name}</h3>
            <p className="text-xs text-center opacity-80 mb-2 line-clamp-2">{node.title}</p>
            <Chip
              size="sm"
              color={statusColorMap[node.status] as any}
              variant="flat"
              className="mb-3"
            >
              {node.status}
            </Chip>
            <div className="flex gap-2">
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="light" 
                className={isRoot ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-gray-700"}
                    onPress={() => window.location.href = `mailto:${node.email}`}
                  >
                    <Icon icon="lucide:mail" size={16} />
                  </Button>
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="light" 
                className={isRoot ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-gray-700"}
                    onPress={() => onView(node)}
                  >
                    <Icon icon="lucide:eye" size={16} />
                  </Button>
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="light" 
                className={isRoot ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-gray-700"}
                    onPress={() => onEdit(node)}
                  >
                    <Icon icon="lucide:edit" size={16} />
                  </Button>
                </div>
              </div>
            </Tooltip>
          </motion.div>
          
          {node.children && node.children.length > 0 && (
            <>
          <div className="w-[2px] h-8 bg-gray-300"></div>
              <div className="relative">
            <div 
              className="absolute left-1/2 -translate-x-1/2 h-[2px] bg-gray-300" 
              style={{ width: `${(node.children.length - 1) * 220 + 20}px` }}
            ></div>
              </div>
              <div className="flex flex-row items-start gap-10">
                {node.children.map((child, index) => (
                  <div key={child.id} className="flex flex-col items-center">
                <div className="w-[2px] h-4 bg-gray-300"></div>
                <OrgNode 
                  node={child} 
                  onEdit={onEdit} 
                  onView={onView} 
                  zoomLevel={zoomLevel}
                />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    };
    
    export default function OrgChart() {
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
      
      // Fetch org chart data on component mount
  useEffect(() => {
        const loadData = async () => {
          try {
            setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setChartData(orgData);
          } catch (err) {
            setError("Failed to load organization chart data");
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
        
        loadData();
      }, []);
      
  // Zoom functions
      const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
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
    if (e.button === 0) {
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
    setZoomLevel(prev => Math.max(50, Math.min(200, prev + delta)));
  };
  
  const handleEditEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEditing(true);
        onOpen();
      };
      
  const handleViewEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEditing(false);
        onOpen();
      };
      
      const handleSaveChanges = () => {
    addToast({
      title: "Employee Updated",
      description: `${selectedEmployee?.name}'s information has been updated successfully.`,
      color: "success",
    });
    onOpenChange();
  };

  // Export to PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      addToast({
        title: "Export Successful",
        description: "Organization chart has been exported to PDF.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export organization chart.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Image
  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      // Simulate image generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      addToast({
        title: "Export Successful",
        description: "Organization chart has been exported as image.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export organization chart.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Print chart
      const handlePrintChart = () => {
        window.print();
      };
      
      if (loading) {
        return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Loading organization chart...</p>
            </div>
          </div>
        </div>
          </div>
        );
      }
      
      if (error) {
        return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardBody className="text-center py-12">
              <Icon icon="lucide:alert-circle" className="text-6xl text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Chart</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button color="primary" onPress={() => window.location.reload()}>
              Retry
            </Button>
            </CardBody>
          </Card>
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
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Icon icon="lucide:sitemap" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
              <p className="text-gray-600 mt-1">Company structure and reporting relationships</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
              <Button 
                  color="primary" 
                variant="flat" 
                startContent={<Icon icon="lucide:download" />}
                  isLoading={isExporting}
                  className="font-medium"
              >
                Export
              </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="pdf"
                  startContent={<Icon icon="lucide:file-pdf" />}
                  onPress={handleExportPDF}
                >
                  Export as PDF
                </DropdownItem>
                <DropdownItem
                  key="image"
                  startContent={<Icon icon="lucide:image" />}
                  onPress={handleExportImage}
                >
                  Export as Image
                </DropdownItem>
                <DropdownItem
                  key="print"
                startContent={<Icon icon="lucide:printer" />}
                onPress={handlePrintChart}
              >
                  Print Chart
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            </div>
          </div>
          
        {/* Controls */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
              <Select
                  label="Department Filter"
                  placeholder="All Departments"
                selectedKeys={[selectedDepartment]}
                  onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
                  className="min-w-[200px]"
                  items={departments.map(dept => ({ key: dept.name, label: dept.name }))}
                >
                  {(item) => (
                    <SelectItem key={item.key}>
                      {item.label}
                  </SelectItem>
                  )}
              </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Zoom:</span>
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
                    isDisabled={zoomLevel >= 200}
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
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Organization Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Organization Structure</h2>
                <p className="text-sm text-gray-600 mt-1">Click on any employee to view details • Drag to pan • Scroll to zoom</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>On Leave</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Inactive</span>
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
                className="relative overflow-hidden min-h-[600px] cursor-grab active:cursor-grabbing"
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
                  {chartData && (
                  <OrgNode 
                      node={chartData} 
                    isRoot={true} 
                    onEdit={handleEditEmployee}
                    onView={handleViewEmployee}
                      zoomLevel={zoomLevel}
                    />
                  )}
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
          
        {/* Employee Details Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon={isEditing ? "lucide:edit" : "lucide:eye"} className="text-blue-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {isEditing ? 'Edit Employee' : 'Employee Details'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isEditing ? 'Update employee information' : 'View complete employee information'}
                      </p>
                    </div>
                  </div>
                  </ModalHeader>
                  <ModalBody>
                    {selectedEmployee && (
                    <div className="space-y-6">
                      {/* Employee Header */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar src={selectedEmployee.avatar} size="lg" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</h4>
                          <p className="text-gray-600">{selectedEmployee.title}</p>
                          <p className="text-sm text-gray-500">{selectedEmployee.department}</p>
                        </div>
                        </div>
                        
                      {isEditing ? (
                        /* Edit Form */
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          value={selectedEmployee.name}
                              onChange={(e) => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
                        />
                        <Input
                          label="Job Title"
                          value={selectedEmployee.title}
                              onChange={(e) => setSelectedEmployee({...selectedEmployee, title: e.target.value})}
                            />
                        <Input
                          label="Email"
                              type="email"
                          value={selectedEmployee.email}
                              onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                        />
                        <Input
                          label="Phone"
                              value={selectedEmployee.phone || ''}
                              onChange={(e) => setSelectedEmployee({...selectedEmployee, phone: e.target.value})}
                        />
                        <Input
                              label="Department"
                              value={selectedEmployee.department}
                              onChange={(e) => setSelectedEmployee({...selectedEmployee, department: e.target.value})}
                            />
                        <Input
                              label="Manager"
                              value={selectedEmployee.manager || ''}
                              onChange={(e) => setSelectedEmployee({...selectedEmployee, manager: e.target.value})}
                            />
                          </div>
                        </div>
                      ) : (
                        /* View Details */
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <span className="text-gray-500 text-sm">Email</span>
                              <p className="font-medium">{selectedEmployee.email}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Phone</span>
                              <p className="font-medium">{selectedEmployee.phone || 'N/A'}</p>
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
                              <span className="text-gray-500 text-sm">Manager</span>
                              <p className="font-medium">{selectedEmployee.manager || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Direct Reports</span>
                              <p className="font-medium">{selectedEmployee.directReports || 0}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Employee ID</span>
                              <p className="font-medium">EMP{selectedEmployee.id.toString().padStart(3, '0')}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    )}
                  </ModalBody>
                  <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    {isEditing ? 'Cancel' : 'Close'}
                    </Button>
                    {isEditing && (
                      <Button color="primary" onPress={handleSaveChanges}>
                        Save Changes
                      </Button>
                    )}
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
      </div>
    </div>
      );
    }