import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    addStoryComment,
    createStory,
    deleteStory,
    getStoriesGroupedByUser,
    getStoryComments,
    getStoryStats,
    markStoryAsViewed,
    toggleStoryLike,
} from '../firebase/stories';

// Hook for managing stories
export const useStories = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const groupedStories = await getStoriesGroupedByUser();
      setStories(groupedStories);
      setError(null);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return { stories, loading, error, refreshStories: fetchStories };
};

// Hook for creating stories
export const useCreateStory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      const storyId = await createStory(
        user.id,
        user.name,
        user.avatar,
        content,
        mediaUrl,
        mediaType
      );
      return storyId;
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Failed to create story');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

// Hook for story likes
export const useStoryLike = (storyId: string, initialLiked: boolean = false, initialCount: number = 0) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      const newLikedState = await toggleStoryLike(storyId, user.id, user.name, user.avatar);
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling story like:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likeCount, toggleLike, loading };
};

// Hook for story comments
export const useStoryComments = (storyId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const storyComments = await getStoryComments(storyId);
      setComments(storyComments);
      setError(null);
    } catch (err) {
      console.error('Error fetching story comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return false;

    try {
      setAddingComment(true);
      const commentId = await addStoryComment(storyId, user.id, user.name, user.avatar, content);
      
      // Add the new comment to the local state immediately
      const newComment = {
        id: commentId,
        storyId,
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
      console.error('Error adding story comment:', error);
      setError('Failed to add comment');
      return false;
    } finally {
      setAddingComment(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  return {
    comments,
    loading,
    error,
    addingComment,
    addComment,
    refreshComments: fetchComments,
  };
};

// Hook for story viewing
export const useStoryViewing = () => {
  const { user } = useAuth();

  const markAsViewed = async (storyId: string) => {
    if (!user) return false;

    try {
      await markStoryAsViewed(storyId, user.id);
      return true;
    } catch (error) {
      console.error('Error marking story as viewed:', error);
      return false;
    }
  };

  return { markAsViewed };
};

// Hook for story management
export const useStoryManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeStory = async (storyId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await deleteStory(storyId, user.id);
      return true;
    } catch (err) {
      console.error('Error deleting story:', err);
      setError('Failed to delete story');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { removeStory, loading, error };
};

// Hook for story stats
export const useStoryStats = (storyId: string) => {
  const [stats, setStats] = useState({ likes: 0, comments: 0, views: 0, likedBy: [], viewedBy: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const storyStats = await getStoryStats(storyId);
      setStats(storyStats);
    } catch (error) {
      console.error('Error fetching story stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [storyId]);

  return { stats, loading, refreshStats: fetchStats };
};