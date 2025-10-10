import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Avatar,
  Progress,
  useDisclosure,
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import HeroSection from "../common/HeroSection";
import { useTranslation } from "../../contexts/translation-context";
import { useAuth } from "../../contexts/auth-context";
import { dashboardService, DashboardStats } from "../../services/dashboard-service";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api-service";

interface Activity {
  id: number;
  action: string;
  user_email: string;
  created_at: string;
  entity_type?: string;
}

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  
  const [systemStats, setSystemStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Current user:', user);
        console.log('🔍 User role:', user?.role);

        const userRole = user?.role?.toLowerCase();
        if (userRole === 'super_admin' || userRole === 'superadmin' || userRole === 'super admin') {
          console.log('✅ Access granted for role:', user?.role);
          
          const stats = await dashboardService.getSuperAdminStats();
          setSystemStats(stats);

          // Load recent activities
          try {
            const activitiesResponse = await apiRequest('/audit-logs?limit=5', { method: 'GET' });
            if (activitiesResponse.success && activitiesResponse.data) {
              setRecentActivities(activitiesResponse.data);
            }
          } catch (err) {
            console.error('Error loading activities:', err);
          }
        } else {
          console.error('❌ Access denied. User role:', user?.role);
          throw new Error(`Access denied. Super admin role required. Current role: ${user?.role}`);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        
        setSystemStats({
          totalCompanies: 15,
          totalUsers: 1250,
          totalEmployees: 8500,
          recentActivity: 245,
          systemUptime: "99.9%"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Export dashboard report
  const handleExportReport = () => {
    const data = {
      generated_at: new Date().toISOString(),
      stats: systemStats,
      recent_activities: recentActivities
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getActivityIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return "lucide:plus-circle";
    if (actionLower.includes('update') || actionLower.includes('edit')) return "lucide:edit";
    if (actionLower.includes('delete')) return "lucide:trash";
    if (actionLower.includes('login')) return "lucide:log-in";
    if (actionLower.includes('logout')) return "lucide:log-out";
    return "lucide:activity";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <HeroSection
            title={t("Super Admin Dashboard")}
            subtitle={t("System Configuration")}
            description={t("Manage system users, roles, and permissions")}
            icon="lucide:shield-check"
          />
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" label={t('common.loading')} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <HeroSection
            title={t("Super Admin Dashboard")}
            subtitle={t("System Configuration")}
            description={t("Manage system users, roles, and permissions")}
            icon="lucide:shield-check"
          />
          <Card className="border-2 border-danger-200 bg-danger-50">
            <CardBody className="text-center py-8">
              <Icon icon="lucide:alert-circle" className="text-danger-500 text-5xl mb-4 mx-auto" />
              <p className="text-danger-700 font-medium">{error}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroSection
          title={t("Super Admin Dashboard")}
          subtitle={t("System Configuration")}
          description={t("Comprehensive system overview and management controls")}
          icon="lucide:shield-check"
          illustration="dashboard"
          actions={[
            {
              label: t("Export Report"),
              icon: "lucide:download",
              onPress: handleExportReport,
              color: "primary" as const
            }
          ]}
        />

        {/* 1. Organization Overview - Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={() => navigate('/dashboard/employees')}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Total Employees")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{systemStats.totalEmployees?.toLocaleString() || '0'}</p>
                    <p className="text-success-600 text-xs mt-1">+5% {t("vs last month")}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Icon icon="lucide:users" className="text-primary-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={() => navigate('/dashboard/organization/departments')}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Total Departments")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">12</p>
                    <p className="text-success-600 text-xs mt-1">+2 {t("this month")}</p>
                  </div>
                  <div className="p-3 bg-secondary-100 rounded-xl">
                    <Icon icon="lucide:building-2" className="text-secondary-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={() => navigate('/dashboard/organization/branches')}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Total Branches")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">8</p>
                    <p className="text-primary-600 text-xs mt-1">{t("Across regions")}</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-xl">
                    <Icon icon="lucide:map-pin" className="text-success-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={() => navigate('/dashboard/timekeeping/attendance')}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Attendance Rate")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">94.5%</p>
                    <p className="text-success-600 text-xs mt-1">+2.3% {t("today")}</p>
                  </div>
                  <div className="p-3 bg-warning-100 rounded-xl">
                    <Icon icon="lucide:calendar-check" className="text-warning-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={() => navigate('/dashboard/users')}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Active Users")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{systemStats.activeUsers?.toLocaleString() || '0'}</p>
                    <p className="text-primary-600 text-xs mt-1">{t("Currently online")}</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-xl">
                    <Icon icon="lucide:user-check" className="text-success-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={() => navigate('/dashboard/organization/designations')}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Designations")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">45</p>
                    <p className="text-default-500 text-xs mt-1">{t("Job titles")}</p>
                  </div>
                  <div className="p-3 bg-secondary-100 rounded-xl">
                    <Icon icon="lucide:briefcase" className="text-secondary-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Monthly Joinees")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">24</p>
                    <p className="text-success-600 text-xs mt-1">+8 {t("vs last month")}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Icon icon="lucide:user-plus" className="text-primary-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-default-500 text-xs font-medium">{t("Monthly Exits")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">8</p>
                    <p className="text-danger-600 text-xs mt-1">-3 {t("vs last month")}</p>
                  </div>
                  <div className="p-3 bg-danger-100 rounded-xl">
                    <Icon icon="lucide:user-minus" className="text-danger-600 text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* 2. Payroll & Finance Summary + 3. Attendance & Leave Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:dollar-sign" className="text-success-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{t("Payroll & Finance")}</h3>
                    <p className="text-default-500 text-sm">{t("Monthly payroll summary")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-4">
                <div className="p-4 bg-success-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-default-700">{t("Total Monthly Payroll")}</span>
                    <Icon icon="lucide:trending-up" className="text-success-600" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">$245,000</p>
                  <p className="text-xs text-default-500 mt-1">+3.5% {t("vs last month")}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">{t("Salaries Paid")}</span>
                    <span className="text-sm font-semibold text-success-600">85%</span>
                  </div>
                  <Progress value={85} color="success" size="sm" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">{t("Pending Payslips")}</span>
                    <span className="text-sm font-semibold text-warning-600">12</span>
                  </div>
                  
                  <Button
                    size="sm"
                    color="success"
                    variant="flat"
                    className="w-full"
                    startContent={<Icon icon="lucide:dollar-sign" />}
                    onClick={() => navigate('/payroll')}
                  >
                    {t("Manage Payroll")}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:calendar-check" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{t("Attendance & Leave")}</h3>
                    <p className="text-default-500 text-sm">{t("Today's attendance insights")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-3 bg-success-50 rounded-lg">
                    <Icon icon="lucide:check-circle" className="text-success-600 text-xl mx-auto mb-1" />
                    <p className="text-lg font-bold text-success-600">420</p>
                    <p className="text-xs text-default-500">{t("Present")}</p>
                  </div>
                  <div className="text-center p-3 bg-danger-50 rounded-lg">
                    <Icon icon="lucide:x-circle" className="text-danger-600 text-xl mx-auto mb-1" />
                    <p className="text-lg font-bold text-danger-600">15</p>
                    <p className="text-xs text-default-500">{t("Absent")}</p>
                  </div>
                  <div className="text-center p-3 bg-warning-50 rounded-lg">
                    <Icon icon="lucide:plane" className="text-warning-600 text-xl mx-auto mb-1" />
                    <p className="text-lg font-bold text-warning-600">28</p>
                    <p className="text-xs text-default-500">{t("On Leave")}</p>
                  </div>
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <Icon icon="lucide:home" className="text-primary-600 text-xl mx-auto mb-1" />
                    <p className="text-lg font-bold text-primary-600">45</p>
                    <p className="text-xs text-default-500">{t("Remote")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">{t("Late Check-ins")}</span>
                    <span className="text-sm font-semibold text-warning-600">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">{t("Pending Leave Requests")}</span>
                    <span className="text-sm font-semibold text-primary-600">15</span>
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="w-full"
                    startContent={<Icon icon="lucide:calendar" />}
                    onClick={() => navigate('/timekeeping/attendance')}
                  >
                    {t("View Attendance")}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* 4. Employee Management Insights + 5. System & Module Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:user-cog" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{t("Employee Management")}</h3>
                    <p className="text-default-500 text-sm">{t("Recent employee activities")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:user-plus" className="text-success-600 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-default-700">{t("New Joinees")}</p>
                      <p className="text-xs text-default-500">{t("Last 7 days")}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-success-600">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:user-minus" className="text-danger-600 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-default-700">{t("Exiting Employees")}</p>
                      <p className="text-xs text-default-500">{t("In notice period")}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-danger-600">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:clock" className="text-warning-600 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-default-700">{t("Pending Approvals")}</p>
                      <p className="text-xs text-default-500">{t("Require action")}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-warning-600">7</span>
                </div>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="w-full"
                  startContent={<Icon icon="lucide:users" />}
                  onClick={() => navigate('/employees')}
                >
                  {t("Manage Employees")}
                </Button>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:server" className="text-secondary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{t("System & Modules")}</h3>
                    <p className="text-default-500 text-sm">{t("System health & modules status")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-success-50 rounded-lg text-center">
                    <Icon icon="lucide:check-circle" className="text-success-600 text-2xl mx-auto mb-1" />
                    <p className="text-sm font-semibold text-success-600">8 {t("Active")}</p>
                    <p className="text-xs text-default-500">{t("Modules")}</p>
                  </div>
                  <div className="p-3 bg-default-100 rounded-lg text-center">
                    <Icon icon="lucide:pause-circle" className="text-default-600 text-2xl mx-auto mb-1" />
                    <p className="text-sm font-semibold text-default-600">2 {t("Disabled")}</p>
                    <p className="text-xs text-default-500">{t("Modules")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">{t("Database Size")}</span>
                    <span className="text-sm font-semibold text-primary-600">2.4 GB</span>
                  </div>
                  <Progress value={35} color="primary" size="sm" aria-label="Database usage" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">{t("Last Backup")}</span>
                    <span className="text-sm font-semibold text-success-600">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">{t("System Uptime")}</span>
                    <span className="text-sm font-semibold text-success-600">{systemStats.systemUptime || '99.9%'}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* 7. Security & Audit Logs + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:shield-alert" className="text-danger-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{t("Security & Audit")}</h3>
                      <p className="text-default-500 text-sm">{t("System security overview")}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={() => navigate('/audit-logs')}
                  >
                    {t("View All")}
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:log-in" className="text-success-600 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-default-700">{t("Successful Logins")}</p>
                      <p className="text-xs text-default-500">{t("Last 24 hours")}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-success-600">245</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:shield-x" className="text-danger-600 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-default-700">{t("Failed Login Attempts")}</p>
                      <p className="text-xs text-default-500">{t("Last 24 hours")}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-danger-600">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:activity" className="text-primary-600 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-default-700">{t("System Changes")}</p>
                      <p className="text-xs text-default-500">{t("Admin actions")}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary-600">{systemStats.recentActivity?.toLocaleString() || '0'}</span>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:clock" className="text-warning-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{t("Recent Activities")}</h3>
                      <p className="text-default-500 text-sm">{t("System activity log")}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-content1 rounded-lg transition-colors">
                        <div className="p-2 bg-content2 rounded-lg">
                          <Icon 
                            icon={getActivityIcon(activity.action)} 
                            className="text-default-600 text-base" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.action}</p>
                          <p className="text-xs text-default-500 mt-1">
                            {activity.user_email && `${activity.user_email} • `}
                            {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-default-400">
                      <Icon icon="lucide:activity" className="text-4xl mb-2" />
                      <p>{t("No recent activities")}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* 8. Quick Actions / Admin Shortcuts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:zap" className="text-warning-600 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t("Quick Actions")}</h3>
                  <p className="text-default-500 text-sm">{t("Fast access to admin operations")}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="primary"
                  onClick={() => {
                    console.log('🔘 Navigate to /employees');
                    navigate('/employees');
                  }}
                >
                  <Icon icon="lucide:user-plus" className="text-xl" />
                  <span className="text-xs font-medium">{t("Add Employee")}</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="secondary"
                  onClick={() => {
                    console.log('🔘 Navigate to /organization/branches');
                    navigate('/organization/branches');
                  }}
                >
                  <Icon icon="lucide:building" className="text-xl" />
                  <span className="text-xs font-medium">{t("Add Branch")}</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="success"
                  onClick={() => {
                    console.log('🔘 Navigate to /payroll');
                    navigate('/payroll');
                  }}
                >
                  <Icon icon="lucide:dollar-sign" className="text-xl" />
                  <span className="text-xs font-medium">{t("Generate Payroll")}</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="warning"
                  onClick={() => {
                    console.log('🔘 Navigate to /timekeeping/attendance');
                    navigate('/timekeeping/attendance');
                  }}
                >
                  <Icon icon="lucide:refresh-cw" className="text-xl" />
                  <span className="text-xs font-medium">{t("Sync Attendance")}</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="primary"
                  onClick={() => {
                    console.log('🔘 Navigate to /users');
                    navigate('/users');
                  }}
                >
                  <Icon icon="lucide:users" className="text-xl" />
                  <span className="text-xs font-medium">{t("Manage Users")}</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="secondary"
                  onClick={() => {
                    console.log('🔘 Navigate to /roles');
                    navigate('/roles');
                  }}
                >
                  <Icon icon="lucide:shield" className="text-xl" />
                  <span className="text-xs font-medium">{t("Manage Roles")}</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="success"
                  onClick={() => {
                    console.log('🔘 Navigate to /settings');
                    navigate('/settings');
                  }}
                >
                  <Icon icon="lucide:settings" className="text-xl" />
                  <span className="text-xs font-medium">{t("System Settings")}</span>
                </Button>
                <Button
                  className="h-20 flex-col gap-1"
                  variant="flat"
                  color="warning"
                  onClick={() => {
                    console.log('🔘 Export reports');
                    handleExportReport();
                  }}
                >
                  <Icon icon="lucide:download" className="text-xl" />
                  <span className="text-xs font-medium">{t("Export Reports")}</span>
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* 9. Notifications & System Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:bell" className="text-primary-600 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t("System Alerts & Notifications")}</h3>
                  <p className="text-default-500 text-sm">{t("Important system notifications")}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-warning-50 rounded-lg">
                  <Icon icon="lucide:alert-triangle" className="text-warning-600 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-default-700">{t("Pending System Update")}</p>
                    <p className="text-xs text-default-500 mt-1">{t("Version 3.1.0 available for installation")}</p>
                  </div>
                  <Button size="sm" variant="flat" color="warning">{t("Update")}</Button>
                </div>
                <div className="flex items-start gap-3 p-3 bg-success-50 rounded-lg">
                  <Icon icon="lucide:check-circle" className="text-success-600 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-default-700">{t("Backup Completed")}</p>
                    <p className="text-xs text-default-500 mt-1">{t("Automatic backup completed successfully")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                  <Icon icon="lucide:info" className="text-primary-600 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-default-700">{t("15 Pending Leave Approvals")}</p>
                    <p className="text-xs text-default-500 mt-1">{t("Require manager attention")}</p>
                  </div>
                  <Button size="sm" variant="flat" color="primary" onClick={() => navigate('/leave')}>{t("Review")}</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
