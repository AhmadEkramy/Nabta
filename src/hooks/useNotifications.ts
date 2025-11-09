import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    deleteAllNotifications,
    deleteNotification,
    getUnreadNotificationCount,
    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '../firebase/notifications';
import { Notification } from '../types';

// Hook for user notifications
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userNotifications = await getUserNotifications(user.id);
      console.log('Fetched notifications:', userNotifications.length);
      setNotifications(userNotifications);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return false;

    try {
      const markedCount = await markAllNotificationsAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      console.log(`Marked ${markedCount} notifications as read`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const refreshNotifications = () => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  // Mark all notifications as read when user visits notifications page
  const markAllAsReadOnVisit = async () => {
    if (!user?.id || unreadCount === 0) return false;

    try {
      const markedCount = await markAllNotificationsAsRead(user.id);

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      console.log(`Marked ${markedCount} notifications as read on visit`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read on visit:', error);
      return false;
    }
  };

  const deleteNotificationById = async (notificationId: string) => {
    if (!user?.id) return false;

    try {
      await deleteNotification(notificationId, user.id);

      // Update local state - remove the notification
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );

      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      console.log('Notification deleted:', notificationId);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  const deleteAllNotificationsForUser = async () => {
    if (!user?.id) return false;

    try {
      const deletedCount = await deleteAllNotifications(user.id);

      // Update local state - clear all notifications
      setNotifications([]);
      setUnreadCount(0);

      console.log(`Deleted ${deletedCount} notifications`);
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAllAsReadOnVisit,
    deleteNotificationById,
    deleteAllNotificationsForUser,
    refreshNotifications
  };
};

// Hook for real-time unread count (for navbar)
export const useUnreadNotificationCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    if (!user?.id) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Refresh count every 10 seconds for more real-time updates
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const refreshCount = () => {
    fetchUnreadCount();
  };

  return { unreadCount, loading, refreshCount };
};
