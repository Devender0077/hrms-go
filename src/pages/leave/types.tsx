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
  Switch,
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import PageLayout, { PageHeader } from "../../components/layout/PageLayout";
import { apiRequest } from "../../services/api-service";

interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
  requires_approval: boolean;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export default function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const rowsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    days_allowed: 0,
    requires_approval: true,
    is_paid: true,
  });

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/leave/types");
      if (response.success) {
        setLeaveTypes(response.data || []);
      }
    } catch (error) {
      console.error("Error loading leave types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedLeaveType(null);
    setIsEditMode(false);
    setFormData({
      name: "",
      days_allowed: 0,
      requires_approval: true,
      is_paid: true,
    });
    onOpen();
  };

  const handleEdit = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsEditMode(true);
    setFormData({
      name: leaveType.name,
      days_allowed: leaveType.days_allowed,
      requires_approval: leaveType.requires_approval,
      is_paid: leaveType.is_paid,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = isEditMode 
        ? `/api/v1/leave/types/${selectedLeaveType?.id}`
        : "/leave/types";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method: method,
        body: formData
      });
      if (response.success) {
        await loadLeaveTypes();
        onClose();
      }
    } catch (error) {
      console.error("Error saving leave type:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this leave type?")) {
      try {
        const response = await apiRequest(`/api/v1/leave/types/${id}`, {
          method: "DELETE"
        });
        if (response.success) {
          await loadLeaveTypes();
        }
      } catch (error) {
        console.error("Error deleting leave type:", error);
      }
    }
  };

  // Filter leave types based on search query
  const filteredLeaveTypes = leaveTypes.filter(leaveType =>
    leaveType.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered results
  const paginatedLeaveTypes = filteredLeaveTypes.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const pages = Math.ceil(filteredLeaveTypes.length / rowsPerPage);

  const getStatusColor = (isPaid: boolean) => {
    return isPaid ? "success" : "default";
  };

  const getApprovalColor = (requiresApproval: boolean) => {
    return requiresApproval ? "warning" : "success";
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
        title="Leave Types"
        description="Manage different types of leave available to employees"
        icon="lucide:calendar-plus"
        iconColor="from-primary-500 to-secondary-500"
        actions={
          <>
            <Input
              placeholder="Search leave types..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              className="w-64"
            />
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={handleAddNew}
            >
              Add Leave Type
            </Button>
          </>
        }
      />

      {/* Leave Types Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Leave Types ({filteredLeaveTypes.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Leave types table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DAYS ALLOWED</TableColumn>
              <TableColumn>PAID</TableColumn>
              <TableColumn>APPROVAL REQUIRED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedLeaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell>
                    <div className="font-medium">{leaveType.name}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{leaveType.days_allowed} days</span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(leaveType.is_paid)} 
                      variant="flat" 
                      size="sm"
                    >
                      {leaveType.is_paid ? "Paid" : "Unpaid"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getApprovalColor(leaveType.requires_approval)} 
                      variant="flat" 
                      size="sm"
                    >
                      {leaveType.requires_approval ? "Required" : "Not Required"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(leaveType)}
                      >
                        <Icon icon="lucide:edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(leaveType.id)}
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </Button>
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
                {isEditMode ? "Edit Leave Type" : "Add New Leave Type"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Leave Type Name"
                    placeholder="Enter leave type name"
                    
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  
                  <Input
                    label="Days Allowed"
                    type="number"
                    placeholder="Enter number of days"
                    
                    onChange={(e) => setFormData({ ...formData, days_allowed: parseInt(e.target.value) || 0 })}
                    isRequired
                  />
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      isSelected={formData.is_paid}
                      onValueChange={(value) => setFormData({ ...formData, is_paid: value })}
                    >
                      Paid Leave
                    </Switch>
                    
                    <Switch
                      isSelected={formData.requires_approval}
                      onValueChange={(value) => setFormData({ ...formData, requires_approval: value })}
                    >
                      Requires Approval
                    </Switch>
                  </div>
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