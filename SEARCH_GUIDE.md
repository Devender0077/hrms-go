# 🔍 Search System - Complete Guide

## ✅ **Search IS Working!**

Search is already implemented in all major data tables throughout the application.

---

## 🎯 How Search Works

### Implementation Pattern:

```typescript
import { useState, useMemo } from 'react';

function MyDataPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  
  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);
  
  return (
    <div>
      {/* Search Input */}
      <Input
        placeholder="Search by name, email, or ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        startContent={<Icon icon="lucide:search" />}
        isClearable
        onClear={() => setSearchQuery('')}
      />
      
      {/* Display filtered data */}
      <Table>
        {filteredData.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}
```

---

## 📊 Pages with Working Search

### ✅ Already Implemented:

1. **Employees Page** (`src/pages/employees.tsx`)
   - Search by: name, email, employee ID, department

2. **Attendance Page** (`src/pages/timekeeping/attendance-refactored.tsx`)
   - Search by: employee name, employee ID, department
   - Code: Lines 47-86

3. **Users Page** (`src/pages/users.tsx`)
   - Search by: name, email, role

4. **Roles Page** (`src/pages/roles.tsx`)
   - Search by: role name, description

5. **Holidays Page** (`src/pages/leave/holidays.tsx`)
   - Search by: holiday name, country
   - Filter by: country (India, USA, Global)

---

## 🔧 Search Features

### 1. **Real-Time Filtering**
- Updates as you type
- No delay or lag
- Uses `useMemo` for performance

### 2. **Case-Insensitive**
- Searches ignore case
- "john" matches "John", "JOHN", "JoHn"

### 3. **Multiple Fields**
- Searches across multiple columns
- Name, email, ID, department, etc.

### 4. **Clear Button**
- `isClearable` prop on Input
- Clears search with one click

---

## 💡 Adding Search to New Pages

### Step 1: Add State
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

### Step 2: Create Filter Logic
```typescript
const filteredData = useMemo(() => {
  if (!searchQuery) return data;
  
  return data.filter(item =>
    // Add all fields you want to search
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [data, searchQuery]);
```

### Step 3: Add Search Input
```typescript
<Input
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  startContent={<Icon icon="lucide:search" />}
  isClearable
  onClear={() => setSearchQuery('')}
  className="max-w-xs"
/>
```

### Step 4: Use Filtered Data
```typescript
<Table>
  {filteredData.map(item => (
    // Render your data
  ))}
</Table>
```

---

## 🎨 Search UI Patterns

### Pattern 1: Search with Filters
```typescript
<div className="flex gap-4">
  <Input
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    startContent={<Icon icon="lucide:search" />}
    className="flex-1"
  />
  <Select
    placeholder="Filter by status"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <SelectItem value="all">All</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
  </Select>
</div>
```

### Pattern 2: Search with Stats
```typescript
<div className="flex justify-between items-center">
  <Input
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    startContent={<Icon icon="lucide:search" />}
  />
  <p className="text-sm text-default-500">
    Showing {filteredData.length} of {data.length} results
  </p>
</div>
```

### Pattern 3: Advanced Search
```typescript
const filteredData = useMemo(() => {
  let result = data;
  
  // Apply search query
  if (searchQuery) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply status filter
  if (statusFilter !== 'all') {
    result = result.filter(item => item.status === statusFilter);
  }
  
  // Apply date filter
  if (dateFilter) {
    result = result.filter(item => item.date === dateFilter);
  }
  
  return result;
}, [data, searchQuery, statusFilter, dateFilter]);
```

---

## 🚀 Performance Optimization

### Use `useMemo` for Large Datasets
```typescript
const filteredData = useMemo(() => {
  // Filtering logic
}, [data, searchQuery]); // Only recompute when these change
```

### Debounce for API Search (Optional)
```typescript
import { useEffect } from 'react';

const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 300); // Wait 300ms after user stops typing
  
  return () => clearTimeout(timer);
}, [searchQuery]);

// Use debouncedQuery for API calls
useEffect(() => {
  if (debouncedQuery) {
    fetchData({ search: debouncedQuery });
  }
}, [debouncedQuery]);
```

---

## 🔍 Search Examples from Codebase

### Example 1: Attendance Page
**File**: `src/pages/timekeeping/attendance-refactored.tsx`

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredRecords = useMemo(() => {
  if (!searchQuery) return attendanceRecords;
  
  return attendanceRecords.filter(record =>
    record.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (record.department && record.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );
}, [attendanceRecords, searchQuery]);
```

### Example 2: Employees Page
**File**: `src/components/employees/EmployeeFilters.tsx`

Search by name, email, department, designation, status.

---

## 🎯 Testing Search

### Test Checklist:
1. ✅ Go to any page with data table
2. ✅ Type in search box
3. ✅ Results filter in real-time
4. ✅ Clear search to see all results
5. ✅ Try different search terms

### Pages to Test:
- `/dashboard/employees` - Search employees
- `/dashboard/timekeeping/attendance` - Search attendance
- `/dashboard/users` - Search users
- `/dashboard/users/roles` - Search roles
- `/dashboard/leave/holidays` - Search holidays

---

## 💡 Tips & Best Practices

### 1. **Search Multiple Fields**
Always search across multiple relevant fields:
```typescript
item.name.includes(query) ||
item.email.includes(query) ||
item.id.includes(query)
```

### 2. **Case-Insensitive**
Always convert to lowercase:
```typescript
.toLowerCase().includes(query.toLowerCase())
```

### 3. **Handle Null/Undefined**
Check for null values:
```typescript
(item.department && item.department.includes(query))
```

### 4. **Trim Whitespace**
```typescript
const query = searchQuery.trim().toLowerCase();
```

### 5. **Show Results Count**
```typescript
<p>Showing {filteredData.length} of {data.length} results</p>
```

---

## 🐛 Troubleshooting

### Search Not Working?

1. **Check State**:
   ```typescript
   console.log('Search query:', searchQuery);
   console.log('Filtered data:', filteredData.length);
   ```

2. **Check useMemo Dependencies**:
   ```typescript
   useMemo(() => {
     // ...
   }, [data, searchQuery]); // Make sure dependencies are correct
   ```

3. **Check Input Binding**:
   ```typescript
   value={searchQuery}  // Must be controlled
   onChange={(e) => setSearchQuery(e.target.value)}  // Must update state
   ```

---

## ✅ Summary

- ✅ Search is **fully implemented**
- ✅ Works on all major pages
- ✅ Real-time filtering
- ✅ Case-insensitive
- ✅ Multiple field search
- ✅ Performance optimized with `useMemo`

**Search is working perfectly!** 🔍✨
