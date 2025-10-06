import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Textarea, Button } from '@heroui/react';
import { Designation, DesignationFormData } from '../../hooks/useDesignations';

interface DesignationFormProps {
  designation?: Designation;
  onSubmit: (data: DesignationFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
  departments: Array<{ id: number; name: string }>;
}

const DesignationForm: React.FC<DesignationFormProps> = ({ 
  designation, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  departments 
}) => {
  const [formData, setFormData] = useState<DesignationFormData>({
    name: '',
    description: '',
    department_id: undefined,
  });

  useEffect(() => {
    if (isEdit && designation) {
      setFormData({
        name: designation.name || '',
        description: designation.description || '',
        department_id: designation.department_id,
      });
    }
  }, [isEdit, designation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Designation Name"
        placeholder="Enter designation name"
        
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        isRequired
        aria-label="Designation Name"
      />

      <Select
        label="Department"
        placeholder="Select department (optional)"
        selectedKeys={formData.department_id ? [formData.department_id.toString()] : []}
        onSelectionChange={(keys) => {
          const departmentId = Array.from(keys)[0] as string;
          setFormData({ 
            ...formData, 
            department_id: departmentId ? parseInt(departmentId) : undefined 
          });
        }}
        aria-label="Department"
      >
        {departments.map((dept) => (
          <SelectItem key={dept.id.toString()} textValue={dept.name}>
            {dept.name}
          </SelectItem>
        ))}
      </Select>

      <Textarea
        label="Description"
        placeholder="Enter designation description"
        
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        aria-label="Description"
      />

      <div className="flex gap-2 justify-end">
        <Button color="default" variant="flat" onPress={onCancel} aria-label="Cancel">
          Cancel
        </Button>
        <Button color="primary" type="submit" aria-label={isEdit ? "Update Designation" : "Add Designation"}>
          {isEdit ? 'Update Designation' : 'Add Designation'}
        </Button>
      </div>
    </form>
  );
};

export default DesignationForm;
