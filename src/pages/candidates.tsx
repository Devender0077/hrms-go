import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Avatar, Badge, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import Papa from "papaparse";

// Candidate interface
interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  status: "applied" | "screening" | "interview" | "offered" | "hired" | "rejected";
  appliedDate: string;
  resume: string;
  avatar: string;
  skills: string[];
  education: string;
  currentCompany?: string;
  expectedSalary?: string;
  availability: string;
  notes?: string;
  source: string;
  jobId?: string;
}

// Sample candidates data
const initialCandidates: Candidate[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Software Engineer",
    experience: "5 years",
    status: "interview",
    appliedDate: "2025-01-15",
    resume: "john_smith_resume.pdf",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
    skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
    education: "BS Computer Science, MIT",
    currentCompany: "Tech Corp",
    expectedSalary: "$90,000 - $110,000",
    availability: "2 weeks notice",
    notes: "Strong technical background, good communication skills",
    source: "LinkedIn",
    jobId: "JOB001"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    position: "HR Manager",
    experience: "4 years",
    status: "screening",
    appliedDate: "2025-01-14",
    resume: "sarah_johnson_resume.pdf",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
    skills: ["HRIS", "Recruitment", "Employee Relations", "Training", "Compliance"],
    education: "MS Human Resources, Stanford",
    currentCompany: "HR Solutions Inc",
    expectedSalary: "$70,000 - $85,000",
    availability: "1 month notice",
    notes: "Excellent HR experience, team player",
    source: "Company Website",
    jobId: "JOB002"
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+1 (555) 345-6789",
    position: "Marketing Specialist",
    experience: "3 years",
    status: "applied",
    appliedDate: "2025-01-13",
    resume: "michael_brown_resume.pdf",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
    skills: ["Digital Marketing", "SEO", "Social Media", "Analytics", "Content Creation"],
    education: "BA Marketing, UCLA",
    currentCompany: "Marketing Pro",
    expectedSalary: "$50,000 - $65,000",
    availability: "Immediate",
    notes: "Creative marketer with strong analytics skills",
    source: "Indeed",
    jobId: "JOB003"
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 456-7890",
    position: "Financial Analyst",
    experience: "2 years",
    status: "offered",
    appliedDate: "2025-01-12",
    resume: "emily_davis_resume.pdf",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
    skills: ["Financial Modeling", "Excel", "SQL", "Tableau", "Risk Analysis"],
    education: "MBA Finance, Wharton",
    currentCompany: "Finance Group",
    expectedSalary: "$65,000 - $80,000",
    availability: "3 weeks notice",
    notes: "Strong analytical skills, attention to detail",
    source: "Referral",
    jobId: "JOB004"
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1 (555) 567-8901",
    position: "Customer Success Manager",
    experience: "3 years",
    status: "hired",
    appliedDate: "2025-01-11",
    resume: "david_wilson_resume.pdf",
    avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
    skills: ["Customer Relations", "CRM", "Sales", "Communication", "Problem Solving"],
    education: "BS Business Administration, NYU",
    currentCompany: "Customer First",
    expectedSalary: "$55,000 - $70,000",
    availability: "2 weeks notice",
    notes: "Excellent customer service skills, team player",
    source: "LinkedIn",
    jobId: "JOB005"
  }
];

const statusColorMap = {
  applied: "default",
  screening: "warning",
  interview: "primary",
  offered: "success",
  hired: "success",
  rejected: "danger",
};

const positions = [
  "Senior Software Engineer",
  "HR Manager", 
  "Marketing Specialist",
  "Financial Analyst",
  "Customer Success Manager",
  "Product Manager",
  "Sales Representative",
  "Data Analyst"
];

const sources = [
  "LinkedIn",
  "Indeed",
  "Company Website",
  "Referral",
  "Glassdoor",
  "Career Fair",
  "Recruitment Agency"
];

