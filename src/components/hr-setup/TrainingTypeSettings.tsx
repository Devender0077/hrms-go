import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, addToast, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../services/api-service";

interface TrainingType {
  id: number;
  name: string;
  code?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export default function TrainingTypeSettings() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [items, setItems] = useState<TrainingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrainingType | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "", status: "active" as const });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/hr-setup/training-types");
      if (response.success) setItems(response.data || []);
    } catch (error) {
      addToast({ title: "Error", description: "Failed to load training type", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/hr-setup/training-types/${selectedItem?.id}` : "/hr-setup/training-types";
      const response = await apiRequest(url, { method: isEditing ? "PUT" : "POST", body: formData });
      if (response.success) {
        addToast({ title: "Success", description: `Training Type ${isEditing ? "updated" : "created"} successfully`, color: "success" });
        loadItems();
        handleCloseModal();
      }
    } catch (error) {
      addToast({ title: "Error", description: "Failed to save training type", color: "danger" });
    }
  };

  const handleEdit = (item: TrainingType) => {
    setSelectedItem(item);
    setFormData({ name: item.name, code: item.code || "", description: item.description || "", status: item.status as 'active' });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this training type?")) {
      try {
        const response = await apiRequest(`/hr-setup/training-types/${id}`, { method: "DELETE" });
        if (response.success) {
          addToast({ title: "Success", description: "Training Type deleted successfully", color: "success" });
          loadItems();
        }
      } catch (error) {
        addToast({ title: "Error", description: "Failed to delete training type", color: "danger" });
      }
    }
  };

  const handleCloseModal = () => {
    setFormData({ name: "", code: "", description: "", status: "active" });
    setSelectedItem(null);
    setIsEditing(false);
    onClose();
  };

  if (loading) return <Card className="shadow-sm"><CardBody className="p-8 flex items-center justify-center"><Spinner size="lg" /></CardBody></Card>;

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Training Type Management</h3>
            <p className="text-sm text-default-500">Manage training program types</p>
          </div>
          <Button color="primary" startContent={<Icon icon="lucide:book-open" />} onPress={onOpen}>Add Training Type</Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Training Type table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>CODE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No training type found">
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-sm text-default-500">{item.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{item.code && <Chip size="sm" variant="flat">{item.code}</Chip>}</TableCell>
                  <TableCell><Chip color={item.status === 'active' ? 'success' : 'default'} variant="flat" size="sm">{item.status}</Chip></TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger><Button isIconOnly size="sm" variant="light"><Icon icon="lucide:more-vertical" /></Button></DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem key="edit" startContent={<Icon icon="lucide:edit" />} onPress={() => handleEdit(item)}>Edit</DropdownItem>
                        <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Icon icon="lucide:trash" />} onPress={() => handleDelete(item.id)}>Delete</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{isEditing ? "Edit Training Type" : "Add New Training Type"}</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Name" placeholder="Enter name"  onChange={(e) => setFormData({ ...formData, name: e.target.value })} isRequired />
                    <Input label="Code" placeholder="Enter code"  onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                  </div>
                  <Textarea label="Description" placeholder="Enter description"  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleCloseModal}>Cancel</Button>
                <Button color="primary" onPress={handleSubmit}>{isEditing ? "Update" : "Create"}</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
