import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Textarea, Button } from '@heroui/react';
import { Department, DepartmentFormData } from '../../hooks/useDepartments';

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: DepartmentFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
  branches: Array<{ id: number; name: string }>;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ 
  department, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  branches 
}) => {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    branch_id: undefined,
  });

  useEffect(() => {
    if (isEdit && department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        branch_id: department.branch_id,
      });
    }
  }, [isEdit, department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Department Name"
        placeholder="Enter department name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        isRequired
        aria-label="Department Name"
      />

      <Select
        label="Branch"
        placeholder="Select branch (optional)"
        selectedKeys={formData.branch_id ? [formData.branch_id.toString()] : []}
        onSelectionChange={(keys) => {
          const branchId = Array.from(keys)[0] as string;
          setFormData({ 
            ...formData, 
            branch_id: branchId ? parseInt(branchId) : undefined 
          });
        }}
        aria-label="Branch"
      >
        {branches.map((branch) => (
          <SelectItem key={branch.id.toString()} value={branch.id.toString()} textValue={branch.name}>
            {branch.name}
          </SelectItem>
        ))}
      </Select>

      <Textarea
        label="Description"
        placeholder="Enter department description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        aria-label="Description"
      />

      <div className="flex gap-2 justify-end">
        <Button color="default" variant="flat" onPress={onCancel} aria-label="Cancel">
          Cancel
        </Button>
        <Button color="primary" type="submit" aria-label={isEdit ? "Update Department" : "Add Department"}>
          {isEdit ? 'Update Department' : 'Add Department'}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
