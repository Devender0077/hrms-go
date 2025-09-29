import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Tooltip } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useAuth } from "../contexts/auth-context";
import { useTaskContext } from "../contexts/task-context";
import { usePermissions } from "../hooks/usePermissions";
    
    interface SidebarProps {
      isOpen: boolean;
    }
    
    interface NavItem {
      title: string;
      icon: string;
      path: string;
      badge?: number;
  permissions: string[];
    }
    
    interface NavSection {
      title: string;
      items: NavItem[];
    }
    
    export default function Sidebar({ isOpen }: SidebarProps) {
      const location = useLocation();
      const { user } = useAuth();
  const { taskCounts } = useTaskContext();
  const { hasAnyPermission, loading: permissionsLoading } = usePermissions();
      
      const navSections: NavSection[] = [
        {
          title: "Main",
          items: [
        { 
          title: "Dashboard", 
          icon: "lucide:layout-dashboard", 
          path: "/dashboard",
          permissions: ["dashboard.view"]
        },
        { 
          title: "Calendar", 
          icon: "lucide:calendar", 
          path: "/dashboard/calendar",
          permissions: ["calendar.view"]
        },
        { 
          title: "Tasks", 
          icon: "lucide:check-circle", 
          path: "/dashboard/tasks", 
          badge: taskCounts.pending + taskCounts.in_progress,
          permissions: ["tasks.view"]
        },
        { 
          title: "Organization Chart", 
          icon: "lucide:network", 
          path: "/dashboard/organization-chart",
          permissions: ["organization.view"]
        },
      ]
        },
        {
          title: "HR Management",
          items: [
            { 
              title: "Employees", 
              icon: "lucide:users", 
              path: "/dashboard/employees",
          permissions: ["employees.view"]
        },
        { 
          title: "Employee Documents", 
          icon: "lucide:file-text", 
          path: "/dashboard/employees/documents",
          permissions: ["employees.view"]
        },
        { 
          title: "Employee Salaries", 
          icon: "lucide:dollar-sign", 
          path: "/dashboard/employees/salaries",
          permissions: ["employees.view"]
        },
        { 
          title: "Employee Contracts", 
          icon: "lucide:file-signature", 
          path: "/dashboard/employees/contracts",
          permissions: ["employees.view"]
        }
      ]
    },
    {
      title: "Organization",
      items: [
            { 
              title: "Departments", 
          icon: "lucide:building-2", 
              path: "/dashboard/departments",
          permissions: ["departments.view"]
            },
            { 
              title: "Designations", 
              icon: "lucide:briefcase", 
              path: "/dashboard/designations",
          permissions: ["designations.view"]
        },
        { 
          title: "Branches", 
          icon: "lucide:map-pin", 
          path: "/dashboard/branches",
          permissions: ["branches.view"]
        },
      ]
    },
    {
      title: "Leave Management",
      items: [
        { 
          title: "Leave Overview", 
          icon: "lucide:calendar", 
          path: "/dashboard/leave",
          permissions: ["leave.view"]
        },
        { 
          title: "Leave Management", 
          icon: "lucide:calendar-heart", 
          path: "/dashboard/leave-management",
          permissions: ["leave.view"]
        },
        { 
          title: "Leave Applications", 
          icon: "lucide:calendar-days", 
          path: "/dashboard/leave/applications",
          permissions: ["leave.view"]
        },
        { 
          title: "Leave Types", 
          icon: "lucide:calendar-plus", 
          path: "/dashboard/leave/types",
          permissions: ["leave.types.manage"]
        },
        { 
          title: "Leave Balances", 
          icon: "lucide:calendar-check", 
          path: "/dashboard/leave/balances",
          permissions: ["leave.balances.view"]
        },
        { 
          title: "Leave Policies", 
          icon: "lucide:shield-check", 
          path: "/dashboard/leave/policies",
          permissions: ["leave.policies.manage"]
        },
        { 
          title: "Holidays", 
          icon: "lucide:calendar-x", 
          path: "/dashboard/leave/holidays",
          permissions: ["leave.holidays.manage"]
        },
        { 
          title: "Leave Reports", 
          icon: "lucide:bar-chart-3", 
          path: "/dashboard/leave/reports",
          permissions: ["leave.reports"]
        },
      ]
    },
    {
      title: "Timekeeping",
          items: [
            { 
          title: "Attendance", 
          icon: "lucide:clock", 
          path: "/dashboard/timekeeping/attendance",
          permissions: ["attendance.view"]
        },
        { 
          title: "Shifts", 
          icon: "lucide:clock-4", 
          path: "/dashboard/timekeeping/shifts",
          permissions: ["shifts.view"]
        },
        { 
          title: "Policies", 
          icon: "lucide:file-text", 
          path: "/dashboard/timekeeping/policies",
          permissions: ["policies.view"]
        },
        { 
          title: "Records", 
          icon: "lucide:clipboard-list", 
          path: "/dashboard/timekeeping/records",
          permissions: ["records.view"]
        },
        { 
          title: "Regulations", 
          icon: "lucide:scale", 
          path: "/dashboard/timekeeping/regulations",
          permissions: ["regulations.view"]
        },
        { 
          title: "Regularization", 
          icon: "lucide:edit-3", 
          path: "/dashboard/timekeeping/regularization",
          permissions: ["regularization.view"]
            },
          ]
        },
        {
          title: "Recruitment",
          items: [
            { 
          title: "Recruitment Overview", 
          icon: "lucide:user-search", 
          path: "/dashboard/recruitment",
          permissions: ["recruitment.view"]
        },
        { 
          title: "Jobs", 
          icon: "lucide:briefcase", 
              path: "/dashboard/jobs",
          permissions: ["jobs.view"]
            },
            { 
              title: "Candidates", 
              icon: "lucide:user-plus", 
              path: "/dashboard/candidates",
          permissions: ["candidates.view"]
            },
            { 
              title: "Interviews", 
          icon: "lucide:video", 
              path: "/dashboard/interviews",
          permissions: ["interviews.view"]
            },
          ]
        },
        {
          title: "Performance",
          items: [
            { 
              title: "Goals", 
              icon: "lucide:target", 
              path: "/dashboard/goals",
          permissions: ["goals.view"]
            },
            { 
              title: "Reviews", 
              icon: "lucide:star", 
              path: "/dashboard/reviews",
          permissions: ["reviews.view"]
            },
          ]
        },
        {
      title: "Finance",
      items: [
        { 
          title: "Payroll", 
          icon: "lucide:banknote", 
          path: "/dashboard/payroll",
          permissions: ["payroll.view"]
        },
        { 
          title: "Salary Components", 
          icon: "lucide:credit-card", 
          path: "/dashboard/payroll/salary-components",
          permissions: ["payroll.view"]
        },
        { 
          title: "Employee Salaries", 
          icon: "lucide:banknote", 
          path: "/dashboard/payroll/employee-salaries",
          permissions: ["payroll.view"]
        },
        { 
          title: "Payslips", 
          icon: "lucide:receipt", 
          path: "/dashboard/payroll/payslips",
          permissions: ["payroll.view"]
        },
        { 
          title: "Expenses", 
          icon: "lucide:receipt", 
          path: "/dashboard/expenses",
          permissions: ["expenses.view"]
        },
      ]
    },
    {
      title: "Reports",
      items: [
        { 
          title: "Income vs Expense", 
          icon: "lucide:trending-up", 
          path: "/dashboard/reports/income-expense",
          permissions: ["reports.income_expense"]
        },
        { 
          title: "Monthly Attendance", 
          icon: "lucide:calendar-check", 
          path: "/dashboard/reports/monthly-attendance",
          permissions: ["reports.attendance"]
        },
        { 
          title: "Account Statement", 
          icon: "lucide:file-text", 
          path: "/dashboard/reports/account-statement",
          permissions: ["reports.view"]
        },
        { 
          title: "Payroll Reports", 
          icon: "lucide:calculator", 
          path: "/dashboard/reports/payroll",
          permissions: ["reports.payroll"]
        },
        { 
          title: "Timesheet Reports", 
          icon: "lucide:clock", 
          path: "/dashboard/reports/timesheet",
          permissions: ["reports.view"]
        },
      ]
    },
    {
      title: "Assets & Documents",
          items: [
            { 
          title: "Asset Management", 
          icon: "lucide:package", 
              path: "/dashboard/assets",
          permissions: ["assets.view"]
            },
            { 
          title: "Asset Assignments", 
          icon: "lucide:package-check", 
              path: "/dashboard/asset-assignments",
          permissions: ["assets.assign"]
        },
        { 
          title: "Documents", 
          icon: "lucide:folder", 
          path: "/dashboard/documents",
          permissions: ["documents.view"]
        },
      ]
    },
    {
      title: "System Setup",
      items: [
        { 
          title: "HR System Setup", 
          icon: "lucide:settings-2", 
          path: "/dashboard/hr-system-setup",
          permissions: ["settings.view"]
            },
          ]
        },
        {
          title: "Administration",
          items: [
        { 
          title: "Users", 
          icon: "lucide:user-cog", 
          path: "/dashboard/users",
          permissions: ["users.view"]
        },
        { 
          title: "Roles", 
          icon: "lucide:shield-check", 
          path: "/dashboard/users/roles",
          permissions: ["users.view"]
        },
        { 
          title: "Permissions", 
          icon: "lucide:key", 
          path: "/dashboard/users/permissions",
          permissions: ["users.view"]
        },
            { 
              title: "Settings", 
              icon: "lucide:settings", 
              path: "/dashboard/settings",
          permissions: ["settings.view"]
            },
            { 
              title: "Audit Logs", 
              icon: "lucide:history", 
              path: "/dashboard/audit-logs",
          permissions: ["audit.view"]
        },
        { 
          title: "Profile", 
          icon: "lucide:user", 
          path: "/dashboard/profile",
          permissions: ["profile.view"]
            },
          ]
        }
      ];
      
  // Filter navigation items based on permissions
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (permissionsLoading) return false;
      return hasAnyPermission(item.permissions);
    })
  })).filter(section => section.items.length > 0);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (permissionsLoading) {
    return (
      <div className="h-full bg-content1 border-r border-default-300 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-default-500">Loading...</p>
        </div>
      </div>
    );
  }
      
      return (
        <aside 
      className={`bg-content1 shadow-md border-r border-default-300 transition-all duration-300 flex flex-col h-full ${
            isOpen ? "w-64" : "w-20"
      }`}
        >
          {/* Logo */}
      <div className="p-4 flex items-center justify-center h-16 border-b border-default-300">
            {isOpen ? (
          <h1 className="text-xl font-bold text-foreground">HRM<span className="text-primary-600">GO</span></h1>
            ) : (
          <h1 className="text-xl font-bold text-primary-600">HR</h1>
            )}
      </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
        {filteredNavSections.map((section, idx) => (
                <div key={idx} className="mb-6">
                  {isOpen && (
                    <p className="px-4 text-xs font-medium text-default-500 uppercase tracking-wider mb-2">
                      {section.title}
                    </p>
                  )}
                  
                  <ul>
              {section.items.map((item, itemIdx) => {
                const isActiveItem = isActive(item.path);
                      
                      return (
                        <motion.li 
                          key={itemIdx}
                          whileHover={{ x: isOpen ? 4 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isOpen ? (
                            <Link to={item.path}>
                              <Button
                          variant={isActiveItem ? "flat" : "light"}
                          color={isActiveItem ? "primary" : "default"}
                                className="justify-start w-full mb-1 rounded-lg"
                                startContent={
                                  <div className="relative">
                                    <Icon icon={item.icon} className="text-lg" />
                              {item.badge && item.badge > 0 && (
                                      <span className="absolute -top-1 -right-1 bg-danger text-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                  {item.badge > 99 ? "99+" : item.badge}
                                      </span>
                                    )}
                                  </div>
                                }
                              >
                                {item.title}
                              </Button>
                            </Link>
                          ) : (
                            <Tooltip content={item.title} placement="right">
                              <Link to={item.path}>
                                <Button
                                  isIconOnly
                            variant={isActiveItem ? "flat" : "light"}
                            color={isActiveItem ? "primary" : "default"}
                                  className="w-full mb-1 rounded-lg"
                                  aria-label={item.title}
                                >
                                  <div className="relative">
                                    <Icon icon={item.icon} className="text-lg" />
                              {item.badge && item.badge > 0 && (
                                      <span className="absolute -top-1 -right-1 bg-danger text-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                  {item.badge > 99 ? "99+" : item.badge}
                                      </span>
                                    )}
                                  </div>
                                </Button>
                              </Link>
                            </Tooltip>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
        ))}
          </nav>

      {/* System Status & Version */}
      <div className="p-4 border-t border-default-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <Icon icon="lucide:activity" className="text-foreground text-sm" />
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                System Online
              </p>
              <p className="text-xs text-default-500 truncate">
                v1.0.0
              </p>
            </div>
          )}
        </div>
      </div>
        </aside>
      );
    }