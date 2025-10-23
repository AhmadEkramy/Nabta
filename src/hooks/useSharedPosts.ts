import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { Post } from '../types';

export const useSharedPosts = (userId: string) => {
  const [sharedPosts, setSharedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSharedPosts = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // Query shared posts collection
      const sharedPostsQuery = query(
        collection(db, 'sharedPosts'),
        where('userId', '==', userId),
        orderBy('sharedAt', 'desc'),
        limit(20)
      );

      const sharedPostsSnapshot = await getDocs(sharedPostsQuery);
      
      // Get the actual posts using Promise.all
      const sharedPostsWithData = await Promise.all(
        sharedPostsSnapshot.docs.map(async (sharedDoc) => {
          const sharedData = sharedDoc.data();
          const postId = sharedData.postId;
          
          // Get the actual post document
          const postDoc = await getDoc(doc(db, 'posts', postId));
          
          if (!postDoc.exists()) return null;
          
          const postData = postDoc.data();
          return {
            ...postData,
            id: postDoc.id,
            sharedAt: sharedData.sharedAt?.toDate?.()?.toISOString() || sharedData.sharedAt,
          } as Post;
        })
      );

      // Filter out any null values (posts that weren't found)
      setSharedPosts(sharedPostsWithData.filter((post): post is Post => post !== null));
      setError(null);
    } catch (err) {
      console.error('Error fetching shared posts:', err);
      setError(err instanceof Error ? err.message : 'Error fetching shared posts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSharedPosts();
  }, [fetchSharedPosts]);

  return { sharedPosts, loading, error, refreshSharedPosts: fetchSharedPosts };
};