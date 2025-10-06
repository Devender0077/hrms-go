import React, { useState, useEffect } from "react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  useDisclosure,
  Spinner,
  Pagination,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import PageLayout, { PageHeader } from "../../components/layout/PageLayout";
import { apiRequest } from "../../services/api-service";

interface Holiday {
  id: number;
  name: string;
  date: string;
  type: string;
  description: string;
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Holidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const rowsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "national",
    description: "",
    is_recurring: false,
    is_active: true,
  });

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/leave/holidays");
      if (response.success) {
        setHolidays(response.data || []);
      }
    } catch (error) {
      console.error("Error loading holidays:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedHoliday(null);
    setIsEditMode(false);
    setFormData({
      name: "",
      date: "",
      type: "national",
      description: "",
      is_recurring: false,
      is_active: true,
    });
    onOpen();
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsEditMode(true);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      description: holiday.description,
      is_recurring: holiday.is_recurring,
      is_active: holiday.is_active,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = isEditMode 
        ? `/api/v1/leave/holidays/${selectedHoliday?.id}`
        : "/leave/holidays";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await apiRequest(url, { method, body: JSON.stringify(formData) });
      if (response.success) {
        await loadHolidays();
        onClose();
      }
    } catch (error) {
      console.error("Error saving holiday:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        const response = await apiRequest("DELETE", `/api/v1/leave/holidays/${id}`);
        if (response.success) {
          await loadHolidays();
        }
      } catch (error) {
        console.error("Error deleting holiday:", error);
      }
    }
  };

  // Filter holidays based on search query and type
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         holiday.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || holiday.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Paginate filtered results
  const paginatedHolidays = filteredHolidays.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const pages = Math.ceil(filteredHolidays.length / rowsPerPage);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "national": return "primary";
      case "religious": return "secondary";
      case "regional": return "success";
      case "company": return "warning";
      default: return "default";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "danger";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const holidayTypes = [
    { key: "national", label: "National Holiday" },
    { key: "religious", label: "Religious Holiday" },
    { key: "regional", label: "Regional Holiday" },
    { key: "company", label: "Company Holiday" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Holidays"
        description="Manage company holidays and observances"
        icon="lucide:calendar-days"
        iconColor="from-primary-500 to-secondary-500"
        actions={
          <>
            <Input
              placeholder="Search holidays..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              className="w-64"
            />
            <Select
              placeholder="Filter by type"
              selectedKeys={[typeFilter]}
              onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string)}
              className="w-40"
            >
              <SelectItem key="all">All Types</SelectItem>
              {holidayTypes.map((type) => (
                <SelectItem key={type.key} >
                  {type.label}
                </SelectItem>
              )) as any}
            </Select>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={handleAddNew}
            >
              Add Holiday
            </Button>
          </>
        }
      />

      {/* Holidays Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Holidays ({filteredHolidays.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Holidays table">
            <TableHeader>
              <TableColumn>HOLIDAY NAME</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>RECURRING</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedHolidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{holiday.name}</p>
                      <p className="text-sm text-default-500">{holiday.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatDate(holiday.date)}</span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getTypeColor(holiday.type)} 
                      variant="flat" 
                      size="sm"
                    >
                      {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={holiday.is_recurring ? "success" : "default"} 
                      variant="flat" 
                      size="sm"
                    >
                      {holiday.is_recurring ? "Yes" : "No"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(holiday.is_active)} 
                      variant="flat" 
                      size="sm"
                    >
                      {getStatusText(holiday.is_active)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(holiday)}
                      >
                        <Icon icon="lucide:edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(holiday.id)}
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={pages}
            page={page}
            onChange={setPage}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditMode ? "Edit Holiday" : "Add New Holiday"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Holiday Name"
                    placeholder="Enter holiday name"
                    
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  
                  <Input
                    label="Date"
                    type="date"
                    
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    isRequired
                  />
                  
                  <Select
                    label="Type"
                    placeholder="Select holiday type"
                    selectedKeys={[formData.type]}
                    onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] as string })}
                    isRequired
                  >
                    {holidayTypes.map((type) => (
                      <SelectItem key={type.key} >
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <Textarea
                    label="Description"
                    placeholder="Enter holiday description"
                    
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_recurring}
                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                        className="rounded"
                      />
                      <label className="text-sm">Recurring Holiday</label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <label className="text-sm">Active</label>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSave}
                  isLoading={saving}
                >
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
        </Modal>
    </PageLayout>
  );
}