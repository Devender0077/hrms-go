import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { useAuth } from "./contexts/auth-context";

// Auth Pages
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import EmailVerification from "./pages/auth/email-verification";
import Unauthorized from "./pages/auth/unauthorized";

// Dashboard Pages
import Dashboard from "./pages/dashboard";
import Employees from "./pages/employees";
// import EmployeeDetails from "./pages/employees/employee-details";
import Departments from "./pages/organization/departments";
import Designations from "./pages/organization/designations";
import Branches from "./pages/organization/branches";
import Attendance from "./pages/attendance";
import Leave from "./pages/leave";
import Expenses from "./pages/expenses";
import Payroll from "./pages/payroll";
// Individual Report Pages
import IncomeExpenseReport from "./pages/reports/income-expense";
import MonthlyAttendanceReport from "./pages/reports/monthly-attendance";
import LeaveReport from "./pages/reports/leave";
import AccountStatementReport from "./pages/reports/account-statement";
import PayrollReport from "./pages/reports/payroll";
import TimesheetReport from "./pages/reports/timesheet";
import Jobs from "./pages/jobs";
import Candidates from "./pages/candidates";
import Interviews from "./pages/interviews";
import Goals from "./pages/goals";
import Reviews from "./pages/reviews";
import Assets from "./pages/assets";
import AssetAssignments from "./pages/asset-assignments";
import Users from "./pages/users";
import AuditLogs from "./pages/audit-logs";
import OrganizationChart from "./pages/organization-chart";
import Settings from "./pages/settings";
import Profile from "./pages/profile";
import Roles from "./pages/roles";
import Calendar from "./pages/calendar";
import CalendarTest from "./pages/calendar-test";
import Tasks from "./pages/tasks";
import Recruitment from "./pages/recruitment";
import LeaveManagement from "./pages/leave-management";
import HRSystemSetup from "./pages/hr-system-setup";
import Documents from "./pages/document-management/documents";

// Layout Components
import DashboardLayout from "./layouts/dashboard-layout";

// Protected Route Component
import ProtectedRoute from "./components/auth/protected-route";

export default function App() {
  const { loading } = useAuth();
  const [appLoading, setAppLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading || appLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center p-8 gap-4 bg-background"
      >
        <div className="w-16 h-16 relative">
          <Spinner size="lg" color="primary" />
        </div>
        <p className="text-default-600 text-lg">Loading HRM System...</p>
      </motion.div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
              <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Calendar Route */}
        <Route
          path="/dashboard/calendar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Calendar />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Tasks Route */}
        <Route
          path="/dashboard/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Tasks />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/dashboard/employees"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
              <Employees />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/dashboard/employees/:id"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
              <EmployeeDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        /> */}

        {/* Organization Routes */}
        <Route
          path="/dashboard/departments"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
              <Departments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/designations"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
              <Designations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/branches"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <Branches />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Attendance Routes */}
        <Route
          path="/dashboard/attendance"
          element={
            <ProtectedRoute>
              <DashboardLayout>
              <Attendance />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Leave Routes */}
        <Route
          path="/dashboard/leave"
          element={
            <ProtectedRoute>
              <DashboardLayout>
              <Leave />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Expenses Routes */}
        <Route
          path="/dashboard/expenses"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Expenses />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Payroll Routes */}
        <Route
          path="/dashboard/payroll"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "finance_manager"]}
            >
              <DashboardLayout>
              <Payroll />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Report Routes */}
        <Route
          path="/dashboard/reports/income-expense"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "finance_manager"]}
            >
              <DashboardLayout>
                <IncomeExpenseReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports/monthly-attendance"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <MonthlyAttendanceReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports/leave"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <LeaveReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports/account-statement"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "finance_manager"]}
            >
              <DashboardLayout>
                <AccountStatementReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports/payroll"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "finance_manager"]}
            >
              <DashboardLayout>
                <PayrollReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports/timesheet"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <TimesheetReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Jobs Routes */}
        <Route
          path="/dashboard/jobs"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <Jobs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Candidates Routes */}
        <Route
          path="/dashboard/candidates"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <Candidates />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Interviews Routes */}
        <Route
          path="/dashboard/interviews"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <Interviews />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Goals Routes */}
        <Route
          path="/dashboard/goals"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager", "manager"]}
            >
              <DashboardLayout>
                <Goals />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Reviews Routes */}
        <Route
          path="/dashboard/reviews"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager", "manager"]}
            >
              <DashboardLayout>
                <Reviews />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Assets Routes */}
        <Route
          path="/dashboard/assets"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <Assets />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Asset Assignments Routes */}
        <Route
          path="/dashboard/asset-assignments"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <AssetAssignments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Users Routes */}
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin"]}
            >
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Audit Logs Routes */}
        <Route
          path="/dashboard/audit-logs"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin"]}
            >
              <DashboardLayout>
                <AuditLogs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Organization Chart Routes */}
        <Route
          path="/dashboard/organization-chart"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <OrganizationChart />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Roles Routes */}
        <Route
          path="/dashboard/roles"
          element={
            <ProtectedRoute roles={["super_admin", "company_admin"]}>
              <DashboardLayout>
                <Roles />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings Routes */}
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute roles={["super_admin", "company_admin"]}>
              <DashboardLayout>
              <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Profile Routes */}
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
              <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Recruitment Routes */}
        <Route
          path="/dashboard/recruitment"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <Recruitment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Leave Management Routes */}
        <Route
          path="/dashboard/leave-management"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin", "hr_manager"]}
            >
              <DashboardLayout>
                <LeaveManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* HR System Setup Routes */}
        <Route
          path="/dashboard/hr-system-setup"
          element={
            <ProtectedRoute
              roles={["super_admin", "company_admin"]}
            >
              <DashboardLayout>
                <HRSystemSetup />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Documents Routes */}
        <Route
          path="/dashboard/documents"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Documents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
