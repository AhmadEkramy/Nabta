import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Frown, HandHeart, Heart, Loader2, MessageCircle, Share2, Smile, Zap } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ReactionModal from './ReactionModal';
import ReactionParticles from './ReactionParticles';

type ReactionType = 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';

interface Reactions {
  like: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
  support: number;
}

interface ReactionUser {
  id: string;
  name: string;
  avatar: string;
  reactionType: ReactionType;
}

interface PostReactionsProps {
  postId: string;
  reactions?: Reactions;
  comments?: number;
  shares?: number;
  userReaction?: ReactionType | null;
  onReaction: (type: ReactionType) => void;
  onComment: () => void;
  onShare: () => void;
  reactionUsers?: ReactionUser[]; // Real users who reacted
  loading?: {
    reaction?: boolean;
    share?: boolean;
  };
}

const reactionConfig = {
  like: { 
    icon: Heart, 
    emoji: '❤️', 
    color: '#ef4444', 
    bgColor: 'bg-red-50 dark:bg-red-900/20', 
    textColor: 'text-red-600 dark:text-red-400',
    glowColor: 'shadow-red-500/50',
    label: { en: 'Like', ar: 'إعجاب' }
  },
  laugh: { 
    icon: Smile, 
    emoji: '😂', 
    color: '#f59e0b', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', 
    textColor: 'text-yellow-600 dark:text-yellow-400',
    glowColor: 'shadow-yellow-500/50',
    label: { en: 'Laugh', ar: 'ضحك' }
  },
  wow: { 
    icon: Zap, 
    emoji: '😮', 
    color: '#3b82f6', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20', 
    textColor: 'text-blue-600 dark:text-blue-400',
    glowColor: 'shadow-blue-500/50',
    label: { en: 'Wow', ar: 'واو' }
  },
  sad: { 
    icon: Frown, 
    emoji: '😢', 
    color: '#6b7280', 
    bgColor: 'bg-gray-50 dark:bg-gray-900/20', 
    textColor: 'text-gray-600 dark:text-gray-400',
    glowColor: 'shadow-gray-500/50',
    label: { en: 'Sad', ar: 'حزين' }
  },
  angry: { 
    icon: Flame, 
    emoji: '😠', 
    color: '#dc2626', 
    bgColor: 'bg-red-50 dark:bg-red-900/20', 
    textColor: 'text-red-700 dark:text-red-300',
    glowColor: 'shadow-red-600/50',
    label: { en: 'Angry', ar: 'غاضب' }
  },
  support: { 
    icon: HandHeart, 
    emoji: '🤝', 
    color: '#10b981', 
    bgColor: 'bg-green-50 dark:bg-green-900/20', 
    textColor: 'text-green-600 dark:text-green-400',
    glowColor: 'shadow-green-500/50',
    label: { en: 'Support', ar: 'دعم' }
  }
};

