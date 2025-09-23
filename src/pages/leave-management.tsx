import React from "react";
    import { 
      Card, 
      CardBody, 
      CardHeader,
      CardFooter,
      Button,
      Table,
      TableHeader,
      TableColumn,
      TableBody,
      TableRow,
      TableCell,
      Avatar,
      Chip,
      Input,
      Dropdown,
      DropdownTrigger,
      DropdownMenu,
      DropdownItem,
      Pagination,
      Modal,
      ModalContent,
      ModalHeader,
      ModalBody,
      ModalFooter,
      useDisclosure,
      DatePicker,
      Textarea,
      Select,
      SelectItem,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    import { parseDate } from "@internationalized/date";
    import { useDateFormatter } from "@react-aria/i18n";
    
    const formatDate = (dateString) => {
      const formatter = useDateFormatter({ dateStyle: 'medium' });
      return formatter.format(new Date(dateString));
    };
    
    // Sample leave data
    const leaveApplications = [
      { 
        id: 1, 
        employeeId: "EMP001", 
        employeeName: "Tony Reichert", 
        leaveType: "Annual Leave", 
        startDate: "2023-07-15", 
        endDate: "2023-07-20", 
        days: 6,
        reason: "Family vacation",
        status: "approved",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1"
      },
      { 
        id: 2, 
        employeeId: "EMP002", 
        employeeName: "Zoey Lang", 
        leaveType: "Sick Leave", 
        startDate: "2023-07-12", 
        endDate: "2023-07-13", 
        days: 2,
        reason: "Not feeling well",
        status: "approved",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2"
      },
      { 
        id: 3, 
        employeeId: "EMP003", 
        employeeName: "Jane Doe", 
        leaveType: "Annual Leave", 
        startDate: "2023-07-25", 
        endDate: "2023-07-28", 
        days: 4,
        reason: "Personal time off",
        status: "pending",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3"
      },
      { 
        id: 4, 
        employeeId: "EMP004", 
        employeeName: "William Smith", 
        leaveType: "Sick Leave", 
        startDate: "2023-07-10", 
        endDate: "2023-07-10", 
        days: 1,
        reason: "Doctor's appointment",
        status: "approved",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4"
      },
      { 
        id: 5, 
        employeeId: "EMP005", 
        employeeName: "Emma Wilson", 
        leaveType: "Maternity Leave", 
        startDate: "2023-08-01", 
        endDate: "2023-11-01", 
        days: 92,
        reason: "Maternity leave",
        status: "pending",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5"
      },
      { 
        id: 6, 
        employeeId: "EMP006", 
        employeeName: "Michael Brown", 
        leaveType: "Unpaid Leave", 
        startDate: "2023-07-18", 
        endDate: "2023-07-19", 
        days: 2,
        reason: "Personal reasons",
        status: "rejected",
        avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=6"
      },
    ];
    
    const leaveTypes = [
      { id: 1, name: "Annual Leave", daysAllowed: 20, isPaid: true },
      { id: 2, name: "Sick Leave", daysAllowed: 10, isPaid: true },
      { id: 3, name: "Maternity Leave", daysAllowed: 90, isPaid: true },
      { id: 4, name: "Paternity Leave", daysAllowed: 14, isPaid: true },
      { id: 5, name: "Unpaid Leave", daysAllowed: 30, isPaid: false },
    ];
    
    const statusColorMap = {
      approved: "success",
      pending: "warning",
      rejected: "danger",
    };
    
    export default function LeaveManagement() {
      const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
      const [page, setPage] = React.useState(1);
      const [searchQuery, setSearchQuery] = React.useState("");
      const [selectedStatus, setSelectedStatus] = React.useState("all");
      const [selectedLeaveType, setSelectedLeaveType] = React.useState("");
      const [startDate, setStartDate] = React.useState(parseDate(new Date().toISOString().split('T')[0]));
      const [endDate, setEndDate] = React.useState(parseDate(new Date().toISOString().split('T')[0]));
      const [reason, setReason] = React.useState("");
      
      const rowsPerPage = 5;
      
      // Filter leave applications based on search and filters
      const filteredApplications = React.useMemo(() => {
        return leaveApplications.filter(application => {
          // Search filter
          const matchesSearch = 
            application.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            application.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            application.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Status filter
          const matchesStatus = 
            selectedStatus === "all" || 
            application.status.toLowerCase() === selectedStatus.toLowerCase();
          
          return matchesSearch && matchesStatus;
        });
      }, [searchQuery, selectedStatus]);
      
      // Calculate pagination
      const pages = Math.ceil(filteredApplications.length / rowsPerPage);
      const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        
        return filteredApplications.slice(start, end);
      }, [page, filteredApplications]);
      
      // Get unique statuses for filter
      const statuses = React.useMemo(() => {
        return ["all", ...new Set(leaveApplications.map(app => app.status.toLowerCase()))];
      }, []);
      
      const handleApplyLeave = () => {
        addToast({
          title: "Leave Application Submitted",
          description: "Your leave application has been submitted successfully",
          color: "success",
        });
        onClose();
      };
      
      const handleApproveReject = (id, action) => {
        addToast({
          title: action === "approve" ? "Leave Approved" : "Leave Rejected",
          description: `Leave application has been ${action === "approve" ? "approved" : "rejected"} successfully`,
          color: action === "approve" ? "success" : "danger",
        });
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
              <h1 className="text-2xl font-bold">Leave Management</h1>
              <p className="text-default-500">Manage employee leave applications</p>
            </div>
            <div className="flex gap-2">
              <Button color="primary" startContent={<Icon icon="lucide:plus" />} onPress={onOpen}>
                Apply Leave
              </Button>
              <Button variant="flat" startContent={<Icon icon="lucide:calendar" />}>
                Leave Calendar
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
                    <p className="text-default-500">Approved</p>
                    <h3 className="text-2xl font-bold">24</h3>
                    <p className="text-success text-xs flex items-center">
                      <Icon icon="lucide:trending-up" className="mr-1" />
                      67% of total
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Icon icon="lucide:clock" className="text-2xl text-warning" />
                  </div>
                  <div>
                    <p className="text-default-500">Pending</p>
                    <h3 className="text-2xl font-bold">8</h3>
                    <p className="text-warning text-xs flex items-center">
                      <Icon icon="lucide:minus" className="mr-1" />
                      22% of total
                    </p>
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
                    <p className="text-default-500">Rejected</p>
                    <h3 className="text-2xl font-bold">4</h3>
                    <p className="text-danger text-xs flex items-center">
                      <Icon icon="lucide:trending-down" className="mr-1" />
                      11% of total
                    </p>
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
                    <p className="text-default-500">Leave Balance</p>
                    <h3 className="text-2xl font-bold">14</h3>
                    <p className="text-primary text-xs flex items-center">
                      <Icon icon="lucide:info" className="mr-1" />
                      Annual leave days
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between">
              <Input
                isClearable
                placeholder="Search by name, ID or leave type..."
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="w-full sm:max-w-[44%]"
              />
              <div className="flex gap-3">
                <Dropdown>
                  <DropdownTrigger>
                    <Button 
                      variant="flat" 
                      endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
                    >
                      Status: {selectedStatus === "all" ? "All" : selectedStatus}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu 
                    aria-label="Status filter"
                    onAction={(key) => setSelectedStatus(key.toString())}
                    selectedKeys={[selectedStatus]}
                    selectionMode="single"
                  >
                    {statuses.map((status) => (
                      <DropdownItem key={status} textValue={status}>
                        {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardHeader>
            <CardBody>
              <Table 
                removeWrapper 
                aria-label="Leave applications table"
                bottomContent={
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={pages}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                }
              >
                <TableHeader>
                  <TableColumn>EMPLOYEE</TableColumn>
                  <TableColumn>LEAVE TYPE</TableColumn>
                  <TableColumn>DURATION</TableColumn>
                  <TableColumn>DAYS</TableColumn>
                  <TableColumn>REASON</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No leave applications found">
                  {items.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar src={application.avatar} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{application.employeeName}</p>
                            <p className="text-xs text-default-500">{application.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{application.leaveType}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs">From: {formatDate(application.startDate)}</p>
                          <p className="text-xs">To: {formatDate(application.endDate)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{application.days}</TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[150px]">{application.reason}</p>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          color={statusColorMap[application.status]}
                          variant="flat"
                        >
                          {application.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {application.status === "pending" && (
                            <>
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="flat" 
                                color="success"
                                onPress={() => handleApproveReject(application.id, "approve")}
                              >
                                <Icon icon="lucide:check" />
                              </Button>
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="flat" 
                                color="danger"
                                onPress={() => handleApproveReject(application.id, "reject")}
                              >
                                <Icon icon="lucide:x" />
                              </Button>
                            </>
                          )}
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="lucide:eye" className="text-default-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
          
          {/* Apply Leave Modal */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Apply for Leave</ModalHeader>
                  <ModalBody>
                    <div className="space-y-4">
                      <Select 
                        label="Leave Type" 
                        placeholder="Select leave type"
                        selectedKeys={selectedLeaveType ? [selectedLeaveType] : []}
                        onChange={(e) => setSelectedLeaveType(e.target.value)}
                      >
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.daysAllowed} days)
                          </SelectItem>
                        ))}
                      </Select>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DatePicker 
                          label="Start Date"
                          value={startDate}
                          onChange={setStartDate}
                        />
                        <DatePicker 
                          label="End Date"
                          value={endDate}
                          onChange={setEndDate}
                        />
                      </div>
                      
                      <Textarea
                        label="Reason"
                        placeholder="Enter reason for leave"
                        value={reason}
                        onValueChange={setReason}
                      />
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" onPress={handleApplyLeave}>
                      Submit Application
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </motion.div>
      );
    }