import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerBody,
  DrawerHeader,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/auth-context";
import { usePermissions } from "../hooks/usePermissions";
import { useTaskContext } from "../contexts/task-context";
import { useSettings } from "../contexts/settings-context";
import { navSections as sharedNavSections } from "../config/navigation";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  icon: string;
  path: string;
  badge?: number;
  permissions?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { taskCounts } = useTaskContext();
  const { settings } = useSettings();

  // Filter navigation based on permissions (sharedNavSections imported at top)
  const filteredNavSections = useMemo(() => {
    return sharedNavSections
      .map((section: NavSection) => ({
        ...section,
        items: section.items.filter((item: NavItem) => {
          // If no permissions specified, show to everyone
          if (!item.permissions || item.permissions.length === 0) {
            return true;
          }
          // Check if user has at least one of the required permissions
          return item.permissions.some(permission => hasPermission(permission));
        })
      }))
      .filter((section: NavSection) => section.items.length > 0); // Remove empty sections
  }, [hasPermission]);
  
  // Old hardcoded navigation (keeping as fallback)
  const oldNavSections: NavSection[] = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          icon: "lucide:layout-dashboard",
          path: "/dashboard",
        },
        {
          title: "Calendar",
          icon: "lucide:calendar",
          path: "/dashboard/calendar",
        },
        {
          title: "Tasks",
          icon: "lucide:check-circle",
          path: "/dashboard/tasks",
          badge: 3,
        },
      ],
    },
    {
      title: "HR Management",
      items: [
        {
          title: "Employees",
          icon: "lucide:users",
          path: "/dashboard/employees",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
        {
          title: "Departments",
          icon: "lucide:building",
          path: "/dashboard/departments",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
        {
          title: "Designations",
          icon: "lucide:briefcase",
          path: "/dashboard/designations",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
        {
          title: "Attendance",
          icon: "lucide:clock",
          path: "/dashboard/timekeeping/attendance",
        },
        {
          title: "Shifts",
          icon: "lucide:calendar-days",
          path: "/dashboard/timekeeping/shifts",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
        {
          title: "Leave",
          icon: "lucide:calendar-off",
          path: "/dashboard/leave",
        },
      ],
    },
    {
      title: "Finance",
      items: [
        {
          title: "Payroll",
          icon: "lucide:credit-card",
          path: "/dashboard/payroll",
          roles: ["super_admin", "company_admin", "finance_manager"],
        },
        {
          title: "Expenses",
          icon: "lucide:receipt",
          path: "/dashboard/expenses",
          roles: ["super_admin", "company_admin", "finance_manager"],
        },
        {
          title: "Reports",
          icon: "lucide:bar-chart",
          path: "/dashboard/reports",
          roles: [
            "super_admin",
            "company_admin",
            "finance_manager",
            "hr_manager",
          ],
        },
      ],
    },
    {
      title: "Recruitment",
      items: [
        {
          title: "Job Postings",
          icon: "lucide:file-text",
          path: "/dashboard/jobs",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
        {
          title: "Candidates",
          icon: "lucide:user-plus",
          path: "/dashboard/candidates",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
        {
          title: "Interviews",
          icon: "lucide:users",
          path: "/dashboard/interviews",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
      ],
    },
    {
      title: "Performance",
      items: [
        {
          title: "Goals",
          icon: "lucide:target",
          path: "/dashboard/goals",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
        {
          title: "Reviews",
          icon: "lucide:star",
          path: "/dashboard/reviews",
          roles: ["super_admin", "company_admin", "hr_manager"],
        },
      ],
    },
    {
      title: "Assets",
      items: [
        {
          title: "Assets",
          icon: "lucide:laptop",
          path: "/dashboard/assets",
          roles: ["super_admin", "company_admin", "admin"],
        },
        {
          title: "Assignments",
          icon: "lucide:clipboard-list",
          path: "/dashboard/asset-assignments",
          roles: ["super_admin", "company_admin", "admin"],
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "Settings",
          icon: "lucide:settings",
          path: "/dashboard/settings",
          roles: ["super_admin", "company_admin"],
        },
        {
          title: "Users",
          icon: "lucide:users",
          path: "/dashboard/users",
          roles: ["super_admin"],
        },
        {
          title: "Audit Logs",
          icon: "lucide:history",
          path: "/dashboard/audit-logs",
          roles: ["super_admin"],
        },
      ],
    },
  ];

  // Filter nav items based on user role
  // Permission filtering is now done in useMemo above
  
  const getSiteName = () => {
    return settings?.general?.siteName || 'HRMS';
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="left">
      <DrawerContent>
        <DrawerHeader className="flex items-center justify-center border-b border-default-100 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {getSiteName().substring(0, 2).toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {getSiteName()}
            </h1>
          </div>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <nav className="py-4">
            {filteredNavSections.map((section, idx) => {
              // Items are already filtered by permissions
              if (section.items.length === 0) return null;

              return (
                <div key={idx} className="mb-6">
                  <p className="px-4 text-xs font-medium text-default-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </p>

                  <ul>
                    {section.items.map((item, itemIdx) => {
                      const isActive = location.pathname === item.path;

                      return (
                        <motion.li
                          key={itemIdx}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link to={item.path} onClick={onClose}>
                            <Button
                              variant={isActive ? "flat" : "light"}
                              color={isActive ? "primary" : "default"}
                              className={`justify-start w-full mb-2 rounded-2xl transition-all duration-200 ${
                                isActive 
                                  ? 'shadow-lg shadow-primary-500/20' 
                                  : 'hover:shadow-md hover:bg-default-100/50'
                              }`}
                              startContent={
                                <div className="relative">
                                  <Icon icon={item.icon} className="text-lg" />
                                  {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-danger text-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                              }
                            >
                              {item.title}
                            </Button>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
