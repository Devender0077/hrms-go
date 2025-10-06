import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Chip,
  Divider,
  Select,
  SelectItem,
  Input,
  Tabs,
  Tab
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import PageLayout, { PageHeader } from "../../components/layout/PageLayout";
import { useAuth } from "../../contexts/auth-context";
import { apiRequest } from "../../services/api-service";
import ModernOrgChart from "../../components/org-chart/ModernOrgChart";
import ModernOrgList from "../../components/org-chart/ModernOrgList";

// Employee interface - matching API response
interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  avatar?: string;
  employeeId: string;
  reportsTo?: number | null;
  status: string;
  joinDate: string;
  directReports: Employee[];
}

export default function OrganizationChartUnicef() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState<"modern-chart" | "modern-list">("modern-chart");
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Fetch organization chart data
  useEffect(() => {
    const fetchOrgChart = async () => {
      try {
        setLoading(true);
        console.log('Fetching organization chart data...');
        const response = await apiRequest('/organization/chart');
        console.log('Organization chart response:', response);
        
        // Handle different response formats
        if (response && Array.isArray(response)) {
          setEmployees(response);
          console.log('Organization chart data loaded:', response.length, 'employees');
        } else if (response && response.data && Array.isArray(response.data)) {
          setEmployees(response.data);
          console.log('Organization chart data loaded:', response.data.length, 'employees');
        } else {
          console.error('Invalid response format:', response);
          setError('Failed to load organization chart data');
        }
      } catch (err) {
        console.error('Error fetching org chart:', err);
        setError('Failed to load organization chart');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgChart();
  }, []);

  // Handle employee click
  const handleEmployeeClick = (personData: any) => {
    const employee = employees.find(emp => emp.id === personData.id);
    if (employee) {
      setSelectedEmployee(employee);
      onDetailsOpen();
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Position', 'Department', 'Email', 'Phone', 'Employee ID', 'Status', 'Reports To', 'Join Date'],
        ...filteredEmployees.map(emp => [
          emp.name,
          emp.position || '',
          emp.department || '',
          emp.email || '',
          emp.phone || '',
          emp.employeeId || '',
          emp.status || '',
          emp.reportsTo ? filteredEmployees.find(e => e.id === emp.reportsTo)?.name || '' : 'Top Level',
          emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : ''
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `organization-chart-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchQuery || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || 
      employee.department?.toLowerCase() === selectedDepartment.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));


  if (loading) {
    return (
      <PageLayout>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Icon icon="lucide:git-branch" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Organization Chart</h1>
              <p className="text-default-600 mt-1">Visualize your company's organizational structure and hierarchy</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-default-600 mt-4">Loading organization chart...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Icon icon="lucide:git-branch" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Organization Chart</h1>
              <p className="text-default-600 mt-1">Visualize your company's organizational structure and hierarchy</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Chart</h2>
            <p className="text-default-600 mb-4">{error}</p>
            <Button color="primary" onPress={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
            <Icon icon="lucide:git-branch" className="text-foreground text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organization Chart</h1>
            <p className="text-default-600 mt-1">Visualize your company's organizational structure and hierarchy</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="lucide:download" />}
            onPress={handleExport}
          >
            Export
          </Button>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:refresh-cw" />}
            onPress={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Filters and Controls */}
        <Card>
          <CardBody>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search employees..."
                  
                  onValueChange={setSearchQuery}
                  startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  className="max-w-md"
                />
              </div>
              <div className="flex gap-4">
                <Select
                  placeholder="All Departments"
                  selectedKeys={[selectedDepartment]}
                  onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
                  className="w-48"
                >
                  <SelectItem key="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} >{dept}</SelectItem>
                  )) as any}
                </Select>
                <Tabs
                  selectedKey={viewMode}
                  onSelectionChange={(key) => setViewMode(key as "modern-chart" | "modern-list")}
                  color="primary"
                  variant="underlined"
                >
                  <Tab key="modern-chart" title="Chart View" />
                  <Tab key="modern-list" title="List View" />
                </Tabs>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Employees",
              value: employees.length,
              icon: "lucide:users",
              color: "blue",
              bgColor: "bg-primary-100 dark:bg-primary-900/20",
              textColor: "text-primary-600 dark:text-primary-400"
            },
            {
              title: "Departments",
              value: departments.length,
              icon: "lucide:building",
              color: "purple",
              bgColor: "bg-secondary-100 dark:bg-secondary-900/20",
              textColor: "text-secondary-600 dark:text-secondary-400"
            },
            {
              title: "Active",
              value: employees.filter(emp => emp.status === 'active').length,
              icon: "lucide:user-check",
              color: "green",
              bgColor: "bg-success-100 dark:bg-success-900/20",
              textColor: "text-success-600 dark:text-success-400"
            },
            {
              title: "Filtered",
              value: filteredEmployees.length,
              icon: "lucide:filter",
              color: "yellow",
              bgColor: "bg-warning-100 dark:bg-warning-900/20",
              textColor: "text-warning-600 dark:text-warning-400"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm bg-content1">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 ${stat.bgColor} rounded-full`}>
                      <Icon icon={stat.icon} className={`${stat.textColor} text-xl`} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Organization Chart */}
        <Card className="border-0 shadow-sm bg-content1">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:sitemap" className="text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Organization Structure</h2>
              </div>
              <Chip color="primary" variant="flat">
                {filteredEmployees.length} employees
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {filteredEmployees.length > 0 ? (
              <div className="min-h-[500px]">
                {viewMode === "modern-chart" ? (
                  <ModernOrgChart 
                    employees={filteredEmployees} 
                    onEmployeeClick={handleEmployeeClick}
                  />
                ) : (
                  <ModernOrgList 
                    employees={filteredEmployees} 
                    onEmployeeClick={handleEmployeeClick}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon icon="lucide:users" className="w-16 h-16 text-default-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Employees Found</h3>
                <p className="text-default-600 mb-4">
                  {searchQuery || selectedDepartment !== "all" 
                    ? "No employees match your current filters. Try adjusting your search criteria."
                    : "No employees found. Add employees to see the organization chart."
                  }
                </p>
                {(searchQuery || selectedDepartment !== "all") && (
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      setSearchQuery("");
                      setSelectedDepartment("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Employee Details Modal */}
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedEmployee?.avatar}
                      name={selectedEmployee?.name}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedEmployee?.name}
                      </h3>
                      <p className="text-sm text-default-500">
                        {selectedEmployee?.position} • {selectedEmployee?.department}
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedEmployee && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-default-600">Employee ID</label>
                          <p className="text-foreground">{selectedEmployee.employeeId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-default-600">Status</label>
                          <div className="mt-1">
                            <Chip
                              size="sm"
                              color={selectedEmployee.status === 'active' ? 'success' : 'default'}
                              variant="flat"
                            >
                              {selectedEmployee.status}
                            </Chip>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-default-600">Email</label>
                          <p className="text-foreground">{selectedEmployee.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-default-600">Phone</label>
                          <p className="text-foreground">{selectedEmployee.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-default-600">Join Date</label>
                          <p className="text-foreground">
                            {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-default-600">Direct Reports</label>
                          <p className="text-foreground">
                            {selectedEmployee.directReports?.length || 0} employees
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PageLayout>
  );
}