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
  Select,
  SelectItem,
  Chip,
  useDisclosure,
  Spinner,
  Pagination,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import PageLayout, { PageHeader } from "../../components/layout/PageLayout";
import { apiRequest } from "../../services/api-service";

interface LeaveBalance {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type_id: number;
  leave_type_name: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  created_at: string;
  updated_at: string;
}

interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

export default function LeaveBalances() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const rowsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    year: new Date().getFullYear().toString(),
    total_days: 0,
    used_days: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balancesRes, leaveTypesRes, employeesRes] = await Promise.all([
        apiRequest("/leave/balances"),
        apiRequest("/leave/types"),
        apiRequest("/employees")
      ]);

      if (balancesRes.success) {
        setBalances(balancesRes.data || []);
      }
      if (leaveTypesRes.success) {
        setLeaveTypes(leaveTypesRes.data || []);
      }
      if (employeesRes.success) {
        setEmployees(employeesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedBalance(null);
    setIsEditMode(false);
    setFormData({
      employee_id: "",
      leave_type_id: "",
      year: new Date().getFullYear().toString(),
      total_days: 0,
      used_days: 0,
    });
    onOpen();
  };

  const handleEdit = (balance: LeaveBalance) => {
    setSelectedBalance(balance);
    setIsEditMode(true);
    setFormData({
      employee_id: balance.employee_id.toString(),
      leave_type_id: balance.leave_type_id.toString(),
      year: balance.year.toString(),
      total_days: balance.total_days,
      used_days: balance.used_days,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = isEditMode 
        ? `/api/v1/leave/balances/${selectedBalance?.id}`
        : "/leave/balances";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await apiRequest(url, { method, body: JSON.stringify(formData) });
      if (response.success) {
        await loadData();
        onClose();
      }
    } catch (error) {
      console.error("Error saving leave balance:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this leave balance?")) {
      try {
        const response = await apiRequest("DELETE", `/api/v1/leave/balances/${id}`);
        if (response.success) {
          await loadData();
        }
      } catch (error) {
        console.error("Error deleting leave balance:", error);
      }
    }
  };

  // Filter balances based on search query and year
  const filteredBalances = balances.filter(balance => {
    const matchesSearch = balance.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         balance.leave_type_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === "all" || balance.year.toString() === yearFilter;
    return matchesSearch && matchesYear;
  });

  // Paginate filtered results
  const paginatedBalances = filteredBalances.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const pages = Math.ceil(filteredBalances.length / rowsPerPage);

  const getUsageColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return "danger";
    if (percentage >= 70) return "warning";
    return "success";
  };

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i.toString());
    }
    return years;
  };

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
        title="Leave Balances"
        description="Track and manage employee leave balances"
        icon="lucide:scale"
        iconColor="from-primary-500 to-secondary-500"
        actions={
          <>
            <Input
              placeholder="Search balances..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              className="w-64"
            />
            <Select
              placeholder="Filter by year"
              selectedKeys={[yearFilter]}
              onSelectionChange={(keys) => setYearFilter(Array.from(keys)[0] as string)}
              className="w-32"
            >
              <SelectItem key="all">All Years</SelectItem>
              {generateYearOptions().map((year) => (
                <SelectItem key={year} >
                  {year}
                </SelectItem>
              )) as any}
            </Select>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={handleAddNew}
            >
              Add Balance
            </Button>
          </>
        }
      />

      {/* Leave Balances Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Leave Balances ({filteredBalances.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Leave balances table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>LEAVE TYPE</TableColumn>
              <TableColumn>YEAR</TableColumn>
              <TableColumn>TOTAL DAYS</TableColumn>
              <TableColumn>USED DAYS</TableColumn>
              <TableColumn>REMAINING</TableColumn>
              <TableColumn>USAGE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedBalances.map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell>
                    <div className="font-medium">{balance.employee_name}</div>
                  </TableCell>
                  <TableCell>
                    <Chip color="primary" variant="flat" size="sm">
                      {balance.leave_type_name}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{balance.year}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{balance.total_days} days</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{balance.used_days} days</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-success-600">{balance.remaining_days} days</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        
                        color={getUsageColor(balance.used_days, balance.total_days)}
                        className="w-20"
                      />
                      <span className="text-sm text-default-600">
                        {getUsagePercentage(balance.used_days, balance.total_days)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(balance)}
                      >
                        <Icon icon="lucide:edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(balance.id)}
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
                {isEditMode ? "Edit Leave Balance" : "Add New Leave Balance"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Employee"
                    placeholder="Select employee"
                    selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                    onSelectionChange={(keys) => setFormData({ ...formData, employee_id: Array.from(keys)[0] as string })}
                    isRequired
                  >
                    {employees.map((employee) => (
                      <SelectItem key={employee.id.toString()} >
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <Select
                    label="Leave Type"
                    placeholder="Select leave type"
                    selectedKeys={formData.leave_type_id ? [formData.leave_type_id] : []}
                    onSelectionChange={(keys) => setFormData({ ...formData, leave_type_id: Array.from(keys)[0] as string })}
                    isRequired
                  >
                    {leaveTypes.map((leaveType) => (
                      <SelectItem key={leaveType.id.toString()} >
                        {leaveType.name} ({leaveType.days_allowed} days)
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <Input
                    label="Year"
                    type="number"
                    
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    isRequired
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Total Days"
                      type="number"
                      
                      onChange={(e) => setFormData({ ...formData, total_days: parseInt(e.target.value) || 0 })}
                      isRequired
                    />
                    
                    <Input
                      label="Used Days"
                      type="number"
                      
                      onChange={(e) => setFormData({ ...formData, used_days: parseInt(e.target.value) || 0 })}
                      isRequired
                    />
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