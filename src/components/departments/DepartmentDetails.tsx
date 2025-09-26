import React from 'react';
import { Chip, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Department } from '../../hooks/useDepartments';

interface DepartmentDetailsProps {
  department: Department;
}

const DepartmentDetails: React.FC<DepartmentDetailsProps> = ({ department }) => {
  return (
    <div className="space-y-6 p-4">
      {/* Header with Department Info */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
          <Icon icon="lucide:building" className="text-blue-600 text-2xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{department.name}</h3>
          <p className="text-gray-600">{department.branch_name || 'No branch assigned'}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-green-600">{department.employee_count}</span>
            </div>
            <span className="text-sm text-gray-600">employees</span>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="lucide:info" className="text-blue-500" /> Department Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Department Name</span>
              <p className="font-medium text-gray-800">{department.name}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Branch</span>
              <p className="font-medium text-gray-800">{department.branch_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Employee Count</span>
              <p className="font-medium text-gray-800">{department.employee_count}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Created</span>
              <p className="font-medium text-gray-800">
                {new Date(department.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Description */}
      {department.description && (
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="lucide:file-text" className="text-green-500" /> Description
            </h4>
            <p className="text-gray-700 leading-relaxed">{department.description}</p>
          </CardBody>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="lucide:calendar" className="text-purple-500" /> Additional Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Last Updated</span>
              <p className="font-medium text-gray-800">
                {new Date(department.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Department ID</span>
              <p className="font-medium text-gray-800">#{department.id}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DepartmentDetails;
