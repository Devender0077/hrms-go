import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Employee, EmployeeFormData } from "../../types/employee";
import EmployeeForm from "./employee-form";
import EmployeeDetails from "./EmployeeDetails";

interface EmployeeModalsProps {
  // Add Employee Modal
  isAddOpen: boolean;
  onAddOpenChange: () => void;
  onAddSubmit: (data: Partial<EmployeeFormData>) => void;

  // Edit Employee Modal
  isEditOpen: boolean;
  onEditOpenChange: () => void;
  editingEmployee: Employee | null;
  onEditSubmit: (data: Partial<EmployeeFormData>) => void;

  // View Employee Modal
  isViewOpen: boolean;
  onViewOpenChange: () => void;
  selectedEmployee: Employee | null;

  // Data props
  employees: Array<{ id: number; first_name: string; last_name: string; employee_id: string }>;
  branches: Array<{ id: number; name: string }>;
  departments: Array<{ id: number; name: string }>;
  designations: Array<{ id: number; name: string }>;
  shifts: Array<{ id: number; name: string; start_time: string; end_time: string; is_active: boolean }>;
  attendancePolicies: Array<{ id: number; name: string; policy_type: string }>;
}

const EmployeeModals: React.FC<EmployeeModalsProps> = ({
  isAddOpen,
  onAddOpenChange,
  onAddSubmit,
  isEditOpen,
  onEditOpenChange,
  editingEmployee,
  onEditSubmit,
  isViewOpen,
  onViewOpenChange,
  selectedEmployee,
  employees,
  branches,
  departments,
  designations,
  shifts,
  attendancePolicies
}) => {
  return (
    <>
      {/* Add Employee Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:user-plus" className="text-success-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Add New Employee</h3>
                    <p className="text-sm text-default-500">Enter employee information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <EmployeeForm
                  onSubmit={(data) => {
                    onAddSubmit(data);
                    onClose();
                  }}
                  onCancel={onClose}
                  employees={employees}
                  branches={branches}
                  departments={departments}
                  designations={designations}
                  shifts={shifts}
                  attendancePolicies={attendancePolicies}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:user-edit" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Edit Employee</h3>
                    <p className="text-sm text-default-500">Update employee information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {editingEmployee && (
                  <EmployeeForm
                    employee={editingEmployee}
                    onSubmit={(data) => {
                      onEditSubmit(data);
                      onClose();
                    }}
                    onCancel={onClose}
                    employees={employees}
                    branches={branches}
                    departments={departments}
                    designations={designations}
                    shifts={shifts}
                    attendancePolicies={attendancePolicies}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Employee Modal */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:user" className="text-secondary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Employee Details</h3>
                    <p className="text-sm text-default-500">View complete employee information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedEmployee && (
                  <EmployeeDetails employee={selectedEmployee} />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmployeeModals;
