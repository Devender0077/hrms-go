import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar, Badge, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DatePicker, TimeInput } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";

// Interview interface
interface Interview {
  id: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  interviewer: string;
  interviewerEmail: string;
  type: "phone" | "video" | "in-person" | "technical";
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "no-show";
  location: string;
  meetingLink?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  candidateId: number;
  jobId: string;
  round: number;
  skills: string[];
}

// Sample interviews data
const initialInterviews: Interview[] = [
  {
    id: 1,
    candidateName: "John Smith",
    candidateEmail: "john.smith@email.com",
    candidatePhone: "+1 (555) 123-4567",
    position: "Senior Software Engineer",
    interviewer: "Jane Doe",
    interviewerEmail: "jane.doe@company.com",
    type: "technical",
    scheduledDate: "2025-01-20",
    scheduledTime: "14:00",
    duration: 60,
    status: "scheduled",
    location: "Conference Room A",
    meetingLink: "https://meet.company.com/interview-001",
    notes: "Technical interview focusing on React and Node.js",
    candidateId: 1,
    jobId: "JOB001",
    round: 2,
    skills: ["React", "Node.js", "TypeScript"]
  },
  {
    id: 2,
    candidateName: "Sarah Johnson",
    candidateEmail: "sarah.johnson@email.com",
    candidatePhone: "+1 (555) 234-5678",
    position: "HR Manager",
    interviewer: "Mike Wilson",
    interviewerEmail: "mike.wilson@company.com",
    type: "video",
    scheduledDate: "2025-01-21",
    scheduledTime: "10:00",
    duration: 45,
    status: "scheduled",
    location: "Video Call",
    meetingLink: "https://zoom.us/j/123456789",
    notes: "HR interview to assess cultural fit",
    candidateId: 2,
    jobId: "JOB002",
    round: 1,
    skills: ["HRIS", "Recruitment", "Employee Relations"]
  },
  {
    id: 3,
    candidateName: "Michael Brown",
    candidateEmail: "michael.brown@email.com",
    candidatePhone: "+1 (555) 345-6789",
    position: "Marketing Specialist",
    interviewer: "Lisa Anderson",
    interviewerEmail: "lisa.anderson@company.com",
    type: "phone",
    scheduledDate: "2025-01-18",
    scheduledTime: "15:30",
    duration: 30,
    status: "completed",
    location: "Phone Call",
    notes: "Initial screening call",
    rating: 4,
    feedback: "Good communication skills, relevant experience",
    candidateId: 3,
    jobId: "JOB003",
    round: 1,
    skills: ["Digital Marketing", "SEO", "Social Media"]
  },
  {
    id: 4,
    candidateName: "Emily Davis",
    candidateEmail: "emily.davis@email.com",
    candidatePhone: "+1 (555) 456-7890",
    position: "Financial Analyst",
    interviewer: "David Chen",
    interviewerEmail: "david.chen@company.com",
    type: "in-person",
    scheduledDate: "2025-01-19",
    scheduledTime: "11:00",
    duration: 90,
    status: "completed",
    location: "Office - Room 205",
    notes: "Final round interview with case study",
    rating: 5,
    feedback: "Excellent analytical skills, great cultural fit",
    candidateId: 4,
    jobId: "JOB004",
    round: 3,
    skills: ["Financial Modeling", "Excel", "SQL"]
  },
  {
    id: 5,
    candidateName: "David Wilson",
    candidateEmail: "david.wilson@email.com",
    candidatePhone: "+1 (555) 567-8901",
    position: "Customer Success Manager",
    interviewer: "Sarah Miller",
    interviewerEmail: "sarah.miller@company.com",
    type: "video",
    scheduledDate: "2025-01-17",
    scheduledTime: "16:00",
    duration: 45,
    status: "cancelled",
    location: "Video Call",
    notes: "Candidate cancelled due to emergency",
    candidateId: 5,
    jobId: "JOB005",
    round: 1,
    skills: ["Customer Relations", "CRM", "Sales"]
  }
];

const statusColorMap = {
  scheduled: "primary",
  completed: "success",
  cancelled: "danger",
  rescheduled: "warning",
  "no-show": "danger",
};

const typeColorMap = {
  phone: "default",
  video: "primary",
  "in-person": "secondary",
  technical: "warning",
};

