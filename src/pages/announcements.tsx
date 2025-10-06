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
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  Checkbox,
  addToast,
  Spinner,
  Tabs,
  Tab
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { apiRequest } from "../services/api-service";
import HeroSection from "../components/common/HeroSection";

interface Announcement {
  id: number;
  title: string;
  category: string;
  description: string;
  content: string;
  start_date: string;
  end_date?: string;
  is_featured: boolean;
  is_high_priority: boolean;
  is_company_wide: boolean;
  target_departments?: string[];
  target_branches?: string[];
  attachments?: string[];
  created_at: string;
  created_by: string;
  view_count: number;
}

export default function AnnouncementsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "company_news",
    description: "",
    content: "",
    start_date: "",
    end_date: "",
    is_featured: false,
    is_high_priority: false,
    is_company_wide: true,
    target_departments: [] as string[],
    target_branches: [] as string[]
  });

  const categories = [
    { key: "company_news", label: "Company News" },
    { key: "policy_updates", label: "Policy Updates" },
    { key: "events", label: "Events" },
    { key: "announcements", label: "General Announcements" },
    { key: "training", label: "Training" },
    { key: "hr_updates", label: "HR Updates" }
  ];

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/announcements");
      if (response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (error) {
      console.error("Error loading announcements:", error);
      addToast({
        title: "Error",
        description: "Failed to load announcements",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/announcements/${selectedAnnouncement?.id}` : "/announcements";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Announcement ${isEditing ? "updated" : "created"} successfully`,
          color: "success"
        });
        loadAnnouncements();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      addToast({
        title: "Error",
        description: "Failed to save announcement",
        color: "danger"
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      category: announcement.category,
      description: announcement.description,
      content: announcement.content,
      start_date: announcement.start_date,
      end_date: announcement.end_date || "",
      is_featured: announcement.is_featured,
      is_high_priority: announcement.is_high_priority,
      is_company_wide: announcement.is_company_wide,
      target_departments: announcement.target_departments || [],
      target_branches: announcement.target_branches || []
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        const response = await apiRequest(`/announcements/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Announcement deleted successfully",
            color: "success"
          });
          loadAnnouncements();
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        addToast({
          title: "Error",
          description: "Failed to delete announcement",
          color: "danger"
        });
      }
    }
  };

  const handleCloseModal = () => {
    setFormData({
      title: "",
      category: "company_news",
      description: "",
      content: "",
      start_date: "",
      end_date: "",
      is_featured: false,
      is_high_priority: false,
      is_company_wide: true,
      target_departments: [],
      target_branches: []
    });
    setSelectedAnnouncement(null);
    setIsEditing(false);
    onOpenChange();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'company_news': return 'primary';
      case 'policy_updates': return 'warning';
      case 'events': return 'success';
      case 'training': return 'secondary';
      case 'hr_updates': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 mt-4">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <HeroSection
          title="Company Announcements"
          subtitle="Announcement Management"
          description="Create and manage company announcements, policy updates, and important notifications for all employees."
          icon="lucide:megaphone"
          illustration="announcements"
          actions={[
            {
              label: "Create Announcement",
              icon: "lucide:plus",
              onPress: onOpen,
              color: "primary" as const
            }
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Announcements</h3>
                <p className="text-sm text-default-500">Manage company announcements and notifications</p>
              </div>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
                onPress={onOpen}
              >
                Create Announcement
              </Button>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-2">{announcement.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Chip
                              size="sm"
                              color={getCategoryColor(announcement.category)}
                              variant="flat"
                            >
                              {categories.find(c => c.key === announcement.category)?.label}
                            </Chip>
                            {announcement.is_featured && (
                              <Chip size="sm" color="warning" variant="flat">
                                Featured
                              </Chip>
                            )}
                            {announcement.is_high_priority && (
                              <Chip size="sm" color="danger" variant="flat">
                                High Priority
                              </Chip>
                            )}
                          </div>
                        </div>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Announcement actions">
                            <DropdownItem
                              key="edit"
                              startContent={<Icon icon="lucide:edit" />}
                              onPress={() => handleEdit(announcement)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="view"
                              startContent={<Icon icon="lucide:eye" />}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash" />}
                              onPress={() => handleDelete(announcement.id)}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <p className="text-sm text-default-600 line-clamp-3 mb-3">
                        {announcement.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-default-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Icon icon="lucide:eye" className="w-3 h-3" />
                            {announcement.view_count}
                          </span>
                          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                        </div>
                        <span>By {announcement.created_by}</span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              
              {announcements.length === 0 && (
                <div className="text-center py-12">
                  <Icon icon="lucide:megaphone" className="w-16 h-16 text-default-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
                  <p className="text-default-500 mb-4">Create your first announcement to get started.</p>
                  <Button color="primary" onPress={onOpen}>
                    Create Announcement
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? "Edit Announcement" : "Create New Announcement"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Title"
                    placeholder="Enter announcement title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    isRequired
                  />

                  <Select
                    label="Category"
                    placeholder="Select category"
                    selectedKeys={[formData.category]}
                    onSelectionChange={(keys) => setFormData({ ...formData, category: Array.from(keys)[0] as string })}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.key} value={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Textarea
                    label="Description"
                    placeholder="Enter brief description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />

                  <Textarea
                    label="Content"
                    placeholder="Enter detailed content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    isRequired
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Checkbox
                      isSelected={formData.is_featured}
                      onValueChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    >
                      Featured Announcement
                    </Checkbox>
                    <Checkbox
                      isSelected={formData.is_high_priority}
                      onValueChange={(checked) => setFormData({ ...formData, is_high_priority: checked })}
                    >
                      High Priority
                    </Checkbox>
                    <Checkbox
                      isSelected={formData.is_company_wide}
                      onValueChange={(checked) => setFormData({ ...formData, is_company_wide: checked })}
                    >
                      Company Wide
                    </Checkbox>
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
    </div>
  );
}
