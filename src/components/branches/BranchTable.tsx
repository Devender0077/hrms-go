import React from 'react';
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Button, Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Branch } from '../../hooks/useBranches';

interface BranchTableProps {
  branches: Branch[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  onView: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (id: number) => void;
}

const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  page,
  totalPages,
  setPage,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <Table aria-label="Branches table">
        <TableHeader>
          <TableColumn>BRANCH</TableColumn>
          <TableColumn>LOCATION</TableColumn>
          <TableColumn>EMPLOYEES</TableColumn>
          <TableColumn>DEPARTMENTS</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No branches found">
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon icon="lucide:building" className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{branch.name}</p>
                    <p className="text-sm text-default-500 line-clamp-1">
                      {branch.city && branch.country ? `${branch.city}, ${branch.country}` : branch.location || 'No location'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:map-pin" className="text-default-400 text-sm" />
                  <span className="text-sm">{branch.location || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-success-600">{branch.employee_count}</span>
                  </div>
                  <span className="text-sm text-default-600">employees</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-secondary-600">{branch.department_count}</span>
                  </div>
                  <span className="text-sm text-default-600">departments</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="text-default-400 text-sm" />
                  <span className="text-sm">
                    {new Date(branch.created_at).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Dropdown closeOnSelect>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light" aria-label={`Actions for branch ${branch.name}`}>
                      <Icon icon="lucide:more-vertical" className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label={`Branch actions for ${branch.name}`}>
                    <DropdownItem
                      key="view"
                      startContent={<Icon icon="lucide:eye" />}
                      onPress={() => onView(branch)}
                      textValue="View branch details"
                    >
                      View Details
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      startContent={<Icon icon="lucide:edit" />}
                      onPress={() => onEdit(branch)}
                      textValue="Edit branch information"
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Icon icon="lucide:trash-2" />}
                      onPress={() => onDelete(branch.id)}
                      textValue="Delete branch"
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
            aria-label="Branch table pagination"
          />
        </div>
      )}
    </>
  );
};

export default BranchTable;
