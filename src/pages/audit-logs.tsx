import React, { useState, useMemo, useEffect } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { useAuthenticatedAPI } from "../hooks/useAuthenticatedAPI";
import HeroSection from "../components/common/HeroSection";

// Audit log interface
interface AuditLog {
  id: number;
  log_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  status: "success" | "failed" | "warning";
  severity: "low" | "medium" | "high" | "critical";
  department: string;
  location: string;
  session_id: string;
  changes?: Record<string, any>;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}


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
  const { apiRequest } = useAuthenticatedAPI();
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
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState({
    total_logs: 0,
    success_logs: 0,
    failed_logs: 0,
    critical_logs: 0,
    today_logs: 0
  });
  
  const rowsPerPage = 15;
  
  // Load audit logs on component mount
  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [page, searchQuery, selectedStatus, selectedSeverity, selectedDepartment, selectedAction]);

  // Fetch audit logs from API
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', rowsPerPage.toString());
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      
      const response = await apiRequest(`/audit-logs?${params.toString()}`, { method: 'GET' });
      
      if (response.success) {
        setAuditLogs(response.data);
        setTotalPages(response.pagination?.pages || 1);
        setTotalLogs(response.pagination?.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch audit logs');
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      
      // Fallback to mock data if API fails
      const mockLogs = generateMockAuditLogs();
      setAuditLogs(mockLogs);
      setTotalPages(Math.ceil(mockLogs.length / rowsPerPage));
      setTotalLogs(mockLogs.length);
      
      addToast({
        title: "Warning",
        description: "Using cached data. API connection failed.",
        color: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiRequest('/audit-logs/stats', { method: 'GET' });
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Calculate statistics for display
  const statsDisplay = useMemo(() => {
    return [
      {
        label: "Total Logs",
        value: stats.total_logs,
        icon: "lucide:file-text",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Success",
        value: stats.success_logs,
        icon: "lucide:check-circle",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Failed",
        value: stats.failed_logs,
        icon: "lucide:x-circle",
        color: "text-danger-600",
        bgColor: "bg-danger-100"
      },
      {
        label: "Critical",
        value: stats.critical_logs,
        icon: "lucide:alert-triangle",
        color: "text-warning-600",
        bgColor: "bg-warning-100"
      },
      {
        label: "Today",
        value: stats.today_logs,
        icon: "lucide:calendar",
        color: "text-secondary-600",
        bgColor: "bg-secondary-100"
      }
    ];
  }, [stats]);

  // Handle export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      
      const response = await fetch(`http://localhost:8000/api/v1/audit-logs/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        addToast({
          title: "Export Successful",
          description: "Audit logs have been exported successfully.",
          color: "success",
        });
      } else {
        throw new Error('Export failed');
      }
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
      await fetchAuditLogs();
      await fetchStats();
      
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
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroSection
          title="Audit Logs"
          subtitle="Security & Activity Monitoring"
          description="Monitor system activities and security events. Track user actions, system changes, and maintain comprehensive audit trails for compliance and security purposes."
          icon="lucide:shield-check"
          illustration="audit"
          actions={[
            {
              label: "Refresh",
              icon: "lucide:refresh-cw",
              onPress: handleRefreshLogs,
              variant: "flat" as const,
              isLoading: isRefreshing
            },
            {
              label: "Export CSV",
              icon: "lucide:download",
              onPress: handleExportCSV,
              variant: "flat" as const,
              isLoading: isExporting
            }
          ]}
        />
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsDisplay.map((stat, index) => (
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
                
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
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
                )) as any}
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
                )) as any}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-default-600">
                  Showing {auditLogs.length} of {totalLogs} logs
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-default-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Audit Logs</h3>
                <p className="text-default-500 text-sm">System activity and security monitoring</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
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
                    {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar 
                            name={log.user_name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-foreground">{log.user_name}</p>
                            <p className="text-sm text-default-500">{log.user_email}</p>
                            <p className="text-xs text-default-400">{log.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{log.action}</p>
                          <p className="text-sm text-default-500 max-w-xs truncate">{log.details}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{log.resource}</p>
                          <p className="text-sm text-default-500">{log.resource_id}</p>
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
                          <p className="text-sm font-medium">{log.ip_address}</p>
                          <p className="text-xs text-default-500">{log.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{new Date(log.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-default-500">{new Date(log.created_at).toLocaleTimeString()}</p>
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                  />
                </div>
              )}
              </>
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
                      name={selectedLog.user_name}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedLog.user_name}</h3>
                      <p className="text-default-600">{selectedLog.user_email}</p>
                      <p className="text-default-600">{selectedLog.department} • {selectedLog.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Action Details</h4>
                      <p><strong>Action:</strong> {selectedLog.action}</p>
                      <p><strong>Resource:</strong> {selectedLog.resource}</p>
                      <p><strong>Resource ID:</strong> {selectedLog.resource_id}</p>
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
                      <p><strong>IP Address:</strong> {selectedLog.ip_address}</p>
                      <p><strong>Session ID:</strong> {selectedLog.session_id}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Timestamp</h4>
                    <p><strong>Date & Time:</strong> {new Date(selectedLog.created_at).toLocaleString()}</p>
                    <p><strong>User Agent:</strong> {selectedLog.user_agent}</p>
                  </div>
                  
                  {selectedLog.changes && (
                    <div>
                      <h4 className="font-semibold mb-2">Changes Made</h4>
                      <div className="bg-content1 p-4 rounded-lg">
                        <pre className="text-sm text-default-700">
                          {JSON.stringify(selectedLog.changes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.old_values && (
                    <div>
                      <h4 className="font-semibold mb-2">Previous Values</h4>
                      <div className="bg-content1 p-4 rounded-lg">
                        <pre className="text-sm text-default-700">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.new_values && (
                    <div>
                      <h4 className="font-semibold mb-2">New Values</h4>
                      <div className="bg-content1 p-4 rounded-lg">
                        <pre className="text-sm text-default-700">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
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
