import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';

export interface GameSession {
  id?: string;
  userId: string;
  gameId: string;
  gameName: string;
  score: number;
  xpEarned: number;
  duration: number; // in seconds
  difficulty: string;
  category: string;
  completedAt: string;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalXpEarned: number;
  totalPlayTime: number; // in seconds
  bestScore: number;
  favoriteCategory: string;
  averageScore: number;
  gamesPlayedToday: number;
  currentStreak: number;
}

export const useGameStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats>({
    totalGamesPlayed: 0,
    totalXpEarned: 0,
    totalPlayTime: 0,
    bestScore: 0,
    favoriteCategory: 'memory',
    averageScore: 0,
    gamesPlayedToday: 0,
    currentStreak: 0
  });
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGameStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch all game sessions for the user
      const q = query(
        collection(db, 'gameSessions'),
        where('userId', '==', user.id)
      );
      
      const querySnapshot = await getDocs(q);
      const userSessions: GameSession[] = [];
      
      querySnapshot.forEach((doc) => {
        userSessions.push({
          id: doc.id,
          ...doc.data()
        } as GameSession);
      });

      setSessions(userSessions);
      calculateStats(userSessions);
    } catch (error) {
      console.error('Error loading game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessions: GameSession[]) => {
    if (sessions.length === 0) {
      setStats({
        totalGamesPlayed: 0,
        totalXpEarned: 0,
        totalPlayTime: 0,
        bestScore: 0,
        favoriteCategory: 'memory',
        averageScore: 0,
        gamesPlayedToday: 0,
        currentStreak: 0
      });
      return;
    }

    // Calculate basic stats
    const totalGamesPlayed = sessions.length;
    const totalXpEarned = sessions.reduce((sum, session) => sum + session.xpEarned, 0);
    const totalPlayTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const bestScore = Math.max(...sessions.map(session => session.score));
    const averageScore = sessions.reduce((sum, session) => sum + session.score, 0) / totalGamesPlayed;

    // Find favorite category
    const categoryCount: { [key: string]: number } = {};
    sessions.forEach(session => {
      categoryCount[session.category] = (categoryCount[session.category] || 0) + 1;
    });
    const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, 'memory'
    );

    // Calculate games played today
    const today = new Date().toDateString();
    const gamesPlayedToday = sessions.filter(session => 
      new Date(session.completedAt).toDateString() === today
    ).length;

    // Calculate current streak (consecutive days with at least one game)
    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    
    let currentStreak = 0;
    const uniqueDays = new Set<string>();
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt).toDateString();
      uniqueDays.add(sessionDate);
    }
    
    const sortedDays = Array.from(uniqueDays).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let currentDate = new Date();
    for (const day of sortedDays) {
      const dayDate = new Date(day);
      const diffTime = currentDate.getTime() - dayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1 || (currentStreak === 0 && diffDays <= 1)) {
        currentStreak++;
        currentDate = dayDate;
      } else {
        break;
      }
    }

    setStats({
      totalGamesPlayed,
      totalXpEarned,
      totalPlayTime,
      bestScore,
      favoriteCategory,
      averageScore: Math.round(averageScore),
      gamesPlayedToday,
      currentStreak
    });
  };

  const recordGameSession = async (sessionData: Omit<GameSession, 'id' | 'userId' | 'completedAt'>) => {
    if (!user) return;

    try {
      const gameSession: Omit<GameSession, 'id'> = {
        ...sessionData,
        userId: user.id,
        completedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'gameSessions'), gameSession);
      
      const newSession: GameSession = {
        id: docRef.id,
        ...gameSession
      };

      setSessions(prev => [...prev, newSession]);
      calculateStats([...sessions, newSession]);
      
      return newSession;
    } catch (error) {
      console.error('Error recording game session:', error);
      throw error;
    }
  };

  const getSessionsByCategory = (category: string) => {
    return sessions.filter(session => session.category === category);
  };

  const getSessionsByGame = (gameId: string) => {
    return sessions.filter(session => session.gameId === gameId);
  };

  const getBestScoreForGame = (gameId: string) => {
    const gameSessions = getSessionsByGame(gameId);
    return gameSessions.length > 0 ? Math.max(...gameSessions.map(s => s.score)) : 0;
  };

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    if (user) {
      loadGameStats();
    }
  }, [user]);

  return {
    stats,
    sessions,
    loading,
    recordGameSession,
    getSessionsByCategory,
    getSessionsByGame,
    getBestScoreForGame,
    formatPlayTime,
    loadGameStats
  };
};
