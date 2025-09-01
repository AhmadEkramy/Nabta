import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { User } from '../types';
import { db } from './config';
import { createFollowNotification } from './notifications';

// Update user XP and level
export const updateUserXP = async (userId: string, xpGained: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      xp: increment(xpGained),
    });
  } catch (error) {
    console.error('Error updating user XP:', error);
    throw error;
  }
};

// Update user level
export const updateUserLevel = async (userId: string, newLevel: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      level: newLevel,
    });
  } catch (error) {
    console.error('Error updating user level:', error);
    throw error;
  }
};

// Update user streak
export const updateUserStreak = async (userId: string, newStreak: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      streak: newStreak,
    });
  } catch (error) {
    console.error('Error updating user streak:', error);
    throw error;
  }
};

// Increment completed tasks
export const incrementCompletedTasks = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      completedTasks: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing completed tasks:', error);
    throw error;
  }
};

// Increment read verses
export const incrementReadVerses = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      readVersesCount: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing read verses:', error);
    throw error;
  }
};

// Update focus hours
export const updateFocusHours = async (userId: string, hoursToAdd: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      focusHours: increment(hoursToAdd),
    });
  } catch (error) {
    console.error('Error updating focus hours:', error);
    throw error;
  }
};

// Update user profile information
export const updateUserProfile = async (userId: string, updates: Partial<{
  name: string;
  avatar: string;
  bio: string;
}>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get fresh user profile data from Firestore
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Get user's posts
export const getUserPosts = async (userId: string) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const postsSnapshot = await getDocs(postsQuery);
    const posts = [];

    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    });

    return posts;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
};

// Follow/Unfollow user functions
export const followUser = async (
  currentUserId: string,
  targetUserId: string,
  currentUserInfo?: { name: string; avatar: string }
) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    // Add targetUserId to current user's following list
    await updateDoc(currentUserRef, {
      following: increment(1),
      followingList: arrayUnion(targetUserId),
    });

    // Add currentUserId to target user's followers list
    await updateDoc(targetUserRef, {
      followers: increment(1),
      followersList: arrayUnion(currentUserId),
    });

    // Create follow notification
    if (currentUserInfo) {
      try {
        await createFollowNotification(
          currentUserId,
          currentUserInfo.name,
          currentUserInfo.avatar,
          targetUserId
        );
      } catch (notificationError) {
        console.error('Error creating follow notification:', notificationError);
        // Don't throw - follow should still work even if notification fails
      }
    }
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    // Remove targetUserId from current user's following list
    await updateDoc(currentUserRef, {
      following: increment(-1),
      followingList: arrayRemove(targetUserId),
    });

    // Remove currentUserId from target user's followers list
    await updateDoc(targetUserRef, {
      followers: increment(-1),
      followersList: arrayRemove(currentUserId),
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const isFollowingUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
    if (currentUserDoc.exists()) {
      const userData = currentUserDoc.data();
      return userData.followingList?.includes(targetUserId) || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Get user achievements based on their stats
export const getUserAchievements = async (userId: string) => {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return [];

    const achievements = [
      {
        id: 1,
        name: { ar: 'المبتدئ', en: 'Beginner' },
        description: { ar: 'أكمل أول مهمة', en: 'Complete your first task' },
        icon: '🎯',
        earned: userProfile.completedTasks >= 1,
        requirement: 1,
        current: userProfile.completedTasks,
        type: 'tasks'
      },
      {
        id: 2,
        name: { ar: 'قارئ القرآن', en: 'Quran Reader' },
        description: { ar: 'اقرأ 50 آية', en: 'Read 50 verses' },
        icon: '📖',
        earned: (userProfile.readVersesCount || (Array.isArray(userProfile.readVerses) ? userProfile.readVerses.length : 0)) >= 50,
        requirement: 50,
        current: userProfile.readVersesCount || (Array.isArray(userProfile.readVerses) ? userProfile.readVerses.length : 0),
        type: 'verses'
      },
      {
        id: 3,
        name: { ar: 'المركز', en: 'Focused' },
        description: { ar: 'أكمل 10 ساعات تركيز', en: 'Complete 10 hours of focus' },
        icon: '🎯',
        earned: userProfile.focusHours >= 10,
        requirement: 10,
        current: userProfile.focusHours,
        type: 'focus'
      },
      {
        id: 4,
        name: { ar: 'الاجتماعي', en: 'Social' },
        description: { ar: 'انضم لـ 5 دوائر نمو', en: 'Join 5 growth circles' },
        icon: '👥',
        earned: userProfile.circles.length >= 5,
        requirement: 5,
        current: userProfile.circles.length,
        type: 'circles'
      },
      {
        id: 5,
        name: { ar: 'المثابر', en: 'Persistent' },
        description: { ar: 'حافظ على سلسلة 7 أيام', en: 'Maintain a 7-day streak' },
        icon: '🔥',
        earned: userProfile.streak >= 7,
        requirement: 7,
        current: userProfile.streak,
        type: 'streak'
      },
      {
        id: 6,
        name: { ar: 'الخبير', en: 'Expert' },
        description: { ar: 'وصل للمستوى 10', en: 'Reach level 10' },
        icon: '⭐',
        earned: userProfile.level >= 10,
        requirement: 10,
        current: userProfile.level,
        type: 'level'
      }
    ];

    return achievements;
  } catch (error) {
    console.error('Error calculating user achievements:', error);
    return [];
  }
};