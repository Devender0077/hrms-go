import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/auth-context";
import { useTaskContext } from "../contexts/task-context";
    
    interface SidebarProps {
      isOpen: boolean;
    }
    
    interface NavItem {
      title: string;
      icon: string;
      path: string;
      badge?: number;
      roles?: string[];
    }
    
    interface NavSection {
      title: string;
      items: NavItem[];
    }
    
export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { taskCounts } = useTaskContext();
      
      const navSections: NavSection[] = [
        {
          title: "Main",
          items: [
            { title: "Dashboard", icon: "lucide:layout-dashboard", path: "/dashboard" },
            { title: "Calendar", icon: "lucide:calendar", path: "/dashboard/calendar" },
            { title: "Tasks", icon: "lucide:check-circle", path: "/dashboard/tasks", badge: taskCounts.pending + taskCounts.in_progress },
            { title: "Organization Chart", icon: "lucide:network", path: "/dashboard/organization-chart" },
          ]
        },
        {
          title: "HR Management",
          items: [
            { 
              title: "Employees", 
              icon: "lucide:users", 
              path: "/dashboard/employees",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Departments", 
              icon: "lucide:building", 
              path: "/dashboard/departments",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Designations", 
              icon: "lucide:briefcase", 
              path: "/dashboard/designations",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Branches", 
              icon: "lucide:map-pin", 
              path: "/dashboard/branches",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { title: "Attendance", icon: "lucide:clock", path: "/dashboard/attendance" },
            { title: "Leave", icon: "lucide:calendar-off", path: "/dashboard/leave" },
            { 
              title: "Leave Management", 
              icon: "lucide:calendar-days", 
              path: "/dashboard/leave-management",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
          ]
        },
        {
          title: "Finance",
          items: [
            { 
              title: "Payroll", 
              icon: "lucide:credit-card", 
              path: "/dashboard/payroll",
              roles: ["super_admin", "company_admin", "finance_manager"]
            },
            { 
              title: "Expenses", 
              icon: "lucide:receipt", 
              path: "/dashboard/expenses",
              roles: ["super_admin", "company_admin", "finance_manager"]
            },
          ]
        },
        {
          title: "Recruitment",
          items: [
            { 
              title: "Recruitment Dashboard", 
              icon: "lucide:user-check", 
              path: "/dashboard/recruitment",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Job Postings", 
              icon: "lucide:file-text", 
              path: "/dashboard/jobs",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Candidates", 
              icon: "lucide:user-plus", 
              path: "/dashboard/candidates",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Interviews", 
              icon: "lucide:users", 
              path: "/dashboard/interviews",
              roles: ["super_admin", "company_admin", "hr_manager"]
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
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Reviews", 
              icon: "lucide:star", 
              path: "/dashboard/reviews",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
          ]
        },
        {
          title: "Reports",
          items: [
            { 
              title: "Income vs Expense", 
              icon: "lucide:dollar-sign", 
              path: "/dashboard/reports/income-expense",
              roles: ["super_admin", "company_admin", "finance_manager"]
            },
            { 
              title: "Monthly Attendance", 
              icon: "lucide:calendar-check", 
              path: "/dashboard/reports/monthly-attendance",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Leave Report", 
              icon: "lucide:calendar-x", 
              path: "/dashboard/reports/leave",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
            { 
              title: "Account Statement", 
              icon: "lucide:receipt", 
              path: "/dashboard/reports/account-statement",
              roles: ["super_admin", "company_admin", "finance_manager"]
            },
            { 
              title: "Payroll Report", 
              icon: "lucide:credit-card", 
              path: "/dashboard/reports/payroll",
              roles: ["super_admin", "company_admin", "finance_manager"]
            },
            { 
              title: "Timesheet Report", 
              icon: "lucide:clock", 
              path: "/dashboard/reports/timesheet",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
          ]
        },
        {
          title: "Assets",
          items: [
            { 
              title: "Assets", 
              icon: "lucide:laptop", 
              path: "/dashboard/assets",
              roles: ["super_admin", "company_admin", "admin"]
            },
            { 
              title: "Assignments", 
              icon: "lucide:clipboard-list", 
              path: "/dashboard/asset-assignments",
              roles: ["super_admin", "company_admin", "admin"]
            },
          ]
        },
        {
          title: "Documents & Policies",
          items: [
            { 
              title: "Documents", 
              icon: "lucide:folder", 
              path: "/dashboard/documents",
              roles: ["super_admin", "company_admin", "hr_manager"]
            },
          ]
        },
        {
          title: "Administration",
          items: [
            { 
              title: "Settings", 
              icon: "lucide:settings", 
              path: "/dashboard/settings",
              roles: ["super_admin", "company_admin"]
            },
            { 
              title: "Roles", 
              icon: "lucide:shield", 
              path: "/dashboard/roles",
              roles: ["super_admin", "company_admin"]
            },
            { 
              title: "Users", 
              icon: "lucide:users", 
              path: "/dashboard/users",
              roles: ["super_admin"]
            },
            { 
              title: "HR System Setup", 
              icon: "lucide:cog", 
              path: "/dashboard/hr-system-setup",
              roles: ["super_admin", "company_admin"]
            },
            { 
              title: "Audit Logs", 
              icon: "lucide:history", 
              path: "/dashboard/audit-logs",
              roles: ["super_admin"]
            },
          ]
        }
      ];
      
      // Filter nav items based on user role
      const filterNavItems = (items: NavItem[]) => {
        return items.filter(item => {
          if (!item.roles) return true;
          if (!user?.role) return false;
          return item.roles.includes(user.role);
        });
      };
      
      return (
        <aside 
          className={`bg-content1 shadow-md border-r border-divider transition-all duration-300 flex flex-col h-full ${
            isOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Logo */}
          <motion.div 
            className="p-4 flex items-center justify-center h-16"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {isOpen ? (
              <h1 className="text-xl font-bold">HRM<span className="text-primary">GO</span></h1>
            ) : (
              <h1 className="text-xl font-bold">HR</h1>
            )}
          </motion.div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {navSections.map((section, idx) => {
              const filteredItems = filterNavItems(section.items);
              if (filteredItems.length === 0) return null;
              
              return (
                <div key={idx} className="mb-6">
                  {isOpen && (
                    <p className="px-4 text-xs font-medium text-default-500 uppercase tracking-wider mb-2">
                      {section.title}
                    </p>
                  )}
                  
                  <ul>
                    {filteredItems.map((item, itemIdx) => {
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <motion.li 
                          key={itemIdx}
                          whileHover={{ x: isOpen ? 4 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isOpen ? (
                            <Link to={item.path}>
                              <Button
                                variant={isActive ? "flat" : "light"}
                                color={isActive ? "primary" : "default"}
                                className="justify-start w-full mb-1 rounded-lg"
                                startContent={
                                  <div className="relative">
                                    <Icon icon={item.icon} className="text-lg" />
                                    {item.badge && (
                                      <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {item.badge}
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
                                  variant={isActive ? "flat" : "light"}
                                  color={isActive ? "primary" : "default"}
                                  className="w-full mb-1 rounded-lg"
                                  aria-label={item.title}
                                >
                                  <div className="relative">
                                    <Icon icon={item.icon} className="text-lg" />
                                    {item.badge && (
                                      <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {item.badge}
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
              );
            })}
          </nav>
        </aside>
      );
    }