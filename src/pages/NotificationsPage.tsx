import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Heart, Loader2, MessageCircle, Share, Smile, Star, Trash2, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { resetUnreadCount } = useNotificationContext();

  // Use real notifications from Firestore
  const {
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
  } = useNotifications();

  // Mark all notifications as read when user visits the page
  useEffect(() => {
    const markAsReadOnPageVisit = async () => {
      // Wait a bit for notifications to load, then mark as read
      if (!loading && unreadCount > 0) {
        setTimeout(async () => {
          const success = await markAllAsReadOnVisit();
          if (success) {
            // Also reset the global notification context count
            resetUnreadCount();
          }
        }, 1000); // 1 second delay to let user see the notifications first
      }
    };

    markAsReadOnPageVisit();
  }, [loading, unreadCount, markAllAsReadOnVisit, resetUnreadCount]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'xp':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'level':
        return <Trophy className="w-5 h-5 text-purple-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'share':
        return <Share className="w-5 h-5 text-green-600" />;
      case 'reaction':
        return <Smile className="w-5 h-5 text-orange-500" />;
      case 'follow':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'story_like':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'story_comment':
        return <MessageCircle className="w-5 h-5 text-cyan-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      case 'circle':
        return <Users className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'xp':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'level':
        return 'bg-purple-50 dark:bg-purple-900/20';
      case 'like':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'comment':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'share':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'reaction':
        return 'bg-orange-50 dark:bg-orange-900/20';
      case 'follow':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'story_like':
        return 'bg-pink-50 dark:bg-pink-900/20';
      case 'story_comment':
        return 'bg-cyan-50 dark:bg-cyan-900/20';
      case 'message':
        return 'bg-indigo-50 dark:bg-indigo-900/20';
      case 'circle':
        return 'bg-indigo-50 dark:bg-indigo-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      console.log('All notifications marked as read');
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the notification click
    const success = await deleteNotificationById(notificationId);
    if (success) {
      console.log('Notification deleted successfully');
    }
  };

  const handleDeleteAllNotifications = async () => {
    const success = await deleteAllNotificationsForUser();
    if (success) {
      resetUnreadCount(); // Also reset the global count
      console.log('All notifications deleted successfully');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ar' ? 'تابع آخر التحديثات والأنشطة' : 'Stay updated with the latest activities'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">
              {language === 'ar' ? 'تم قراءة الكل' : 'Mark all as read'}
            </span>
            {unreadCount > 0 && (
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleDeleteAllNotifications}
            disabled={notifications.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">
              {language === 'ar' ? 'حذف الكل' : 'Delete all'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex space-x-2"
      >
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {language === 'ar' ? 'جميع الإشعارات' : 'All Notifications'}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {language === 'ar' ? 'غير مقروءة' : 'Unread'}
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'جاري تحميل الإشعارات...' : 'Loading notifications...'}
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">
            {language === 'ar' ? 'خطأ في تحميل الإشعارات' : 'Error loading notifications'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshNotifications}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread'
                  ? (language === 'ar' ? 'لا توجد إشعارات غير مقروءة' : 'No unread notifications')
                  : (language === 'ar' ? 'ستظهر إشعاراتك هنا' : 'Your notifications will appear here')
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            onClick={() => handleNotificationClick(notification)}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
              !notification.isRead ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group"
                      title={language === 'ar' ? 'حذف الإشعار' : 'Delete notification'}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
            </div>
          </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;