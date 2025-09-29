import React, { useState, useMemo } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  Textarea,
  Progress,
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { usePerformanceReviews, PerformanceReview } from "../hooks/usePerformanceReviews";
import PageLayout, { PageHeader } from "../components/layout/PageLayout";

const statusColorMap = {
  "draft": "default",
  "in_progress": "primary",
  "completed": "success",
  "cancelled": "danger",
};

const ratingColorMap = {
  1: "danger",
  2: "warning",
  3: "primary",
  4: "success",
  5: "success",
};

export default function ReviewsPage() {
  const { reviews, loading, error, createReview, updateReview, deleteReview } = usePerformanceReviews();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  
  const rowsPerPage = 10;
  
  // Form state for new review
  const [newReview, setNewReview] = useState({
    employee_id: 1,
    reviewer_id: 1,
    cycle_id: 1,
    review_period_start: "",
    review_period_end: "",
    overall_rating: 0,
    goals_rating: 0,
    skills_rating: 0,
    teamwork_rating: 0,
    communication_rating: 0,
    leadership_rating: 0,
    comments: "",
    strengths: "",
    areas_for_improvement: "",
    development_plan: ""
  });

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = 
        (review.employee_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (review.reviewer_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || review.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchQuery, selectedStatus]);
  
  // Paginate filtered reviews
  const paginatedReviews = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredReviews.slice(startIndex, endIndex);
  }, [filteredReviews, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const draft = reviews.filter(r => r.status === "draft").length;
    const inProgress = reviews.filter(r => r.status === "in_progress").length;
    const completed = reviews.filter(r => r.status === "completed").length;
    const cancelled = reviews.filter(r => r.status === "cancelled").length;
    
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length 
      : 0;
    
    return { total, draft, inProgress, completed, cancelled, avgRating };
  }, [reviews]);

  // Handle row actions
  const handleRowAction = (actionKey: string, reviewId: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    switch (actionKey) {
      case "view":
        setSelectedReview(review);
        onViewOpen();
        break;
      case "edit":
        handleEditReview(review);
        break;
      case "delete":
        handleDeleteReview(reviewId);
        break;
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this performance review?")) {
      try {
        await deleteReview(id);
        addToast({
          title: "Success",
          description: "Performance review deleted successfully",
          color: "success"
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to delete performance review",
          color: "danger"
        });
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.employee_id || !newReview.reviewer_id || !newReview.review_period_start || !newReview.review_period_end) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        color: "danger"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, newReview);
        addToast({
          title: "Success",
          description: "Performance review updated successfully",
          color: "success"
        });
      } else {
        await createReview(newReview);
        addToast({
          title: "Success",
          description: "Performance review created successfully",
          color: "success"
        });
      }
      
      setNewReview({
        employee_id: 1,
        reviewer_id: 1,
        cycle_id: 1,
        review_period_start: "",
        review_period_end: "",
        overall_rating: 0,
        goals_rating: 0,
        skills_rating: 0,
        teamwork_rating: 0,
        communication_rating: 0,
        leadership_rating: 0,
        comments: "",
        strengths: "",
        areas_for_improvement: "",
        development_plan: ""
      });
      setEditingReview(null);
      onOpenChange();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save performance review",
        color: "danger"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review: PerformanceReview) => {
    setEditingReview(review);
    setNewReview({
      employee_id: review.employee_id,
      reviewer_id: review.reviewer_id,
      cycle_id: review.cycle_id,
      review_period_start: review.review_period_start,
      review_period_end: review.review_period_end,
      overall_rating: review.overall_rating,
      goals_rating: review.goals_rating,
      skills_rating: review.skills_rating,
      teamwork_rating: review.teamwork_rating,
      communication_rating: review.communication_rating,
      leadership_rating: review.leadership_rating,
      comments: review.comments || "",
      strengths: review.strengths || "",
      areas_for_improvement: review.areas_for_improvement || "",
      development_plan: review.development_plan || ""
    });
    onOpen();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        icon={i < rating ? "lucide:star" : "lucide:star"}
        className={`w-4 h-4 ${i < rating ? 'text-warning-400 fill-current' : 'text-default-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center text-danger">
          <p>Error loading performance reviews: {error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Performance Reviews"
        description="Manage employee performance reviews and evaluations"
        actions={
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onOpen}
          >
            Add Review
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Icon icon="lucide:clipboard-list" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">In Progress</p>
                <p className="text-2xl font-bold text-primary-600">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Icon icon="lucide:play-circle" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Completed</p>
                <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Icon icon="lucide:check-circle" className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}/5</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <Icon icon="lucide:star" className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" />}
              className="flex-1"
            />
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-48"
            >
              <SelectItem key="all" value="all">All Status</SelectItem>
              <SelectItem key="draft" value="draft">Draft</SelectItem>
              <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
              <SelectItem key="completed" value="completed">Completed</SelectItem>
              <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Performance Reviews</h3>
            <p className="text-sm text-default-500">
              Showing {paginatedReviews.length} of {filteredReviews.length} reviews
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Performance reviews table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>REVIEWER</TableColumn>
              <TableColumn>PERIOD</TableColumn>
              <TableColumn>OVERALL RATING</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No performance reviews found">
              {paginatedReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        name={review.employee_name || "Unknown"}
                        className="flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium">{review.employee_name || "Unknown"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        name={review.reviewer_name || "Unknown"}
                        className="flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium">{review.reviewer_name || "Unknown"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {formatDate(review.review_period_start)} - {formatDate(review.review_period_end)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(review.overall_rating)}
                      <span className="ml-2 text-sm text-default-500">
                        ({review.overall_rating}/5)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={statusColorMap[review.status as keyof typeof statusColorMap] || "default"}
                      variant="flat"
                    >
                      {review.status.replace('_', ' ')}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(review.created_at)}</TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:more-vertical" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Review actions"
                        onAction={(key) => handleRowAction(key as string, review.id)}
                      >
                        <DropdownItem key="view" startContent={<Icon icon="lucide:eye" />}>
                          View
                        </DropdownItem>
                        <DropdownItem key="edit" startContent={<Icon icon="lucide:edit" />}>
                          Edit
                        </DropdownItem>
                        <DropdownItem 
                          key="delete" 
                          startContent={<Icon icon="lucide:trash" />}
                          className="text-danger"
                          color="danger"
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

      {/* Add/Edit Review Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingReview ? "Edit Performance Review" : "Add New Performance Review"}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Employee ID"
                    type="number"
                    value={newReview.employee_id.toString()}
                    onChange={(e) => setNewReview({...newReview, employee_id: parseInt(e.target.value)})}
                    isRequired
                  />

                  <Input
                    label="Reviewer ID"
                    type="number"
                    value={newReview.reviewer_id.toString()}
                    onChange={(e) => setNewReview({...newReview, reviewer_id: parseInt(e.target.value)})}
                    isRequired
                  />

                  <Input
                    label="Review Period Start"
                    type="date"
                    value={newReview.review_period_start}
                    onChange={(e) => setNewReview({...newReview, review_period_start: e.target.value})}
                    isRequired
                  />

                  <Input
                    label="Review Period End"
                    type="date"
                    value={newReview.review_period_end}
                    onChange={(e) => setNewReview({...newReview, review_period_end: e.target.value})}
                    isRequired
                  />

                  <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-2">Ratings (1-5)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-default-500">Overall</label>
                        <Select
                          value={newReview.overall_rating.toString()}
                          onChange={(e) => setNewReview({...newReview, overall_rating: parseInt(e.target.value)})}
                        >
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Goals</label>
                        <Select
                          value={newReview.goals_rating.toString()}
                          onChange={(e) => setNewReview({...newReview, goals_rating: parseInt(e.target.value)})}
                        >
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Skills</label>
                        <Select
                          value={newReview.skills_rating.toString()}
                          onChange={(e) => setNewReview({...newReview, skills_rating: parseInt(e.target.value)})}
                        >
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Teamwork</label>
                        <Select
                          value={newReview.teamwork_rating.toString()}
                          onChange={(e) => setNewReview({...newReview, teamwork_rating: parseInt(e.target.value)})}
                        >
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Communication</label>
                        <Select
                          value={newReview.communication_rating.toString()}
                          onChange={(e) => setNewReview({...newReview, communication_rating: parseInt(e.target.value)})}
                        >
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Leadership</label>
                        <Select
                          value={newReview.leadership_rating.toString()}
                          onChange={(e) => setNewReview({...newReview, leadership_rating: parseInt(e.target.value)})}
                        >
                          {[1,2,3,4,5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Textarea
                      label="Comments"
                      placeholder="Enter overall comments"
                      value={newReview.comments}
                      onChange={(e) => setNewReview({...newReview, comments: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Textarea
                      label="Strengths"
                      placeholder="Enter employee strengths"
                      value={newReview.strengths}
                      onChange={(e) => setNewReview({...newReview, strengths: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Textarea
                      label="Areas for Improvement"
                      placeholder="Enter areas for improvement"
                      value={newReview.areas_for_improvement}
                      onChange={(e) => setNewReview({...newReview, areas_for_improvement: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Textarea
                      label="Development Plan"
                      placeholder="Enter development plan"
                      value={newReview.development_plan}
                      onChange={(e) => setNewReview({...newReview, development_plan: e.target.value})}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSubmitReview}
                  isLoading={isSubmitting}
                >
                  {editingReview ? "Update" : "Create"} Review
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Review Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Performance Review Details</ModalHeader>
              <ModalBody>
                {selectedReview && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Employee</p>
                        <p className="font-medium">{selectedReview.employee_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Reviewer</p>
                        <p className="font-medium">{selectedReview.reviewer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Review Period</p>
                        <p className="font-medium">
                          {formatDate(selectedReview.review_period_start)} - {formatDate(selectedReview.review_period_end)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Status</p>
                        <Chip
                          size="sm"
                          color={statusColorMap[selectedReview.status as keyof typeof statusColorMap] || "default"}
                          variant="flat"
                        >
                          {selectedReview.status.replace('_', ' ')}
                        </Chip>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-default-500 mb-2">Overall Rating</p>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedReview.overall_rating)}
                        <span className="text-lg font-medium">
                          {selectedReview.overall_rating}/5
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-default-500 mb-2">Detailed Ratings</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Goals:</span>
                          <span className="font-medium">{selectedReview.goals_rating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Skills:</span>
                          <span className="font-medium">{selectedReview.skills_rating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Teamwork:</span>
                          <span className="font-medium">{selectedReview.teamwork_rating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Communication:</span>
                          <span className="font-medium">{selectedReview.communication_rating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Leadership:</span>
                          <span className="font-medium">{selectedReview.leadership_rating}/5</span>
                        </div>
                      </div>
                    </div>

                    {selectedReview.comments && (
                      <div>
                        <p className="text-sm text-default-500">Comments</p>
                        <p className="font-medium">{selectedReview.comments}</p>
                      </div>
                    )}

                    {selectedReview.strengths && (
                      <div>
                        <p className="text-sm text-default-500">Strengths</p>
                        <p className="font-medium">{selectedReview.strengths}</p>
                      </div>
                    )}

                    {selectedReview.areas_for_improvement && (
                      <div>
                        <p className="text-sm text-default-500">Areas for Improvement</p>
                        <p className="font-medium">{selectedReview.areas_for_improvement}</p>
                      </div>
                    )}

                    {selectedReview.development_plan && (
                      <div>
                        <p className="text-sm text-default-500">Development Plan</p>
                        <p className="font-medium">{selectedReview.development_plan}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Created</p>
                        <p className="font-medium">{formatDate(selectedReview.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Last Updated</p>
                        <p className="font-medium">{formatDate(selectedReview.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageLayout>
  );
}