import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { GameSession } from './useGameStats';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  totalXP: number;
  totalGamesPlayed: number;
  averageScore: number;
  bestScore: number;
  weeklyXP: number;
  monthlyXP: number;
  level: number;
  rank: number;
}

export type LeaderboardPeriod = 'all-time' | 'weekly' | 'monthly';

export const useLeaderboard = (period: LeaderboardPeriod = 'weekly', limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateLevel = (xp: number): number => {
    // Level calculation: Level = floor(sqrt(XP / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const getDateRange = (period: LeaderboardPeriod) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    return startDate;
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all game sessions
      const sessionsQuery = query(collection(db, 'gameSessions'));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      const allSessions: GameSession[] = [];
      sessionsSnapshot.forEach((doc) => {
        allSessions.push({
          id: doc.id,
          ...doc.data()
        } as GameSession);
      });

      // Get all users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const users: { [key: string]: { name: string; avatar: string } } = {};
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        users[doc.id] = {
          name: userData.name || 'Anonymous User',
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`
        };
      });

      // Calculate user statistics
      const userStats: { [key: string]: LeaderboardEntry } = {};
      const startDate = getDateRange(period);

      allSessions.forEach((session) => {
        const sessionDate = new Date(session.completedAt);
        const isInPeriod = sessionDate >= startDate;
        
        if (!userStats[session.userId]) {
          userStats[session.userId] = {
            userId: session.userId,
            userName: users[session.userId]?.name || 'Anonymous User',
            userAvatar: users[session.userId]?.avatar || `https://ui-avatars.com/api/?name=User&background=random`,
            totalXP: 0,
            totalGamesPlayed: 0,
            averageScore: 0,
            bestScore: 0,
            weeklyXP: 0,
            monthlyXP: 0,
            level: 1,
            rank: 0
          };
        }

        const userStat = userStats[session.userId];
        
        // All-time stats
        userStat.totalXP += session.xpEarned;
        userStat.totalGamesPlayed += 1;
        userStat.bestScore = Math.max(userStat.bestScore, session.score);

        // Period-specific stats
        if (isInPeriod) {
          if (period === 'weekly') {
            userStat.weeklyXP += session.xpEarned;
          } else if (period === 'monthly') {
            userStat.monthlyXP += session.xpEarned;
          }
        }
      });

      // Calculate average scores and levels
      Object.values(userStats).forEach((userStat) => {
        const userSessions = allSessions.filter(s => s.userId === userStat.userId);
        userStat.averageScore = userSessions.length > 0 
          ? Math.round(userSessions.reduce((sum, s) => sum + s.score, 0) / userSessions.length)
          : 0;
        userStat.level = calculateLevel(userStat.totalXP);
      });

      // Sort by the appropriate metric based on period
      let sortedUsers = Object.values(userStats);
      
      switch (period) {
        case 'weekly':
          sortedUsers = sortedUsers.sort((a, b) => b.weeklyXP - a.weeklyXP);
          break;
        case 'monthly':
          sortedUsers = sortedUsers.sort((a, b) => b.monthlyXP - a.monthlyXP);
          break;
        default:
          sortedUsers = sortedUsers.sort((a, b) => b.totalXP - a.totalXP);
      }

      // Assign ranks and limit results
      const rankedUsers = sortedUsers
        .slice(0, limit)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      setLeaderboard(rankedUsers);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
      
      // Fallback to mock data if there's an error
      const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
        userId: `mock-${index}`,
        userName: `Player ${index + 1}`,
        userAvatar: `https://ui-avatars.com/api/?name=Player${index + 1}&background=random`,
        totalXP: 1000 - index * 150,
        totalGamesPlayed: 25 - index * 3,
        averageScore: 850 - index * 50,
        bestScore: 1200 - index * 100,
        weeklyXP: 200 - index * 25,
        monthlyXP: 800 - index * 100,
        level: calculateLevel(1000 - index * 150),
        rank: index + 1
      }));
      
      setLeaderboard(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = () => {
    loadLeaderboard();
  };

  const getXPForPeriod = (entry: LeaderboardEntry): number => {
    switch (period) {
      case 'weekly':
        return entry.weeklyXP;
      case 'monthly':
        return entry.monthlyXP;
      default:
        return entry.totalXP;
    }
  };

  const getPeriodLabel = (language: string): string => {
    switch (period) {
      case 'weekly':
        return language === 'ar' ? 'هذا الأسبوع' : 'This week';
      case 'monthly':
        return language === 'ar' ? 'هذا الشهر' : 'This month';
      default:
        return language === 'ar' ? 'كل الأوقات' : 'All time';
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [period, limit]);

  return {
    leaderboard,
    loading,
    error,
    refreshLeaderboard,
    getXPForPeriod,
    getPeriodLabel
  };
};
