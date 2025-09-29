import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Input
} from "@heroui/react";
import { AttendanceRecord } from '../../hooks/useAttendance';

interface AttendanceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

const formatTime = (timeString: string | null) => {
  if (!timeString) return '-';
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

const formatHours = (hours: number | string | null) => {
  if (!hours) return '0h';
  const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  return `${numHours.toFixed(1)}h`;
};

const statusColorMap = {
  present: "success",
  late: "warning", 
  absent: "danger",
  leave: "default",
  "half-day": "secondary",
};

const AttendanceViewModal: React.FC<AttendanceViewModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  if (!record) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              View Attendance Record - {record.employee_name}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-700">Date</label>
                    <Input
                      value={formatDate(record.date)}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Employee ID</label>
                    <Input
                      value={record.employee_id}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-700">Check In Time</label>
                    <Input
                      value={formatTime(record.check_in)}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Check Out Time</label>
                    <Input
                      value={formatTime(record.check_out)}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-default-700">Status</label>
                  <div className="mt-1">
                    <Chip 
                      color={statusColorMap[record.status] as any}
                      variant="flat"
                      size="sm"
                      className="capitalize"
                    >
                      {record.status}
                    </Chip>
                  </div>
                </div>

                {/* Work Hours */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-700">Work Hours</label>
                    <Input
                      value={formatHours(record.work_hours)}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Total Hours</label>
                    <Input
                      value={formatHours(record.total_hours)}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Overtime Hours</label>
                    <Input
                      value={formatHours(record.overtime_hours)}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                </div>

                {/* Department and Designation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-700">Department</label>
                    <Input
                      value={record.department || '-'}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Designation</label>
                    <Input
                      value={record.designation_name || '-'}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                </div>

                {/* Shift */}
                {record.shift_name && (
                  <div>
                    <label className="text-sm font-medium text-default-700">Shift</label>
                    <Input
                      value={record.shift_name}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                )}

                {/* IP Address */}
                {record.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-default-700">IP Address</label>
                    <Input
                      value={record.ip_address}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                )}

                {/* Location */}
                {record.location_latitude && record.location_longitude && (
                  <div>
                    <label className="text-sm font-medium text-default-700">Location</label>
                    <Input
                      value={`${parseFloat(record.location_latitude).toFixed(6)}, ${parseFloat(record.location_longitude).toFixed(6)}`}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                )}

                {/* Notes */}
                {record.note && (
                  <div>
                    <label className="text-sm font-medium text-default-700">Note</label>
                    <Input
                      value={record.note}
                      isReadOnly
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AttendanceViewModal;
