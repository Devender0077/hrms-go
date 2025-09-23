import React from "react";
    import { 
      Card, 
      CardBody, 
      CardHeader,
      CardFooter,
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
      Tabs,
      Tab,
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      useDisclosure,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    
    // Sample job postings data
    const jobPostings = [
      { 
        id: 1, 
        title: "Senior React Developer", 
        department: "IT",
        location: "New York, NY",
        type: "full_time",
        experience: "3-5 years",
        salary: "$90,000 - $120,000",
        vacancies: 2,
        applicants: 24,
        closingDate: "2023-08-15",
        status: "published",
        createdAt: "2023-07-01"
      },
      { 
        id: 2, 
        title: "HR Manager", 
        department: "HR",
        location: "Chicago, IL",
        type: "full_time",
        experience: "5+ years",
        salary: "$80,000 - $100,000",
        vacancies: 1,
        applicants: 18,
        closingDate: "2023-08-20",
        status: "published",
        createdAt: "2023-07-05"
      },
      { 
        id: 3, 
        title: "Marketing Specialist", 
        department: "Marketing",
        location: "Remote",
        type: "full_time",
        experience: "2-4 years",
        salary: "$70,000 - $85,000",
        vacancies: 2,
        applicants: 32,
        closingDate: "2023-08-10",
        status: "published",
        createdAt: "2023-07-02"
      },
      { 
        id: 4, 
        title: "Financial Analyst", 
        department: "Finance",
        location: "Boston, MA",
        type: "full_time",
        experience: "3-5 years",
        salary: "$75,000 - $95,000",
        vacancies: 1,
        applicants: 15,
        closingDate: "2023-08-25",
        status: "published",
        createdAt: "2023-07-08"
      },
      { 
        id: 5, 
        title: "Customer Support Representative", 
        department: "Operations",
        location: "Remote",
        type: "full_time",
        experience: "1-3 years",
        salary: "$45,000 - $55,000",
        vacancies: 3,
        applicants: 47,
        closingDate: "2023-08-05",
        status: "closed",
        createdAt: "2023-06-20"
      },
      { 
        id: 6, 
        title: "UI/UX Designer", 
        department: "IT",
        location: "San Francisco, CA",
        type: "full_time",
        experience: "2-5 years",
        salary: "$85,000 - $110,000",
        vacancies: 1,
        applicants: 28,
        closingDate: "2023-08-18",
        status: "draft",
        createdAt: "2023-07-10"
      },
    ];
    
    // Sample job applications data
    const jobApplications = [
      { 
        id: 1, 
        jobId: 1,
        jobTitle: "Senior React Developer",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        experience: "4 years",
        status: "screening",
        appliedDate: "2023-07-05",
        resumeUrl: "#",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=11"
      },
      { 
        id: 2, 
        jobId: 1,
        jobTitle: "Senior React Developer",
        firstName: "Emily",
        lastName: "Johnson",
        email: "emily.johnson@example.com",
        phone: "+1 (555) 987-6543",
        experience: "5 years",
        status: "interview",
        appliedDate: "2023-07-06",
        resumeUrl: "#",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=12"
      },
      { 
        id: 3, 
        jobId: 2,
        jobTitle: "HR Manager",
        firstName: "Michael",
        lastName: "Williams",
        email: "michael.williams@example.com",
        phone: "+1 (555) 456-7890",
        experience: "7 years",
        status: "testing",
        appliedDate: "2023-07-07",
        resumeUrl: "#",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=13"
      },
      { 
        id: 4, 
        jobId: 3,
        jobTitle: "Marketing Specialist",
        firstName: "Sarah",
        lastName: "Brown",
        email: "sarah.brown@example.com",
        phone: "+1 (555) 234-5678",
        experience: "3 years",
        status: "new",
        appliedDate: "2023-07-08",
        resumeUrl: "#",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=14"
      },
      { 
        id: 5, 
        jobId: 3,
        jobTitle: "Marketing Specialist",
        firstName: "David",
        lastName: "Miller",
        email: "david.miller@example.com",
        phone: "+1 (555) 876-5432",
        experience: "4 years",
        status: "offer",
        appliedDate: "2023-07-09",
        resumeUrl: "#",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=15"
      },
    ];
    
    const statusColorMap = {
      published: "success",
      draft: "default",
      closed: "danger",
      new: "primary",
      screening: "secondary",
      interview: "warning",
      testing: "secondary",
      offer: "success",
      hired: "success",
      rejected: "danger"
    };
    
    export default function Recruitment() {
      const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
      const [activeTab, setActiveTab] = React.useState("jobs");
      const [page, setPage] = React.useState(1);
      const [searchQuery, setSearchQuery] = React.useState("");
      const [selectedStatus, setSelectedStatus] = React.useState("all");
      
      const rowsPerPage = 5;
      
      // Filter job postings based on search and filters
      const filteredJobs = React.useMemo(() => {
        return jobPostings.filter(job => {
          // Search filter
          const matchesSearch = 
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Status filter
          const matchesStatus = 
            selectedStatus === "all" || 
            job.status.toLowerCase() === selectedStatus.toLowerCase();
          
          return matchesSearch && matchesStatus;
        });
      }, [searchQuery, selectedStatus]);
      
      // Filter job applications based on search
      const filteredApplications = React.useMemo(() => {
        return jobApplications.filter(application => {
          // Search filter
          const matchesSearch = 
            `${application.firstName} ${application.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            application.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            application.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Status filter
          const matchesStatus = 
            selectedStatus === "all" || 
            application.status.toLowerCase() === selectedStatus.toLowerCase();
          
          return matchesSearch && matchesStatus;
        });
      }, [searchQuery, selectedStatus]);
      
      // Get active data based on current tab
      const activeData = activeTab === "jobs" ? filteredJobs : filteredApplications;
      
      // Calculate pagination
      const pages = Math.ceil(activeData.length / rowsPerPage);
      const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        
        return activeData.slice(start, end);
      }, [page, activeData]);
      
      // Get unique statuses for filter based on active tab
      const statuses = React.useMemo(() => {
        if (activeTab === "jobs") {
          return ["all", ...new Set(jobPostings.map(job => job.status.toLowerCase()))];
        } else {
          return ["all", ...new Set(jobApplications.map(app => app.status.toLowerCase()))];
        }
      }, [activeTab]);
      
      const handleCreateJob = () => {
        addToast({
          title: "Job Created",
          description: "New job posting has been created successfully",
          color: "success",
        });
      };
      
      const handleUpdateStatus = (id, newStatus) => {
        addToast({
          title: "Status Updated",
          description: `Status has been updated to ${newStatus}`,
          color: "success",
        });
      };
      
      return (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Recruitment</h1>
              <p className="text-default-500">Manage job postings and applications</p>
            </div>
            <div className="flex gap-2">
              <Button color="primary" startContent={<Icon icon="lucide:plus" />} onPress={onOpen}>
                Create Job
              </Button>
              <Button variant="flat" startContent={<Icon icon="lucide:users" />}>
                Candidates
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon icon="lucide:briefcase" className="text-2xl text-primary" />
                  </div>
                  <div>
                    <p className="text-default-500">Open Positions</p>
                    <h3 className="text-2xl font-bold">12</h3>
                    <p className="text-primary text-xs flex items-center">
                      <Icon icon="lucide:trending-up" className="mr-1" />
                      Active job postings
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Icon icon="lucide:users" className="text-2xl text-secondary" />
                  </div>
                  <div>
                    <p className="text-default-500">Total Applicants</p>
                    <h3 className="text-2xl font-bold">164</h3>
                    <p className="text-secondary text-xs flex items-center">
                      <Icon icon="lucide:trending-up" className="mr-1" />
                      +12% this month
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Icon icon="lucide:calendar" className="text-2xl text-warning" />
                  </div>
                  <div>
                    <p className="text-default-500">Interviews</p>
                    <h3 className="text-2xl font-bold">28</h3>
                    <p className="text-warning text-xs flex items-center">
                      <Icon icon="lucide:calendar" className="mr-1" />
                      This week
                    </p>
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
                    <p className="text-default-500">Hired</p>
                    <h3 className="text-2xl font-bold">8</h3>
                    <p className="text-success text-xs flex items-center">
                      <Icon icon="lucide:trending-up" className="mr-1" />
                      This month
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-4">
              <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={setActiveTab}
                color="primary"
                variant="underlined"
                classNames={{
                  tab: "h-12",
                }}
              >
                <Tab key="jobs" title="Job Postings" />
                <Tab key="applications" title="Applications" />
              </Tabs>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Input
                  isClearable
                  placeholder={activeTab === "jobs" ? "Search jobs..." : "Search applications..."}
                  startContent={<Icon icon="lucide:search" className="text-default-400" />}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="w-full sm:max-w-[44%]"
                />
                <div className="flex gap-3">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button 
                        variant="flat" 
                        endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
                      >
                        Status: {selectedStatus === "all" ? "All" : selectedStatus}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                      aria-label="Status filter"
                      onAction={(key) => setSelectedStatus(key.toString())}
                      selectedKeys={[selectedStatus]}
                      selectionMode="single"
                    >
                      {statuses.map((status) => (
                        <DropdownItem key={status} textValue={status}>
                          {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {activeTab === "jobs" ? (
                <Table 
                  removeWrapper 
                  aria-label="Job postings table"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={pages}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>JOB TITLE</TableColumn>
                    <TableColumn>DEPARTMENT</TableColumn>
                    <TableColumn>LOCATION</TableColumn>
                    <TableColumn>VACANCIES</TableColumn>
                    <TableColumn>APPLICANTS</TableColumn>
                    <TableColumn>CLOSING DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No job postings found">
                    {items.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-xs text-default-500">{job.type.replace('_', ' ')}</p>
                          </div>
                        </TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{job.vacancies}</TableCell>
                        <TableCell>{job.applicants}</TableCell>
                        <TableCell>{job.closingDate}</TableCell>
                        <TableCell>
                          <Chip 
                            size="sm" 
                            color={statusColorMap[job.status]}
                            variant="flat"
                          >
                            {job.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:eye" className="text-default-500" />
                            </Button>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:edit" className="text-default-500" />
                            </Button>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:trash" className="text-danger" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table 
                  removeWrapper 
                  aria-label="Job applications table"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={pages}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>CANDIDATE</TableColumn>
                    <TableColumn>JOB POSITION</TableColumn>
                    <TableColumn>EXPERIENCE</TableColumn>
                    <TableColumn>APPLIED DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No applications found">
                    {items.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar src={application.avatar} size="sm" />
                            <div>
                              <p className="font-medium">{application.firstName} {application.lastName}</p>
                              <p className="text-xs text-default-500">{application.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{application.jobTitle}</TableCell>
                        <TableCell>{application.experience}</TableCell>
                        <TableCell>{application.appliedDate}</TableCell>
                        <TableCell>
                          <Chip 
                            size="sm" 
                            color={statusColorMap[application.status]}
                            variant="flat"
                          >
                            {application.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button 
                                  size="sm" 
                                  variant="flat"
                                  endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
                                >
                                  Update
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu 
                                aria-label="Update status"
                                onAction={(key) => handleUpdateStatus(application.id, key)}
                              >
                                <DropdownItem key="screening">Screening</DropdownItem>
                                <DropdownItem key="interview">Interview</DropdownItem>
                                <DropdownItem key="testing">Testing</DropdownItem>
                                <DropdownItem key="offer">Offer</DropdownItem>
                                <DropdownItem key="hired" className="text-success">Hired</DropdownItem>
                                <DropdownItem key="rejected" className="text-danger">Rejected</DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:eye" className="text-default-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </motion.div>
      );
    }