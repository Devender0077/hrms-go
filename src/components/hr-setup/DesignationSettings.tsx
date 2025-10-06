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
  Select,
  SelectItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../services/api-service";

interface Designation {
  id: number;
  name: string;
  code?: string;
  description?: string;
  department_id?: number;
  department_name?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export default function DesignationSettings() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    department_id: "",
    status: "active" as const
  });

  useEffect(() => {
    loadDesignations();
    loadDepartments();
  }, []);

  const loadDesignations = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/organization/designations");
      if (response.success) {
        setDesignations(response.data || []);
      }
    } catch (error) {
      console.error("Error loading designations:", error);
      addToast({
        title: "Error",
        description: "Failed to load designations",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiRequest("/organization/departments");
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/organization/designations/${selectedDesignation?.id}` : "/organization/designations";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Designation ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadDesignations();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving designation:", error);
      addToast({
        title: "Error",
        description: "Failed to save designation",
        color: "danger"
      });
    }
  };

  const handleEdit = (designation: Designation) => {
    setSelectedDesignation(designation);
    setFormData({
      name: designation.name,
      code: designation.code || "",
      description: designation.description || "",
      department_id: designation.department_id?.toString() || "",
      status: designation.status as 'active'
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this designation?")) {
      try {
        const response = await apiRequest(`/organization/designations/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Designation deleted successfully",
            color: "success"
          });
          loadDesignations();
        }
      } catch (error) {
        console.error("Error deleting designation:", error);
        addToast({
          title: "Error",
          description: "Failed to delete designation",
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
      department_id: "",
      status: "active"
    });
    setSelectedDesignation(null);
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
            <h3 className="text-lg font-semibold">Designation Management</h3>
            <p className="text-sm text-default-500">Manage job designations and roles</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Designation
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Designations table">
            <TableHeader>
              <TableColumn>DESIGNATION NAME</TableColumn>
              <TableColumn>CODE</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No designations found">
              {designations.map((designation) => (
                <TableRow key={designation.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{designation.name}</p>
                      {designation.description && (
                        <p className="text-sm text-default-500">{designation.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {designation.code && <Chip size="sm" variant="flat">{designation.code}</Chip>}
                  </TableCell>
                  <TableCell>
                    {designation.department_name || "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={designation.status === 'active' ? 'success' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {designation.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Designation actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEdit(designation)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" />}
                          onPress={() => handleDelete(designation.id)}
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
                {isEditing ? "Edit Designation" : "Add New Designation"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Designation Name"
                      placeholder="Enter designation name"
                      
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Designation Code"
                      placeholder="Enter designation code"
                      
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <Select
                    label="Department"
                    placeholder="Select department"
                    selectedKeys={formData.department_id ? [formData.department_id] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      setFormData({ ...formData, department_id: value });
                    }}
                  >
                    {departments.map((department) => (
                      <SelectItem key={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    label="Description"
                    placeholder="Enter designation description"
                    
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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
