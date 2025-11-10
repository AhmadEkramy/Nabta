import {
    deleteDoc,
    doc,
    getDoc,
    getDocFromServer,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { db } from './config';

// User Settings Interface
export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'ar';
    religion?: 'muslim' | 'christian';
    dailyTimeLimit?: 'unlimited' | '1min' | '1hour'; // Daily time limit for site usage
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Default settings
export const defaultUserSettings: UserSettings = {
  notifications: {
    push: true,
    email: true,
  },
  preferences: {
    theme: 'system',
    language: 'en',
    religion: 'muslim', // Default to muslim
    dailyTimeLimit: 'unlimited', // Default to unlimited
  },
};

// Get user settings (with optional force server fetch)
export const getUserSettings = async (userId: string, fromServer: boolean = false): Promise<UserSettings> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    // Use getDocFromServer if we need fresh data from server
    const settingsDoc = fromServer 
      ? await getDocFromServer(settingsRef)
      : await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        ...defaultUserSettings,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as UserSettings;
    } else {
      // Create default settings if they don't exist
      await createUserSettings(userId, defaultUserSettings);
      return defaultUserSettings;
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    // Fallback to regular getDoc if getDocFromServer fails
    if (fromServer) {
      try {
        const settingsRef = doc(db, 'userSettings', userId);
        const settingsDoc = await getDoc(settingsRef);
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          return {
            ...defaultUserSettings,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as UserSettings;
        }
      } catch (fallbackError) {
        console.error('Error in fallback getDoc:', fallbackError);
      }
    }
    return defaultUserSettings;
  }
};

// Create user settings
export const createUserSettings = async (
  userId: string,
  settings: Partial<UserSettings> = {}
): Promise<void> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    const newSettings: UserSettings = {
      ...defaultUserSettings,
      ...settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(settingsRef, newSettings);
  } catch (error) {
    console.error('Error creating user settings:', error);
    throw error;
  }
};

// Update user settings
export const updateUserSettings = async (
  userId: string,
  updates: Partial<UserSettings>
): Promise<void> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    
    // Check if settings document exists
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // Create settings if they don't exist
      await createUserSettings(userId, updates);
    } else {
      // Update existing settings
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (
  userId: string,
  notifications: Partial<UserSettings['notifications']>
): Promise<void> => {
  try {
    await updateUserSettings(userId, { notifications });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};



// Update preferences
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserSettings['preferences']>
): Promise<void> => {
  try {
    await updateUserSettings(userId, { preferences });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Delete user settings
export const deleteUserSettings = async (userId: string): Promise<void> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    await deleteDoc(settingsRef);
  } catch (error) {
    console.error('Error deleting user settings:', error);
    throw error;
  }
};

// Toggle a specific setting
export const toggleUserSetting = async (
  userId: string,
  settingPath: string,
  value: boolean
): Promise<void> => {
  try {
    const currentSettings = await getUserSettings(userId);
    
    // Parse the setting path (e.g., 'notifications.push')
    const pathParts = settingPath.split('.');
    const updates: any = {};
    
    if (pathParts.length === 2) {
      const [section, setting] = pathParts;
      updates[section] = {
        ...currentSettings[section as keyof UserSettings],
        [setting]: value,
      };
    }
    
    await updateUserSettings(userId, updates);
  } catch (error) {
    console.error('Error toggling user setting:', error);
    throw error;
  }
};
