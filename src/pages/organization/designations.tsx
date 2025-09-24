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
      Pagination,
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      useDisclosure,
      Textarea,
      Select,
      SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
import { addToast } from "@heroui/react";

// Enhanced Designation interface
interface Designation {
  id: number;
  title: string;
  department: string;
  description: string;
  employees: number;
  status: "active" | "inactive";
  level: "entry" | "mid" | "senior" | "executive";
  salaryRange: {
    min: number;
    max: number;
  };
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experience: string;
  education: string;
}
    
    // Sample designations data
const designationsData: Designation[] = [
      { 
        id: 1, 
        title: "Chief Executive Officer", 
        department: "Executive",
        description: "Responsible for overall company leadership and strategy",
        employees: 1,
    status: "active",
    level: "executive",
    salaryRange: { min: 200000, max: 500000 },
    requirements: ["MBA or equivalent", "10+ years leadership experience"],
    responsibilities: ["Strategic planning", "Company leadership", "Board relations"],
    skills: ["Leadership", "Strategy", "Management"],
    experience: "15+ years",
    education: "MBA or equivalent"
      },
      { 
        id: 2, 
        title: "Chief Technology Officer", 
        department: "Information Technology",
        description: "Oversees all technical aspects and technology development",
        employees: 1,
    status: "active",
    level: "executive",
    salaryRange: { min: 150000, max: 300000 },
    requirements: ["Computer Science degree", "8+ years tech leadership"],
    responsibilities: ["Technology strategy", "Team leadership", "Innovation"],
    skills: ["Technology", "Leadership", "Innovation"],
    experience: "12+ years",
    education: "Computer Science degree"
      },
      { 
        id: 3, 
        title: "HR Manager", 
        department: "Human Resources",
        description: "Manages HR operations and employee relations",
        employees: 2,
    status: "active",
    level: "senior",
    salaryRange: { min: 80000, max: 120000 },
    requirements: ["HR degree or certification", "5+ years HR experience"],
    responsibilities: ["Employee relations", "Recruitment", "Policy development"],
    skills: ["HR Management", "Communication", "Recruitment"],
    experience: "7+ years",
    education: "HR degree or certification"
      },
      { 
        id: 4, 
        title: "Senior Software Engineer", 
        department: "Information Technology",
        description: "Leads software development projects and mentors junior developers",
        employees: 8,
    status: "active",
    level: "senior",
    salaryRange: { min: 100000, max: 150000 },
    requirements: ["Computer Science degree", "5+ years development experience"],
    responsibilities: ["Code development", "Team mentoring", "Architecture design"],
    skills: ["Programming", "Leadership", "System Design"],
    experience: "6+ years",
    education: "Computer Science degree"
      },
      { 
        id: 5, 
        title: "Software Engineer", 
        department: "Information Technology",
        description: "Develops and maintains software applications",
        employees: 15,
    status: "active",
    level: "mid",
    salaryRange: { min: 70000, max: 100000 },
    requirements: ["Computer Science degree", "2+ years development experience"],
    responsibilities: ["Code development", "Testing", "Documentation"],
    skills: ["Programming", "Problem Solving", "Teamwork"],
    experience: "3+ years",
    education: "Computer Science degree"
  }
];

    const departments = [
  "Executive", "Human Resources", "Information Technology", "Marketing", 
  "Finance", "Sales", "Customer Support", "Research & Development", "Operations"
];

