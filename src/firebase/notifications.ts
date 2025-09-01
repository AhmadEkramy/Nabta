import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { Notification } from '../types';
import { db } from './config';

// Get user's notifications
export const getUserNotifications = async (userId: string, limitCount: number = 50) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const notificationsSnapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = [];

    notificationsSnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        type: data.type,
        title: data.title || getNotificationTitle(data.type, data.fromUserName),
        message: data.message,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        isRead: data.read || false,
        userId: data.toUserId,
        postId: data.postId,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        fromUserAvatar: data.fromUserAvatar,
      });
    });

    console.log(`Fetched ${notifications.length} notifications for user ${userId}`);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Get notification title based on type
const getNotificationTitle = (type: string, fromUserName?: string): string => {
  switch (type) {
    case 'like':
      return 'New Like';
    case 'comment':
      return 'New Comment';
    case 'share':
      return 'Post Shared';
    case 'reaction':
      return 'New Reaction';
    case 'follow':
      return 'New Follower';
    case 'story_like':
      return 'Story Liked';
    case 'story_comment':
      return 'Story Comment';
    case 'message':
      return 'New Message';
    case 'xp':
      return 'XP Earned';
    case 'level':
      return 'Level Up!';
    case 'circle':
      return 'Circle Activity';
    default:
      return 'Notification';
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const unreadNotificationsQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', userId),
      where('read', '==', false)
    );

    const unreadSnapshot = await getDocs(unreadNotificationsQuery);
    
    if (unreadSnapshot.empty) {
      console.log('No unread notifications to mark');
      return 0;
    }

    const batch = writeBatch(db);
    let count = 0;

    unreadSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp(),
      });
      count++;
    });

    await batch.commit();
    console.log(`Marked ${count} notifications as read`);
    return count;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const unreadQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', userId),
      where('read', '==', false)
    );

    const unreadSnapshot = await getDocs(unreadQuery);
    return unreadSnapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Create a notification
export const createNotification = async (notificationData: {
  type: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  message: string;
  messageAr?: string;
  postId?: string;
  commentId?: string;
  storyId?: string;
  reactionType?: string;
}) => {
  try {
    // Don't create notification if user is notifying themselves
    if (notificationData.fromUserId === notificationData.toUserId) {
      return null;
    }

    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
    });

    console.log('Notification created:', docRef.id, 'for user:', notificationData.toUserId);

    // Trigger a custom event that the notification context can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newNotification', {
        detail: { toUserId: notificationData.toUserId, type: notificationData.type }
      }));
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create follow notification
export const createFollowNotification = async (
  fromUserId: string,
  fromUserName: string,
  fromUserAvatar: string,
  toUserId: string
) => {
  return createNotification({
    type: 'follow',
    fromUserId,
    fromUserName,
    fromUserAvatar,
    toUserId,
    message: `${fromUserName} started following you`,
    messageAr: `بدأ ${fromUserName} في متابعتك`,
  });
};

// Create message notification
export const createMessageNotification = async (
  fromUserId: string,
  fromUserName: string,
  fromUserAvatar: string,
  toUserId: string,
  messagePreview: string
) => {
  return createNotification({
    type: 'message',
    fromUserId,
    fromUserName,
    fromUserAvatar,
    toUserId,
    message: `${fromUserName} sent you a message: ${messagePreview}`,
    messageAr: `أرسل لك ${fromUserName} رسالة: ${messagePreview}`,
  });
};

// Create XP notification
export const createXPNotification = async (
  userId: string,
  xpAmount: number,
  reason: string
) => {
  return createNotification({
    type: 'xp',
    fromUserId: 'system',
    fromUserName: 'System',
    fromUserAvatar: '',
    toUserId: userId,
    message: `You earned ${xpAmount} XP for ${reason}`,
    messageAr: `حصلت على ${xpAmount} نقطة خبرة لـ ${reason}`,
  });
};

// Create level up notification
export const createLevelUpNotification = async (
  userId: string,
  newLevel: number
) => {
  return createNotification({
    type: 'level',
    fromUserId: 'system',
    fromUserName: 'System',
    fromUserAvatar: '',
    toUserId: userId,
    message: `Congratulations! You reached Level ${newLevel}`,
    messageAr: `تهانينا! وصلت إلى المستوى ${newLevel}`,
  });
};

// Delete a notification
export const deleteNotification = async (notificationId: string, userId: string) => {
  try {
    // First verify that the notification belongs to the user
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDocs(query(
      collection(db, 'notifications'),
      where('__name__', '==', notificationId),
      where('toUserId', '==', userId)
    ));

    if (notificationDoc.empty) {
      throw new Error('Notification not found or unauthorized');
    }

    // Delete the notification
    await deleteDoc(notificationRef);
    console.log('Notification deleted:', notificationId);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all notifications for a user
export const deleteAllNotifications = async (userId: string) => {
  try {
    const userNotificationsQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', userId)
    );

    const notificationsSnapshot = await getDocs(userNotificationsQuery);

    if (notificationsSnapshot.empty) {
      console.log('No notifications to delete');
      return 0;
    }

    const batch = writeBatch(db);
    let count = 0;

    notificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`Deleted ${count} notifications`);
    return count;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};
