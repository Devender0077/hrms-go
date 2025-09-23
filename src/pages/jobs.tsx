import React, { useState, useMemo, useRef } from "react";
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
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

// Enhanced Job interface
interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  status: "active" | "paused" | "closed";
  postedDate: string;
  applications: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  benefits: string[];
  urgency: "low" | "medium" | "high";
  remote: boolean;
  contractType: "permanent" | "contract" | "internship";
  education: string;
  deadline?: string;
  hiringManager?: string;
  budget?: string;
  priority: "low" | "medium" | "high";
}

// Sample jobs data
const jobs: Job[] = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "IT",
    location: "New York, NY",
    type: "Full-time",
    experience: "5+ years",
    salary: "$80,000 - $120,000",
    status: "active",
    postedDate: "2025-01-15",
    applications: 24,
    description: "We are looking for a Senior Software Engineer to join our development team. You will be responsible for designing and implementing scalable software solutions.",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "5+ years of experience in software development",
      "Proficiency in React, Node.js, and TypeScript",
      "Experience with cloud platforms (AWS, Azure)",
      "Strong problem-solving and communication skills"
    ],
    responsibilities: [
      "Design and develop scalable web applications",
      "Collaborate with cross-functional teams",
      "Mentor junior developers",
      "Participate in code reviews",
      "Maintain and improve existing systems"
    ],
    skills: ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
    benefits: ["Health Insurance", "401k", "Flexible Hours", "Remote Work"],
    urgency: "high",
    remote: true,
    contractType: "permanent",
    education: "Bachelor's Degree",
    deadline: "2025-02-15",
    hiringManager: "John Doe",
    budget: "$120,000",
    priority: "high"
  },
  {
    id: 2,
    title: "HR Manager",
    department: "Human Resources",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "3+ years",
    salary: "$70,000 - $90,000",
    status: "active",
    postedDate: "2025-01-14",
    applications: 18,
    description: "We are seeking an experienced HR Manager to oversee our human resources operations and support our growing team.",
    requirements: [
      "Bachelor's degree in Human Resources or related field",
      "3+ years of HR management experience",
      "Knowledge of employment laws and regulations",
      "Experience with HRIS systems",
      "Excellent interpersonal and communication skills"
    ],
    responsibilities: [
      "Manage recruitment and onboarding processes",
      "Develop and implement HR policies",
      "Handle employee relations and conflicts",
      "Oversee performance management",
      "Ensure compliance with labor laws"
    ],
    skills: ["HR Management", "Recruitment", "Employee Relations", "HRIS"],
    benefits: ["Health Insurance", "Dental", "Vision", "PTO"],
    urgency: "medium",
    remote: false,
    contractType: "permanent",
    education: "Bachelor's Degree",
    deadline: "2025-02-28",
    hiringManager: "Jane Smith",
    budget: "$90,000",
    priority: "medium"
  },
  {
    id: 3,
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Part-time",
    experience: "2+ years",
    salary: "$40,000 - $60,000",
    status: "paused",
    postedDate: "2025-01-13",
    applications: 12,
    description: "Join our marketing team as a Marketing Specialist to help drive our digital marketing initiatives and brand awareness.",
    requirements: [
      "Bachelor's degree in Marketing or related field",
      "2+ years of marketing experience",
      "Proficiency in digital marketing tools",
      "Experience with social media management",
      "Creative thinking and analytical skills"
    ],
    responsibilities: [
      "Develop and execute marketing campaigns",
      "Manage social media presence",
      "Create marketing content and materials",
      "Analyze marketing metrics and ROI",
      "Collaborate with design and content teams"
    ],
    skills: ["Digital Marketing", "Social Media", "Content Creation", "Analytics"],
    benefits: ["Flexible Schedule", "Remote Work", "Learning Budget"],
    urgency: "low",
    remote: true,
    contractType: "contract",
    education: "Bachelor's Degree",
    deadline: "2025-03-15",
    hiringManager: "Mike Johnson",
    budget: "$60,000",
    priority: "low"
  }
];

