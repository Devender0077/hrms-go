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
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";
import { useAttendance, AttendanceRecord } from "../../hooks/useAttendance";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import CheckInOut from "../../components/attendance/CheckInOut";
import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceViewModal from "../../components/attendance/AttendanceViewModal";
import IPDisplay from "../../components/attendance/IPDisplay";
import HeroSection from "../../components/common/HeroSection";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Attendance Management"
          subtitle="Track & Monitor Employee Time"
          description="Track employee attendance, check-in/out times, and work hours. Monitor productivity and ensure accurate time tracking across your organization."
          icon="lucide:clock"
          illustration="attendance"
          actions={[
            {
              label: "Export Report",
              icon: "lucide:download",
              onPress: () => console.log("Export Report"),
              color: "primary" as const
            },
            {
              label: "View Calendar",
              icon: "lucide:calendar",
              onPress: () => console.log("View Calendar"),
              variant: "bordered" as const
            }
          ]}
        />

        {/* IP Address Display - Only for Super Admin */}
        {user?.role === 'super_admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <IPDisplay />
          </motion.div>
        )}

        {/* Check In/Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CheckInOut
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isCheckingIn={isCheckingIn}
            isCheckingOut={isCheckingOut}
            canCheckIn={canCheckIn}
            canCheckOut={canCheckOut}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
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
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
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
        </motion.div>

        {/* Modals */}
        <AttendanceViewModal
          isOpen={isViewOpen}
          onClose={onViewClose}
          record={selectedRecord}
        />

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
                            
                            onChange={(e) => setEditingRecord({...editingRecord, check_in: e.target.value})}
                            size="sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-default-700">Check Out Time</label>
                          <Input
                            type="datetime-local"
                            
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
    </div>
  );
};

export default AttendancePage;
