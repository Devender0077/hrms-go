import React, { useState } from "react";
import { 
  Card, 
  CardBody, 
  Avatar, 
  Chip, 
  Button,
  Tooltip,
  Badge,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  avatar?: string;
  employeeId: string;
  reportsTo?: number | null;
  status: string;
  joinDate: string;
  directReports: Employee[];
}

interface ModernOrgListProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
}

const ModernOrgList: React.FC<ModernOrgListProps> = ({ employees, onEmployeeClick }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Flatten hierarchy for list view
  const flattenEmployees = (employees: Employee[], level: number = 0): (Employee & { level: number })[] => {
    const result: (Employee & { level: number })[] = [];
    
    employees.forEach(emp => {
      result.push({ ...emp, level });
      if (emp.directReports && emp.directReports.length > 0) {
        result.push(...flattenEmployees(emp.directReports, level + 1));
      }
    });
    
    return result;
  };

  const flattenedEmployees = flattenEmployees(employees);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'on_leave': return 'warning';
      case 'terminated': return 'danger';
      default: return 'default';
    }
  };

  const getDepartmentColor = (department: string): "success" | "default" | "primary" | "secondary" | "warning" | "danger" => {
    const colors = {
      'HR': 'primary',
      'IT': 'secondary',
      'Finance': 'success',
      'Marketing': 'warning',
      'Operations': 'danger',
      'Sales': 'primary'
    };
    return (colors[department as keyof typeof colors] || 'default') as "success" | "default" | "primary" | "secondary" | "warning" | "danger";
  };

  const toggleRow = (employeeId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedRows(newExpanded);
  };

  if (flattenedEmployees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-6 bg-default-100 rounded-full mb-4">
          <Icon icon="lucide:list" className="w-12 h-12 text-default-400" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Employees Found</h3>
        <p className="text-default-600 text-center max-w-md">
          No employees found in the organization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flattenedEmployees.map((employee, index) => {
        const isSelected = selectedEmployee?.id === employee.id;
        const hasReports = employee.directReports && employee.directReports.length > 0;
        const isExpanded = expandedRows.has(employee.id);

        return (
          <motion.div
            key={`${employee.id}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className={`
                cursor-pointer transition-all duration-300 border-0 shadow-sm bg-content1
                ${isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''}
                hover:shadow-md hover:bg-content2
              `}
              onPress={() => {
                setSelectedEmployee(employee);
                onEmployeeClick?.(employee);
              }}
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  {/* Hierarchy Indicator */}
                  <div className="flex items-center min-w-[120px]">
                    {Array.from({ length: employee.level }).map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-6 h-px bg-default-300 mr-2" />
                        {i === employee.level - 1 && (
                          <Icon 
                            icon="lucide:corner-down-right" 
                            className="text-default-400 mr-2 w-4 h-4" 
                          />
                        )}
                      </div>
                    ))}
                    {employee.level === 0 && (
                      <Chip size="sm" color="primary" variant="flat">
                        Top Level
                      </Chip>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      src={employee.avatar}
                      name={employee.name}
                      size="md"
                      className="w-12 h-12"
                    />
                    <Badge
                      color={getStatusColor(employee.status)}
                      shape="circle"
                      size="sm"
                      className="absolute -bottom-1 -right-1"
                    >
                      <div className="w-2 h-2 rounded-full" />
                    </Badge>
                  </div>

                  {/* Employee Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground truncate">
                          {employee.name}
                        </h4>
                        <p className="text-sm text-primary font-medium">
                          {employee.position}
                        </p>
                        <p className="text-xs text-default-500">
                          {employee.department} • {employee.employeeId}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={getStatusColor(employee.status)}
                          variant="flat"
                        >
                          {employee.status}
                        </Chip>
                        
                        {hasReports && (
                          <Chip
                            size="sm"
                            color={getDepartmentColor(employee.department)}
                            variant="dot"
                          >
                            {employee.directReports.length} reports
                          </Chip>
                        )}
                        
                        {hasReports && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => toggleRow(employee.id)}
                          >
                            <Icon 
                              icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} 
                              className="w-4 h-4" 
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="hidden lg:flex items-center gap-4 text-sm text-default-500">
                    <div className="flex items-center gap-1">
                      <Icon icon="lucide:mail" className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:phone" className="w-4 h-4" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {hasReports && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Divider className="my-4" />
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-default-600 mb-2">
                          Direct Reports ({employee.directReports.length})
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {employee.directReports.map((report) => (
                            <div
                              key={report.id}
                              className="flex items-center gap-2 p-3 bg-content2 rounded-lg border border-divider"
                            >
                              <Avatar
                                src={report.avatar}
                                name={report.name}
                                size="sm"
                                className="w-8 h-8"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {report.name}
                                </p>
                                <p className="text-xs text-default-500 truncate">
                                  {report.position}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ModernOrgList;
