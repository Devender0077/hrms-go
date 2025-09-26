import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";

// Performance review interface
interface PerformanceReview {
  id: number;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriod: string;
  reviewType: "annual" | "quarterly" | "probation" | "promotion";
  status: "draft" | "in-progress" | "completed" | "approved" | "rejected";
  overallRating: number; // 1-5
  goalsRating: number;
  skillsRating: number;
  behaviorRating: number;
  attendanceRating: number;
  scheduledDate: string;
  completedDate?: string;
  dueDate: string;
  department: string;
  position: string;
  goals: string[];
  achievements: string[];
  areasForImprovement: string[];
  feedback: string;
  employeeComments?: string;
  managerComments?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample reviews data
const initialReviews: PerformanceReview[] = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "John Smith",
    reviewerId: "MGR001",
    reviewerName: "Jane Doe",
    reviewPeriod: "Q4 2024",
    reviewType: "quarterly",
    status: "completed",
    overallRating: 4.2,
    goalsRating: 4,
    skillsRating: 4.5,
    behaviorRating: 4,
    attendanceRating: 4.5,
    scheduledDate: "2024-12-15",
    completedDate: "2024-12-20",
    dueDate: "2024-12-31",
    department: "IT",
    position: "Senior Software Engineer",
    goals: ["Complete React certification", "Lead 2 major projects", "Mentor junior developers"],
    achievements: ["Successfully delivered Project Alpha", "Improved team productivity by 20%", "Completed React certification"],
    areasForImprovement: ["Time management", "Documentation skills"],
    feedback: "Excellent performance this quarter. John has shown great leadership skills and technical expertise.",
    employeeComments: "I'm satisfied with my performance and look forward to taking on more challenging projects.",
    managerComments: "John has exceeded expectations and is ready for a promotion consideration.",
    nextReviewDate: "2025-03-31",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-20"
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Sarah Johnson",
    reviewerId: "MGR002",
    reviewerName: "Mike Wilson",
    reviewPeriod: "Annual 2024",
    reviewType: "annual",
    status: "in-progress",
    overallRating: 0,
    goalsRating: 0,
    skillsRating: 0,
    behaviorRating: 0,
    attendanceRating: 0,
    scheduledDate: "2025-01-15",
    dueDate: "2025-01-31",
    department: "HR",
    position: "HR Manager",
    goals: ["Implement new HRIS system", "Reduce recruitment time by 30%", "Improve employee satisfaction"],
    achievements: [],
    areasForImprovement: [],
    feedback: "",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01"
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Michael Brown",
    reviewerId: "MGR003",
    reviewerName: "Lisa Anderson",
    reviewPeriod: "Probation Review",
    reviewType: "probation",
    status: "draft",
    overallRating: 0,
    goalsRating: 0,
    skillsRating: 0,
    behaviorRating: 0,
    attendanceRating: 0,
    scheduledDate: "2025-02-01",
    dueDate: "2025-02-15",
    department: "Marketing",
    position: "Marketing Specialist",
    goals: ["Learn company processes", "Complete marketing training", "Contribute to 3 campaigns"],
    achievements: [],
    areasForImprovement: [],
    feedback: "",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01"
  }
];

const statusColorMap = {
  draft: "default",
  "in-progress": "primary",
  completed: "success",
  approved: "success",
  rejected: "danger",
};

const typeColorMap = {
  annual: "primary",
  quarterly: "secondary",
  probation: "warning",
  promotion: "success",
};

const employees = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Emily Davis",
  "David Wilson",
  "Lisa Anderson",
  "Tom Johnson",
  "Amy Rodriguez"
];

const reviewers = [
  "Jane Doe",
  "Mike Wilson",
  "Lisa Anderson",
  "David Chen",
  "Sarah Miller",
  "Tom Johnson",
  "Amy Rodriguez"
];

const departments = [
  "IT",
  "HR",
  "Marketing",
  "Sales",
  "Customer Success",
  "Finance",
  "Operations"
];

