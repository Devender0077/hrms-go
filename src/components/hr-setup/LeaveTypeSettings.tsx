import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast,
  Spinner,
  Switch
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../services/api-service";

interface LeaveType {
  id: number;
  name: string;
  code?: string;
  description?: string;
  days_per_year?: number;
  is_paid: boolean;
  requires_approval: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
}

export default function LeaveTypeSettings() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    days_per_year: "",
    is_paid: true,
    requires_approval: true,
    status: "active" as const
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
      addToast({
        title: "Error",
        description: "Failed to load leave types",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/leave/types/${selectedLeaveType?.id}` : "/leave/types";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Leave type ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadLeaveTypes();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving leave type:", error);
      addToast({
        title: "Error",
        description: "Failed to save leave type",
        color: "danger"
      });
    }
  };

  const handleEdit = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setFormData({
      name: leaveType.name,
      code: leaveType.code || "",
      description: leaveType.description || "",
      days_per_year: leaveType.days_per_year?.toString() || "",
      is_paid: leaveType.is_paid,
      requires_approval: leaveType.requires_approval,
      status: leaveType.status as 'active'
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this leave type?")) {
      try {
        const response = await apiRequest(`/leave/types/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Leave type deleted successfully",
            color: "success"
          });
          loadLeaveTypes();
        }
      } catch (error) {
        console.error("Error deleting leave type:", error);
        addToast({
          title: "Error",
          description: "Failed to delete leave type",
          color: "danger"
        });
      }
    }
  };

  const handleCloseModal = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      days_per_year: "",
      is_paid: true,
      requires_approval: true,
      status: "active"
    });
    setSelectedLeaveType(null);
    setIsEditing(false);
    onClose();
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardBody className="p-8 flex items-center justify-center">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Leave Type Management</h3>
            <p className="text-sm text-default-500">Manage leave types and policies</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Leave Type
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Leave types table">
            <TableHeader>
              <TableColumn>LEAVE TYPE</TableColumn>
              <TableColumn>CODE</TableColumn>
              <TableColumn>DAYS/YEAR</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No leave types found">
              {leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{leaveType.name}</p>
                      {leaveType.description && (
                        <p className="text-sm text-default-500">{leaveType.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {leaveType.code && <Chip size="sm" variant="flat">{leaveType.code}</Chip>}
                  </TableCell>
                  <TableCell>
                    {leaveType.days_per_year || "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={leaveType.is_paid ? 'success' : 'warning'}
                      variant="flat"
                      size="sm"
                    >
                      {leaveType.is_paid ? 'Paid' : 'Unpaid'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={leaveType.status === 'active' ? 'success' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {leaveType.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Leave type actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEdit(leaveType)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" />}
                          onPress={() => handleDelete(leaveType.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? "Edit Leave Type" : "Add New Leave Type"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Leave Type Name"
                      placeholder="Enter leave type name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Code"
                      placeholder="Enter code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    placeholder="Enter leave type description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    label="Days Per Year"
                    placeholder="Enter maximum days per year"
                    value={formData.days_per_year}
                    onChange={(e) => setFormData({ ...formData, days_per_year: e.target.value })}
                  />
                  <div className="flex gap-6">
                    <Switch
                      isSelected={formData.is_paid}
                      onValueChange={(value) => setFormData({ ...formData, is_paid: value })}
                    >
                      <div>
                        <p className="font-medium">Paid Leave</p>
                        <p className="text-sm text-default-500">Employees get paid during this leave</p>
                      </div>
                    </Switch>
                    <Switch
                      isSelected={formData.requires_approval}
                      onValueChange={(value) => setFormData({ ...formData, requires_approval: value })}
                    >
                      <div>
                        <p className="font-medium">Requires Approval</p>
                        <p className="text-sm text-default-500">Leave request needs approval</p>
                      </div>
                    </Switch>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleCloseModal}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {isEditing ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
