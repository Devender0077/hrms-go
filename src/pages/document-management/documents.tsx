// Create a new document management page with validation and reminders
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
      Select,
      SelectItem,
      Textarea,
      addToast,
      Spinner,
      Avatar,
      Checkbox,
      Tooltip
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import { motion } from "framer-motion";
    import { documentAPI } from "../../services/api-service";
    
    // Document categories
    const documentCategories = [
      { id: 1, name: "ID Proof" },
      { id: 2, name: "Address Proof" },
      { id: 3, name: "Educational" },
      { id: 4, name: "Professional" },
      { id: 5, name: "Contract" },
      { id: 6, name: "Policy" },
      { id: 7, name: "Certificate" },
      { id: 8, name: "Other" }
    ];
    
    // Sample documents data (would come from API in real implementation)
    const documentsData = [
      { 
        id: 1, 
        title: "Employee Handbook", 
        category: "Policy",
        description: "Company policies and guidelines for employees",
        uploadedBy: "John Doe",
        uploadDate: "2023-05-15",
        expiryDate: "2024-05-15",
        fileType: "pdf",
        fileSize: "2.4 MB",
        status: "active"
      },
      { 
        id: 2, 
        title: "Employment Contract - Jane Smith", 
        category: "Contract",
        description: "Employment agreement for Jane Smith",
        uploadedBy: "William Anderson",
        uploadDate: "2023-02-10",
        expiryDate: "2024-02-10",
        fileType: "pdf",
        fileSize: "1.8 MB",
        status: "active"
      },
      { 
        id: 3, 
        title: "Health Insurance Policy", 
        category: "Policy",
        description: "Health insurance coverage details for employees",
        uploadedBy: "John Doe",
        uploadDate: "2023-01-20",
        expiryDate: "2023-12-31",
        fileType: "pdf",
        fileSize: "3.2 MB",
        status: "expiring_soon"
      },
      { 
        id: 4, 
        title: "Office Lease Agreement", 
        category: "Contract",
        description: "Lease agreement for the headquarters office",
        uploadedBy: "Robert Miller",
        uploadDate: "2022-11-05",
        expiryDate: "2023-11-05",
        fileType: "pdf",
        fileSize: "4.5 MB",
        status: "expiring_soon"
      },
      { 
        id: 5, 
        title: "ISO 9001 Certificate", 
        category: "Certificate",
        description: "Quality management system certification",
        uploadedBy: "John Doe",
        uploadDate: "2022-09-18",
        expiryDate: "2023-09-18",
        fileType: "pdf",
        fileSize: "1.2 MB",
        status: "expired"
      },
      { 
        id: 6, 
        title: "Data Protection Policy", 
        category: "Policy",
        description: "Guidelines for handling sensitive data",
        uploadedBy: "William Anderson",
        uploadDate: "2023-03-25",
        expiryDate: null,
        fileType: "docx",
        fileSize: "1.5 MB",
        status: "active"
      },
      { 
        id: 7, 
        title: "Employee ID Card Template", 
        category: "ID Proof",
        description: "Template for employee identification cards",
        uploadedBy: "Jane Smith",
        uploadDate: "2023-04-12",
        expiryDate: null,
        fileType: "psd",
        fileSize: "8.7 MB",
        status: "active"
      },
      { 
        id: 8, 
        title: "Software License Agreement", 
        category: "Contract",
        description: "License agreement for company software",
        uploadedBy: "Robert Miller",
        uploadDate: "2023-06-08",
        expiryDate: "2024-06-08",
        fileType: "pdf",
        fileSize: "2.1 MB",
        status: "active"
      },
    ];
    
    const statusColorMap = {
      active: "success",
      expiring_soon: "warning",
      expired: "danger",
    };
    
    const statusNameMap = {
      active: "Active",
      expiring_soon: "Expiring Soon",
      expired: "Expired",
    };
    
    const fileIconMap = {
      pdf: "lucide:file-text",
      docx: "lucide:file",
      doc: "lucide:file",
      xlsx: "lucide:file-spreadsheet",
      xls: "lucide:file-spreadsheet",
      ppt: "lucide:file-presentation",
      pptx: "lucide:file-presentation",
      jpg: "lucide:image",
      jpeg: "lucide:image",
      png: "lucide:image",
      gif: "lucide:image",
      zip: "lucide:file-archive",
      rar: "lucide:file-archive",
      psd: "lucide:layers",
      default: "lucide:file"
    };
    
    export default function Documents() {
      const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
      const [page, setPage] = React.useState(1);
      const [searchQuery, setSearchQuery] = React.useState("");
      const [selectedCategory, setSelectedCategory] = React.useState("all");
      const [selectedStatus, setSelectedStatus] = React.useState("all");
      const [selectedDocument, setSelectedDocument] = React.useState(null);
      const [isEditing, setIsEditing] = React.useState(false);
      const [isUploading, setIsUploading] = React.useState(false);
      const [loading, setLoading] = React.useState(false);
      const [expiringDocuments, setExpiringDocuments] = React.useState([]);
      const fileInputRef = React.useRef(null);
      
      // Form state
      const [formData, setFormData] = React.useState({
        title: "",
        category: "",
        description: "",
        expiryDate: "",
        file: null,
        sendReminders: true
      });
      
      const rowsPerPage = 5;
      
      // Load data on component mount
      React.useEffect(() => {
        // Simulate API call to fetch documents
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          
          // Find documents expiring in the next 30 days
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);
          
          const expiring = documentsData.filter(doc => {
            if (!doc.expiryDate) return false;
            const expiryDate = new Date(doc.expiryDate);
            return expiryDate > today && expiryDate <= thirtyDaysFromNow;
          });
          
          setExpiringDocuments(expiring);
          
          // Show notification for expiring documents
          if (expiring.length > 0) {
            addToast({
              title: "Document Expiry Alert",
              description: `${expiring.length} document(s) will expire in the next 30 days.`,
              color: "warning",
            });
          }
        }, 1000);
      }, []);
      
      // Filter documents based on search and filters
      const filteredDocuments = React.useMemo(() => {
        return documentsData.filter(document => {
          // Search filter
          const matchesSearch = 
            document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            document.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            document.category.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Category filter
          const matchesCategory = 
            selectedCategory === "all" || 
            document.category.toLowerCase() === selectedCategory.toLowerCase();
          
          // Status filter
          const matchesStatus = 
            selectedStatus === "all" || 
            document.status === selectedStatus;
          
          return matchesSearch && matchesCategory && matchesStatus;
        });
      }, [searchQuery, selectedCategory, selectedStatus]);
      
      // Calculate pagination
      const pages = Math.ceil(filteredDocuments.length / rowsPerPage);
      const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        
        return filteredDocuments.slice(start, end);
      }, [page, filteredDocuments]);
      
      const handleOpenModal = (document = null, editing = false) => {
        if (document) {
          setSelectedDocument(document);
          setFormData({
            title: document.title,
            category: document.category,
            description: document.description,
            expiryDate: document.expiryDate || "",
            file: null,
            sendReminders: true
          });
        } else {
          setSelectedDocument(null);
          setFormData({
            title: "",
            category: "",
            description: "",
            expiryDate: "",
            file: null,
            sendReminders: true
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
      
      const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
          setFormData(prev => ({
            ...prev,
            file: e.target.files[0]
          }));
        }
      };
      
      const handleSubmit = () => {
        // Validate form
        if (!formData.title || !formData.category) {
          addToast({
            title: "Error",
            description: "Please fill in all required fields",
            color: "danger",
          });
          return;
        }
        
        if (!selectedDocument && !formData.file) {
          addToast({
            title: "Error",
            description: "Please upload a file",
            color: "danger",
          });
          return;
        }
        
        // Simulate file upload
        setIsUploading(true);
        
        // In a real implementation, this would be an API call
        setTimeout(() => {
          setIsUploading(false);
          
          // Handle form submission (create or update)
          if (isEditing) {
            addToast({
              title: "Success",
              description: "Document updated successfully",
              color: "success",
            });
          } else {
            addToast({
              title: "Success",
              description: "Document uploaded successfully",
              color: "success",
            });
          }
          
          onClose();
        }, 2000);
      };
      
      const handleDelete = (id) => {
        // In a real implementation, this would be an API call
        addToast({
          title: "Success",
          description: "Document deleted successfully",
          color: "success",
        });
      };
      
      const handleSendReminder = (document) => {
        // In a real implementation, this would be an API call to send a reminder
        addToast({
          title: "Success",
          description: `Reminder sent for document: ${document.title}`,
          color: "success",
        });
      };
      
      const handleDownload = (document) => {
        // In a real implementation, this would download the file
        addToast({
          title: "Downloading",
          description: `Downloading ${document.title}...`,
          color: "primary",
        });
      };
      
      const getFileIcon = (fileType) => {
        return fileIconMap[fileType] || fileIconMap.default;
      };
      
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
      };
      
      const getDaysUntilExpiry = (expiryDate) => {
        if (!expiryDate) return null;
        
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
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
              <h1 className="text-2xl font-bold">Document Management</h1>
              <p className="text-default-500">Manage and organize company documents</p>
            </div>
            <div className="flex gap-2">
              <Button 
                color="primary" 
                startContent={<Icon icon="lucide:upload" />} 
                onPress={() => handleOpenModal()}
              >
                Upload Document
              </Button>
            </div>
          </div>
          
          {/* Expiring Documents Alert */}
          {expiringDocuments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-warning-50 border-warning-200 border">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-warning-100">
                      <Icon icon="lucide:alert-triangle" className="text-xl text-warning" />
                    </div>
                    <div>
                      <h3 className="font-medium">Documents Expiring Soon</h3>
                      <p className="text-sm text-default-600">
                        {expiringDocuments.length} document(s) will expire in the next 30 days.
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="flat" 
                      color="warning" 
                      className="ml-auto"
                      onPress={() => setSelectedStatus("expiring_soon")}
                    >
                      View Documents
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon icon="lucide:file" className="text-2xl text-primary" />
                  </div>
                  <div>
                    <p className="text-default-500">Total Documents</p>
                    <h3 className="text-2xl font-bold">{documentsData.length}</h3>
                    <p className="text-primary text-xs flex items-center">
                      <Icon icon="lucide:hard-drive" className="mr-1" />
                      {documentsData.reduce((acc, doc) => acc + parseFloat(doc.fileSize), 0).toFixed(1)} MB
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <Icon icon="lucide:check-circle" className="text-2xl text-success" />
                  </div>
                  <div>
                    <p className="text-default-500">Active Documents</p>
                    <h3 className="text-2xl font-bold">
                      {documentsData.filter(doc => doc.status === "active").length}
                    </h3>
                    <p className="text-success text-xs flex items-center">
                      <Icon icon="lucide:check" className="mr-1" />
                      Valid and up-to-date
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Icon icon="lucide:alert-triangle" className="text-2xl text-warning" />
                  </div>
                  <div>
                    <p className="text-default-500">Expiring Soon</p>
                    <h3 className="text-2xl font-bold">
                      {documentsData.filter(doc => doc.status === "expiring_soon").length}
                    </h3>
                    <p className="text-warning text-xs flex items-center">
                      <Icon icon="lucide:clock" className="mr-1" />
                      Expiring in next 30 days
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
                    <p className="text-default-500">Expired Documents</p>
                    <h3 className="text-2xl font-bold">
                      {documentsData.filter(doc => doc.status === "expired").length}
                    </h3>
                    <p className="text-danger text-xs flex items-center">
                      <Icon icon="lucide:alert-circle" className="mr-1" />
                      Require renewal
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
                placeholder="Search documents..."
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="w-full sm:max-w-[44%]"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  placeholder="Filter by category"
                  selectedKeys={[selectedCategory]}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:max-w-[200px]"
                >
                  <SelectItem key="all" value="all">All Categories</SelectItem>
                  {documentCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by status"
                  selectedKeys={[selectedStatus]}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full sm:max-w-[200px]"
                >
                  <SelectItem key="all" value="all">All Statuses</SelectItem>
                  <SelectItem key="active" value="active">Active</SelectItem>
                  <SelectItem key="expiring_soon" value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem key="expired" value="expired">Expired</SelectItem>
                </Select>
              </div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Spinner size="lg" color="primary" />
                  <p className="mt-4 text-default-500">Loading documents...</p>
                </div>
              ) : (
                <Table 
                  removeWrapper 
                  aria-label="Documents table"
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
                    <TableColumn>DOCUMENT</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                    <TableColumn>UPLOADED BY</TableColumn>
                    <TableColumn>EXPIRY DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No documents found">
                    {items.map((document) => {
                      const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
                      
                      return (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-default-100">
                                <Icon icon={getFileIcon(document.fileType)} className="text-lg text-default-500" />
                              </div>
                              <div>
                                <p className="font-medium">{document.title}</p>
                                <p className="text-xs text-default-500 truncate max-w-[250px]">
                                  {document.description}
                                </p>
                                <p className="text-xs text-default-400">
                                  {document.fileType.toUpperCase()} • {document.fileSize}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{document.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar 
                                size="sm" 
                                name={document.uploadedBy} 
                                src={`https://img.heroui.chat/image/avatar?w=150&h=150&u=${document.id}`}
                              />
                              <span>{document.uploadedBy}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {document.expiryDate ? (
                              <div>
                                <p>{formatDate(document.expiryDate)}</p>
                                {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                                  <p className={`text-xs ${
                                    daysUntilExpiry <= 30 ? "text-warning" : "text-default-500"
                                  }`}>
                                    {daysUntilExpiry} days remaining
                                  </p>
                                )}
                                {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
                                  <p className="text-xs text-danger">
                                    Expired {Math.abs(daysUntilExpiry)} days ago
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-default-400">No expiry</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="sm" 
                              color={statusColorMap[document.status]}
                              variant="flat"
                            >
                              {statusNameMap[document.status]}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light"
                                onPress={() => handleDownload(document)}
                              >
                                <Icon icon="lucide:download" className="text-default-500" />
                              </Button>
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light"
                                onPress={() => handleOpenModal(document, false)}
                              >
                                <Icon icon="lucide:eye" className="text-default-500" />
                              </Button>
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light"
                                onPress={() => handleOpenModal(document, true)}
                              >
                                <Icon icon="lucide:edit" className="text-default-500" />
                              </Button>
                              {(document.status === "expiring_soon" || document.status === "expired") && (
                                <Button 
                                  isIconOnly 
                                  size="sm" 
                                  variant="light"
                                  onPress={() => handleSendReminder(document)}
                                >
                                  <Icon icon="lucide:bell" className="text-warning" />
                                </Button>
                              )}
                              <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light"
                                onPress={() => handleDelete(document.id)}
                              >
                                <Icon icon="lucide:trash" className="text-danger" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
          
          {/* Document Modal */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    {isEditing ? "Edit Document" : selectedDocument ? "Document Details" : "Upload Document"}
                  </ModalHeader>
                  <ModalBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Document Title"
                        placeholder="Enter document title"
                        value={formData.title}
                        onValueChange={(value) => handleInputChange("title", value)}
                        isReadOnly={!isEditing && selectedDocument}
                        isRequired
                        className="col-span-1 md:col-span-2"
                      />
                      
                      <Select
                        label="Category"
                        placeholder="Select category"
                        selectedKeys={formData.category ? [formData.category] : []}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        isDisabled={!isEditing && selectedDocument}
                        isRequired
                      >
                        {documentCategories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </Select>
                      
                      <Input
                        label="Expiry Date"
                        placeholder="Select expiry date"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        isReadOnly={!isEditing && selectedDocument}
                      />
                      
                      <Textarea
                        label="Description"
                        placeholder="Enter document description"
                        value={formData.description}
                        onValueChange={(value) => handleInputChange("description", value)}
                        isReadOnly={!isEditing && selectedDocument}
                        className="col-span-1 md:col-span-2"
                      />
                      
                      {(!selectedDocument || isEditing) && (
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-sm mb-2">Upload File</p>
                          <div className="border-2 border-dashed border-default-200 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            {formData.file ? (
                              <div className="flex flex-col items-center">
                                <Icon icon={getFileIcon(formData.file.name.split('.').pop())} className="text-4xl text-primary mb-2" />
                                <p className="font-medium">{formData.file.name}</p>
                                <p className="text-xs text-default-500">{(formData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="danger"
                                  className="mt-2"
                                  onPress={() => handleInputChange("file", null)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Icon icon="lucide:upload-cloud" className="text-4xl text-default-400 mx-auto mb-2" />
                                <p className="text-default-600">Click to upload or drag and drop</p>
                                <p className="text-xs text-default-500 mt-1">PDF, DOCX, XLSX, JPG, PNG (Max 10MB)</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {selectedDocument && !isEditing && (
                        <div className="col-span-1 md:col-span-2 border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Icon icon={getFileIcon(selectedDocument.fileType)} className="text-3xl text-primary" />
                            <div>
                              <p className="font-medium">{selectedDocument.title}.{selectedDocument.fileType}</p>
                              <p className="text-xs text-default-500">{selectedDocument.fileSize}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              startContent={<Icon icon="lucide:download" />}
                              className="ml-auto"
                              onPress={() => handleDownload(selectedDocument)}
                            >
                              Download
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-default-500">Uploaded By</p>
                              <p>{selectedDocument.uploadedBy}</p>
                            </div>
                            <div>
                              <p className="text-default-500">Upload Date</p>
                              <p>{formatDate(selectedDocument.uploadDate)}</p>
                            </div>
                            <div>
                              <p className="text-default-500">Expiry Date</p>
                              <p>{formatDate(selectedDocument.expiryDate)}</p>
                            </div>
                            <div>
                              <p className="text-default-500">Status</p>
                              <Chip 
                                size="sm" 
                                color={statusColorMap[selectedDocument.status]}
                                variant="flat"
                              >
                                {statusNameMap[selectedDocument.status]}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {(formData.expiryDate || (selectedDocument && selectedDocument.expiryDate)) && (isEditing || !selectedDocument) && (
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                          <Checkbox
                            isSelected={formData.sendReminders}
                            onValueChange={(value) => handleInputChange("sendReminders", value)}
                          >
                            Send expiry reminders
                          </Checkbox>
                          <Tooltip content="Reminders will be sent 30, 15, and 5 days before expiry">
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:info" className="text-default-400" />
                            </Button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                      {!isEditing && selectedDocument ? "Close" : "Cancel"}
                    </Button>
                    {(isEditing || !selectedDocument) && (
                      <Button 
                        color="primary" 
                        onPress={handleSubmit}
                        isLoading={isUploading}
                      >
                        {isEditing ? "Update" : "Upload"}
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