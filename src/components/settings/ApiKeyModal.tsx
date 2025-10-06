import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from '@heroui/react';
import { Icon } from '@iconify/react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSave: () => void;
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onOpenChange,
  onSave,
  name,
  description,
  onNameChange,
  onDescriptionChange
}: ApiKeyModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:key" className="text-primary-500 text-xl" />
                <h3 className="text-lg font-semibold">Create New API Key</h3>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="API Key Name"
                  placeholder="Enter a name for this API key"
                  
                  onChange={(e) => onNameChange(e.target.value)}
                  startContent={<Icon icon="lucide:tag" className="text-default-400" />}
                />
                
                <Textarea
                  label="Description"
                  placeholder="Enter a description for this API key"
                  
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  rows={3}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={onSave}>
                Create API Key
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}