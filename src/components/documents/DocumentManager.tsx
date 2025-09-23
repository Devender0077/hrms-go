import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { documentService, DocumentTemplate, DocumentData } from "../../services/document-service";
import { addToast } from "@heroui/react";

interface DocumentManagerProps {
  companyBranding: {
    logo?: string;
    companyName: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export default function DocumentManager({ companyBranding }: DocumentManagerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [documentData, setDocumentData] = useState<DocumentData>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample employees data - in real app, this would come from API
  const employees = [
    { id: 1, name: "John Doe", email: "john.doe@company.com", position: "Software Engineer", department: "Engineering" },
    { id: 2, name: "Jane Smith", email: "jane.smith@company.com", position: "Marketing Manager", department: "Marketing" },
    { id: 3, name: "Mike Johnson", email: "mike.johnson@company.com", position: "HR Specialist", department: "Human Resources" }
  ];

  // Sample candidates data
  const candidates = [
    { id: 1, name: "Alice Brown", email: "alice.brown@email.com", position: "Frontend Developer", department: "Engineering" },
    { id: 2, name: "Bob Wilson", email: "bob.wilson@email.com", position: "Sales Executive", department: "Sales" }
  ];

  const documentTypes = [
    { key: "offer_letter", label: "Offer Letter", icon: "lucide:file-text", color: "primary" },
    { key: "joining_letter", label: "Joining Letter", icon: "lucide:user-plus", color: "success" },
    { key: "experience_certificate", label: "Experience Certificate", icon: "lucide:award", color: "warning" },
    { key: "noc_letter", label: "NOC Letter", icon: "lucide:file-check", color: "secondary" }
  ];

  const handleGenerateDocument = async () => {
    if (!selectedDocumentType || !selectedEmployee) return;

    setIsGenerating(true);
    try {
      const template: DocumentTemplate = {
        id: selectedDocumentType,
        type: selectedDocumentType as any,
        name: documentTypes.find(dt => dt.key === selectedDocumentType)?.label || "",
        content: getDefaultTemplate(selectedDocumentType),
        variables: []
      };

      let success = false;
      const employeeData = selectedEmployee;

      switch (selectedDocumentType) {
        case "offer_letter":
          success = await documentService.generateAndSendOfferLetter(
            employeeData.email,
            employeeData.name,
            employeeData.position,
            employeeData.department,
            documentData.salary || "To be discussed",
            documentData.startDate || new Date().toLocaleDateString(),
            template,
            companyBranding
          );
          break;
        case "joining_letter":
          success = await documentService.generateAndSendJoiningLetter(
            employeeData.email,
            employeeData.name,
            employeeData.position,
            employeeData.department,
            documentData.startDate || new Date().toLocaleDateString(),
            template,
            companyBranding
          );
          break;
        case "experience_certificate":
          success = await documentService.generateAndSendExperienceCertificate(
            employeeData.email,
            employeeData.name,
            employeeData.position,
            employeeData.department,
            documentData.startDate || "2020-01-01",
            documentData.endDate || new Date().toLocaleDateString(),
            template,
            companyBranding
          );
          break;
        case "noc_letter":
          success = await documentService.generateAndSendNOCLetter(
            employeeData.email,
            employeeData.name,
            employeeData.position,
            employeeData.department,
            template,
            companyBranding
          );
          break;
      }

      if (success) {
        addToast({
          title: "Document Generated",
          description: `${documentTypes.find(dt => dt.key === selectedDocumentType)?.label} has been generated and sent successfully.`,
          color: "success",
        });
        onClose();
      } else {
        addToast({
          title: "Generation Failed",
          description: "Failed to generate and send the document. Please try again.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error generating document:", error);
      addToast({
        title: "Error",
        description: "An unexpected error occurred while generating the document.",
        color: "danger",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDefaultTemplate = (type: string): string => {
    switch (type) {
      case "offer_letter":
        return `Dear [CANDIDATE_NAME],

We are pleased to offer you the position of [POSITION] at [COMPANY_NAME]. After careful consideration of your qualifications and experience, we believe you will be a valuable addition to our team.

**Position Details:**
- Job Title: [POSITION]
- Department: [DEPARTMENT]
- Start Date: [START_DATE]
- Annual Salary: [SALARY]

**Terms & Conditions:**
- This offer is valid for 30 days from the date of this letter
- Your employment will be subject to our standard terms and conditions

We look forward to welcoming you to our team.

Best regards,
HR Manager
[COMPANY_NAME]`;

      case "joining_letter":
        return `Dear [EMPLOYEE_NAME],

Welcome to [COMPANY_NAME]! We are excited to have you join our team as [POSITION] in the [DEPARTMENT] department.

**Joining Details:**
- Position: [POSITION]
- Department: [DEPARTMENT]
- Start Date: [START_DATE]
- Reporting Manager: [MANAGER_NAME]

Please ensure you bring all required documents on your first day.

Best regards,
HR Manager
[COMPANY_NAME]`;

      case "experience_certificate":
        return `This is to certify that [EMPLOYEE_NAME] was employed with [COMPANY_NAME] as [POSITION] in the [DEPARTMENT] department from [START_DATE] to [END_DATE].

During this period, [EMPLOYEE_NAME] has been found to be sincere, hardworking, and dedicated to their work. We wish them all the best for their future endeavors.

This certificate is issued upon request.

Best regards,
HR Manager
[COMPANY_NAME]`;

      case "noc_letter":
        return `This is to certify that [EMPLOYEE_NAME] was employed with [COMPANY_NAME] as [POSITION] in the [DEPARTMENT] department.

We have no objection to [EMPLOYEE_NAME] pursuing other opportunities and hereby issue this No Objection Certificate.

This certificate is issued upon request.

Best regards,
HR Manager
[COMPANY_NAME]`;

      default:
        return "";
    }
  };

  const getDataForDocumentType = (type: string) => {
    switch (type) {
      case "offer_letter":
        return candidates;
      default:
        return employees;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Document Management</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {documentTypes.map((docType) => (
              <Button
                key={docType.key}
                color={docType.color as any}
                variant="flat"
                className="h-20 flex flex-col gap-2"
                startContent={<Icon icon={docType.icon} className="w-6 h-6" />}
                onPress={() => {
                  setSelectedDocumentType(docType.key);
                  onOpen();
                }}
              >
                {docType.label}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-semibold">
                  Generate {documentTypes.find(dt => dt.key === selectedDocumentType)?.label}
                </h2>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Select Employee/Candidate"
                    placeholder="Choose employee or candidate"
                    selectedKeys={selectedEmployee ? [selectedEmployee.id.toString()] : []}
                    onChange={(e) => {
                      const employeeId = parseInt(e.target.value);
                      const employee = getDataForDocumentType(selectedDocumentType).find(emp => emp.id === employeeId);
                      setSelectedEmployee(employee);
                    }}
                  >
                    {getDataForDocumentType(selectedDocumentType).map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </Select>

                  {selectedDocumentType === "offer_letter" && (
                    <Input
                      label="Salary"
                      placeholder="Enter salary amount"
                      value={documentData.salary || ""}
                      onChange={(e) => setDocumentData(prev => ({ ...prev, salary: e.target.value }))}
                    />
                  )}

                  <Input
                    label="Start Date"
                    type="date"
                    value={documentData.startDate || ""}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, startDate: e.target.value }))}
                  />

                  {selectedDocumentType === "experience_certificate" && (
                    <Input
                      label="End Date"
                      type="date"
                      value={documentData.endDate || ""}
                      onChange={(e) => setDocumentData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  )}

                  {selectedEmployee && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Selected Employee/Candidate:</h4>
                      <p><strong>Name:</strong> {selectedEmployee.name}</p>
                      <p><strong>Email:</strong> {selectedEmployee.email}</p>
                      <p><strong>Position:</strong> {selectedEmployee.position}</p>
                      <p><strong>Department:</strong> {selectedEmployee.department}</p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleGenerateDocument}
                  isLoading={isGenerating}
                  isDisabled={!selectedEmployee}
                >
                  {isGenerating ? "Generating..." : "Generate & Send"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
