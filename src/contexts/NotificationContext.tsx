import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '../firebase/notifications';
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

  const fetchUnreadCount = async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
      console.log('Updated unread count:', count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();

      // Refresh count every 5 seconds for real-time updates
      const interval = setInterval(fetchUnreadCount, 5000);

      // Listen for new notification events
      const handleNewNotification = (event: CustomEvent) => {
        const { toUserId } = event.detail;
        if (toUserId === user.id) {
          console.log('New notification received for current user, refreshing count');
          fetchUnreadCount(); // Refresh immediately when new notification arrives
        }
      };

      window.addEventListener('newNotification', handleNewNotification as EventListener);

      return () => {
        clearInterval(interval);
        window.removeEventListener('newNotification', handleNewNotification as EventListener);
      };
    }
  }, [user?.id]);

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
