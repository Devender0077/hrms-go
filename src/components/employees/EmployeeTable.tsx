import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Pagination
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Employee } from "../../types/employee";

interface EmployeeTableProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  onChangePassword: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onView,
  onEdit,
  onDelete,
  onChangePassword,
  onToggleStatus,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const statusColorMap = {
    active: "success",
    inactive: "default",
    on_leave: "warning",
    terminated: "danger",
  };

  const handleDelete = (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete "${employee.first_name} ${employee.last_name}"?`)) {
      onDelete(employee.id);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Icon icon="lucide:table" className="text-success-600 text-xl" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Employee List</h3>
            <p className="text-default-500 text-sm">
              {employees.length} employee{employees.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <Table aria-label="Employees table">
          <TableHeader>
            <TableColumn>EMPLOYEE</TableColumn>
            <TableColumn>DEPARTMENT</TableColumn>
            <TableColumn>DESIGNATION</TableColumn>
            <TableColumn>BRANCH</TableColumn>
            <TableColumn>SHIFT</TableColumn>
            <TableColumn>JOIN DATE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={
            <div className="flex flex-col items-center justify-center py-12 px-6">
              {/* Illustration */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="flex flex-col items-center space-y-2">
                    {/* Team illustration */}
                    <div className="flex items-end space-x-1">
                      <div className="w-6 h-8 bg-primary-500 rounded-sm"></div>
                      <div className="w-8 h-10 bg-primary-600 rounded-sm"></div>
                      <div className="w-6 h-8 bg-primary-500 rounded-sm"></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-primary-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:user-plus" className="text-warning-600 text-xs" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:users" className="text-success-600 text-xs" />
                </div>
              </div>
              
              {/* Text content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">No employees found</h3>
              <p className="text-default-500 text-center max-w-sm mb-4">
                Get started by adding your first employee to the system. You can import from CSV or add manually.
              </p>
              
              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  startContent={<Icon icon="lucide:user-plus" className="w-4 h-4" />}
                >
                  Add Employee
                </Button>
                <Button
                  color="default"
                  variant="flat"
                  size="sm"
                  startContent={<Icon icon="lucide:upload" className="w-4 h-4" />}
                >
                  Import CSV
                </Button>
              </div>
            </div>
          }>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={employee.profile_photo ? `http://localhost:8000/uploads/profiles/${employee.profile_photo}` : undefined}
                      name={`${employee.first_name} ${employee.last_name}`}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-sm text-default-500">{employee.email}</p>
                      <p className="text-xs text-default-400">ID: {employee.employee_id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:building" className="text-default-400 text-sm" />
                    <span className="text-sm">{employee.department_name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:briefcase" className="text-default-400 text-sm" />
                    <span className="text-sm">{employee.designation_name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:map-pin" className="text-default-400 text-sm" />
                    <span className="text-sm">{employee.branch_name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:clock" className="text-default-400 text-sm" />
                    <div>
                      <span className="text-sm">{(employee as any).shift_name || 'N/A'}</span>
                      {(employee as any).shift_name && (
                        <p className="text-xs text-default-400">
                          {(employee as any).shift_start_time} - {(employee as any).shift_end_time}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:calendar" className="text-default-400 text-sm" />
                    <span className="text-sm">
                      {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    color={statusColorMap[employee.status] as any}
                    variant="flat"
                    size="sm"
                  >
                    {employee.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Dropdown closeOnSelect>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light" aria-label={`Actions for ${employee.first_name} ${employee.last_name}`}>
                        <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label={`Employee actions for ${employee.first_name} ${employee.last_name}`}>
                      <DropdownItem
                        key="view"
                        startContent={<Icon icon="lucide:eye" />}
                        onPress={() => onView(employee)}
                        textValue="View employee details"
                      >
                        View
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={<Icon icon="lucide:edit" />}
                        onPress={() => onEdit(employee)}
                        textValue="Edit employee information"
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="change-password"
                        startContent={<Icon icon="lucide:key" />}
                        onPress={() => onChangePassword(employee)}
                        textValue="Change employee password"
                      >
                        Change Password
                      </DropdownItem>
                      <DropdownItem
                        key="toggle-status"
                        startContent={<Icon icon={employee.status === 'active' ? "lucide:user-x" : "lucide:user-check"} />}
                        onPress={() => onToggleStatus(employee)}
                        className={employee.status === 'active' ? "text-warning" : "text-success"}
                        textValue={employee.status === 'active' ? 'Deactivate employee' : 'Activate employee'}
                      >
                        {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Icon icon="lucide:trash-2" />}
                        onPress={() => handleDelete(employee)}
                        textValue="Delete employee"
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={onPageChange}
              showControls
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default EmployeeTable;
