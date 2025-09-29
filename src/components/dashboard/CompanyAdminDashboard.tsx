import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Avatar,
  Chip,
  Progress,
  Badge,
  Divider,
  Spacer,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from "recharts";
import { motion } from "framer-motion";

export default function CompanyAdminDashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Company Admin specific data
  const companyStats = {
    totalEmployees: 245,
    activeEmployees: 230,
    newHires: 12,
    departures: 3,
    attendanceRate: 94.5,
    leaveRequests: 8,
    pendingApprovals: 15,
    departmentCount: 8
  };

  const departmentData = [
    { name: "Engineering", employees: 85, budget: 1200000, utilization: 92 },
    { name: "Marketing", employees: 32, budget: 450000, utilization: 88 },
    { name: "Sales", employees: 45, budget: 600000, utilization: 95 },
    { name: "HR", employees: 18, budget: 280000, utilization: 85 },
    { name: "Finance", employees: 25, budget: 350000, utilization: 90 },
    { name: "Operations", employees: 40, budget: 500000, utilization: 87 }
  ];

  const attendanceData = [
    { month: "Jan", present: 220, absent: 25, late: 15 },
    { month: "Feb", present: 225, absent: 20, late: 12 },
    { month: "Mar", present: 230, absent: 15, late: 10 },
    { month: "Apr", present: 235, absent: 10, late: 8 },
    { month: "May", present: 230, absent: 15, late: 12 },
    { month: "Jun", present: 240, absent: 5, late: 5 }
  ];

  const pendingApprovals = [
    { id: 1, type: "leave", employee: "John Doe", department: "Engineering", days: 3, status: "pending" },
    { id: 2, type: "expense", employee: "Jane Smith", department: "Marketing", amount: 450, status: "pending" },
    { id: 3, type: "overtime", employee: "Mike Johnson", department: "Sales", hours: 8, status: "pending" },
    { id: 4, type: "leave", employee: "Sarah Wilson", department: "HR", days: 5, status: "pending" },
    { id: 5, type: "expense", employee: "David Brown", department: "Finance", amount: 320, status: "pending" }
  ];

  const recentHires = [
    { name: "Alex Chen", position: "Senior Developer", department: "Engineering", startDate: "2024-01-15", status: "active" },
    { name: "Lisa Park", position: "Marketing Manager", department: "Marketing", startDate: "2024-01-10", status: "active" },
    { name: "Tom Wilson", position: "Sales Executive", department: "Sales", startDate: "2024-01-08", status: "active" },
    { name: "Emma Davis", position: "HR Specialist", department: "HR", startDate: "2024-01-05", status: "active" }
  ];

  const getApprovalIcon = (type: string) => {
    switch (type) {
      case "leave": return "lucide:calendar";
      case "expense": return "lucide:receipt";
      case "overtime": return "lucide:clock";
      default: return "lucide:file-check";
    }
  };

  const getApprovalColor = (type: string) => {
    switch (type) {
      case "leave": return "blue";
      case "expense": return "green";
      case "overtime": return "orange";
      default: return "gray";
    }
  };

  return (
    <div className="min-h-screen bg-content1/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-success-500 to-primary-600 rounded-xl">
              <Icon icon="lucide:building-2" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Company Admin Dashboard</h1>
              <p className="text-default-600 mt-1">Manage your organization and employees</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:user-plus" />}
              className="font-medium"
            >
              Add Employee
            </Button>
            <Button 
              color="secondary" 
              variant="flat"
              startContent={<Icon icon="lucide:bar-chart" />}
              className="font-medium"
            >
              View Reports
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-sm font-medium">Total Employees</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{companyStats.totalEmployees}</p>
                    <p className="text-success-600 text-sm mt-1">+{companyStats.newHires} new hires</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Icon icon="lucide:users" className="text-primary-600 text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-sm font-medium">Attendance Rate</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{companyStats.attendanceRate}%</p>
                    <p className="text-success-600 text-sm mt-1">+2.1% from last month</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-xl">
                    <Icon icon="lucide:user-check" className="text-success-600 text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-sm font-medium">Pending Approvals</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{companyStats.pendingApprovals}</p>
                    <p className="text-warning-600 text-sm mt-1">Requires attention</p>
                  </div>
                  <div className="p-3 bg-warning-100 rounded-xl">
                    <Icon icon="lucide:clock" className="text-warning-600 text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-sm font-medium">Departments</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{companyStats.departmentCount}</p>
                    <p className="text-primary-600 text-sm mt-1">Active departments</p>
                  </div>
                  <div className="p-3 bg-secondary-100 rounded-xl">
                    <Icon icon="lucide:building" className="text-secondary-600 text-2xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:trending-up" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Attendance Trends</h3>
                    <p className="text-default-500 text-sm">Monthly attendance overview</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="present" 
                      fill="#10b981" 
                      fillOpacity={0.1}
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:pie-chart" className="text-secondary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Department Distribution</h3>
                    <p className="text-default-500 text-sm">Employee count by department</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="employees"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Department Performance & Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:bar-chart-3" className="text-success-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Department Performance</h3>
                    <p className="text-default-500 text-sm">Budget utilization by department</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-default-700">{dept.name}</span>
                        <span className="text-sm font-semibold text-foreground">{dept.utilization}%</span>
                      </div>
                      <Progress 
                        value={dept.utilization} 
                        color={dept.utilization > 90 ? "success" : dept.utilization > 80 ? "warning" : "danger"}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-default-500">
                        <span>{dept.employees} employees</span>
                        <span>${(dept.budget / 1000).toFixed(0)}k budget</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:clock" className="text-warning-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Pending Approvals</h3>
                    <p className="text-default-500 text-sm">Items requiring your attention</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 bg-content1 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${getApprovalColor(approval.type)}-100 rounded-lg`}>
                          <Icon 
                            icon={getApprovalIcon(approval.type)} 
                            className={`text-${getApprovalColor(approval.type)}-600 text-lg`} 
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{approval.employee}</p>
                          <p className="text-sm text-default-500">{approval.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {approval.type === 'leave' && `${approval.days} days`}
                          {approval.type === 'expense' && `$${approval.amount}`}
                          {approval.type === 'overtime' && `${approval.hours}h`}
                        </p>
                        <Chip 
                          size="sm" 
                          color="warning"
                          variant="flat"
                        >
                          {approval.status}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Recent Hires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:user-plus" className="text-primary-600 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Recent Hires</h3>
                  <p className="text-default-500 text-sm">New employees this month</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentHires.map((hire, index) => (
                  <div key={index} className="p-4 bg-content1 rounded-lg text-center">
                    <Avatar 
                      name={hire.name} 
                      className="bg-gradient-to-br from-primary-500 to-secondary-600 text-foreground mx-auto mb-3"
                      size="lg"
                    />
                    <h4 className="font-semibold text-foreground">{hire.name}</h4>
                    <p className="text-sm text-default-600">{hire.position}</p>
                    <p className="text-xs text-default-500 mt-1">{hire.department}</p>
                    <Chip 
                      size="sm" 
                      color="success"
                      variant="flat"
                      className="mt-2"
                    >
                      {hire.status}
                    </Chip>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}