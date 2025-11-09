import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { FocusSession } from '../types';
import { db } from './config';

// Create a new focus session
export const createFocusSession = async (userId: string, sessionData: Omit<FocusSession, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'focusSessions'), {
      ...sessionData,
      userId,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error;
  }
};

// Update a focus session
export const updateFocusSession = async (sessionId: string, data: Partial<FocusSession>) => {
  try {
    const sessionRef = doc(db, 'focusSessions', sessionId);
    // Remove undefined values to satisfy Firestore constraints
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    await updateDoc(sessionRef, {
      ...cleaned,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating focus session:', error);
    throw error;
  }
};

// Complete a focus session
export const completeFocusSession = async (sessionId: string, totalSeconds: number, status: 'completed' | 'stopped') => {
  try {
    const sessionRef = doc(db, 'focusSessions', sessionId);
    await updateDoc(sessionRef, {
      status,
      totalSeconds,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error completing focus session:', error);
    throw error;
  }
};

// Get user's focus sessions
export const getUserFocusSessions = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'focusSessions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const sessions: FocusSession[] = [];
    
    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...(doc.data() as Omit<FocusSession, 'id'>),
      });
    });
    
    return sessions;
  } catch (error) {
    console.error('Error getting user focus sessions:', error);
    throw error;
  }
};

// Get active or paused session for a user
export const getActiveFocusSession = async (userId: string): Promise<FocusSession | null> => {
  try {
    const q = query(
      collection(db, 'focusSessions'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'paused'])
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Get the most recent active/paused session
    const sessions: FocusSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...(doc.data() as Omit<FocusSession, 'id'>),
      });
    });
    
    // Sort by createdAt and return the most recent one
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sessions[0] || null;
  } catch (error) {
    console.error('Error getting active focus session:', error);
    return null;
  }
};

// Delete a focus session (only by session owner)
export const deleteFocusSession = async (sessionId: string, userId: string) => {
  try {
    const sessionRef = doc(db, 'focusSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error('Focus session not found');
    }

    const sessionData = sessionDoc.data();

    // Check if user can delete (only session owner)
    if (sessionData.userId !== userId) {
      throw new Error('Not authorized to delete this focus session');
    }

    // Delete the session document
    await deleteDoc(sessionRef);

    return true;
  } catch (error) {
    console.error('Error deleting focus session:', error);
    throw error;
  }
};

// Get user's focus statistics
export const getUserFocusStats = async (userId: string) => {
  try {
    const sessions = await getUserFocusSessions(userId);

    // Filter completed sessions
    const completedSessions = sessions.filter(session => session.status === 'completed');

    // Calculate total focus hours
    const totalSeconds = completedSessions.reduce((total, session) => total + session.totalSeconds, 0);
    const totalHours = totalSeconds / 3600;

    // Calculate sessions this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const sessionsThisWeek = completedSessions.filter(session => {
      const sessionDate = new Date(session.completedAt || session.createdAt);
      return sessionDate >= startOfWeek;
    });

    // Calculate consecutive days
    const sessionDays = completedSessions.map(session => {
      const date = new Date(session.completedAt || session.createdAt);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    });

    const uniqueDays = [...new Set(sessionDays)].sort();
    let consecutiveDays = 0;
    
    if (uniqueDays.length > 0) {
      // Check if the last day is today
      const today = new Date();
      const todayString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const lastDay = uniqueDays[uniqueDays.length - 1];
      
      if (lastDay === todayString) {
        consecutiveDays = 1;
        
        // Count backwards from yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        for (let i = 1; i <= 30; i++) { // Check up to 30 days back
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const checkDateString = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
          
          if (uniqueDays.includes(checkDateString)) {
            consecutiveDays++;
          } else {
            break;
          }
        }
      }
    }
    
    return {
      totalHours: parseFloat(totalHours.toFixed(1)),
      sessionsThisWeek: sessionsThisWeek.length,
      consecutiveDays,
    };
  } catch (error) {
    console.error('Error getting user focus stats:', error);
    return {
      totalHours: 0,
      sessionsThisWeek: 0,
      consecutiveDays: 0,
    };
  }
};