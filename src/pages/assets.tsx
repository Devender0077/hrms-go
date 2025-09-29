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
import { useAssets, Asset } from "../hooks/useAssets";
import { getDefaultAvatar } from "../utils/avatarUtils";

const categories = ["Computer", "Phone", "Tablet", "Monitor", "Printer", "Furniture", "Vehicle", "Other"];
const statusOptions = ["available", "assigned", "maintenance", "retired"];

const statusColorMap = {
  available: "success",
  assigned: "primary",
  maintenance: "warning",
  retired: "danger",
};

export default function AssetsPage() {
  const { assets, loading, error, createAsset, updateAsset, deleteAsset } = useAssets();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    serial_number: "",
    purchase_date: "",
    purchase_price: "",
    assigned_to: "",
    location: "",
    status: "available" as const
  });
  
  const rowsPerPage = 10;
  
  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      return asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             asset.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             asset.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             asset.location?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [assets, searchQuery]);
  
  // Calculate pagination
  const pages = Math.ceil(filteredAssets.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    
    return filteredAssets.slice(start, end);
  }, [page, filteredAssets]);
  
  const handleOpenModal = (asset: Asset | null = null, editing = false) => {
    setSelectedAsset(asset);
    setIsEditing(editing);
    
    if (asset && editing) {
      setFormData({
        name: asset.name || "",
        category: asset.category || "",
        description: asset.description || "",
        serial_number: asset.serial_number || "",
        purchase_date: asset.purchase_date || "",
        purchase_price: asset.purchase_price?.toString() || "",
        assigned_to: asset.assigned_to?.toString() || "",
        location: asset.location || "",
        status: asset.status || "available"
      });
    } else {
      setFormData({
        name: "",
        category: "",
        description: "",
        serial_number: "",
        purchase_date: "",
        purchase_price: "",
        assigned_to: "",
        location: "",
        status: "available"
      });
    }
    
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const assetData = {
        ...formData,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : undefined
      };

      if (isEditing && selectedAsset) {
        await updateAsset(selectedAsset.id, assetData);
        addToast({
          title: "Success",
          description: "Asset updated successfully",
          type: "success"
        });
      } else {
        await createAsset(assetData);
        addToast({
          title: "Success",
          description: "Asset created successfully",
          type: "success"
        });
      }
      
      onClose();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save asset",
        type: "error"
      });
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      try {
        await deleteAsset(asset.id);
        addToast({
          title: "Success",
          description: "Asset deleted successfully",
          type: "success"
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to delete asset",
          type: "error"
        });
      }
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Not specified";
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString();
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
          <h3 className="text-lg font-semibold text-danger mb-2">Error Loading Assets</h3>
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
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
          <p className="text-default-600">Manage company assets and equipment</p>
        </div>
        <Button
          color="primary"
          onPress={() => handleOpenModal(null, false)}
          startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
        >
          Add Asset
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Chip color="primary" variant="flat">
                Total: {assets.length}
              </Chip>
              <Chip color="success" variant="flat">
                Available: {assets.filter(a => a.status === 'available').length}
              </Chip>
              <Chip color="primary" variant="flat">
                Assigned: {assets.filter(a => a.status === 'assigned').length}
              </Chip>
              <Chip color="warning" variant="flat">
                Maintenance: {assets.filter(a => a.status === 'maintenance').length}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Assets</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Assets table">
            <TableHeader>
              <TableColumn>ASSET</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>SERIAL NUMBER</TableColumn>
              <TableColumn>PURCHASE DATE</TableColumn>
              <TableColumn>PURCHASE PRICE</TableColumn>
              <TableColumn>ASSIGNED TO</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No assets found">
              {items.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{asset.name}</p>
                      <p className="text-sm text-default-500">{asset.location || 'No location'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="default">
                      {asset.category || 'Uncategorized'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-mono">{asset.serial_number || 'N/A'}</p>
                  </TableCell>
                  <TableCell>{formatDate(asset.purchase_date)}</TableCell>
                  <TableCell>{formatPrice(asset.purchase_price)}</TableCell>
                  <TableCell>
                    {asset.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={getDefaultAvatar('male', asset.assigned_to)}
                          alt={`${asset.first_name} ${asset.last_name}`}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium">{asset.first_name} {asset.last_name}</p>
                          <p className="text-xs text-default-500">{asset.employee_id}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-default-500">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={statusColorMap[asset.status as keyof typeof statusColorMap]}
                      variant="flat"
                    >
                      {asset.status.toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" aria-label="Asset actions">
                          <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
                          onPress={() => handleOpenModal(asset, true)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Icon icon="lucide:trash" className="w-4 h-4" />}
                          onPress={() => handleDelete(asset)}
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

      {/* Asset Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isEditing ? 'Edit Asset' : 'Add New Asset'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Asset Name"
                    placeholder="Enter asset name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    isRequired
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Category"
                      placeholder="Select category"
                      selectedKeys={formData.category ? [formData.category] : []}
                      onSelectionChange={(keys) => setFormData({...formData, category: Array.from(keys)[0] as string})}
                    >
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                    label="Serial Number"
                    placeholder="Enter serial number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Purchase Date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    />
                    <Input
                      label="Purchase Price"
                      type="number"
                      placeholder="0.00"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Assigned To (Employee ID)"
                      type="number"
                      placeholder="Employee ID"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    />
                    <Input
                      label="Location"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  
                  <Textarea
                    label="Description"
                    placeholder="Enter asset description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {isEditing ? 'Update' : 'Create'} Asset
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
