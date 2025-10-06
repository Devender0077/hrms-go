import { useState, useMemo } from 'react';

interface UseDataTableOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  initialSortField?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
  pageSize?: number;
}

export function useDataTable<T>({
  data,
  searchFields = [],
  initialSortField,
  initialSortDirection = 'asc',
  pageSize = 10
}: UseDataTableOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof T | undefined>(initialSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const filteredData = useMemo(() => {
    if (!searchTerm || searchFields.length === 0) {
      return data;
    }

    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchFields]);

  const sortedData = useMemo(() => {
    if (!sortField) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems([...paginatedData]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(selected => selected !== item));
    }
  };

  return {
    // Data
    data: paginatedData,
    filteredData,
    sortedData,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Sort
    sortField,
    sortDirection,
    handleSort,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    
    // Selection
    selectedItems,
    setSelectedItems,
    handleSelectAll,
    handleSelectItem,
    
    // Stats
    totalItems: data.length,
    filteredItems: filteredData.length,
    selectedCount: selectedItems.length
  };
}

