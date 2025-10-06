import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  icon: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load notifications - in a real app, this would come from an API
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate dynamic notifications with current timestamps
        const now = Date.now();
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Employee Joined',
            message: 'John Smith has been added to the Engineering department',
            type: 'success',
            timestamp: new Date(now - 2 * 60 * 1000), // 2 minutes ago
            isRead: false,
            actionUrl: '/dashboard/employees',
            icon: 'lucide:user-plus',
            user: {
              name: 'John Smith',
              avatar: 'https://i.pravatar.cc/150?img=1'
            }
          },
          {
            id: '2',
            title: 'Meeting Reminder',
            message: 'Team standup meeting starts in 15 minutes',
            type: 'info',
            timestamp: new Date(now - 15 * 60 * 1000), // 15 minutes ago
            isRead: false,
            actionUrl: '/dashboard/calendar',
            icon: 'lucide:calendar'
          },
          {
            id: '3',
            title: 'Leave Request',
            message: 'Sarah Johnson has requested 3 days of vacation leave',
            type: 'warning',
            timestamp: new Date(now - 45 * 60 * 1000), // 45 minutes ago
            isRead: false,
            actionUrl: '/dashboard/leave/applications',
            icon: 'lucide:calendar-days',
            user: {
              name: 'Sarah Johnson',
              avatar: 'https://i.pravatar.cc/150?img=2'
            }
          },
          {
            id: '4',
            title: 'Task Completed',
            message: 'Project milestone has been completed successfully',
            type: 'success',
            timestamp: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: true,
            actionUrl: '/dashboard/tasks',
            icon: 'lucide:check-circle'
          },
          {
            id: '5',
            title: 'System Update',
            message: 'HRMS system has been updated to version 2.1.0',
            type: 'info',
            timestamp: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
            isRead: true,
            icon: 'lucide:settings'
          },
          {
            id: '6',
            title: 'Security Alert',
            message: 'Unusual login activity detected from new location',
            type: 'error',
            timestamp: new Date(now - 6 * 60 * 60 * 1000), // 6 hours ago
            isRead: false,
            actionUrl: '/dashboard/audit-logs',
            icon: 'lucide:shield-alert'
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
    
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Function to refresh notifications
  const refreshNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add a new notification occasionally
      const shouldAddNew = Math.random() > 0.7;
      if (shouldAddNew) {
        const newNotification: Notification = {
          id: `new-${Date.now()}`,
          title: 'New System Alert',
          message: 'A new system alert has been generated',
          type: 'info',
          timestamp: new Date(),
          isRead: false,
          actionUrl: '/dashboard/alerts',
          icon: 'lucide:alert-circle'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate if action URL exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    setIsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'info': 
      default: return 'primary';
    }
  };

  // Create dropdown items array
  const getDropdownItems = () => {
    const items = [];

    // Header
    items.push(
      <DropdownItem key="header" className="h-auto p-0" textValue="header">
        <div className="flex items-center justify-between p-3 border-b border-divider">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={refreshNotifications}
              className="min-w-0 p-1"
            >
              <Icon icon="lucide:refresh-cw" className="text-sm" />
            </Button>
            <Button
              size="sm"
              variant="light"
              onPress={markAllAsRead}
              className="min-w-0 p-1"
            >
              Mark all as read
            </Button>
          </div>
        </div>
      </DropdownItem>
    );

    // Content based on state
    if (isLoading) {
      items.push(
        <DropdownItem key="loading" textValue="loading">
          <div className="flex items-center justify-center p-4">
            <Icon icon="lucide:loader-2" className="animate-spin text-xl text-default-400 mr-2" />
            <span className="text-sm text-default-500">Loading notifications...</span>
          </div>
        </DropdownItem>
      );
    } else if (notifications.length === 0) {
      items.push(
        <DropdownItem key="empty" textValue="empty">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Icon icon="lucide:bell-off" className="text-4xl text-default-300 mb-2" />
            <p className="text-sm text-default-500">No notifications</p>
          </div>
        </DropdownItem>
      );
    } else {
      notifications.forEach((notification) => {
        items.push(
          <DropdownItem
            key={notification.id}
            textValue={notification.title}
            onPress={() => handleNotificationClick(notification)}
            className="p-0"
          >
            <div className={`flex items-start gap-3 p-3 hover:bg-default-50 cursor-pointer transition-colors ${
              !notification.isRead ? 'bg-primary-50/30 border-l-2 border-primary-500' : ''
            }`}>
              <div className={`p-2 rounded-lg ${
                notification.type === 'success' ? 'bg-success-100 text-success-600' :
                notification.type === 'warning' ? 'bg-warning-100 text-warning-600' :
                notification.type === 'error' ? 'bg-danger-100 text-danger-600' :
                'bg-primary-100 text-primary-600'
              }`}>
                <Icon 
                  icon={notification.icon} 
                  className="text-lg"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                
                <p className="text-xs text-default-600 mb-2 line-clamp-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-default-400">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  
                  {notification.user && (
                    <div className="flex items-center gap-1">
                      <Avatar
                        size="sm"
                        src={notification.user.avatar}
                        name={notification.user.name}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-default-500">
                        {notification.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {notification.actionUrl && (
                <Icon 
                  icon="lucide:chevron-right" 
                  className="text-default-400 flex-shrink-0 mt-1" 
                />
              )}
            </div>
          </DropdownItem>
        );
      });
    }

    // Footer
    if (notifications.length > 0) {
      items.push(
        <DropdownItem key="footer" className="h-auto p-0" textValue="footer">
          <div className="flex items-center justify-between p-3 border-t border-divider bg-default-50">
            <Button
              size="sm"
              variant="light"
              onPress={() => {
                // Navigate to notifications page
                console.log('Navigate to all notifications');
              }}
              className="text-xs"
            >
              View All
            </Button>
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={clearAllNotifications}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        </DropdownItem>
      );
    }

    return items;
  };

  return (
    <div className={className}>
      <Dropdown 
        isOpen={isOpen} 
        onOpenChange={setIsOpen}
        placement="bottom-end"
        className="w-80"
      >
        <DropdownTrigger>
          <Button 
            isIconOnly 
            variant="light" 
            aria-label="Notifications" 
            className="rounded-lg relative p-2"
          >
            <Icon icon="lucide:bell" className="text-xl" />
            {unreadCount > 0 && (
              <Badge 
                content={unreadCount > 99 ? '99+' : unreadCount} 
                color="danger"
                size="sm"
                className="absolute -top-1 -right-1 min-w-5 h-5 text-xs"
              >
                <span></span>
              </Badge>
            )}
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu
          aria-label="Notifications"
          className="w-80 max-h-96 overflow-y-auto"
          closeOnSelect={false}
        >
          {getDropdownItems()}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}