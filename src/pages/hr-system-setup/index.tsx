import React, { useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";
import HeroSection from "../../components/common/HeroSection";

// Import HR setup components
import BranchSettings from "../../components/hr-setup/BranchSettings";
import DepartmentSettings from "../../components/hr-setup/DepartmentSettings";
import DesignationSettings from "../../components/hr-setup/DesignationSettings";
import LeaveTypeSettings from "../../components/hr-setup/LeaveTypeSettings";
import DocumentTypeSettings from "../../components/hr-setup/DocumentTypeSettings";
import PayslipTypeSettings from "../../components/hr-setup/PayslipTypeSettings";
import AllowanceOptionSettings from "../../components/hr-setup/AllowanceOptionSettings";
import LoanOptionSettings from "../../components/hr-setup/LoanOptionSettings";
import DeductionOptionSettings from "../../components/hr-setup/DeductionOptionSettings";
import GoalTypeSettings from "../../components/hr-setup/GoalTypeSettings";
import CompetenciesSettings from "../../components/hr-setup/CompetenciesSettings";
import PerformanceTypeSettings from "../../components/hr-setup/PerformanceTypeSettings";
import TrainingTypeSettings from "../../components/hr-setup/TrainingTypeSettings";
import JobCategorySettings from "../../components/hr-setup/JobCategorySettings";
import JobStageSettings from "../../components/hr-setup/JobStageSettings";
import AwardTypeSettings from "../../components/hr-setup/AwardTypeSettings";
import TerminationTypeSettings from "../../components/hr-setup/TerminationTypeSettings";
import ExpenseTypeSettings from "../../components/hr-setup/ExpenseTypeSettings";
import IncomeTypeSettings from "../../components/hr-setup/IncomeTypeSettings";
import PaymentTypeSettings from "../../components/hr-setup/PaymentTypeSettings";
import ContractTypeSettings from "../../components/hr-setup/ContractTypeSettings";
import AttendanceCalculationSettings from "../../components/hr-setup/AttendanceCalculationSettings";

// HR System Setup configuration
const hrSetupCategories = [
  {
    key: "organization",
    title: "Organization",
    icon: "lucide:building",
    description: "Manage organizational structure",
    items: [
      { key: "branch", title: "Branch", icon: "lucide:git-branch", description: "Manage company branches" },
      { key: "department", title: "Department", icon: "lucide:layout-grid", description: "Manage departments" },
      { key: "designation", title: "Designation", icon: "lucide:briefcase", description: "Manage job designations" }
    ]
  },
  {
    key: "leave",
    title: "Leave Management",
    icon: "lucide:calendar-off",
    description: "Configure leave types and policies",
    items: [
      { key: "leave-type", title: "Leave Type", icon: "lucide:calendar-x", description: "Define leave types" }
    ]
  },
  {
    key: "document",
    title: "Document Management",
    icon: "lucide:file-text",
    description: "Configure document types",
    items: [
      { key: "document-type", title: "Document Type", icon: "lucide:file", description: "Define document types" }
    ]
  },
  {
    key: "payroll",
    title: "Payroll",
    icon: "lucide:credit-card",
    description: "Configure payroll components",
    items: [
      { key: "payslip-type", title: "Payslip Type", icon: "lucide:receipt", description: "Define payslip types" },
      { key: "allowance-option", title: "Allowance Option", icon: "lucide:plus-circle", description: "Configure allowances" },
      { key: "loan-option", title: "Loan Option", icon: "lucide:landmark", description: "Configure loan options" },
      { key: "deduction-option", title: "Deduction Option", icon: "lucide:minus-circle", description: "Configure deductions" }
    ]
  },
  {
    key: "performance",
    title: "Performance",
    icon: "lucide:bar-chart-2",
    description: "Configure performance management",
    items: [
      { key: "goal-type", title: "Goal Type", icon: "lucide:target", description: "Define goal types" },
      { key: "competencies", title: "Competencies", icon: "lucide:award", description: "Define competencies" },
      { key: "performance-type", title: "Performance Type", icon: "lucide:activity", description: "Define performance types" }
    ]
  },
  {
    key: "training",
    title: "Training",
    icon: "lucide:graduation-cap",
    description: "Configure training programs",
    items: [
      { key: "training-type", title: "Training Type", icon: "lucide:book-open", description: "Define training types" }
    ]
  },
  {
    key: "recruitment",
    title: "Recruitment",
    icon: "lucide:users",
    description: "Configure recruitment process",
    items: [
      { key: "job-category", title: "Job Category", icon: "lucide:layers", description: "Define job categories" },
      { key: "job-stage", title: "Job Stage", icon: "lucide:git-merge", description: "Define job stages" }
    ]
  },
  {
    key: "award",
    title: "Award",
    icon: "lucide:trophy",
    description: "Configure award types",
    items: [
      { key: "award-type", title: "Award Type", icon: "lucide:award", description: "Define award types" }
    ]
  },
  {
    key: "termination",
    title: "Termination",
    icon: "lucide:user-x",
    description: "Configure termination types",
    items: [
      { key: "termination-type", title: "Termination Type", icon: "lucide:slash", description: "Define termination types" }
    ]
  },
  {
    key: "expense",
    title: "Expense",
    icon: "lucide:dollar-sign",
    description: "Configure expense categories",
    items: [
      { key: "expense-type", title: "Expense Type", icon: "lucide:shopping-bag", description: "Define expense types" }
    ]
  },
  {
    key: "income",
    title: "Income",
    icon: "lucide:trending-up",
    description: "Configure income types",
    items: [
      { key: "income-type", title: "Income Type", icon: "lucide:arrow-up-right", description: "Define income types" }
    ]
  },
  {
    key: "payment",
    title: "Payment",
    icon: "lucide:credit-card",
    description: "Configure payment types",
    items: [
      { key: "payment-type", title: "Payment Type", icon: "lucide:wallet", description: "Define payment types" }
    ]
  },
  {
    key: "contract",
    title: "Contract",
    icon: "lucide:file-text",
    description: "Configure contract types",
    items: [
      { key: "contract-type", title: "Contract Type", icon: "lucide:file-signature", description: "Define contract types" }
    ]
  },
  {
    key: "attendance",
    title: "Attendance",
    icon: "lucide:clock",
    description: "Configure attendance calculation rules",
    items: [
      { key: "attendance-calculation", title: "Attendance Calculation", icon: "lucide:calculator", description: "Configure attendance calculation rules" }
    ]
  }
];

export default function HRSystemSetup() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("organization");
  const [activeItem, setActiveItem] = useState("branch");

  // Get user role
  const userRole = user?.role || 'employee';

  // Render the appropriate component based on active item
  const renderActiveComponent = () => {
    switch (activeItem) {
      // Organization
      case "branch": return <BranchSettings />;
      case "department": return <DepartmentSettings />;
      case "designation": return <DesignationSettings />;
      
      // Leave
      case "leave-type": return <LeaveTypeSettings />;
      
      // Document
      case "document-type": return <DocumentTypeSettings />;
      
      // Payroll
      case "payslip-type": return <PayslipTypeSettings />;
      case "allowance-option": return <AllowanceOptionSettings />;
      case "loan-option": return <LoanOptionSettings />;
      case "deduction-option": return <DeductionOptionSettings />;
      
      // Performance
      case "goal-type": return <GoalTypeSettings />;
      case "competencies": return <CompetenciesSettings />;
      case "performance-type": return <PerformanceTypeSettings />;
      
      // Training
      case "training-type": return <TrainingTypeSettings />;
      
      // Recruitment
      case "job-category": return <JobCategorySettings />;
      case "job-stage": return <JobStageSettings />;
      
      // Award
      case "award-type": return <AwardTypeSettings />;
      
      // Termination
      case "termination-type": return <TerminationTypeSettings />;
      
      // Expense
      case "expense-type": return <ExpenseTypeSettings />;
      
      // Income
      case "income-type": return <IncomeTypeSettings />;
      
      // Payment
      case "payment-type": return <PaymentTypeSettings />;
      
      // Contract
      case "contract-type": return <ContractTypeSettings />;
      
      // Attendance
      case "attendance-calculation": return <AttendanceCalculationSettings />;
      
      default:
        return (
          <Card className="shadow-sm">
            <CardBody className="p-8 text-center">
              <Icon icon="lucide:construction" className="w-16 h-16 text-warning mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-default-500">This module is under development and will be available soon.</p>
            </CardBody>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="HR System Setup"
          subtitle="Configure Your Organization"
          description="Set up your HR system with branches, departments, designations, and other organizational structures to match your company's needs."
          icon="lucide:building-2"
          illustration="hr-setup"
          actions={[
            {
              label: "Import Data",
              icon: "lucide:upload",
              onPress: () => console.log("Import HR data"),
              variant: "bordered"
            },
            {
              label: "Export Setup",
              icon: "lucide:download",
              onPress: () => console.log("Export HR setup"),
              variant: "flat"
            }
          ]}
        />

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-sm sticky top-6">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">Categories</h3>
              </CardHeader>
              <CardBody className="p-2">
                <div className="space-y-1">
                  {hrSetupCategories.map((category) => (
                    <div key={category.key}>
                      <button
                        onClick={() => {
                          setActiveCategory(category.key);
                          setActiveItem(category.items[0].key);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          activeCategory === category.key
                            ? "bg-primary text-white shadow-md"
                            : "hover:bg-default-100 dark:hover:bg-default-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            icon={category.icon}
                            className={`text-xl ${
                              activeCategory === category.key ? "text-white" : "text-primary"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{category.title}</h4>
                            <p
                              className={`text-xs ${
                                activeCategory === category.key
                                  ? "text-white/80"
                                  : "text-default-500"
                              }`}
                            >
                              {category.items.length} items
                            </p>
                          </div>
                          {activeCategory === category.key && (
                            <Icon icon="lucide:chevron-down" className="text-white" />
                          )}
                        </div>
                      </button>

                      {/* Sub-items */}
                      {activeCategory === category.key && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 mt-2 space-y-1"
                        >
                          {category.items.map((item) => (
                            <button
                              key={item.key}
                              onClick={() => setActiveItem(item.key)}
                              className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                                activeItem === item.key
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "hover:bg-default-100 dark:hover:bg-default-50 text-default-600"
                              }`}
                            >
                              <Icon icon={item.icon} className="text-sm" />
                              <span className="text-sm">{item.title}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {renderActiveComponent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}