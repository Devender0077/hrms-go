import React, { useState, useEffect } from 'react';
import { Input, Textarea, Button } from '@heroui/react';
import { Branch, BranchFormData } from '../../hooks/useBranches';

interface BranchFormProps {
  branch?: Branch;
  onSubmit: (data: BranchFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({ 
  branch, 
  onSubmit, 
  onCancel, 
  isEdit = false
}) => {
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
  });

  useEffect(() => {
    if (isEdit && branch) {
      setFormData({
        name: branch.name || '',
        location: branch.location || '',
        address: branch.address || '',
        city: branch.city || '',
        state: branch.state || '',
        country: branch.country || '',
        zip_code: branch.zip_code || '',
      });
    }
  }, [isEdit, branch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Branch Name"
          placeholder="Enter branch name"
          
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          isRequired
          aria-label="Branch Name"
        />
        <Input
          label="Location"
          placeholder="Enter location"
          
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          aria-label="Location"
        />
      </div>

      <Textarea
        label="Address"
        placeholder="Enter full address"
        
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        rows={3}
        aria-label="Address"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="Enter city"
          
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          aria-label="City"
        />
        <Input
          label="State/Province"
          placeholder="Enter state/province"
          
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          aria-label="State/Province"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Country"
          placeholder="Enter country"
          
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          aria-label="Country"
        />
        <Input
          label="Zip/Postal Code"
          placeholder="Enter zip/postal code"
          
          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
          aria-label="Zip/Postal Code"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button color="default" variant="flat" onPress={onCancel} aria-label="Cancel">
          Cancel
        </Button>
        <Button color="primary" type="submit" aria-label={isEdit ? "Update Branch" : "Add Branch"}>
          {isEdit ? 'Update Branch' : 'Add Branch'}
        </Button>
      </div>
    </form>
  );
};

export default BranchForm;
