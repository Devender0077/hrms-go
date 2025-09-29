import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import DepartmentForm from './DepartmentForm';
import DepartmentDetails from './DepartmentDetails';
import { Department, DepartmentFormData } from '../../hooks/useDepartments';

interface DepartmentModalsProps {
  isOpenAdd: boolean;
  onOpenChangeAdd: () => void;
  isOpenEdit: boolean;
  onOpenChangeEdit: () => void;
  isOpenView: boolean;
  onOpenChangeView: () => void;
  selectedDepartment: Department | null;
  editingDepartment: Department | null;
  handleAddDepartment: (data: DepartmentFormData) => void;
  handleEditDepartment: (id: number, data: DepartmentFormData) => void;
  branches: Array<{ id: number; name: string }>;
}

const DepartmentModals: React.FC<DepartmentModalsProps> = ({
  isOpenAdd,
  onOpenChangeAdd,
  isOpenEdit,
  onOpenChangeEdit,
  isOpenView,
  onOpenChangeView,
  selectedDepartment,
  editingDepartment,
  handleAddDepartment,
  handleEditDepartment,
  branches,
}) => {
  return (
    <>
      {/* Add Department Modal */}
      <Modal isOpen={isOpenAdd} onOpenChange={onOpenChangeAdd} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:building-plus" className="text-success-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Add New Department</h3>
                    <p className="text-sm text-default-500">Enter department information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <DepartmentForm 
                  onSubmit={(data) => { 
                    handleAddDepartment(data); 
                    onClose(); 
                  }} 
                  onCancel={onClose}
                  branches={branches}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={isOpenEdit} onOpenChange={onOpenChangeEdit} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:building-edit" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Edit Department</h3>
                    <p className="text-sm text-default-500">Update department information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {editingDepartment && (
                  <DepartmentForm
                    department={editingDepartment}
                    onSubmit={(data) => { 
                      handleEditDepartment(editingDepartment.id, data); 
                      onClose(); 
                    }}
                    onCancel={onClose}
                    isEdit
                    branches={branches}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Department Modal */}
      <Modal isOpen={isOpenView} onOpenChange={onOpenChangeView} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:building" className="text-secondary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Department Details</h3>
                    <p className="text-sm text-default-500">View complete department information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedDepartment && (
                  <DepartmentDetails department={selectedDepartment} />
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

export default DepartmentModals;
