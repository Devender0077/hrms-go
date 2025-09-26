import React from 'react';
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Button, Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Designation } from '../../hooks/useDesignations';

interface DesignationTableProps {
  designations: Designation[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  onView: (designation: Designation) => void;
  onEdit: (designation: Designation) => void;
  onDelete: (id: number) => void;
}

const DesignationTable: React.FC<DesignationTableProps> = ({
  designations,
  page,
  totalPages,
  setPage,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <Table aria-label="Designations table">
        <TableHeader>
          <TableColumn>DESIGNATION</TableColumn>
          <TableColumn>DEPARTMENT</TableColumn>
          <TableColumn>EMPLOYEES</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No designations found">
          {designations.map((designation) => (
            <TableRow key={designation.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon icon="lucide:award" className="text-purple-600 text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{designation.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {designation.description || 'No description'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:building" className="text-gray-400 text-sm" />
                  <span className="text-sm">{designation.department_name || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{designation.employee_count}</span>
                  </div>
                  <span className="text-sm text-gray-600">employees</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="text-gray-400 text-sm" />
                  <span className="text-sm">
                    {new Date(designation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Dropdown closeOnSelect>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light" aria-label={`Actions for designation ${designation.name}`}>
                      <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label={`Designation actions for ${designation.name}`}>
                    <DropdownItem
                      key="view"
                      startContent={<Icon icon="lucide:eye" />}
                      onPress={() => onView(designation)}
                      textValue="View designation details"
                    >
                      View Details
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      startContent={<Icon icon="lucide:edit" />}
                      onPress={() => onEdit(designation)}
                      textValue="Edit designation information"
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Icon icon="lucide:trash-2" />}
                      onPress={() => onDelete(designation.id)}
                      textValue="Delete designation"
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
            aria-label="Designation table pagination"
          />
        </div>
      )}
    </>
  );
};

export default DesignationTable;
