import React, { useState, useEffect, useRef } from 'react';
import { Input, Kbd, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  shortcutKey?: string;
}

interface SearchResult {
  id: string;
  type: 'page' | 'employee' | 'task' | 'setting';
  title: string;
  description: string;
  icon: string;
  url: string;
  category?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search anything...',
  className,
  shortcutKey = 'k'
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock search results - in a real app, this would come from an API
  const mockResults: SearchResult[] = [
    // Pages
    { id: '1', type: 'page', title: 'Dashboard Overview', description: 'Main dashboard analytics', icon: 'lucide:layout-dashboard', url: '/dashboard', category: 'Pages' },
    { id: '5', type: 'page', title: 'Employee List', description: 'Browse all employees', icon: 'lucide:users', url: '/dashboard/employees', category: 'Pages' },
    { id: '9', type: 'page', title: 'Leave Applications', description: 'Manage employee leave requests', icon: 'lucide:calendar-minus', url: '/dashboard/leave/applications', category: 'Pages' },
    { id: '11', type: 'page', title: 'Payroll History', description: 'View past payrolls and payslips', icon: 'lucide:dollar-sign', url: '/dashboard/payroll/history', category: 'Pages' },
    { id: '12', type: 'page', title: 'Attendance Records', description: 'Track employee attendance', icon: 'lucide:calendar-check', url: '/dashboard/time-tracking/attendance', category: 'Pages' },
    { id: '13', type: 'page', title: 'Recruitment Dashboard', description: 'Overview of job openings and candidates', icon: 'lucide:briefcase', url: '/dashboard/recruitment', category: 'Pages' },
    { id: '14', type: 'page', title: 'Performance Reviews', description: 'Manage employee performance reviews', icon: 'lucide:award', url: '/dashboard/performance/reviews', category: 'Pages' },
    { id: '15', type: 'page', title: 'Asset Management', description: 'Manage company assets', icon: 'lucide:hard-drive', url: '/dashboard/asset-management', category: 'Pages' },
    { id: '16', type: 'page', title: 'Training Programs', description: 'Browse and manage training courses', icon: 'lucide:graduation-cap', url: '/dashboard/training/programs', category: 'Pages' },

    // Employees
    { id: '2', type: 'employee', title: 'John Doe Profile', description: 'View John Doe\'s employee details', icon: 'lucide:user', url: '/dashboard/employees/1', category: 'Employees' },
    { id: '8', type: 'employee', title: 'Jane Smith Profile', description: 'View Jane Smith\'s employee details', icon: 'lucide:user', url: '/dashboard/employees/2', category: 'Employees' },
    { id: '17', type: 'employee', title: 'Alice Johnson', description: 'HR Manager', icon: 'lucide:user', url: '/dashboard/employees/3', category: 'Employees' },
    { id: '18', type: 'employee', title: 'Bob Williams', description: 'Software Engineer', icon: 'lucide:user', url: '/dashboard/employees/4', category: 'Employees' },

    // Tasks
    { id: '3', type: 'task', title: 'Review Q3 Performance', description: 'Performance review for the third quarter', icon: 'lucide:check-square', url: '/dashboard/tasks/5', category: 'Tasks' },
    { id: '6', type: 'task', title: 'Onboard New Hire', description: 'Complete onboarding process for new employee', icon: 'lucide:user-plus', url: '/dashboard/tasks/new', category: 'Tasks' },
    { id: '19', type: 'task', title: 'Update Company Policy', description: 'Review and publish new remote work policy', icon: 'lucide:file-text', url: '/dashboard/tasks/6', category: 'Tasks' },
    { id: '20', type: 'task', title: 'Schedule Team Meeting', description: 'Organize weekly sync-up for development team', icon: 'lucide:calendar', url: '/dashboard/tasks/7', category: 'Tasks' },

    // Settings
    { id: '4', type: 'setting', title: 'General Settings', description: 'Configure application general settings', icon: 'lucide:settings', url: '/dashboard/settings', category: 'Settings' },
    { id: '7', type: 'setting', title: 'Email Configuration', description: 'Manage email server settings', icon: 'lucide:mail', url: '/dashboard/settings', category: 'Settings' },
    { id: '10', type: 'setting', title: 'Security Settings', description: 'Configure security and privacy options', icon: 'lucide:shield', url: '/dashboard/settings', category: 'Settings' },
    { id: '21', type: 'setting', title: 'Integration Settings', description: 'Manage third-party integrations like Slack', icon: 'lucide:plug', url: '/dashboard/settings', category: 'Settings' },
    { id: '22', type: 'setting', title: 'Localization Settings', description: 'Adjust language and timezone settings', icon: 'lucide:globe', url: '/dashboard/settings', category: 'Settings' },
  ];

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === shortcutKey) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey]);

  // Search functionality
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const debounceSearch = setTimeout(() => {
      const filtered = mockResults.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleInputFocus = () => {
    if (query.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex !== -1 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  const getIconForType = (type: SearchResult['type']) => {
    switch (type) {
      case 'page': return 'lucide:file-text';
      case 'employee': return 'lucide:user';
      case 'task': return 'lucide:check-square';
      case 'setting': return 'lucide:settings';
      default: return 'lucide:search';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Dropdown 
        isOpen={isOpen && (query.trim().length > 0 || isLoading)} 
        onOpenChange={setIsOpen}
        placement="bottom-start"
        className="w-full max-w-md"
      >
        <DropdownTrigger>
          <div>
            <Input
              ref={inputRef}
              value={query}
              onValueChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              endContent={
                <div className="flex items-center gap-1">
                  <Kbd keys={["command"]}>{shortcutKey.toUpperCase()}</Kbd>
                </div>
              }
              classNames={{
                input: "text-sm",
                inputWrapper: "h-10"
              }}
            />
          </div>
        </DropdownTrigger>
        
        <DropdownMenu
          aria-label="Search results"
          className="w-full max-w-md max-h-96 overflow-y-auto"
          closeOnSelect={false}
        >
          {isLoading ? (
            <DropdownItem key="loading" textValue="loading">
              <div className="flex items-center justify-center py-4">
                <Icon icon="lucide:loader-2" className="animate-spin text-xl text-default-400" />
                <span className="ml-2 text-sm text-default-500">Searching...</span>
              </div>
            </DropdownItem>
          ) : results.length === 0 && query.trim().length > 0 ? (
            <DropdownItem key="no-results" textValue="no-results">
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Icon icon="lucide:search-x" className="text-2xl text-default-300 mb-2" />
                <p className="text-sm text-default-500">No results found</p>
                <p className="text-xs text-default-400 mt-1">Try a different search term</p>
              </div>
            </DropdownItem>
          ) : (
            results.map((result, index) => {
              const isSelected = index === selectedIndex;
              
              return (
                <DropdownItem
                  key={result.id}
                  textValue={result.title}
                  onPress={() => handleResultClick(result)}
                  className={`p-0 ${isSelected ? 'bg-default-100' : ''}`}
                >
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                      isSelected ? 'bg-default-100 dark:bg-default-50' : 'hover:bg-default-50 dark:hover:bg-default-100/50'
                    }`}
                  >
                    <Icon icon={getIconForType(result.type)} className="text-default-500 text-lg" />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-foreground">{result.title}</p>
                      <p className="text-xs text-default-500">{result.description}</p>
                    </div>
                  </div>
                </DropdownItem>
              );
            })
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default SearchBar;