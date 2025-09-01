import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    createNewPost,
    getDailyQuranVerse,
    getHomeFeedPosts,
    getUserCircles,
    getUserRecentActivity
} from '../firebase/homePage';
import { getUserQuranProgress } from '../firebase/quran';
import { Circle, Post, QuranProgress } from '../types';

// Hook for home feed posts
export const useHomeFeedPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching posts for user:', user.id, 'with circles:', user.circles);
      const feedPosts = await getHomeFeedPosts(user.id, user.circles);
      console.log('Fetched posts:', feedPosts.length, feedPosts);
      setPosts(feedPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching home feed posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id, user?.circles]);

  const refreshPosts = () => {
    fetchPosts();
  };

  return { posts, loading, error, refreshPosts };
};

// Hook for user circles
export const useUserCircles = () => {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCircles = async () => {
      if (!user?.circles || user.circles.length === 0) {
        setCircles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userCircles = await getUserCircles(user.circles);
        setCircles(userCircles);
        setError(null);
      } catch (err) {
        console.error('Error fetching user circles:', err);
        setError('Failed to load circles');
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, [user?.circles]);

  return { circles, loading, error };
};

// Hook for recent activity
export const useRecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const recentActivity = await getUserRecentActivity(user.id);
        setActivities(recentActivity);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user?.id]);

  return { activities, loading, error };
};

// Hook for daily Quran verse
export const useDailyVerse = () => {
  const { user } = useAuth();
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = async () => {
    try {
      setLoading(true);
      const dailyVerse = await getDailyQuranVerse(user?.id);
      console.log('Daily verse hook - fetched verse:', dailyVerse?.id);
      setVerse(dailyVerse);
      setError(null);
    } catch (err) {
      console.error('Error fetching daily verse:', err);
      setError('Failed to load verse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVerse();
    }
  }, [user?.id]);

  const refreshVerse = () => {
    if (user?.id) {
      fetchVerse();
    }
  };

  return { verse, loading, error, refreshVerse };
};

// Hook for user's Quran reading progress
export const useQuranProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<QuranProgress>({
    readVerses: 0,
    totalVerses: 6236,
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const quranProgress = await getUserQuranProgress(user.id);
      console.log('User Quran progress:', quranProgress);
      setProgress(quranProgress);
      setError(null);
    } catch (err) {
      console.error('Error fetching Quran progress:', err);
      setError('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user?.id]);

  const refreshProgress = () => {
    fetchProgress();
  };

  return { progress, loading, error, refreshProgress };
};



// Hook for creating posts
export const useCreatePost = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (content: string, circleId?: string) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Find circle name if circleId is provided
      let circleName: string | undefined = undefined;
      if (circleId) {
        // You can add logic here to fetch circle name from circleId
        // For now, we'll leave it undefined since we don't have the circle data readily available
        // This can be improved later by fetching circle details
      }
      
      const postId = await createNewPost({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content,
        circleId,
        circleName,
      });

      return postId;
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPost, loading, error };
};