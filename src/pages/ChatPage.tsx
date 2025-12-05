import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Circle,
    MessageCircle,
    Mic,
    MoreVertical,
    Paperclip,
    Phone,
    Plus,
    Search,
    Send,
    Smile,
    Users,
    Video
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import CallModal from '../components/CallModal';
import EmojiPicker from '../components/EmojiPicker';
import MediaPicker from '../components/MediaPicker';
import VoiceRecorder from '../components/VoiceRecorder';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Chat, ChatUser } from '../firebase/chats';
import { useChatMessages, useChats, useOnlineStatus } from '../hooks/useChats';
import { getFollowingList } from '../firebase/userProfile';
import { User } from '../types';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [followingUsers, setFollowingUsers] = useState<ChatUser[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [newChatSearchTerm, setNewChatSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use Firebase hooks
  const { 
    chats, 
    loading: chatsLoading, 
    error: chatsError,
    searchResults,
    searchLoading,
    createDirectChat,
    searchForUsers
  } = useChats(user?.id);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendChatMessage,
    markAsRead
  } = useChatMessages(
    selectedChat?.id || null,
    user?.id,
    user?.name || user?.email,
    user?.avatar
  );

  // Get online status for all chat participants
  const allParticipantIds = chats.flatMap(chat => 
    chat.participants.filter(id => id !== user?.id)
  );
  const onlineStatuses = useOnlineStatus(allParticipantIds);

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    if (chat.isGroup) {
      return chat.groupName?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      // For direct chats, search in participant names
      const otherParticipant = chat.participantDetails.find(p => p.id !== user?.id);
      return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             otherParticipant?.email.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    try {
      await sendChatMessage(messageInput.trim());
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartNewChat = async (otherUser: ChatUser) => {
    try {
      const chatId = await createDirectChat(otherUser.id);
      const newChat = chats.find(chat => chat.id === chatId);
      if (newChat) {
        setSelectedChat(newChat);
      }
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.isGroup) {
      return {
        name: chat.groupName || 'Group Chat',
        avatar: chat.groupAvatar || '/avatar.jpeg',
        isOnline: false // Groups don't have online status
      };
    } else {
      const otherParticipant = chat.participantDetails.find(p => p.id !== user?.id);
      return {
        name: otherParticipant?.name || 'Unknown User',
        avatar: otherParticipant?.avatar || '/avatar.jpeg',
        isOnline: otherParticipant ? onlineStatuses[otherParticipant.id] || false : false
      };
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  // Handler functions for new features
  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      // In a real implementation, you would upload the audio file to storage
      // and send a message with the audio URL
      console.log('Voice message:', { audioBlob, duration });
      
      // For now, we'll send a text message indicating a voice message
      await sendChatMessage(`🎵 Voice message (${Math.floor(duration)}s)`, 'text');
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };

  const handleMediaSelect = async (file: File, type: 'image' | 'file') => {
    try {
      // In a real implementation, you would upload the file to storage
      // and send a message with the file URL
      console.log('Media selected:', { file, type });
      
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // Size in MB
      const fileName = file.name;
      
      if (type === 'image') {
        await sendChatMessage(`📷 Image: ${fileName} (${fileSize}MB)`, 'image');
      } else {
        await sendChatMessage(`📎 File: ${fileName} (${fileSize}MB)`, 'file');
      }
    } catch (error) {
      console.error('Error sending media:', error);
    }
  };

  const handleVoiceCall = () => {
    setCallType('voice');
    setShowCallModal(true);
  };

  const handleVideoCall = () => {
    setCallType('video');
    setShowCallModal(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        const target = event.target as Element;
        if (!target.closest('.emoji-picker-container')) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Load following users when modal opens
  useEffect(() => {
    const loadFollowingUsers = async () => {
      if (showNewChatModal && user?.id) {
        setLoadingFollowing(true);
        try {
          const following = await getFollowingList(user.id);
          // Convert User[] to ChatUser[]
          const followingAsChatUsers: ChatUser[] = following.map((u: User) => ({
            id: u.id,
            name: u.name || u.email || 'Unknown',
            avatar: u.avatar || '/avatar.jpeg',
            email: u.email || ''
          }));
          setFollowingUsers(followingAsChatUsers);
        } catch (error) {
          console.error('Error loading following users:', error);
          setFollowingUsers([]);
        } finally {
          setLoadingFollowing(false);
        }
      } else {
        setFollowingUsers([]);
        setNewChatSearchTerm('');
      }
    };

    loadFollowingUsers();
  }, [showNewChatModal, user?.id]);

  // Handle search in new chat modal
  const handleNewChatSearch = async (searchTerm: string) => {
    setNewChatSearchTerm(searchTerm);
    if (searchTerm.trim()) {
      await searchForUsers(searchTerm);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="flex h-full">
        {/* Chat List Sidebar - Hidden on mobile when chat is selected */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} md:w-1/3 w-full border-r border-gray-200 dark:border-gray-700 flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'المحادثات' : 'Chats'}
              </h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في المحادثات...' : 'Search chats...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {searchTerm 
                    ? (language === 'ar' ? 'لا توجد محادثات مطابقة' : 'No matching chats')
                    : (language === 'ar' ? 'لا توجد محادثات بعد' : 'No chats yet')
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    {language === 'ar' ? 'بدء محادثة جديدة' : 'Start New Chat'}
                  </button>
                )}
              </div>
            ) : (
              filteredChats.map((chat, index) => {
                const displayInfo = getChatDisplayInfo(chat);
                const unreadCount = chat.unreadCounts[user?.id || ''] || 0;
                
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-green-50 dark:bg-green-900/20 border-r-2 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={displayInfo.avatar || '/avatar.jpeg'}
                          alt={displayInfo.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/avatar.jpeg';
                          }}
                        />
                        {displayInfo.isOnline && !chat.isGroup && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                        {chat.isGroup && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <Users className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {displayInfo.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(chat.lastMessage?.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {chat.lastMessage?.content || (language === 'ar' ? 'لا توجد رسائل' : 'No messages')}
                          </p>
                          {unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area - Hidden on mobile when no chat is selected */}
        <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                {/* Back button - visible only on mobile */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={getChatDisplayInfo(selectedChat).avatar || '/avatar.jpeg'}
                      alt={getChatDisplayInfo(selectedChat).name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/avatar.jpeg';
                      }}
                    />
                    {getChatDisplayInfo(selectedChat).isOnline && !selectedChat.isGroup && (
                      <Circle className="absolute -bottom-1 -right-1 w-3 h-3 text-green-500 fill-current" />
                    )}
                    {selectedChat.isGroup && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white dark:border-gray-800 flex items-center justify-center">
                        <Users className="w-1.5 h-1.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {getChatDisplayInfo(selectedChat).name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedChat.isGroup 
                        ? `${selectedChat.participants.length} ${language === 'ar' ? 'أعضاء' : 'members'}`
                        : getChatDisplayInfo(selectedChat).isOnline 
                          ? (language === 'ar' ? 'متصل الآن' : 'Online now')
                          : (language === 'ar' ? 'آخر ظهور منذ قليل' : 'Last seen recently')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVoiceCall}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVideoCall}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      {language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-2">
                      {language === 'ar' ? 'ابدأ المحادثة بإرسال رسالة' : 'Start the conversation by sending a message'}
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-1 md:space-x-2 max-w-[75vw] md:max-w-md lg:max-w-lg ${
                        message.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        {message.senderId !== user?.id && selectedChat.isGroup && (
                          <img
                            src={message.senderAvatar || '/avatar.jpeg'}
                            alt={message.senderName}
                            className="w-6 h-6 rounded-full object-cover hidden md:block"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/avatar.jpeg';
                            }}
                          />
                        )}
                        <div>
                          {message.senderId !== user?.id && selectedChat.isGroup && (
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
                              {message.senderName}
                            </p>
                          )}
                          <div
                            className={`px-3 md:px-4 py-2 rounded-2xl text-sm ${
                              message.senderId === user?.id
                                ? 'bg-green-500 text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-2 md:p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMediaPicker(true)}
                    className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 emoji-picker-container">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Smile className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                      
                      {/* Emoji Picker */}
                      <EmojiPicker
                        isOpen={showEmojiPicker}
                        onClose={() => setShowEmojiPicker(false)}
                        onEmojiSelect={handleEmojiSelect}
                        position="top"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowVoiceRecorder(true)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={`p-2 rounded-full transition-colors ${
                      messageInput.trim()
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'اختر محادثة' : 'Select a Chat'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'ar' ? 'اختر محادثة من القائمة لبدء المراسلة' : 'Choose a chat from the list to start messaging'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewChatModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'محادثة جديدة' : 'New Chat'}
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-45" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'البحث عن المستخدمين...' : 'Search for users...'}
                    value={newChatSearchTerm}
                    onChange={(e) => handleNewChatSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Results - Show following users by default, search results when searching */}
              <div className="max-h-96 overflow-y-auto">
                {newChatSearchTerm.trim() ? (
                  // Show search results when searching
                  searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <Users className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {searchResults.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleStartNewChat(user)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                          <MessageCircle className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  // Show following users by default
                  loadingFollowing ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    </div>
                  ) : followingUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <Users className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        {language === 'ar' ? 'لا تتابع أي شخص بعد. ابحث عن المستخدمين لبدء محادثة' : 'You are not following anyone yet. Search for users to start a chat'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                        {language === 'ar' ? 'الأشخاص الذين تتابعهم' : 'People you follow'}
                      </p>
                      {followingUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleStartNewChat(user)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                          <MessageCircle className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Recorder Modal */}
      <VoiceRecorder
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSendVoice={handleVoiceMessage}
        language={language}
      />

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onMediaSelect={handleMediaSelect}
        language={language}
      />

      {/* Call Modal */}
      {selectedChat && (
        <CallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          callType={callType}
          contactName={getChatDisplayInfo(selectedChat).name}
          contactAvatar={getChatDisplayInfo(selectedChat).avatar}
          isOutgoing={true}
          language={language}
        />
      )}
    </div>
  );
};

export default ChatPage;