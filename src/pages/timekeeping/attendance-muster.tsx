import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Select, SelectItem, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, DatePicker, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthenticatedAPI } from '../../hooks/useAuthenticatedAPI';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  check_in: string;
  check_out: string;
  total_hours: number;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'early_leave';
  overtime_hours: number;
  remarks: string;
}

interface AttendanceStats {
  total_employees: number;
  present_count: number;
  absent_count: number;
  half_day_count: number;
  late_count: number;
  early_leave_count: number;
  total_overtime: number;
}

const AttendanceMuster: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total_employees: 0,
    present_count: 0,
    absent_count: 0,
    half_day_count: 0,
    late_count: 0,
    early_leave_count: 0,
    total_overtime: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    status: 'present',
    remarks: ''
  });

  const { apiRequest } = useAuthenticatedAPI();

  const fetchAttendanceMuster = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/timekeeping/muster?date=${selectedDate}`, {
        method: 'GET'
      });

      if (response.success) {
        setAttendanceRecords(response.data.records || []);
        setStats(response.data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching attendance muster:', error);
      addToast({
        title: 'Error',
        description: 'Error fetching attendance muster',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceMuster();
  }, [selectedDate]);

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData({
      check_in: record.check_in || '',
      check_out: record.check_out || '',
      status: record.status,
      remarks: record.remarks || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveRecord = async () => {
    if (!editingRecord) return;

    try {
      const response = await apiRequest(`/timekeeping/${editingRecord.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        addToast({
          title: 'Success',
          description: 'Attendance record updated successfully',
          color: 'success'
        });
        setIsEditOpen(false);
        fetchAttendanceMuster();
      }
    } catch (error) {
      console.error('Error updating attendance record:', error);
      addToast({
        title: 'Error',
        description: 'Error updating attendance record',
        color: 'danger'
      });
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'half_day': return 'warning';
      case 'late': return 'warning';
      case 'early_leave': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return 'lucide:check-circle';
      case 'absent': return 'lucide:x-circle';
      case 'half_day': return 'lucide:clock';
      case 'late': return 'lucide:clock-4';
      case 'early_leave': return 'lucide:clock-12';
      default: return 'lucide:help-circle';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Muster</h1>
            <p className="text-blue-100 mt-2">Daily attendance tracking and management</p>
          </div>
          <Icon icon="lucide:users" className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody className="flex flex-row items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Icon icon="lucide:check-circle" className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present_count}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Icon icon="lucide:x-circle" className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent_count}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Icon icon="lucide:clock" className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Half Day</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.half_day_count}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon icon="lucide:clock-4" className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-blue-600">{stats.late_count}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
            <Input
              label="Search Employee"
              placeholder="Search by employee name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Icon icon="lucide:search" className="w-4 h-4" />}
              className="max-w-xs"
            />
            <Select
              label="Status Filter"
              placeholder="Filter by status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
              className="max-w-xs"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="present">Present</SelectItem>
              <SelectItem key="absent">Absent</SelectItem>
              <SelectItem key="half_day">Half Day</SelectItem>
              <SelectItem key="late">Late</SelectItem>
              <SelectItem key="early_leave">Early Leave</SelectItem>
            </Select>
            <Button
              color="primary"
              onClick={fetchAttendanceMuster}
              startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Attendance Records</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Attendance muster table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>CHECK IN</TableColumn>
                <TableColumn>CHECK OUT</TableColumn>
                <TableColumn>TOTAL HOURS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>OVERTIME</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.employee_name}</p>
                        <p className="text-sm text-gray-500">ID: {record.employee_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.check_in ? (
                        <span className="text-green-600">{record.check_in}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.check_out ? (
                        <span className="text-red-600">{record.check_out}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.total_hours.toFixed(2)}h</span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(record.status)}
                        variant="flat"
                        startContent={<Icon icon={getStatusIcon(record.status)} className="w-3 h-3" />}
                      >
                        {record.status.replace('_', ' ').toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {record.overtime_hours > 0 ? (
                        <span className="text-orange-600 font-medium">+{record.overtime_hours.toFixed(2)}h</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => handleEditRecord(record)}
                        startContent={<Icon icon="lucide:edit" className="w-3 h-3" />}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Attendance Record</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Check In Time"
                  type="time"
                  value={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                />
                <Input
                  label="Check Out Time"
                  type="time"
                  value={formData.check_out}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                />
              </div>
              <Select
                label="Status"
                selectedKeys={[formData.status]}
                onSelectionChange={(keys) => setFormData({ ...formData, status: Array.from(keys)[0] as string })}
              >
                <SelectItem key="present">Present</SelectItem>
                <SelectItem key="absent">Absent</SelectItem>
                <SelectItem key="half_day">Half Day</SelectItem>
                <SelectItem key="late">Late</SelectItem>
                <SelectItem key="early_leave">Early Leave</SelectItem>
              </Select>
              <Textarea
                label="Remarks"
                placeholder="Enter any remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveRecord}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AttendanceMuster;
