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
  Switch,
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

interface LeavePolicy {
  id: number;
  name: string;
  description: string;
  leave_type_id: number;
  leave_type_name: string;
  max_days_per_year: number;
  max_consecutive_days: number;
  advance_notice_days: number;
  carry_forward_days: number;
  requires_approval: boolean;
  requires_documentation: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
}

export default function LeavePolicies() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const rowsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leave_type_id: "",
    max_days_per_year: 0,
    max_consecutive_days: 0,
    advance_notice_days: 0,
    carry_forward_days: 0,
    requires_approval: true,
    requires_documentation: false,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [policiesRes, leaveTypesRes] = await Promise.all([
        apiRequest("/leave/policies"),
        apiRequest("/leave/types")
      ]);

      if (policiesRes.success) {
        setPolicies(policiesRes.data || []);
      }
      if (leaveTypesRes.success) {
        setLeaveTypes(leaveTypesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedPolicy(null);
    setIsEditMode(false);
    setFormData({
      name: "",
      description: "",
      leave_type_id: "",
      max_days_per_year: 0,
      max_consecutive_days: 0,
      advance_notice_days: 0,
      carry_forward_days: 0,
      requires_approval: true,
      requires_documentation: false,
      is_active: true,
    });
    onOpen();
  };

  const handleEdit = (policy: LeavePolicy) => {
    setSelectedPolicy(policy);
    setIsEditMode(true);
    setFormData({
      name: policy.name,
      description: policy.description,
      leave_type_id: policy.leave_type_id.toString(),
      max_days_per_year: policy.max_days_per_year,
      max_consecutive_days: policy.max_consecutive_days,
      advance_notice_days: policy.advance_notice_days,
      carry_forward_days: policy.carry_forward_days,
      requires_approval: policy.requires_approval,
      requires_documentation: policy.requires_documentation,
      is_active: policy.is_active,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const url = isEditMode 
        ? `/api/v1/leave/policies/${selectedPolicy?.id}`
        : "/leave/policies";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await apiRequest(url, { method, body: JSON.stringify(formData) });
      if (response.success) {
        await loadData();
        onClose();
      }
    } catch (error) {
      console.error("Error saving leave policy:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this leave policy?")) {
      try {
        const response = await apiRequest("DELETE", `/api/v1/leave/policies/${id}`);
        if (response.success) {
          await loadData();
        }
      } catch (error) {
        console.error("Error deleting leave policy:", error);
      }
    }
  };

  // Filter policies based on search query
  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.leave_type_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered results
  const paginatedPolicies = filteredPolicies.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const pages = Math.ceil(filteredPolicies.length / rowsPerPage);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "danger";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
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
        title="Leave Policies"
        description="Manage leave policies and rules for different leave types"
        icon="lucide:shield"
        iconColor="from-primary-500 to-secondary-500"
        actions={
          <>
            <Input
              placeholder="Search policies..."
              
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-default-400" />}
              className="w-64"
            />
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={handleAddNew}
            >
              Add Policy
            </Button>
          </>
        }
      />

      {/* Leave Policies Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Leave Policies ({filteredPolicies.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Leave policies table">
            <TableHeader>
              <TableColumn>POLICY NAME</TableColumn>
              <TableColumn>LEAVE TYPE</TableColumn>
              <TableColumn>MAX DAYS/YEAR</TableColumn>
              <TableColumn>ADVANCE NOTICE</TableColumn>
              <TableColumn>REQUIRES APPROVAL</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{policy.name}</p>
                      <p className="text-sm text-default-500">{policy.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip color="primary" variant="flat" size="sm">
                      {policy.leave_type_name}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{policy.max_days_per_year} days</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{policy.advance_notice_days} days</span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={policy.requires_approval ? "warning" : "success"} 
                      variant="flat" 
                      size="sm"
                    >
                      {policy.requires_approval ? "Required" : "Not Required"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(policy.is_active)} 
                      variant="flat" 
                      size="sm"
                    >
                      {getStatusText(policy.is_active)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(policy)}
                      >
                        <Icon icon="lucide:edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(policy.id)}
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
                {isEditMode ? "Edit Leave Policy" : "Add New Leave Policy"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Policy Name"
                    placeholder="Enter policy name"
                    
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isRequired
                  />
                  
                  <Textarea
                    label="Description"
                    placeholder="Enter policy description"
                    
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Max Days Per Year"
                      type="number"
                      
                      onChange={(e) => setFormData({ ...formData, max_days_per_year: parseInt(e.target.value) || 0 })}
                      isRequired
                    />
                    
                    <Input
                      label="Max Consecutive Days"
                      type="number"
                      
                      onChange={(e) => setFormData({ ...formData, max_consecutive_days: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Advance Notice Days"
                      type="number"
                      
                      onChange={(e) => setFormData({ ...formData, advance_notice_days: parseInt(e.target.value) || 0 })}
                    />
                    
                    <Input
                      label="Carry Forward Days"
                      type="number"
                      
                      onChange={(e) => setFormData({ ...formData, carry_forward_days: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      isSelected={formData.requires_approval}
                      onValueChange={(value) => setFormData({ ...formData, requires_approval: value })}
                    >
                      Requires Approval
                    </Switch>
                    
                    <Switch
                      isSelected={formData.requires_documentation}
                      onValueChange={(value) => setFormData({ ...formData, requires_documentation: value })}
                    >
                      Requires Documentation
                    </Switch>
                    
                    <Switch
                      isSelected={formData.is_active}
                      onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                    >
                      Active
                    </Switch>
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