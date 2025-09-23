// Create a new attendance dashboard page
    import React from "react";
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
      Chip,
      Input,
      Pagination,
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      useDisclosure,
      Spinner,
      Tabs,
      Tab,
      Textarea,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    import { attendanceAPI } from "../../services/api-service";
    import { httpClient } from "../../services/http-client";
    import { API_ENDPOINTS } from "../../config/api-config";
    import { format, parseISO, isToday } from "date-fns";
    import Lottie from "react-lottie";
    import checkInAnimation from "../../assets/animations/check-in.json";
    import checkOutAnimation from "../../assets/animations/check-out.json";
    
    export default function AttendanceDashboard() {
      const [loading, setLoading] = React.useState(true);
      const [attendanceData, setAttendanceData] = React.useState([]);
      const [page, setPage] = React.useState(1);
      const [totalPages, setTotalPages] = React.useState(1);
      const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
      const [todayAttendance, setTodayAttendance] = React.useState(null);
      const [isCheckingIn, setIsCheckingIn] = React.useState(false);
      const [isCheckingOut, setIsCheckingOut] = React.useState(false);
      const [note, setNote] = React.useState("");
      const [location, setLocation] = React.useState(null);
      const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
      const [actionType, setActionType] = React.useState("check-in");
      const [stats, setStats] = React.useState({
        present: 0,
        absent: 0,
        late: 0,
        leave: 0
      });
      
      // Animation options
      const checkInAnimationOptions = {
        loop: false,
        autoplay: true,
        animationData: checkInAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
      
      const checkOutAnimationOptions = {
        loop: false,
        autoplay: true,
        animationData: checkOutAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
      
      // Load attendance data
      React.useEffect(() => {
        fetchAttendanceData();
        fetchTodayAttendance();
        
        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (error) => {
              console.error("Error getting location:", error);
            }
          );
        }
      }, [page, selectedDate]);
      
      // Fetch attendance data with pagination
      const fetchAttendanceData = async () => {
        try {
          setLoading(true);
          
          const response = await httpClient.get(API_ENDPOINTS.ATTENDANCE.BASE, {
            page,
            limit: 10,
            date: selectedDate
          });
          
          setAttendanceData(response.data || []);
          setTotalPages(response.pagination?.totalPages || 1);
          
          // Calculate stats
          if (response.data) {
            const stats = response.data.reduce((acc, item) => {
              acc[item.status] = (acc[item.status] || 0) + 1;
              return acc;
            }, {});
            
            setStats({
              present: stats.present || 0,
              absent: stats.absent || 0,
              late: stats.late || 0,
              leave: stats.leave || 0
            });
          }
        } catch (error) {
          console.error("Error fetching attendance data:", error);
          addToast({
            title: "Error",
            description: "Failed to load attendance data",
            color: "danger"
          });
        } finally {
          setLoading(false);
        }
      };
      
      // Fetch today's attendance for current user
      const fetchTodayAttendance = async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          
          const response = await httpClient.get(`${API_ENDPOINTS.ATTENDANCE.BASE}/today`);
          
          setTodayAttendance(response.data || null);
        } catch (error) {
          console.error("Error fetching today's attendance:", error);
          // Don't show error toast for this one
        }
      };
      
      // Handle check-in
      const handleCheckIn = async () => {
        try {
          setIsCheckingIn(true);
          
          const response = await httpClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, {
            note,
            latitude: location?.latitude,
            longitude: location?.longitude
          });
          
          setTodayAttendance(response.data);
          
          addToast({
            title: "Success",
            description: "Checked in successfully",
            color: "success"
          });
          
          onClose();
        } catch (error) {
          console.error("Check-in error:", error);
          addToast({
            title: "Error",
            description: error.message || "Failed to check in",
            color: "danger"
          });
        } finally {
          setIsCheckingIn(false);
        }
      };
      
      // Handle check-out
      const handleCheckOut = async () => {
        try {
          setIsCheckingOut(true);
          
          const response = await httpClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, {
            note,
            latitude: location?.latitude,
            longitude: location?.longitude
          });
          
          setTodayAttendance(response.data);
          
          addToast({
            title: "Success",
            description: "Checked out successfully",
            color: "success"
          });
          
          onClose();
        } catch (error) {
          console.error("Check-out error:", error);
          addToast({
            title: "Error",
            description: error.message || "Failed to check out",
            color: "danger"
          });
        } finally {
          setIsCheckingOut(false);
        }
      };
      
      // Open check-in/out modal
      const openAttendanceModal = (type) => {
        setActionType(type);
        setNote("");
        onOpen();
      };
      
      // Format time
      const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        return format(parseISO(dateString), "hh:mm a");
      };
      
      // Get status color
      const getStatusColor = (status) => {
        const statusColors = {
          present: "success",
          absent: "danger",
          late: "warning",
          leave: "primary"
        };
        
        return statusColors[status] || "default";
      };
      
      return (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
              <p className="text-default-500">Track daily attendance and working hours</p>
            </div>
            <div className="flex gap-2">
              <Button
                color="primary"
                startContent={<Icon icon="lucide:log-in" />}
                onPress={() => openAttendanceModal("check-in")}
                isDisabled={todayAttendance && todayAttendance.check_in}
              >
                Check In
              </Button>
              <Button
                color="success"
                startContent={<Icon icon="lucide:log-out" />}
                onPress={() => openAttendanceModal("check-out")}
                isDisabled={!todayAttendance || !todayAttendance.check_in || todayAttendance.check_out}
              >
                Check Out
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <Icon icon="lucide:check-circle" className="text-2xl text-success" />
                  </div>
                  <div>
                    <p className="text-default-500">Present</p>
                    <h3 className="text-2xl font-bold">{stats.present}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-danger/10">
                    <Icon icon="lucide:x-circle" className="text-2xl text-danger" />
                  </div>
                  <div>
                    <p className="text-default-500">Absent</p>
                    <h3 className="text-2xl font-bold">{stats.absent}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Icon icon="lucide:alert-circle" className="text-2xl text-warning" />
                  </div>
                  <div>
                    <p className="text-default-500">Late</p>
                    <h3 className="text-2xl font-bold">{stats.late}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon icon="lucide:calendar" className="text-2xl text-primary" />
                  </div>
                  <div>
                    <p className="text-default-500">On Leave</p>
                    <h3 className="text-2xl font-bold">{stats.leave}</h3>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
          
          {/* Today's Status Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <h2 className="text-xl font-semibold">Today's Status</h2>
            </CardHeader>
            <CardBody>
              {todayAttendance ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2 text-success">
                      <Icon icon="lucide:check-circle" className="text-4xl" />
                    </div>
                    <p className="text-lg font-medium">Check In</p>
                    <p className="text-2xl font-bold">{formatTime(todayAttendance.check_in)}</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    {todayAttendance.check_out ? (
                      <>
                        <div className="mb-2 text-primary">
                          <Icon icon="lucide:log-out" className="text-4xl" />
                        </div>
                        <p className="text-lg font-medium">Check Out</p>
                        <p className="text-2xl font-bold">{formatTime(todayAttendance.check_out)}</p>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 text-warning">
                          <Icon icon="lucide:clock" className="text-4xl" />
                        </div>
                        <p className="text-lg font-medium">Check Out</p>
                        <p className="text-lg text-default-500">Not checked out yet</p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2 text-info">
                      <Icon icon="lucide:timer" className="text-4xl" />
                    </div>
                    <p className="text-lg font-medium">Working Hours</p>
                    <p className="text-2xl font-bold">
                      {todayAttendance.work_hours ? `${todayAttendance.work_hours} hrs` : "In progress"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4">
                    <Icon icon="lucide:alert-circle" className="text-5xl text-warning" />
                  </div>
                  <p className="text-xl font-medium">Not Checked In Yet</p>
                  <p className="text-default-500 mt-2">Please check in to start your workday</p>
                  <Button 
                    color="primary" 
                    className="mt-4"
                    startContent={<Icon icon="lucide:log-in" />}
                    onPress={() => openAttendanceModal("check-in")}
                  >
                    Check In Now
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
          
          {/* Attendance History */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between">
              <h2 className="text-xl font-semibold">Attendance History</h2>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:max-w-[200px]"
              />
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Spinner size="lg" color="primary" />
                  <p className="mt-4 text-default-500">Loading attendance data...</p>
                </div>
              ) : attendanceData.length > 0 ? (
                <Table 
                  removeWrapper 
                  aria-label="Attendance history table"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={totalPages}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>CHECK IN</TableColumn>
                    <TableColumn>CHECK OUT</TableColumn>
                    <TableColumn>WORKING HOURS</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>LOCATION</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No attendance records found">
                    {attendanceData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(parseISO(record.date), "MMM dd, yyyy")}
                          {isToday(parseISO(record.date)) && (
                            <Chip size="sm" color="primary" variant="flat" className="ml-2">
                              Today
                            </Chip>
                          )}
                        </TableCell>
                        <TableCell>{formatTime(record.check_in)}</TableCell>
                        <TableCell>{formatTime(record.check_out)}</TableCell>
                        <TableCell>
                          {record.work_hours ? `${record.work_hours} hrs` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="sm" 
                            color={getStatusColor(record.status)}
                            variant="flat"
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {record.location_latitude && record.location_longitude ? (
                            <Button 
                              size="sm" 
                              variant="light"
                              startContent={<Icon icon="lucide:map-pin" />}
                              as="a"
                              href={`https://maps.google.com/?q=${record.location_latitude},${record.location_longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Map
                            </Button>
                          ) : (
                            <span className="text-default-400">Not available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4">
                    <Icon icon="lucide:calendar-x" className="text-5xl text-default-300" />
                  </div>
                  <p className="text-xl font-medium">No Records Found</p>
                  <p className="text-default-500 mt-2">No attendance records for the selected date</p>
                </div>
              )}
            </CardBody>
          </Card>
          
          {/* Check In/Out Modal */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    {actionType === "check-in" ? "Check In" : "Check Out"}
                  </ModalHeader>
                  <ModalBody>
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-40 h-40">
                        <Lottie 
                          options={actionType === "check-in" ? checkInAnimationOptions : checkOutAnimationOptions}
                          height={160}
                          width={160}
                        />
                      </div>
                      <p className="text-lg font-medium mt-2">
                        {actionType === "check-in" ? "Ready to start your day?" : "Finished for today?"}
                      </p>
                      <p className="text-default-500 text-center">
                        {actionType === "check-in" 
                          ? "Click the button below to check in and start your workday." 
                          : "Click the button below to check out and end your workday."}
                      </p>
                    </div>
                    
                    <Textarea
                      label="Note (Optional)"
                      placeholder="Add a note about your check-in/out"
                      value={note}
                      onValueChange={setNote}
                      className="mb-4"
                    />
                    
                    {location ? (
                      <div className="flex items-center text-success mb-4">
                        <Icon icon="lucide:check-circle" className="mr-2" />
                        <span>Location access granted</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-warning mb-4">
                        <Icon icon="lucide:alert-triangle" className="mr-2" />
                        <span>Location access not available. Please enable location services.</span>
                      </div>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      color={actionType === "check-in" ? "primary" : "success"}
                      onPress={actionType === "check-in" ? handleCheckIn : handleCheckOut}
                      isLoading={actionType === "check-in" ? isCheckingIn : isCheckingOut}
                    >
                      {actionType === "check-in" ? "Check In" : "Check Out"}
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </motion.div>
      );
    }