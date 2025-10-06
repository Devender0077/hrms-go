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

interface DocumentType {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_required: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
}

export default function DocumentTypeSettings() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [items, setItems] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_required: false,
    status: "active" as const
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/hr-setup/document-types");
      if (response.success) {
        setItems(response.data || []);
      }
    } catch (error) {
      console.error("Error loading document types:", error);
      addToast({
        title: "Error",
        description: "Failed to load document types",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/hr-setup/document-types/${selectedItem?.id}` : "/hr-setup/document-types";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Document type ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadItems();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving document type:", error);
      addToast({
        title: "Error",
        description: "Failed to save document type",
        color: "danger"
      });
    }
  };

  const handleEdit = (item: DocumentType) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      code: item.code || "",
      description: item.description || "",
      is_required: item.is_required,
      status: item.status as 'active'
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this document type?")) {
      try {
        const response = await apiRequest(`/hr-setup/document-types/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Document type deleted successfully",
            color: "success"
          });
          loadItems();
        }
      } catch (error) {
        console.error("Error deleting document type:", error);
        addToast({
          title: "Error",
          description: "Failed to delete document type",
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
      is_required: false,
      status: "active"
    });
    setSelectedItem(null);
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
            <h3 className="text-lg font-semibold">Document Type Management</h3>
            <p className="text-sm text-default-500">Manage employee document types and requirements</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Document Type
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Document types table">
            <TableHeader>
              <TableColumn>DOCUMENT TYPE</TableColumn>
              <TableColumn>CODE</TableColumn>
              <TableColumn>REQUIRED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No document types found">
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-default-500">{item.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.code && <Chip size="sm" variant="flat">{item.code}</Chip>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={item.is_required ? 'warning' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {item.is_required ? 'Required' : 'Optional'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={item.status === 'active' ? 'success' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {item.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Document type actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" />}
                          onPress={() => handleEdit(item)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" />}
                          onPress={() => handleDelete(item.id)}
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
                {isEditing ? "Edit Document Type" : "Add New Document Type"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Document Type Name"
                      placeholder="Enter document type name"
                      
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Code"
                      placeholder="Enter code"
                      
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    placeholder="Enter document type description"
                    
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <Switch
                    isSelected={formData.is_required}
                    onValueChange={(value) => setFormData({ ...formData, is_required: value })}
                  >
                    <div>
                      <p className="font-medium">Required Document</p>
                      <p className="text-sm text-default-500">Make this document mandatory for all employees</p>
                    </div>
                  </Switch>
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

