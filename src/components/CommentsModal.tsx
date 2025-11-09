import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Loader2, MessageCircle, Reply, Send, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserByDisplayName, getUserByUsername } from '../firebase/userProfile';
import { useCommentLike, usePostComments } from '../hooks/usePostInteractions';

interface CommentsModalProps {
  postId: string;
  postAuthor: string;
  onClose: () => void;
}

interface CommentItemProps {
  comment: any;
  onDelete: (commentId: string) => void;
  onReply: (userName: string, commentId: string) => void;
  depth?: number;
  onAddReply?: (parentId: string, content: string) => Promise<boolean>;
  showReplies?: boolean;
}

// Function to parse and render text with mentions
const renderTextWithMentions = (text: string, navigate: any) => {
  // Support both display names (@Ahmed Ekramy) and usernames (@ahmed_ekramy)
  // Matches @ followed by either:
  // 1. Capitalized words with spaces (display name)
  // 2. Lowercase letters, numbers, underscores, dots (username)
  const mentionRegex = /@([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[a-z0-9_.]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  const handleMentionClick = async (mentionedName: string) => {
    try {
      // Check if it's a username (lowercase with _, .)
      const isUsername = /^[a-z0-9_.]+$/.test(mentionedName);
      
      let userId: string | null = null;
      
      if (isUsername) {
        // Try to find user by username
        userId = await getUserByUsername(mentionedName);
      } else {
        // Try to find user by display name
        userId = await getUserByDisplayName(mentionedName);
      }
      
      if (userId) {
        navigate(`/profile/${userId}`);
      } else {
        console.warn('User not found:', mentionedName);
      }
    } catch (error) {
      console.error('Error navigating to user profile:', error);
    }
  };

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add mention as clickable link
    const mentionedName = match[1];
    parts.push(
      <span
        key={match.index}
        onClick={() => handleMentionClick(mentionedName)}
        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium cursor-pointer hover:underline"
      >
        @{mentionedName}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete, 
  onReply, 
  depth = 0,
  onAddReply,
  showReplies = true 
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [addingReply, setAddingReply] = useState(false);
  
  const userHasLiked = comment.likedBy?.includes(user?.id || '') || false;
  const { isLiked, likeCount, toggleLike, loading } = useCommentLike(
    comment.id,
    userHasLiked,
    comment.likes || 0
  );

  const canDelete = user && (user.id === comment.userId);
  const maxDepth = 2; // Maximum nesting level for replies

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
    // Store both username and userId for later use
    // Use username if available, otherwise generate from userName
    const usernameToMention = comment.username || comment.userName.toLowerCase().replace(/\s+/g, '_');
    setReplyText(`@${usernameToMention} `);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !onAddReply) return;

    setAddingReply(true);
    try {
      const success = await onAddReply(comment.id, replyText.trim());
      if (success) {
        setReplyText('');
        setShowReplyInput(false);
      }
    } finally {
      setAddingReply(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
    >
      <div className="flex space-x-3 w-full">
        <Link to={`/profile/${comment.userId}`}>
          <img
            src={comment.userAvatar}
            alt={comment.userName}
            className="w-10 h-10 rounded-full hover:ring-2 hover:ring-green-500 transition-all flex-shrink-0"
          />
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
            <Link 
              to={`/profile/${comment.userId}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {comment.userName}
            </Link>
            <p className="text-gray-800 dark:text-gray-200 mt-1 break-words">
              {renderTextWithMentions(comment.content, navigate)}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            
            <button
              onClick={toggleLike}
              disabled={loading}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500' : ''
              } ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              )}
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {depth < maxDepth && (
              <button
                onClick={handleReplyClick}
                className="flex items-center space-x-1 hover:text-green-500 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>{language === 'ar' ? 'رد' : 'Reply'}</span>
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center space-x-1 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
              </button>
            )}
          </div>

          {/* Reply Input Box */}
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 ml-2"
            >
              <form onSubmit={handleSubmitReply} className="flex space-x-2">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب رداً...' : 'Write a reply...'}
                    className="flex-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    disabled={addingReply}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || addingReply}
                    className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
                  >
                    {addingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {language === 'ar' ? 'إرسال' : 'Send'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Render nested replies inside a box */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-2">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onDelete={onDelete}
                  onReply={onReply}
                  depth={depth + 1}
                  onAddReply={onAddReply}
                  showReplies={showReplies}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CommentsModal: React.FC<CommentsModalProps> = ({ postId, postAuthor, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const {
    comments,
    loading,
    error,
    addingComment,
    addComment,
    removeComment,
    refreshComments,
  } = usePostComments(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await addComment(newComment.trim());
    if (success) {
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await removeComment(commentId);
  };

  const handleReply = (userName: string, commentId: string) => {
    setReplyingTo(userName);
    setNewComment(`@${userName} `);
    // Focus the input
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const handleAddReply = async (parentId: string, content: string): Promise<boolean> => {
    if (!user || !content.trim()) return false;

    try {
      // Add reply with parentCommentId
      const success = await addComment(content, parentId);
      if (success) {
        // Comments will be refreshed automatically in addComment
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding reply:', error);
      return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'التعليقات' : 'Comments'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'جاري تحميل التعليقات...' : 'Loading comments...'}
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد تعليقات بعد' : 'No comments yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'كن أول من يعلق على هذا المنشور' : 'Be the first to comment on this post'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDelete={handleDeleteComment}
                  onReply={handleReply}
                  onAddReply={handleAddReply}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {replyingTo && (
            <div className="mb-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {language === 'ar' ? 'الرد على' : 'Replying to'} <span className="font-semibold">@{replyingTo}</span>
              </span>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            {language === 'ar' 
              ? 'استخدم @ لعمل mention لمستخدم (مثال: @ahmed_ekramy)' 
              : 'Use @ to mention a user (e.g., @ahmed_ekramy)'}
          </div>
          
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب تعليقاً...' : 'Write a comment...'}
                className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-full px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                disabled={addingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || addingComment}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {addingComment ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CommentsModal;