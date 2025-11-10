import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings } from '../firebase/userSettings';
import {
  hasExceededTimeLimit,
  initializeDailyUsage,
  updateDailyUsage
} from '../utils/timeTracking';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);
  const [checkingTimeLimit, setCheckingTimeLimit] = useState(true);

  // Check time limit and initialize tracking
  useEffect(() => {
    const checkTimeLimit = async () => {
      if (!user?.id || loading) {
        setCheckingTimeLimit(false);
        return;
      }

      try {
        // Initialize daily usage tracking
        initializeDailyUsage(user.id);

        // Get user settings to check time limit
        const settings = await getUserSettings(user.id);
        const timeLimit = settings.preferences?.dailyTimeLimit || 'unlimited';

        // Check if time limit is exceeded
        if (hasExceededTimeLimit(user.id, timeLimit)) {
          setTimeLimitExceeded(true);
        } else {
          setTimeLimitExceeded(false);
        }

        // Update usage and check limit every second for accurate tracking
        const updateInterval = setInterval(async () => {
          updateDailyUsage(user.id);
          
          // Get latest settings from server to check current time limit (in case user changed it)
          // Use fromServer=true to get fresh data, but only every 5 seconds to reduce load
          const shouldFetchFromServer = Math.random() < 0.2; // 20% chance to fetch from server
          const latestSettings = await getUserSettings(user.id, shouldFetchFromServer);
          const currentTimeLimit = latestSettings.preferences?.dailyTimeLimit || 'unlimited';
          
          // Re-check time limit every second
          if (hasExceededTimeLimit(user.id, currentTimeLimit)) {
            setTimeLimitExceeded(true);
          } else {
            setTimeLimitExceeded(false);
          }
        }, 1000); // Update every second for accurate tracking
        
        // Also update usage when page becomes visible (user comes back to tab)
        const handleVisibilityChange = async () => {
          if (!document.hidden) {
            updateDailyUsage(user.id);
            // Always fetch from server when page becomes visible to get latest settings
            const latestSettings = await getUserSettings(user.id, true);
            const currentTimeLimit = latestSettings.preferences?.dailyTimeLimit || 'unlimited';
            if (hasExceededTimeLimit(user.id, currentTimeLimit)) {
              setTimeLimitExceeded(true);
            } else {
              setTimeLimitExceeded(false);
            }
          }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Update usage when user leaves the page
        const handleBeforeUnload = () => {
          updateDailyUsage(user.id);
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);

        setCheckingTimeLimit(false);

        return () => {
          clearInterval(updateInterval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('beforeunload', handleBeforeUnload);
          // Final update when component unmounts
          updateDailyUsage(user.id);
        };
      } catch (error) {
        console.error('Error checking time limit:', error);
        setCheckingTimeLimit(false);
      }
    };

    checkTimeLimit();
  }, [user?.id, loading]);

  // Don't check time limit on the time limit exceeded page
  if (location.pathname === '/time-limit-exceeded') {
    return <>{children}</>;
  }

  if (loading || checkingTimeLimit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  // Redirect to time limit exceeded page if limit is exceeded
  if (timeLimitExceeded) {
    return <Navigate to="/time-limit-exceeded" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;