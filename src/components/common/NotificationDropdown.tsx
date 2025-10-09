import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { notificationService, SystemNotification } from '../../services/notification-service';
import { useTranslation } from '../../contexts/translation-context';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load notifications from service
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const allNotifications = notificationService.getNotifications();
        setNotifications(allNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    // Cleanup old notifications on mount
    notificationService.cleanupOldNotifications();

    return () => {
      unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: SystemNotification) => {
    // Close dropdown immediately
    setIsOpen(false);
    
    // Mark as read using service
    notificationService.markAsRead(notification.id);

    // Navigate if action URL exists
    if (notification.actionUrl) {
      // Small delay to ensure dropdown closes before navigation
      setTimeout(() => {
        navigate(notification.actionUrl);
      }, 100);
    }
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const clearAllNotifications = () => {
    notificationService.clearAll();
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

  const getTypeColor = (type: SystemNotification['type']) => {
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
          <Button
            size="sm"
            variant="light"
            onPress={markAllAsRead}
            className="min-w-0 p-1"
          >
            Mark all as read
          </Button>
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