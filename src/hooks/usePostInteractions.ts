import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    addPostComment,
    deleteComment,
    deletePost,
    getPostComments,
    getPostStats,
    toggleCommentLike,
    togglePostLike,
    updatePost,
} from '../firebase/postInteractions';
import { sharePost, unsharePost } from '../firebase/sharedPosts';

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
  interface Comment {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: string | { seconds: number; nanoseconds: number };
    likes: number;
    likedBy: string[];
  }
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  const fetchComments = useCallback(async () => {
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
  }, [postId]);

  const addComment = async (content: string, parentCommentId?: string) => {
    if (!user || !content.trim()) return false;

    try {
      setAddingComment(true);
      const commentId = await addPostComment(postId, user.id, user.name, user.avatar, content, parentCommentId);
      
      // Refresh comments to get the updated nested structure
      await fetchComments();
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
  }, [postId, fetchComments]);

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

  const share = async (postId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      const result = await sharePost(postId, user.id);
      return result;
    } catch (err) {
      console.error('Error sharing post:', err);
      setError('Failed to share post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unshare = async (postId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      const result = await unsharePost(postId, user.id);
      return result;
    } catch (err) {
      console.error('Error unsharing post:', err);
      setError('Failed to unshare post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { share, unshare, loading, error };
};

// Hook for post stats
export const usePostStats = (postId: string) => {
  const [stats, setStats] = useState({ likes: 0, comments: 0, shares: 0, likedBy: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const postStats = await getPostStats(postId);
      setStats(postStats);
    } catch (error) {
      console.error('Error fetching post stats:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refreshStats: fetchStats };
};

// Hook for post management (edit/delete)
export const usePostManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editPost = async (postId: string, newContent: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await updatePost(postId, user.id, newContent, mediaUrl, mediaType);
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
      // Pass user's admin status to allow admins to delete any post
      await deletePost(postId, user.id, user.isAdmin || false);
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