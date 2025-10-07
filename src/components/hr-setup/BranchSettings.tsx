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
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../services/api-service";

interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export default function BranchSettings() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    status: "active" as const
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/organization/branches");
      if (response.success) {
        setBranches(response.data || []);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      addToast({
        title: "Error",
        description: "Failed to load branches",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/organization/branches/${selectedBranch?.id}` : "/organization/branches";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Branch ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadBranches();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving branch:", error);
      addToast({
        title: "Error",
        description: "Failed to save branch",
        color: "danger"
      });
    }
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      status: branch.status as 'active'
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        const response = await apiRequest(`/organization/branches/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Branch deleted successfully",
            color: "success"
          });
          loadBranches();
        }
      } catch (error) {
        console.error("Error deleting branch:", error);
        addToast({
          title: "Error",
          description: "Failed to delete branch",
          color: "danger"
        });
      }
    }
  };

  const handleCloseModal = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      status: "active"
    });
    setSelectedBranch(null);
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
            <h3 className="text-lg font-semibold">Branch Management</h3>
            <p className="text-sm text-default-500">Manage company branches and locations</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Branch
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Branches table">
            <TableHeader>
              <TableColumn>BRANCH NAME</TableColumn>
              <TableColumn>CODE</TableColumn>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No branches found">
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      {branch.address && (
                        <p className="text-sm text-default-500">{branch.address}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">{branch.code}</Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {branch.phone && <p>{branch.phone}</p>}
                      {branch.email && <p className="text-default-500">{branch.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={branch.status === 'active' ? 'success' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {branch.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Branch actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEdit(branch)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" />}
                          onPress={() => handleDelete(branch.id)}
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
                {isEditing ? "Edit Branch" : "Add New Branch"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Branch Name"
                      placeholder="Enter branch name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Branch Code"
                      placeholder="Enter branch code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      isRequired
                    />
                  </div>
                  <Textarea
                    label="Address"
                    placeholder="Enter branch address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
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
