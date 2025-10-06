import React from "react";
import { Chip } from "@heroui/react";
import { Employee } from "../../types/employee";

interface EmployeeDetailsProps {
  employee: Employee;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'on_leave': return 'warning';
      case 'inactive': return 'default';
      case 'terminated': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="p-4 bg-content1 rounded-lg">
        <h4 className="text-lg font-semibold text-foreground mb-4">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-default-500 text-sm">Full Name</span>
            <p className="font-medium">{employee.first_name} {employee.last_name}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Employee ID</span>
            <p className="font-medium">{employee.employee_id}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Email</span>
            <p className="font-medium">{employee.email}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Phone</span>
            <p className="font-medium">{employee.phone || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Gender</span>
            <p className="font-medium capitalize">{employee.gender || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Date of Birth</span>
            <p className="font-medium">
              {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Work Information */}
      <div className="p-4 bg-content1 rounded-lg">
        <h4 className="text-lg font-semibold text-foreground mb-4">Work Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-default-500 text-sm">Department</span>
            <p className="font-medium">{employee.department_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Designation</span>
            <p className="font-medium">{employee.designation_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Branch</span>
            <p className="font-medium">{employee.branch_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Status</span>
            <div className="mt-1">
              <Chip
                color={getStatusColor(employee.status)}
                variant="flat"
                size="sm"
              >
                {employee.status.replace('_', ' ').toUpperCase()}
              </Chip>
            </div>
          </div>
          <div>
            <span className="text-default-500 text-sm">Joining Date</span>
            <p className="font-medium">
              {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Exit Date</span>
            <p className="font-medium">
              {employee.exit_date ? new Date(employee.exit_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Employment Type</span>
            <p className="font-medium capitalize">
              {(employee as any).employment_type ? (employee as any).employment_type.replace('_', ' ') : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Attendance Policy</span>
            <p className="font-medium">
              {(employee as any).attendance_policy_name || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Shift</span>
            <p className="font-medium">
              {(employee as any).shift_name || 'N/A'}
            </p>
            {(employee as any).shift_name && (
              <p className="text-xs text-default-400 mt-1">
                {(employee as any).shift_start_time} - {(employee as any).shift_end_time}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="p-4 bg-content1 rounded-lg">
        <h4 className="text-lg font-semibold text-foreground mb-4">Bank Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-default-500 text-sm">Bank Name</span>
            <p className="font-medium">{(employee as any).bank_name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Account Number</span>
            <p className="font-medium">{(employee as any).bank_account_number || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Routing Number</span>
            <p className="font-medium">{(employee as any).bank_routing_number || 'N/A'}</p>
          </div>
          <div>
            <span className="text-default-500 text-sm">SWIFT Code</span>
            <p className="font-medium">{(employee as any).bank_swift_code || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <span className="text-default-500 text-sm">Bank Address</span>
            <p className="font-medium">{(employee as any).bank_address || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="p-4 bg-content1 rounded-lg">
        <h4 className="text-lg font-semibold text-foreground mb-4">Address Information</h4>
        <div className="space-y-2">
          <div>
            <span className="text-default-500 text-sm">Address</span>
            <p className="font-medium">{employee.address || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-default-500 text-sm">City</span>
              <p className="font-medium">{employee.city || 'N/A'}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">State</span>
              <p className="font-medium">{employee.state || 'N/A'}</p>
            </div>
            <div>
              <span className="text-default-500 text-sm">Country</span>
              <p className="font-medium">{employee.country || 'N/A'}</p>
            </div>
          </div>
          <div>
            <span className="text-default-500 text-sm">ZIP Code</span>
            <p className="font-medium">{employee.zip_code || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="p-4 bg-content1 rounded-lg">
        <h4 className="text-lg font-semibold text-foreground mb-4">System Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-default-500 text-sm">Created At</span>
            <p className="font-medium">
              {employee.created_at ? new Date(employee.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-default-500 text-sm">Last Updated</span>
            <p className="font-medium">
              {employee.updated_at ? new Date(employee.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
