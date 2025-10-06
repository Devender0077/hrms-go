import React, { useState, useRef, useEffect } from "react";
import { 
  Card, 
  CardBody, 
  Avatar, 
  Chip, 
  Button,
  Tooltip,
  Badge,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface Employee {
  id: number;
  name: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  employeeId?: string;
  reportsTo?: number | null;
  status?: string;
  joinDate?: string;
  directReports: Employee[];
}

interface ModernOrgChartProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
}

const ModernOrgChart: React.FC<ModernOrgChartProps> = ({ employees, onEmployeeClick }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [hoveredEmployee, setHoveredEmployee] = useState<Employee | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Get root employees (those with no reportsTo)
  const rootEmployees = employees.filter(emp => !emp.reportsTo || emp.reportsTo === null);

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'on_leave': return 'warning';
      case 'terminated': return 'danger';
      default: return 'default';
    }
  };

  const getDepartmentColor = (department: string | undefined): "success" | "default" | "warning" | "danger" => {
    if (!department) return 'default';
    const colors = {
      'HR': 'success',
      'IT': 'default',
      'Finance': 'success',
      'Marketing': 'warning',
      'Operations': 'danger',
      'Sales': 'success'
    };
    return (colors[department as keyof typeof colors] || 'default') as "success" | "default" | "warning" | "danger";
  };

  const toggleNode = (employeeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderEmployeeNode = (employee: Employee, level: number = 0, isLast: boolean = false) => {
    const isExpanded = expandedNodes.has(employee.id);
    const hasReports = employee.directReports && employee.directReports.length > 0;
    const isSelected = selectedEmployee?.id === employee.id;
    const isHovered = hoveredEmployee?.id === employee.id;

    return (
      <motion.div
        key={employee.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: level * 0.1 }}
        className="relative"
      >
        {/* Connection Line */}
        {level > 0 && (
          <div className="absolute -top-4 left-1/2 w-px h-4 bg-gradient-to-b from-primary-300 to-primary-500 transform -translate-x-1/2" />
        )}
        
        {/* Horizontal Connection Line */}
        {level > 0 && !isLast && (
          <div className="absolute top-1/2 left-1/2 w-full h-px bg-gradient-to-r from-primary-300 to-transparent transform -translate-y-1/2" />
        )}

        <div className="flex flex-col items-center">
          {/* Employee Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Card
              className={`
                w-64 cursor-pointer transition-all duration-300 border-0 shadow-sm bg-content1
                ${isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''}
                ${isHovered ? 'shadow-xl' : 'shadow-md'}
                hover:shadow-xl hover:bg-content2
              `}
              onPress={() => {
                setSelectedEmployee(employee);
                onEmployeeClick?.(employee);
              }}
              onMouseEnter={() => setHoveredEmployee(employee)}
              onMouseLeave={() => setHoveredEmployee(null)}
            >
              <CardBody className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar with Status Badge */}
                  <div className="relative">
                    <Avatar
                      src={employee.avatar}
                      name={employee.name}
                      size="lg"
                      className="w-16 h-16 text-lg font-semibold"
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
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      {employee.position || 'No Position'}
                    </p>
                    <p className="text-xs text-default-500">
                      {employee.department || 'No Department'}
                    </p>
                  </div>

                  {/* Status and Reports */}
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={getStatusColor(employee.status)}
                      variant="flat"
                    >
                      {employee.status || 'Unknown'}
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
                  </div>

                  {/* Expand/Collapse Button */}
                  {hasReports && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => toggleNode(employee.id)}
                      className="mt-2"
                    >
                      <Icon 
                        icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} 
                        className="w-4 h-4" 
                      />
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Employee ID Badge */}
            <div className="absolute -top-2 -right-2">
              <Chip size="sm" variant="solid" color="primary">
                {employee.employeeId || `ID: ${employee.id}`}
              </Chip>
            </div>
          </motion.div>

          {/* Direct Reports */}
          <AnimatePresence>
            {hasReports && isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 flex flex-wrap justify-center gap-8"
              >
                {employee.directReports.map((report, index) => 
                  renderEmployeeNode(
                    report, 
                    level + 1, 
                    index === employee.directReports.length - 1
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  if (rootEmployees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-6 bg-default-100 rounded-full mb-4">
          <Icon icon="lucide:users" className="w-12 h-12 text-default-400" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Organization Data</h3>
        <p className="text-default-600 text-center max-w-md">
          No employees found. Add employees to see the organization chart.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full overflow-auto">
      <div className="min-w-max p-8">
        <div className="flex flex-wrap justify-center gap-8">
          {rootEmployees.map((employee, index) => 
            renderEmployeeNode(employee, 0, index === rootEmployees.length - 1)
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernOrgChart;
