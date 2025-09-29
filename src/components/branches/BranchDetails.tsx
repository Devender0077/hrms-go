import React from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Branch } from '../../hooks/useBranches';

interface BranchDetailsProps {
  branch: Branch;
}

const BranchDetails: React.FC<BranchDetailsProps> = ({ branch }) => {
  return (
    <div className="space-y-6 p-4">
      {/* Header with Branch Info */}
      <div className="flex items-center gap-4 bg-content1 p-4 rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
          <Icon icon="lucide:building" className="text-primary-600 text-2xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">{branch.name}</h3>
          <p className="text-default-600">{branch.location || 'No location specified'}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-success-600">{branch.employee_count}</span>
              </div>
              <span className="text-sm text-default-600">employees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-secondary-600">{branch.department_count}</span>
              </div>
              <span className="text-sm text-default-600">departments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon icon="lucide:map-pin" className="text-primary" /> Location Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-default-500 text-sm">Branch Name</span>
              <p className="font-medium text-foreground">{branch.name}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Location</span>
              <p className="font-medium text-foreground">{branch.location || 'N/A'}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">City</span>
              <p className="font-medium text-foreground">{branch.city || 'N/A'}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">State/Province</span>
              <p className="font-medium text-foreground">{branch.state || 'N/A'}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Country</span>
              <p className="font-medium text-foreground">{branch.country || 'N/A'}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Zip/Postal Code</span>
              <p className="font-medium text-foreground">{branch.zip_code || 'N/A'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Address */}
      {branch.address && (
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon icon="lucide:home" className="text-success" /> Address
            </h4>
            <p className="text-default-700 leading-relaxed">{branch.address}</p>
          </CardBody>
        </Card>
      )}

      {/* Statistics */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon icon="lucide:bar-chart" className="text-secondary" /> Branch Statistics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-default-500 text-sm">Total Employees</span>
              <p className="font-medium text-foreground">{branch.employee_count}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Total Departments</span>
              <p className="font-medium text-foreground">{branch.department_count}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Created</span>
              <p className="font-medium text-foreground">
                {new Date(branch.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Last Updated</span>
              <p className="font-medium text-foreground">
                {new Date(branch.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default BranchDetails;
