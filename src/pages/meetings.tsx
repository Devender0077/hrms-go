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
  Select,
  SelectItem,
  addToast,
  Spinner,
  Tabs,
  Tab,
  Checkbox
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { apiRequest } from "../services/api-service";
import HeroSection from "../components/common/HeroSection";

interface Meeting {
  id: number;
  title: string;
  meeting_type: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  organizer: string;
  attendees: string[];
  video_link?: string;
  created_at: string;
}

interface MeetingType {
  id: number;
  name: string;
  description: string;
  color: string;
  default_duration: number;
  status: 'active' | 'inactive';
}

interface MeetingRoom {
  id: number;
  name: string;
  location: string;
  capacity: number;
  equipment: string[];
  status: 'active' | 'inactive';
}

export default function MeetingsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    meeting_type: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
    video_link: "",
    attendees: [] as string[],
    status: "scheduled" as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, typesRes, roomsRes] = await Promise.all([
        apiRequest("/meetings"),
        apiRequest("/meeting-types"),
        apiRequest("/meeting-rooms")
      ]);

      if (meetingsRes.success) setMeetings(meetingsRes.data || []);
      if (typesRes.success) setMeetingTypes(typesRes.data || []);
      if (roomsRes.success) setMeetingRooms(roomsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      addToast({
        title: "Error",
        description: "Failed to load meetings data",
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/meetings/${selectedMeeting?.id}` : "/meetings";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      if (response.success) {
        addToast({
          title: "Success",
          description: `Meeting ${isEditing ? "updated" : "scheduled"} successfully`,
          color: "success"
        });
        loadData();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving meeting:", error);
      addToast({
        title: "Error",
        description: "Failed to save meeting",
        color: "danger"
      });
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      meeting_type: meeting.meeting_type,
      date: meeting.date,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      location: meeting.location || "",
      description: meeting.description || "",
      video_link: meeting.video_link || "",
      attendees: meeting.attendees,
      status: meeting.status
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      try {
        const response = await apiRequest(`/meetings/${id}`, {
          method: "DELETE"
        });

        if (response.success) {
          addToast({
            title: "Success",
            description: "Meeting deleted successfully",
            color: "success"
          });
          loadData();
        }
      } catch (error) {
        console.error("Error deleting meeting:", error);
        addToast({
          title: "Error",
          description: "Failed to delete meeting",
          color: "danger"
        });
      }
    }
  };

  const handleCloseModal = () => {
    setFormData({
      title: "",
      meeting_type: "",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      description: "",
      video_link: "",
      attendees: [],
      status: "scheduled"
    });
    setSelectedMeeting(null);
    setIsEditing(false);
    onOpenChange();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 mt-4">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <HeroSection
          title="Meeting Management"
          subtitle="Meeting Scheduler"
          description="Schedule, manage, and track meetings with integrated calendar, video conferencing, and meeting minutes."
          icon="lucide:calendar"
          illustration="meetings"
          actions={[
            {
              label: "Schedule Meeting",
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
                <h3 className="text-lg font-semibold">Meetings</h3>
                <p className="text-sm text-default-500">Schedule and manage company meetings</p>
              </div>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
                onPress={onOpen}
              >
                Schedule Meeting
              </Button>
            </CardHeader>
            <CardBody>
              <Table aria-label="Meetings table">
                <TableHeader>
                  <TableColumn>MEETING</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>DATE & TIME</TableColumn>
                  <TableColumn>LOCATION</TableColumn>
                  <TableColumn>ATTENDEES</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No meetings found">
                  {meetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{meeting.title}</p>
                          {meeting.description && (
                            <p className="text-sm text-default-500 line-clamp-2">{meeting.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {meetingTypes.find(t => t.name === meeting.meeting_type)?.name || meeting.meeting_type}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(meeting.date).toLocaleDateString()}</p>
                          <p className="text-default-500">
                            {meeting.start_time} - {meeting.end_time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {meeting.location ? (
                            <p>{meeting.location}</p>
                          ) : meeting.video_link ? (
                            <div className="flex items-center gap-1">
                              <Icon icon="lucide:video" className="w-3 h-3" />
                              <span>Online</span>
                            </div>
                          ) : (
                            <span className="text-default-500">TBD</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{meeting.attendees.length} attendees</p>
                          <p className="text-default-500">Organized by {meeting.organizer}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(meeting.status)}
                          variant="flat"
                          size="sm"
                        >
                          {meeting.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Meeting actions">
                            <DropdownItem
                              key="edit"
                              startContent={<Icon icon="lucide:edit" />}
                              onPress={() => handleEdit(meeting)}
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
                              key="minutes"
                              startContent={<Icon icon="lucide:file-text" />}
                            >
                              Meeting Minutes
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash" />}
                              onPress={() => handleDelete(meeting.id)}
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
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? "Edit Meeting" : "Schedule New Meeting"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Meeting Title"
                    placeholder="Enter meeting title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    isRequired
                  />

                  <Select
                    label="Meeting Type"
                    placeholder="Select meeting type"
                    selectedKeys={formData.meeting_type ? [formData.meeting_type] : []}
                    onSelectionChange={(keys) => setFormData({ ...formData, meeting_type: Array.from(keys)[0] as string })}
                  >
                    {meetingTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Start Time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="End Time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      isRequired
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Location"
                      placeholder="Enter meeting location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <Input
                      label="Video Link"
                      placeholder="Enter video conferencing link"
                      value={formData.video_link}
                      onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
                    />
                  </div>

                  <Textarea
                    label="Description"
                    placeholder="Enter meeting description and agenda"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />

                  <Input
                    label="Attendees"
                    placeholder="Enter attendee emails (comma separated)"
                    value={formData.attendees.join(", ")}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      attendees: e.target.value.split(",").map(email => email.trim()).filter(Boolean)
                    })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleCloseModal}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {isEditing ? "Update" : "Schedule"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
