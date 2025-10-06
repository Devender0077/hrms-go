import React from "react";
    import { 
      Table, 
      TableHeader, 
      TableColumn, 
      TableBody, 
      TableRow, 
      TableCell,
      Pagination,
      Input,
      Button,
      Dropdown,
      DropdownTrigger,
      DropdownMenu,
      DropdownItem,
      Chip,
      Spinner,
      Selection
    } from "@heroui/react";
    import { Icon } from "@iconify/react";
    import useDataTable from "../../hooks/use-data-table";
    
    export interface Column<T> {
      key: string;
      label: string;
      sortable?: boolean;
      filterable?: boolean;
      renderCell?: (item: T) => React.ReactNode;
      width?: string;
      align?: "start" | "center" | "end";
    }
    
    interface DataTableProps<T> {
      columns: Column<T>[];
      data?: T[];
      fetchData?: (params: any) => Promise<{ data: T[], pagination: any }>;
      manualPagination?: boolean;
      manualSorting?: boolean;
      manualFiltering?: boolean;
      selectionMode?: "single" | "multiple" | "none";
      onSelectionChange?: (keys: Selection) => void;
      onRowAction?: (key: string | number, action: string) => void;
      rowActions?: { key: string; label: string; icon?: string; color?: string }[];
      searchPlaceholder?: string;
      emptyContent?: React.ReactNode;
      loadingContent?: React.ReactNode;
      errorContent?: React.ReactNode;
      initialFilters?: Record<string, any>;
      initialSort?: { column: string; direction: "asc" | "desc" };
      initialPage?: number;
      initialPageSize?: number;
      showHeader?: boolean;
      className?: string;
      ariaLabel?: string;
    }
    
    function DataTable<T extends { id: string | number }>({
      columns,
      data = [],
      fetchData,
      manualPagination = false,
      manualSorting = false,
      manualFiltering = false,
      selectionMode = "none",
      onSelectionChange,
      onRowAction,
      rowActions = [],
      searchPlaceholder = "Search...",
      emptyContent = "No data to display",
      loadingContent,
      errorContent,
      initialFilters = {},
      initialSort,
      initialPage = 1,
      initialPageSize = 10,
      showHeader = true,
      className,
      ariaLabel = "Data table"
    }: DataTableProps<T>) {
      const [searchQuery, setSearchQuery] = React.useState("");
      const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
      
      const [tableState, tableActions] = useDataTable<T>({
        initialData: data,
        initialPagination: {
          page: initialPage,
          pageSize: initialPageSize
        },
        initialSort: initialSort || { column: null, direction: "asc" },
        initialFilters: initialFilters,
        fetchData,
        manualPagination,
        manualSorting,
        manualFiltering
      });
      
      // Handle search input change
      const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        tableActions.setFilter("search", value);
      };
      
      // Handle sort change
      const handleSortChange = (columnKey: string) => {
        const column = columns.find(col => col.key === columnKey);
        
        if (column?.sortable) {
          tableActions.setSorting(columnKey);
        }
      };
      
      // Handle selection change
      const handleSelectionChange = (keys: Selection) => {
        setSelectedKeys(keys);
        
        if (onSelectionChange) {
          onSelectionChange(keys);
        }
      };
      
      // Handle row action
      const handleRowAction = (key: string | number, action: string) => {
        if (onRowAction) {
          onRowAction(key, action);
        }
      };
      
      // Render loading state
      if (tableState.loading && !tableState.data.length) {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            {loadingContent || (
              <>
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-default-500">Loading data...</p>
              </>
            )}
          </div>
        );
      }
      
      // Render error state
      if (tableState.error) {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            {errorContent || (
              <>
                <Icon icon="lucide:alert-circle" className="text-5xl text-danger" />
                <p className="mt-4 text-danger">{tableState.error}</p>
                <Button 
                  color="primary" 
                  className="mt-4" 
                  onPress={tableActions.refresh}
                >
                  Retry
                </Button>
              </>
            )}
          </div>
        );
      }
      
      return (
        <div className={`w-full ${className || ""}`}>
          {/* Table Header with Search and Filters */}
          {showHeader && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <Input
                isClearable
                placeholder={searchPlaceholder}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                
                onValueChange={handleSearchChange}
                className="w-full sm:max-w-[44%]"
              />
              
              <div className="flex gap-2">
                {/* Add any additional filters or actions here */}
                {(selectedKeys === 'all' || (selectedKeys instanceof Set && selectedKeys.size > 0)) && (
                  <Button 
                    color="danger" 
                    variant="flat" 
                    onPress={() => setSelectedKeys(new Set([]))}
                    startContent={<Icon icon="lucide:trash" />}
                  >
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Data Table */}
          <Table
            removeWrapper
            aria-label={ariaLabel}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectionChange}
            bottomContent={
              tableState.pagination.totalPages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={tableState.pagination.page}
                    total={tableState.pagination.totalPages}
                    onChange={tableActions.setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              {columns.map((column) => (
                <TableColumn
                  key={column.key}
                  allowsSorting={column.sortable}
                  align={column.align || "start"}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableColumn>
              )) as any}
              {rowActions.length > 0 && (
                <TableColumn align="center" style={{ width: "100px" }}>
                  Actions
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={emptyContent}
              loadingContent={loadingContent}
              loadingState={tableState.loading ? "loading" : "idle"}
              items={tableState.displayData}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={`${item.id}-${column.key}`}>
                      {column.renderCell ? column.renderCell(item) : (item[column.key as keyof T] as React.ReactNode)}
                    </TableCell>
                  )) as any}
                  
                  {/* Row Actions */}
                  {rowActions.length > 0 && (
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        {rowActions.length <= 3 ? (
                          // Show buttons if 3 or fewer actions
                          rowActions.map((action) => (
                            <Button
                              key={action.key}
                              isIconOnly
                              size="sm"
                              variant="light"
                              color={action.color as any || "default"}
                              onPress={() => handleRowAction(item.id, action.key)}
                            >
                              <Icon icon={action.icon || "lucide:more-horizontal"} />
                            </Button>
                          ))
                        ) : (
                          // Show dropdown if more than 3 actions
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light" aria-label="Row actions">
                                <Icon icon="lucide:more-horizontal" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Row Actions">
                              {rowActions.map((action) => (
                                <DropdownItem
                                  key={action.key}
                                  startContent={action.icon && <Icon icon={action.icon} />}
                                  color={action.color as any || "default"}
                                  onPress={() => handleRowAction(item.id, action.key)}
                                >
                                  {action.label}
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }
    
    export default DataTable;
