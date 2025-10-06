import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  useDisclosure,
  Spinner,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  DatePicker,
} from "@heroui/react";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { Icon } from "@iconify/react";
import PageLayout, { PageHeader } from "../../components/layout/PageLayout";
import { apiRequest } from "../../services/api-service";

interface LeaveApplication {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type_id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  applied_at: string;
  approved_at?: string;
  approved_by?: string;
  comments?: string;
}

interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

export default function LeaveApplications() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const rowsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    status: "pending",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, leaveTypesRes, employeesRes] = await Promise.all([
        apiRequest("/leave/applications"),
        apiRequest("/leave/types"),
        apiRequest("/employees")
      ]);

      if (applicationsRes.success) {
        setApplications(applicationsRes.data || []);
      }
      if (leaveTypesRes.success) {
        setLeaveTypes(leaveTypesRes.data || []);
      }
      if (employeesRes.success) {
        setEmployees(employeesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedApplication(null);
    setIsEditMode(false);
    setFormData({
      employee_id: "",
      leave_type_id: "",
      start_date: "",
      end_date: "",
      reason: "",
      status: "pending",
    });
    onOpen();
  };

  const handleEdit = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setIsEditMode(true);
    setFormData({
      employee_id: application.employee_id.toString(),
      leave_type_id: application.leave_type_id.toString(),
      start_date: application.start_date,
      end_date: application.end_date,
      reason: application.reason,
      status: application.status,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = isEditMode 
        ? `/api/v1/leave/applications/${selectedApplication?.id}`
        : "/leave/applications";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await apiRequest(url, { method, body: JSON.stringify(formData) });
      if (response.success) {
        await loadData();
        onClose();
      }
    } catch (error) {
      console.error("Error saving leave application:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this leave application?")) {
      try {
        const response = await apiRequest("DELETE", `/api/v1/leave/applications/${id}`);
        if (response.success) {
          await loadData();
        }
      } catch (error) {
        console.error("Error deleting leave application:", error);
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await apiRequest(`/api/v1/leave/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Filter applications based on search query and status
  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         application.leave_type_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered results
  const paginatedApplications = filteredApplications.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const pages = Math.ceil(filteredApplications.length / rowsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "danger";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Leave Applications"
        description="Manage employee leave applications and approvals"
        icon="lucide:file-text"
        iconColor="from-primary-500 to-secondary-500"
        actions={
          <>
            <Input
              placeholder="Search applications..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              className="w-64"
            />
            <Select
              placeholder="Filter by status"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
              className="w-40"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="approved">Approved</SelectItem>
              <SelectItem key="rejected">Rejected</SelectItem>
            </Select>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={handleAddNew}
            >
              New Application
            </Button>
          </>
        }
      />

      {/* Leave Applications Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Leave Applications ({filteredApplications.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Leave applications table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>LEAVE TYPE</TableColumn>
              <TableColumn>START DATE</TableColumn>
              <TableColumn>END DATE</TableColumn>
              <TableColumn>DAYS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>APPLIED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium">{application.employee_name}</div>
                  </TableCell>
                  <TableCell>
                    <Chip color="primary" variant="flat" size="sm">
                      {application.leave_type_name}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(application.start_date)}</TableCell>
                  <TableCell>{formatDate(application.end_date)}</TableCell>
                  <TableCell>
                    <span className="font-medium">{application.total_days} days</span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(application.status)} 
                      variant="flat" 
                      size="sm"
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(application.applied_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                          >
                            <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="edit"
                            onPress={() => handleEdit(application)}
                          >
                            Edit
                          </DropdownItem>
                          {application.status === "pending" && (
                            <>
                              <DropdownItem
                                key="approve"
                                onPress={() => handleStatusChange(application.id, "approved")}
                                className="text-success"
                              >
                                Approve
                              </DropdownItem>
                              <DropdownItem
                                key="reject"
                                onPress={() => handleStatusChange(application.id, "rejected")}
                                className="text-danger"
                              >
                                Reject
                              </DropdownItem>
                            </>
                          )}
                          <DropdownItem
                            key="delete"
                            onPress={() => handleDelete(application.id)}
                            className="text-danger"
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={pages}
            page={page}
            onChange={setPage}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditMode ? "Edit Leave Application" : "New Leave Application"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Employee"
                    placeholder="Select employee"
                    selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                    onSelectionChange={(keys) => setFormData({ ...formData, employee_id: Array.from(keys)[0] as string })}
                    isRequired
                  >
                    {employees.map((employee) => (
                      <SelectItem key={employee.id.toString()} >
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <Select
                    label="Leave Type"
                    placeholder="Select leave type"
                    selectedKeys={formData.leave_type_id ? [formData.leave_type_id] : []}
                    onSelectionChange={(keys) => setFormData({ ...formData, leave_type_id: Array.from(keys)[0] as string })}
                    isRequired
                  >
                    {leaveTypes.map((leaveType) => (
                      <SelectItem key={leaveType.id.toString()} >
                        {leaveType.name} ({leaveType.days_allowed} days)
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="date"
                      
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      isRequired
                    />
                    
                    <Input
                      label="End Date"
                      type="date"
                      
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      isRequired
                    />
                  </div>
                  
                  <Textarea
                    label="Reason"
                    placeholder="Enter reason for leave"
                    
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    isRequired
                  />
                  
                  {isEditMode && (
                    <Select
                      label="Status"
                      placeholder="Select status"
                      selectedKeys={[formData.status]}
                      onSelectionChange={(keys) => setFormData({ ...formData, status: Array.from(keys)[0] as string })}
                    >
                      <SelectItem key="pending">Pending</SelectItem>
                      <SelectItem key="approved">Approved</SelectItem>
                      <SelectItem key="rejected">Rejected</SelectItem>
                    </Select>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSave}
                  isLoading={saving}
                >
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
        </Modal>
    </PageLayout>
  );
}