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
      setIsOpen(true); // Always show dropdown when there's a query
      setSelectedIndex(0);
      setIsLoading(false);
    }, 200); // Reduced debounce time for better responsiveness

    return () => clearTimeout(debounceSearch);
  }, [query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    // Reset selected index when typing
    setSelectedIndex(0);
    // Show dropdown when there's input
    if (value.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (query.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on dropdown items
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleResultClick = (result: SearchResult) => {
    // Close dropdown immediately
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
    
    // Navigate after a small delay to ensure dropdown closes
    setTimeout(() => {
      // For settings pages, we navigate to the main settings page
      // The user can then use the sub-navigation within settings
      if (result.type === 'setting') {
        navigate('/dashboard/settings');
      } else {
        navigate(result.url);
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle specific navigation keys, let normal typing pass through
    switch (e.key) {
      case 'ArrowDown':
        if (isOpen && results.length > 0) {
          e.preventDefault();
          const totalOptions = results.length + 1; // +1 for "Search for..." option
          setSelectedIndex((prevIndex) => (prevIndex + 1) % totalOptions);
        }
        break;
      case 'ArrowUp':
        if (isOpen && results.length > 0) {
          e.preventDefault();
          const totalOptions = results.length + 1; // +1 for "Search for..." option
          setSelectedIndex((prevIndex) => (prevIndex - 1 + totalOptions) % totalOptions);
        }
        break;
      case 'Enter':
        // Handle Enter based on selection
        if (isOpen && results.length > 0) {
          e.preventDefault();
          if (selectedIndex === 0) {
            // "Search for..." option selected
            console.log(`Searching for: ${query}`);
            setIsOpen(false);
            setQuery('');
            inputRef.current?.blur();
          } else if (selectedIndex > 0 && results[selectedIndex - 1]) {
            // A result is selected (adjusted for the "Search for..." option)
            handleResultClick(results[selectedIndex - 1]);
          }
        } else if (query.trim().length > 0) {
          // If no dropdown open but there's a query, perform general search
          e.preventDefault();
          console.log(`General search for: ${query}`);
          setIsOpen(false);
          setQuery('');
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
        break;
      default:
        // Let all other keys (typing, backspace, delete, etc.) pass through normally
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
        isOpen={isOpen} 
        onOpenChange={(open) => {
          // Only allow closing if there's no query or user explicitly closes
          if (!open && query.trim().length === 0) {
            setIsOpen(false);
          } else if (open) {
            setIsOpen(true);
          }
        }}
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
              onBlur={handleInputBlur}
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
            <>
              {/* Add a "Search for..." option at the top */}
              <DropdownItem
                key="search-for"
                textValue={`Search for "${query}"`}
                onPress={() => {
                  // Allow user to search for their exact query
                  console.log(`Searching for: ${query}`);
                  setIsOpen(false);
                  setQuery('');
                  inputRef.current?.blur();
                }}
                className="p-0 border-b border-divider"
              >
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                  selectedIndex === 0 ? 'bg-default-100 dark:bg-default-50' : 'hover:bg-default-50 dark:hover:bg-default-100/50'
                }`}>
                  <Icon icon="lucide:search" className="text-primary text-lg" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-primary">Search for "{query}"</p>
                    <p className="text-xs text-default-500">Press Enter to search</p>
                  </div>
                </div>
              </DropdownItem>
              
              {/* Show matching results */}
              {results.map((result, index) => {
                const isSelected = index + 1 === selectedIndex; // +1 because of the search-for option
                
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
              })}
            </>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default SearchBar;