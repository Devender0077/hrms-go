import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import DesignationForm from './DesignationForm';
import DesignationDetails from './DesignationDetails';
import { Designation, DesignationFormData } from '../../hooks/useDesignations';

interface DesignationModalsProps {
  isOpenAdd: boolean;
  onOpenChangeAdd: () => void;
  isOpenEdit: boolean;
  onOpenChangeEdit: () => void;
  isOpenView: boolean;
  onOpenChangeView: () => void;
  selectedDesignation: Designation | null;
  editingDesignation: Designation | null;
  handleAddDesignation: (data: DesignationFormData) => void;
  handleEditDesignation: (id: number, data: DesignationFormData) => void;
  departments: Array<{ id: number; name: string }>;
}

const DesignationModals: React.FC<DesignationModalsProps> = ({
  isOpenAdd,
  onOpenChangeAdd,
  isOpenEdit,
  onOpenChangeEdit,
  isOpenView,
  onOpenChangeView,
  selectedDesignation,
  editingDesignation,
  handleAddDesignation,
  handleEditDesignation,
  departments,
}) => {
  return (
    <>
      {/* Add Designation Modal */}
      <Modal isOpen={isOpenAdd} onOpenChange={onOpenChangeAdd} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:award-plus" className="text-green-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Add New Designation</h3>
                    <p className="text-sm text-gray-500">Enter designation information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <DesignationForm 
                  onSubmit={(data) => { 
                    handleAddDesignation(data); 
                    onClose(); 
                  }} 
                  onCancel={onClose}
                  departments={departments}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Designation Modal */}
      <Modal isOpen={isOpenEdit} onOpenChange={onOpenChangeEdit} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:award-edit" className="text-blue-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Edit Designation</h3>
                    <p className="text-sm text-gray-500">Update designation information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {editingDesignation && (
                  <DesignationForm
                    designation={editingDesignation}
                    onSubmit={(data) => { 
                      handleEditDesignation(editingDesignation.id, data); 
                      onClose(); 
                    }}
                    onCancel={onClose}
                    isEdit
                    departments={departments}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Designation Modal */}
      <Modal isOpen={isOpenView} onOpenChange={onOpenChangeView} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:award" className="text-purple-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Designation Details</h3>
                    <p className="text-sm text-gray-500">View complete designation information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedDesignation && (
                  <DesignationDetails designation={selectedDesignation} />
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

export default DesignationModals;