const departments = [
  "IT", "Human Resources", "Marketing", "Finance", "Sales", "Operations", "Customer Support", "Research & Development"
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const contractTypes = ["permanent", "contract", "internship"];
const urgencyLevels = ["low", "medium", "high"];
const priorityLevels = ["low", "medium", "high"];

const statusColorMap = {
  active: "success",
  paused: "warning",
  closed: "danger",
};

const urgencyColorMap = {
  low: "default",
  medium: "warning",
  high: "danger",
};

const priorityColorMap = {
  low: "default",
  medium: "warning",
  high: "danger",
};

export default function Jobs() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [jobList, setJobList] = useState(jobs);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  const rowsPerPage = 10;
  
  // Form state for new job
  const [newJob, setNewJob] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    experience: "",
    salary: "",
    description: "",
    requirements: "",
    responsibilities: "",
    skills: "",
    benefits: "",
    urgency: "medium",
    remote: false,
    contractType: "permanent",
    education: "",
    deadline: "",
    hiringManager: "",
    budget: "",
    priority: "medium"
  });

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobList.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
      const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment;
      const matchesType = selectedType === "all" || job.type === selectedType;
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesType;
    });
  }, [jobList, searchQuery, selectedStatus, selectedDepartment, selectedType]);
  
  // Paginate filtered jobs
  const paginatedJobs = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = jobList.length;
    const active = jobList.filter(j => j.status === "active").length;
    const paused = jobList.filter(j => j.status === "paused").length;
    const closed = jobList.filter(j => j.status === "closed").length;
    const totalApplications = jobList.reduce((sum, j) => sum + j.applications, 0);
    
    return { total, active, paused, closed, totalApplications };
  }, [jobList]);

  // Handle row actions
  const handleRowAction = (actionKey: string, jobId: number) => {
    const job = jobList.find(j => j.id === jobId);
    if (!job) return;

    switch (actionKey) {
      case "view":
        setSelectedJob(job);
        onViewOpen();
        break;
      case "edit":
        setEditingJob({ ...job });
        onOpen();
        break;
      case "duplicate":
        handleDuplicateJob(jobId);
        break;
      case "close":
        handleCloseJob(jobId);
        break;
      case "delete":
        handleDeleteJob(jobId);
        break;
      default:
        break;
    }
  };

  // Handle add new job
  const handleAddJob = () => {
    const job: Job = {
      id: Math.max(...jobList.map(j => j.id)) + 1,
      title: "",
      department: "",
      location: "",
      type: "",
      experience: "",
      salary: "",
      status: "active",
      postedDate: new Date().toISOString().split('T')[0],
      applications: 0,
      description: "",
      requirements: [],
      responsibilities: [],
      skills: [],
      benefits: [],
      urgency: "medium",
      remote: false,
      contractType: "permanent",
      education: "",
      deadline: "",
      hiringManager: "",
      budget: "",
      priority: "medium"
    };
    setEditingJob(job);
    onOpen();
  };

  // Handle save job
  const handleSaveJob = () => {
    if (!editingJob) return;

    if (!editingJob.title || !editingJob.department || !editingJob.location || !editingJob.type) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const isNewJob = !jobList.find(j => j.id === editingJob.id);
    
    if (isNewJob) {
      setJobList(prev => [editingJob, ...prev]);
      addToast({
        title: "Job Posted",
        description: `${editingJob.title} has been posted successfully.`,
        color: "success",
      });
    } else {
      setJobList(prev => 
        prev.map(j => j.id === editingJob.id ? editingJob : j)
      );
      addToast({
        title: "Job Updated",
        description: `${editingJob.title} has been updated successfully.`,
        color: "success",
      });
    }
    
    setEditingJob(null);
    onOpenChange();
  };

  // Handle duplicate job
  const handleDuplicateJob = (jobId: number) => {
    const job = jobList.find(j => j.id === jobId);
    if (!job) return;

    const duplicatedJob: Job = {
      ...job,
      id: Math.max(...jobList.map(j => j.id)) + 1,
      title: `${job.title} (Copy)`,
      postedDate: new Date().toISOString().split('T')[0],
      applications: 0,
      status: "active"
    };

    setJobList(prev => [duplicatedJob, ...prev]);
    addToast({
      title: "Job Duplicated",
      description: `${job.title} has been duplicated successfully.`,
      color: "success",
    });
  };

  // Handle close job
  const handleCloseJob = (jobId: number) => {
    const job = jobList.find(j => j.id === jobId);
    if (!job) return;

    setJobList(prev => 
      prev.map(j => 
        j.id === jobId 
          ? { ...j, status: "closed" as const }
          : j
      )
    );
    
    addToast({
      title: "Job Closed",
      description: `${job.title} has been closed.`,
      color: "warning",
    });
  };

  // Handle delete job
  const handleDeleteJob = (jobId: number) => {
    const job = jobList.find(j => j.id === jobId);
    if (!job) return;

    setJobList(prev => prev.filter(j => j.id !== jobId));
    addToast({
      title: "Job Deleted",
      description: `${job.title} has been removed from the system.`,
      color: "success",
    });
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredJobs);
      downloadFile(csvContent, `jobs-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Job data has been exported to CSV.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export job data.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate CSV content
  const generateCSV = (jobs: Job[]) => {
    const headers = [
      'ID', 'Title', 'Department', 'Location', 'Type', 'Experience', 'Salary', 
      'Status', 'Posted Date', 'Applications', 'Urgency', 'Priority', 'Remote', 
      'Contract Type', 'Education', 'Deadline', 'Hiring Manager', 'Budget'
    ];
    
    const rows = jobs.map(job => [
      job.id,
      job.title,
      job.department,
      job.location,
      job.type,
      job.experience,
      job.salary,
      job.status,
      job.postedDate,
      job.applications,
      job.urgency,
      job.priority,
      job.remote ? 'Yes' : 'No',
      job.contractType,
      job.education,
      job.deadline || '',
      job.hiringManager || '',
      job.budget || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Download file utility
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Icon icon="lucide:briefcase" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
              <p className="text-gray-600 mt-1">Manage job postings and recruitment</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />} 
              onPress={handleAddJob}
              className="font-medium"
            >
              Post New Job
            </Button>
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              isLoading={isExporting}
              className="font-medium"
            >
              Export
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon icon="lucide:briefcase" className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="text-default-500">Total Jobs</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Icon icon="lucide:check-circle" className="text-2xl text-success" />
                </div>
                <div>
                  <p className="text-default-500">Active</p>
                  <h3 className="text-2xl font-bold">{stats.active}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Icon icon="lucide:pause" className="text-2xl text-warning" />
                </div>
                <div>
                  <p className="text-default-500">Paused</p>
                  <h3 className="text-2xl font-bold">{stats.paused}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-danger/10">
                  <Icon icon="lucide:x-circle" className="text-2xl text-danger" />
                </div>
                <div>
                  <p className="text-default-500">Closed</p>
                  <h3 className="text-2xl font-bold">{stats.closed}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="shadow-sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Icon icon="lucide:users" className="text-2xl text-blue-600" />
                </div>
                <div>
                  <p className="text-default-500">Applications</p>
                  <h3 className="text-2xl font-bold">{stats.totalApplications}</h3>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
              <Select
                label="Status"
                placeholder="All Status"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                items={[
                  { key: "all", label: "All Status" },
                  { key: "active", label: "Active" },
                  { key: "paused", label: "Paused" },
                  { key: "closed", label: "Closed" }
                ]}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                label="Department"
                placeholder="All Departments"
                selectedKeys={[selectedDepartment]}
                onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
                items={departments.map(dept => ({ key: dept, label: dept }))}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                label="Job Type"
                placeholder="All Types"
                selectedKeys={[selectedType]}
                onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0] as string)}
                items={jobTypes.map(type => ({ key: type, label: type }))}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Jobs Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-green-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Job Postings</h3>
                <p className="text-gray-500 text-sm">Click on actions to view, edit, or manage jobs</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Jobs table">
              <TableHeader>
                <TableColumn>JOB TITLE</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>APPLICATIONS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.experience} • {job.salary}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{job.department}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:map-pin" className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{job.location}</span>
                        {job.remote && (
                          <Chip size="sm" color="primary" variant="flat">Remote</Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{job.type}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">{job.applications}</span>
                        </div>
                        <span className="text-sm text-gray-600">applications</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[job.status] as any}
                        variant="flat"
                      >
                        {job.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={priorityColorMap[job.priority] as any}
                        variant="flat"
                      >
                        {job.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => handleRowAction("view", job.id)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleRowAction("edit", job.id)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="duplicate"
                            startContent={<Icon icon="lucide:copy" />}
                            onPress={() => handleRowAction("duplicate", job.id)}
                          >
                            Duplicate
                          </DropdownItem>
                          {job.status === "active" && (
                            <DropdownItem
                              key="close"
                              className="text-warning"
                              color="warning"
                              startContent={<Icon icon="lucide:pause" />}
                              onPress={() => handleRowAction("close", job.id)}
                            >
                              Close Job
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" />}
                            onPress={() => handleRowAction("delete", job.id)}
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
            
            {filteredJobs.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredJobs.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* View Job Modal */}
        <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="4xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:eye" className="text-green-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Job Details</h3>
                      <p className="text-sm text-gray-500">Complete job information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedJob && (
                    <div className="space-y-6">
                      {/* Job Header */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h4>
                        <p className="text-gray-600 mt-1">{selectedJob.department} • {selectedJob.location}</p>
                        <div className="flex gap-2 mt-3">
                          <Chip
                            size="sm"
                            color={statusColorMap[selectedJob.status] as any}
                            variant="flat"
                          >
                            {selectedJob.status}
                          </Chip>
                          <Chip
                            size="sm"
                            color={priorityColorMap[selectedJob.priority] as any}
                            variant="flat"
                          >
                            {selectedJob.priority} priority
                          </Chip>
                          {selectedJob.remote && (
                            <Chip size="sm" color="primary" variant="flat">Remote</Chip>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Job Type</span>
                            <p className="font-medium">{selectedJob.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Experience Required</span>
                            <p className="font-medium">{selectedJob.experience}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Salary Range</span>
                            <p className="font-medium">{selectedJob.salary}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Education</span>
                            <p className="font-medium">{selectedJob.education}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Applications</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-green-600">{selectedJob.applications}</span>
                              </div>
                              <span className="text-sm text-gray-600">applications received</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Posted Date</span>
                            <p className="font-medium">{new Date(selectedJob.postedDate).toLocaleDateString()}</p>
                          </div>
                          {selectedJob.deadline && (
                            <div>
                              <span className="text-gray-500 text-sm">Application Deadline</span>
                              <p className="font-medium">{new Date(selectedJob.deadline).toLocaleDateString()}</p>
                            </div>
                          )}
                          {selectedJob.hiringManager && (
                            <div>
                              <span className="text-gray-500 text-sm">Hiring Manager</span>
                              <p className="font-medium">{selectedJob.hiringManager}</p>
                            </div>
                          )}
                          {selectedJob.budget && (
                            <div>
                              <span className="text-gray-500 text-sm">Budget</span>
                              <p className="font-medium">{selectedJob.budget}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500 text-sm">Contract Type</span>
                            <p className="font-medium capitalize">{selectedJob.contractType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <span className="text-gray-500 text-sm">Job Description</span>
                        <p className="font-medium mt-1">{selectedJob.description}</p>
                      </div>

                      {/* Requirements and Responsibilities */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <span className="text-gray-500 text-sm">Requirements</span>
                          <ul className="mt-1 space-y-1">
                            {selectedJob.requirements.map((req, index) => (
                              <li key={index} className="text-sm text-gray-700">• {req}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Responsibilities</span>
                          <ul className="mt-1 space-y-1">
                            {selectedJob.responsibilities.map((resp, index) => (
                              <li key={index} className="text-sm text-gray-700">• {resp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Skills and Benefits */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <span className="text-gray-500 text-sm">Required Skills</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedJob.skills.map((skill, index) => (
                              <Chip key={index} size="sm" variant="flat" color="primary">
                                {skill}
                              </Chip>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Benefits</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedJob.benefits.map((benefit, index) => (
                              <Chip key={index} size="sm" variant="flat" color="success">
                                {benefit}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Edit Job Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:edit" className="text-green-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {editingJob?.id && jobList.find(j => j.id === editingJob.id) ? 'Edit Job' : 'Post New Job'}
                      </h3>
                      <p className="text-sm text-gray-500">Update job information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {editingJob && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Job Title"
                          placeholder="Enter job title"
                          value={editingJob.title}
                          onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                          isRequired
                        />
                        <Select
                          label="Department"
                          placeholder="Select department"
                          selectedKeys={[editingJob.department]}
                          onSelectionChange={(keys) => setEditingJob({...editingJob, department: Array.from(keys)[0] as string})}
                          isRequired
                          items={departments.map(dept => ({ key: dept, label: dept }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Input
                          label="Location"
                          placeholder="Enter location"
                          value={editingJob.location}
                          onChange={(e) => setEditingJob({...editingJob, location: e.target.value})}
                          isRequired
                        />
                        <Select
                          label="Job Type"
                          placeholder="Select job type"
                          selectedKeys={[editingJob.type]}
                          onSelectionChange={(keys) => setEditingJob({...editingJob, type: Array.from(keys)[0] as string})}
                          isRequired
                          items={jobTypes.map(type => ({ key: type, label: type }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Input
                          label="Experience Required"
                          placeholder="e.g., 3+ years"
                          value={editingJob.experience}
                          onChange={(e) => setEditingJob({...editingJob, experience: e.target.value})}
                        />
                        <Input
                          label="Salary Range"
                          placeholder="e.g., $50,000 - $70,000"
                          value={editingJob.salary}
                          onChange={(e) => setEditingJob({...editingJob, salary: e.target.value})}
                        />
                      </div>

                      <Textarea
                        label="Job Description"
                        placeholder="Enter job description"
                        value={editingJob.description}
                        onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                        isRequired
                        minRows={4}
                      />

                      {/* Additional Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="Urgency"
                          selectedKeys={[editingJob.urgency]}
                          onSelectionChange={(keys) => setEditingJob({...editingJob, urgency: Array.from(keys)[0] as Job['urgency']})}
                          items={urgencyLevels.map(level => ({ key: level, label: level }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Select
                          label="Priority"
                          selectedKeys={[editingJob.priority]}
                          onSelectionChange={(keys) => setEditingJob({...editingJob, priority: Array.from(keys)[0] as Job['priority']})}
                          items={priorityLevels.map(level => ({ key: level, label: level }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Select
                          label="Contract Type"
                          selectedKeys={[editingJob.contractType]}
                          onSelectionChange={(keys) => setEditingJob({...editingJob, contractType: Array.from(keys)[0] as Job['contractType']})}
                          items={contractTypes.map(type => ({ key: type, label: type }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Input
                          label="Education Required"
                          placeholder="e.g., Bachelor's Degree"
                          value={editingJob.education}
                          onChange={(e) => setEditingJob({...editingJob, education: e.target.value})}
                        />
                        <Input
                          label="Application Deadline"
                          type="date"
                          value={editingJob.deadline || ''}
                          onChange={(e) => setEditingJob({...editingJob, deadline: e.target.value})}
                        />
                        <Input
                          label="Hiring Manager"
                          placeholder="Enter hiring manager name"
                          value={editingJob.hiringManager || ''}
                          onChange={(e) => setEditingJob({...editingJob, hiringManager: e.target.value})}
                        />
                        <Input
                          label="Budget"
                          placeholder="Enter budget"
                          value={editingJob.budget || ''}
                          onChange={(e) => setEditingJob({...editingJob, budget: e.target.value})}
                        />
                      </div>

                      {/* Requirements, Responsibilities, Skills, and Benefits */}
                      <div className="grid grid-cols-2 gap-4">
                        <Textarea
                          label="Requirements (one per line)"
                          placeholder="Enter requirements"
                          value={editingJob.requirements.join('\n')}
                          onChange={(e) => setEditingJob({...editingJob, requirements: e.target.value.split('\n').filter(r => r.trim())})}
                          minRows={4}
                        />
                        <Textarea
                          label="Responsibilities (one per line)"
                          placeholder="Enter responsibilities"
                          value={editingJob.responsibilities.join('\n')}
                          onChange={(e) => setEditingJob({...editingJob, responsibilities: e.target.value.split('\n').filter(r => r.trim())})}
                          minRows={4}
                        />
                        <Input
                          label="Skills (comma separated)"
                          placeholder="e.g., React, Node.js, TypeScript"
                          value={editingJob.skills.join(', ')}
                          onChange={(e) => setEditingJob({...editingJob, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        />
                        <Input
                          label="Benefits (comma separated)"
                          placeholder="e.g., Health Insurance, 401k, Remote Work"
                          value={editingJob.benefits.join(', ')}
                          onChange={(e) => setEditingJob({...editingJob, benefits: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        />
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleSaveJob}>
                    {editingJob?.id && jobList.find(j => j.id === editingJob.id) ? 'Update Job' : 'Post Job'}
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