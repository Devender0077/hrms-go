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
import HeroSection from "../common/HeroSection";
import { useTranslation } from "../../contexts/translation-context";

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <HeroSection
          title={t("Super Admin Dashboard")}
          subtitle={t("System Configuration")}
          description={t("Manage system users, roles, and permissions. Control access levels, assign roles, and maintain security across your HRMS platform.")}
          icon="lucide:shield-check"
          illustration="dashboard"
          actions={[
            {
              label: t("Export Report"),
              icon: "lucide:download",
              onPress: () => console.log("Export Report"),
              color: "primary" as const
            },
            {
              label: t("Settings"),
              icon: "lucide:settings",
              onPress: () => console.log("System Settings"),
              variant: "bordered" as const
            }
          ]}
        />

        {/* Legacy Hero Section - to be removed */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-6 sm:p-8 text-white mb-6" style={{display: 'none'}}>
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 -left-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Text Content */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Icon icon="lucide:shield-check" className="text-white text-2xl" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    Super Admin Dashboard
                  </h1>
                </div>
                <p className="text-white/90 text-sm sm:text-base mb-6 max-w-lg">
                  System overview and management. Monitor performance, manage users, and track system health in real-time.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    color="default"
                    variant="solid"
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                    startContent={<Icon icon="lucide:download" className="w-4 h-4" />}
                  >
                    Export Report
                  </Button>
                  <Button
                    color="default"
                    variant="bordered"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                    startContent={<Icon icon="lucide:settings" className="w-4 h-4" />}
                  >
                    System Settings
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Illustration */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Main illustration container */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Dashboard elements */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon icon="lucide:users" className="text-white text-xl" />
                      </div>
                      <div className="w-16 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon icon="lucide:chart-bar" className="text-white text-xl" />
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon icon="lucide:server" className="text-white text-xl" />
                      </div>
                    </div>
                    
                    {/* Connection lines */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-0.5 bg-white/30"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <div className="w-8 h-0.5 bg-white/30"></div>
                    </div>
                    
                    {/* Bottom elements */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:trending-up" className="text-white text-lg" />
                      </div>
                      <div className="w-14 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:activity" className="text-white text-lg" />
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:target" className="text-white text-lg" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:sparkles" className="text-white text-xs" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:zap" className="text-white text-xs" />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 4) * 15}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-default-500 dark:text-default-400 text-xs sm:text-sm font-medium">{t("Total Companies")}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">{systemStats.totalCompanies}</p>
                    <p className="text-success-600 dark:text-success-400 text-xs sm:text-sm mt-1">{t("+12% from last month")}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex-shrink-0">
                    <Icon icon="lucide:building" className="text-primary-600 dark:text-primary-400 text-lg sm:text-xl lg:text-2xl" />
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
                    <p className="text-default-500 text-sm font-medium">{t("Total Users")}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{systemStats.totalUsers.toLocaleString()}</p>
                    <p className="text-success-600 text-sm mt-1">{t("+8% from last month")}</p>
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
                    <p className="text-default-500 text-sm font-medium">{t("Total Employees")}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{systemStats.totalEmployees.toLocaleString()}</p>
                    <p className="text-success-600 text-sm mt-1">{t("+15% from last month")}</p>
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
                    <p className="text-default-500 text-sm font-medium">{t("Monthly Revenue")}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">${systemStats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-success-600 text-sm mt-1">+22% {t("from last month")}</p>
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
                    <h3 className="text-lg font-semibold text-foreground">{t("Monthly Revenue")} & {t("Total Users")}</h3>
                    <p className="text-default-500 text-sm">{t("Monthly performance metrics")}</p>
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
                    <h3 className="text-lg font-semibold text-foreground">{t("System Health")}</h3>
                    <p className="text-default-500 text-sm">{t("Current system performance")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {systemHealthData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-default-700">{t(item.name)}</span>
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
                    <h3 className="text-lg font-semibold text-foreground">{t("Company Overview")}</h3>
                    <p className="text-default-500 text-sm">{t("Top performing companies")}</p>
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
                    <h3 className="text-lg font-semibold text-foreground">{t("Recent Activities")}</h3>
                    <p className="text-default-500 text-sm">{t("System activity log")}</p>
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