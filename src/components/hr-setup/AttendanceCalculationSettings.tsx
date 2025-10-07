import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, Select, SelectItem, Chip, Spinner, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthenticatedAPI } from '../../hooks/useAuthenticatedAPI';

interface AttendanceRule {
  id: number;
  name: string;
  type: 'full_day' | 'half_day' | 'present' | 'absent' | 'late' | 'early_leave';
  min_hours: number;
  max_hours: number;
  grace_period_minutes: number;
  overtime_threshold_hours: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AttendanceCalculationSettings: React.FC = () => {
  const [rules, setRules] = useState<AttendanceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AttendanceRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'full_day',
    min_hours: 8,
    max_hours: 8,
    grace_period_minutes: 15,
    overtime_threshold_hours: 8,
    description: '',
    is_active: true
  });

  const { apiRequest } = useAuthenticatedAPI();

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/hr-setup/attendance-rules', {
        method: 'GET'
      });

      if (response.success) {
        setRules(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance rules:', error);
      addToast({
        title: 'Error',
        description: 'Error fetching attendance rules',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async () => {
    try {
      const response = await apiRequest('/hr-setup/attendance-rules', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        addToast({
          title: 'Success',
          description: 'Attendance rule created successfully',
          color: 'success'
        });
        setIsCreateOpen(false);
        resetForm();
        fetchRules();
      }
    } catch (error) {
      console.error('Error creating attendance rule:', error);
      addToast({
        title: 'Error',
        description: 'Error creating attendance rule',
        color: 'danger'
      });
    }
  };

  const handleEditRule = (rule: AttendanceRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      min_hours: rule.min_hours,
      max_hours: rule.max_hours,
      grace_period_minutes: rule.grace_period_minutes,
      overtime_threshold_hours: rule.overtime_threshold_hours,
      description: rule.description,
      is_active: rule.is_active
    });
    setIsEditOpen(true);
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    try {
      const response = await apiRequest(`/hr-setup/attendance-rules/${editingRule.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        addToast({
          title: 'Success',
          description: 'Attendance rule updated successfully',
          color: 'success'
        });
        setIsEditOpen(false);
        setEditingRule(null);
        resetForm();
        fetchRules();
      }
    } catch (error) {
      console.error('Error updating attendance rule:', error);
      addToast({
        title: 'Error',
        description: 'Error updating attendance rule',
        color: 'danger'
      });
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attendance rule?')) return;

    try {
      const response = await apiRequest(`/hr-setup/attendance-rules/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        addToast({
          title: 'Success',
          description: 'Attendance rule deleted successfully',
          color: 'success'
        });
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting attendance rule:', error);
      addToast({
        title: 'Error',
        description: 'Error deleting attendance rule',
        color: 'danger'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'full_day',
      min_hours: 8,
      max_hours: 8,
      grace_period_minutes: 15,
      overtime_threshold_hours: 8,
      description: '',
      is_active: true
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full_day': return 'success';
      case 'half_day': return 'warning';
      case 'present': return 'primary';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      case 'early_leave': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full_day': return 'lucide:check-circle';
      case 'half_day': return 'lucide:clock';
      case 'present': return 'lucide:user-check';
      case 'absent': return 'lucide:x-circle';
      case 'late': return 'lucide:clock-4';
      case 'early_leave': return 'lucide:clock-12';
      default: return 'lucide:help-circle';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Attendance Calculation Rules</h2>
            <p className="text-gray-600">Configure how attendance is calculated and categorized</p>
          </div>
          <Button
            color="primary"
            onClick={() => setIsCreateOpen(true)}
            startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
          >
            Add Rule
          </Button>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Attendance calculation rules table">
              <TableHeader>
                <TableColumn>RULE NAME</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>MIN HOURS</TableColumn>
                <TableColumn>MAX HOURS</TableColumn>
                <TableColumn>GRACE PERIOD</TableColumn>
                <TableColumn>OVERTIME THRESHOLD</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-gray-500">{rule.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getTypeColor(rule.type)}
                        variant="flat"
                        startContent={<Icon icon={getTypeIcon(rule.type)} className="w-3 h-3" />}
                      >
                        {rule.type.replace('_', ' ').toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>{rule.min_hours}h</TableCell>
                    <TableCell>{rule.max_hours}h</TableCell>
                    <TableCell>{rule.grace_period_minutes}min</TableCell>
                    <TableCell>{rule.overtime_threshold_hours}h</TableCell>
                    <TableCell>
                      <Chip color={rule.is_active ? 'success' : 'danger'} variant="flat">
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => handleEditRule(rule)}
                          startContent={<Icon icon="lucide:edit" className="w-3 h-3" />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onClick={() => handleDeleteRule(rule.id)}
                          startContent={<Icon icon="lucide:trash" className="w-3 h-3" />}
                        >
                          Delete
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

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Create Attendance Rule</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Rule Name"
                placeholder="Enter rule name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              <Select
                label="Rule Type"
                placeholder="Select rule type"
                selectedKeys={[formData.type]}
                onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] as string })}
                isRequired
              >
                <SelectItem key="full_day">Full Day</SelectItem>
                <SelectItem key="half_day">Half Day</SelectItem>
                <SelectItem key="present">Present</SelectItem>
                <SelectItem key="absent">Absent</SelectItem>
                <SelectItem key="late">Late</SelectItem>
                <SelectItem key="early_leave">Early Leave</SelectItem>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Hours"
                  type="number"
                  placeholder="Enter minimum hours"
                  value={formData.min_hours.toString()}
                  onChange={(e) => setFormData({ ...formData, min_hours: parseFloat(e.target.value) || 0 })}
                  isRequired
                />
                <Input
                  label="Maximum Hours"
                  type="number"
                  placeholder="Enter maximum hours"
                  value={formData.max_hours.toString()}
                  onChange={(e) => setFormData({ ...formData, max_hours: parseFloat(e.target.value) || 0 })}
                  isRequired
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grace Period (minutes)"
                  type="number"
                  placeholder="Enter grace period"
                  value={formData.grace_period_minutes.toString()}
                  onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })}
                  isRequired
                />
                <Input
                  label="Overtime Threshold (hours)"
                  type="number"
                  placeholder="Enter overtime threshold"
                  value={formData.overtime_threshold_hours.toString()}
                  onChange={(e) => setFormData({ ...formData, overtime_threshold_hours: parseFloat(e.target.value) || 0 })}
                  isRequired
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Enter rule description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={[formData.is_active ? 'active' : 'inactive']}
                onSelectionChange={(keys) => setFormData({ ...formData, is_active: Array.from(keys)[0] === 'active' })}
                isRequired
              >
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateRule}>
              Create Rule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Attendance Rule</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Rule Name"
                placeholder="Enter rule name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              <Select
                label="Rule Type"
                placeholder="Select rule type"
                selectedKeys={[formData.type]}
                onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] as string })}
                isRequired
              >
                <SelectItem key="full_day">Full Day</SelectItem>
                <SelectItem key="half_day">Half Day</SelectItem>
                <SelectItem key="present">Present</SelectItem>
                <SelectItem key="absent">Absent</SelectItem>
                <SelectItem key="late">Late</SelectItem>
                <SelectItem key="early_leave">Early Leave</SelectItem>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Hours"
                  type="number"
                  placeholder="Enter minimum hours"
                  value={formData.min_hours.toString()}
                  onChange={(e) => setFormData({ ...formData, min_hours: parseFloat(e.target.value) || 0 })}
                  isRequired
                />
                <Input
                  label="Maximum Hours"
                  type="number"
                  placeholder="Enter maximum hours"
                  value={formData.max_hours.toString()}
                  onChange={(e) => setFormData({ ...formData, max_hours: parseFloat(e.target.value) || 0 })}
                  isRequired
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grace Period (minutes)"
                  type="number"
                  placeholder="Enter grace period"
                  value={formData.grace_period_minutes.toString()}
                  onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })}
                  isRequired
                />
                <Input
                  label="Overtime Threshold (hours)"
                  type="number"
                  placeholder="Enter overtime threshold"
                  value={formData.overtime_threshold_hours.toString()}
                  onChange={(e) => setFormData({ ...formData, overtime_threshold_hours: parseFloat(e.target.value) || 0 })}
                  isRequired
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Enter rule description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={[formData.is_active ? 'active' : 'inactive']}
                onSelectionChange={(keys) => setFormData({ ...formData, is_active: Array.from(keys)[0] === 'active' })}
                isRequired
              >
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUpdateRule}>
              Update Rule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AttendanceCalculationSettings;
