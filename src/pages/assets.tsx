import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import Papa from "papaparse";

// Asset interface
interface Asset {
  id: number;
  assetId: string;
  name: string;
  category: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: "available" | "assigned" | "maintenance" | "retired" | "lost";
  assignedTo?: string;
  assignedToId?: string;
  assignedDate?: string;
  location: string;
  department: string;
  warrantyExpiry?: string;
  maintenanceSchedule?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  condition: "excellent" | "good" | "fair" | "poor";
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample assets data
const initialAssets: Asset[] = [
  {
    id: 1,
    assetId: "AST-001",
    name: "MacBook Pro 16-inch",
    category: "Computer",
    type: "Laptop",
    brand: "Apple",
    model: "MacBook Pro 16-inch M2",
    serialNumber: "FVF123456789",
    purchaseDate: "2024-01-15",
    purchasePrice: 2499,
    currentValue: 2000,
    status: "assigned",
    assignedTo: "John Smith",
    assignedToId: "EMP001",
    assignedDate: "2024-01-20",
    location: "Office - Floor 2",
    department: "IT",
    warrantyExpiry: "2027-01-15",
    maintenanceSchedule: "Quarterly",
    lastMaintenance: "2024-10-15",
    nextMaintenance: "2025-01-15",
    condition: "excellent",
    description: "High-performance laptop for software development",
    notes: "Regularly updated and maintained",
    createdAt: "2024-01-15",
    updatedAt: "2024-12-01"
  },
  {
    id: 2,
    assetId: "AST-002",
    name: "Dell Monitor 27-inch",
    category: "Computer",
    type: "Monitor",
    brand: "Dell",
    model: "UltraSharp 27 4K",
    serialNumber: "DL789012345",
    purchaseDate: "2024-02-10",
    purchasePrice: 599,
    currentValue: 450,
    status: "available",
    location: "Office - Floor 1",
    department: "IT",
    warrantyExpiry: "2026-02-10",
    maintenanceSchedule: "Annually",
    condition: "good",
    description: "4K monitor for design work",
    createdAt: "2024-02-10",
    updatedAt: "2024-02-10"
  },
  {
    id: 3,
    assetId: "AST-003",
    name: "Office Chair",
    category: "Furniture",
    type: "Chair",
    brand: "Herman Miller",
    model: "Aeron",
    serialNumber: "HM345678901",
    purchaseDate: "2024-03-05",
    purchasePrice: 1200,
    currentValue: 1000,
    status: "assigned",
    assignedTo: "Sarah Johnson",
    assignedToId: "EMP002",
    assignedDate: "2024-03-10",
    location: "Office - Floor 2",
    department: "HR",
    warrantyExpiry: "2029-03-05",
    maintenanceSchedule: "As needed",
    condition: "excellent",
    description: "Ergonomic office chair",
    createdAt: "2024-03-05",
    updatedAt: "2024-03-10"
  }
];

const statusColorMap = {
  available: "success",
  assigned: "primary",
  maintenance: "warning",
  retired: "default",
  lost: "danger",
};

const conditionColorMap = {
  excellent: "success",
  good: "primary",
  fair: "warning",
  poor: "danger",
};

const categories = [
  "Computer",
  "Furniture",
  "Vehicle",
  "Equipment",
  "Software",
  "Mobile Device",
  "Network Equipment",
  "Office Supplies"
];

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

export default function Assets() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const rowsPerPage = 10;
  
