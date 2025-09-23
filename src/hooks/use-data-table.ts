// Custom hook for data tables with sorting, filtering, and pagination
    import React from 'react';
    
    interface PaginationState {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }
    
    interface SortState {
      column: string | null;
      direction: 'asc' | 'desc';
    }
    
    interface FilterState {
      [key: string]: any;
    }
    
    interface DataTableOptions<T> {
      initialData?: T[];
      initialPagination?: Partial<PaginationState>;
      initialSort?: Partial<SortState>;
      initialFilters?: FilterState;
      fetchData?: (params: any) => Promise<{ data: T[], pagination: PaginationState }>;
      manualPagination?: boolean;
      manualSorting?: boolean;
      manualFiltering?: boolean;
      debounceTime?: number;
    }
    
    interface DataTableState<T> {
      data: T[];
      displayData: T[];
      loading: boolean;
      error: string | null;
      pagination: PaginationState;
      sort: SortState;
      filters: FilterState;
      selectedRows: Set<string | number>;
    }
    
    interface DataTableActions<T> {
      setPage: (page: number) => void;
      setPageSize: (pageSize: number) => void;
      setSorting: (column: string, direction?: 'asc' | 'desc') => void;
      setFilter: (key: string, value: any) => void;
      clearFilters: () => void;
      refresh: () => void;
      selectRow: (id: string | number) => void;
      deselectRow: (id: string | number) => void;
      selectAll: () => void;
      deselectAll: () => void;
      isSelected: (id: string | number) => boolean;
    }
    
    export function useDataTable<T>(options: DataTableOptions<T>): [DataTableState<T>, DataTableActions<T>] {
      const {
        initialData = [],
        initialPagination = {},
        initialSort = {},
        initialFilters = {},
        fetchData,
        manualPagination = false,
        manualSorting = false,
        manualFiltering = false,
        debounceTime = 300
      } = options;
      
      // State for data table
      const [state, setState] = React.useState<DataTableState<T>>({
        data: initialData,
        displayData: initialData,
        loading: false,
        error: null,
        pagination: {
          page: initialPagination.page || 1,
          pageSize: initialPagination.pageSize || 10,
          total: initialPagination.total || initialData.length,
          totalPages: initialPagination.totalPages || Math.ceil((initialPagination.total || initialData.length) / (initialPagination.pageSize || 10))
        },
        sort: {
          column: initialSort.column || null,
          direction: initialSort.direction || 'asc'
        },
        filters: initialFilters,
        selectedRows: new Set<string | number>()
      });
      
      // Debounce function for filtering
      const debounce = React.useCallback((fn: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        };
      }, []);
      
      // Fetch data from API
      const fetchTableData = React.useCallback(async () => {
        if (!fetchData) return;
        
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
          const params = {
            page: state.pagination.page,
            limit: state.pagination.pageSize,
            sort: state.sort.column,
            order: state.sort.direction,
            ...state.filters
          };
          
          const response = await fetchData(params);
          
          setState(prev => ({
            ...prev,
            data: response.data,
            displayData: response.data,
            loading: false,
            pagination: {
              ...prev.pagination,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages
            }
          }));
        } catch (error) {
          console.error('Error fetching data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to fetch data'
          }));
        }
      }, [fetchData, state.pagination.page, state.pagination.pageSize, state.sort, state.filters]);
      
      // Process data locally (client-side)
      const processData = React.useCallback(() => {
        if (manualPagination && manualSorting && manualFiltering) return;
        
        let processed = [...state.data];
        
        // Apply filters (client-side)
        if (!manualFiltering && Object.keys(state.filters).length > 0) {
          processed = processed.filter(item => {
            return Object.entries(state.filters).every(([key, value]) => {
              if (!value) return true;
              
              const itemValue = item[key];
              
              if (typeof value === 'string') {
                return String(itemValue).toLowerCase().includes(value.toLowerCase());
              }
              
              return itemValue === value;
            });
          });
        }
        
        // Apply sorting (client-side)
        if (!manualSorting && state.sort.column) {
          processed.sort((a, b) => {
            const aValue = a[state.sort.column as keyof T];
            const bValue = b[state.sort.column as keyof T];
            
            if (aValue < bValue) return state.sort.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return state.sort.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
        
        // Calculate pagination values
        const total = processed.length;
        const totalPages = Math.ceil(total / state.pagination.pageSize);
        
        // Apply pagination (client-side)
        if (!manualPagination) {
          const start = (state.pagination.page - 1) * state.pagination.pageSize;
          const end = start + state.pagination.pageSize;
          processed = processed.slice(start, end);
        }
        
        setState(prev => ({
          ...prev,
          displayData: processed,
          pagination: {
            ...prev.pagination,
            total,
            totalPages
          }
        }));
      }, [state.data, state.filters, state.sort, state.pagination.page, state.pagination.pageSize, manualPagination, manualSorting, manualFiltering]);
      
      // Effect for fetching or processing data
      React.useEffect(() => {
        if (fetchData) {
          fetchTableData();
        } else {
          processData();
        }
      }, [fetchTableData, processData]);
      
      // Actions
      const setPage = (page: number) => {
        setState(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            page
          }
        }));
      };
      
      const setPageSize = (pageSize: number) => {
        setState(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            pageSize,
            page: 1 // Reset to first page when changing page size
          }
        }));
      };
      
      const setSorting = (column: string, direction?: 'asc' | 'desc') => {
        setState(prev => ({
          ...prev,
          sort: {
            column,
            direction: direction || (prev.sort.column === column && prev.sort.direction === 'asc' ? 'desc' : 'asc')
          }
        }));
      };
      
      const setFilter = debounce((key: string, value: any) => {
        setState(prev => ({
          ...prev,
          filters: {
            ...prev.filters,
            [key]: value
          },
          pagination: {
            ...prev.pagination,
            page: 1 // Reset to first page when filtering
          }
        }));
      }, debounceTime);
      
      const clearFilters = () => {
        setState(prev => ({
          ...prev,
          filters: {},
          pagination: {
            ...prev.pagination,
            page: 1 // Reset to first page when clearing filters
          }
        }));
      };
      
      const refresh = () => {
        if (fetchData) {
          fetchTableData();
        } else {
          processData();
        }
      };
      
      const selectRow = (id: string | number) => {
        setState(prev => {
          const newSelected = new Set(prev.selectedRows);
          newSelected.add(id);
          return {
            ...prev,
            selectedRows: newSelected
          };
        });
      };
      
      const deselectRow = (id: string | number) => {
        setState(prev => {
          const newSelected = new Set(prev.selectedRows);
          newSelected.delete(id);
          return {
            ...prev,
            selectedRows: newSelected
          };
        });
      };
      
      const selectAll = () => {
        setState(prev => {
          const newSelected = new Set<string | number>();
          prev.displayData.forEach((item: any) => {
            if (item.id) newSelected.add(item.id);
          });
          return {
            ...prev,
            selectedRows: newSelected
          };
        });
      };
      
      const deselectAll = () => {
        setState(prev => ({
          ...prev,
          selectedRows: new Set<string | number>()
        }));
      };
      
      const isSelected = (id: string | number) => {
        return state.selectedRows.has(id);
      };
      
      const actions: DataTableActions<T> = {
        setPage,
        setPageSize,
        setSorting,
        setFilter,
        clearFilters,
        refresh,
        selectRow,
        deselectRow,
        selectAll,
        deselectAll,
        isSelected
      };
      
      return [state, actions];
    }
    
    export default useDataTable;