const interviewers = [
  "Jane Doe",
  "Mike Wilson", 
  "Lisa Anderson",
  "David Chen",
  "Sarah Miller",
  "Tom Johnson",
  "Amy Rodriguez"
];

const positions = [
  "Senior Software Engineer",
  "HR Manager",
  "Marketing Specialist", 
  "Financial Analyst",
  "Customer Success Manager",
  "Product Manager",
  "Sales Representative"
];

export default function Interviews() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedInterviewer, setSelectedInterviewer] = useState("all");
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(false);
  
  const rowsPerPage = 10;
  
  // New interview form state
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    position: "",
    interviewer: "",
    interviewerEmail: "",
    type: "video",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    status: "scheduled",
    location: "",
    meetingLink: "",
    notes: "",
    candidateId: 0,
    jobId: "",
    round: 1,
    skills: []
  });
  
  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const matchesSearch = 
        interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || interview.status === selectedStatus;
      const matchesType = selectedType === "all" || interview.type === selectedType;
      const matchesInterviewer = selectedInterviewer === "all" || interview.interviewer === selectedInterviewer;
      
      return matchesSearch && matchesStatus && matchesType && matchesInterviewer;
    });
  }, [interviews, searchQuery, selectedStatus, selectedType, selectedInterviewer]);
  
  // Paginate filtered interviews
  const paginatedInterviews = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredInterviews.slice(startIndex, endIndex);
  }, [filteredInterviews, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalInterviews = interviews.length;
    const scheduledInterviews = interviews.filter(i => i.status === "scheduled").length;
    const completedInterviews = interviews.filter(i => i.status === "completed").length;
    const todayInterviews = interviews.filter(i => 
      i.scheduledDate === new Date().toISOString().split('T')[0] && i.status === "scheduled"
    ).length;
    
    return [
      {
        label: "Total Interviews",
        value: totalInterviews,
        icon: "lucide:calendar",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Scheduled",
        value: scheduledInterviews,
        icon: "lucide:clock",
        color: "text-warning-600",
        bgColor: "bg-warning-100"
      },
      {
        label: "Completed",
        value: completedInterviews,
        icon: "lucide:check-circle",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Today's Interviews",
        value: todayInterviews,
        icon: "lucide:calendar-days",
        color: "text-secondary-600",
        bgColor: "bg-secondary-100"
      }
    ];
  }, [interviews]);

  // Handle schedule interview
  const handleScheduleInterview = async () => {
    if (!newInterview.candidateName || !newInterview.position || !newInterview.interviewer || !newInterview.scheduledDate || !newInterview.scheduledTime) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const interview: Interview = {
      id: Date.now(),
      candidateName: newInterview.candidateName!,
      candidateEmail: newInterview.candidateEmail || "",
      candidatePhone: newInterview.candidatePhone || "",
      position: newInterview.position!,
      interviewer: newInterview.interviewer!,
      interviewerEmail: newInterview.interviewerEmail || "",
      type: newInterview.type as Interview["type"] || "video",
      scheduledDate: newInterview.scheduledDate!,
      scheduledTime: newInterview.scheduledTime!,
      duration: newInterview.duration || 60,
      status: newInterview.status as Interview["status"] || "scheduled",
      location: newInterview.location || "",
      meetingLink: newInterview.meetingLink || "",
      notes: newInterview.notes || "",
      candidateId: newInterview.candidateId || 0,
      jobId: newInterview.jobId || "",
      round: newInterview.round || 1,
      skills: newInterview.skills || []
    };

    setInterviews(prev => [...prev, interview]);
    setNewInterview({
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      position: "",
      interviewer: "",
      interviewerEmail: "",
      type: "video",
      scheduledDate: "",
      scheduledTime: "",
      duration: 60,
      status: "scheduled",
      location: "",
      meetingLink: "",
      notes: "",
      candidateId: 0,
      jobId: "",
      round: 1,
      skills: []
    });
    setIsScheduleModalOpen(false);
    
    addToast({
      title: "Interview Scheduled",
      description: `Interview scheduled for ${interview.candidateName} on ${new Date(interview.scheduledDate).toLocaleDateString()}.`,
      color: "success",
    });
  };

  // Handle status update
  const handleStatusUpdate = (interview: Interview, newStatus: Interview["status"]) => {
    setInterviews(prev => 
      prev.map(i => 
        i.id === interview.id ? { ...i, status: newStatus } : i
      )
    );
    
    addToast({
      title: "Status Updated",
      description: `Interview status updated to ${newStatus}.`,
      color: "success",
    });
  };

  // Handle reschedule interview
  const handleRescheduleInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setNewInterview({
      ...interview,
      scheduledDate: interview.scheduledDate,
      scheduledTime: interview.scheduledTime
    });
    setIsScheduleModalOpen(true);
  };

  // Handle complete interview
  const handleCompleteInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsViewModalOpen(true);
  };

  // Handle delete interview
  const handleDeleteInterview = (interview: Interview) => {
    setInterviews(prev => prev.filter(i => i.id !== interview.id));
    
    addToast({
      title: "Interview Deleted",
      description: `Interview with ${interview.candidateName} has been removed.`,
      color: "success",
    });
  };

  // Calendar view component
  const CalendarView = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get interviews for current month
    const monthInterviews = interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledDate);
      return interviewDate.getMonth() === currentMonth && interviewDate.getFullYear() === currentYear;
    });

    // Generate calendar days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayInterviews = monthInterviews.filter(interview => interview.scheduledDate === dateStr);
      calendarDays.push({ day, interviews: dayInterviews });
    }

    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:calendar" className="text-primary-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Interview Calendar</h3>
                <p className="text-default-500 text-sm">View interviews by date</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="flat"
              onPress={() => setIsCalendarView(false)}
            >
              <Icon icon="lucide:table" className="w-4 h-4 mr-2" />
              Table View
            </Button>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-default-600 p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, index) => (
              <div key={index} className="min-h-[100px] border border-default-300 rounded-lg p-2">
                {dayData ? (
                  <div>
                    <div className="font-semibold text-foreground mb-1">{dayData.day}</div>
                    <div className="space-y-1">
                      {dayData.interviews.map(interview => (
                        <div
                          key={interview.id}
                          className="text-xs p-1 bg-primary-100 text-primary-800 rounded cursor-pointer hover:bg-primary-200"
                          onClick={() => {
                            setSelectedInterview(interview);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <div className="font-medium truncate">{interview.candidateName}</div>
                          <div className="text-primary-600">{interview.scheduledTime}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl">
              <Icon icon="lucide:calendar" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
              <p className="text-default-600 mt-1">Schedule and manage candidate interviews</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:calendar" />}
              onPress={() => setIsCalendarView(true)}
              className="font-medium"
            >
              Calendar View
            </Button>
            <Button 
              color="primary" 
              startContent={<Icon icon="lucide:plus" />} 
              onPress={() => setIsScheduleModalOpen(true)}
              className="font-medium"
            >
              Schedule Interview
            </Button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
                </div>
                <div>
                  <p className="text-default-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {isCalendarView ? (
          <CalendarView />
        ) : (
          <>
            {/* Filters */}
            <Card className="border-0 shadow-sm">
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Input
                    placeholder="Search interviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  />
                  <Select
                    label="Status"
                    placeholder="All Statuses"
                    selectedKeys={[selectedStatus]}
                    onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                  >
                    <SelectItem key="all">All Statuses</SelectItem>
                    <SelectItem key="scheduled">Scheduled</SelectItem>
                    <SelectItem key="completed">Completed</SelectItem>
                    <SelectItem key="cancelled">Cancelled</SelectItem>
                    <SelectItem key="rescheduled">Rescheduled</SelectItem>
                    <SelectItem key="no-show">No Show</SelectItem>
                  </Select>
                  <Select
                    label="Type"
                    placeholder="All Types"
                    selectedKeys={[selectedType]}
                    onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0] as string)}
                  >
                    <SelectItem key="all">All Types</SelectItem>
                    <SelectItem key="phone">Phone</SelectItem>
                    <SelectItem key="video">Video</SelectItem>
                    <SelectItem key="in-person">In-Person</SelectItem>
                    <SelectItem key="technical">Technical</SelectItem>
                  </Select>
                  <Select
                    label="Interviewer"
                    placeholder="All Interviewers"
                    selectedKeys={[selectedInterviewer]}
                    onSelectionChange={(keys) => setSelectedInterviewer(Array.from(keys)[0] as string)}
                  >
                    <SelectItem key="all">All Interviewers</SelectItem>
                    {interviewers.map(interviewer => (
                      <SelectItem key={interviewer}>{interviewer}</SelectItem>
                    ))}
                  </Select>
                  <div className="flex items-end">
                    <div className="text-sm text-default-600">
                      Showing {filteredInterviews.length} of {interviews.length} interviews
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Data Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:table" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Interviews List</h3>
                    <p className="text-default-500 text-sm">Manage and track interview schedules</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <Table aria-label="Interviews table">
                  <TableHeader>
                    <TableColumn>CANDIDATE</TableColumn>
                    <TableColumn>POSITION</TableColumn>
                    <TableColumn>INTERVIEWER</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>DATE & TIME</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paginatedInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar 
                              name={interview.candidateName}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-foreground">{interview.candidateName}</p>
                              <p className="text-sm text-default-500">{interview.candidateEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{interview.position}</p>
                            <p className="text-sm text-default-500">Round {interview.round}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{interview.interviewer}</p>
                            <p className="text-sm text-default-500">{interview.interviewerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={typeColorMap[interview.type] as any}
                            variant="flat"
                          >
                            {interview.type}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{new Date(interview.scheduledDate).toLocaleDateString()}</p>
                            <p className="text-sm text-default-500">{interview.scheduledTime} ({interview.duration}min)</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={statusColorMap[interview.status] as any}
                            variant="flat"
                          >
                            {interview.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => {
                                setSelectedInterview(interview);
                                setIsViewModalOpen(true);
                              }}
                            >
                              <Icon icon="lucide:eye" className="w-4 h-4" />
                            </Button>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button size="sm" variant="flat">
                                  <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu>
                                {interview.status === "scheduled" && (
                                  <>
                                    <DropdownItem key="complete" onPress={() => handleCompleteInterview(interview)}>
                                      Complete Interview
                                    </DropdownItem>
                                    <DropdownItem key="reschedule" onPress={() => handleRescheduleInterview(interview)}>
                                      Reschedule
                                    </DropdownItem>
                                    <DropdownItem key="cancel" onPress={() => handleStatusUpdate(interview, "cancelled")}>
                                      Cancel
                                    </DropdownItem>
                                  </>
                                )}
                                {interview.status === "completed" && (
                                  <DropdownItem key="view-feedback" onPress={() => {
                                    setSelectedInterview(interview);
                                    setIsViewModalOpen(true);
                                  }}>
                                    View Feedback
                                  </DropdownItem>
                                )}
                                <DropdownItem key="delete" className="text-danger" onPress={() => handleDeleteInterview(interview)}>
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredInterviews.length > rowsPerPage && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      total={Math.ceil(filteredInterviews.length / rowsPerPage)}
                      page={page}
                      onChange={setPage}
                      showControls
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}

        {/* Schedule Interview Modal */}
        <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>
              {selectedInterview ? "Reschedule Interview" : "Schedule New Interview"}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Candidate Name *"
                  placeholder="Enter candidate name"
                  value={newInterview.candidateName || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, candidateName: e.target.value }))}
                />
                <Input
                  label="Candidate Email"
                  type="email"
                  placeholder="Enter email address"
                  value={newInterview.candidateEmail || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, candidateEmail: e.target.value }))}
                />
                <Input
                  label="Candidate Phone"
                  placeholder="Enter phone number"
                  value={newInterview.candidatePhone || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, candidatePhone: e.target.value }))}
                />
                <Select
                  label="Position *"
                  placeholder="Select position"
                  selectedKeys={newInterview.position ? [newInterview.position] : []}
                  onSelectionChange={(keys) => setNewInterview(prev => ({ ...prev, position: Array.from(keys)[0] as string }))}
                >
                  {positions.map(position => (
                    <SelectItem key={position}>{position}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Interviewer *"
                  placeholder="Select interviewer"
                  selectedKeys={newInterview.interviewer ? [newInterview.interviewer] : []}
                  onSelectionChange={(keys) => setNewInterview(prev => ({ ...prev, interviewer: Array.from(keys)[0] as string }))}
                >
                  {interviewers.map(interviewer => (
                    <SelectItem key={interviewer}>{interviewer}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Interviewer Email"
                  type="email"
                  placeholder="Enter interviewer email"
                  value={newInterview.interviewerEmail || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, interviewerEmail: e.target.value }))}
                />
                <Select
                  label="Interview Type *"
                  placeholder="Select type"
                  selectedKeys={newInterview.type ? [newInterview.type] : []}
                  onSelectionChange={(keys) => setNewInterview(prev => ({ ...prev, type: Array.from(keys)[0] as Interview["type"] }))}
                >
                  <SelectItem key="phone">Phone</SelectItem>
                  <SelectItem key="video">Video</SelectItem>
                  <SelectItem key="in-person">In-Person</SelectItem>
                  <SelectItem key="technical">Technical</SelectItem>
                </Select>
                <Input
                  label="Duration (minutes)"
                  type="number"
                  placeholder="60"
                  value={newInterview.duration || 60}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                />
                <Input
                  label="Scheduled Date *"
                  type="date"
                  value={newInterview.scheduledDate || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
                <Input
                  label="Scheduled Time *"
                  type="time"
                  value={newInterview.scheduledTime || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
                <Input
                  label="Location"
                  placeholder="Conference Room A or Video Call"
                  value={newInterview.location || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, location: e.target.value }))}
                />
                <Input
                  label="Meeting Link"
                  placeholder="https://meet.company.com/interview"
                  value={newInterview.meetingLink || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, meetingLink: e.target.value }))}
                />
                <Input
                  label="Job ID"
                  placeholder="JOB001"
                  value={newInterview.jobId || ""}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, jobId: e.target.value }))}
                />
                <Input
                  label="Round"
                  type="number"
                  placeholder="1"
                  value={newInterview.round || 1}
                  onChange={(e) => setNewInterview(prev => ({ ...prev, round: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <Textarea
                label="Notes"
                placeholder="Additional notes about the interview"
                value={newInterview.notes || ""}
                onChange={(e) => setNewInterview(prev => ({ ...prev, notes: e.target.value }))}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => {
                setIsScheduleModalOpen(false);
                setSelectedInterview(null);
              }}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleScheduleInterview}>
                {selectedInterview ? "Reschedule Interview" : "Schedule Interview"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Interview Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="3xl">
          <ModalContent>
            <ModalHeader>Interview Details</ModalHeader>
            <ModalBody>
              {selectedInterview && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={selectedInterview.candidateName}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedInterview.candidateName}</h3>
                      <p className="text-default-600">{selectedInterview.candidateEmail}</p>
                      <p className="text-default-600">{selectedInterview.candidatePhone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Interview Details</h4>
                      <p><strong>Position:</strong> {selectedInterview.position}</p>
                      <p><strong>Interviewer:</strong> {selectedInterview.interviewer}</p>
                      <p><strong>Type:</strong> 
                        <Chip size="sm" color={typeColorMap[selectedInterview.type] as any} variant="flat" className="ml-2">
                          {selectedInterview.type}
                        </Chip>
                      </p>
                      <p><strong>Round:</strong> {selectedInterview.round}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Schedule</h4>
                      <p><strong>Date:</strong> {new Date(selectedInterview.scheduledDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {selectedInterview.scheduledTime}</p>
                      <p><strong>Duration:</strong> {selectedInterview.duration} minutes</p>
                      <p><strong>Location:</strong> {selectedInterview.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    <Chip
                      size="md"
                      color={statusColorMap[selectedInterview.status] as any}
                      variant="flat"
                    >
                      {selectedInterview.status}
                    </Chip>
                  </div>
                  
                  {selectedInterview.meetingLink && (
                    <div>
                      <h4 className="font-semibold mb-2">Meeting Link</h4>
                      <a 
                        href={selectedInterview.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 underline"
                      >
                        {selectedInterview.meetingLink}
                      </a>
                    </div>
                  )}
                  
                  {selectedInterview.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-default-700">{selectedInterview.notes}</p>
                    </div>
                  )}
                  
                  {selectedInterview.status === "completed" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Rating</h4>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Icon
                              key={star}
                              icon="lucide:star"
                              className={`w-5 h-5 ${
                                star <= (selectedInterview.rating || 0) 
                                  ? "text-warning-400 fill-current" 
                                  : "text-default-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-default-600">
                            {selectedInterview.rating || 0}/5
                          </span>
                        </div>
                      </div>
                      
                      {selectedInterview.feedback && (
                        <div>
                          <h4 className="font-semibold mb-2">Feedback</h4>
                          <p className="text-default-700">{selectedInterview.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}