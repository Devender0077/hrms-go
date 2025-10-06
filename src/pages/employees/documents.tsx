import React, { useState, useEffect, useMemo } from 'react';
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Spinner,
  Progress,
  Avatar,
  Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../services/api-service';

interface EmployeeDocument {
  id: number;
  employee_id: number;
  document_type: string;
  document_name: string;
  file_path: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  employee_name?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface DocumentFilters {
  searchQuery: string;
  selectedEmployee: string;
  selectedType: string;
}

const EmployeeDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EmployeeDocument | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    document_type: '',
    document_name: '',
    expiry_date: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filters state
  const [filters, setFilters] = useState<DocumentFilters>({
    searchQuery: "",
    selectedEmployee: "all",
    selectedType: "all"
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(document => {
      const matchesSearch = !filters.searchQuery || 
        document.document_name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        document.employee_name?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesEmployee = filters.selectedEmployee === "all" || 
        document.employee_id.toString() === filters.selectedEmployee;
      
      const matchesType = filters.selectedType === "all" || 
        document.document_type === filters.selectedType;
      
      return matchesSearch && matchesEmployee && matchesType;
    });
  }, [documents, filters]);

  // Paginated documents
  const paginatedDocuments = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDocuments.slice(start, start + rowsPerPage);
  }, [filteredDocuments, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const totalDocuments = documents.length;
    const totalEmployees = new Set(documents.map(d => d.employee_id)).size;

    return {
      totalDocuments,
      totalEmployees,
      filteredCount: filteredDocuments.length
    };
  }, [documents, filteredDocuments]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / rowsPerPage);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/employees/documents');
      if (response.success) {
        setDocuments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiRequest('/employees');
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreateDocument = () => {
    setEditingDocument(null);
    setFormData({
      employee_id: '',
      document_type: '',
      document_name: '',
      expiry_date: ''
    });
    setSelectedFile(null);
    onOpen();
  };

  const handleViewDocument = (document: EmployeeDocument) => {
    setSelectedDocument(document);
    onViewOpen();
  };

  const handleEditDocument = (document: EmployeeDocument) => {
    setEditingDocument(document);
    setFormData({
      employee_id: document.employee_id.toString(),
      document_type: document.document_type,
      document_name: document.document_name,
      expiry_date: document.expiry_date || ''
    });
    setSelectedFile(null);
    onOpen();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({ ...formData, document_name: file.name });
    }
  };

  const handleSaveDocument = async () => {
    try {
      setSaving(true);
      
      if (selectedFile) {
        setUploading(true);
        const formDataToSend = new FormData();
        formDataToSend.append('employee_id', formData.employee_id);
        formDataToSend.append('document_type', formData.document_type);
        formDataToSend.append('document_name', formData.document_name);
        formDataToSend.append('file', selectedFile);
        if (formData.expiry_date) {
          formDataToSend.append('expiry_date', formData.expiry_date);
        }

        const endpoint = editingDocument 
          ? `/employees/documents/${editingDocument.id}`
          : '/employees/documents';
        const method = editingDocument ? 'PUT' : 'POST';
        
        const response = await apiRequest(endpoint, {
          method,
          body: JSON.stringify(formDataToSend),
          headers: {
            // Don't set Content-Type for FormData, let browser set it with boundary
          }
        });
        if (response.success) {
          await fetchDocuments();
          onClose();
        }
        setUploading(false);
      } else {
        // Update without file
        const endpoint = `/employees/documents/${editingDocument?.id}`;
        const response = await apiRequest(endpoint, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        if (response.success) {
          await fetchDocuments();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await apiRequest(`/employees/documents/${documentId}`, {
          method: 'DELETE'
        });
        if (response.success) {
          await fetchDocuments();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownloadDocument = async (doc: EmployeeDocument) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/employees/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.document_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getDocumentTypeColor = (type: string): "success" | "default" | "primary" | "secondary" | "warning" | "danger" => {
    const colors: { [key: string]: "success" | "default" | "primary" | "secondary" | "warning" | "danger" } = {
      'contract': 'primary',
      'id_proof': 'secondary',
      'address_proof': 'success',
      'education': 'warning',
      'experience': 'danger',
      'other': 'default'
    };
    return colors[type] || 'default';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const documentTypes = [
    { key: 'contract', label: 'Employment Contract' },
    { key: 'id_proof', label: 'ID Proof' },
    { key: 'address_proof', label: 'Address Proof' },
    { key: 'education', label: 'Education Certificate' },
    { key: 'experience', label: 'Experience Certificate' },
    { key: 'other', label: 'Other' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-content1/50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-default-600 mt-4">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
              <Icon icon="lucide:file-text" className="text-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Documents</h1>
              <p className="text-default-600 mt-1">Manage employee documents and files</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="lucide:plus" />} 
              onPress={handleCreateDocument}
              className="font-medium"
            >
              Upload Document
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Total Documents",
              value: stats.totalDocuments,
              icon: "lucide:file-text",
              color: "blue",
              bgColor: "bg-primary-100 dark:bg-primary-900/20",
              textColor: "text-primary-600 dark:text-primary-400"
            },
            {
              title: "Employees",
              value: stats.totalEmployees,
              icon: "lucide:users",
              color: "purple",
              bgColor: "bg-secondary-100 dark:bg-secondary-900/20",
              textColor: "text-secondary-600 dark:text-secondary-400"
            },
            {
              title: "Filtered",
              value: stats.filteredCount,
              icon: "lucide:filter",
              color: "green",
              bgColor: "bg-success-100 dark:bg-success-900/20",
              textColor: "text-success-600 dark:text-success-400"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm bg-content1">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 ${stat.bgColor} rounded-full`}>
                      <Icon icon={stat.icon} className={`${stat.textColor} text-xl`} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-content1">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search documents..."
                
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
              />
              <Select
                label="Filter by Employee"
                placeholder="Select employee"
                selectedKeys={filters.selectedEmployee ? [filters.selectedEmployee] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({...filters, selectedEmployee: selected || "all"});
                }}
              >
                <SelectItem key="all" textValue="All Employees">
                  All Employees
                </SelectItem>
                {employees.map((employee) => (
                  <SelectItem 
                    key={employee.id.toString()} 
                    textValue={`${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
                  >
                    {employee.first_name} {employee.last_name} ({employee.employee_id})
                  </SelectItem>
                )) as any}
              </Select>
              <Select
                label="Filter by Type"
                placeholder="Select document type"
                selectedKeys={filters.selectedType ? [filters.selectedType] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({...filters, selectedType: selected || "all"});
                }}
              >
                <SelectItem key="all" textValue="All Types">
                  All Types
                </SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.key}  textValue={type.label}>
                    {type.label}
                  </SelectItem>
                )) as any}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Documents Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-success-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Document List</h3>
                <p className="text-default-500 text-sm">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Documents table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>DOCUMENT TYPE</TableColumn>
                <TableColumn>DOCUMENT NAME</TableColumn>
                <TableColumn>EXPIRY DATE</TableColumn>
                <TableColumn>UPLOADED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No documents found">
                {paginatedDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={document.employee_name || `Employee ${document.employee_id}`}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {document.employee_name || `Employee ${document.employee_id}`}
                          </p>
                          <p className="text-sm text-default-500">ID: {document.employee_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getDocumentTypeColor(document.document_type)}
                        size="sm"
                        variant="flat"
                      >
                        {documentTypes.find(t => t.key === document.document_type)?.label || document.document_type}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:file" className="text-default-400 text-sm" />
                        <span className="font-medium">{document.document_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {document.expiry_date ? (
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:calendar" className="text-default-400 text-sm" />
                          <span className="text-sm">
                            {new Date(document.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-default-400">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:clock" className="text-default-400 text-sm" />
                        <span className="text-sm">
                          {new Date(document.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dropdown closeOnSelect>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light" aria-label={`Actions for ${document.document_name}`}>
                            <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label={`Document actions for ${document.document_name}`}>
                          <DropdownItem
                            key="view"
                            startContent={<Icon icon="lucide:eye" />}
                            onPress={() => handleViewDocument(document)}
                            textValue="View document details"
                          >
                            View
                          </DropdownItem>
                          <DropdownItem
                            key="download"
                            startContent={<Icon icon="lucide:download" />}
                            onPress={() => handleDownloadDocument(document)}
                            textValue="Download document"
                          >
                            Download
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Icon icon="lucide:edit" />}
                            onPress={() => handleEditDocument(document)}
                            textValue="Edit document"
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:trash-2" />}
                            onPress={() => handleDeleteDocument(document.id)}
                            textValue="Delete document"
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
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

        {/* Upload/Edit Document Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalContent>
            <ModalHeader>
              {editingDocument ? 'Edit Document' : 'Upload New Document'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  label="Employee"
                  placeholder="Select employee"
                  selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, employee_id: selected || '' });
                  }}
                  isRequired
                >
                  {employees.map((employee) => (
                    <SelectItem 
                      key={employee.id.toString()} 
                      
                      textValue={`${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
                    >
                      {employee.first_name} {employee.last_name} ({employee.employee_id})
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Document Type"
                  placeholder="Select document type"
                  selectedKeys={formData.document_type ? [formData.document_type] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, document_type: selected || '' });
                  }}
                  isRequired
                >
                  {documentTypes.map((type) => (
                    <SelectItem key={type.key}  textValue={type.label}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Document Name"
                  placeholder="Enter document name"
                  
                  onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                  isRequired
                />

                <div>
                  <label className="block text-sm font-medium text-default-700 mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-default-600">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <Input
                  label="Expiry Date (Optional)"
                  type="date"
                  
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSaveDocument}
                isLoading={saving}
                startContent={uploading ? <Progress size="sm" /> : null}
              >
                {editingDocument ? 'Update' : 'Upload'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Document Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <Icon icon="lucide:file-text" className="text-primary text-xl" />
                <div>
                  <h3 className="text-lg font-semibold">Document Details</h3>
                  <p className="text-sm text-default-500">View document information</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedDocument && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-default-600">Document Name</label>
                      <p className="text-foreground font-medium">{selectedDocument.document_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Document Type</label>
                      <div className="mt-1">
                        <Chip
                          color={getDocumentTypeColor(selectedDocument.document_type)}
                          size="sm"
                          variant="flat"
                        >
                          {documentTypes.find(t => t.key === selectedDocument.document_type)?.label || selectedDocument.document_type}
                        </Chip>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Employee</label>
                      <p className="text-foreground">{selectedDocument.employee_name || `Employee ${selectedDocument.employee_id}`}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Employee ID</label>
                      <p className="text-foreground">{selectedDocument.employee_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Uploaded Date</label>
                      <p className="text-foreground">{new Date(selectedDocument.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Expiry Date</label>
                      <p className="text-foreground">
                        {selectedDocument.expiry_date ? new Date(selectedDocument.expiry_date).toLocaleDateString() : 'No expiry'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-default-600">File Path</label>
                    <p className="text-foreground font-mono text-sm bg-default-100 p-2 rounded">
                      {selectedDocument.file_path}
                    </p>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onViewClose}>
                Close
              </Button>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:download" />}
                onPress={() => {
                  if (selectedDocument) {
                    handleDownloadDocument(selectedDocument);
                  }
                }}
              >
                Download
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeeDocumentsPage;
