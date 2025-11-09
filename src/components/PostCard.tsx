import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePostLike, usePostManagement, usePostShare } from '../hooks/usePostInteractions';
import { usePostReactions } from '../hooks/usePostReactions';
import { Post } from '../types';
import CommentsModal from './CommentsModal';
import EditPostModal from './EditPostModal';
import PostOptionsMenu from './PostOptionsMenu';
import PostReactions from './PostReactions';

type ReactionType = 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';

interface PostCardProps {
  post: Post;
  onPostUpdate?: () => void; // Callback to refresh posts after edit/delete
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdate }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Use Firebase-based reactions
  const {
    reactions,
    reactionUsers,
    userReaction,
    loading: reactionLoading,
    error: reactionError,
    addReaction
  } = usePostReactions(
    post.id,
    user?.id,
    user?.name || user?.email,
    user?.avatar
  );
  
  // Check if current user is the post author
  const isPostAuthor = user?.id === post.userId;
  
  // Use real interaction hooks
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = usePostLike(
    post.id, 
    post.likedBy?.includes(user?.id || '') || false, 
    post.likes || 0
  );
  const { share, loading: shareLoading } = usePostShare();
  const { editPost, removePost, loading: managementLoading } = usePostManagement();

  const handleReaction = async (type: ReactionType) => {
    await addReaction(type);
  };

  const handleShare = async () => {
    const success = await share(post.id);
    if (success) {
      toast.success(
        language === 'ar' 
          ? 'تم مشاركة المنشور بنجاح' 
          : 'Post shared successfully'
      );
      // Refresh the main posts list if available
      if (onPostUpdate) {
        onPostUpdate();
      }
      
      // Emit a custom event to refresh shared posts in profile
      window.dispatchEvent(new CustomEvent('refreshSharedPosts'));
    } else {
      toast.error(
        language === 'ar' 
          ? 'لقد شاركت المنشور بالفعل' 
          : 'You have already shared this post'
      );
    }
  };

  const handleEditPost = async (newContent: string) => {
    const success = await editPost(post.id, newContent);
    if (success && onPostUpdate) {
      onPostUpdate(); // Refresh posts to show updated content
    }
    return success;
  };

  const handleDeletePost = async () => {
    const success = await removePost(post.id);
    if (success && onPostUpdate) {
      onPostUpdate(); // Refresh posts to remove deleted post
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.userId}`}>
            <img
              src={post.userAvatar || '/avatar.jpeg'}
              alt={post.userName}
              className="w-12 h-12 rounded-full hover:ring-2 hover:ring-green-500 transition-all cursor-pointer"
            />
          </Link>
          <div>
            <Link 
              to={`/profile/${post.userId}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {post.userName}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              {post.circleName && (
                <>
                  <span>•</span>
                  <span className="text-green-600 dark:text-green-400">{post.circleName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Options Menu - Only show for post author */}
        {isPostAuthor && (
          <div className="relative">
            <button 
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            <PostOptionsMenu
              isOpen={showOptionsMenu}
              onClose={() => setShowOptionsMenu(false)}
              onEdit={() => setShowEditModal(true)}
              onDelete={handleDeletePost}
              loading={managementLoading}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-white leading-relaxed">{post.content}</p>
      </div>

      {/* Reactions */}
      <PostReactions
        postId={post.id}
        reactions={reactions}
        comments={post.comments || 0}
        shares={post.shares || 0}
        userReaction={userReaction}
        onReaction={handleReaction}
        onComment={() => setShowComments(true)}
        onShare={handleShare}
        reactionUsers={reactionUsers.map(r => ({
          id: r.userId,
          name: r.userName,
          avatar: r.userAvatar,
          reactionType: r.reactionType
        }))}
        loading={{
          reaction: reactionLoading,
          share: shareLoading,
        }}
      />

      {/* Comments Modal */}
      {showComments && (
        <CommentsModal
          postId={post.id}
          postAuthor={post.userName}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <EditPostModal
          postId={post.id}
          currentContent={post.content}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditPost}
          loading={managementLoading}
        />
      )}
    </motion.div>
  );
};

export default PostCard;