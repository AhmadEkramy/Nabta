import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { CirclePost } from '../types';

export const useCirclePosts = (circleId: string) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [likingPost, setLikingPost] = useState<string | null>(null);

  useEffect(() => {
    if (!circleId) return;

    setLoading(true);
    const q = query(
      collection(db, 'posts'),
      where('circleId', '==', circleId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as CirclePost[];
        setPosts(postsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [circleId]);

  const createPost = async (content: string): Promise<boolean> => {
    if (!user || !content.trim()) return false;

    try {
      setCreatingPost(true);

      if (!user.id) {
        console.error('User ID not found');
        return false;
      }

      const newPost: Omit<CirclePost, 'id'> = {
        circleId,
        authorId: user.id,
        authorName: user.name || 'Anonymous',
        authorAvatar: user.avatar || '/default-avatar.png',
        content: content.trim(),
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },  // For optimistic update
        likes: 0,
        comments: 0,
        likedBy: {}
      };

      // Optimistically add the post
      const tempId = Date.now().toString();
      setPosts(prev => [{...newPost, id: tempId}, ...prev]);

      try {
        await addDoc(collection(db, 'posts'), {
          ...newPost,
          createdAt: serverTimestamp()  // Use server timestamp for actual update
        });

        // Update circle post count
        await updateDoc(doc(db, 'circles', circleId), {
          posts: increment(1)
        });

        return true;
      } catch (error) {
        // Revert optimistic update on error
        setPosts(prev => prev.filter(p => p.id !== tempId));
        throw error;
      }
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    } finally {
      setCreatingPost(false);
    }
  };

  const likePost = async (postId: string, isLiked: boolean): Promise<boolean> => {
    if (!user || !user.id) return false;

    try {
      setLikingPost(postId);

      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes + (isLiked ? -1 : 1),
            likedBy: {
              ...post.likedBy,
              [user.id]: isLiked ? false : true
            }
          };
        }
        return post;
      }));

      const postRef = doc(db, 'posts', postId);
      const update: { 
        likes: unknown; 
        likedBy: Record<string, boolean | typeof deleteDoc>;
      } = {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked
          ? { [user.id]: deleteDoc }
          : { [user.id]: true }
      };

      await updateDoc(postRef, update);
      return true;
    } catch (error) {
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes + (isLiked ? 1 : -1),
            likedBy: {
              ...post.likedBy,
              [user.id]: isLiked
            }
          };
        }
        return post;
      }));
      console.error('Error liking post:', error);
      return false;
    } finally {
      setLikingPost(null);
    }
  };

  const deletePost = async (post: CirclePost): Promise<boolean> => {
    if (!user || !user.id || user.id !== post.authorId) return false;

    try {
      // Optimistic update
      setPosts(prev => prev.filter(p => p.id !== post.id));

      try {
        await deleteDoc(doc(db, 'posts', post.id));
        await updateDoc(doc(db, 'circles', circleId), {
          posts: increment(-1)
        });
        return true;
      } catch (error) {
        // Revert optimistic update on error
        setPosts(prev => [...prev, post]);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    creatingPost,
    likePost,
    likingPost,
    deletePost
  };
};
