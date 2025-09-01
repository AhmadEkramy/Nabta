import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Loader2, MessageCircle, Send, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCommentLike, usePostComments } from '../hooks/usePostInteractions';

interface CommentsModalProps {
  postId: string;
  postAuthor: string;
  onClose: () => void;
}

interface CommentItemProps {
  comment: any;
  onDelete: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const userHasLiked = comment.likedBy?.includes(user?.id || '') || false;
  const { isLiked, likeCount, toggleLike, loading } = useCommentLike(
    comment.id,
    userHasLiked,
    comment.likes || 0
  );

  const canDelete = user && (user.id === comment.userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
    >
      <Link to={`/profile/${comment.userId}`}>
        <img
          src={comment.userAvatar}
          alt={comment.userName}
          className="w-10 h-10 rounded-full hover:ring-2 hover:ring-green-500 transition-all"
        />
      </Link>
      
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
          <Link 
            to={`/profile/${comment.userId}`}
            className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {comment.userName}
          </Link>
          <p className="text-gray-800 dark:text-gray-200 mt-1">
            {comment.content}
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
      </div>
    </motion.div>
  );
};

const CommentsModal: React.FC<CommentsModalProps> = ({ postId, postAuthor, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const {
    comments,
    loading,
    error,
    addingComment,
    addComment,
    removeComment,
  } = usePostComments(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await addComment(newComment.trim());
    if (success) {
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await removeComment(commentId);
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
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full"
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
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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