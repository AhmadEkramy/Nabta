import React, { createContext, ReactNode, useContext } from 'react';
import toast from 'react-hot-toast';
import { createLevelUpNotification, createXPNotification } from '../firebase/notifications';
import {
    incrementCompletedTasks,
    incrementReadVerses,
    updateFocusHours,
    updateUserLevel,
    updateUserStreak,
    updateUserXP
} from '../firebase/userProfile';
import { useAuth } from './AuthContext';

interface GameContextType {
  addXP: (points: number, reason: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  markVerseRead: () => Promise<void>;
  completeTask: () => Promise<void>;
  addFocusTime: (hours: number) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { user, refreshUser } = useAuth();

  const addXP = async (points: number, reason: string) => {
    if (!user) return;

    try {
      // Update XP in Firestore
      await updateUserXP(user.id, points);

      // Calculate new level
      const newXP = user.xp + points;
      const newLevel = Math.floor(newXP / 250) + 1;

      // Update level in Firestore if it changed
      if (newLevel > user.level) {
        await updateUserLevel(user.id, newLevel);
        toast.success(`🎉 Level Up! You reached Level ${newLevel}!`);

        // Create level up notification
        try {
          await createLevelUpNotification(user.id, newLevel);
        } catch (notificationError) {
          console.error('Error creating level up notification:', notificationError);
        }
      }

      toast.success(`+${points} XP - ${reason}`);

      // Create XP notification for significant XP gains (10+ points)
      if (points >= 10) {
        try {
          await createXPNotification(user.id, points, reason);
        } catch (notificationError) {
          console.error('Error creating XP notification:', notificationError);
        }
      }

      // Refresh user data from Firestore
      await refreshUser();
    } catch (error) {
      console.error('Error updating XP:', error);
      toast.error('Failed to update XP');
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      const newStreak = user.streak + 1;
      await updateUserStreak(user.id, newStreak);
      await addXP(10, 'Daily streak maintained!');
    } catch (error) {
      console.error('Error updating streak:', error);
      toast.error('Failed to update streak');
    }
  };

  const markVerseRead = async () => {
    if (!user) return;

    try {
      await incrementReadVerses(user.id);
      await addXP(5, 'Verse read');
    } catch (error) {
      console.error('Error marking verse read:', error);
      toast.error('Failed to update verse count');
    }
  };

  const completeTask = async () => {
    if (!user) return;

    try {
      await incrementCompletedTasks(user.id);
      await addXP(15, 'Task completed');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to update task count');
    }
  };

  const addFocusTime = async (hours: number) => {
    if (!user) return;

    try {
      await updateFocusHours(user.id, hours);
      await addXP(Math.floor(hours * 20), 'Focus session completed');
    } catch (error) {
      console.error('Error updating focus time:', error);
      toast.error('Failed to update focus time');
    }
  };

  return (
    <GameContext.Provider value={{ addXP, updateStreak, markVerseRead, completeTask, addFocusTime }}>
      {children}
    </GameContext.Provider>
  );
};