import React from 'react';
import { Chip, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Designation } from '../../hooks/useDesignations';

interface DesignationDetailsProps {
  designation: Designation;
}

const DesignationDetails: React.FC<DesignationDetailsProps> = ({ designation }) => {
  return (
    <div className="space-y-6 p-4">
      {/* Header with Designation Info */}
      <div className="flex items-center gap-4 bg-content1 p-4 rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-secondary-100 rounded-xl flex items-center justify-center">
          <Icon icon="lucide:award" className="text-secondary-600 text-2xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">{designation.name}</h3>
          <p className="text-default-600">{designation.department_name || 'No department assigned'}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-success-600">{designation.employee_count}</span>
            </div>
            <span className="text-sm text-default-600">employees</span>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon icon="lucide:info" className="text-secondary" /> Designation Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-default-500 text-sm">Designation Name</span>
              <p className="font-medium text-foreground">{designation.name}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Department</span>
              <p className="font-medium text-foreground">{designation.department_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Employee Count</span>
              <p className="font-medium text-foreground">{designation.employee_count}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Created</span>
              <p className="font-medium text-foreground">
                {new Date(designation.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Description */}
      {designation.description && (
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon icon="lucide:file-text" className="text-success" /> Description
            </h4>
            <p className="text-default-700 leading-relaxed">{designation.description}</p>
          </CardBody>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon icon="lucide:calendar" className="text-primary" /> Additional Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-default-500 text-sm">Last Updated</span>
              <p className="font-medium text-foreground">
                {new Date(designation.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Designation ID</span>
              <p className="font-medium text-foreground">#{designation.id}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DesignationDetails;
