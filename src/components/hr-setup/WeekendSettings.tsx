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
  Switch,
  Select,
  SelectItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../services/api-service";

interface WeekendConfig {
  id: number;
  name: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  is_active: boolean;
  description?: string;
  created_at?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
];

export default function WeekendSettings() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [weekendConfigs, setWeekendConfigs] = useState<WeekendConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<WeekendConfig | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    day_of_week: 0,
    is_active: true,
    description: ""
  });

  useEffect(() => {
    loadWeekendConfigs();
  }, []);

  const loadWeekendConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/hr-setup/weekend-configs");
      if (response.success) {
        setWeekendConfigs(response.data || []);
      }
    } catch (error) {
      console.error("Error loading weekend configs:", error);
      addToast({
        title: "Error",
        description: "Failed to load weekend configurations",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/hr-setup/weekend-configs/${selectedConfig?.id}` : "/hr-setup/weekend-configs";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Weekend configuration ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadWeekendConfigs();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving weekend config:", error);
      addToast({
        title: "Error",
        description: "Failed to save weekend configuration",
        color: "danger"
      });
    }
  };

  const handleEdit = (config: WeekendConfig) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      day_of_week: config.day_of_week,
      is_active: config.is_active,
      description: config.description || ""
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this weekend configuration?")) return;
    
    try {
      const response = await apiRequest(`/hr-setup/weekend-configs/${id}`, {
        method: "DELETE"
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: "Weekend configuration deleted successfully",
          color: "success"
        });
        loadWeekendConfigs();
      }
    } catch (error) {
      console.error("Error deleting weekend config:", error);
      addToast({
        title: "Error",
        description: "Failed to delete weekend configuration",
        color: "danger"
      });
    }
  };

  const handleCloseModal = () => {
    setFormData({
      name: "",
      day_of_week: 0,
      is_active: true,
      description: ""
    });
    setIsEditing(false);
    setSelectedConfig(null);
    onClose();
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || "Unknown";
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Weekend Configuration</h2>
            <p className="text-sm text-default-500">Configure which days are considered weekends</p>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
            onPress={onOpen}
          >
            Add Weekend Day
          </Button>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Weekend configurations table">
              <TableHeader>
                <TableColumn>DAY</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No weekend configurations found">
                {weekendConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:calendar" className="w-4 h-4 text-primary" />
                        <span className="font-medium">{getDayName(config.day_of_week)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{config.name}</span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={config.is_active ? "success" : "default"}
                        variant="flat"
                        size="sm"
                      >
                        {config.is_active ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-default-500">
                        {config.description || "No description"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                            onPress={() => handleEdit(config)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" className="w-4 h-4" />}
                            onPress={() => handleDelete(config.id)}
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
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="w-5 h-5 text-primary" />
                  <span>{isEditing ? "Edit Weekend Configuration" : "Add Weekend Configuration"}</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Name"
                    placeholder="Enter weekend name (e.g., Weekend, Saturday, Sunday)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  
                  <Select
                    label="Day of Week"
                    placeholder="Select day of week"
                    selectedKeys={[formData.day_of_week.toString()]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setFormData({ ...formData, day_of_week: parseInt(selectedKey) });
                    }}
                    isRequired
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Textarea
                    label="Description"
                    placeholder="Enter description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    minRows={2}
                  />

                  <Switch
                    isSelected={formData.is_active}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                  >
                    <div>
                      <p className="font-medium">Active</p>
                      <p className="text-sm text-default-500">This day will be considered a weekend</p>
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
