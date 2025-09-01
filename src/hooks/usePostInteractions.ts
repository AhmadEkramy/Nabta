import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    addPostComment,
    deleteComment,
    deletePost,
    getPostComments,
    getPostStats,
    sharePost,
    toggleCommentLike,
    togglePostLike,
    updatePost,
} from '../firebase/postInteractions';

// Hook for post likes
export const usePostLike = (postId: string, initialLiked: boolean = false, initialCount: number = 0) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      const newLikedState = await togglePostLike(postId, user.id, user.name, user.avatar);
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likeCount, toggleLike, loading };
};

// Hook for post comments
export const usePostComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const postComments = await getPostComments(postId);
      setComments(postComments);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return false;

    try {
      setAddingComment(true);
      const commentId = await addPostComment(postId, user.id, user.name, user.avatar, content);
      
      // Add the new comment to the local state immediately
      const newComment = {
        id: commentId,
        postId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      };
      
      setComments(prev => [newComment, ...prev]);
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
      return false;
    } finally {
      setAddingComment(false);
    }
  };

  const removeComment = async (commentId: string) => {
    if (!user) return false;

    try {
      await deleteComment(commentId, user.id);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
      return false;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    loading,
    error,
    addingComment,
    addComment,
    removeComment,
    refreshComments: fetchComments,
  };
};

// Hook for comment likes
export const useCommentLike = (commentId: string, initialLiked: boolean = false, initialCount: number = 0) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      const newLikedState = await toggleCommentLike(commentId, user.id);
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling comment like:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likeCount, toggleLike, loading };
};

// Hook for post sharing
export const usePostShare = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = async (postId: string, shareType: 'direct' | 'story' | 'external' = 'direct') => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await sharePost(postId, user.id, user.name, user.avatar, shareType);
      return true;
    } catch (err) {
      console.error('Error sharing post:', err);
      setError('Failed to share post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { share, loading, error };
};

// Hook for post stats
export const usePostStats = (postId: string) => {
  const [stats, setStats] = useState({ likes: 0, comments: 0, shares: 0, likedBy: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const postStats = await getPostStats(postId);
      setStats(postStats);
    } catch (error) {
      console.error('Error fetching post stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [postId]);

  return { stats, loading, refreshStats: fetchStats };
};

// Hook for post management (edit/delete)
export const usePostManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editPost = async (postId: string, newContent: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await updatePost(postId, user.id, newContent);
      return true;
    } catch (err) {
      console.error('Error editing post:', err);
      setError('Failed to edit post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removePost = async (postId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await deletePost(postId, user.id);
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editPost, removePost, loading, error };
};