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
  DatePicker,
  Divider,
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";
import { useJobs, Job } from "../hooks/useJobs";

const departments = [
  "IT", "Human Resources", "Marketing", "Finance", "Sales", "Operations", "Customer Support", "Research & Development"
];

const jobTypes = ["full_time", "part_time", "contract", "internship", "remote"];
const statusOptions = ["draft", "published", "closed", "archived"];

const statusColorMap = {
  draft: "default",
  published: "success",
  closed: "warning",
  archived: "danger",
};

export default function JobsPage() {
  const { jobs, loading, error, createJob, updateJob, deleteJob } = useJobs();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    job_type: "full_time" as const,
    experience_min: "",
    experience_max: "",
    salary_min: "",
    salary_max: "",
    vacancies: 1,
    closing_date: "",
    status: "draft" as const,
    department_id: "",
    designation_id: ""
  });
  
  const rowsPerPage = 10;
  
  // Filter jobs based on search
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             job.department_name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [jobs, searchQuery]);
  
  // Calculate pagination
  const pages = Math.ceil(filteredJobs.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    
    return filteredJobs.slice(start, end);
  }, [page, filteredJobs]);
  
  const handleOpenModal = (job: Job | null = null, editing = false) => {
    setSelectedJob(job);
    setIsEditing(editing);
    
    if (job && editing) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        location: job.location || "",
        job_type: job.job_type || "full_time",
        experience_min: job.experience_min?.toString() || "",
        experience_max: job.experience_max?.toString() || "",
        salary_min: job.salary_min?.toString() || "",
        salary_max: job.salary_max?.toString() || "",
        vacancies: job.vacancies || 1,
        closing_date: job.closing_date || "",
        status: job.status || "draft",
        department_id: job.department_id?.toString() || "",
        designation_id: job.designation_id?.toString() || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        requirements: "",
        responsibilities: "",
        location: "",
        job_type: "full_time",
        experience_min: "",
        experience_max: "",
        salary_min: "",
        salary_max: "",
        vacancies: 1,
        closing_date: "",
        status: "draft",
        department_id: "",
        designation_id: ""
      });
    }
    
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const jobData = {
        ...formData,
        experience_min: formData.experience_min ? parseInt(formData.experience_min) : undefined,
        experience_max: formData.experience_max ? parseInt(formData.experience_max) : undefined,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : undefined,
        department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
        designation_id: formData.designation_id ? parseInt(formData.designation_id) : undefined
      };

      if (isEditing && selectedJob) {
        await updateJob(selectedJob.id, jobData);
        addToast({
          title: "Success",
          description: "Job updated successfully",
          type: "success"
        });
      } else {
        await createJob(jobData);
        addToast({
          title: "Success",
          description: "Job created successfully",
          type: "success"
        });
      }
      
      onClose();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save job",
        type: "error"
      });
    }
  };

  const handleDelete = async (job: Job) => {
    if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      try {
        await deleteJob(job.id);
        addToast({
          title: "Success",
          description: "Job deleted successfully",
          type: "success"
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to delete job",
          type: "error"
        });
      }
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const formatExperience = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `${min}-${max} years`;
    if (min) return `${min}+ years`;
    if (max) return `Up to ${max} years`;
    return "Not specified";
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
          <h3 className="text-lg font-semibold text-danger mb-2">Error Loading Jobs</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600">Manage job postings and recruitment</p>
        </div>
        <Button
          color="primary"
          onPress={() => handleOpenModal(null, false)}
          startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
        >
          Add Job
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-gray-400" />}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Chip color="primary" variant="flat">
                Total: {jobs.length}
              </Chip>
              <Chip color="success" variant="flat">
                Published: {jobs.filter(j => j.status === 'published').length}
              </Chip>
              <Chip color="warning" variant="flat">
                Draft: {jobs.filter(j => j.status === 'draft').length}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Jobs</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Jobs table">
            <TableHeader>
              <TableColumn>JOB TITLE</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>LOCATION</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>EXPERIENCE</TableColumn>
              <TableColumn>SALARY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No jobs found">
              {items.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-gray-500">
                        {job.vacancies} vacancy{job.vacancies !== 1 ? 'ies' : ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{job.department_name || 'N/A'}</TableCell>
                  <TableCell>{job.location || 'Remote'}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {job.job_type.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatExperience(job.experience_min, job.experience_max)}</TableCell>
                  <TableCell>{formatSalary(job.salary_min, job.salary_max)}</TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={statusColorMap[job.status as keyof typeof statusColorMap]}
                      variant="flat"
                    >
                      {job.status.toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label="Job actions">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                          onPress={() => handleOpenModal(job, true)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" className="w-4 h-4" />}
                          onPress={() => handleDelete(job)}
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

      {/* Job Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? 'Edit Job' : 'Add New Job'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Job Title"
                    placeholder="Enter job title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    isRequired
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Job Type"
                      placeholder="Select job type"
                      selectedKeys={[formData.job_type]}
                      onSelectionChange={(keys) => setFormData({...formData, job_type: Array.from(keys)[0] as any})}
                    >
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
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
                  
                  <Input
                    label="Location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Min Experience (years)"
                      type="number"
                      placeholder="0"
                      value={formData.experience_min}
                      onChange={(e) => setFormData({...formData, experience_min: e.target.value})}
                    />
                    <Input
                      label="Max Experience (years)"
                      type="number"
                      placeholder="10"
                      value={formData.experience_max}
                      onChange={(e) => setFormData({...formData, experience_max: e.target.value})}
                    />
                    <Input
                      label="Vacancies"
                      type="number"
                      placeholder="1"
                      value={formData.vacancies.toString()}
                      onChange={(e) => setFormData({...formData, vacancies: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Min Salary"
                      type="number"
                      placeholder="50000"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({...formData, salary_min: e.target.value})}
                    />
                    <Input
                      label="Max Salary"
                      type="number"
                      placeholder="100000"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({...formData, salary_max: e.target.value})}
                    />
                  </div>
                  
                  <Input
                    label="Closing Date"
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({...formData, closing_date: e.target.value})}
                  />
                  
                  <Textarea
                    label="Description"
                    placeholder="Enter job description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                  
                  <Textarea
                    label="Requirements"
                    placeholder="Enter job requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    rows={3}
                  />
                  
                  <Textarea
                    label="Responsibilities"
                    placeholder="Enter job responsibilities"
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                    rows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {isEditing ? 'Update' : 'Create'} Job
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
