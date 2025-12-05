import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUnreadNotificationCount, getUserNotifications } from '../firebase/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Show browser notification
  const showBrowserNotification = async (message: string, title: string, icon?: string) => {
    if (notificationPermission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: icon || '/logo.png',
        badge: '/logo.png',
        tag: 'app-notification',
        requireInteraction: false,
      });

      // Close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click on notification
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navigate to notifications page if needed
        if (window.location.pathname !== '/notifications') {
          window.location.href = '/notifications';
        }
      };
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadNotificationCount(user.id);
      
      // Check if there's a new notification
      if (count > previousUnreadCount && previousUnreadCount > 0) {
        // Get the latest notification to show in browser notification
        const notifications = await getUserNotifications(user.id, 1);
        if (notifications.length > 0) {
          const latestNotification = notifications[0];
          const title = latestNotification.title || 'New Notification';
          const message = latestNotification.message || '';
          const icon = latestNotification.fromUserAvatar || '/logo.png';
          
          await showBrowserNotification(message, title, icon);
        }
      }
      
      setUnreadCount(count);
      setPreviousUnreadCount(count);
      console.log('Updated unread count:', count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Request permission on mount
  useEffect(() => {
    if (user?.id) {
      requestNotificationPermission();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      // Initialize previous count
      getUnreadNotificationCount(user.id).then(count => {
        setPreviousUnreadCount(count);
        setUnreadCount(count);
      });

      // Refresh count every 5 seconds for real-time updates
      const interval = setInterval(fetchUnreadCount, 5000);

      // Listen for new notification events
      const handleNewNotification = async (event: CustomEvent) => {
        const { toUserId, type, message, messageAr, fromUserName } = event.detail;
        if (toUserId === user.id) {
          console.log('New notification received for current user, refreshing count');
          
          // Show browser notification immediately
          if (notificationPermission === 'granted') {
            // Try to detect language from messageAr presence or use English as default
            const isArabic = messageAr && messageAr.length > 0;
            const notificationMessage = isArabic && messageAr ? messageAr : (message || 'You have a new notification');
            const notificationTitle = fromUserName 
              ? `${fromUserName} - ${isArabic ? 'إشعار جديد' : 'New Notification'}`
              : (isArabic ? 'إشعار جديد' : 'New Notification');
            
            await showBrowserNotification(notificationMessage, notificationTitle, event.detail.fromUserAvatar);
          }
          
          fetchUnreadCount(); // Refresh immediately when new notification arrives
        }
      };

      window.addEventListener('newNotification', handleNewNotification as EventListener);

      return () => {
        clearInterval(interval);
        window.removeEventListener('newNotification', handleNewNotification as EventListener);
      };
    }
  }, [user?.id, notificationPermission]);

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      refreshUnreadCount,
      incrementUnreadCount,
      resetUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
