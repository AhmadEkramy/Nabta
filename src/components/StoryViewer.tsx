import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, Send, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useStoryComments, useStoryLike, useStoryManagement, useStoryViewing } from '../hooks/useStories';
import { StoryGroup } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  initialStoryIndex: number;
  onClose: () => void;
  onStoryUpdate?: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  storyGroups,
  initialGroupIndex,
  initialStoryIndex,
  onClose,
  onStoryUpdate
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [progress, setProgress] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<any[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const isStoryAuthor = user?.id === currentStory?.userId;

  // Hooks for story interactions
  const userHasLiked = currentStory?.likedBy?.includes(user?.id || '') || false;
  const { isLiked, likeCount, toggleLike } = useStoryLike(
    currentStory?.id || '',
    userHasLiked,
    currentStory?.likes || 0
  );
  const { comments, addComment, addingComment } = useStoryComments(currentStory?.id || '');
  const { markAsViewed } = useStoryViewing();
  const { removeStory, loading: deleteLoading } = useStoryManagement();

  // Auto-progress timer
  useEffect(() => {
    if (!currentStory) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 2; // 5 seconds total (100 / 2 = 50 intervals of 100ms)
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStory?.id]);

  // Mark story as viewed when it loads
  useEffect(() => {
    if (currentStory && user) {
      markAsViewed(currentStory.id);
    }
  }, [currentStory?.id, user?.id]);

  const nextStory = () => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await addComment(newComment.trim());
    if (success) {
      setNewComment('');
    }
  };

  const handleDeleteStory = async () => {
    if (!currentStory) return;
    
    const success = await removeStory(currentStory.id);
    if (success) {
      setShowDeleteConfirmation(false);
      if (onStoryUpdate) {
        onStoryUpdate();
      }
      // Move to next story or close if this was the last one
      if (currentGroup.stories.length === 1) {
        onClose();
      } else {
        nextStory();
      }
    }
  };

  const fetchViewers = async () => {
    if (!currentStory?.viewedBy || currentStory.viewedBy.length === 0) {
      setViewers([]);
      return;
    }

    try {
      setLoadingViewers(true);
      const viewersData: any[] = [];
      
      // Fetch user data for each viewer in batches
      const batchSize = 10;
      for (let i = 0; i < currentStory.viewedBy.length; i += batchSize) {
        const batch = currentStory.viewedBy.slice(i, i + batchSize);
        const usersQuery = query(
          collection(db, 'users'),
          where('__name__', 'in', batch)
        );
        const snapshot = await getDocs(usersQuery);
        snapshot.forEach(doc => {
          viewersData.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }
      
      setViewers(viewersData);
    } catch (error) {
      console.error('Error fetching viewers:', error);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleShowViewers = () => {
    setShowViewers(true);
    fetchViewers();
  };

  const handleViewerClick = (viewerId: string) => {
    navigate(`/profile/${viewerId}`);
    onClose();
  };

  if (!currentStory) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Story Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
        {currentGroup.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index < currentStoryIndex ? '100%' : 
                       index === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <img
            src={currentStory.userAvatar}
            alt={currentStory.userName}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <h3 className="text-white font-semibold">{currentStory.userName}</h3>
            <p className="text-white/80 text-sm">
              {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isStoryAuthor && (
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              disabled={deleteLoading}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Areas */}
      <button
        onClick={prevStory}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-4"
        disabled={currentGroupIndex === 0 && currentStoryIndex === 0}
      >
        <ChevronLeft className="w-8 h-8 text-white/50" />
      </button>

      <button
        onClick={nextStory}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-4"
      >
        <ChevronRight className="w-8 h-8 text-white/50" />
      </button>

      {/* Story Content */}
      <div className="w-full h-full flex items-center justify-center">
        {currentStory.mediaUrl ? (
          currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              loop
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story content"
              className="max-w-full max-h-full object-contain"
            />
          )
        ) : (
          <div className="max-w-md mx-auto p-8 text-center">
            <p className="text-white text-xl leading-relaxed">
              {currentStory.content}
            </p>
          </div>
        )}
      </div>

      {/* Story Text Overlay (if there's both media and text) */}
      {currentStory.mediaUrl && currentStory.content && (
        <div className="absolute bottom-32 left-4 right-4 z-10">
          <div className="bg-black/50 rounded-lg p-4">
            <p className="text-white text-lg leading-relaxed">
              {currentStory.content}
            </p>
          </div>
        </div>
      )}

      {/* Story Actions */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={toggleLike}
              className="flex items-center space-x-2 text-white"
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {/* Comments Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-white"
            >
              <MessageCircle className="w-6 h-6" />
              {comments.length > 0 && <span>{comments.length}</span>}
            </button>

            {/* Views Count */}
            {isStoryAuthor ? (
              <button
                onClick={handleShowViewers}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span>{currentStory.views}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-white/80">
                <Eye className="w-5 h-5" />
                <span>{currentStory.views}</span>
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        {!showComments && (
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mt-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب تعليقاً...' : 'Add a comment...'}
                className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                disabled={addingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || addingComment}
                className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments Panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 z-20 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'التعليقات' : 'Comments'}
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'لا توجد تعليقات بعد' : 'No comments yet'}
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {comment.userName}
                        </h4>
                        <p className="text-gray-800 dark:text-gray-200 text-sm">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input in Panel */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleCommentSubmit} className="flex space-x-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب تعليقاً...' : 'Add a comment...'}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-full px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    disabled={addingComment}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || addingComment}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteStory}
        title={language === 'ar' ? 'حذف القصة' : 'Delete Story'}
        message={language === 'ar' 
          ? 'هل أنت متأكد من حذف هذه القصة؟ لا يمكن التراجع عن هذا الإجراء.' 
          : 'Are you sure you want to delete this story? This action cannot be undone.'}
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        isLoading={deleteLoading}
        type="danger"
      />

      {/* Viewers Modal */}
      <AnimatePresence>
        {showViewers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowViewers(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-green-500" />
                  {language === 'ar' ? 'المشاهدات' : 'Viewers'}
                </h2>
                <button
                  onClick={() => setShowViewers(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingViewers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : viewers.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'لا توجد مشاهدات بعد' : 'No views yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewers.map((viewer) => (
                    <motion.button
                      key={viewer.id}
                      onClick={() => handleViewerClick(viewer.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                    >
                      <img
                        src={viewer.avatar || '/avatar.jpeg'}
                        alt={viewer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {viewer.name}
                        </h3>
                        {viewer.username && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{viewer.username}
                          </p>
                        )}
                      </div>
                      <div className="text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' 
                    ? `${viewers.length} ${viewers.length === 1 ? 'مشاهدة' : 'مشاهدات'}`
                    : `${viewers.length} ${viewers.length === 1 ? 'view' : 'views'}`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryViewer;