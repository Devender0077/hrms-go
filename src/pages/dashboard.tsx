import React from "react";
import { useAuth } from "../contexts/auth-context";
import DynamicPageTitle from "../components/common/DynamicPageTitle";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";
import CompanyAdminDashboard from "../components/dashboard/CompanyAdminDashboard";
import EmployeeDashboard from "../components/dashboard/EmployeeDashboard";
    
    export default function Dashboard() {
  const { user } = useAuth();

  // Render role-based dashboard
  if (user?.role === 'super_admin') {
    return (
      <>
        <DynamicPageTitle pageName="Super Admin Dashboard" />
        <SuperAdminDashboard />
      </>
    );
  } else if (user?.role === 'company_admin') {
    return (
      <>
        <DynamicPageTitle pageName="Company Admin Dashboard" />
        <CompanyAdminDashboard />
      </>
    );
  } else {
    return (
      <>
        <DynamicPageTitle pageName="Employee Dashboard" />
        <EmployeeDashboard />
      </>
    );
  }
}
