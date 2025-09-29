import React from 'react';
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Button, Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Department } from '../../hooks/useDepartments';

interface DepartmentTableProps {
  departments: Department[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  onView: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (id: number) => void;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  page,
  totalPages,
  setPage,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <Table aria-label="Departments table">
        <TableHeader>
          <TableColumn>DEPARTMENT</TableColumn>
          <TableColumn>BRANCH</TableColumn>
          <TableColumn>EMPLOYEES</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No departments found">
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon icon="lucide:building" className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{department.name}</p>
                    <p className="text-sm text-default-500 line-clamp-1">
                      {department.description || 'No description'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:map-pin" className="text-default-400 text-sm" />
                  <span className="text-sm">{department.branch_name || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-success-600">{department.employee_count}</span>
                  </div>
                  <span className="text-sm text-default-600">employees</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="text-default-400 text-sm" />
                  <span className="text-sm">
                    {new Date(department.created_at).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Dropdown closeOnSelect>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light" aria-label={`Actions for department ${department.name}`}>
                      <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label={`Department actions for ${department.name}`}>
                    <DropdownItem
                      key={`view-${department.id}`}
                      startContent={<Icon icon="lucide:eye" />}
                      onPress={() => onView(department)}
                      textValue="View department details"
                    >
                      View Details
                    </DropdownItem>
                    <DropdownItem
                      key={`edit-${department.id}`}
                      startContent={<Icon icon="lucide:edit" />}
                      onPress={() => onEdit(department)}
                      textValue="Edit department information"
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key={`delete-${department.id}`}
                      className="text-danger"
                      color="danger"
                      startContent={<Icon icon="lucide:trash-2" />}
                      onPress={() => onDelete(department.id)}
                      textValue="Delete department"
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
            page={page}
            onChange={setPage}
            showControls
            aria-label="Department table pagination"
          />
        </div>
      )}
    </>
  );
};

export default DepartmentTable;