const levels = [
  { key: "entry", label: "Entry Level", color: "primary" },
  { key: "mid", label: "Mid Level", color: "secondary" },
  { key: "senior", label: "Senior Level", color: "success" },
  { key: "executive", label: "Executive", color: "warning" }
    ];
    
    const statusColorMap = {
      active: "success",
      inactive: "danger",
    };
    
    export default function Designations() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [designationList, setDesignationList] = useState(designationsData);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
      
      const rowsPerPage = 10;
      
  // Filter designations
  const filteredDesignations = useMemo(() => {
    return designationList.filter(designation => {
          const matchesSearch = 
            designation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            designation.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            designation.description.toLowerCase().includes(searchQuery.toLowerCase());
            
      const matchesDepartment = selectedDepartment === "all" || designation.department === selectedDepartment;
      const matchesLevel = selectedLevel === "all" || designation.level === selectedLevel;
      const matchesStatus = selectedStatus === "all" || designation.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesLevel && matchesStatus;
    });
  }, [designationList, searchQuery, selectedDepartment, selectedLevel, selectedStatus]);
  
  // Paginate filtered designations
  const paginatedDesignations = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredDesignations.slice(startIndex, endIndex);
  }, [filteredDesignations, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = designationList.length;
    const active = designationList.filter(d => d.status === "active").length;
    const inactive = designationList.filter(d => d.status === "inactive").length;
    const totalEmployees = designationList.reduce((sum, d) => sum + d.employees, 0);
    
    return { total, active, inactive, totalEmployees };
  }, [designationList]);

  // Handle row actions
  const handleRowAction = (actionKey: string, designationId: number) => {
    const designation = designationList.find(d => d.id === designationId);
    if (!designation) return;

    switch (actionKey) {
      case "view":
          setSelectedDesignation(designation);
        onViewOpen();
        break;
      case "edit":
        setEditingDesignation({ ...designation });
        onOpen();
        break;
      case "delete":
        handleDeleteDesignation(designationId);
        break;
      default:
        break;
    }
  };

  // Handle add designation
  const handleAddDesignation = () => {
    const newDesignation: Designation = {
      id: Math.max(...designationList.map(d => d.id)) + 1,
            title: "",
            department: "",
            description: "",
      employees: 0,
      status: "active",
      level: "mid",
      salaryRange: { min: 0, max: 0 },
      requirements: [],
      responsibilities: [],
      skills: [],
      experience: "",
      education: ""
    };
    setEditingDesignation(newDesignation);
        onOpen();
      };
      
  // Handle save designation
  const handleSaveDesignation = () => {
    if (!editingDesignation) return;

    if (!editingDesignation.title || !editingDesignation.department || !editingDesignation.description) {
          addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
          });
          return;
        }
        
    const isNewDesignation = !designationList.find(d => d.id === editingDesignation.id);
    
    if (isNewDesignation) {
      setDesignationList(prev => [...prev, editingDesignation]);
          addToast({
        title: "Designation Added",
        description: `${editingDesignation.title} has been added successfully.`,
            color: "success",
          });
        } else {
      setDesignationList(prev => 
        prev.map(d => d.id === editingDesignation.id ? editingDesignation : d)
      );
          addToast({
        title: "Designation Updated",
        description: `${editingDesignation.title} has been updated successfully.`,
            color: "success",
          });
        }
        
    setEditingDesignation(null);
    onOpenChange();
  };

  // Handle delete designation
  const handleDeleteDesignation = (designationId: number) => {
    const designation = designationList.find(d => d.id === designationId);
    if (!designation) return;

    setDesignationList(prev => prev.filter(d => d.id !== designationId));
        addToast({
      title: "Designation Deleted",
      description: `${designation.title} has been removed from the system.`,
          color: "success",
        });
      };

  // Export to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSV(filteredDesignations);
      downloadFile(csvContent, `designations-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      addToast({
        title: "Export Successful",
        description: "Designation data has been exported to CSV.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export designation data.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate CSV content
  const generateCSV = (designations: Designation[]) => {
    const headers = [
      'ID', 'Title', 'Department', 'Description', 'Employees', 'Status', 'Level', 
      'Min Salary', 'Max Salary', 'Experience', 'Education'
    ];
    
    const rows = designations.map(designation => [
      designation.id,
      designation.title,
      designation.department,
      designation.description,
      designation.employees,
      designation.status,
      designation.level,
      designation.salaryRange.min,
      designation.salaryRange.max,
      designation.experience,
      designation.education
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Icon icon="lucide:award" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Designations</h1>
              <p className="text-gray-600 mt-1">Manage job titles and positions</p>
            </div>
          </div>
          <div className="flex gap-3">
              <Button 
                color="primary" 
              variant="flat"
                startContent={<Icon icon="lucide:plus" />} 
              onPress={handleAddDesignation}
              className="font-medium"
              >
                Add Designation
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                  <Icon icon="lucide:award" className="text-2xl text-primary" />
                  </div>
                  <div>
                    <p className="text-default-500">Total Designations</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                  <Icon icon="lucide:users" className="text-2xl text-success" />
                  </div>
                  <div>
                  <p className="text-default-500">Total Employees</p>
                  <h3 className="text-2xl font-bold">{stats.totalEmployees}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                  <Icon icon="lucide:check-circle" className="text-2xl text-warning" />
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
                  <div className="p-3 rounded-full bg-danger/10">
                  <Icon icon="lucide:x-circle" className="text-2xl text-danger" />
                  </div>
                  <div>
                    <p className="text-default-500">Inactive</p>
                  <h3 className="text-2xl font-bold">{stats.inactive}</h3>
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
                placeholder="Search designations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-gray-400" />}
              />
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
                label="Level"
                placeholder="All Levels"
                selectedKeys={[selectedLevel]}
                onSelectionChange={(keys) => setSelectedLevel(Array.from(keys)[0] as string)}
                items={levels.map(level => ({ key: level.key, label: level.label }))}
              >
                {(item) => (
                  <SelectItem key={item.key}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                label="Status"
                placeholder="All Status"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                items={[
                  { key: "all", label: "All Status" },
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" }
                ]}
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

        {/* Designations Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-purple-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Designation Directory</h3>
                <p className="text-gray-500 text-sm">Click on actions to view, edit, or manage designations</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Designations table">
                <TableHeader>
                  <TableColumn>DESIGNATION</TableColumn>
                  <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>LEVEL</TableColumn>
                  <TableColumn>EMPLOYEES</TableColumn>
                <TableColumn>SALARY RANGE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
              <TableBody>
                {paginatedDesignations.map((designation) => (
                    <TableRow key={designation.id}>
                      <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{designation.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{designation.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                      <p className="font-medium text-gray-900">{designation.department}</p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={levels.find(l => l.key === designation.level)?.color as any || "default"}
                        variant="flat"
                      >
                        {levels.find(l => l.key === designation.level)?.label}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">{designation.employees}</span>
                        </div>
                        <span className="text-sm text-gray-600">employees</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        ${designation.salaryRange.min.toLocaleString()} - ${designation.salaryRange.max.toLocaleString()}
                      </p>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                        color={statusColorMap[designation.status] as any}
                          variant="flat"
                        >
                          {designation.status}
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
                            onPress={() => handleRowAction("view", designation.id)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleRowAction("edit", designation.id)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash" />}
                            onPress={() => handleRowAction("delete", designation.id)}
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
            
            {filteredDesignations.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredDesignations.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
            </CardBody>
          </Card>
          
        {/* View Designation Modal */}
        <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:eye" className="text-purple-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Designation Details</h3>
                      <p className="text-sm text-gray-500">Complete designation information</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedDesignation && (
                    <div className="space-y-6">
                      {/* Designation Header */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedDesignation.title}</h4>
                        <p className="text-gray-600">{selectedDesignation.department}</p>
                        <div className="flex gap-2 mt-2">
                          <Chip
                            size="sm"
                            color={levels.find(l => l.key === selectedDesignation.level)?.color as any || "default"}
                            variant="flat"
                          >
                            {levels.find(l => l.key === selectedDesignation.level)?.label}
                          </Chip>
                          <Chip
                            size="sm"
                            color={statusColorMap[selectedDesignation.status] as any}
                            variant="flat"
                          >
                            {selectedDesignation.status}
                          </Chip>
                        </div>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Description</span>
                            <p className="font-medium">{selectedDesignation.description}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Total Employees</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-purple-600">{selectedDesignation.employees}</span>
                              </div>
                              <span className="text-sm text-gray-600">employees</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Experience Required</span>
                            <p className="font-medium">{selectedDesignation.experience}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Education Required</span>
                            <p className="font-medium">{selectedDesignation.education}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 text-sm">Salary Range</span>
                            <p className="font-medium">
                              ${selectedDesignation.salaryRange.min.toLocaleString()} - ${selectedDesignation.salaryRange.max.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Skills Required</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedDesignation.skills.map((skill, index) => (
                                <Chip key={index} size="sm" variant="flat" color="primary">
                                  {skill}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Requirements and Responsibilities */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <span className="text-gray-500 text-sm">Requirements</span>
                          <ul className="mt-1 space-y-1">
                            {selectedDesignation.requirements.map((req, index) => (
                              <li key={index} className="text-sm text-gray-700">• {req}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Responsibilities</span>
                          <ul className="mt-1 space-y-1">
                            {selectedDesignation.responsibilities.map((resp, index) => (
                              <li key={index} className="text-sm text-gray-700">• {resp}</li>
                            ))}
                          </ul>
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

        {/* Edit Designation Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:edit" className="text-purple-600 text-xl" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {editingDesignation?.id && designationList.find(d => d.id === editingDesignation.id) ? 'Edit Designation' : 'Add Designation'}
                      </h3>
                      <p className="text-sm text-gray-500">Update designation information</p>
                    </div>
                  </div>
                  </ModalHeader>
                  <ModalBody>
                  {editingDesignation && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                      <Input
                          label="Job Title"
                          placeholder="Enter job title"
                          value={editingDesignation.title}
                          onChange={(e) => setEditingDesignation({...editingDesignation, title: e.target.value})}
                        isRequired
                      />
                      <Select
                        label="Department"
                        placeholder="Select department"
                          selectedKeys={[editingDesignation.department]}
                          onSelectionChange={(keys) => setEditingDesignation({...editingDesignation, department: Array.from(keys)[0] as string})}
                        isRequired
                          items={departments.map(dept => ({ key: dept, label: dept }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                          </SelectItem>
                          )}
                      </Select>
                      </div>

                      <Textarea
                        label="Description"
                        placeholder="Enter job description"
                        value={editingDesignation.description}
                        onChange={(e) => setEditingDesignation({...editingDesignation, description: e.target.value})}
                        isRequired
                        minRows={3}
                      />

                      {/* Additional Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="Level"
                          selectedKeys={[editingDesignation.level]}
                          onSelectionChange={(keys) => setEditingDesignation({...editingDesignation, level: Array.from(keys)[0] as Designation['level']})}
                          items={levels.map(level => ({ key: level.key, label: level.label }))}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Select
                          label="Status"
                          selectedKeys={[editingDesignation.status]}
                          onSelectionChange={(keys) => setEditingDesignation({...editingDesignation, status: Array.from(keys)[0] as Designation['status']})}
                          items={[
                            { key: "active", label: "Active" },
                            { key: "inactive", label: "Inactive" }
                          ]}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                        <Input
                          label="Min Salary"
                          type="number"
                          placeholder="Enter minimum salary"
                          value={editingDesignation.salaryRange.min.toString()}
                          onChange={(e) => setEditingDesignation({
                            ...editingDesignation, 
                            salaryRange: {...editingDesignation.salaryRange, min: parseFloat(e.target.value) || 0}
                          })}
                        />
                        <Input
                          label="Max Salary"
                          type="number"
                          placeholder="Enter maximum salary"
                          value={editingDesignation.salaryRange.max.toString()}
                          onChange={(e) => setEditingDesignation({
                            ...editingDesignation, 
                            salaryRange: {...editingDesignation.salaryRange, max: parseFloat(e.target.value) || 0}
                          })}
                        />
                        <Input
                          label="Experience Required"
                          placeholder="e.g., 3+ years"
                          value={editingDesignation.experience}
                          onChange={(e) => setEditingDesignation({...editingDesignation, experience: e.target.value})}
                        />
                        <Input
                          label="Education Required"
                          placeholder="e.g., Bachelor's degree"
                          value={editingDesignation.education}
                          onChange={(e) => setEditingDesignation({...editingDesignation, education: e.target.value})}
                        />
                      </div>

                      {/* Skills, Requirements, and Responsibilities */}
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label="Skills (comma separated)"
                          placeholder="e.g., JavaScript, React, Node.js"
                          value={editingDesignation.skills.join(', ')}
                          onChange={(e) => setEditingDesignation({...editingDesignation, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        />
                        <Input
                          label="Requirements (comma separated)"
                          placeholder="e.g., Degree, Certification"
                          value={editingDesignation.requirements.join(', ')}
                          onChange={(e) => setEditingDesignation({...editingDesignation, requirements: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        />
                        <Input
                          label="Responsibilities (comma separated)"
                          placeholder="e.g., Code development, Testing"
                          value={editingDesignation.responsibilities.join(', ')}
                          onChange={(e) => setEditingDesignation({...editingDesignation, responsibilities: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        />
                      </div>
                    </div>
                  )}
                  </ModalBody>
                  <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancel
                    </Button>
                  <Button color="primary" onPress={handleSaveDesignation}>
                    {editingDesignation?.id && designationList.find(d => d.id === editingDesignation.id) ? 'Update Designation' : 'Add Designation'}
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