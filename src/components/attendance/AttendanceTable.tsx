import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { AttendanceRecord } from '../../hooks/useAttendance';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onView: (record: AttendanceRecord) => void;
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (id: number) => void;
}

const statusColorMap = {
  present: "success",
  late: "warning", 
  absent: "danger",
  leave: "default",
  "half-day": "secondary",
};

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
    month: 'short',
    day: 'numeric'
  });
};

const formatHours = (hours: number | string | null) => {
  if (!hours) return '0h';
  const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  return `${numHours.toFixed(1)}h`;
};

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <Table aria-label="Attendance records table">
      <TableHeader>
        <TableColumn>EMPLOYEE</TableColumn>
        <TableColumn>DATE</TableColumn>
        <TableColumn>CHECK IN</TableColumn>
        <TableColumn>CHECK OUT</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>WORK HOURS</TableColumn>
        <TableColumn>OVERTIME</TableColumn>
        <TableColumn>LOCATION</TableColumn>
        <TableColumn>IP ADDRESS</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No attendance records found">
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar
                  name={record.employee_name || 'Unknown'}
                  size="sm"
                />
                <div>
                  <p className="font-medium text-foreground">{record.employee_name}</p>
                  <p className="text-sm text-default-500">{record.employee_id}</p>
                  {record.department && (
                    <p className="text-xs text-default-400">{record.department}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{formatDate(record.date)}</TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-medium">{formatTime(record.check_in || (record as any).check_in_time)}</div>
                {((record as any).location_latitude || record.check_in_location) && (
                  <div className="text-xs text-default-500">
                    📍 {record.check_in_location || `${(record as any).location_latitude}, ${(record as any).location_longitude}`}
                  </div>
                )}
                {((record as any).ip_address || record.check_in_ip) && (
                  <div className="text-xs text-default-500">🌐 {record.check_in_ip || (record as any).ip_address}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-medium">{formatTime(record.check_out || (record as any).check_out_time)}</div>
                {((record as any).location_latitude || record.check_out_location) && (
                  <div className="text-xs text-default-500">
                    📍 {record.check_out_location || `${(record as any).location_latitude}, ${(record as any).location_longitude}`}
                  </div>
                )}
                {((record as any).ip_address || record.check_out_ip) && (
                  <div className="text-xs text-default-500">🌐 {record.check_out_ip || (record as any).ip_address}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Chip 
                color={statusColorMap[record.status] as any}
                variant="flat"
                size="sm"
              >
                {record.status}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:clock" className="text-default-400 text-sm" />
                <span className="text-sm">{formatHours(record.work_hours)}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:plus" className="text-warning-400 text-sm" />
                <span className="text-sm">{formatHours(record.overtime_hours)}</span>
              </div>
            </TableCell>
            <TableCell>
              {record.location_latitude && record.location_longitude ? (
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:map-pin" className="text-success text-sm" />
                  <span className="text-xs text-default-600">
                    {parseFloat(record.location_latitude).toFixed(4)}, {parseFloat(record.location_longitude).toFixed(4)}
                  </span>
                </div>
              ) : (
                <span className="text-default-400 text-sm">-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {record.ip_address && (
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:globe" className="text-primary text-xs" />
                    <span className="text-xs">{record.ip_address}</span>
                  </div>
                )}
                {!record.ip_address && (
                  <span className="text-default-400 text-xs">-</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Dropdown closeOnSelect>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light" aria-label={`Actions for attendance record on ${record.date}`}>
                    <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label={`Attendance actions for ${record.date}`}>
                  <DropdownItem
                    key="view"
                    startContent={<Icon icon="lucide:eye" />}
                    onPress={() => onView(record)}
                    textValue="View attendance details"
                  >
                    View Details
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    startContent={<Icon icon="lucide:edit" />}
                    onPress={() => onEdit(record)}
                    textValue="Edit attendance record"
                  >
                    Edit Record
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    startContent={<Icon icon="lucide:trash" />}
                    className="text-danger"
                    color="danger"
                    onPress={() => onDelete(record.id)}
                    textValue="Delete attendance record"
                  >
                    Delete Record
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AttendanceTable;
