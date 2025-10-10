import React from "react";
import { useAuth } from "../contexts/auth-context";
import { useTranslation } from "../contexts/translation-context";
import DynamicPageTitle from "../components/common/DynamicPageTitle";
import SuperAdminDashboard from "../components/dashboard/SuperAdminDashboard";
import CompanyAdminDashboard from "../components/dashboard/CompanyAdminDashboard";
import EmployeeDashboard from "../components/dashboard/EmployeeDashboard";
    
export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Render role-based dashboard
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return (
      <>
        <DynamicPageTitle pageName={t('dashboard.superAdminDashboard')} />
        <SuperAdminDashboard />
      </>
    );
  } else if (user?.role === 'company_admin') {
    return (
      <>
        <DynamicPageTitle pageName={t('dashboard.companyAdminDashboard')} />
        <CompanyAdminDashboard />
      </>
    );
  } else {
    return (
      <>
        <DynamicPageTitle pageName={t('dashboard.employeeDashboard')} />
        <EmployeeDashboard />
      </>
    );
  }
}
