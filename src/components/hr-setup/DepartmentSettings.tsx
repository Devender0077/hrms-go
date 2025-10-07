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

interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  branch_id?: number;
  branch_name?: string;
  manager_id?: number;
  manager_name?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export default function DepartmentSettings() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    branch_id: "",
    status: "active" as const
  });

  useEffect(() => {
    loadDepartments();
    loadBranches();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/organization/departments");
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      addToast({
        title: "Error",
        description: "Failed to load departments",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await apiRequest("/organization/branches");
      if (response.success) {
        setBranches(response.data || []);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/organization/departments/${selectedDepartment?.id}` : "/organization/departments";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Department ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadDepartments();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving department:", error);
      addToast({
        title: "Error",
        description: "Failed to save department",
        color: "danger"
      });
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code || "",
      description: department.description || "",
      branch_id: department.branch_id?.toString() || "",
      status: department.status as 'active'
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await apiRequest(`/organization/departments/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Department deleted successfully",
            color: "success"
          });
          loadDepartments();
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        addToast({
          title: "Error",
          description: "Failed to delete department",
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
      branch_id: "",
      status: "active"
    });
    setSelectedDepartment(null);
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
            <h3 className="text-lg font-semibold">Department Management</h3>
            <p className="text-sm text-default-500">Manage organizational departments</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Department
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Departments table">
            <TableHeader>
              <TableColumn>DEPARTMENT NAME</TableColumn>
              <TableColumn>CODE</TableColumn>
              <TableColumn>BRANCH</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No departments found">
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{department.name}</p>
                      {department.description && (
                        <p className="text-sm text-default-500">{department.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.code && <Chip size="sm" variant="flat">{department.code}</Chip>}
                  </TableCell>
                  <TableCell>
                    {department.branch_name || "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={department.status === 'active' ? 'success' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {department.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Department actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEdit(department)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" />}
                          onPress={() => handleDelete(department.id)}
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
                {isEditing ? "Edit Department" : "Add New Department"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Department Name"
                      placeholder="Enter department name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Department Code"
                      placeholder="Enter department code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <Select
                    label="Branch"
                    placeholder="Select branch"
                    selectedKeys={formData.branch_id ? [formData.branch_id] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      setFormData({ ...formData, branch_id: value });
                    }}
                  >
                    {branches.map((branch) => (
                      <SelectItem key={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    label="Description"
                    placeholder="Enter department description"
                    value={formData.description}
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
