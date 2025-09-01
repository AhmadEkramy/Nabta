import { useEffect, useState } from 'react';
import {
    Chat,
    ChatUser,
    getOrCreateDirectChat,
    getUserOnlineStatus,
    markMessagesAsRead,
    Message,
    searchUsers,
    sendMessage,
    subscribeToChatMessages,
    subscribeToUserChats,
    updateUserLastActive
} from '../firebase/chats';

interface UseChatsReturn {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  searchResults: ChatUser[];
  searchLoading: boolean;
  createDirectChat: (otherUserId: string) => Promise<string>;
  searchForUsers: (searchTerm: string) => Promise<void>;
}

export const useChats = (userId: string | undefined): UseChatsReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Subscribe to user's chats
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserChats(userId, (updatedChats) => {
      setChats(updatedChats);
      setLoading(false);
    });

    // Update user's last active status
    updateUserLastActive(userId);

    return () => unsubscribe();
  }, [userId]);

  const createDirectChat = async (otherUserId: string): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const chatId = await getOrCreateDirectChat(userId, otherUserId);
      return chatId;
    } catch (err) {
      console.error('Error creating direct chat:', err);
      throw err;
    }
  };

  const searchForUsers = async (searchTerm: string): Promise<void> => {
    if (!userId || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(searchTerm, userId);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return {
    chats,
    loading,
    error,
    searchResults,
    searchLoading,
    createDirectChat,
    searchForUsers
  };
};

interface UseChatMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendChatMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  markAsRead: () => Promise<void>;
}

export const useChatMessages = (
  chatId: string | null,
  userId: string | undefined,
  userName: string | undefined,
  userAvatar: string | undefined
): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to chat messages
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToChatMessages(chatId, (updatedMessages) => {
      setMessages(updatedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chatId && userId && messages.length > 0) {
      markAsRead();
    }
  }, [chatId, userId, messages.length]);

  const sendChatMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<void> => {
    if (!chatId || !userId || !userName || !userAvatar) {
      throw new Error('Missing required parameters for sending message');
    }

    try {
      await sendMessage(chatId, userId, userName, userAvatar, content, type);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      throw err;
    }
  };

  const markAsRead = async (): Promise<void> => {
    if (!chatId || !userId) return;

    try {
      await markMessagesAsRead(chatId, userId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  return {
    messages,
    loading,
    error,
    sendChatMessage,
    markAsRead
  };
};

// Hook for getting online status of users
export const useOnlineStatus = (userIds: string[]) => {
  const [onlineStatuses, setOnlineStatuses] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses: { [userId: string]: boolean } = {};
      
      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const isOnline = await getUserOnlineStatus(userId);
            statuses[userId] = isOnline;
          } catch (error) {
            console.error(`Error getting online status for user ${userId}:`, error);
            statuses[userId] = false;
          }
        })
      );
      
      setOnlineStatuses(statuses);
    };

    if (userIds.length > 0) {
      fetchStatuses();
      
      // Update statuses every 30 seconds
      const interval = setInterval(fetchStatuses, 30000);
      return () => clearInterval(interval);
    }
  }, [userIds]);

  return onlineStatuses;
};