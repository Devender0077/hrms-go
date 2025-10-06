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
import HeroSection from "../components/common/HeroSection";
import { addToast } from "@heroui/react";
import { useCandidates, Candidate } from "../hooks/useCandidates";
import { getDefaultAvatar } from "../utils/avatarUtils";

const statusOptions = ["applied", "screening", "interview", "offered", "hired", "rejected"];
const sourceOptions = ["Company Website", "LinkedIn", "Indeed", "Referral", "Glassdoor", "Other"];

const statusColorMap = {
  applied: "default",
  screening: "primary",
  interview: "warning",
  offered: "success",
  hired: "success",
  rejected: "danger",
} as const;

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
    status: "applied" as const
  });
  
  const rowsPerPage = 10;
  
  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) ||
             candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (candidate as any).job_title?.toLowerCase().includes(searchQuery.toLowerCase());
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
        job_posting_id: (candidate as any).job_posting_id?.toString() || "",
        first_name: candidate.first_name || "",
        last_name: candidate.last_name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        resume: (candidate as any).resume || "",
        cover_letter: (candidate as any).cover_letter || "",
        source: candidate.source || "",
        status: (candidate.status || "applied") as "applied"
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
        status: "applied"
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
          color: "success"
        });
      } else {
        await createCandidate(candidateData);
        addToast({
          title: "Success",
          description: "Candidate added successfully",
          color: "success"
        });
      }
      
      onClose();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save candidate",
        color: "danger"
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
          color: "success"
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to delete candidate",
          color: "danger"
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
        color: "success"
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update candidate status",
        color: "danger"
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Candidates"
          subtitle="Recruitment Management"
          description="Manage job applications and candidates efficiently. Track applications, review resumes, and manage the recruitment process."
          icon="lucide:users"
          illustration="recruitment"
          actions={[
            {
              label: "Add Candidate",
              icon: "lucide:plus",
              onPress: () => handleOpenModal(null, false),
              variant: "solid"
            }
          ]}
        />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                color="primary"
                onPress={() => handleOpenModal(null, false)}
                startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
              >
                Add Candidate
              </Button>
            </div>
          </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search candidates..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Chip color="primary" variant="flat">
                Total: {candidates.length}
              </Chip>
              <Chip color="success" variant="flat">
                Applied: {candidates.filter(c => c.status === 'applied').length}
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
                        <p className="text-sm text-default-500">{candidate.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{(candidate as any).job_title || 'N/A'}</p>
                      <p className="text-sm text-default-500">Job ID: {(candidate as any).job_posting_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{candidate.phone || 'No phone'}</p>
                      <p className="text-sm text-default-500">{candidate.email}</p>
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
                          onPress={() => window.open((candidate as any).resume, '_blank')}
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
        </motion.div>

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
                      
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Last Name"
                      placeholder="Enter last name"
                      
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      isRequired
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter email"
                      
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Phone"
                      placeholder="Enter phone number"
                      
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  
                  <Input
                    label="Job Posting ID"
                    type="number"
                    placeholder="Enter job posting ID"
                    
                    onChange={(e) => setFormData({...formData, job_posting_id: e.target.value})}
                    isRequired
                  />
                  
                  <Input
                    label="Resume URL"
                    placeholder="Enter resume URL"
                    
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
                        <SelectItem key={source} >
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
                        <SelectItem key={status} >
                          {status.toUpperCase()}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <Textarea
                    label="Cover Letter"
                    placeholder="Enter cover letter"
                    
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
    </div>
  );
}