const PostReactions: React.FC<PostReactionsProps> = ({
  postId,
  reactions = {
    like: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    support: 0
  },
  comments = 0,
  shares = 0,
  userReaction,
  onReaction,
  onComment,
  onShare,
  reactionUsers = [],
  loading = {}
}) => {
  const { language } = useLanguage();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState<{ type: ReactionType; trigger: boolean } | null>(null);
  const reactionButtonRef = useRef<HTMLDivElement>(null);

  // Ensure reactions is not null/undefined
  const safeReactions = reactions || {
    like: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    support: 0
  };

  const totalReactions = Object.values(safeReactions).reduce((sum, count) => sum + count, 0);
  const topReactions = Object.entries(safeReactions)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const handleReactionClick = (type: ReactionType) => {
    onReaction(type);
    setShowReactionPicker(false);
    setParticleTrigger({ type, trigger: true });
    
    // Reset particle trigger after animation
    setTimeout(() => {
      setParticleTrigger(null);
    }, 100);
  };

  const handleLikeButtonClick = () => {
    if (userReaction === 'like') {
      // If already liked, remove reaction (you might want to handle this differently)
      return;
    }
    handleReactionClick('like');
  };

  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 relative">
      {/* Reaction Particles */}
      {particleTrigger && (
        <ReactionParticles
          trigger={particleTrigger.trigger}
          reactionType={particleTrigger.type}
          onComplete={() => setParticleTrigger(null)}
        />
      )}

      {/* Stats Summary */}
      {(totalReactions > 0 || comments > 0 || shares > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400 py-3 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {topReactions.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReactionModal(true)}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors cursor-pointer group"
                title={language === 'ar' ? 'اضغط لرؤية من تفاعل' : 'Click to see who reacted'}
              >
                <div className="flex -space-x-1">
                  {topReactions.slice(0, 3).map(([type, count]) => (
                    <motion.div
                      key={type}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white dark:border-gray-800 shadow-sm"
                      style={{ 
                        backgroundColor: `${reactionConfig[type as ReactionType].color}20`,
                        borderColor: reactionConfig[type as ReactionType].color
                      }}
                    >
                      {reactionConfig[type as ReactionType].emoji}
                    </motion.div>
                  ))}
                </div>
                <motion.span 
                  className="font-medium hover:text-gray-700 dark:hover:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {totalReactions} {language === 'ar' ? 'تفاعل' : 'reactions'}
                </motion.span>
              </motion.button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {comments > 0 && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {comments} {language === 'ar' ? 'تعليق' : 'comments'}
              </motion.span>
            )}
            {shares > 0 && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {shares} {language === 'ar' ? 'مشاركة' : 'shares'}
              </motion.span>
            )}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex items-center space-x-1 max-[400px]:scale-[0.80] max-[400px]:origin-center">
          {/* Reaction Button with Picker */}
          <div className="relative" ref={reactionButtonRef}>
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                rotateX: 5,
                rotateY: userReaction ? 10 : 0
              }}
              whileTap={{ scale: 0.95, rotateX: -5 }}
              onClick={handleLikeButtonClick}
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
              disabled={loading.reaction}
              className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 relative overflow-hidden ${
                userReaction
                  ? `${reactionConfig[userReaction].bgColor} ${reactionConfig[userReaction].textColor} shadow-lg ${reactionConfig[userReaction].glowColor} reaction-glow`
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:shadow-md'
              } ${loading.reaction ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                boxShadow: userReaction ? `0 0 25px ${reactionConfig[userReaction].color}60, 0 0 50px ${reactionConfig[userReaction].color}30` : undefined,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Glowing background effect */}
              {userReaction && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: reactionConfig[userReaction].color }}
                />
              )}
              
              {loading.reaction ? (
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              ) : (
                <motion.div
                  animate={userReaction ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  {userReaction ? (
                    <span className="text-lg">{reactionConfig[userReaction].emoji}</span>
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </motion.div>
              )}
              <span className="text-sm font-medium relative z-10">
                {userReaction 
                  ? reactionConfig[userReaction].label[language as 'en' | 'ar']
                  : (language === 'ar' ? 'إعجاب' : 'Like')
                }
              </span>
              {userReaction && safeReactions[userReaction] > 0 && (
                <span className="text-sm relative z-10">({safeReactions[userReaction]})</span>
              )}
            </motion.button>

            {/* Reaction Picker */}
            <AnimatePresence>
              {showReactionPicker && (
                <motion.div
                  initial={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: 10,
                    rotateX: -15,
                    rotateY: 0
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    rotateX: 0,
                    rotateY: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: 10,
                    rotateX: -15
                  }}
                  transition={{ 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  className="reaction-picker absolute bottom-full left-0 mb-2 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 flex space-x-2 z-50"
                  onMouseEnter={() => setShowReactionPicker(true)}
                  onMouseLeave={() => setShowReactionPicker(false)}
                  style={{
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {Object.entries(reactionConfig).map(([type, config]) => (
                    <motion.button
                      key={type}
                      whileHover={{ 
                        scale: 1.4, 
                        y: -8,
                        rotateZ: [0, -15, 15, 0],
                        rotateX: [0, 10, -10, 0],
                        rotateY: [0, 5, -5, 0]
                      }}
                      whileTap={{ 
                        scale: 0.8,
                        rotateZ: 0,
                        rotateX: 0,
                        rotateY: 0
                      }}
                      onClick={() => handleReactionClick(type as ReactionType)}
                      className="btn-3d w-12 h-12 rounded-full flex items-center justify-center text-xl hover:shadow-lg transition-all duration-200 relative reaction-bounce"
                      style={{
                        backgroundColor: `${config.color}25`,
                        boxShadow: `0 0 20px ${config.color}40, 0 5px 15px rgba(0, 0, 0, 0.1)`,
                        transformStyle: 'preserve-3d',
                        border: `2px solid ${config.color}30`
                      }}
                    >
                      <motion.span
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotateZ: [0, 5, -5, 0],
                          rotateY: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: Math.random() * 2,
                          ease: "easeInOut"
                        }}
                        className="reaction-float glow-text"
                        style={{
                          filter: `drop-shadow(0 0 8px ${config.color})`,
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        {config.emoji}
                      </motion.span>
                      
                      {/* Reaction count badge */}
                      {safeReactions[type as ReactionType] > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {safeReactions[type as ReactionType]}
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comment Button */}
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              y: -3,
              rotateX: 5,
              rotateZ: 2
            }}
            whileTap={{ scale: 0.95, rotateX: -5 }}
            onClick={onComment}
            className="btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:shadow-md"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'تعليق' : 'Comment'}
            </span>
            {comments > 0 && (
              <span className="text-sm">({comments})</span>
            )}
          </motion.button>

          {/* Share Button */}
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              y: -3,
              rotateX: 5,
              rotateZ: -2
            }}
            whileTap={{ scale: 0.95, rotateX: -5 }}
            onClick={onShare}
            disabled={loading.share}
            className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:shadow-md ${
              loading.share ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {loading.share ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {language === 'ar' ? 'مشاركة' : 'Share'}
            </span>
            {shares > 0 && (
              <span className="text-sm">({shares})</span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Reaction Modal */}
      <ReactionModal
        isOpen={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        reactions={safeReactions}
        postId={postId}
        reactionUsers={reactionUsers}
      />
    </div>
  );
};

export default PostReactions;