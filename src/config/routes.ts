// Route configuration with required permissions
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  requiredPermissions: string[];
  layout?: React.ComponentType<{ children: React.ReactNode }>;
}

// Import all components
import Dashboard from "../pages/dashboard";
import Calendar from "../pages/calendar";
import Tasks from "../pages/tasks";
import Employees from "../pages/employees";
import Departments from "../pages/organization/departments";
import Designations from "../pages/organization/designations";
import Branches from "../pages/organization/branches";
import OrganizationChart from "../pages/organization/org-chart";
import TimekeepingAttendance from "../pages/timekeeping/attendance";
import Shifts from "../pages/timekeeping/shifts";
import Policies from "../pages/timekeeping/policies";
import Records from "../pages/timekeeping/records";
import Regulations from "../pages/timekeeping/regulations";
import Regularization from "../pages/timekeeping/regularization";
import Jobs from "../pages/jobs";
import Candidates from "../pages/candidates";
import Interviews from "../pages/interviews";
import Goals from "../pages/goals";
import Reviews from "../pages/reviews";
import Assets from "../pages/assets";
import Leave from "../pages/leave";
import Payroll from "../pages/payroll";
import Expenses from "../pages/expenses";
import Roles from "../pages/roles";
import Settings from "../pages/settings";
import Profile from "../pages/profile";
// import Reports from "../pages/reports"; // Page not found

// Import layouts
import DashboardLayout from "../layouts/dashboard-layout";

import React from 'react';

// Route configurations
export const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard",
    component: Dashboard,
    requiredPermissions: ["dashboard.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/calendar",
    component: Calendar,
    requiredPermissions: ["calendar.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/tasks",
    component: Tasks,
    requiredPermissions: ["tasks.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/organization-chart",
    component: OrganizationChart,
    requiredPermissions: ["organization.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/employees",
    component: Employees,
    requiredPermissions: ["employees.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/departments",
    component: Departments,
    requiredPermissions: ["departments.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/designations",
    component: Designations,
    requiredPermissions: ["designations.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/branches",
    component: Branches,
    requiredPermissions: ["branches.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/timekeeping/attendance",
    component: TimekeepingAttendance,
    requiredPermissions: ["attendance.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/timekeeping/shifts",
    component: Shifts,
    requiredPermissions: ["shifts.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/timekeeping/policies",
    component: Policies,
    requiredPermissions: ["policies.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/timekeeping/records",
    component: Records,
    requiredPermissions: ["records.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/timekeeping/regulations",
    component: Regulations,
    requiredPermissions: ["regulations.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/timekeeping/regularization",
    component: Regularization,
    requiredPermissions: ["regularization.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/jobs",
    component: Jobs,
    requiredPermissions: ["jobs.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/candidates",
    component: Candidates,
    requiredPermissions: ["candidates.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/interviews",
    component: Interviews,
    requiredPermissions: ["interviews.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/goals",
    component: Goals,
    requiredPermissions: ["goals.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/reviews",
    component: Reviews,
    requiredPermissions: ["reviews.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/assets",
    component: Assets,
    requiredPermissions: ["assets.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/leave",
    component: Leave,
    requiredPermissions: ["leave.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/payroll",
    component: Payroll,
    requiredPermissions: ["payroll.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/expenses",
    component: Expenses,
    requiredPermissions: ["expenses.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/roles",
    component: Roles,
    requiredPermissions: ["roles.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/settings",
    component: Settings,
    requiredPermissions: ["settings.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/profile",
    component: Profile,
    requiredPermissions: ["profile.view"],
    layout: DashboardLayout
  },
  {
    path: "/dashboard/reports",
    component: () => React.createElement('div', null, 'Reports page not implemented'),
    requiredPermissions: ["reports.view"],
    layout: DashboardLayout
  }
];
