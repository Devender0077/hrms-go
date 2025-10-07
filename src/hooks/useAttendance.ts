import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api-service';
import { addToast } from '@heroui/react';

export interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: "present" | "late" | "absent" | "leave" | "half-day";
  work_hours: number;
  total_hours: number;
  overtime_hours: number;
  ip_address: string | null;
  location_latitude: string | null;
  location_longitude: string | null;
  note: string | null;
  attendance_id: string | null;
  check_in_location: string | null;
  check_out_location: string | null;
  check_in_ip: string | null;
  check_out_ip: string | null;
  check_in_device: string | null;
  check_out_device: string | null;
  department: string | null;
  designation_name: string | null;
  shift_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAttendanceRecords = async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page,
        limit: 10,
        ...params
      };

      const response = await apiRequest('/timekeeping/attendance-records', {
        method: 'GET',
        params: queryParams
      });

      if (response.data) {
        setAttendanceRecords(response.data);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setError('Failed to load attendance records');
      addToast({
        title: 'Error',
        description: 'Failed to load attendance records',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (location: {lat: number, lng: number}) => {
    try {
      const checkInData = {
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
        note: 'Checked in via web app',
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screen: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      await apiRequest('/timekeeping/check-in', {
        method: 'POST',
        body: checkInData
      });

      addToast({
        title: 'Success',
        description: 'Checked in successfully',
        color: 'success'
      });

      // Reload attendance records
      loadAttendanceRecords();
    } catch (error) {
      console.error('Check-in error:', error);
      
      if (error.message && error.message.includes('Already checked in')) {
        addToast({
          title: 'Already Checked In',
          description: 'You have already checked in today',
          color: 'warning'
        });
      } else {
        addToast({
          title: 'Error',
          description: 'Failed to check in. Please try again.',
          color: 'danger'
        });
      }
      throw error;
    }
  };

  const checkOut = async (location: {lat: number, lng: number}) => {
    try {
      const checkOutData = {
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
        note: 'Checked out via web app',
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screen: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      await apiRequest('/timekeeping/check-out', {
        method: 'POST',
        body: checkOutData
      });

      addToast({
        title: 'Success',
        description: 'Checked out successfully',
        color: 'success'
      });

      // Reload attendance records
      loadAttendanceRecords();
    } catch (error) {
      console.error('Check-out error:', error);
      
      if (error.message && error.message.includes('Already checked out')) {
        addToast({
          title: 'Already Checked Out',
          description: 'You have already checked out today',
          color: 'warning'
        });
      } else if (error.message && error.message.includes('Not checked in')) {
        addToast({
          title: 'Not Checked In',
          description: 'You need to check in first before checking out',
          color: 'warning'
        });
      } else {
        addToast({
          title: 'Error',
          description: 'Failed to check out. Please try again.',
          color: 'danger'
        });
      }
      throw error;
    }
  };

  const updateAttendanceRecord = async (id: number, data: Partial<AttendanceRecord>) => {
    try {
      await apiRequest(`/attendance/${id}`, {
        method: 'PUT',
        body: data
      });

      addToast({
        title: 'Success',
        description: 'Attendance record updated successfully',
        color: 'success'
      });

      // Reload attendance records
      loadAttendanceRecords();
    } catch (error) {
      console.error('Update error:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update attendance record',
        color: 'danger'
      });
      throw error;
    }
  };

  const deleteAttendanceRecord = async (id: number) => {
    try {
      await apiRequest(`/attendance/${id}`, {
        method: 'DELETE'
      });

      addToast({
        title: 'Success',
        description: 'Attendance record deleted successfully',
        color: 'success'
      });

      // Reload attendance records
      loadAttendanceRecords();
    } catch (error) {
      console.error('Delete error:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete attendance record',
        color: 'danger'
      });
      throw error;
    }
  };

  return {
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
  };
};
