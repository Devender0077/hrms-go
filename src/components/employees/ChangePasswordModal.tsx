import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../services/api-service";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
  } | null;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm the password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !employee) return;

    setIsLoading(true);
    try {
      const response = await apiRequest(`/employees/${employee.id}/change-password`, {
        method: 'PUT',
        body: JSON.stringify({
          new_password: newPassword
        })
      });

      if (response.success || response.message) {
        addToast({
          title: "Success",
          description: "Password changed successfully",
          color: "success"
        });
        
        // Reset form
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
        
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      addToast({
        title: "Error",
        description: error.message || "Failed to change password",
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    onClose();
  };

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Icon icon="lucide:key" className="text-warning-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-500">
                    Reset password for {employee.first_name} {employee.last_name}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Icon icon="lucide:info" className="text-blue-600 text-sm mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Employee Information:</p>
                      <p>Name: {employee.first_name} {employee.last_name}</p>
                      <p>Employee ID: {employee.employee_id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    label="New Password"
                    placeholder="Enter new password"
                    type="password"
                    value={newPassword}
                    onValueChange={setNewPassword}
                    isInvalid={!!errors.newPassword}
                    errorMessage={errors.newPassword}
                    isRequired
                    className="rounded-lg"
                    description="Password must be at least 6 characters long"
                  />

                  <Input
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                    isRequired
                    className="rounded-lg"
                  />
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Icon icon="lucide:alert-triangle" className="text-yellow-600 text-sm mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Important:</p>
                      <p>This will immediately change the employee's login password. Make sure to inform them of the new password.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={handleClose}
                className="rounded-lg"
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                color="warning"
                onPress={handleSubmit}
                isLoading={isLoading}
                className="rounded-lg"
                startContent={!isLoading && <Icon icon="lucide:key" />}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ChangePasswordModal;