export default function Reviews() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [reviews, setReviews] = useState<PerformanceReview[]>(initialReviews);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const rowsPerPage = 10;
  
  // New review form state
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({
    employeeId: "",
    employeeName: "",
    reviewerId: "",
    reviewerName: "",
    reviewPeriod: "",
    reviewType: "quarterly",
    status: "draft",
    overallRating: 0,
    goalsRating: 0,
    skillsRating: 0,
    behaviorRating: 0,
    attendanceRating: 0,
    scheduledDate: "",
    dueDate: "",
    department: "",
    position: "",
    goals: [],
    achievements: [],
    areasForImprovement: [],
    feedback: ""
  });
  
  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = 
        review.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewPeriod.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || review.status === selectedStatus;
      const matchesType = selectedType === "all" || review.reviewType === selectedType;
      const matchesEmployee = selectedEmployee === "all" || review.employeeName === selectedEmployee;
      
      return matchesSearch && matchesStatus && matchesType && matchesEmployee;
    });
  }, [reviews, searchQuery, selectedStatus, selectedType, selectedEmployee]);
  
  // Paginate filtered reviews
  const paginatedReviews = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredReviews.slice(startIndex, endIndex);
  }, [filteredReviews, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const completedReviews = reviews.filter(r => r.status === "completed").length;
    const inProgressReviews = reviews.filter(r => r.status === "in-progress").length;
    const overdueReviews = reviews.filter(r => 
      r.status !== "completed" && new Date(r.dueDate) < new Date()
    ).length;
    
    return [
      {
        label: "Total Reviews",
        value: totalReviews,
        icon: "lucide:clipboard-check",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        label: "Completed",
        value: completedReviews,
        icon: "lucide:check-circle",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "In Progress",
        value: inProgressReviews,
        icon: "lucide:clock",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        label: "Overdue",
        value: overdueReviews,
        icon: "lucide:alert-triangle",
        color: "text-red-600",
        bgColor: "bg-red-100"
      }
    ];
  }, [reviews]);

  // Handle schedule review
  const handleScheduleReview = async () => {
    if (!newReview.employeeName || !newReview.reviewerName || !newReview.scheduledDate || !newReview.dueDate) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields (Employee, Reviewer, Scheduled Date, Due Date).",
        color: "warning",
      });
      return;
    }

    const review: PerformanceReview = {
      id: Date.now(),
      employeeId: newReview.employeeId || `EMP${Date.now()}`,
      employeeName: newReview.employeeName!,
      reviewerId: newReview.reviewerId || `MGR${Date.now()}`,
      reviewerName: newReview.reviewerName!,
      reviewPeriod: newReview.reviewPeriod || "",
      reviewType: newReview.reviewType as PerformanceReview["reviewType"] || "quarterly",
      status: newReview.status as PerformanceReview["status"] || "draft",
      overallRating: newReview.overallRating || 0,
      goalsRating: newReview.goalsRating || 0,
      skillsRating: newReview.skillsRating || 0,
      behaviorRating: newReview.behaviorRating || 0,
      attendanceRating: newReview.attendanceRating || 0,
      scheduledDate: newReview.scheduledDate!,
      dueDate: newReview.dueDate!,
      department: newReview.department || "",
      position: newReview.position || "",
      goals: newReview.goals || [],
      achievements: newReview.achievements || [],
      areasForImprovement: newReview.areasForImprovement || [],
      feedback: newReview.feedback || "",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setReviews(prev => [...prev, review]);
    setNewReview({
      employeeId: "",
      employeeName: "",
      reviewerId: "",
      reviewerName: "",
      reviewPeriod: "",
      reviewType: "quarterly",
      status: "draft",
      overallRating: 0,
      goalsRating: 0,
      skillsRating: 0,
      behaviorRating: 0,
      attendanceRating: 0,
      scheduledDate: "",
      dueDate: "",
      department: "",
      position: "",
      goals: [],
      achievements: [],
      areasForImprovement: [],
      feedback: ""
    });
    setIsScheduleModalOpen(false);
    
    addToast({
      title: "Review Scheduled",
      description: `Performance review scheduled for ${review.employeeName} on ${new Date(review.scheduledDate).toLocaleDateString()}.`,
      color: "success",
    });
  };

  // Handle edit review
  const handleEditReview = async () => {
    if (!selectedReview || !newReview.employeeName || !newReview.reviewerName) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const updatedReview: PerformanceReview = {
      ...selectedReview,
      employeeName: newReview.employeeName!,
      reviewerName: newReview.reviewerName!,
      reviewPeriod: newReview.reviewPeriod || selectedReview.reviewPeriod,
      reviewType: newReview.reviewType as PerformanceReview["reviewType"] || selectedReview.reviewType,
      status: newReview.status as PerformanceReview["status"] || selectedReview.status,
      overallRating: newReview.overallRating || selectedReview.overallRating,
      goalsRating: newReview.goalsRating || selectedReview.goalsRating,
      skillsRating: newReview.skillsRating || selectedReview.skillsRating,
      behaviorRating: newReview.behaviorRating || selectedReview.behaviorRating,
      attendanceRating: newReview.attendanceRating || selectedReview.attendanceRating,
      scheduledDate: newReview.scheduledDate || selectedReview.scheduledDate,
      dueDate: newReview.dueDate || selectedReview.dueDate,
      department: newReview.department || selectedReview.department,
      position: newReview.position || selectedReview.position,
      goals: newReview.goals || selectedReview.goals,
      achievements: newReview.achievements || selectedReview.achievements,
      areasForImprovement: newReview.areasForImprovement || selectedReview.areasForImprovement,
      feedback: newReview.feedback || selectedReview.feedback,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setReviews(prev => prev.map(r => r.id === selectedReview.id ? updatedReview : r));
    setIsEditModalOpen(false);
    setSelectedReview(null);
    
    addToast({
      title: "Review Updated",
      description: `Performance review for ${updatedReview.employeeName} has been updated successfully.`,
      color: "success",
    });
  };

  // Handle status update
  const handleStatusUpdate = (review: PerformanceReview, newStatus: PerformanceReview["status"]) => {
    const updatedReview = {
      ...review,
      status: newStatus,
      completedDate: newStatus === "completed" ? new Date().toISOString().split('T')[0] : undefined,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setReviews(prev => prev.map(r => r.id === review.id ? updatedReview : r));
    
    addToast({
      title: "Status Updated",
      description: `Review status updated to ${newStatus} for ${review.employeeName}.`,
      color: "success",
    });
  };

  // Handle delete review
  const handleDeleteReview = (review: PerformanceReview) => {
    setReviews(prev => prev.filter(r => r.id !== review.id));
    
    addToast({
      title: "Review Deleted",
      description: `Performance review for ${review.employeeName} has been removed.`,
      color: "success",
    });
  };

  // Open edit modal
  const openEditModal = (review: PerformanceReview) => {
    setSelectedReview(review);
    setNewReview({
      employeeName: review.employeeName,
      reviewerName: review.reviewerName,
      reviewPeriod: review.reviewPeriod,
      reviewType: review.reviewType,
      status: review.status,
      overallRating: review.overallRating,
      goalsRating: review.goalsRating,
      skillsRating: review.skillsRating,
      behaviorRating: review.behaviorRating,
      attendanceRating: review.attendanceRating,
      scheduledDate: review.scheduledDate,
      dueDate: review.dueDate,
      department: review.department,
      position: review.position,
      goals: review.goals,
      achievements: review.achievements,
      areasForImprovement: review.areasForImprovement,
      feedback: review.feedback
    });
    setIsEditModalOpen(true);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Performance Reviews"
        description="Schedule and manage employee performance reviews"
        icon="lucide:clipboard-check"
        iconColor="from-purple-500 to-indigo-600"
        actions={
          <Button 
            color="primary"
            startContent={<Icon icon="lucide:plus" />} 
            onPress={() => setIsScheduleModalOpen(true)}
          >
            Schedule Review
          </Button>
        }
      />
        
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

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Status"
                placeholder="All Statuses"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="draft">Draft</SelectItem>
                <SelectItem key="in-progress">In Progress</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="approved">Approved</SelectItem>
                <SelectItem key="rejected">Rejected</SelectItem>
              </Select>
              <Select
                label="Type"
                placeholder="All Types"
                selectedKeys={[selectedType]}
                onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="annual">Annual</SelectItem>
                <SelectItem key="quarterly">Quarterly</SelectItem>
                <SelectItem key="probation">Probation</SelectItem>
                <SelectItem key="promotion">Promotion</SelectItem>
              </Select>
              <Select
                label="Employee"
                placeholder="All Employees"
                selectedKeys={[selectedEmployee]}
                onSelectionChange={(keys) => setSelectedEmployee(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee}>{employee}</SelectItem>
                ))}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredReviews.length} of {reviews.length} reviews
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-purple-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reviews List</h3>
                <p className="text-gray-500 text-sm">Track and manage performance reviews</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Reviews table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>REVIEWER</TableColumn>
                <TableColumn>PERIOD</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>RATING</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SCHEDULED DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={review.employeeName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{review.employeeName}</p>
                          <p className="text-sm text-gray-500">{review.position}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{review.reviewerName}</p>
                        <p className="text-sm text-gray-500">{review.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{review.reviewPeriod}</p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={typeColorMap[review.reviewType] as any}
                        variant="flat"
                      >
                        {review.reviewType}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {review.overallRating > 0 ? (
                          <>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Icon
                                  key={star}
                                  icon="lucide:star"
                                  className={`w-4 h-4 ${
                                    star <= review.overallRating 
                                      ? "text-yellow-400 fill-current" 
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{review.overallRating.toFixed(1)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Not rated</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[review.status] as any}
                        variant="flat"
                      >
                        {review.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{new Date(review.scheduledDate).toLocaleDateString()}</p>
                        {new Date(review.dueDate) < new Date() && review.status !== "completed" && (
                          <p className="text-xs text-red-500">Overdue</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedReview(review);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => openEditModal(review)}
                        >
                          <Icon icon="lucide:edit" className="w-4 h-4" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="flat">
                              <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem key="start" onPress={() => handleStatusUpdate(review, "in-progress")}>
                              Start Review
                            </DropdownItem>
                            <DropdownItem key="complete" onPress={() => handleStatusUpdate(review, "completed")}>
                              Complete Review
                            </DropdownItem>
                            <DropdownItem key="approve" onPress={() => handleStatusUpdate(review, "approved")}>
                              Approve
                            </DropdownItem>
                            <DropdownItem key="reject" onPress={() => handleStatusUpdate(review, "rejected")}>
                              Reject
                            </DropdownItem>
                            <DropdownItem key="delete" className="text-danger" onPress={() => handleDeleteReview(review)}>
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
            
            {filteredReviews.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredReviews.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Schedule Review Modal */}
        <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Schedule New Review</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Employee *"
                  placeholder="Select employee"
                  selectedKeys={newReview.employeeName ? [newReview.employeeName] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, employeeName: Array.from(keys)[0] as string }))}
                >
                  {employees.map(employee => (
                    <SelectItem key={employee}>{employee}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Reviewer *"
                  placeholder="Select reviewer"
                  selectedKeys={newReview.reviewerName ? [newReview.reviewerName] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, reviewerName: Array.from(keys)[0] as string }))}
                >
                  {reviewers.map(reviewer => (
                    <SelectItem key={reviewer}>{reviewer}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Review Period"
                  placeholder="e.g., Q4 2024, Annual 2024"
                  value={newReview.reviewPeriod || ""}
                  onChange={(e) => setNewReview(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                />
                <Select
                  label="Review Type"
                  placeholder="Select type"
                  selectedKeys={newReview.reviewType ? [newReview.reviewType] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, reviewType: Array.from(keys)[0] as PerformanceReview["reviewType"] }))}
                >
                  <SelectItem key="annual">Annual</SelectItem>
                  <SelectItem key="quarterly">Quarterly</SelectItem>
                  <SelectItem key="probation">Probation</SelectItem>
                  <SelectItem key="promotion">Promotion</SelectItem>
                </Select>
                <Input
                  label="Scheduled Date *"
                  type="date"
                  value={newReview.scheduledDate || ""}
                  onChange={(e) => setNewReview(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
                <Input
                  label="Due Date *"
                  type="date"
                  value={newReview.dueDate || ""}
                  onChange={(e) => setNewReview(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Select
                  label="Department"
                  placeholder="Select department"
                  selectedKeys={newReview.department ? [newReview.department] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, department: Array.from(keys)[0] as string }))}
                >
                  {departments.map(dept => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Position"
                  placeholder="e.g., Senior Software Engineer"
                  value={newReview.position || ""}
                  onChange={(e) => setNewReview(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              <Textarea
                label="Goals (one per line)"
                placeholder="Enter review goals"
                value={newReview.goals?.join('\n') || ""}
                onChange={(e) => setNewReview(prev => ({ ...prev, goals: e.target.value.split('\n').filter(goal => goal.trim()) }))}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleScheduleReview}>
                Schedule Review
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Review Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="3xl">
          <ModalContent>
            <ModalHeader>Edit Review</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Employee *"
                  placeholder="Select employee"
                  selectedKeys={newReview.employeeName ? [newReview.employeeName] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, employeeName: Array.from(keys)[0] as string }))}
                >
                  {employees.map(employee => (
                    <SelectItem key={employee}>{employee}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Reviewer *"
                  placeholder="Select reviewer"
                  selectedKeys={newReview.reviewerName ? [newReview.reviewerName] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, reviewerName: Array.from(keys)[0] as string }))}
                >
                  {reviewers.map(reviewer => (
                    <SelectItem key={reviewer}>{reviewer}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Review Period"
                  placeholder="e.g., Q4 2024, Annual 2024"
                  value={newReview.reviewPeriod || ""}
                  onChange={(e) => setNewReview(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                />
                <Select
                  label="Review Type"
                  placeholder="Select type"
                  selectedKeys={newReview.reviewType ? [newReview.reviewType] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, reviewType: Array.from(keys)[0] as PerformanceReview["reviewType"] }))}
                >
                  <SelectItem key="annual">Annual</SelectItem>
                  <SelectItem key="quarterly">Quarterly</SelectItem>
                  <SelectItem key="probation">Probation</SelectItem>
                  <SelectItem key="promotion">Promotion</SelectItem>
                </Select>
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={newReview.status ? [newReview.status] : []}
                  onSelectionChange={(keys) => setNewReview(prev => ({ ...prev, status: Array.from(keys)[0] as PerformanceReview["status"] }))}
                >
                  <SelectItem key="draft">Draft</SelectItem>
                  <SelectItem key="in-progress">In Progress</SelectItem>
                  <SelectItem key="completed">Completed</SelectItem>
                  <SelectItem key="approved">Approved</SelectItem>
                  <SelectItem key="rejected">Rejected</SelectItem>
                </Select>
                <Input
                  label="Overall Rating (1-5)"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newReview.overallRating || 0}
                  onChange={(e) => setNewReview(prev => ({ ...prev, overallRating: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  label="Goals Rating (1-5)"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newReview.goalsRating || 0}
                  onChange={(e) => setNewReview(prev => ({ ...prev, goalsRating: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  label="Skills Rating (1-5)"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newReview.skillsRating || 0}
                  onChange={(e) => setNewReview(prev => ({ ...prev, skillsRating: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  label="Behavior Rating (1-5)"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newReview.behaviorRating || 0}
                  onChange={(e) => setNewReview(prev => ({ ...prev, behaviorRating: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  label="Attendance Rating (1-5)"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newReview.attendanceRating || 0}
                  onChange={(e) => setNewReview(prev => ({ ...prev, attendanceRating: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  label="Scheduled Date"
                  type="date"
                  value={newReview.scheduledDate || ""}
                  onChange={(e) => setNewReview(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={newReview.dueDate || ""}
                  onChange={(e) => setNewReview(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <Textarea
                label="Goals (one per line)"
                placeholder="Enter review goals"
                value={newReview.goals?.join('\n') || ""}
                onChange={(e) => setNewReview(prev => ({ ...prev, goals: e.target.value.split('\n').filter(goal => goal.trim()) }))}
                minRows={3}
              />
              <Textarea
                label="Achievements (one per line)"
                placeholder="Enter achievements"
                value={newReview.achievements?.join('\n') || ""}
                onChange={(e) => setNewReview(prev => ({ ...prev, achievements: e.target.value.split('\n').filter(achievement => achievement.trim()) }))}
                minRows={3}
              />
              <Textarea
                label="Areas for Improvement (one per line)"
                placeholder="Enter areas for improvement"
                value={newReview.areasForImprovement?.join('\n') || ""}
                onChange={(e) => setNewReview(prev => ({ ...prev, areasForImprovement: e.target.value.split('\n').filter(area => area.trim()) }))}
                minRows={3}
              />
              <Textarea
                label="Feedback"
                placeholder="Enter overall feedback"
                value={newReview.feedback || ""}
                onChange={(e) => setNewReview(prev => ({ ...prev, feedback: e.target.value }))}
                minRows={4}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleEditReview}>
                Update Review
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Review Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="4xl">
          <ModalContent>
            <ModalHeader>Review Details</ModalHeader>
            <ModalBody>
              {selectedReview && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={selectedReview.employeeName}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedReview.employeeName}</h3>
                      <p className="text-gray-600">{selectedReview.position} • {selectedReview.department}</p>
                      <p className="text-gray-600">Reviewer: {selectedReview.reviewerName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Review Information</h4>
                      <p><strong>Period:</strong> {selectedReview.reviewPeriod}</p>
                      <p><strong>Type:</strong> 
                        <Chip size="sm" color={typeColorMap[selectedReview.reviewType] as any} variant="flat" className="ml-2">
                          {selectedReview.reviewType}
                        </Chip>
                      </p>
                      <p><strong>Status:</strong> 
                        <Chip size="sm" color={statusColorMap[selectedReview.status] as any} variant="flat" className="ml-2">
                          {selectedReview.status}
                        </Chip>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Timeline</h4>
                      <p><strong>Scheduled:</strong> {new Date(selectedReview.scheduledDate).toLocaleDateString()}</p>
                      <p><strong>Due:</strong> {new Date(selectedReview.dueDate).toLocaleDateString()}</p>
                      {selectedReview.completedDate && (
                        <p><strong>Completed:</strong> {new Date(selectedReview.completedDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedReview.overallRating > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Ratings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Overall Rating:</strong> 
                            <div className="flex items-center gap-2 mt-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Icon
                                  key={star}
                                  icon="lucide:star"
                                  className={`w-5 h-5 ${
                                    star <= selectedReview.overallRating 
                                      ? "text-yellow-400 fill-current" 
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 font-medium">{selectedReview.overallRating.toFixed(1)}/5</span>
                            </div>
                          </p>
                        </div>
                        <div>
                          <p><strong>Goals Rating:</strong> {selectedReview.goalsRating.toFixed(1)}/5</p>
                          <p><strong>Skills Rating:</strong> {selectedReview.skillsRating.toFixed(1)}/5</p>
                          <p><strong>Behavior Rating:</strong> {selectedReview.behaviorRating.toFixed(1)}/5</p>
                          <p><strong>Attendance Rating:</strong> {selectedReview.attendanceRating.toFixed(1)}/5</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedReview.goals.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Goals</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedReview.goals.map((goal, index) => (
                          <li key={index} className="text-gray-700">{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedReview.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Achievements</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedReview.achievements.map((achievement, index) => (
                          <li key={index} className="text-gray-700">{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedReview.areasForImprovement.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedReview.areasForImprovement.map((area, index) => (
                          <li key={index} className="text-gray-700">{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedReview.feedback && (
                    <div>
                      <h4 className="font-semibold mb-2">Feedback</h4>
                      <p className="text-gray-700">{selectedReview.feedback}</p>
                    </div>
                  )}
                  
                  {selectedReview.employeeComments && (
                    <div>
                      <h4 className="font-semibold mb-2">Employee Comments</h4>
                      <p className="text-gray-700">{selectedReview.employeeComments}</p>
                    </div>
                  )}
                  
                  {selectedReview.managerComments && (
                    <div>
                      <h4 className="font-semibold mb-2">Manager Comments</h4>
                      <p className="text-gray-700">{selectedReview.managerComments}</p>
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
    </PageLayout>
  );
}