export default function Candidates() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const rowsPerPage = 10;
  
  // New candidate form state
  const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    status: "applied",
    appliedDate: new Date().toISOString().split('T')[0],
    resume: "",
    avatar: "",
    skills: [],
    education: "",
    currentCompany: "",
    expectedSalary: "",
    availability: "",
    notes: "",
    source: "",
    jobId: ""
  });
  
  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = selectedStatus === "all" || candidate.status === selectedStatus;
      const matchesPosition = selectedPosition === "all" || candidate.position === selectedPosition;
      
      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [candidates, searchQuery, selectedStatus, selectedPosition]);
  
  // Paginate filtered candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCandidates = candidates.length;
    const appliedCandidates = candidates.filter(c => c.status === "applied").length;
    const interviewCandidates = candidates.filter(c => c.status === "interview").length;
    const hiredCandidates = candidates.filter(c => c.status === "hired").length;
    
    return [
      {
        label: "Total Candidates",
        value: totalCandidates,
        icon: "lucide:users",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        label: "Applied",
        value: appliedCandidates,
        icon: "lucide:user-plus",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "In Interview",
        value: interviewCandidates,
        icon: "lucide:calendar",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        label: "Hired",
        value: hiredCandidates,
        icon: "lucide:check-circle",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      }
    ];
  }, [candidates]);

  // Handle add candidate
  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.position) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, Position).",
        color: "warning",
      });
      return;
    }

    const candidate: Candidate = {
      id: Date.now(),
      name: newCandidate.name!,
      email: newCandidate.email!,
      phone: newCandidate.phone || "",
      position: newCandidate.position!,
      experience: newCandidate.experience || "",
      status: newCandidate.status as Candidate["status"] || "applied",
      appliedDate: newCandidate.appliedDate || new Date().toISOString().split('T')[0],
      resume: newCandidate.resume || "",
      avatar: newCandidate.avatar || `https://img.heroui.chat/image/avatar?w=150&h=150&u=${Date.now()}`,
      skills: newCandidate.skills || [],
      education: newCandidate.education || "",
      currentCompany: newCandidate.currentCompany || "",
      expectedSalary: newCandidate.expectedSalary || "",
      availability: newCandidate.availability || "",
      notes: newCandidate.notes || "",
      source: newCandidate.source || "",
      jobId: newCandidate.jobId || ""
    };

    setCandidates(prev => [...prev, candidate]);
    setNewCandidate({
      name: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      status: "applied",
      appliedDate: new Date().toISOString().split('T')[0],
      resume: "",
      avatar: "",
      skills: [],
      education: "",
      currentCompany: "",
      expectedSalary: "",
      availability: "",
      notes: "",
      source: "",
      jobId: ""
    });
    setIsAddModalOpen(false);
    
    addToast({
      title: "Candidate Added",
      description: `${candidate.name} has been added successfully.`,
      color: "success",
    });
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvData = candidates.map(candidate => ({
        Name: candidate.name,
        Email: candidate.email,
        Phone: candidate.phone,
        Position: candidate.position,
        Experience: candidate.experience,
        Status: candidate.status,
        "Applied Date": candidate.appliedDate,
        Resume: candidate.resume,
        Skills: candidate.skills.join(", "),
        Education: candidate.education,
        "Current Company": candidate.currentCompany || "",
        "Expected Salary": candidate.expectedSalary || "",
        Availability: candidate.availability,
        Notes: candidate.notes || "",
        Source: candidate.source,
        "Job ID": candidate.jobId || ""
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `candidates_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast({
        title: "Export Successful",
        description: "Candidates data has been exported successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export candidates data. Please try again.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle resume download
  const handleDownloadResume = (candidate: Candidate) => {
    // Simulate resume download
    addToast({
      title: "Download Started",
      description: `Downloading resume for ${candidate.name}...`,
      color: "success",
    });
  };

  // Handle status update
  const handleStatusUpdate = (candidate: Candidate, newStatus: Candidate["status"]) => {
    setCandidates(prev => 
      prev.map(c => 
        c.id === candidate.id ? { ...c, status: newStatus } : c
      )
    );
    
    addToast({
      title: "Status Updated",
      description: `${candidate.name}'s status has been updated to ${newStatus}.`,
      color: "success",
    });
  };

  // Handle delete candidate
  const handleDeleteCandidate = (candidate: Candidate) => {
    setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    
    addToast({
      title: "Candidate Deleted",
      description: `${candidate.name} has been removed from the system.`,
      color: "success",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Icon icon="lucide:user-plus" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
              <p className="text-gray-600 mt-1">Manage job candidates and recruitment pipeline</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
              isLoading={isExporting}
              className="font-medium"
            >
              Export CSV
            </Button>
            <Button 
              color="primary" 
              startContent={<Icon icon="lucide:plus" />} 
              onPress={() => setIsAddModalOpen(true)}
              className="font-medium"
            >
              Add Candidate
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

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search candidates..."
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
                <SelectItem key="applied">Applied</SelectItem>
                <SelectItem key="screening">Screening</SelectItem>
                <SelectItem key="interview">Interview</SelectItem>
                <SelectItem key="offered">Offered</SelectItem>
                <SelectItem key="hired">Hired</SelectItem>
                <SelectItem key="rejected">Rejected</SelectItem>
              </Select>
              <Select
                label="Position"
                placeholder="All Positions"
                selectedKeys={[selectedPosition]}
                onSelectionChange={(keys) => setSelectedPosition(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Positions</SelectItem>
                {positions.map(position => (
                  <SelectItem key={position}>{position}</SelectItem>
                ))}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-blue-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Candidates List</h3>
                <p className="text-gray-500 text-sm">Manage and track candidate applications</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Candidates table">
              <TableHeader>
                <TableColumn>CANDIDATE</TableColumn>
                <TableColumn>POSITION</TableColumn>
                <TableColumn>EXPERIENCE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>APPLIED DATE</TableColumn>
                <TableColumn>SOURCE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={candidate.avatar} 
                          name={candidate.name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-sm text-gray-500">{candidate.email}</p>
                          <p className="text-sm text-gray-500">{candidate.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{candidate.position}</p>
                        <p className="text-sm text-gray-500">{candidate.currentCompany}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{candidate.experience}</p>
                        <p className="text-sm text-gray-500">{candidate.education}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[candidate.status] as any}
                        variant="flat"
                      >
                        {candidate.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(candidate.appliedDate).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default">
                        {candidate.source}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedCandidate(candidate);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => handleDownloadResume(candidate)}
                        >
                          <Icon icon="lucide:download" className="w-4 h-4" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="flat">
                              <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem key="schedule" onPress={() => handleStatusUpdate(candidate, "interview")}>
                              Schedule Interview
                            </DropdownItem>
                            <DropdownItem key="offer" onPress={() => handleStatusUpdate(candidate, "offered")}>
                              Make Offer
                            </DropdownItem>
                            <DropdownItem key="hire" onPress={() => handleStatusUpdate(candidate, "hired")}>
                              Hire
                            </DropdownItem>
                            <DropdownItem key="reject" onPress={() => handleStatusUpdate(candidate, "rejected")}>
                              Reject
                            </DropdownItem>
                            <DropdownItem key="delete" className="text-danger" onPress={() => handleDeleteCandidate(candidate)}>
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
            
            {filteredCandidates.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredCandidates.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add Candidate Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Add New Candidate</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="Enter candidate name"
                  value={newCandidate.name || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="Enter email address"
                  value={newCandidate.email || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="Phone"
                  placeholder="Enter phone number"
                  value={newCandidate.phone || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Select
                  label="Position *"
                  placeholder="Select position"
                  selectedKeys={newCandidate.position ? [newCandidate.position] : []}
                  onSelectionChange={(keys) => setNewCandidate(prev => ({ ...prev, position: Array.from(keys)[0] as string }))}
                >
                  {positions.map(position => (
                    <SelectItem key={position}>{position}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Experience"
                  placeholder="e.g., 3 years"
                  value={newCandidate.experience || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, experience: e.target.value }))}
                />
                <Input
                  label="Education"
                  placeholder="e.g., BS Computer Science"
                  value={newCandidate.education || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, education: e.target.value }))}
                />
                <Input
                  label="Current Company"
                  placeholder="Enter current company"
                  value={newCandidate.currentCompany || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, currentCompany: e.target.value }))}
                />
                <Input
                  label="Expected Salary"
                  placeholder="e.g., $50,000 - $70,000"
                  value={newCandidate.expectedSalary || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, expectedSalary: e.target.value }))}
                />
                <Input
                  label="Availability"
                  placeholder="e.g., 2 weeks notice"
                  value={newCandidate.availability || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, availability: e.target.value }))}
                />
                <Select
                  label="Source"
                  placeholder="Select source"
                  selectedKeys={newCandidate.source ? [newCandidate.source] : []}
                  onSelectionChange={(keys) => setNewCandidate(prev => ({ ...prev, source: Array.from(keys)[0] as string }))}
                >
                  {sources.map(source => (
                    <SelectItem key={source}>{source}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Resume File"
                  placeholder="resume.pdf"
                  value={newCandidate.resume || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, resume: e.target.value }))}
                />
                <Input
                  label="Job ID"
                  placeholder="JOB001"
                  value={newCandidate.jobId || ""}
                  onChange={(e) => setNewCandidate(prev => ({ ...prev, jobId: e.target.value }))}
                />
              </div>
              <Textarea
                label="Notes"
                placeholder="Additional notes about the candidate"
                value={newCandidate.notes || ""}
                onChange={(e) => setNewCandidate(prev => ({ ...prev, notes: e.target.value }))}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleAddCandidate}>
                Add Candidate
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Candidate Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="3xl">
          <ModalContent>
            <ModalHeader>Candidate Details</ModalHeader>
            <ModalBody>
              {selectedCandidate && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={selectedCandidate.avatar} 
                      name={selectedCandidate.name}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedCandidate.name}</h3>
                      <p className="text-gray-600">{selectedCandidate.email}</p>
                      <p className="text-gray-600">{selectedCandidate.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Position & Experience</h4>
                      <p><strong>Position:</strong> {selectedCandidate.position}</p>
                      <p><strong>Experience:</strong> {selectedCandidate.experience}</p>
                      <p><strong>Education:</strong> {selectedCandidate.education}</p>
                      <p><strong>Current Company:</strong> {selectedCandidate.currentCompany || "N/A"}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Application Details</h4>
                      <p><strong>Status:</strong> 
                        <Chip size="sm" color={statusColorMap[selectedCandidate.status] as any} variant="flat" className="ml-2">
                          {selectedCandidate.status}
                        </Chip>
                      </p>
                      <p><strong>Applied Date:</strong> {new Date(selectedCandidate.appliedDate).toLocaleDateString()}</p>
                      <p><strong>Source:</strong> {selectedCandidate.source}</p>
                      <p><strong>Job ID:</strong> {selectedCandidate.jobId || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <Chip key={index} size="sm" variant="flat" color="primary">
                          {skill}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Compensation & Availability</h4>
                      <p><strong>Expected Salary:</strong> {selectedCandidate.expectedSalary || "N/A"}</p>
                      <p><strong>Availability:</strong> {selectedCandidate.availability}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Resume</h4>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => handleDownloadResume(selectedCandidate)}
                        startContent={<Icon icon="lucide:download" />}
                      >
                        Download Resume
                      </Button>
                    </div>
                  </div>
                  
                  {selectedCandidate.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-gray-700">{selectedCandidate.notes}</p>
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