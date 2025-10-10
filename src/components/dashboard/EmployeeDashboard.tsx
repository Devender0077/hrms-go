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

export default function EmployeeDashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeStats, setEmployeeStats] = useState<any>(null);
  const [taskData, setTaskData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getEmployeeStats();
      
      if (response.success) {
        setEmployeeStats(response.employeeStats);
        setTaskData(response.taskData || []);
        setAttendanceData(response.attendanceData || []);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const upcomingEvents = [
    { id: 1, title: "Team Meeting", date: "2024-01-20", time: "10:00 AM", type: "meeting" },
    { id: 2, title: "Project Deadline", date: "2024-01-22", time: "5:00 PM", type: "deadline" },
    { id: 3, title: "Performance Review", date: "2024-01-25", time: "2:00 PM", type: "review" },
    { id: 4, title: "Training Session", date: "2024-01-28", time: "9:00 AM", type: "training" }
  ];

  const teamMembers = [
    { name: "Sarah Johnson", role: "Project Manager", avatar: "SJ", status: "online" },
    { name: "Mike Chen", role: "Developer", avatar: "MC", status: "online" },
    { name: "Lisa Park", role: "Designer", avatar: "LP", status: "away" },
    { name: "David Wilson", role: "Analyst", avatar: "DW", status: "offline" },
    { name: "Emma Davis", role: "Tester", avatar: "ED", status: "online" }
  ];

  const performanceData = [
    { month: "Jan", tasks: 8, hours: 160, rating: 4.2 },
    { month: "Feb", tasks: 12, hours: 168, rating: 4.5 },
    { month: "Mar", tasks: 10, hours: 165, rating: 4.3 },
    { month: "Apr", tasks: 15, hours: 170, rating: 4.7 },
    { month: "May", tasks: 18, hours: 175, rating: 4.8 },
    { month: "Jun", tasks: 20, hours: 180, rating: 4.9 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "in-progress": return "primary";
      case "pending": return "warning";
      case "present": return "success";
      case "late": return "warning";
      case "absent": return "danger";
      default: return "default";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting": return "lucide:users";
      case "deadline": return "lucide:clock";
      case "review": return "lucide:star";
      case "training": return "lucide:book-open";
      default: return "lucide:calendar";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting": return "blue";
      case "deadline": return "red";
      case "review": return "yellow";
      case "training": return "green";
      default: return "gray";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroSection
          title="Employee Dashboard"
          subtitle="Your Personal Overview"
          description="Track your tasks, monitor your performance, and stay connected with your team. Here's your personal workspace overview."
          icon="lucide:user"
          illustration="dashboard"
          actions={[
            {
              label: "Check In/Out",
              icon: "lucide:clock",
              onPress: () => console.log("Check in/out"),
              variant: "bordered"
            },
            {
              label: "Request Leave",
              icon: "lucide:calendar",
              onPress: () => console.log("Request leave"),
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
                    <p className="text-default-500 text-xs sm:text-sm font-medium">Tasks Completed</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{employeeStats.completedTasks}/{employeeStats.totalTasks}</p>
                    <p className="text-success-600 text-xs sm:text-sm mt-1">67% completion rate</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <Icon icon="lucide:check-circle" className="text-primary-600 text-xl sm:text-2xl" />
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
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{employeeStats.attendanceRate}%</p>
                    <p className="text-success-600 text-xs sm:text-sm mt-1">Excellent attendance</p>
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
                    <p className="text-default-500 text-xs sm:text-sm font-medium">Leave Balance</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{employeeStats.leaveBalance}</p>
                    <p className="text-primary-600 text-xs sm:text-sm mt-1">Days remaining</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                    <Icon icon="lucide:calendar-days" className="text-warning-600 text-xl sm:text-2xl" />
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
                    <p className="text-default-500 text-xs sm:text-sm font-medium">Upcoming Events</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{employeeStats.upcomingEvents}</p>
                    <p className="text-secondary-600 text-xs sm:text-sm mt-1">This week</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl">
                    <Icon icon="lucide:calendar" className="text-secondary-600 text-xl sm:text-2xl" />
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
                    <h3 className="text-lg font-semibold text-foreground">Performance Trends</h3>
                    <p className="text-default-500 text-sm">Monthly task completion and ratings</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={performanceData}>
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
                      dataKey="tasks" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Bar dataKey="rating" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
                  <Icon icon="lucide:clock" className="text-success-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Weekly Attendance</h3>
                    <p className="text-default-500 text-sm">Your attendance this week</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {attendanceData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-content1 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-default-700">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-default-500">
                          {day.checkIn} - {day.checkOut}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{day.hours}h</span>
                        <Chip 
                          size="sm" 
                          color={getStatusColor(day.status)}
                          variant="flat"
                        >
                          {day.status}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Tasks & Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:list-checks" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">My Tasks</h3>
                    <p className="text-default-500 text-sm">Current tasks and progress</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {taskData.map((task) => (
                    <div key={task.id} className="p-4 bg-content1 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground">{task.title}</h4>
                        <Chip 
                          size="sm" 
                          color={getPriorityColor(task.priority)}
                          variant="flat"
                        >
                          {task.priority}
                        </Chip>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-default-500">
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress 
                          value={task.progress}
                          color={task.progress === 100 ? "success" : task.progress > 50 ? "primary" : "warning"}
                          className="h-2"
                        />
                        <div className="flex justify-between items-center">
                          <Chip 
                            size="sm" 
                            color={getStatusColor(task.status)}
                            variant="flat"
                          >
                            {task.status}
                          </Chip>
                          <Button size="sm" variant="flat" color="primary">
                            View
                          </Button>
                        </div>
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
                  <Icon icon="lucide:calendar" className="text-secondary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
                    <p className="text-default-500 text-sm">Your schedule this week</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-content1 rounded-lg">
                      <div className={`p-2 bg-${getEventColor(event.type)}-100 rounded-lg`}>
                        <Icon 
                          icon={getEventIcon(event.type)} 
                          className={`text-${getEventColor(event.type)}-600 text-lg`} 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <p className="text-sm text-default-500">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })} at {event.time}
                        </p>
                      </div>
                      <Chip 
                        size="sm" 
                        color={getEventColor(event.type) as any}
                        variant="flat"
                      >
                        {event.type}
                      </Chip>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:users" className="text-success-600 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
                  <p className="text-default-500 text-sm">Your team and their status</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="p-4 bg-content1 rounded-lg text-center">
                    <div className="relative">
                      <Avatar 
                        name={member.avatar} 
                        className="bg-gradient-to-br from-primary-500 to-secondary-600 text-foreground mx-auto mb-3"
                        size="lg"
                      />
                      <div className={`absolute bottom-2 right-2 w-3 h-3 rounded-full border-2 border-background ${
                        member.status === 'online' ? 'bg-success' : 
                        member.status === 'away' ? 'bg-warning' : 'bg-default-400'
                      }`}></div>
                    </div>
                    <h4 className="font-semibold text-foreground">{member.name}</h4>
                    <p className="text-sm text-default-600">{member.role}</p>
                    <Chip 
                      size="sm" 
                      color={member.status === 'online' ? 'success' : member.status === 'away' ? 'warning' : 'default'}
                      variant="flat"
                      className="mt-2"
                    >
                      {member.status}
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