import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getCirclesWithMembership, joinCircle, leaveCircle } from '../firebase/circles';
import { Circle } from '../types';

// Hook for managing circles data and operations
export const useCircles = () => {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningCircle, setJoiningCircle] = useState<string | null>(null);

  // Fetch circles with user membership status
  const fetchCircles = async () => {
    if (!user?.id) {
      setCircles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const circlesData = await getCirclesWithMembership(user.id);
      setCircles(circlesData);
    } catch (err) {
      console.error('Error fetching circles:', err);
      setError('Failed to load circles');
      toast.error('Failed to load circles');
    } finally {
      setLoading(false);
    }
  };

  // Join a circle
  const handleJoinCircle = async (circleId: string) => {
    if (!user?.id || joiningCircle) return;

    try {
      setJoiningCircle(circleId);
      await joinCircle(circleId, user.id);
      
      // Update local state
      setCircles(prevCircles =>
        prevCircles.map(circle =>
          circle.id === circleId
            ? { ...circle, isJoined: true, members: circle.members + 1 }
            : circle
        )
      );
      
      toast.success('Successfully joined the circle!');
    } catch (error) {
      console.error('Error joining circle:', error);
      toast.error('Failed to join circle');
    } finally {
      setJoiningCircle(null);
    }
  };

  // Leave a circle
  const handleLeaveCircle = async (circleId: string) => {
    if (!user?.id || joiningCircle) return;

    try {
      setJoiningCircle(circleId);
      await leaveCircle(circleId, user.id);
      
      // Update local state
      setCircles(prevCircles =>
        prevCircles.map(circle =>
          circle.id === circleId
            ? { ...circle, isJoined: false, members: Math.max(0, circle.members - 1) }
            : circle
        )
      );
      
      toast.success('Successfully left the circle!');
    } catch (error) {
      console.error('Error leaving circle:', error);
      toast.error('Failed to leave circle');
    } finally {
      setJoiningCircle(null);
    }
  };

  // Refresh circles data
  const refreshCircles = () => {
    fetchCircles();
  };

  useEffect(() => {
    fetchCircles();
  }, [user?.id]);

  return {
    circles,
    loading,
    error,
    joiningCircle,
    handleJoinCircle,
    handleLeaveCircle,
    refreshCircles,
  };
};
