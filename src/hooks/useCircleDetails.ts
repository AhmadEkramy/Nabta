import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Circle } from '../types';
import { useCircle } from './useCircle';
import { useCircleMembers } from './useCircleMembers';
import { useCirclePosts } from './useCirclePosts';
import { useAuth } from '../contexts/AuthContext';

export const useCircleDetails = (circleId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeCircle: circle, setActiveCircle } = useCircle();
  const { 
    members,
    joinCircle,
    leaveCircle
  } = useCircleMembers(circleId);
  const {
    createPost,
    likePost,
    deletePost,
    creatingPost
  } = useCirclePosts(circleId);

  const { user } = useAuth();

  useEffect(() => {
    if (!circleId) {
      setActiveCircle(null);
      return;
    }

    console.log('Fetching circle with ID:', circleId); // Debugging line

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      doc(db, 'circles', circleId),
      (doc) => {
        console.log('Circle data:', doc.exists() ? doc.data() : 'Not found'); // Debugging line

        if (doc.exists()) {
          const data = doc.data();
          setActiveCircle({ 
            id: doc.id, 
            ...data,
            isJoined: members.some(m => m.userId === user?.uid)
          } as Circle);
          setLoading(false);
          setError(null);
        } else {
          console.error('Circle not found with ID:', circleId); // Debugging line
          setError('Circle not found');
          setActiveCircle(null);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching circle:', error, 'Circle ID:', circleId); // Debugging line
        setError(error.message);
        setLoading(false);
        setActiveCircle(null);
      }
    );

    return () => {
      unsubscribe();
      setActiveCircle(null);
    };
  }, [circleId, members, setActiveCircle, user?.uid]);

  return {
    circle,
    members,
    loading,
    error,
    joinCircle,
    leaveCircle,
    createPost,
    likePost,
    deletePost,
    creatingPost
  };
};
