import React from "react";
import { useAuth } from "../contexts/auth-context";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";
import CompanyAdminDashboard from "../components/dashboard/CompanyAdminDashboard";
import EmployeeDashboard from "../components/dashboard/EmployeeDashboard";
    
    export default function Dashboard() {
  const { user } = useAuth();

  // Render role-based dashboard
  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard />;
  } else if (user?.role === 'company_admin') {
    return <CompanyAdminDashboard />;
  } else {
    return <EmployeeDashboard />;
  }
}
