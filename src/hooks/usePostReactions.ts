import { useEffect, useState } from 'react';
import {
    addPostReaction,
    getPostReactionCounts,
    getPostReactions,
    getUserReaction,
    PostReaction,
    ReactionType,
    subscribeToPostReactions,
} from '../firebase/postInteractions';

interface ReactionCounts {
  like: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
  support: number;
}

interface UsePostReactionsReturn {
  reactions: ReactionCounts;
  reactionUsers: PostReaction[];
  userReaction: ReactionType | null;
  loading: boolean;
  error: string | null;
  addReaction: (type: ReactionType) => Promise<void>;
}

export const usePostReactions = (
  postId: string,
  userId: string | undefined,
  userName: string | undefined,
  userAvatar: string | undefined
): UsePostReactionsReturn => {
  const [reactions, setReactions] = useState<ReactionCounts>({
    like: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    support: 0,
  });
  const [reactionUsers, setReactionUsers] = useState<PostReaction[]>([]);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (!postId) return;

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load reaction counts
        const counts = await getPostReactionCounts(postId);
        setReactions(counts);

        // Load user's reaction if logged in
        if (userId) {
          const userReactionType = await getUserReaction(postId, userId);
          setUserReaction(userReactionType);
        }

        // Load all reactions for the modal
        const allReactions = await getPostReactions(postId);
        setReactionUsers(allReactions);
      } catch (err) {
        console.error('Error loading reaction data:', err);
        setError('Failed to load reactions');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [postId, userId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!postId) return;

    const unsubscribe = subscribeToPostReactions(postId, (updatedReactions) => {
      setReactionUsers(updatedReactions);

      // Calculate reaction counts from the reactions
      const counts: ReactionCounts = {
        like: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0,
        support: 0,
      };

      updatedReactions.forEach((reaction) => {
        counts[reaction.reactionType]++;
      });

      setReactions(counts);

      // Update user's current reaction
      if (userId) {
        const userCurrentReaction = updatedReactions.find(r => r.userId === userId);
        setUserReaction(userCurrentReaction ? userCurrentReaction.reactionType : null);
      }
    });

    return () => unsubscribe();
  }, [postId, userId]);

  const addReaction = async (type: ReactionType) => {
    if (!userId || !userName || !userAvatar) {
      setError('You must be logged in to react');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await addPostReaction(postId, userId, userName, userAvatar, type);
      setUserReaction(result);
    } catch (err) {
      console.error('Error adding reaction:', err);
      setError('Failed to add reaction');
    } finally {
      setLoading(false);
    }
  };

  return {
    reactions,
    reactionUsers,
    userReaction,
    loading,
    error,
    addReaction,
  };
};