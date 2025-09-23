import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Icon icon="lucide:key" className="text-primary-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create API Key</h3>
                  <p className="text-sm text-gray-500">Generate a new API key for external access</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Key Name"
                  placeholder="e.g., Mobile App, Integration"
                  value={name}
                  onValueChange={onNameChange}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe what this API key will be used for"
                  value={description}
                  onValueChange={onDescriptionChange}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" onPress={onSave}>Create API Key</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
