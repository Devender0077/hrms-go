import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "../../contexts/auth-context";
import { useAttendance, AttendanceRecord } from "../../hooks/useAttendance";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import CheckInOut from "../../components/attendance/CheckInOut";
import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceViewModal from "../../components/attendance/AttendanceViewModal";
import IPDisplay from "../../components/attendance/IPDisplay";

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const {
    attendanceRecords,
    loading,
    error,
    page,
    totalPages,
    setPage,
    loadAttendanceRecords,
    checkIn,
    checkOut,
    updateAttendanceRecord,
    deleteAttendanceRecord
  } = useAttendance();

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // State for modals
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  // Load attendance records when filters change
  useEffect(() => {
    const params: any = {};
    
    if (selectedStatus !== 'all') {
      params.status = selectedStatus;
    }
    
    if (filterDate) {
      params.from_date = filterDate;
      params.to_date = filterDate;
    }

    loadAttendanceRecords(params);
  }, [page, selectedStatus, filterDate]);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return attendanceRecords;
    
    return attendanceRecords.filter(record =>
      record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.department && record.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [attendanceRecords, searchQuery]);

  // Check if user can check in/out
  const canCheckIn = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceRecords.find(record => {
      // Handle both ISO date format and simple date format
      const recordDate = record.date.includes('T') ? record.date.split('T')[0] : record.date;
      return recordDate === today;
    });
    return !todayRecord || !todayRecord.check_in;
  }, [attendanceRecords]);

  const canCheckOut = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceRecords.find(record => {
      // Handle both ISO date format and simple date format
      const recordDate = record.date.includes('T') ? record.date.split('T')[0] : record.date;
      return recordDate === today;
    });
    return todayRecord && todayRecord.check_in && !todayRecord.check_out;
  }, [attendanceRecords]);

  // Handle check in
  const handleCheckIn = async (location: {lat: number, lng: number}) => {
    setIsCheckingIn(true);
    try {
      await checkIn(location);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handle check out
  const handleCheckOut = async (location: {lat: number, lng: number}) => {
    setIsCheckingOut(true);
    try {
      await checkOut(location);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle view record
  const handleViewRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    onViewOpen();
  };

  // Handle edit record
  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  // Handle delete record
  const handleDeleteRecord = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await deleteAttendanceRecord(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  // Handle apply date filter
  const handleApplyDateFilter = () => {
    setFilterDate(selectedDate);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedDate('');
    setFilterDate('');
  };

  // Handle update record
  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      await updateAttendanceRecord(editingRecord.id, {
        check_in: editingRecord.check_in,
        check_out: editingRecord.check_out,
        status: editingRecord.status,
        note: editingRecord.note
      });
      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-default-600 mt-2">
            Track employee attendance, check-in/out times, and work hours
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Icon icon="lucide:clock" className="text-4xl text-primary-600" />
        </div>
      </div>

      {/* IP Address Display - Only for Super Admin */}
      {user?.role === 'super_admin' && <IPDisplay />}

      {/* Check In/Out */}
      <CheckInOut
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        isCheckingIn={isCheckingIn}
        isCheckingOut={isCheckingOut}
        canCheckIn={canCheckIn}
        canCheckOut={canCheckOut}
      />

      {/* Filters */}
      <AttendanceFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        filterDate={filterDate}
        onApplyDateFilter={handleApplyDateFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Attendance Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:table" className="text-success-600 text-xl" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Attendance Records</h3>
              <p className="text-default-500 text-sm">
                {filteredRecords.length} of {attendanceRecords.length} records
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <AttendanceTable
            records={filteredRecords}
            onView={handleViewRecord}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
                showShadow
                color="primary"
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* View Modal */}
      <AttendanceViewModal
        isOpen={isViewOpen}
        onClose={onViewClose}
        record={selectedRecord}
      />

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Attendance Record
              </ModalHeader>
              <ModalBody>
                {editingRecord && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-default-700">Check In Time</label>
                        <Input
                          type="datetime-local"
                          value={editingRecord.check_in ? new Date(editingRecord.check_in).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setEditingRecord({...editingRecord, check_in: e.target.value})}
                          size="sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-default-700">Check Out Time</label>
                        <Input
                          type="datetime-local"
                          value={editingRecord.check_out ? new Date(editingRecord.check_out).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setEditingRecord({...editingRecord, check_out: e.target.value})}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-default-700">Status</label>
                      <Select
                        selectedKeys={[editingRecord.status]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          setEditingRecord({...editingRecord, status: selected as any});
                        }}
                        size="sm"
                      >
                        <SelectItem key="present">Present</SelectItem>
                        <SelectItem key="late">Late</SelectItem>
                        <SelectItem key="absent">Absent</SelectItem>
                        <SelectItem key="leave">On Leave</SelectItem>
                        <SelectItem key="half-day">Half Day</SelectItem>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-default-700">Note</label>
                      <Input
                        value={editingRecord.note || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, note: e.target.value})}
                        placeholder="Add a note..."
                        size="sm"
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleUpdateRecord}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AttendancePage;
