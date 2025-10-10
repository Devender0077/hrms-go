import React, { useState, useEffect } from "react";
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
  useDisclosure,
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../common/HeroSection";
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
import { dashboardService } from "../../services/dashboard-service";
import { useTranslation } from "../../contexts/translation-context";

export default function CompanyAdminDashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyStats, setCompanyStats] = useState<any>(null);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getCompanyAdminStats();
      
      if (response.success) {
        setCompanyStats(response.companyStats);
        setDepartmentData(response.departmentData || []);
        setAttendanceData(response.attendanceTrend || []);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center p-6">
            <Icon icon="lucide:alert-circle" className="text-danger text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('common.error')}</h3>
            <p className="text-default-500 mb-4">{error}</p>
            <Button color="primary" onClick={loadDashboardData}>
              {t('common.retry')}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroSection
          title={t('companyAdmin.dashboard')}
          subtitle={t('companyAdmin.companyOverview')}
          description="Monitor your company's HR operations, track performance metrics, and oversee employee activities from this comprehensive dashboard."
          icon="lucide:building-2"
          illustration="dashboard"
          actions={[
            {
              label: t('companyAdmin.quickReports'),
              icon: "lucide:bar-chart-3",
              onPress: () => navigate('/dashboard/reports'),
              variant: "bordered"
            },
            {
              label: t('companyAdmin.exportData'),
              icon: "lucide:download",
              onPress: () => console.log("Export data"),
              variant: "flat"
            }
          ]}
        />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-content1 dark:bg-content1">
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs sm:text-sm font-medium">{t('companyAdmin.totalEmployees')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{companyStats?.totalEmployees || 0}</p>
                    <p className="text-success-600 text-xs sm:text-sm mt-1">+{companyStats?.newHires || 0} {t('companyAdmin.newHires')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <Icon icon="lucide:users" className="text-primary-600 text-xl sm:text-2xl" />
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
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-content1 dark:bg-content1">
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs sm:text-sm font-medium">Attendance Rate</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{companyStats.attendanceRate}%</p>
                    <p className="text-success-600 text-xs sm:text-sm mt-1">+2.1% from last month</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                    <Icon icon="lucide:user-check" className="text-success-600 text-xl sm:text-2xl" />
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
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-content1 dark:bg-content1">
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs sm:text-sm font-medium">Pending Approvals</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{companyStats.pendingApprovals}</p>
                    <p className="text-warning-600 text-xs sm:text-sm mt-1">Requires attention</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                    <Icon icon="lucide:clock" className="text-warning-600 text-xl sm:text-2xl" />
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
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-content1 dark:bg-content1">
              <CardBody className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs sm:text-sm font-medium">Departments</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{companyStats.departmentCount}</p>
                    <p className="text-primary-600 text-xs sm:text-sm mt-1">Active departments</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl">
                    <Icon icon="lucide:building" className="text-secondary-600 text-xl sm:text-2xl" />
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