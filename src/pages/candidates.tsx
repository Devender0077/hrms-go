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
  Spinner,
  Avatar
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { useCandidates, Candidate } from "../hooks/useCandidates";
import { getDefaultAvatar } from "../utils/avatarUtils";

const statusOptions = ["new", "screening", "interview", "testing", "offer", "hired", "rejected"];
const sourceOptions = ["Company Website", "LinkedIn", "Indeed", "Referral", "Glassdoor", "Other"];

const statusColorMap = {
  new: "default",
  screening: "primary",
  interview: "warning",
  testing: "secondary",
  offer: "success",
  hired: "success",
  rejected: "danger",
};

export default function CandidatesPage() {
  const { candidates, loading, error, createCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    job_posting_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    resume: "",
    cover_letter: "",
    source: "",
    status: "new" as const
  });
  
  const rowsPerPage = 10;
  
  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) ||
             candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             candidate.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [candidates, searchQuery]);
  
  // Calculate pagination
  const pages = Math.ceil(filteredCandidates.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    
    return filteredCandidates.slice(start, end);
  }, [page, filteredCandidates]);
  
  const handleOpenModal = (candidate: Candidate | null = null, editing = false) => {
    setSelectedCandidate(candidate);
    setIsEditing(editing);
    
    if (candidate && editing) {
      setFormData({
        job_posting_id: candidate.job_posting_id.toString(),
        first_name: candidate.first_name || "",
        last_name: candidate.last_name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        resume: candidate.resume || "",
        cover_letter: candidate.cover_letter || "",
        source: candidate.source || "",
        status: candidate.status || "new"
      });
    } else {
      setFormData({
        job_posting_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        resume: "",
        cover_letter: "",
        source: "",
        status: "new"
      });
    }
    
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const candidateData = {
        ...formData,
        job_posting_id: parseInt(formData.job_posting_id)
      };

      if (isEditing && selectedCandidate) {
        await updateCandidate(selectedCandidate.id, candidateData);
        addToast({
          title: "Success",
          description: "Candidate updated successfully",
          type: "success"
        });
      } else {
        await createCandidate(candidateData);
        addToast({
          title: "Success",
          description: "Candidate added successfully",
          type: "success"
        });
      }
      
      onClose();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save candidate",
        type: "error"
      });
    }
  };

  const handleDelete = async (candidate: Candidate) => {
    if (window.confirm(`Are you sure you want to delete "${candidate.first_name} ${candidate.last_name}"?`)) {
      try {
        await deleteCandidate(candidate.id);
        addToast({
          title: "Success",
          description: "Candidate deleted successfully",
          type: "success"
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to delete candidate",
          type: "error"
        });
      }
    }
  };

  const handleStatusChange = async (candidate: Candidate, newStatus: string) => {
    try {
      await updateCandidate(candidate.id, { status: newStatus as any });
      addToast({
        title: "Success",
        description: "Candidate status updated successfully",
        type: "success"
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update candidate status",
        type: "error"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <CardBody className="text-center">
          <Icon icon="lucide:alert-circle" className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger mb-2">Error Loading Candidates</h3>
          <p className="text-default-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage job applications and candidates</p>
        </div>
        <Button
          color="primary"
          onPress={() => handleOpenModal(null, false)}
          startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
        >
          Add Candidate
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-gray-400" />}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Chip color="primary" variant="flat">
                Total: {candidates.length}
              </Chip>
              <Chip color="success" variant="flat">
                New: {candidates.filter(c => c.status === 'new').length}
              </Chip>
              <Chip color="warning" variant="flat">
                Interview: {candidates.filter(c => c.status === 'interview').length}
              </Chip>
              <Chip color="success" variant="flat">
                Hired: {candidates.filter(c => c.status === 'hired').length}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Candidates</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Candidates table">
            <TableHeader>
              <TableColumn>CANDIDATE</TableColumn>
              <TableColumn>POSITION</TableColumn>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>SOURCE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>APPLIED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No candidates found">
              {items.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={getDefaultAvatar('male', candidate.id)}
                        alt={`${candidate.first_name} ${candidate.last_name}`}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold">{candidate.first_name} {candidate.last_name}</p>
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{candidate.job_title || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Job ID: {candidate.job_posting_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{candidate.phone || 'No phone'}</p>
                      <p className="text-sm text-gray-500">{candidate.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="default">
                      {candidate.source || 'Unknown'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Chip 
                          size="sm" 
                          color={statusColorMap[candidate.status as keyof typeof statusColorMap]}
                          variant="flat"
                          className="cursor-pointer"
                        >
                          {candidate.status.toUpperCase()}
                        </Chip>
                      </DropdownTrigger>
                      <DropdownMenu>
                        {statusOptions.map((status) => (
                          <DropdownItem
                            key={status}
                            onPress={() => handleStatusChange(candidate, status)}
                          >
                            {status.toUpperCase()}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label="Candidate actions">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                          onPress={() => handleOpenModal(candidate, true)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="resume"
                          startContent={<Icon icon="lucide:file-text" className="w-4 h-4" />}
                          onPress={() => window.open(candidate.resume, '_blank')}
                        >
                          View Resume
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" className="w-4 h-4" />}
                          onPress={() => handleDelete(candidate)}
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
          
          {pages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                total={pages}
                page={page}
                onChange={setPage}
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Candidate Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? 'Edit Candidate' : 'Add New Candidate'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Last Name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      isRequired
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  
                  <Input
                    label="Job Posting ID"
                    type="number"
                    placeholder="Enter job posting ID"
                    value={formData.job_posting_id}
                    onChange={(e) => setFormData({...formData, job_posting_id: e.target.value})}
                    isRequired
                  />
                  
                  <Input
                    label="Resume URL"
                    placeholder="Enter resume URL"
                    value={formData.resume}
                    onChange={(e) => setFormData({...formData, resume: e.target.value})}
                    isRequired
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Source"
                      placeholder="Select source"
                      selectedKeys={formData.source ? [formData.source] : []}
                      onSelectionChange={(keys) => setFormData({...formData, source: Array.from(keys)[0] as string})}
                    >
                      {sourceOptions.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </Select>
                    
                    <Select
                      label="Status"
                      placeholder="Select status"
                      selectedKeys={[formData.status]}
                      onSelectionChange={(keys) => setFormData({...formData, status: Array.from(keys)[0] as any})}
                    >
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.toUpperCase()}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <Textarea
                    label="Cover Letter"
                    placeholder="Enter cover letter"
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
                    rows={4}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {isEditing ? 'Update' : 'Add'} Candidate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
