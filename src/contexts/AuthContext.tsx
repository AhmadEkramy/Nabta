import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { auth, db, signInWithEmail, signOutUser, signUpWithEmail } from '../firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, username?: string, religion?: 'muslim' | 'christian') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to get user profile from Firestore
  const getUserProfile = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Function to create user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser, name: string, username?: string): Promise<User> => {
    const userProfile: User = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: name || firebaseUser.displayName || 'User',
      username: username, // Add username
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || '/avatar.jpeg',
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0], // Set initial active date
      isAdmin: firebaseUser.email === 'admin@growthcircles.com',
      joinedAt: new Date().toISOString(),
      circles: [],
      completedTasks: 0,
      readVerses: [],
      readVersesCount: 0,
      focusHours: 0,
      followers: 0,
      following: 0,
      followersList: [],
      followingList: [],
      bio: '',
      location: '',
      coverImage: ''
    };

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // User is signed in, try to get their profile
        const userProfile = await getUserProfile(firebaseUser.uid);
        
        if (!userProfile) {
          // If profile doesn't exist or can't be accessed, create a new one
          try {
            const newProfile = await createUserProfile(firebaseUser, firebaseUser.displayName || 'User');
            setUser(newProfile);
          } catch (error) {
            console.error('Error creating user profile:', error);
            // If we can't create profile due to permissions, create a temporary local profile
            const tempProfile: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
              xp: 0,
              level: 1,
              streak: 0,
              isAdmin: firebaseUser.email === 'admin@growthcircles.com',
              joinedAt: new Date().toISOString(),
              circles: [],
              completedTasks: 0,
              readVerses: 0,
              focusHours: 0
            };
            setUser(tempProfile);
          }
        } else {
          // Check and update streak when user logs in
          try {
            const { checkAndUpdateStreak } = await import('../firebase/userProfile');
            const streakResult = await checkAndUpdateStreak(firebaseUser.uid);
            
            // If streak was updated, refresh user profile
            if (streakResult.isNewDay) {
              const updatedProfile = await getUserProfile(firebaseUser.uid);
              if (updatedProfile) {
                setUser(updatedProfile);
                console.log('🔥 Streak updated on login:', streakResult.streak);
              } else {
                setUser(userProfile);
              }
            } else {
              setUser(userProfile);
            }
          } catch (streakError) {
            console.error('Error checking streak:', streakError);
            // Still set user profile even if streak check fails
            setUser(userProfile);
          }
        }
      } else {
        // User is signed out
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmail(email, password);
      
      // Try to get user profile, but don't fail if permissions are missing
      let userProfile = await getUserProfile(userCredential.user.uid);
      
      if (!userProfile) {
        // Try to create profile, but fallback to temp profile if it fails
        try {
          userProfile = await createUserProfile(userCredential.user, userCredential.user.displayName || 'User');
        } catch (createError) {
          console.warn('Could not create profile in Firestore, using temporary profile:', createError);
          // Create temporary local profile
          userProfile = {
            id: userCredential.user.uid,
            name: userCredential.user.displayName || 'User',
            email: userCredential.user.email || '',
            avatar: userCredential.user.photoURL || '/avatar.jpeg',
            xp: 0,
            level: 1,
            streak: 0,
            isAdmin: userCredential.user.email === 'admin@growthcircles.com',
            joinedAt: new Date().toISOString(),
            circles: [],
            completedTasks: 0,
            readVerses: 0,
            focusHours: 0
          };
        }
      }
      
      setUser(userProfile);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, username?: string, religion: 'muslim' | 'christian' = 'muslim') => {
    try {
      setLoading(true);
      const userCredential = await signUpWithEmail(email, password, name);
      
      // Try to create profile in Firestore, but fallback to temp profile if it fails
      let userProfile: User;
      try {
        userProfile = await createUserProfile(userCredential.user, name, username);
      } catch (createError) {
        console.warn('Could not create profile in Firestore, using temporary profile:', createError);
        // Create temporary local profile
        userProfile = {
          id: userCredential.user.uid,
          name: name,
          username: username,
          email: userCredential.user.email || '',
          avatar: userCredential.user.photoURL || '/avatar.jpeg',
          xp: 0,
          level: 1,
          streak: 0,
          isAdmin: userCredential.user.email === 'admin@growthcircles.com',
          joinedAt: new Date().toISOString(),
          circles: [],
          completedTasks: 0,
          readVerses: [],
          readVersesCount: 0,
          focusHours: 0,
          followers: 0,
          following: 0,
          followersList: [],
          followingList: [],
          bio: '',
          location: '',
          coverImage: ''
        };
      }
      
      // Create user settings with religion preference
      try {
        const { createUserSettings } = await import('../firebase/userSettings');
        await createUserSettings(userCredential.user.uid, {
          preferences: {
            religion: religion
          }
        });
        console.log('✅ User settings created with religion:', religion);
      } catch (settingsError) {
        console.error('Error creating user settings:', settingsError);
        // Don't throw error, continue with signup
      }
      
      setUser(userProfile);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      // Import getUserProfile here to avoid circular dependency
      const { getUserProfile } = await import('../firebase/userProfile');
      const freshProfile = await getUserProfile(firebaseUser.uid);
      if (freshProfile) {
        setUser(freshProfile);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, [firebaseUser]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, signup, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};