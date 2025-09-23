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
      Textarea,
      addToast
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    
    // Sample branches data
    const branchesData = [
      { 
        id: 1, 
        name: "Headquarters", 
        location: "New York, NY",
        address: "123 Main Street, Suite 100",
        city: "New York",
        state: "NY",
        country: "USA",
        zipCode: "10001",
        employees: 85,
        status: "active"
      },
      { 
        id: 2, 
        name: "West Coast Office", 
        location: "San Francisco, CA",
        address: "456 Tech Avenue, Floor 4",
        city: "San Francisco",
        state: "CA",
        country: "USA",
        zipCode: "94105",
        employees: 42,
        status: "active"
      },
      { 
        id: 3, 
        name: "European Branch", 
        location: "London, UK",
        address: "10 Business Square",
        city: "London",
        state: "",
        country: "United Kingdom",
        zipCode: "EC1A 1BB",
        employees: 28,
        status: "active"
      },
      { 
        id: 4, 
        name: "Asia Pacific Office", 
        location: "Singapore",
        address: "88 Market Street, #15-01",
        city: "Singapore",
        state: "",
        country: "Singapore",
        zipCode: "048948",
        employees: 35,
        status: "active"
      },
      { 
        id: 5, 
        name: "Remote Office", 
        location: "Virtual",
        address: "N/A",
        city: "N/A",
        state: "N/A",
        country: "Global",
        zipCode: "N/A",
        employees: 24,
        status: "active"
      },
      { 
        id: 6, 
        name: "Research Center", 
        location: "Boston, MA",
        address: "789 Innovation Drive",
        city: "Boston",
        state: "MA",
        country: "USA",
        zipCode: "02110",
        employees: 18,
        status: "inactive"
      },
    ];
    
    const statusColorMap = {
      active: "success",
      inactive: "danger",
    };
    
    export default function Branches() {
      const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
      const [page, setPage] = React.useState(1);
      const [searchQuery, setSearchQuery] = React.useState("");
      const [selectedBranch, setSelectedBranch] = React.useState(null);
      const [isEditing, setIsEditing] = React.useState(false);
      
      // Form state
      const [formData, setFormData] = React.useState({
        name: "",
        location: "",
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        status: "active"
      });
      
      const rowsPerPage = 5;
      
      // Filter branches based on search
      const filteredBranches = React.useMemo(() => {
        return branchesData.filter(branch => {
          return branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 branch.location.toLowerCase().includes(searchQuery.toLowerCase());
        });
      }, [searchQuery]);
      
      // Calculate pagination
      const pages = Math.ceil(filteredBranches.length / rowsPerPage);
      const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        
        return filteredBranches.slice(start, end);
      }, [page, filteredBranches]);
      
      const handleOpenModal = (branch = null, editing = false) => {
        if (branch) {
          setSelectedBranch(branch);
          setFormData({
            name: branch.name,
            location: branch.location,
            address: branch.address,
            city: branch.city,
            state: branch.state,
            country: branch.country,
            zipCode: branch.zipCode,
            status: branch.status
          });
        } else {
          setSelectedBranch(null);
          setFormData({
            name: "",
            location: "",
            address: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
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
        if (!formData.name || !formData.location) {
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
            description: "Branch updated successfully",
            color: "success",
          });
        } else {
          addToast({
            title: "Success",
            description: "Branch created successfully",
            color: "success",
          });
        }
        
        onClose();
      };
      
      const handleDelete = (id) => {
        addToast({
          title: "Success",
          description: "Branch deleted successfully",
          color: "success",
        });
      };
      
      return (
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Branches</h1>
              <p className="text-default-500">Manage company branches and locations</p>
            </div>
            <div className="flex gap-2">
              <Button 
                color="primary" 
                startContent={<Icon icon="lucide:plus" />} 
                onPress={() => handleOpenModal()}
              >
                Add Branch
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon icon="lucide:building" className="text-2xl text-primary" />
                  </div>
                  <div>
                    <p className="text-default-500">Total Branches</p>
                    <h3 className="text-2xl font-bold">6</h3>
                    <p className="text-primary text-xs flex items-center">
                      <Icon icon="lucide:map-pin" className="mr-1" />
                      Across 4 countries
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <Icon icon="lucide:users" className="text-2xl text-success" />
                  </div>
                  <div>
                    <p className="text-default-500">Total Employees</p>
                    <h3 className="text-2xl font-bold">232</h3>
                    <p className="text-success text-xs flex items-center">
                      <Icon icon="lucide:trending-up" className="mr-1" />
                      Across all branches
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Icon icon="lucide:map" className="text-2xl text-warning" />
                  </div>
                  <div>
                    <p className="text-default-500">Countries</p>
                    <h3 className="text-2xl font-bold">4</h3>
                    <p className="text-warning text-xs flex items-center">
                      <Icon icon="lucide:globe" className="mr-1" />
                      Global presence
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-danger/10">
                    <Icon icon="lucide:building-2" className="text-2xl text-danger" />
                  </div>
                  <div>
                    <p className="text-default-500">Inactive Branches</p>
                    <h3 className="text-2xl font-bold">1</h3>
                    <p className="text-danger text-xs flex items-center">
                      <Icon icon="lucide:alert-circle" className="mr-1" />
                      Temporarily closed
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
                placeholder="Search branches..."
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="w-full sm:max-w-[44%]"
              />
            </CardHeader>
            <CardBody>
              <Table 
                removeWrapper 
                aria-label="Branches table"
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
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>LOCATION</TableColumn>
                  <TableColumn>EMPLOYEES</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No branches found">
                  {items.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon icon="lucide:building" className="text-lg text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{branch.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Icon icon="lucide:map-pin" className="text-default-400" />
                          <span>{branch.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{branch.employees}</TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          color={statusColorMap[branch.status]}
                          variant="flat"
                        >
                          {branch.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light"
                            onPress={() => handleOpenModal(branch, false)}
                          >
                            <Icon icon="lucide:eye" className="text-default-500" />
                          </Button>
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light"
                            onPress={() => handleOpenModal(branch, true)}
                          >
                            <Icon icon="lucide:edit" className="text-default-500" />
                          </Button>
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light"
                            onPress={() => handleDelete(branch.id)}
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
          
          {/* Branch Modal */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    {isEditing ? "Edit Branch" : selectedBranch ? "Branch Details" : "Add Branch"}
                  </ModalHeader>
                  <ModalBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Branch Name"
                        placeholder="Enter branch name"
                        value={formData.name}
                        onValueChange={(value) => handleInputChange("name", value)}
                        isReadOnly={!isEditing && selectedBranch}
                        isRequired
                      />
                      <Input
                        label="Location"
                        placeholder="Enter location"
                        value={formData.location}
                        onValueChange={(value) => handleInputChange("location", value)}
                        isReadOnly={!isEditing && selectedBranch}
                        isRequired
                      />
                      <Textarea
                        label="Address"
                        placeholder="Enter address"
                        value={formData.address}
                        onValueChange={(value) => handleInputChange("address", value)}
                        isReadOnly={!isEditing && selectedBranch}
                        className="col-span-1 md:col-span-2"
                      />
                      <Input
                        label="City"
                        placeholder="Enter city"
                        value={formData.city}
                        onValueChange={(value) => handleInputChange("city", value)}
                        isReadOnly={!isEditing && selectedBranch}
                      />
                      <Input
                        label="State/Province"
                        placeholder="Enter state/province"
                        value={formData.state}
                        onValueChange={(value) => handleInputChange("state", value)}
                        isReadOnly={!isEditing && selectedBranch}
                      />
                      <Input
                        label="Country"
                        placeholder="Enter country"
                        value={formData.country}
                        onValueChange={(value) => handleInputChange("country", value)}
                        isReadOnly={!isEditing && selectedBranch}
                      />
                      <Input
                        label="Zip/Postal Code"
                        placeholder="Enter zip/postal code"
                        value={formData.zipCode}
                        onValueChange={(value) => handleInputChange("zipCode", value)}
                        isReadOnly={!isEditing && selectedBranch}
                      />
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                      {!isEditing && selectedBranch ? "Close" : "Cancel"}
                    </Button>
                    {(isEditing || !selectedBranch) && (
                      <Button color="primary" onPress={handleSubmit}>
                        {isEditing ? "Update" : "Create"}
                      </Button>
                    )}
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      );
    }