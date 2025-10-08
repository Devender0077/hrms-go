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
  country: string;
  description?: string;
  is_recurring: boolean;
  is_active?: boolean;
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
  const [countryFilter, setCountryFilter] = useState("All");
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const rowsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "national",
    country: "Global",
    is_recurring: false,
  });

  useEffect(() => {
    loadHolidays();
  }, [countryFilter]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const url = countryFilter && countryFilter !== "All" 
        ? `/leave/holidays?country=${countryFilter}`
        : "/leave/holidays";
      const response = await apiRequest(url);
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
      country: "Global",
      is_recurring: false,
    });
    onOpen();
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsEditMode(true);
    // Format date for HTML date input (YYYY-MM-DD)
    const formattedDate = new Date(holiday.date).toISOString().split('T')[0];
    setFormData({
      name: holiday.name || "",
      date: formattedDate,
      type: holiday.type || "national",
      country: holiday.country || "Global",
      is_recurring: holiday.is_recurring || false,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = isEditMode 
        ? `/leave/holidays/${selectedHoliday?.id}`
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
        const response = await apiRequest(`/leave/holidays/${id}`, { method: "DELETE" });
        if (response.success) {
          await loadHolidays();
        }
      } catch (error) {
        console.error("Error deleting holiday:", error);
      }
    }
  };

  // Helper function to normalize holiday names for comparison
  const normalizeHolidayName = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[''']/g, '') // Remove apostrophes
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/\./g, '') // Remove periods
      .replace(/\bday\b/g, '') // Remove "day" word
      .replace(/\s+/g, ' ') // Normalize spaces again
      .trim();
  };

  // Group holidays by normalized name and date to merge duplicates across countries
  const groupedHolidays = holidays.reduce((acc: any[], holiday) => {
    // Normalize date format for comparison
    const normalizedDate = holiday.date instanceof Date 
      ? holiday.date.toISOString().split('T')[0]
      : holiday.date.split('T')[0];
    
    // Normalize name for comparison
    const normalizedName = normalizeHolidayName(holiday.name);
    const key = `${normalizedName}_${normalizedDate}`;
    
    const existing = acc.find(h => {
      const hDate = h.date instanceof Date ? h.date.toISOString().split('T')[0] : h.date.split('T')[0];
      const hName = normalizeHolidayName(h.name);
      return `${hName}_${hDate}` === key;
    });
    
    if (existing) {
      // Add country to existing holiday if not already present
      if (!existing.countries.includes(holiday.country)) {
        existing.countries.push(holiday.country);
      }
      // Keep all IDs for reference
      if (!existing.ids) {
        existing.ids = [existing.id];
      }
      existing.ids.push(holiday.id);
    } else {
      // Create new grouped holiday
      acc.push({
        ...holiday,
        date: normalizedDate,
        countries: [holiday.country],
        ids: [holiday.id]
      });
    }
    
    return acc;
  }, []);

  // Filter holidays based on search query and type
  const filteredHolidays = groupedHolidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Calculate statistics by country
  const stats = {
    total: holidays.length,
    india: holidays.filter(h => h.country === 'India').length,
    usa: holidays.filter(h => h.country === 'USA').length,
    global: holidays.filter(h => h.country === 'Global').length,
    national: holidays.filter(h => h.type === 'national').length,
    religious: holidays.filter(h => h.type === 'religious').length,
  };

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
            <Select
              placeholder="Filter by country"
              selectedKeys={[countryFilter]}
              onSelectionChange={(keys) => setCountryFilter(Array.from(keys)[0] as string)}
              className="w-40"
            >
              <SelectItem key="All">All Countries</SelectItem>
              <SelectItem key="India">🇮🇳 India</SelectItem>
              <SelectItem key="USA">🇺🇸 USA</SelectItem>
              <SelectItem key="Global">🌍 Global</SelectItem>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Holidays</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Icon icon="lucide:calendar" className="text-primary-600 dark:text-primary-400 text-2xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">🇮🇳 India Holidays</p>
                <p className="text-2xl font-bold text-foreground">{stats.india}</p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <Icon icon="lucide:flag" className="text-success-600 dark:text-success-400 text-2xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">🇺🇸 USA Holidays</p>
                <p className="text-2xl font-bold text-foreground">{stats.usa}</p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                <Icon icon="lucide:flag" className="text-warning-600 dark:text-warning-400 text-2xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">National Holidays</p>
                <p className="text-2xl font-bold text-foreground">{stats.national}</p>
              </div>
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <Icon icon="lucide:star" className="text-secondary-600 dark:text-secondary-400 text-2xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

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
              <TableColumn>COUNTRY</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>RECURRING</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedHolidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{holiday.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatDate(holiday.date)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {holiday.countries.map((country: string, idx: number) => (
                        <Chip 
                          key={idx}
                          color="secondary" 
                          variant="flat" 
                          size="sm"
                        >
                          {country === 'India' ? '🇮🇳 India' : 
                           country === 'USA' ? '🇺🇸 USA' : 
                           '🌍 ' + country}
                        </Chip>
                      ))}
                    </div>
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  
                  <Input
                    label="Date"
                    type="date"
                    value={formData.date}
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
                  
                  <Select
                    label="Country"
                    placeholder="Select country"
                    selectedKeys={[formData.country]}
                    onSelectionChange={(keys) => setFormData({ ...formData, country: Array.from(keys)[0] as string })}
                    isRequired
                  >
                    <SelectItem key="Global">🌍 Global</SelectItem>
                    <SelectItem key="India">🇮🇳 India</SelectItem>
                    <SelectItem key="USA">🇺🇸 USA</SelectItem>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm">Recurring Holiday</label>
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