  // New asset form state
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    assetId: "",
    name: "",
    category: "",
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: 0,
    currentValue: 0,
    status: "available",
    location: "",
    department: "",
    condition: "good",
    description: ""
  });
  
  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory;
      const matchesDepartment = selectedDepartment === "all" || asset.department === selectedDepartment;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesDepartment;
    });
  }, [assets, searchQuery, selectedStatus, selectedCategory, selectedDepartment]);
  
  // Paginate filtered assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAssets.slice(startIndex, endIndex);
  }, [filteredAssets, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAssets = assets.length;
    const availableAssets = assets.filter(a => a.status === "available").length;
    const assignedAssets = assets.filter(a => a.status === "assigned").length;
    const maintenanceAssets = assets.filter(a => a.status === "maintenance").length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    
    return [
      {
        label: "Total Assets",
        value: totalAssets,
        icon: "lucide:package",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        label: "Available",
        value: availableAssets,
        icon: "lucide:check-circle",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "Assigned",
        value: assignedAssets,
        icon: "lucide:user-check",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      },
      {
        label: "Maintenance",
        value: maintenanceAssets,
        icon: "lucide:wrench",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        label: "Total Value",
        value: `$${totalValue.toLocaleString()}`,
        icon: "lucide:dollar-sign",
        color: "text-emerald-600",
        bgColor: "bg-emerald-100"
      }
    ];
  }, [assets]);

  // Handle add asset
  const handleAddAsset = async () => {
    if (!newAsset.name || !newAsset.category || !newAsset.brand || !newAsset.model) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Category, Brand, Model).",
        color: "warning",
      });
      return;
    }

    const asset: Asset = {
      id: Date.now(),
      assetId: newAsset.assetId || `AST-${String(Date.now()).slice(-3)}`,
      name: newAsset.name!,
      category: newAsset.category!,
      type: newAsset.type || "",
      brand: newAsset.brand!,
      model: newAsset.model!,
      serialNumber: newAsset.serialNumber || "",
      purchaseDate: newAsset.purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: newAsset.purchasePrice || 0,
      currentValue: newAsset.currentValue || newAsset.purchasePrice || 0,
      status: newAsset.status as Asset["status"] || "available",
      location: newAsset.location || "",
      department: newAsset.department || "",
      condition: newAsset.condition as Asset["condition"] || "good",
      description: newAsset.description || "",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAssets(prev => [...prev, asset]);
    setNewAsset({
      assetId: "",
      name: "",
      category: "",
      type: "",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      purchasePrice: 0,
      currentValue: 0,
      status: "available",
      location: "",
      department: "",
      condition: "good",
      description: ""
    });
    setIsAddModalOpen(false);
    
    addToast({
      title: "Asset Added",
      description: `Asset "${asset.name}" has been added successfully.`,
      color: "success",
    });
  };

  // Handle edit asset
  const handleEditAsset = async () => {
    if (!selectedAsset || !newAsset.name || !newAsset.category || !newAsset.brand || !newAsset.model) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        color: "warning",
      });
      return;
    }

    const updatedAsset: Asset = {
      ...selectedAsset,
      name: newAsset.name!,
      category: newAsset.category!,
      type: newAsset.type || selectedAsset.type,
      brand: newAsset.brand!,
      model: newAsset.model!,
      serialNumber: newAsset.serialNumber || selectedAsset.serialNumber,
      purchaseDate: newAsset.purchaseDate || selectedAsset.purchaseDate,
      purchasePrice: newAsset.purchasePrice || selectedAsset.purchasePrice,
      currentValue: newAsset.currentValue || selectedAsset.currentValue,
      status: newAsset.status as Asset["status"] || selectedAsset.status,
      location: newAsset.location || selectedAsset.location,
      department: newAsset.department || selectedAsset.department,
      condition: newAsset.condition as Asset["condition"] || selectedAsset.condition,
      description: newAsset.description || selectedAsset.description,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAssets(prev => prev.map(a => a.id === selectedAsset.id ? updatedAsset : a));
    setIsEditModalOpen(false);
    setSelectedAsset(null);
    
    addToast({
      title: "Asset Updated",
      description: `Asset "${updatedAsset.name}" has been updated successfully.`,
      color: "success",
    });
  };

  // Handle assign asset
  const handleAssignAsset = async (asset: Asset, employeeName: string) => {
    const updatedAsset: Asset = {
      ...asset,
      status: "assigned",
      assignedTo: employeeName,
      assignedToId: `EMP${Date.now()}`,
      assignedDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
    setIsAssignModalOpen(false);
    
    addToast({
      title: "Asset Assigned",
      description: `Asset "${asset.name}" has been assigned to ${employeeName}.`,
      color: "success",
    });
  };

  // Handle unassign asset
  const handleUnassignAsset = async (asset: Asset) => {
    const updatedAsset: Asset = {
      ...asset,
      status: "available",
      assignedTo: undefined,
      assignedToId: undefined,
      assignedDate: undefined,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
    
    addToast({
      title: "Asset Unassigned",
      description: `Asset "${asset.name}" has been unassigned.`,
      color: "success",
    });
  };

  // Handle delete asset
  const handleDeleteAsset = async (asset: Asset) => {
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    
    addToast({
      title: "Asset Deleted",
      description: `Asset "${asset.name}" has been removed.`,
      color: "success",
    });
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      const csvData = filteredAssets.map(asset => ({
        "Asset ID": asset.assetId,
        "Name": asset.name,
        "Category": asset.category,
        "Type": asset.type,
        "Brand": asset.brand,
        "Model": asset.model,
        "Serial Number": asset.serialNumber,
        "Status": asset.status,
        "Assigned To": asset.assignedTo || "Unassigned",
        "Location": asset.location,
        "Department": asset.department,
        "Condition": asset.condition,
        "Purchase Date": asset.purchaseDate,
        "Purchase Price": asset.purchasePrice,
        "Current Value": asset.currentValue,
        "Warranty Expiry": asset.warrantyExpiry || "N/A"
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `assets_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast({
        title: "Export Successful",
        description: "Assets have been exported successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export assets. Please try again.",
        color: "danger",
      });
    }
  };

  // Open edit modal
  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setNewAsset({
      assetId: asset.assetId,
      name: asset.name,
      category: asset.category,
      type: asset.type,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate,
      purchasePrice: asset.purchasePrice,
      currentValue: asset.currentValue,
      status: asset.status,
      location: asset.location,
      department: asset.department,
      condition: asset.condition,
      description: asset.description
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <Icon icon="lucide:package" className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
              <p className="text-gray-600 mt-1">Manage company assets and equipment</p>
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
              Add Asset
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search assets..."
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
                <SelectItem key="available">Available</SelectItem>
                <SelectItem key="assigned">Assigned</SelectItem>
                <SelectItem key="maintenance">Maintenance</SelectItem>
                <SelectItem key="retired">Retired</SelectItem>
                <SelectItem key="lost">Lost</SelectItem>
              </Select>
              <Select
                label="Category"
                placeholder="All Categories"
                selectedKeys={[selectedCategory]}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category}>{category}</SelectItem>
                ))}
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
                ))}
              </Select>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredAssets.length} of {assets.length} assets
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-emerald-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assets List</h3>
                <p className="text-gray-500 text-sm">Track and manage company assets</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Assets table">
              <TableHeader>
                <TableColumn>ASSET</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ASSIGNED TO</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>CONDITION</TableColumn>
                <TableColumn>VALUE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-500">{asset.assetId}</p>
                        <p className="text-xs text-gray-400">{asset.brand} {asset.model}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{asset.category}</p>
                        <p className="text-sm text-gray-500">{asset.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[asset.status] as any}
                        variant="flat"
                      >
                        {asset.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {asset.assignedTo ? (
                        <div>
                          <p className="font-medium text-gray-900">{asset.assignedTo}</p>
                          <p className="text-sm text-gray-500">{asset.department}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{asset.location}</p>
                        <p className="text-xs text-gray-500">{asset.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={conditionColorMap[asset.condition] as any}
                        variant="flat"
                      >
                        {asset.condition}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">${asset.currentValue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Purchased: ${asset.purchasePrice.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedAsset(asset);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => openEditModal(asset)}
                        >
                          <Icon icon="lucide:edit" className="w-4 h-4" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="flat">
                              <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            {asset.status === "available" ? (
                              <DropdownItem key="assign" onPress={() => {
                                setSelectedAsset(asset);
                                setIsAssignModalOpen(true);
                              }}>
                                Assign Asset
                              </DropdownItem>
                            ) : (
                              <DropdownItem key="unassign" onPress={() => handleUnassignAsset(asset)}>
                                Unassign Asset
                              </DropdownItem>
                            )}
                            <DropdownItem key="maintenance" onPress={() => {
                              const updatedAsset = { ...asset, status: "maintenance" as Asset["status"] };
                              setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
                              addToast({
                                title: "Asset Status Updated",
                                description: `Asset "${asset.name}" is now under maintenance.`,
                                color: "success",
                              });
                            }}>
                              Mark for Maintenance
                            </DropdownItem>
                            <DropdownItem key="delete" className="text-danger" onPress={() => handleDeleteAsset(asset)}>
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
            
            {filteredAssets.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredAssets.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add Asset Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Add New Asset</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Asset Name *"
                  placeholder="e.g., MacBook Pro 16-inch"
                  value={newAsset.name || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Asset ID"
                  placeholder="e.g., AST-001"
                  value={newAsset.assetId || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, assetId: e.target.value }))}
                />
                <Select
                  label="Category *"
                  placeholder="Select category"
                  selectedKeys={newAsset.category ? [newAsset.category] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, category: Array.from(keys)[0] as string }))}
                >
                  {categories.map(category => (
                    <SelectItem key={category}>{category}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Type"
                  placeholder="e.g., Laptop, Monitor, Chair"
                  value={newAsset.type || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, type: e.target.value }))}
                />
                <Input
                  label="Brand *"
                  placeholder="e.g., Apple, Dell, Herman Miller"
                  value={newAsset.brand || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, brand: e.target.value }))}
                />
                <Input
                  label="Model *"
                  placeholder="e.g., MacBook Pro 16-inch M2"
                  value={newAsset.model || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                />
                <Input
                  label="Serial Number"
                  placeholder="e.g., FVF123456789"
                  value={newAsset.serialNumber || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
                <Input
                  label="Purchase Date"
                  type="date"
                  value={newAsset.purchaseDate || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, purchaseDate: e.target.value }))}
                />
                <Input
                  label="Purchase Price"
                  type="number"
                  placeholder="0"
                  value={newAsset.purchasePrice || 0}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  label="Current Value"
                  type="number"
                  placeholder="0"
                  value={newAsset.currentValue || 0}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                />
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={newAsset.status ? [newAsset.status] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, status: Array.from(keys)[0] as Asset["status"] }))}
                >
                  <SelectItem key="available">Available</SelectItem>
                  <SelectItem key="assigned">Assigned</SelectItem>
                  <SelectItem key="maintenance">Maintenance</SelectItem>
                  <SelectItem key="retired">Retired</SelectItem>
                  <SelectItem key="lost">Lost</SelectItem>
                </Select>
                <Select
                  label="Condition"
                  placeholder="Select condition"
                  selectedKeys={newAsset.condition ? [newAsset.condition] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, condition: Array.from(keys)[0] as Asset["condition"] }))}
                >
                  <SelectItem key="excellent">Excellent</SelectItem>
                  <SelectItem key="good">Good</SelectItem>
                  <SelectItem key="fair">Fair</SelectItem>
                  <SelectItem key="poor">Poor</SelectItem>
                </Select>
                <Input
                  label="Location"
                  placeholder="e.g., Office - Floor 2"
                  value={newAsset.location || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                />
                <Select
                  label="Department"
                  placeholder="Select department"
                  selectedKeys={newAsset.department ? [newAsset.department] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, department: Array.from(keys)[0] as string }))}
                >
                  {departments.map(dept => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>
              </div>
              <Textarea
                label="Description"
                placeholder="Enter asset description"
                value={newAsset.description || ""}
                onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleAddAsset}>
                Add Asset
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Asset Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Edit Asset</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Asset Name *"
                  placeholder="e.g., MacBook Pro 16-inch"
                  value={newAsset.name || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Asset ID"
                  placeholder="e.g., AST-001"
                  value={newAsset.assetId || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, assetId: e.target.value }))}
                />
                <Select
                  label="Category *"
                  placeholder="Select category"
                  selectedKeys={newAsset.category ? [newAsset.category] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, category: Array.from(keys)[0] as string }))}
                >
                  {categories.map(category => (
                    <SelectItem key={category}>{category}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Type"
                  placeholder="e.g., Laptop, Monitor, Chair"
                  value={newAsset.type || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, type: e.target.value }))}
                />
                <Input
                  label="Brand *"
                  placeholder="e.g., Apple, Dell, Herman Miller"
                  value={newAsset.brand || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, brand: e.target.value }))}
                />
                <Input
                  label="Model *"
                  placeholder="e.g., MacBook Pro 16-inch M2"
                  value={newAsset.model || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                />
                <Input
                  label="Serial Number"
                  placeholder="e.g., FVF123456789"
                  value={newAsset.serialNumber || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
                <Input
                  label="Purchase Date"
                  type="date"
                  value={newAsset.purchaseDate || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, purchaseDate: e.target.value }))}
                />
                <Input
                  label="Purchase Price"
                  type="number"
                  placeholder="0"
                  value={newAsset.purchasePrice || 0}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                  label="Current Value"
                  type="number"
                  placeholder="0"
                  value={newAsset.currentValue || 0}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                />
                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={newAsset.status ? [newAsset.status] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, status: Array.from(keys)[0] as Asset["status"] }))}
                >
                  <SelectItem key="available">Available</SelectItem>
                  <SelectItem key="assigned">Assigned</SelectItem>
                  <SelectItem key="maintenance">Maintenance</SelectItem>
                  <SelectItem key="retired">Retired</SelectItem>
                  <SelectItem key="lost">Lost</SelectItem>
                </Select>
                <Select
                  label="Condition"
                  placeholder="Select condition"
                  selectedKeys={newAsset.condition ? [newAsset.condition] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, condition: Array.from(keys)[0] as Asset["condition"] }))}
                >
                  <SelectItem key="excellent">Excellent</SelectItem>
                  <SelectItem key="good">Good</SelectItem>
                  <SelectItem key="fair">Fair</SelectItem>
                  <SelectItem key="poor">Poor</SelectItem>
                </Select>
                <Input
                  label="Location"
                  placeholder="e.g., Office - Floor 2"
                  value={newAsset.location || ""}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                />
                <Select
                  label="Department"
                  placeholder="Select department"
                  selectedKeys={newAsset.department ? [newAsset.department] : []}
                  onSelectionChange={(keys) => setNewAsset(prev => ({ ...prev, department: Array.from(keys)[0] as string }))}
                >
                  {departments.map(dept => (
                    <SelectItem key={dept}>{dept}</SelectItem>
                  ))}
                </Select>
              </div>
              <Textarea
                label="Description"
                placeholder="Enter asset description"
                value={newAsset.description || ""}
                onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleEditAsset}>
                Update Asset
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Assign Asset Modal */}
        <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Assign Asset</ModalHeader>
            <ModalBody>
              {selectedAsset && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Asset Details</h4>
                    <p className="text-gray-600">{selectedAsset.name} ({selectedAsset.assetId})</p>
                    <p className="text-sm text-gray-500">{selectedAsset.brand} {selectedAsset.model}</p>
                  </div>
                  <Select
                    label="Assign to Employee"
                    placeholder="Select employee"
                    onSelectionChange={(keys) => {
                      const employeeName = Array.from(keys)[0] as string;
                      if (employeeName && selectedAsset) {
                        handleAssignAsset(selectedAsset, employeeName);
                      }
                    }}
                  >
                    {employees.map(employee => (
                      <SelectItem key={employee}>{employee}</SelectItem>
                    ))}
                  </Select>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Asset Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="4xl">
          <ModalContent>
            <ModalHeader>Asset Details</ModalHeader>
            <ModalBody>
              {selectedAsset && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                      <Icon icon="lucide:package" className="text-white text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedAsset.name}</h3>
                      <p className="text-gray-600">{selectedAsset.assetId}</p>
                      <p className="text-gray-600">{selectedAsset.brand} {selectedAsset.model}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Asset Information</h4>
                      <div className="space-y-2">
                        <p><strong>Category:</strong> {selectedAsset.category}</p>
                        <p><strong>Type:</strong> {selectedAsset.type}</p>
                        <p><strong>Serial Number:</strong> {selectedAsset.serialNumber}</p>
                        <p><strong>Status:</strong> 
                          <Chip size="sm" color={statusColorMap[selectedAsset.status] as any} variant="flat" className="ml-2">
                            {selectedAsset.status}
                          </Chip>
                        </p>
                        <p><strong>Condition:</strong> 
                          <Chip size="sm" color={conditionColorMap[selectedAsset.condition] as any} variant="flat" className="ml-2">
                            {selectedAsset.condition}
                          </Chip>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Financial Information</h4>
                      <div className="space-y-2">
                        <p><strong>Purchase Date:</strong> {new Date(selectedAsset.purchaseDate).toLocaleDateString()}</p>
                        <p><strong>Purchase Price:</strong> ${selectedAsset.purchasePrice.toLocaleString()}</p>
                        <p><strong>Current Value:</strong> ${selectedAsset.currentValue.toLocaleString()}</p>
                        {selectedAsset.warrantyExpiry && (
                          <p><strong>Warranty Expiry:</strong> {new Date(selectedAsset.warrantyExpiry).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Location & Assignment</h4>
                      <div className="space-y-2">
                        <p><strong>Location:</strong> {selectedAsset.location}</p>
                        <p><strong>Department:</strong> {selectedAsset.department}</p>
                        {selectedAsset.assignedTo && (
                          <>
                            <p><strong>Assigned To:</strong> {selectedAsset.assignedTo}</p>
                            <p><strong>Assigned Date:</strong> {selectedAsset.assignedDate && new Date(selectedAsset.assignedDate).toLocaleDateString()}</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Maintenance</h4>
                      <div className="space-y-2">
                        {selectedAsset.maintenanceSchedule && (
                          <p><strong>Schedule:</strong> {selectedAsset.maintenanceSchedule}</p>
                        )}
                        {selectedAsset.lastMaintenance && (
                          <p><strong>Last Maintenance:</strong> {new Date(selectedAsset.lastMaintenance).toLocaleDateString()}</p>
                        )}
                        {selectedAsset.nextMaintenance && (
                          <p><strong>Next Maintenance:</strong> {new Date(selectedAsset.nextMaintenance).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedAsset.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-gray-700">{selectedAsset.description}</p>
                    </div>
                  )}
                  
                  {selectedAsset.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-gray-700">{selectedAsset.notes}</p>
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