import React from "react";
    import { 
      Card, 
      CardBody, 
      CardHeader,
      Button,
      Tabs,
      Tab,
      Input,
      Textarea,
      Switch,
      Select,
      SelectItem,
      Divider,
      useDisclosure,
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    import { Link } from "react-router-dom";
    
    // HR System Setup configuration
    const setupModules = [
      { 
        key: "organization", 
        title: "Organization", 
        icon: "lucide:building",
        items: [
          { key: "branch", title: "Branch", icon: "lucide:git-branch", path: "/dashboard/branches" },
          { key: "department", title: "Department", icon: "lucide:layout-grid", path: "/dashboard/departments" },
          { key: "designation", title: "Designation", icon: "lucide:briefcase", path: "/dashboard/designations" }
        ]
      },
      { 
        key: "leave", 
        title: "Leave", 
        icon: "lucide:calendar-off",
        items: [
          { key: "leave-type", title: "Leave Type", icon: "lucide:calendar-x", path: "/dashboard/hr-system-setup/leave-type" }
        ]
      },
      { 
        key: "document", 
        title: "Document", 
        icon: "lucide:file-text",
        items: [
          { key: "document-type", title: "Document Type", icon: "lucide:file", path: "/dashboard/hr-system-setup/document-type" }
        ]
      },
      { 
        key: "payroll", 
        title: "Payroll", 
        icon: "lucide:credit-card",
        items: [
          { key: "payslip-type", title: "Payslip Type", icon: "lucide:receipt", path: "/dashboard/hr-system-setup/payslip-type" },
          { key: "allowance-option", title: "Allowance Option", icon: "lucide:plus-circle", path: "/dashboard/hr-system-setup/allowance-option" },
          { key: "loan-option", title: "Loan Option", icon: "lucide:landmark", path: "/dashboard/hr-system-setup/loan-option" },
          { key: "deduction-option", title: "Deduction Option", icon: "lucide:minus-circle", path: "/dashboard/hr-system-setup/deduction-option" }
        ]
      },
      { 
        key: "performance", 
        title: "Performance", 
        icon: "lucide:bar-chart-2",
        items: [
          { key: "goal-type", title: "Goal Type", icon: "lucide:target", path: "/dashboard/hr-system-setup/goal-type" },
          { key: "competencies", title: "Competencies", icon: "lucide:award", path: "/dashboard/hr-system-setup/competencies" },
          { key: "performance-type", title: "Performance Type", icon: "lucide:activity", path: "/dashboard/hr-system-setup/performance-type" }
        ]
      },
      { 
        key: "training", 
        title: "Training", 
        icon: "lucide:graduation-cap",
        items: [
          { key: "training-type", title: "Training Type", icon: "lucide:book-open", path: "/dashboard/hr-system-setup/training-type" }
        ]
      },
      { 
        key: "recruitment", 
        title: "Recruitment", 
        icon: "lucide:users",
        items: [
          { key: "job-category", title: "Job Category", icon: "lucide:layers", path: "/dashboard/hr-system-setup/job-category" },
          { key: "job-stage", title: "Job Stage", icon: "lucide:git-merge", path: "/dashboard/hr-system-setup/job-stage" }
        ]
      },
      { 
        key: "award", 
        title: "Award", 
        icon: "lucide:trophy",
        items: [
          { key: "award-type", title: "Award Type", icon: "lucide:award", path: "/dashboard/hr-system-setup/award-type" }
        ]
      },
      { 
        key: "termination", 
        title: "Termination", 
        icon: "lucide:user-x",
        items: [
          { key: "termination-type", title: "Termination Type", icon: "lucide:slash", path: "/dashboard/hr-system-setup/termination-type" }
        ]
      },
      { 
        key: "expense", 
        title: "Expense", 
        icon: "lucide:dollar-sign",
        items: [
          { key: "expense-type", title: "Expense Type", icon: "lucide:shopping-bag", path: "/dashboard/hr-system-setup/expense-type" }
        ]
      },
      { 
        key: "income", 
        title: "Income", 
        icon: "lucide:trending-up",
        items: [
          { key: "income-type", title: "Income Type", icon: "lucide:arrow-up-right", path: "/dashboard/hr-system-setup/income-type" }
        ]
      },
      { 
        key: "payment", 
        title: "Payment", 
        icon: "lucide:credit-card",
        items: [
          { key: "payment-type", title: "Payment Type", icon: "lucide:wallet", path: "/dashboard/hr-system-setup/payment-type" }
        ]
      },
      { 
        key: "contract", 
        title: "Contract", 
        icon: "lucide:file-text",
        items: [
          { key: "contract-type", title: "Contract Type", icon: "lucide:file-signature", path: "/dashboard/hr-system-setup/contract-type" }
        ]
      }
    ];
    
    export default function HRSystemSetup() {
      return (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">HR System Setup</h1>
              <p className="text-default-500">Configure HR system components and settings</p>
            </div>
          </div>
          
          {/* Setup Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {setupModules.map((module) => (
              <Card key={module.key} className="shadow-sm">
                <CardHeader className="flex gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon icon={module.icon} className="text-xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <p className="text-sm text-default-500">{module.items.length} settings</p>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    {module.items.map((item) => (
                      <Link 
                        key={item.key} 
                        to={item.path}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-default-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-default-100">
                            <Icon icon={item.icon} className="text-default-500" />
                          </div>
                          <span>{item.title}</span>
                        </div>
                        <Icon icon="lucide:chevron-right" className="text-default-400" />
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </motion.div>
      );
    }