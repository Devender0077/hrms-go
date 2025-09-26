import React, { useState, useEffect } from 'react';
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
  Progress
} from '@heroui/react';
import { PlusIcon, UploadIcon, DownloadIcon, EyeIcon, TrashIcon, MoreVerticalIcon } from 'lucide-react';
import { apiRequest } from '../../services/api-service';

interface EmployeeDocument {
  id: number;
  employee_id: number;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  expires_at?: string;
  status: string;
  employee_name?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const EmployeeDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EmployeeDocument | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    document_type: '',
    document_name: '',
    expires_at: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/v1/employees/documents');
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
      const response = await apiRequest('GET', '/api/v1/employees');
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
      expires_at: ''
    });
    setSelectedFile(null);
    onOpen();
  };

  const handleEditDocument = (document: EmployeeDocument) => {
    setEditingDocument(document);
    setFormData({
      employee_id: document.employee_id.toString(),
      document_type: document.document_type,
      document_name: document.document_name,
      expires_at: document.expires_at || ''
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
        if (formData.expires_at) {
          formDataToSend.append('expires_at', formData.expires_at);
        }

        const url = editingDocument 
          ? `/api/v1/employees/documents/${editingDocument.id}`
          : '/api/v1/employees/documents';
        const method = editingDocument ? 'PUT' : 'POST';
        
        const response = await apiRequest(method, url, formDataToSend, true);
        if (response.success) {
          await fetchDocuments();
          onClose();
        }
        setUploading(false);
      } else {
        // Update without file
        const url = `/api/v1/employees/documents/${editingDocument?.id}`;
        const response = await apiRequest('PUT', url, formData);
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
        const response = await apiRequest('DELETE', `/api/v1/employees/documents/${documentId}`);
        if (response.success) {
          await fetchDocuments();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleDownloadDocument = async (document: EmployeeDocument) => {
    try {
      const response = await fetch(`/api/v1/employees/documents/${document.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.document_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Documents</h1>
          <p className="text-gray-600">Manage employee documents and files</p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon size={20} />}
          onPress={handleCreateDocument}
        >
          Upload Document
        </Button>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Documents table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>DOCUMENT TYPE</TableColumn>
              <TableColumn>DOCUMENT NAME</TableColumn>
              <TableColumn>FILE SIZE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>UPLOADED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="font-medium">{document.employee_name || `Employee ${document.employee_id}`}</div>
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
                    <div className="font-medium">{document.document_name}</div>
                  </TableCell>
                  <TableCell>
                    {formatFileSize(document.file_size)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(document.status)}
                      size="sm"
                      variant="flat"
                    >
                      {document.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                        >
                          <MoreVerticalIcon size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="view"
                          startContent={<EyeIcon size={16} />}
                        >
                          View
                        </DropdownItem>
                        <DropdownItem
                          key="download"
                          startContent={<DownloadIcon size={16} />}
                          onPress={() => handleDownloadDocument(document)}
                        >
                          Download
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<UploadIcon size={16} />}
                          onPress={() => handleEditDocument(document)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<TrashIcon size={16} />}
                          onPress={() => handleDeleteDocument(document.id)}
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
                  <SelectItem key={employee.id.toString()} value={employee.id.toString()}>
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
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Document Name"
                placeholder="Enter document name"
                value={formData.document_name}
                onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                isRequired
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
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
    </div>
  );
};

export default EmployeeDocumentsPage;
