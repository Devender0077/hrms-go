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
      Switch,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    
    // Sample leave types data
    const leaveTypesData = [
      { 
        id: 1, 
        name: "Annual Leave", 
        days: 20,
        requiresApproval: true,
        isPaid: true,
        status: "active"
      },
      { 
        id: 2, 
        name: "Sick Leave", 
        days: 10,
        requiresApproval: true,
        isPaid: true,
        status: "active"
      },
      { 
        id: 3, 
        name: "Maternity Leave", 
        days: 90,
        requiresApproval: true,
        isPaid: true,
        status: "active"
      },
      { 
        id: 4, 
        name: "Paternity Leave", 
        days: 14,
        requiresApproval: true,
        isPaid: true,
        status: "active"
      },
      { 
        id: 5, 
        name: "Unpaid Leave", 
        days: 30,
        requiresApproval: true,
        isPaid: false,
        status: "active"
      },
      { 
        id: 6, 
        name: "Bereavement Leave", 
        days: 5,
        requiresApproval: true,
        isPaid: true,
        status: "active"
      },
      { 
        id: 7, 
        name: "Study Leave", 
        days: 10,
        requiresApproval: true,
        isPaid: false,
        status: "inactive"
      }
    ];
    
    const statusColorMap = {
      active: "success",
      inactive: "danger",
    };
    
    export default function LeaveType() {
      const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
      const [page, setPage] = React.useState(1);
      const [searchQuery, setSearchQuery] = React.useState("");
      const [selectedLeaveType, setSelectedLeaveType] = React.useState(null);
      const [isEditing, setIsEditing] = React.useState(false);
      
      // Form state
      const [formData, setFormData] = React.useState({
        name: "",
        days: "",
        requiresApproval: true,
        isPaid: true,
        status: "active"
      });
      
      const rowsPerPage = 5;
      
      // Filter leave types based on search
      const filteredLeaveTypes = React.useMemo(() => {
        return leaveTypesData.filter(leaveType => {
          return leaveType.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
      }, [searchQuery]);
      
      // Calculate pagination
      const pages = Math.ceil(filteredLeaveTypes.length / rowsPerPage);
      const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        
        return filteredLeaveTypes.slice(start, end);
      }, [page, filteredLeaveTypes]);
      
      const handleOpenModal = (leaveType = null, editing = false) => {
        if (leaveType) {
          setSelectedLeaveType(leaveType);
          setFormData({
            name: leaveType.name,
            days: leaveType.days.toString(),
            requiresApproval: leaveType.requiresApproval,
            isPaid: leaveType.isPaid,
            status: leaveType.status
          });
        } else {
          setSelectedLeaveType(null);
          setFormData({
            name: "",
            days: "",
            requiresApproval: true,
            isPaid: true,
            status: "active"
          });
        }
        setIsEditing(editing);
        onOpen();
      };
      
      const handleInputChange = (field, value) => {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      };
      
      const handleSubmit = () => {
        // Validate form
        if (!formData.name || !formData.days) {
          addToast({
            title: "Error",
            description: "Please fill in all required fields",
            color: "danger",
          });
          return;
        }
        
        // Handle form submission (create or update)
        if (isEditing) {
          addToast({
            title: "Success",
            description: "Leave type updated successfully",
            color: "success",
          });
        } else {
          addToast({
            title: "Success",
            description: "Leave type created successfully",
            color: "success",
          });
        }
        
        onClose();
      };
      
      const handleDelete = (id) => {
        addToast({
          title: "Success",
          description: "Leave type deleted successfully",
          color: "success",
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
              <h1 className="text-2xl font-bold">Leave Types</h1>
              <p className="text-default-500">Manage leave types and policies</p>
            </div>
            <div className="flex gap-2">
              <Button 
                color="primary" variant="solid" 
                startContent={<Icon icon="$1" />} 
                onPress={() => handleOpenModal()}
              >
                Add Leave Type
              </Button>
            </div>
          </div>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between">
              <Input
                isClearable
                placeholder="Search leave types..."
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                
                onValueChange={setSearchQuery}
                className="w-full sm:max-w-[44%]"
              />
            </CardHeader>
            <CardBody>
              <Table 
                removeWrapper 
                aria-label="Leave types table"
                bottomContent={
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary" variant="flat"
                      page={page}
                      total={pages}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                }
              >
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>DAYS</TableColumn>
                  <TableColumn>REQUIRES APPROVAL</TableColumn>
                  <TableColumn>PAID</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No leave types found">
                  {items.map((leaveType) => (
                    <TableRow key={leaveType.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon icon="lucide:calendar-off" className="text-lg text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{leaveType.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{leaveType.days} days</TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          color={leaveType.requiresApproval ? "primary" : "default"}
                          variant="solid"
                        >
                          {leaveType.requiresApproval ? "Yes" : "No"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          color={leaveType.isPaid ? "success" : "warning"}
                          variant="solid"
                        >
                          {leaveType.isPaid ? "Paid" : "Unpaid"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          color={statusColorMap[leaveType.status]}
                          variant="solid"
                        >
                          {leaveType.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="ghost"
                            onPress={() => handleOpenModal(leaveType, false)}
                          >
                            <Icon icon="lucide:eye" className="text-default-500" />
                          </Button>
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="ghost"
                            onPress={() => handleOpenModal(leaveType, true)}
                          >
                            <Icon icon="lucide:edit" className="text-default-500" />
                          </Button>
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="ghost"
                            onPress={() => handleDelete(leaveType.id)}
                          >
                            <Icon icon="lucide:trash" className="text-danger" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
          
          {/* Leave Type Modal */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    {isEditing ? "Edit Leave Type" : selectedLeaveType ? "Leave Type Details" : "Add Leave Type"}
                  </ModalHeader>
                  <ModalBody>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Leave Type Name"
                        placeholder="Enter leave type name"
                        
                        onValueChange={(value) => handleInputChange("name", value)}
                        isReadOnly={!isEditing && selectedLeaveType}
                        isRequired
                      />
                      
                      <Input
                        label="Days Allowed"
                        placeholder="Enter number of days"
                        type="number"
                        
                        onValueChange={(value) => handleInputChange("days", value)}
                        isReadOnly={!isEditing && selectedLeaveType}
                        isRequired
                      />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Requires Approval</p>
                          <p className="text-xs text-default-500">Leave requests require manager approval</p>
                        </div>
                        <Switch
                          isSelected={formData.requiresApproval}
                          onValueChange={(value) => handleInputChange("requiresApproval", value)}
                          isDisabled={!isEditing && selectedLeaveType}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Paid Leave</p>
                          <p className="text-xs text-default-500">Employee receives pay during leave</p>
                        </div>
                        <Switch
                          isSelected={formData.isPaid}
                          onValueChange={(value) => handleInputChange("isPaid", value)}
                          isDisabled={!isEditing && selectedLeaveType}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-xs text-default-500">Active or inactive</p>
                        </div>
                        <Switch
                          isSelected={formData.status === "active"}
                          onValueChange={(value) => handleInputChange("status", value ? "active" : "inactive")}
                          isDisabled={!isEditing && selectedLeaveType}
                        />
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="solid" onPress={onClose} className="font-medium">
                      {!isEditing && selectedLeaveType ? "Close" : "Cancel"}
                    </Button>
                    {(isEditing || !selectedLeaveType) && (
                      <Button color="primary" variant="solid" onPress={handleSubmit} className="font-medium">
                        {isEditing ? "Update" : "Create"}
                      </Button>
                    )}
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </motion.div>
      );
    }