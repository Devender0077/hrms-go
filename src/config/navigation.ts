/**
 * Shared Navigation Configuration
 * Used by both desktop and mobile sidebars
 */

export interface NavItem {
  title: string;
  icon: string;
  path: string;
  badge?: number;
  permissions?: string[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
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
        title: "Departments", 
        icon: "lucide:building", 
        path: "/dashboard/organization/departments",
        permissions: ["organization.view"]
      },
      { 
        title: "Designations", 
        icon: "lucide:briefcase", 
        path: "/dashboard/organization/designations",
        permissions: ["organization.view"]
      },
      { 
        title: "Branches", 
        icon: "lucide:map-pin", 
        path: "/dashboard/organization/branches",
        permissions: ["organization.view"]
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
        title: "Attendance Muster", 
        icon: "lucide:clipboard-list", 
        path: "/dashboard/timekeeping/attendance-muster",
        permissions: ["attendance.view"]
      },
      { 
        title: "Time Tracking", 
        icon: "lucide:timer", 
        path: "/dashboard/time-tracking/projects",
        permissions: ["time_tracking.view"]
      },
    ]
  },
  {
    title: "Leave Management",
    items: [
      { 
        title: "Leave Applications", 
        icon: "lucide:calendar-minus", 
        path: "/dashboard/leave/applications",
        permissions: ["leave.view"]
      },
      { 
        title: "Leave Types", 
        icon: "lucide:list", 
        path: "/dashboard/leave/types",
        permissions: ["leave.manage"]
      },
      { 
        title: "Holidays", 
        icon: "lucide:calendar-days", 
        path: "/dashboard/leave/holidays",
        permissions: ["leave.view"]
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
        permissions: ["recruitment.view"]
      },
      { 
        title: "Candidates", 
        icon: "lucide:user-plus", 
        path: "/dashboard/candidates",
        permissions: ["recruitment.view"]
      },
      { 
        title: "Interviews", 
        icon: "lucide:video", 
        path: "/dashboard/interviews",
        permissions: ["recruitment.view"]
      },
    ]
  },
  {
    title: "Payroll",
    items: [
      { 
        title: "Payroll Overview", 
        icon: "lucide:dollar-sign", 
        path: "/dashboard/payroll",
        permissions: ["payroll.view"]
      },
      { 
        title: "Salary Slips", 
        icon: "lucide:file-text", 
        path: "/dashboard/payroll/salary-slips",
        permissions: ["payroll.view"]
      },
      { 
        title: "Payroll Reports", 
        icon: "lucide:bar-chart", 
        path: "/dashboard/payroll/reports",
        permissions: ["payroll.view"]
      },
    ]
  },
  {
    title: "Training",
    items: [
      { 
        title: "Training Sessions", 
        icon: "lucide:graduation-cap", 
        path: "/dashboard/training/sessions",
        permissions: ["training.view"]
      },
      { 
        title: "Employee Training", 
        icon: "lucide:user-check", 
        path: "/dashboard/training/employee-training",
        permissions: ["training.view"]
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
        permissions: ["performance.view"]
      },
      { 
        title: "Reviews", 
        icon: "lucide:star", 
        path: "/dashboard/reviews",
        permissions: ["performance.view"]
      },
    ]
  },
  {
    title: "Reports",
    items: [
      { 
        title: "Attendance Reports", 
        icon: "lucide:file-bar-chart", 
        path: "/dashboard/reports/attendance",
        permissions: ["reports.view"]
      },
      { 
        title: "Leave Reports", 
        icon: "lucide:file-text", 
        path: "/dashboard/reports/leave",
        permissions: ["reports.view"]
      },
      { 
        title: "Payroll Reports", 
        icon: "lucide:file-spreadsheet", 
        path: "/dashboard/reports/payroll",
        permissions: ["reports.view"]
      },
    ]
  },
  {
    title: "System",
    items: [
      { 
        title: "Users", 
        icon: "lucide:users-cog", 
        path: "/dashboard/users",
        permissions: ["users.view"]
      },
      { 
        title: "Roles & Permissions", 
        icon: "lucide:shield", 
        path: "/dashboard/users/roles",
        permissions: ["roles.view"]
      },
      { 
        title: "HR System Setup", 
        icon: "lucide:settings-2", 
        path: "/dashboard/hr-system-setup",
        permissions: ["settings.manage"]
      },
      { 
        title: "Settings", 
        icon: "lucide:settings", 
        path: "/dashboard/settings",
        permissions: ["settings.view"]
      },
    ]
  },
];
