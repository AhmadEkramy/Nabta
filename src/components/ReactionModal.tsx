import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

type ReactionType = 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';

interface ReactionUser {
  id: string;
  name: string;
  avatar: string;
  reactionType: ReactionType;
}

interface ReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: { [key in ReactionType]: number };
  postId: string;
  reactionUsers?: ReactionUser[]; // Real users who reacted
}

const reactionConfig = {
  like: { 
    emoji: '❤️', 
    color: '#ef4444',
    label: { en: 'Love', ar: 'إعجاب' }
  },
  laugh: { 
    emoji: '😂', 
    color: '#f59e0b',
    label: { en: 'Laugh', ar: 'ضحك' }
  },
  wow: { 
    emoji: '😮', 
    color: '#3b82f6',
    label: { en: 'Wow', ar: 'واو' }
  },
  sad: { 
    emoji: '😢', 
    color: '#6b7280',
    label: { en: 'Sad', ar: 'حزين' }
  },
  angry: { 
    emoji: '😠', 
    color: '#dc2626',
    label: { en: 'Angry', ar: 'غاضب' }
  },
  support: { 
    emoji: '🤝', 
    color: '#10b981',
    label: { en: 'Support', ar: 'دعم' }
  }
};

const ReactionModal: React.FC<ReactionModalProps> = ({
  isOpen,
  onClose,
  reactions,
  postId,
  reactionUsers = []
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Use real users if provided, otherwise fall back to mock data
  const mockUsers: ReactionUser[] = [
    { id: '1', name: 'Ahmed Hassan', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', reactionType: 'like' },
    { id: '2', name: 'Sarah Ahmed', avatar: 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', reactionType: 'laugh' },
    { id: '3', name: 'Mohamed Ali', avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', reactionType: 'wow' },
    { id: '4', name: 'Fatima Omar', avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', reactionType: 'support' },
    { id: '5', name: 'Youssef Ibrahim', avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', reactionType: 'like' },
    { id: '6', name: 'Nour Hassan', avatar: 'https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1', reactionType: 'laugh' },
  ];

  // Use real users if available, otherwise use mock data filtered by actual reactions
  const usersToShow = reactionUsers.length > 0 
    ? reactionUsers 
    : mockUsers.filter(user => reactions[user.reactionType] > 0);

  // Group users by reaction type
  const groupedReactions = Object.entries(reactionConfig).reduce((acc, [type, config]) => {
    const count = reactions[type as ReactionType];
    if (count > 0) {
      acc[type as ReactionType] = {
        config,
        count,
        users: usersToShow.filter(user => user.reactionType === type)
      };
    }
    return acc;
  }, {} as Record<ReactionType, { config: any; count: number; users: ReactionUser[] }>);

  const totalReactions = usersToShow.length;

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose(); // Close the modal after navigation
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
              {language === 'ar' ? 'التفاعلات' : 'Reactions'} ({totalReactions})
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {Object.entries(groupedReactions).map(([type, data]) => (
              <div key={type} className="mb-6 last:mb-0">
                {/* Reaction Type Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ 
                      backgroundColor: `${data.config.color}20`,
                      border: `2px solid ${data.config.color}40`
                    }}
                  >
                    {data.config.emoji}
                  </motion.div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {data.config.label[language as 'en' | 'ar']}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data.users.length} {language === 'ar' ? (data.users.length === 1 ? 'شخص' : 'أشخاص') : (data.users.length === 1 ? 'person' : 'people')}
                    </p>
                  </div>
                </div>

                {/* Users List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.users.length > 0 ? (
                    data.users.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleUserClick(user.id)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {language === 'ar' ? 'تفاعل مع المنشور' : 'Reacted to this post'}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 border-white dark:border-gray-800"
                          style={{ 
                            backgroundColor: `${data.config.color}20`,
                            borderColor: data.config.color,
                            filter: `drop-shadow(0 0 8px ${data.config.color}40)`
                          }}
                        >
                          {data.config.emoji}
                        </motion.div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">😔</div>
                      <p>{language === 'ar' ? 'لا يوجد تفاعلات بعد' : 'No reactions yet'}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {totalReactions === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'لا توجد تفاعلات بعد' : 'No reactions yet'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReactionModal;