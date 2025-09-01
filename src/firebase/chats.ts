import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { createMessageNotification } from './notifications';

// Chat interfaces
export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Chat {
  id: string;
  participants: string[]; // Array of user IDs
  participantDetails: ChatUser[]; // Full user details
  lastMessage: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: any;
    type: 'text' | 'image' | 'file';
  } | null;
  createdAt: any;
  updatedAt: any;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  unreadCounts: { [userId: string]: number }; // Unread count per user
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: any;
  type: 'text' | 'image' | 'file';
  readBy: string[]; // Array of user IDs who have read this message
}

// Get or create a chat between two users
export const getOrCreateDirectChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
  try {
    // Check if a chat already exists between these two users
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUserId),
      where('isGroup', '==', false)
    );
    
    const chatsSnapshot = await getDocs(chatsQuery);
    
    // Find existing chat with the other user
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      if (chatData.participants.includes(otherUserId)) {
        return chatDoc.id;
      }
    }
    
    // Get user details for both users
    const [currentUserDoc, otherUserDoc] = await Promise.all([
      getDoc(doc(db, 'users', currentUserId)),
      getDoc(doc(db, 'users', otherUserId))
    ]);
    
    if (!currentUserDoc.exists() || !otherUserDoc.exists()) {
      throw new Error('One or both users not found');
    }
    
    const currentUser = { id: currentUserId, ...currentUserDoc.data() } as ChatUser;
    const otherUser = { id: otherUserId, ...otherUserDoc.data() } as ChatUser;
    
    // Create new chat
    const chatRef = await addDoc(collection(db, 'chats'), {
      participants: [currentUserId, otherUserId],
      participantDetails: [currentUser, otherUser],
      lastMessage: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isGroup: false,
      unreadCounts: {
        [currentUserId]: 0,
        [otherUserId]: 0
      }
    });
    
    return chatRef.id;
  } catch (error) {
    console.error('Error getting or creating direct chat:', error);
    throw error;
  }
};

// Get user's chats
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const chatsSnapshot = await getDocs(chatsQuery);
    const chats: Chat[] = [];
    
    chatsSnapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        participants: data.participants,
        participantDetails: data.participantDetails,
        lastMessage: data.lastMessage,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isGroup: data.isGroup,
        groupName: data.groupName,
        groupAvatar: data.groupAvatar,
        unreadCounts: data.unreadCounts || {}
      });
    });
    
    return chats;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return [];
  }
};

// Subscribe to user's chats in real-time
export const subscribeToUserChats = (userId: string, callback: (chats: Chat[]) => void) => {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(chatsQuery, (snapshot) => {
    const chats: Chat[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        participants: data.participants,
        participantDetails: data.participantDetails,
        lastMessage: data.lastMessage,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isGroup: data.isGroup,
        groupName: data.groupName,
        groupAvatar: data.groupAvatar,
        unreadCounts: data.unreadCounts || {}
      });
    });
    
    callback(chats);
  });
};

// Send a message
export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  content: string,
  type: 'text' | 'image' | 'file' = 'text'
): Promise<string> => {
  try {
    const batch = writeBatch(db);
    
    // Add message to messages collection
    const messageRef = doc(collection(db, 'messages'));
    batch.set(messageRef, {
      chatId,
      senderId,
      senderName,
      senderAvatar,
      content,
      timestamp: serverTimestamp(),
      type,
      readBy: [senderId] // Sender has read their own message
    });
    
    // Update chat's last message and timestamp
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      const chatData = chatDoc.data();
      const participants = chatData.participants || [];
      const currentUnreadCounts = chatData.unreadCounts || {};
      
      // Increment unread count for all participants except sender
      const newUnreadCounts = { ...currentUnreadCounts };
      participants.forEach((participantId: string) => {
        if (participantId !== senderId) {
          newUnreadCounts[participantId] = (newUnreadCounts[participantId] || 0) + 1;
        }
      });

      // Create notifications for all participants except sender
      participants.forEach(async (participantId: string) => {
        if (participantId !== senderId) {
          try {
            const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;
            await createMessageNotification(
              senderId,
              senderName,
              senderAvatar,
              participantId,
              messagePreview
            );
          } catch (notificationError) {
            console.error('Error creating message notification:', notificationError);
            // Don't throw - message should still be sent even if notification fails
          }
        }
      });
      
      batch.update(chatRef, {
        lastMessage: {
          content,
          senderId,
          senderName,
          timestamp: serverTimestamp(),
          type
        },
        updatedAt: serverTimestamp(),
        unreadCounts: newUnreadCounts
      });
    }
    
    await batch.commit();
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a chat
export const getChatMessages = async (chatId: string, limitCount: number = 50): Promise<Message[]> => {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const messages: Message[] = [];
    
    messagesSnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        chatId: data.chatId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        content: data.content,
        timestamp: data.timestamp,
        type: data.type,
        readBy: data.readBy || []
      });
    });
    
    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};

// Subscribe to chat messages in real-time
export const subscribeToChatMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages: Message[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        chatId: data.chatId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        content: data.content,
        timestamp: data.timestamp,
        type: data.type,
        readBy: data.readBy || []
      });
    });
    
    callback(messages);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Get unread messages in this chat
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('readBy', 'not-in', [[userId]]) // Messages not read by this user
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    // Mark each message as read by this user
    messagesSnapshot.forEach((messageDoc) => {
      batch.update(messageDoc.ref, {
        readBy: arrayUnion(userId)
      });
    });
    
    // Reset unread count for this user in the chat
    const chatRef = doc(db, 'chats', chatId);
    batch.update(chatRef, {
      [`unreadCounts.${userId}`]: 0
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Search for users to start a chat with
export const searchUsers = async (searchTerm: string, currentUserId: string): Promise<ChatUser[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that gets all users and filters client-side
    // In production, you might want to use Algolia or similar service
    
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const users: ChatUser[] = [];
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const user = {
        id: doc.id,
        name: data.name || data.email,
        avatar: data.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        email: data.email
      };
      
      // Filter out current user and match search term
      if (user.id !== currentUserId && 
          (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase()))) {
        users.push(user);
      }
    });
    
    return users.slice(0, 10); // Limit results
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Get online status (this would typically be implemented with presence system)
export const getUserOnlineStatus = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Simple implementation - check if user was active in last 5 minutes
      const lastActive = userData.lastActive?.toDate?.();
      if (lastActive) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return lastActive > fiveMinutesAgo;
      }
    }
    return false;
  } catch (error) {
    console.error('Error getting user online status:', error);
    return false;
  }
};

// Update user's last active timestamp
export const updateUserLastActive = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user last active:', error);
  }
};