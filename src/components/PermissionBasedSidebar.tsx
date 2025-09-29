import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
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
  permissions: string[]; // Array of permission keys required to access this item
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function PermissionBasedSidebar({ isOpen }: SidebarProps) {
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
      ]
    },
    {
      title: "Assets",
      items: [
        { 
          title: "Asset Management", 
          icon: "lucide:package", 
          path: "/dashboard/assets",
          permissions: ["assets.view"]
        },
      ]
    },
    {
      title: "Administration",
      items: [
        { 
          title: "Roles", 
          icon: "lucide:shield-check", 
          path: "/dashboard/roles",
          permissions: ["roles.view"]
        },
        { 
          title: "Settings", 
          icon: "lucide:settings", 
          path: "/dashboard/settings",
          permissions: ["settings.view"]
        },
      ]
    }
  ];

  // Filter navigation items based on permissions
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // If permissions are loading, show nothing to avoid flash
      if (permissionsLoading) return false;
      
      // Check if user has any of the required permissions
      return hasAnyPermission(item.permissions);
    })
  })).filter(section => section.items.length > 0); // Remove empty sections

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (permissionsLoading) {
    return (
      <div className="h-full bg-content1 border-r border-default-300 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-default-400 mx-auto mb-2" />
          <p className="text-sm text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-content1 border-r border-default-300 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-default-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
            <Icon icon="lucide:building-2" className="text-foreground text-xl" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-xl font-bold text-foreground">HRMS</h1>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {filteredNavSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="px-4 mb-2"
              >
                <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              </motion.div>
            )}
            
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                >
                  <Tooltip
                    content={item.title}
                    placement="right"
                    isDisabled={isOpen}
                  >
                    <Link to={item.path}>
                      <Button
                        variant={isActive(item.path) ? "solid" : "light"}
                        color={isActive(item.path) ? "primary" : "default"}
                        className={`w-full justify-start h-12 px-4 ${
                          isOpen ? "justify-start" : "justify-center"
                        }`}
                        startContent={
                          <div className="relative">
                            <Icon icon={item.icon} className="text-lg" />
                            {item.badge && item.badge > 0 && (
                              <span className="absolute -top-2 -right-2 bg-danger text-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            )}
                          </div>
                        }
                      >
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="ml-2"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </Button>
                    </Link>
                  </Tooltip>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-default-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <Icon icon="lucide:user" className="text-foreground text-sm" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-default-500 truncate">
                {user?.role?.replace('_', ' ') || "Role"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
