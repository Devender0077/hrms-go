import React from "react";
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navSections: NavSection[] = [
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
  const filterNavItems = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true;
      if (!user?.role) return false;
      return item.roles.includes(user.role);
    });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="left">
      <DrawerContent>
        <DrawerHeader className="flex items-center justify-center border-b border-default-100">
          <h1 className="text-xl font-bold">
            HRM<span className="text-primary">GO</span>
          </h1>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <nav className="py-4">
            {navSections.map((section, idx) => {
              const filteredItems = filterNavItems(section.items);
              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="mb-6">
                  <p className="px-4 text-xs font-medium text-default-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </p>

                  <ul>
                    {filteredItems.map((item, itemIdx) => {
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
