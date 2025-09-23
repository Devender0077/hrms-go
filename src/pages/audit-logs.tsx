import React, { useState, useMemo, useEffect } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import Papa from "papaparse";

// Audit log interface
interface AuditLog {
  id: number;
  logId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
  severity: "low" | "medium" | "high" | "critical";
  department: string;
  location: string;
  sessionId: string;
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

// Generate realistic audit logs
const generateAuditLogs = (): AuditLog[] => {
  const actions = [
    "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT", 
    "APPROVE", "REJECT", "ASSIGN", "UNASSIGN", "SCHEDULE", "CANCEL", "RESET_PASSWORD",
    "CHANGE_ROLE", "UPDATE_PROFILE", "UPLOAD_FILE", "DOWNLOAD_FILE", "SEND_EMAIL"
  ];
  
  const resources = [
    "USER", "EMPLOYEE", "DEPARTMENT", "JOB", "CANDIDATE", "INTERVIEW", "REVIEW", 
    "GOAL", "ATTENDANCE", "LEAVE", "PAYROLL", "EXPENSE", "REPORT", "SETTINGS", 
    "ROLE", "PERMISSION", "DOCUMENT", "NOTIFICATION", "CALENDAR", "TASK"
  ];
  
  const users = [
    { name: "John Smith", email: "john.smith@company.com", department: "IT" },
    { name: "Sarah Johnson", email: "sarah.johnson@company.com", department: "HR" },
    { name: "Mike Wilson", email: "mike.wilson@company.com", department: "Finance" },
    { name: "Lisa Anderson", email: "lisa.anderson@company.com", department: "Marketing" },
    { name: "David Chen", email: "david.chen@company.com", department: "Operations" },
    { name: "Emily Davis", email: "emily.davis@company.com", department: "Sales" },
    { name: "Tom Johnson", email: "tom.johnson@company.com", department: "IT" },
    { name: "Amy Rodriguez", email: "amy.rodriguez@company.com", department: "HR" }
  ];
  
  const statuses: ("success" | "failed" | "warning")[] = ["success", "failed", "warning"];
  const severities: ("low" | "medium" | "high" | "critical")[] = ["low", "medium", "high", "critical"];
  
  const logs: AuditLog[] = [];
  const now = new Date();
  
  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    // Generate timestamp within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
    
    const log: AuditLog = {
      id: i + 1,
      logId: `LOG-${String(i + 1).padStart(6, '0')}`,
      userId: `USER-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      userName: user.name,
      userEmail: user.email,
      action,
      resource,
      resourceId: `${resource}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      details: `${action} operation performed on ${resource.toLowerCase()}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: `Mozilla/5.0 (${Math.random() > 0.5 ? 'Windows' : 'Mac'}) AppleWebKit/537.36`,
      timestamp: timestamp.toISOString(),
      status,
      severity,
      department: user.department,
      location: `${Math.random() > 0.5 ? 'Office' : 'Remote'}`,
      sessionId: `SESS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      changes: Math.random() > 0.7 ? {
        field1: "old_value",
        field2: "new_value"
      } : undefined,
      oldValues: Math.random() > 0.8 ? {
        name: "Old Name",
        status: "inactive"
      } : undefined,
      newValues: Math.random() > 0.8 ? {
        name: "New Name",
        status: "active"
      } : undefined
    };
    
    logs.push(log);
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const statusColorMap = {
  success: "success",
  failed: "danger",
  warning: "warning",
};

const severityColorMap = {
  low: "default",
  medium: "primary",
  high: "warning",
  critical: "danger",
};

const departments = [
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "Customer Success"
];

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rowsPerPage = 15;
  
  // Load audit logs on component mount
  useEffect(() => {
    setAuditLogs(generateAuditLogs());
  }, []);
  
  // Filter audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery);
      
      const matchesStatus = selectedStatus === "all" || log.status === selectedStatus;
      const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
      const matchesDepartment = selectedDepartment === "all" || log.department === selectedDepartment;
      const matchesAction = selectedAction === "all" || log.action === selectedAction;
      
      return matchesSearch && matchesStatus && matchesSeverity && matchesDepartment && matchesAction;
    });
  }, [auditLogs, searchQuery, selectedStatus, selectedSeverity, selectedDepartment, selectedAction]);
  
  // Paginate filtered logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLogs = auditLogs.length;
    const successLogs = auditLogs.filter(l => l.status === "success").length;
    const failedLogs = auditLogs.filter(l => l.status === "failed").length;
    const criticalLogs = auditLogs.filter(l => l.severity === "critical").length;
    const todayLogs = auditLogs.filter(l => {
      const logDate = new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length;
    
    return [
      {
        label: "Total Logs",
        value: totalLogs,
        icon: "lucide:file-text",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        label: "Success",
        value: successLogs,
        icon: "lucide:check-circle",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "Failed",
        value: failedLogs,
        icon: "lucide:x-circle",
        color: "text-red-600",
        bgColor: "bg-red-100"
      },
      {
        label: "Critical",
        value: criticalLogs,
        icon: "lucide:alert-triangle",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        label: "Today",
        value: todayLogs,
        icon: "lucide:calendar",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      }
    ];
  }, [auditLogs]);

  // Handle export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvData = filteredLogs.map(log => ({
        "Log ID": log.logId,
        "User": log.userName,
        "Email": log.userEmail,
        "Action": log.action,
        "Resource": log.resource,
        "Resource ID": log.resourceId,
        "Details": log.details,
        "Status": log.status,
        "Severity": log.severity,
        "IP Address": log.ipAddress,
        "Department": log.department,
        "Location": log.location,
        "Timestamp": new Date(log.timestamp).toLocaleString(),
        "Session ID": log.sessionId
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast({
        title: "Export Successful",
        description: "Audit logs have been exported successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export audit logs. Please try again.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh logs
  const handleRefreshLogs = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate new logs (in real app, this would fetch from API)
      const newLogs = generateAuditLogs();
      setAuditLogs(newLogs);
      
      addToast({
        title: "Logs Refreshed",
        description: "Audit logs have been refreshed successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Refresh Failed",
        description: "Failed to refresh audit logs. Please try again.",
        color: "danger",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get unique actions for filter
  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map(log => log.action))).sort();
  }, [auditLogs]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl">
              <Icon icon="lucide:shield-check" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-gray-600 mt-1">Monitor system activities and security events</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:refresh-cw" />}
              onPress={handleRefreshLogs}
              isLoading={isRefreshing}
              className="font-medium"
            >
              Refresh
            </Button>
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              isLoading={isExporting}
              className="font-medium"
            >
              Export CSV
            </Button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
                </div>
                <div>
                  <p className="text-default-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Status"
                placeholder="All Statuses"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="success">Success</SelectItem>
                <SelectItem key="failed">Failed</SelectItem>
                <SelectItem key="warning">Warning</SelectItem>
              </Select>
              <Select
                label="Severity"
                placeholder="All Severities"
                selectedKeys={[selectedSeverity]}
                onSelectionChange={(keys) => setSelectedSeverity(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Severities</SelectItem>
                <SelectItem key="low">Low</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="high">High</SelectItem>
                <SelectItem key="critical">Critical</SelectItem>
              </Select>
              <Select
                label="Department"
                placeholder="All Departments"
                selectedKeys={[selectedDepartment]}
                onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept}>{dept}</SelectItem>
                ))}
              </Select>
              <Select
                label="Action"
                placeholder="All Actions"
                selectedKeys={[selectedAction]}
                onSelectionChange={(keys) => setSelectedAction(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action}>{action}</SelectItem>
                ))}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredLogs.length} of {auditLogs.length} logs
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-gray-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                <p className="text-gray-500 text-sm">System activity and security monitoring</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Audit logs table">
              <TableHeader>
                <TableColumn>USER</TableColumn>
                <TableColumn>ACTION</TableColumn>
                <TableColumn>RESOURCE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SEVERITY</TableColumn>
                <TableColumn>IP ADDRESS</TableColumn>
                <TableColumn>TIMESTAMP</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={log.userName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{log.userName}</p>
                          <p className="text-sm text-gray-500">{log.userEmail}</p>
                          <p className="text-xs text-gray-400">{log.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-500 max-w-xs truncate">{log.details}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{log.resource}</p>
                        <p className="text-sm text-gray-500">{log.resourceId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[log.status] as any}
                        variant="flat"
                      >
                        {log.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={severityColorMap[log.severity] as any}
                        variant="flat"
                      >
                        {log.severity}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{log.ipAddress}</p>
                        <p className="text-xs text-gray-500">{log.location}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{new Date(log.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedLog(log);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredLogs.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredLogs.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* View Log Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="4xl">
          <ModalContent>
            <ModalHeader>Audit Log Details</ModalHeader>
            <ModalBody>
              {selectedLog && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={selectedLog.userName}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedLog.userName}</h3>
                      <p className="text-gray-600">{selectedLog.userEmail}</p>
                      <p className="text-gray-600">{selectedLog.department} • {selectedLog.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Action Details</h4>
                      <p><strong>Action:</strong> {selectedLog.action}</p>
                      <p><strong>Resource:</strong> {selectedLog.resource}</p>
                      <p><strong>Resource ID:</strong> {selectedLog.resourceId}</p>
                      <p><strong>Details:</strong> {selectedLog.details}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Status & Security</h4>
                      <p><strong>Status:</strong> 
                        <Chip size="sm" color={statusColorMap[selectedLog.status] as any} variant="flat" className="ml-2">
                          {selectedLog.status}
                        </Chip>
                      </p>
                      <p><strong>Severity:</strong> 
                        <Chip size="sm" color={severityColorMap[selectedLog.severity] as any} variant="flat" className="ml-2">
                          {selectedLog.severity}
                        </Chip>
                      </p>
                      <p><strong>IP Address:</strong> {selectedLog.ipAddress}</p>
                      <p><strong>Session ID:</strong> {selectedLog.sessionId}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Timestamp</h4>
                    <p><strong>Date & Time:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                    <p><strong>User Agent:</strong> {selectedLog.userAgent}</p>
                  </div>
                  
                  {selectedLog.changes && (
                    <div>
                      <h4 className="font-semibold mb-2">Changes Made</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700">
                          {JSON.stringify(selectedLog.changes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.oldValues && (
                    <div>
                      <h4 className="font-semibold mb-2">Previous Values</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700">
                          {JSON.stringify(selectedLog.oldValues, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.newValues && (
                    <div>
                      <h4 className="font-semibold mb-2">New Values</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700">
                          {JSON.stringify(selectedLog.newValues, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
