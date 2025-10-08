import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, DatePicker, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthenticatedAPI } from '../../hooks/useAuthenticatedAPI';

interface AttendanceRecord {
  id: number | null;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  designation_name: string | null;
  department_name: string | null;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: number;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late' | 'Early Leave' | 'On Leave' | 'Holiday';
  overtime_hours: number;
  remarks: string | null;
}

interface AttendanceStats {
  totalEmployees: number;
  present: number;
  absent: number;
  halfDay: number;
  late: number;
  earlyLeave: number;
  onLeave: number;
  holiday: number;
}

interface Holiday {
  date: string;
  name: string;
  type: string;
}

interface WeekendConfig {
  day_of_week: number;
  name: string;
}

interface MonthlyAttendance {
  [employeeId: string]: {
    employee_name: string;
    employee_code: string;
    department_name: string;
    attendance: { [date: string]: AttendanceRecord };
  };
}

const AttendanceMuster: React.FC = () => {
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [weekendConfigs, setWeekendConfigs] = useState<WeekendConfig[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    late: 0,
    earlyLeave: 0,
    onLeave: 0,
    holiday: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState({
    check_in_time: '',
    check_out_time: '',
    status: 'Present',
    remarks: ''
  });
  const { apiRequest } = useAuthenticatedAPI();

  const statusOptions = [
    { value: 'Present', label: 'Present (P)', color: 'success' },
    { value: 'Absent', label: 'Absent (A)', color: 'danger' },
    { value: 'Half Day', label: 'Half Day (HD)', color: 'warning' },
    { value: 'Late', label: 'Late (L)', color: 'warning' },
    { value: 'Early Leave', label: 'Early Leave (EL)', color: 'warning' },
    { value: 'On Leave', label: 'On Leave (OL)', color: 'primary' },
    { value: 'Holiday', label: 'Holiday (H)', color: 'secondary' }
  ];

  const getStatusCode = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Present': 'P', 'Absent': 'A', 'Half Day': 'HD', 'Late': 'L',
      'Early Leave': 'EL', 'On Leave': 'OL', 'Holiday': 'H'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'Present': 'success', 'Absent': 'danger', 'Half Day': 'warning', 'Late': 'warning',
      'Early Leave': 'warning', 'On Leave': 'primary', 'Holiday': 'secondary'
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: { [key: string]: string } = {
      'Present': 'lucide:check-circle', 'Absent': 'lucide:x-circle', 'Half Day': 'lucide:clock',
      'Late': 'lucide:clock', 'Early Leave': 'lucide:clock', 'On Leave': 'lucide:calendar',
      'Holiday': 'lucide:calendar', 'Weekend': 'lucide:calendar-days'
    };
    return iconMap[status] || 'lucide:help-circle';
  };

  const isHoliday = (date: string) => {
    return holidays.some(holiday => holiday.date === date);
  };

  const isWeekend = (date: string) => {
    // Parse date in local timezone to avoid timezone shift issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay();
    
    // Fallback to Saturday (6) and Sunday (0) if weekend configs are not available
    if (!weekendConfigs || weekendConfigs.length === 0) {
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    return weekendConfigs.some(config => config.day_of_week === dayOfWeek);
  };

  const getHolidayName = (date: string) => {
    const holiday = holidays.find(h => h.date === date);
    return holiday ? holiday.name : '';
  };

  const getWeekendName = (date: string) => {
    // Parse date in local timezone to avoid timezone shift issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay();
    
    // Fallback to day names if weekend configs are not available
    if (!weekendConfigs || weekendConfigs.length === 0) {
      return dayOfWeek === 0 ? 'Sunday' : dayOfWeek === 6 ? 'Saturday' : '';
    }
    const config = weekendConfigs.find(c => c.day_of_week === dayOfWeek);
    return config ? config.name : '';
  };

  // Generate days for the selected month with proper date handling
  const getDaysInMonth = useMemo(() => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1; // JavaScript months are 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const currentDate = new Date(year, month, 1);
    
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekendDay = isWeekend(dateString);
      const isFuture = date > today;
      const isToday = date.toDateString() === today.toDateString();
      
      days.push({ 
        day, 
        dayName, 
        date: dateString, 
        isWeekend: isWeekendDay, 
        isFuture, 
        isToday 
      });
    }
    
    return days;
  }, [selectedMonth, holidays, weekendConfigs]);

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      
      // Get the first and last day of the selected month
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]) - 1;
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      // Fetch monthly muster data in a single API call
      const response = await apiRequest(`/timekeeping/monthly-muster?start_date=${firstDay}&end_date=${lastDay}`);
      
      if (response.success && response.data) {
        const { employees, attendanceMap, holidays, weekendConfigs, stats } = response.data;
        console.log('Received data:', { employees: employees.length, attendanceMap: Object.keys(attendanceMap).length, stats });
        console.log('Sample attendanceMap keys:', Object.keys(attendanceMap).slice(0, 5));
        console.log('Sample attendanceMap values:', Object.values(attendanceMap).slice(0, 2));
        console.log('First employee:', employees[0]);
        console.log('All attendanceMap keys:', Object.keys(attendanceMap));
        console.log('Weekend configs:', weekendConfigs);
        
        const monthlyData: MonthlyAttendance = {};

        // Process employees and their attendance
        employees.forEach((employee: any) => {
          const empId = employee.id.toString();
          monthlyData[empId] = {
            employee_name: `${employee.first_name} ${employee.last_name}`,
            employee_code: employee.employee_code,
            department_name: employee.department_name || '',
            attendance: {}
          };

          // Add attendance records for this employee
          Object.entries(attendanceMap).forEach(([key, record]: [string, any]) => {
            // The key format is `${employee_id}_${date}`, so we need to extract the employee_id
            const keyEmployeeId = parseInt(key.split('_')[0]);
            const employeeIdNum = parseInt(employee.id);
            
            // Debug logging for employee ID matching
            if (employee.employee_code === 'EMP001') {
              console.log('Employee ID matching debug:', {
                key,
                keyEmployeeId,
                employeeId: employee.id,
                employeeIdNum,
                matches: keyEmployeeId === employeeIdNum,
                record
              });
            }
            
            if (keyEmployeeId === employeeIdNum) {
              monthlyData[empId].attendance[record.date] = record;
              console.log('Added attendance record:', record, 'for employee:', employee.id, 'key:', key);
            }
          });
        });

        console.log('Processed monthly data:', monthlyData);
        
        // Debug: Check if any employee has attendance records
        Object.entries(monthlyData).forEach(([empId, empData]) => {
          const attendanceDates = Object.keys(empData.attendance);
          if (attendanceDates.length > 0) {
            console.log(`Employee ${empData.employee_code} has ${attendanceDates.length} attendance records:`, attendanceDates);
          }
        });

        setMonthlyAttendance(monthlyData);
        setHolidays(holidays || []);
        setWeekendConfigs(weekendConfigs || []);
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      addToast({
        title: 'Error',
        description: 'Failed to fetch monthly attendance data',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData({
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
      status: record.status || 'Present',
      remarks: record.remarks || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      // Prepare the request body with additional data for new records
      const requestBody = {
        ...formData,
        employee_id: editingRecord.employee_id,
        date: editingRecord.date
      };

      console.log('Saving attendance record:', requestBody);
      
      const response = await apiRequest(`/timekeeping/${editingRecord.id || 'null'}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      });

      console.log('Save response:', response);

      if (response.success) {
        addToast({
          title: 'Success',
          description: 'Attendance record updated successfully',
          color: 'success'
        });
        setIsEditOpen(false);
        setEditingRecord(null);
        console.log('Refreshing monthly attendance data...');
        fetchMonthlyAttendance(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating attendance record:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update attendance record',
        color: 'danger'
      });
    }
  };

  const exportToExcel = () => {
    addToast({
      title: 'Info',
      description: 'Excel export feature will be implemented soon',
      color: 'primary'
    });
  };

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [selectedMonth]);

  const filteredEmployees = Object.values(monthlyAttendance).filter(employee => {
    const matchesSearch = employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Muster</h1>
            <p className="text-blue-100 mt-2">Monthly attendance overview and management</p>
          </div>
          <Button
            color="primary"
            variant="solid"
            startContent={<Icon icon="lucide:download" className="w-4 h-4" />}
            onClick={exportToExcel}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Icon icon="lucide:search" className="w-4 h-4 text-gray-400" />}
                variant="bordered"
              />
            </div>
            <div className="min-w-[150px]">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Select Month"
                variant="bordered"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:users" className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold text-blue-600">{stats.totalEmployees}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:check-circle" className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-xl font-bold text-green-600">{stats.present}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:x-circle" className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-xl font-bold text-red-600">{stats.absent}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:clock" className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Half Day</p>
            <p className="text-xl font-bold text-yellow-600">{stats.halfDay}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:clock-4" className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-xl font-bold text-orange-600">{stats.late}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:clock-12" className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Early Leave</p>
            <p className="text-xl font-bold text-purple-600">{stats.earlyLeave}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:calendar" className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">On Leave</p>
            <p className="text-xl font-bold text-indigo-600">{stats.onLeave}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <Icon icon="lucide:calendar-days" className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Holiday</p>
            <p className="text-xl font-bold text-gray-600">{stats.holiday}</p>
          </CardBody>
        </Card>
      </div>

      {/* Monthly Attendance Grid */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Monthly Attendance Grid</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon icon="lucide:info" className="w-4 h-4" />
              <span>Click on status codes to edit attendance</span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header Row */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <div className="min-w-[200px] p-3 font-semibold text-gray-700">Employee</div>
                  {getDaysInMonth.map(dayInfo => (
                    <div key={dayInfo.day} className="min-w-[50px] p-2 text-center border-l border-gray-200">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold">{dayInfo.day}</span>
                        <span className="text-xs text-gray-500">{dayInfo.dayName}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Employee Rows */}
                {filteredEmployees.map((employee, index) => (
                  <div key={`${employee.employee_code}-${index}`} className="flex border-b border-gray-200 hover:bg-gray-50">
                    <div className="min-w-[200px] p-3">
                      <div>
                        <p className="font-medium text-gray-900">{employee.employee_name}</p>
                        <p className="text-sm text-gray-500">{employee.employee_code}</p>
                        {employee.department_name && (
                          <p className="text-xs text-gray-400">{employee.department_name}</p>
                        )}
                      </div>
                    </div>
                    {getDaysInMonth.map(dayInfo => {
                      const attendance = employee.attendance[dayInfo.date];
                      const isHolidayDay = isHoliday(dayInfo.date);
                      const isWeekendDay = isWeekend(dayInfo.date);
                      
                      // Debug logging for attendance matching
                      if (employee.employee_code === 'EMP001' && dayInfo.date.includes('2025-10-03')) {
                        console.log('Debug attendance for EMP001 on 2025-10-03:', {
                          dayInfoDate: dayInfo.date,
                          attendance: attendance,
                          availableDates: Object.keys(employee.attendance)
                        });
                      }
                      
                      // Debug logging for weekend detection
                      if (dayInfo.date.includes('2025-10-05') || dayInfo.date.includes('2025-10-06')) {
                        console.log('Weekend debug for date:', dayInfo.date, {
                          isWeekendDay,
                          dayOfWeek: new Date(dayInfo.date).getDay(),
                          weekendConfigs
                        });
                      }
                      
                      return (
                        <div key={dayInfo.day} className="min-w-[50px] p-2 text-center border-l border-gray-200">
                          {isHolidayDay ? (
                            <Chip
                              size="sm"
                              color="secondary"
                              variant="flat"
                              className="cursor-default"
                              title={getHolidayName(dayInfo.date)}
                            >
                              H
                            </Chip>
                          ) : isWeekendDay ? (
                            <Chip
                              size="sm"
                              color="danger"
                              variant="flat"
                              className="cursor-default"
                              title={getWeekendName(dayInfo.date)}
                            >
                              WD
                            </Chip>
                          ) : dayInfo.isFuture ? (
                            <span className="text-gray-300 text-sm">-</span>
                          ) : attendance ? (
                            <button
                              onClick={() => handleEditRecord(attendance)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Chip
                                size="sm"
                                color={getStatusColor(attendance.status) as any}
                                variant="flat"
                                className="cursor-pointer"
                              >
                                {getStatusCode(attendance.status)}
                              </Chip>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                // Create a new attendance record for this date
                                // Find the employee ID from the monthlyAttendance keys
                                const employeeId = Object.keys(monthlyAttendance).find(id => 
                                  monthlyAttendance[id].employee_code === employee.employee_code
                                );
                                
                                const newRecord: AttendanceRecord = {
                                  id: null,
                                  employee_id: parseInt(employeeId || '0'),
                                  employee_name: employee.employee_name,
                                  employee_code: employee.employee_code,
                                  designation_name: null,
                                  department_name: employee.department_name,
                                  date: dayInfo.date,
                                  check_in_time: null,
                                  check_out_time: null,
                                  total_hours: 0,
                                  status: 'Present', // Default to Present instead of Absent
                                  overtime_hours: 0,
                                  remarks: null
                                };
                                handleEditRecord(newRecord);
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                              title="No attendance record - Click to create"
                            >
                              <span className="text-xs text-gray-400">-</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Status Legend */}
      <Card className="shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Status Legend</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Chip
                  color={option.color as any}
                  variant="flat"
                  size="sm"
                  startContent={<Icon icon={getStatusIcon(option.value)} className="w-3 h-3" />}
                >
                  {getStatusCode(option.value)}
                </Chip>
                <span className="text-sm text-gray-600">{option.value}</span>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Chip
                color="secondary"
                variant="flat"
                size="sm"
                startContent={<Icon icon="lucide:calendar" className="w-3 h-3" />}
              >
                H
              </Chip>
              <span className="text-sm text-gray-600">Holiday</span>
            </div>
            <div className="flex items-center space-x-2">
              <Chip
                color="danger"
                variant="flat"
                size="sm"
                startContent={<Icon icon="lucide:calendar-days" className="w-3 h-3" />}
              >
                WD
              </Chip>
              <span className="text-sm text-gray-600">Weekend</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-400">-</span>
              </div>
              <span className="text-sm text-gray-600">No Record</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A dash (-) means no attendance record exists for that day. 
              Click on any dash to create an attendance record. 
              Only actual attendance records (P, A, HD, L, EL, OL) are counted in the statistics above.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={setIsEditOpen} size="md">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Edit Attendance Record</h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            {editingRecord && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{editingRecord.employee_name}</p>
                  <p className="text-sm text-gray-500">{editingRecord.employee_code} - {editingRecord.date}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Check In Time"
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                    variant="bordered"
                  />
                  <Input
                    label="Check Out Time"
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                    variant="bordered"
                  />
                </div>
                <Select
                  label="Status"
                  selectedKeys={[formData.status]}
                  onSelectionChange={(keys) => setFormData({ ...formData, status: Array.from(keys)[0] as string })}
                  variant="bordered"
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
                <Textarea
                  label="Remarks"
                  placeholder="Enter any remarks..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  variant="bordered"
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AttendanceMuster;