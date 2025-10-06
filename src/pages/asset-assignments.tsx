import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import Papa from "papaparse";

// Asset assignment interface
interface AssetAssignment {
  id: number;
  assignmentId: string;
  assetId: string;
  assetName: string;
  assetCategory: string;
  assetType: string;
  assetBrand: string;
  assetModel: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;
  assignedBy: string;
  assignedDate: string;
  returnDate?: string;
  status: "active" | "returned" | "overdue" | "lost";
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  returnNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample asset assignments data
const initialAssignments: AssetAssignment[] = [
  {
    id: 1,
    assignmentId: "ASG-001",
    assetId: "AST-001",
    assetName: "MacBook Pro 16-inch",
    assetCategory: "Computer",
    assetType: "Laptop",
    assetBrand: "Apple",
    assetModel: "MacBook Pro 16-inch M2",
    employeeId: "EMP001",
    employeeName: "John Smith",
    employeeEmail: "john.smith@company.com",
    employeeDepartment: "IT",
    assignedBy: "Sarah Johnson",
    assignedDate: "2024-01-20",
    status: "active",
    condition: "excellent",
    notes: "Assigned for software development work",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20"
  },
  {
    id: 2,
    assignmentId: "ASG-002",
    assetId: "AST-003",
    assetName: "Office Chair",
    assetCategory: "Furniture",
    assetType: "Chair",
    assetBrand: "Herman Miller",
    assetModel: "Aeron",
    employeeId: "EMP002",
    employeeName: "Sarah Johnson",
    employeeEmail: "sarah.johnson@company.com",
    employeeDepartment: "HR",
    assignedBy: "Mike Wilson",
    assignedDate: "2024-03-10",
    status: "active",
    condition: "excellent",
    notes: "Ergonomic chair for office work",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-10"
  },
  {
    id: 3,
    assignmentId: "ASG-003",
    assetId: "AST-004",
    assetName: "Dell Laptop",
    assetCategory: "Computer",
    assetType: "Laptop",
    assetBrand: "Dell",
    assetModel: "XPS 13",
    employeeId: "EMP003",
    employeeName: "Mike Wilson",
    employeeEmail: "mike.wilson@company.com",
    employeeDepartment: "Finance",
    assignedBy: "Lisa Anderson",
    assignedDate: "2024-06-15",
    returnDate: "2024-11-30",
    status: "returned",
    condition: "good",
    notes: "Assigned for financial analysis work",
    returnNotes: "Returned in good condition, minor wear",
    createdAt: "2024-06-15",
    updatedAt: "2024-11-30"
  }
];

const statusColorMap = {
  active: "success",
  returned: "default",
  overdue: "warning",
  lost: "danger",
};

const conditionColorMap = {
  excellent: "success",
  good: "primary",
  fair: "warning",
  poor: "danger",
};

const departments = [
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "Customer Success"
];

const employees = [
  "John Smith",
  "Sarah Johnson",
  "Mike Wilson",
  "Lisa Anderson",
  "David Chen",
  "Emily Davis",
  "Tom Johnson",
  "Amy Rodriguez"
];

const assets = [
  "MacBook Pro 16-inch",
  "Dell Monitor 27-inch",
  "Office Chair",
  "Dell Laptop",
  "iPhone 15 Pro",
  "iPad Pro",
  "Standing Desk",
  "Wireless Mouse"
];

export default function AssetAssignments() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [assignments, setAssignments] = useState<AssetAssignment[]>(initialAssignments);
  const [selectedAssignment, setSelectedAssignment] = useState<AssetAssignment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  
  const rowsPerPage = 10;
  
  // New assignment form state
  const [newAssignment, setNewAssignment] = useState<Partial<AssetAssignment>>({
    assetId: "",
    assetName: "",
    employeeId: "",
    employeeName: "",
    employeeEmail: "",
    employeeDepartment: "",
    assignedBy: "",
    assignedDate: new Date().toISOString().split('T')[0],
    status: "active",
    condition: "excellent",
    notes: ""
  });
  
