import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import BranchForm from './BranchForm';
import BranchDetails from './BranchDetails';
import { Branch, BranchFormData } from '../../hooks/useBranches';

interface BranchModalsProps {
  isOpenAdd: boolean;
  onOpenChangeAdd: () => void;
  isOpenEdit: boolean;
  onOpenChangeEdit: () => void;
  isOpenView: boolean;
  onOpenChangeView: () => void;
  selectedBranch: Branch | null;
  editingBranch: Branch | null;
  handleAddBranch: (data: BranchFormData) => void;
  handleEditBranch: (id: number, data: BranchFormData) => void;
}

const BranchModals: React.FC<BranchModalsProps> = ({
  isOpenAdd,
  onOpenChangeAdd,
  isOpenEdit,
  onOpenChangeEdit,
  isOpenView,
  onOpenChangeView,
  selectedBranch,
  editingBranch,
  handleAddBranch,
  handleEditBranch,
}) => {
  return (
    <>
      {/* Add Branch Modal */}
      <Modal isOpen={isOpenAdd} onOpenChange={onOpenChangeAdd} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:building-plus" className="text-success-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Add New Branch</h3>
                    <p className="text-sm text-default-500">Enter branch information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <BranchForm 
                  onSubmit={(data) => { 
                    handleAddBranch(data); 
                    onClose(); 
                  }} 
                  onCancel={onClose}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal isOpen={isOpenEdit} onOpenChange={onOpenChangeEdit} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:building-edit" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Edit Branch</h3>
                    <p className="text-sm text-default-500">Update branch information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {editingBranch && (
                  <BranchForm
                    branch={editingBranch}
                    onSubmit={(data) => { 
                      handleEditBranch(editingBranch.id, data); 
                      onClose(); 
                    }}
                    onCancel={onClose}
                    isEdit
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Branch Modal */}
      <Modal isOpen={isOpenView} onOpenChange={onOpenChangeView} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:building" className="text-primary-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold">Branch Details</h3>
                    <p className="text-sm text-default-500">View complete branch information</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedBranch && (
                  <BranchDetails branch={selectedBranch} />
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

export default BranchModals;
