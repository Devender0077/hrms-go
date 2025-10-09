import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Checkbox,
  Pagination,
  Card,
  CardBody
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useDataTable } from '../../hooks/useDataTable';
import { useTranslation } from '../../contexts/translation-context';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  actions?: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchFields,
  searchPlaceholder = 'Search...',
  onRowClick,
  onSelectionChange,
  actions,
  loading = false,
  emptyMessage = 'No data available',
  pageSize = 10
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const {
    data: paginatedData,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    totalItems,
    filteredItems
  } = useDataTable({
    data,
    searchFields,
    pageSize
  });

  React.useEffect(() => {
    onSelectionChange?.(selectedItems);
  }, [selectedItems, onSelectionChange]);

  const renderCell = (column: Column<T>, item: T) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    return value?.toString() || '-';
  };

  const getSortIcon = (columnKey: keyof T) => {
    if (sortField !== columnKey) {
      return <Icon icon="lucide:chevrons-up-down" className="text-default-400" />;
    }
    
    return sortDirection === 'asc' 
      ? <Icon icon="lucide:chevron-up" className="text-primary" />
      : <Icon icon="lucide:chevron-down" className="text-primary" />;
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Icon icon="lucide:loader-2" className="text-4xl animate-spin mx-auto mb-4" />
              <p className="text-default-500">{t('Loading data...')}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        {/* Header with search and actions */}
        <div className="p-4 border-b border-divider">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Input
                placeholder={searchPlaceholder}
                
                onValueChange={setSearchTerm}
                startContent={<Icon icon="lucide:search" />}
                className="max-w-sm"
              />
              <Chip color="primary" variant="flat">
                {filteredItems} {t('of')} {totalItems} {t('items')}
              </Chip>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <Table
          aria-label="Data table"
          selectionMode="multiple"
          selectedKeys={new Set(selectedItems.map((_, index) => index.toString()))}
          onSelectionChange={(keys) => {
            const isAllSelected = keys === 'all';
            handleSelectAll(isAllSelected);
          }}
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn
                key={column.key as string}
                className={column.sortable ? 'cursor-pointer' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody emptyContent={emptyMessage}>
            {paginatedData.map((item, index) => (
              <TableRow
                key={index}
                className={onRowClick ? 'cursor-pointer hover:bg-default-50' : ''}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key as string}>
                    {renderCell(column, item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-divider">
            <div className="flex items-center justify-between">
              <p className="text-small text-default-500">
                Page {currentPage} of {totalPages}
              </p>
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                showShadow
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

