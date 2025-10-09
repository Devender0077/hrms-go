/**
 * Notification Service
 * Centralized service for managing in-app notifications
 */

export interface SystemNotification {
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
  category?: 'announcement' | 'system' | 'task' | 'message' | 'alert';
  metadata?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private storageKey = 'hrms-notifications';
  private listeners: Set<(notifications: SystemNotification[]) => void> = new Set();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Subscribe to notification changes
   */
  public subscribe(listener: (notifications: SystemNotification[]) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of notification changes
   */
  private notifyListeners(notifications: SystemNotification[]): void {
    this.listeners.forEach(listener => listener(notifications));
  }

  /**
   * Get all notifications from localStorage
   */
  public getNotifications(): SystemNotification[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return [];

      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  }

  /**
   * Save notifications to localStorage
   */
  private saveNotifications(notifications: SystemNotification[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
      this.notifyListeners(notifications);
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  /**
   * Add a new notification
   */
  public addNotification(notification: Omit<SystemNotification, 'id' | 'timestamp'>): void {
    const newNotification: SystemNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    const notifications = this.getNotifications();
    const updated = [newNotification, ...notifications].slice(0, 100); // Keep last 100
    this.saveNotifications(updated);
  }

  /**
   * Add an announcement notification
   */
  public addAnnouncementNotification(announcement: {
    id: number;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
  }): void {
    const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
      low: 'info',
      medium: 'info',
      high: 'warning',
      urgent: 'error',
    };

    const iconMap: Record<string, string> = {
      low: 'lucide:info',
      medium: 'lucide:megaphone',
      high: 'lucide:alert-triangle',
      urgent: 'lucide:alert-circle',
    };

    this.addNotification({
      title: announcement.title,
      message: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
      type: typeMap[announcement.priority] || 'info',
      isRead: false,
      actionUrl: '/dashboard/announcements',
      icon: iconMap[announcement.priority] || 'lucide:megaphone',
      category: 'announcement',
      metadata: {
        announcementId: announcement.id,
        priority: announcement.priority,
        announcementCategory: announcement.category,
      },
    });
  }

  /**
   * Mark a notification as read
   */
  public markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.saveNotifications(updated);
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
  }

  /**
   * Delete a notification
   */
  public deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(updated);
  }

  /**
   * Clear all notifications
   */
  public clearAll(): void {
    this.saveNotifications([]);
  }

  /**
   * Get unread count
   */
  public getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.isRead).length;
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  public cleanupOldNotifications(): void {
    const notifications = this.getNotifications();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recent = notifications.filter(n => n.timestamp.getTime() > thirtyDaysAgo);
    this.saveNotifications(recent);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

