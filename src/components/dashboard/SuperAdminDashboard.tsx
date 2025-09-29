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
import DocumentManager from "../documents/DocumentManager";

export default function SuperAdminDashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Super Admin specific data
  const systemStats = {
    totalCompanies: 15,
    totalUsers: 1250,
    totalEmployees: 8500,
    activeSessions: 245,
    systemUptime: "99.9%",
    storageUsed: "2.3TB",
    monthlyRevenue: 125000,
    supportTickets: 23
  };

  const companyData = [
    { name: "TechCorp", employees: 450, revenue: 2500000, status: "active" },
    { name: "FinancePro", employees: 320, revenue: 1800000, status: "active" },
    { name: "HealthCare Inc", employees: 680, revenue: 3200000, status: "active" },
    { name: "EduTech", employees: 120, revenue: 800000, status: "trial" },
    { name: "RetailMax", employees: 890, revenue: 4500000, status: "active" }
  ];

  const revenueData = [
    { month: "Jan", revenue: 120000, users: 1100 },
    { month: "Feb", revenue: 135000, users: 1150 },
    { month: "Mar", revenue: 142000, users: 1200 },
    { month: "Apr", revenue: 158000, users: 1250 },
    { month: "May", revenue: 165000, users: 1300 },
    { month: "Jun", revenue: 172000, users: 1350 }
  ];

  const systemHealthData = [
    { name: "CPU Usage", value: 45, color: "#8884d8" },
    { name: "Memory Usage", value: 62, color: "#82ca9d" },
    { name: "Disk Usage", value: 38, color: "#ffc658" },
    { name: "Network", value: 28, color: "#ff7300" }
  ];

  const recentActivities = [
    { id: 1, type: "company", action: "New company registered", company: "TechStart", time: "2 hours ago", status: "success" },
    { id: 2, type: "user", action: "User account created", user: "john.doe@techstart.com", time: "3 hours ago", status: "info" },
    { id: 3, type: "system", action: "System backup completed", time: "4 hours ago", status: "success" },
    { id: 4, type: "support", action: "Support ticket resolved", ticket: "#ST-2024-001", time: "5 hours ago", status: "success" },
    { id: 5, type: "billing", action: "Payment received", company: "FinancePro", amount: "$2,500", time: "6 hours ago", status: "success" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "trial": return "warning";
      case "inactive": return "danger";
      default: return "default";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "company": return "lucide:building";
      case "user": return "lucide:user";
      case "system": return "lucide:server";
      case "support": return "lucide:headphones";
      case "billing": return "lucide:credit-card";
      default: return "lucide:activity";
    }
  };

  return (
    <div className="min-h-screen bg-content1/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl">
              <Icon icon="lucide:shield-check" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
              <p className="text-default-600 mt-1">System overview and management</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              className="font-medium"
            >
              Export Report
            </Button>
            <Button 
              color="secondary" 
              variant="flat"
              startContent={<Icon icon="lucide:settings" />}
              className="font-medium"
            >
              System Settings
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
                    <p className="text-default-500 text-sm font-medium">Total Companies</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{systemStats.totalCompanies}</p>
                    <p className="text-success-600 text-sm mt-1">+12% from last month</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Icon icon="lucide:building" className="text-primary-600 text-2xl" />
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
                    <p className="text-default-500 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{systemStats.totalUsers.toLocaleString()}</p>
                    <p className="text-success-600 text-sm mt-1">+8% from last month</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-xl">
                    <Icon icon="lucide:users" className="text-success-600 text-2xl" />
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
                    <p className="text-default-500 text-sm font-medium">Total Employees</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{systemStats.totalEmployees.toLocaleString()}</p>
                    <p className="text-success-600 text-sm mt-1">+15% from last month</p>
                  </div>
                  <div className="p-3 bg-secondary-100 rounded-xl">
                    <Icon icon="lucide:user-check" className="text-secondary-600 text-2xl" />
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
                    <p className="text-default-500 text-sm font-medium">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-foreground mt-1">${systemStats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-success-600 text-sm mt-1">+22% from last month</p>
                  </div>
                  <div className="p-3 bg-warning-100 rounded-xl">
                    <Icon icon="lucide:dollar-sign" className="text-warning-600 text-2xl" />
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
                    <h3 className="text-lg font-semibold text-foreground">Revenue & User Growth</h3>
                    <p className="text-default-500 text-sm">Monthly performance metrics</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
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
                      dataKey="revenue" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
                  <Icon icon="lucide:activity" className="text-success-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">System Health</h3>
                    <p className="text-default-500 text-sm">Current system performance</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {systemHealthData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-default-700">{item.name}</span>
                        <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                      </div>
                      <Progress 
                        value={item.value} 
                        color={item.value > 80 ? "danger" : item.value > 60 ? "warning" : "success"}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Company Performance & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:building-2" className="text-secondary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Company Performance</h3>
                    <p className="text-default-500 text-sm">Top performing companies</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {companyData.slice(0, 5).map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-content1 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={company.name.charAt(0)} 
                          className="bg-gradient-to-br from-primary-500 to-secondary-600 text-foreground"
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground">{company.name}</p>
                          <p className="text-sm text-default-500">{company.employees} employees</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${(company.revenue / 1000000).toFixed(1)}M</p>
                        <Chip 
                          size="sm" 
                          color={getStatusColor(company.status)}
                          variant="flat"
                        >
                          {company.status}
                        </Chip>
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
                    <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
                    <p className="text-default-500 text-sm">Latest system activities</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-content1 rounded-lg transition-colors">
                      <div className="p-2 bg-content2 rounded-lg">
                        <Icon 
                          icon={getActivityIcon(activity.type)} 
                          className="text-default-600 text-lg" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-default-500 mt-1">
                          {activity.company && `${activity.company} • `}
                          {activity.user && `${activity.user} • `}
                          {activity.ticket && `${activity.ticket} • `}
                          {activity.amount && `${activity.amount} • `}
                          {activity.time}
                        </p>
                      </div>
                      <Chip 
                        size="sm" 
                        color={activity.status === "success" ? "success" : "primary"}
                        variant="flat"
                      >
                        {activity.status}
                      </Chip>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Document Manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <DocumentManager
            companyBranding={{
              companyName: "HRMGO System",
              address: "123 Business Street, City, State 12345",
              phone: "+1 (555) 123-4567",
              email: "hr@hrmgo.com",
              website: "www.hrmgo.com",
              primaryColor: "#3B82F6",
              secondaryColor: "#8B5CF6"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}