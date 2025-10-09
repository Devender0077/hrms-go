import React, { useState, useEffect, useRef } from 'react';
import { Input, Kbd, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { useTranslation } from '../../contexts/translation-context';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  shortcutKey?: string;
}

interface SearchResult {
  id: string;
  type: 'page' | 'employee' | 'task' | 'setting' | 'announcement' | 'user';
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
  const { t } = useTranslation();

  // Static page results for quick navigation (translated)
  const staticPages: SearchResult[] = [
    { id: 'page-1', type: 'page', title: t('Dashboard'), description: t('Main dashboard analytics'), icon: 'lucide:layout-dashboard', url: '/dashboard', category: t('Pages') },
    { id: 'page-2', type: 'page', title: t('Employees'), description: t('Browse all employees'), icon: 'lucide:users', url: '/dashboard/employees', category: t('Pages') },
    { id: 'page-3', type: 'page', title: t('Attendance'), description: t('Track employee attendance'), icon: 'lucide:clock', url: '/dashboard/timekeeping/attendance', category: t('Pages') },
    { id: 'page-4', type: 'page', title: t('Leave Applications'), description: t('Manage leave requests'), icon: 'lucide:calendar-minus', url: '/dashboard/leave/applications', category: t('Pages') },
    { id: 'page-5', type: 'page', title: t('Payroll Overview'), description: t('View payroll information'), icon: 'lucide:dollar-sign', url: '/dashboard/payroll', category: t('Pages') },
    { id: 'page-6', type: 'page', title: t('Users'), description: t('Manage system users'), icon: 'lucide:users-cog', url: '/dashboard/users', category: t('Pages') },
    { id: 'page-7', type: 'page', title: t('Roles & Permissions'), description: t('Manage roles and permissions'), icon: 'lucide:shield', url: '/dashboard/users/roles', category: t('Pages') },
    { id: 'page-8', type: 'page', title: t('Settings'), description: t('Configure system settings'), icon: 'lucide:settings', url: '/dashboard/settings', category: t('Pages') },
    { id: 'page-9', type: 'page', title: t('Announcements'), description: t('Company announcements'), icon: 'lucide:megaphone', url: '/dashboard/announcements', category: t('Pages') },
    { id: 'page-10', type: 'page', title: t('Messenger'), description: t('Send and receive messages'), icon: 'lucide:message-circle', url: '/dashboard/messenger', category: t('Pages') },
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

  // Search functionality with real API data
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const debounceSearch = setTimeout(async () => {
      try {
        const allResults: SearchResult[] = [...staticPages];
        
        // Search employees
        try {
          const empResponse = await apiRequest(`/employees?search=${query}&limit=5`);
          if (empResponse.success && empResponse.data) {
            const empResults = empResponse.data.map((emp: any) => ({
              id: `emp-${emp.id}`,
              type: 'employee' as const,
              title: `${emp.first_name} ${emp.last_name}`,
              description: `${emp.designation_name || 'Employee'} - ${emp.department_name || 'N/A'}`,
              icon: 'lucide:user',
              url: `/dashboard/employees/${emp.id}`,
              category: 'Employees'
            }));
            allResults.push(...empResults);
          }
        } catch (error) {
          console.log('Employee search failed:', error);
        }
        
        // Search users
        try {
          const userResponse = await apiRequest(`/users?search=${query}&limit=5`);
          if (userResponse.success && userResponse.data) {
            const userResults = userResponse.data.map((user: any) => ({
              id: `user-${user.id}`,
              type: 'user' as const,
              title: user.name,
              description: `${user.email} - ${user.role_name || user.role}`,
              icon: 'lucide:user-cog',
              url: `/dashboard/users`,
              category: 'Users'
            }));
            allResults.push(...userResults);
          }
        } catch (error) {
          console.log('User search failed:', error);
        }
        
        // Search tasks
        try {
          const taskResponse = await apiRequest(`/tasks?search=${query}&limit=5`);
          if (taskResponse.success && taskResponse.data) {
            const taskResults = taskResponse.data.map((task: any) => ({
              id: `task-${task.id}`,
              type: 'task' as const,
              title: task.title,
              description: task.description || 'Task',
              icon: 'lucide:check-square',
              url: `/dashboard/tasks`,
              category: 'Tasks'
            }));
            allResults.push(...taskResults);
          }
        } catch (error) {
          console.log('Task search failed:', error);
        }
        
        // Search announcements
        try {
          const annResponse = await apiRequest(`/announcements?search=${query}&limit=5`);
          if (annResponse.success && annResponse.data) {
            const annResults = annResponse.data.map((ann: any) => ({
              id: `ann-${ann.id}`,
              type: 'announcement' as const,
              title: ann.title,
              description: ann.content.substring(0, 100),
              icon: 'lucide:megaphone',
              url: `/dashboard/announcements`,
              category: 'Announcements'
            }));
            allResults.push(...annResults);
          }
        } catch (error) {
          console.log('Announcement search failed:', error);
        }
        
        // Filter static pages by query
        const filtered = allResults.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(filtered);
        setIsOpen(true);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to static pages only
        const filtered = staticPages.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

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
                <span className="ml-2 text-sm text-default-500">{t('Searching...')}</span>
              </div>
            </DropdownItem>
          ) : results.length === 0 && query.trim().length > 0 ? (
            <DropdownItem key="no-results" textValue="no-results">
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Icon icon="lucide:search-x" className="text-2xl text-default-300 mb-2" />
                <p className="text-sm text-default-500">{t('No results found')}</p>
                <p className="text-xs text-default-400 mt-1">{t('Try a different search term')}</p>
              </div>
            </DropdownItem>
          ) : (
            <>
              {/* Add a "Search for..." option at the top */}
              <DropdownItem
                key="search-for"
                textValue={`${t('Search for')} "${query}"`}
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
                    <p className="text-sm font-medium text-primary">{t('Search for')} "{query}"</p>
                    <p className="text-xs text-default-500">{t('Press Enter to search')}</p>
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