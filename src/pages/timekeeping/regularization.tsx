import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Spinner,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Divider,
  Checkbox,
  DatePicker
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { apiRequest } from "../../services/api-service";

interface RegularizationRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  attendance_date: string;
  request_type: 'check_in' | 'check_out' | 'full_day' | 'partial_day';
  current_check_in?: string;
  current_check_out?: string;
  requested_check_in?: string;
  requested_check_out?: string;
  reason: string;
  supporting_evidence?: any;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_required';
  submitted_at: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  reviewer_name?: string;
  company_id: number;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const RegularizationPage: React.FC = () => {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  
  // Modal states
  const { isOpen: isAddModalOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isReviewModalOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    attendance_date: '',
    request_type: 'check_in' as 'check_in' | 'check_out' | 'full_day' | 'partial_day',
    current_check_in: '',
    current_check_out: '',
    requested_check_in: '',
    requested_check_out: '',
    reason: '',
    supporting_evidence: []
  });
  const [reviewData, setReviewData] = useState({
    action: 'approved' as 'approved' | 'rejected' | 'more_info_required',
    review_notes: ''
  });

  useEffect(() => {
    loadRequests();
    loadEmployees();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/regularization/requests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error loading regularization requests:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load regularization requests',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiRequest('/employees');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        (request.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.employee_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      const matchesEmployee = selectedEmployee === 'all' || request.employee_id.toString() === selectedEmployee;
      
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [requests, searchQuery, selectedStatus, selectedEmployee]);

  const handleSubmitRequest = async () => {
    try {
      await apiRequest('/regularization/requests', {
        method: 'POST',
        body: formData
      });

      addToast({
        title: 'Success',
        description: 'Regularization request submitted successfully',
        color: 'success'
      });

      loadRequests();
      resetForm();
      onAddClose();
    } catch (error) {
      console.error('Error submitting regularization request:', error);
      addToast({
        title: 'Error',
        description: 'Failed to submit regularization request',
        color: 'danger'
      });
    }
  };

  const handleReviewRequest = async () => {
    if (!selectedRequest) return;

    try {
      await apiRequest(`/regularization/requests/${selectedRequest.id}/review`, {
        method: 'PUT',
        body: reviewData
      });

      addToast({
        title: 'Success',
        description: `Regularization request ${reviewData.action} successfully`,
        color: 'success'
      });

      loadRequests();
      resetReviewForm();
      onReviewClose();
    } catch (error) {
      console.error('Error reviewing regularization request:', error);
      addToast({
        title: 'Error',
        description: 'Failed to review regularization request',
        color: 'danger'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      attendance_date: '',
      request_type: 'check_in',
      current_check_in: '',
      current_check_out: '',
      requested_check_in: '',
      requested_check_out: '',
      reason: '',
      supporting_evidence: []
    });
  };

  const resetReviewForm = () => {
    setReviewData({
      action: 'approved',
      review_notes: ''
    });
  };

  const openViewModal = (request: RegularizationRequest) => {
    setSelectedRequest(request);
    onViewOpen();
  };

  const openReviewModal = (request: RegularizationRequest) => {
    setSelectedRequest(request);
    onReviewOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'more_info_required': return 'secondary';
      default: return 'default';
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'check_in': return 'primary';
      case 'check_out': return 'secondary';
      case 'full_day': return 'success';
      case 'partial_day': return 'warning';
      default: return 'default';
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Regularization</h1>
          <p className="text-default-600 mt-2">
            Submit and manage attendance correction requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={onAddOpen}
          >
            Submit Request
          </Button>
          <Icon icon="lucide:clock" className="text-4xl text-primary-600" />
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search requests..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="flex-1"
            />
            <Select
              placeholder="Status"
              selectedKeys={selectedStatus ? [selectedStatus] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedStatus(selected);
              }}
              className="w-full lg:w-48"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="approved">Approved</SelectItem>
              <SelectItem key="rejected">Rejected</SelectItem>
              <SelectItem key="more_info_required">More Info Required</SelectItem>
            </Select>
            <Select
              placeholder="Employee"
              selectedKeys={selectedEmployee ? [selectedEmployee] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedEmployee(selected);
              }}
              className="w-full lg:w-48"
            >
              <SelectItem key="all">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id.toString()}>
                  {employee.first_name} {employee.last_name} ({employee.employee_id})
                </SelectItem>
              )) as any}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Requests Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:table" className="text-success-600 text-xl" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Regularization Requests</h3>
              <p className="text-default-500 text-sm">
                {filteredRequests.length} of {requests.length} requests
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <Table aria-label="Regularization requests table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>CURRENT TIME</TableColumn>
              <TableColumn>REQUESTED TIME</TableColumn>
              <TableColumn>REASON</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>SUBMITTED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No regularization requests found">
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{request.employee_name || 'N/A'}</p>
                      <p className="text-sm text-default-500">{request.employee_code || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(request.attendance_date).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getRequestTypeColor(request.request_type) as any}
                      variant="flat"
                      size="sm"
                    >
                      {request.request_type.replace('_', ' ')}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {request.current_check_in && <div>In: {request.current_check_in}</div>}
                      {request.current_check_out && <div>Out: {request.current_check_out}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {request.requested_check_in && <div>In: {request.requested_check_in}</div>}
                      {request.requested_check_out && <div>Out: {request.requested_check_out}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-default-600 truncate max-w-xs">
                      {request.reason || 'No reason provided'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(request.status) as any}
                      variant="flat"
                      size="sm"
                    >
                      {request.status.replace('_', ' ')}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-default-500">
                      {new Date(request.submitted_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Dropdown closeOnSelect>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label={`Actions for request ${request.id}`}>
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label={`Request actions for ${request.id}`}>
                        <DropdownItem
                          key="view"
                          startContent={<Icon icon="lucide:eye" />}
                          onPress={() => openViewModal(request)}
                          textValue="View request details"
                        >
                          View Details
                        </DropdownItem>
                        {request.status === 'pending' && (
                          <DropdownItem
                            key="review"
                            startContent={<Icon icon="lucide:check-circle" />}
                            onPress={() => openReviewModal(request)}
                            textValue="Review request"
                          >
                            Review Request
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Submit Request Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Submit Regularization Request
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Employee"
                      placeholder="Select employee"
                      selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setFormData({...formData, employee_id: selected});
                      }}
                      isRequired
                    >
                      {employees.map((employee) => (
                        <SelectItem key={employee.id.toString()}>
                          {employee.first_name} {employee.last_name} ({employee.employee_id})
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      label="Attendance Date"
                      type="date"
                      
                      onChange={(e) => setFormData({...formData, attendance_date: e.target.value})}
                      isRequired
                    />
                  </div>

                  <Select
                    label="Request Type"
                    selectedKeys={[formData.request_type]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({...formData, request_type: selected as any});
                    }}
                    isRequired
                  >
                    <SelectItem key="check_in">Check In Correction</SelectItem>
                    <SelectItem key="check_out">Check Out Correction</SelectItem>
                    <SelectItem key="full_day">Full Day Correction</SelectItem>
                    <SelectItem key="partial_day">Partial Day Correction</SelectItem>
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Current Check In"
                      type="time"
                      
                      onChange={(e) => setFormData({...formData, current_check_in: e.target.value})}
                    />
                    <Input
                      label="Current Check Out"
                      type="time"
                      
                      onChange={(e) => setFormData({...formData, current_check_out: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Requested Check In"
                      type="time"
                      
                      onChange={(e) => setFormData({...formData, requested_check_in: e.target.value})}
                    />
                    <Input
                      label="Requested Check Out"
                      type="time"
                      
                      onChange={(e) => setFormData({...formData, requested_check_out: e.target.value})}
                    />
                  </div>

                  <Textarea
                    label="Reason"
                    placeholder="Explain why this correction is needed"
                    
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    rows={3}
                    isRequired
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmitRequest}>
                  Submit Request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Request Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Request Details
              </ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Employee</label>
                        <p className="text-sm text-foreground">{selectedRequest.employee_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Date</label>
                        <p className="text-sm text-foreground">{new Date(selectedRequest.attendance_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Request Type</label>
                        <Chip 
                          color={getRequestTypeColor(selectedRequest.request_type) as any}
                          variant="flat"
                          size="sm"
                        >
                          {selectedRequest.request_type.replace('_', ' ')}
                        </Chip>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Status</label>
                        <Chip 
                          color={getStatusColor(selectedRequest.status) as any}
                          variant="flat"
                          size="sm"
                        >
                          {selectedRequest.status.replace('_', ' ')}
                        </Chip>
                      </div>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Current Times</label>
                        <div className="text-sm text-foreground">
                          {selectedRequest.current_check_in && <div>Check In: {selectedRequest.current_check_in}</div>}
                          {selectedRequest.current_check_out && <div>Check Out: {selectedRequest.current_check_out}</div>}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Requested Times</label>
                        <div className="text-sm text-foreground">
                          {selectedRequest.requested_check_in && <div>Check In: {selectedRequest.requested_check_in}</div>}
                          {selectedRequest.requested_check_out && <div>Check Out: {selectedRequest.requested_check_out}</div>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-default-700">Reason</label>
                      <p className="text-sm text-foreground">{selectedRequest.reason || 'No reason provided'}</p>
                    </div>

                    {selectedRequest.review_notes && (
                      <div>
                        <label className="text-sm font-medium text-default-700">Review Notes</label>
                        <p className="text-sm text-foreground">{selectedRequest.review_notes}</p>
                      </div>
                    )}

                    <Divider />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Submitted</label>
                        <p className="text-sm text-foreground">
                          {new Date(selectedRequest.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      {selectedRequest.reviewed_at && (
                        <div>
                          <label className="text-sm font-medium text-default-700">Reviewed</label>
                          <p className="text-sm text-foreground">
                            {new Date(selectedRequest.reviewed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
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

      {/* Review Request Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={onReviewClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Review Regularization Request
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Action"
                    selectedKeys={[reviewData.action]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setReviewData({...reviewData, action: selected as any});
                    }}
                    isRequired
                  >
                    <SelectItem key="approved">Approve</SelectItem>
                    <SelectItem key="rejected">Reject</SelectItem>
                    <SelectItem key="more_info_required">Request More Info</SelectItem>
                  </Select>

                  <Textarea
                    label="Review Notes"
                    placeholder="Add your review comments"
                    
                    onChange={(e) => setReviewData({...reviewData, review_notes: e.target.value})}
                    rows={4}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleReviewRequest}>
                  Submit Review
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegularizationPage;