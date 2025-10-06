import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const navigate = useNavigate();

  // Mock notifications - in a real app, this would come from an API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Employee Joined',
        message: 'John Smith has been added to the Engineering department',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isRead: false,
        actionUrl: '/dashboard/employees',
        icon: 'lucide:user-plus',
        user: {
          name: 'John Smith',
          avatar: '/avatars/male_avatar.svg'
        }
      },
      {
        id: '2',
        title: 'Meeting Reminder',
        message: 'Team standup meeting starts in 15 minutes',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
        actionUrl: '/dashboard/calendar',
        icon: 'lucide:calendar'
      },
      {
        id: '3',
        title: 'Leave Request',
        message: 'Sarah Johnson has requested 3 days of vacation leave',
        type: 'warning',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: true,
        actionUrl: '/dashboard/leave/applications',
        icon: 'lucide:calendar-days',
        user: {
          name: 'Sarah Johnson',
          avatar: '/avatars/female_avatar.svg'
        }
      },
      {
        id: '4',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin at 2:00 AM tomorrow',
        type: 'info',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true,
        icon: 'lucide:settings'
      },
      {
        id: '5',
        title: 'Payroll Processed',
        message: 'Monthly payroll has been processed successfully for all employees',
        type: 'success',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: true,
        actionUrl: '/dashboard/payroll',
        icon: 'lucide:check-circle'
      },
      {
        id: '6',
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected from unknown IP',
        type: 'error',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        isRead: false,
        actionUrl: '/dashboard/audit-logs',
        icon: 'lucide:shield-alert'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'info': 
      default: return 'primary';
    }
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
                className="absolute -top-0.5 -right-0.5 min-w-4 h-4 text-xs font-medium"
                style={{ fontSize: '10px', lineHeight: '1' }}
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
          {/* Header */}
          <DropdownItem key="header" className="h-auto p-0" textValue="header">
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <div>
                <h3 className="font-semibold text-lg">Notifications</h3>
                <p className="text-sm text-default-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </DropdownItem>

          {/* Notifications */}
          <AnimatePresence>
            {notifications.length === 0 ? (
              <DropdownItem key="empty" textValue="empty">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Icon icon="lucide:bell-off" className="text-4xl text-default-300 mb-2" />
                  <p className="text-sm text-default-500">No notifications</p>
                </div>
              </DropdownItem>
            ) : (
              notifications.map((notification) => (
                <DropdownItem
                  key={notification.id}
                  textValue={notification.title}
                  onPress={() => handleNotificationClick(notification)}
                  className="p-0"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-start gap-3 p-4 hover:bg-default-50 cursor-pointer border-l-2 ${
                      notification.isRead 
                        ? 'border-transparent bg-transparent' 
                        : 'border-primary-500 bg-primary-50/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-${getTypeColor(notification.type)}-100`}>
                      <Icon 
                        icon={notification.icon} 
                        className={`text-${getTypeColor(notification.type)} text-lg`}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-medium text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
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
                  </motion.div>
                </DropdownItem>
              ))
            )}
          </AnimatePresence>

          {/* Footer */}
          {notifications.length > 0 && (
            <DropdownItem key="footer" className="h-auto p-0" textValue="footer">
              <div className="flex items-center justify-between p-3 border-t border-divider bg-default-50">
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => navigate('/dashboard/notifications')}
                  startContent={<Icon icon="lucide:eye" />}
                >
                  View All
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={clearAllNotifications}
                  startContent={<Icon icon="lucide:trash-2" />}
                >
                  Clear All
                </Button>
              </div>
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