  // Return form state
  const [returnData, setReturnData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    condition: "excellent" as AssetAssignment["condition"],
    returnNotes: ""
  });
  
  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = 
        assignment.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.assignmentId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || assignment.status === selectedStatus;
      const matchesDepartment = selectedDepartment === "all" || assignment.employeeDepartment === selectedDepartment;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [assignments, searchQuery, selectedStatus, selectedDepartment]);
  
  // Paginate filtered assignments
  const paginatedAssignments = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAssignments.slice(startIndex, endIndex);
  }, [filteredAssignments, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(a => a.status === "active").length;
    const returnedAssignments = assignments.filter(a => a.status === "returned").length;
    const overdueAssignments = assignments.filter(a => a.status === "overdue").length;
    const lostAssignments = assignments.filter(a => a.status === "lost").length;
    
    return [
      {
        label: "Total Assignments",
        value: totalAssignments,
        icon: "lucide:clipboard-list",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Active",
        value: activeAssignments,
        icon: "lucide:check-circle",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Returned",
        value: returnedAssignments,
        icon: "lucide:undo",
        color: "text-default-600",
        bgColor: "bg-content2"
      },
      {
        label: "Overdue",
        value: overdueAssignments,
        icon: "lucide:clock",
        color: "text-warning-600",
        bgColor: "bg-warning-100"
      },
      {
        label: "Lost",
        value: lostAssignments,
        icon: "lucide:alert-triangle",
        color: "text-danger-600",
        bgColor: "bg-danger-100"
      }
    ];
  }, [assignments]);

  // Handle add assignment
  const handleAddAssignment = async () => {
    if (!newAssignment.assetName || !newAssignment.employeeName || !newAssignment.assignedBy) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields (Asset, Employee, Assigned By).",
        color: "warning",
      });
      return;
    }

    const assignment: AssetAssignment = {
      id: Date.now(),
      assignmentId: `ASG-${String(Date.now()).slice(-3)}`,
      assetId: newAssignment.assetId || `AST-${String(Date.now()).slice(-3)}`,
      assetName: newAssignment.assetName!,
      assetCategory: "Computer", // This would come from asset data in real app
      assetType: "Laptop", // This would come from asset data in real app
      assetBrand: "Unknown", // This would come from asset data in real app
      assetModel: "Unknown", // This would come from asset data in real app
      employeeId: newAssignment.employeeId || `EMP${Date.now()}`,
      employeeName: newAssignment.employeeName!,
      employeeEmail: newAssignment.employeeEmail || "",
      employeeDepartment: newAssignment.employeeDepartment || "",
      assignedBy: newAssignment.assignedBy!,
      assignedDate: newAssignment.assignedDate || new Date().toISOString().split('T')[0],
      status: newAssignment.status as AssetAssignment["status"] || "active",
      condition: newAssignment.condition as AssetAssignment["condition"] || "excellent",
      notes: newAssignment.notes || "",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAssignments(prev => [...prev, assignment]);
    setNewAssignment({
      assetId: "",
      assetName: "",
      employeeId: "",
      employeeName: "",
      employeeEmail: "",
      employeeDepartment: "",
      assignedBy: "",
      assignedDate: new Date().toISOString().split('T')[0],
      status: "active",
      condition: "excellent",
      notes: ""
    });
    setIsAddModalOpen(false);
    
    addToast({
      title: "Assignment Created",
      description: `Asset "${assignment.assetName}" has been assigned to ${assignment.employeeName}.`,
      color: "success",
    });
  };

  // Handle return asset
  const handleReturnAsset = async () => {
    if (!selectedAssignment) return;

    const updatedAssignment: AssetAssignment = {
      ...selectedAssignment,
      status: "returned",
      returnDate: returnData.returnDate,
      condition: returnData.condition,
      returnNotes: returnData.returnNotes,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAssignments(prev => prev.map(a => a.id === selectedAssignment.id ? updatedAssignment : a));
    setIsReturnModalOpen(false);
    setSelectedAssignment(null);
    setReturnData({
      returnDate: new Date().toISOString().split('T')[0],
      condition: "excellent",
      returnNotes: ""
    });
    
    addToast({
      title: "Asset Returned",
      description: `Asset "${selectedAssignment.assetName}" has been returned by ${selectedAssignment.employeeName}.`,
      color: "success",
    });
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (assignment: AssetAssignment) => {
    setAssignments(prev => prev.filter(a => a.id !== assignment.id));
    
    addToast({
      title: "Assignment Deleted",
      description: `Assignment for "${assignment.assetName}" has been removed.`,
      color: "success",
    });
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      const csvData = filteredAssignments.map(assignment => ({
        "Assignment ID": assignment.assignmentId,
        "Asset Name": assignment.assetName,
        "Asset Category": assignment.assetCategory,
        "Asset Type": assignment.assetType,
        "Employee Name": assignment.employeeName,
        "Employee Email": assignment.employeeEmail,
        "Department": assignment.employeeDepartment,
        "Assigned By": assignment.assignedBy,
        "Assigned Date": assignment.assignedDate,
        "Return Date": assignment.returnDate || "N/A",
        "Status": assignment.status,
        "Condition": assignment.condition,
        "Notes": assignment.notes || "N/A",
        "Return Notes": assignment.returnNotes || "N/A"
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `asset_assignments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast({
        title: "Export Successful",
        description: "Asset assignments have been exported successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export asset assignments. Please try again.",
        color: "danger",
      });
    }
  };

  // Open return modal
  const openReturnModal = (assignment: AssetAssignment) => {
    setSelectedAssignment(assignment);
    setIsReturnModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl">
              <Icon icon="lucide:user-check" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Asset Assignments</h1>
              <p className="text-default-600 mt-1">Track asset assignments and returns</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExportCSV}
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
              Assign Asset
            </Button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                placeholder="Search assignments..."
                
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
              />
              <Select
                label="Status"
                placeholder="All Statuses"
                selectedKeys={[selectedStatus]}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="returned">Returned</SelectItem>
                <SelectItem key="overdue">Overdue</SelectItem>
                <SelectItem key="lost">Lost</SelectItem>
              </Select>
              <Select
                label="Department"
                placeholder="All Departments"
                selectedKeys={[selectedDepartment]}
                onSelectionChange={(keys) => setSelectedDepartment(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept}>{dept}</SelectItem>
                )) as any}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-default-600">
                  Showing {filteredAssignments.length} of {assignments.length} assignments
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-primary-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Asset Assignments</h3>
                <p className="text-default-500 text-sm">Track asset assignments and returns</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Asset assignments table">
              <TableHeader>
                <TableColumn>ASSET</TableColumn>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>ASSIGNED BY</TableColumn>
                <TableColumn>ASSIGNED DATE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>CONDITION</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{assignment.assetName}</p>
                        <p className="text-sm text-default-500">{assignment.assignmentId}</p>
                        <p className="text-xs text-default-400">{assignment.assetCategory} • {assignment.assetType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={assignment.employeeName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground">{assignment.employeeName}</p>
                          <p className="text-sm text-default-500">{assignment.employeeEmail}</p>
                          <p className="text-xs text-default-400">{assignment.employeeDepartment}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{assignment.assignedBy}</p>
                        <p className="text-sm text-default-500">{new Date(assignment.assignedDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{new Date(assignment.assignedDate).toLocaleDateString()}</p>
                        {assignment.returnDate && (
                          <p className="text-xs text-default-500">Returned: {new Date(assignment.returnDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[assignment.status] as any}
                        variant="flat"
                      >
                        {assignment.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={conditionColorMap[assignment.condition] as any}
                        variant="flat"
                      >
                        {assignment.condition}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedAssignment(assignment);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                        {assignment.status === "active" && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="warning"
                            onPress={() => openReturnModal(assignment)}
                          >
                            <Icon icon="lucide:undo" className="w-4 h-4" />
                          </Button>
                        )}
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="flat">
                              <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem key="edit" onPress={() => {
                              setSelectedAssignment(assignment);
                              setIsEditModalOpen(true);
                            }}>
                              Edit Assignment
                            </DropdownItem>
                            {assignment.status === "active" && (
                              <DropdownItem key="return" onPress={() => openReturnModal(assignment)}>
                                Return Asset
                              </DropdownItem>
                            )}
                            <DropdownItem key="delete" className="text-danger" onPress={() => handleDeleteAssignment(assignment)}>
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
            
            {filteredAssignments.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredAssignments.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add Assignment Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Assign Asset</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Asset *"
                  placeholder="Select asset"
                  selectedKeys={newAssignment.assetName ? [newAssignment.assetName] : []}
                  onSelectionChange={(keys) => setNewAssignment(prev => ({ ...prev, assetName: Array.from(keys)[0] as string }))}
                >
                  {assets.map(asset => (
                    <SelectItem key={asset}>{asset}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Employee *"
                  placeholder="Select employee"
                  selectedKeys={newAssignment.employeeName ? [newAssignment.employeeName] : []}
                  onSelectionChange={(keys) => {
                    const employeeName = Array.from(keys)[0] as string;
                    setNewAssignment(prev => ({ 
                      ...prev, 
                      employeeName,
                      employeeEmail: `${employeeName.toLowerCase().replace(' ', '.')}@company.com`,
                      employeeDepartment: "IT" // This would be dynamic in real app
                    }));
                  }}
                >
                  {employees.map(employee => (
                    <SelectItem key={employee}>{employee}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Assigned By *"
                  placeholder="e.g., Sarah Johnson"
                  
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, assignedBy: e.target.value }))}
                />
                <Input
                  label="Assigned Date"
                  type="date"
                  
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, assignedDate: e.target.value }))}
                />
                <Select
                  label="Condition"
                  placeholder="Select condition"
                  selectedKeys={newAssignment.condition ? [newAssignment.condition] : []}
                  onSelectionChange={(keys) => setNewAssignment(prev => ({ ...prev, condition: Array.from(keys)[0] as AssetAssignment["condition"] }))}
                >
                  <SelectItem key="excellent">Excellent</SelectItem>
                  <SelectItem key="good">Good</SelectItem>
                  <SelectItem key="fair">Fair</SelectItem>
                  <SelectItem key="poor">Poor</SelectItem>
                </Select>
                <Select
                  label="Department"
                  placeholder="Select department"
                  selectedKeys={newAssignment.employeeDepartment ? [newAssignment.employeeDepartment] : []}
                  onSelectionChange={(keys) => setNewAssignment(prev => ({ ...prev, employeeDepartment: Array.from(keys)[0] as string }))}
                >
                  {departments.map(dept => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>
              </div>
              <Textarea
                label="Notes"
                placeholder="Enter assignment notes"
                
                onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleAddAssignment}>
                Assign Asset
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Return Asset Modal */}
        <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Return Asset</ModalHeader>
            <ModalBody>
              {selectedAssignment && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Asset Details</h4>
                    <p className="text-default-600">{selectedAssignment.assetName}</p>
                    <p className="text-sm text-default-500">Assigned to: {selectedAssignment.employeeName}</p>
                  </div>
                  <Input
                    label="Return Date"
                    type="date"
                    
                    onChange={(e) => setReturnData(prev => ({ ...prev, returnDate: e.target.value }))}
                  />
                  <Select
                    label="Condition"
                    placeholder="Select condition"
                    selectedKeys={[returnData.condition]}
                    onSelectionChange={(keys) => setReturnData(prev => ({ ...prev, condition: Array.from(keys)[0] as AssetAssignment["condition"] }))}
                  >
                    <SelectItem key="excellent">Excellent</SelectItem>
                    <SelectItem key="good">Good</SelectItem>
                    <SelectItem key="fair">Fair</SelectItem>
                    <SelectItem key="poor">Poor</SelectItem>
                  </Select>
                  <Textarea
                    label="Return Notes"
                    placeholder="Enter return notes"
                    
                    onChange={(e) => setReturnData(prev => ({ ...prev, returnNotes: e.target.value }))}
                    minRows={3}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsReturnModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleReturnAsset}>
                Return Asset
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Assignment Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="4xl">
          <ModalContent>
            <ModalHeader>Assignment Details</ModalHeader>
            <ModalBody>
              {selectedAssignment && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={selectedAssignment.employeeName}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedAssignment.employeeName}</h3>
                      <p className="text-default-600">{selectedAssignment.employeeEmail}</p>
                      <p className="text-default-600">{selectedAssignment.employeeDepartment}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Asset Information</h4>
                      <div className="space-y-2">
                        <p><strong>Asset:</strong> {selectedAssignment.assetName}</p>
                        <p><strong>Category:</strong> {selectedAssignment.assetCategory}</p>
                        <p><strong>Type:</strong> {selectedAssignment.assetType}</p>
                        <p><strong>Brand:</strong> {selectedAssignment.assetBrand}</p>
                        <p><strong>Model:</strong> {selectedAssignment.assetModel}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Assignment Details</h4>
                      <div className="space-y-2">
                        <p><strong>Assignment ID:</strong> {selectedAssignment.assignmentId}</p>
                        <p><strong>Assigned By:</strong> {selectedAssignment.assignedBy}</p>
                        <p><strong>Assigned Date:</strong> {new Date(selectedAssignment.assignedDate).toLocaleDateString()}</p>
                        {selectedAssignment.returnDate && (
                          <p><strong>Return Date:</strong> {new Date(selectedAssignment.returnDate).toLocaleDateString()}</p>
                        )}
                        <p><strong>Status:</strong> 
                          <Chip size="sm" color={statusColorMap[selectedAssignment.status] as any} variant="flat" className="ml-2">
                            {selectedAssignment.status}
                          </Chip>
                        </p>
                        <p><strong>Condition:</strong> 
                          <Chip size="sm" color={conditionColorMap[selectedAssignment.condition] as any} variant="flat" className="ml-2">
                            {selectedAssignment.condition}
                          </Chip>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedAssignment.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Assignment Notes</h4>
                      <p className="text-default-700">{selectedAssignment.notes}</p>
                    </div>
                  )}
                  
                  {selectedAssignment.returnNotes && (
                    <div>
                      <h4 className="font-semibold mb-2">Return Notes</h4>
                      <p className="text-default-700">{selectedAssignment.returnNotes}</p>
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