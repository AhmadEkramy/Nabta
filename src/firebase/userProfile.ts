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

// Get user by username or generated username from name
export const getUserByUsername = async (username: string): Promise<string | null> => {
  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    // First, try to find by username field
    const usernameQuery = query(
      collection(db, 'users'),
      where('username', '==', normalizedUsername),
      limit(1)
    );
    const usernameSnapshot = await getDocs(usernameQuery);
    
    // Make sure the result has a valid username
    if (!usernameSnapshot.empty) {
      const userData = usernameSnapshot.docs[0].data();
      if (userData.username && userData.username.trim().length > 0) {
        return usernameSnapshot.docs[0].id;
      }
    }
    
    // If not found by username field, try to find by converting display name to username format
    // This is for backward compatibility with old users who don't have username set
    const allUsersQuery = query(collection(db, 'users'), limit(100)); // Limit to prevent performance issues
    const allUsersSnapshot = await getDocs(allUsersQuery);
    
    for (const doc of allUsersSnapshot.docs) {
      const userData = doc.data();
      // Only check users without explicit username
      if (!userData.username || userData.username.trim().length === 0) {
        const generatedUsername = userData.name?.toLowerCase().replace(/\s+/g, '_');
        if (generatedUsername === normalizedUsername) {
          return doc.id;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

// Get user by display name (fallback)
export const getUserByDisplayName = async (displayName: string): Promise<string | null> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('name', '==', displayName),
      limit(1)
    );
    const querySnapshot = await getDocs(usersQuery);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by display name:', error);
    return null;
  }
};

// Check if username is available
export const checkUsernameAvailability = async (username: string, currentUserId?: string): Promise<boolean> => {
  try {
    // Normalize username: lowercase and remove spaces
    const normalizedUsername = username.toLowerCase().trim();
    
    console.log('🔍 Checking username availability for:', normalizedUsername);
    
    // Username validation
    if (normalizedUsername.length < 3) {
      console.log('❌ Username too short');
      return false; // Too short
    }
    
    if (normalizedUsername.length > 30) {
      console.log('❌ Username too long');
      return false; // Too long
    }
    
    // Check valid characters (letters, numbers, underscore, dot)
    const usernameRegex = /^[a-z0-9_.]+$/;
    if (!usernameRegex.test(normalizedUsername)) {
      console.log('❌ Username has invalid characters');
      return false; // Invalid characters
    }
    
    // Query Firestore for existing username
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', normalizedUsername)
    );
    const querySnapshot = await getDocs(usersQuery);
    
    console.log(`📊 Found ${querySnapshot.size} documents with query`);
    
    // Filter out results where username is actually null, undefined, or empty
    const validResults = querySnapshot.docs.filter(doc => {
      const userData = doc.data();
      const hasValidUsername = userData.username && userData.username.trim().length > 0;
      console.log(`  - Doc ${doc.id}: username="${userData.username}", valid=${hasValidUsername}`);
      return hasValidUsername;
    });
    
    console.log(`✅ Valid results after filtering: ${validResults.length}`);
    
    // If no valid results, username is available
    if (validResults.length === 0) {
      console.log('✅ Username is available!');
      return true;
    }
    
    // If current user is checking their own username, it's available
    if (currentUserId && validResults.length === 1) {
      const existingUser = validResults[0];
      if (existingUser.id === currentUserId) {
        console.log('✅ Username belongs to current user, available');
        return true;
      }
    }
    
    console.log('❌ Username is taken');
    return false; // Username already taken
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

// Update username with validation
export const updateUsername = async (userId: string, newUsername: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Normalize username
    const normalizedUsername = newUsername.toLowerCase().trim();
    
    // Check if username is available
    const isAvailable = await checkUsernameAvailability(normalizedUsername, userId);
    
    if (!isAvailable) {
      if (normalizedUsername.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters long' };
      }
      if (normalizedUsername.length > 30) {
        return { success: false, error: 'Username must be less than 30 characters' };
      }
      const usernameRegex = /^[a-z0-9_.]+$/;
      if (!usernameRegex.test(normalizedUsername)) {
        return { success: false, error: 'Username can only contain letters, numbers, underscore, and dot' };
      }
      return { success: false, error: 'Username is already taken' };
    }
    
    // Update username in user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { username: normalizedUsername });
    
    console.log('✅ Username updated successfully:', normalizedUsername);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating username:', error);
    return { success: false, error: 'Failed to update username' };
  }
};

// Update user profile information
export const updateUserProfile = async (userId: string, updates: Partial<{
  name: string;
  avatar: string;
  bio: string;
  coverImage: string;
  username: string;
}>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update user name across all posts and comments
export const updateUserNameEverywhere = async (userId: string, newName: string) => {
  try {
    console.log('🔄 Starting to update user name everywhere:', { userId, newName });
    
    // 1. Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { name: newName });
    console.log('✅ Updated user document');

    // 2. Update all user's posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId)
    );
    const postsSnapshot = await getDocs(postsQuery);
    console.log(`📝 Found ${postsSnapshot.size} posts to update`);

    const postUpdatePromises = postsSnapshot.docs.map(postDoc => 
      updateDoc(doc(db, 'posts', postDoc.id), { userName: newName })
    );
    await Promise.all(postUpdatePromises);
    console.log('✅ Updated all posts');

    // 3. Update all shared posts
    const sharedPostsQuery = query(
      collection(db, 'sharedPosts'),
      where('sharedBy.id', '==', userId)
    );
    const sharedPostsSnapshot = await getDocs(sharedPostsQuery);
    console.log(`🔁 Found ${sharedPostsSnapshot.size} shared posts to update`);

    const sharedPostUpdatePromises = sharedPostsSnapshot.docs.map(sharedPostDoc => 
      updateDoc(doc(db, 'sharedPosts', sharedPostDoc.id), { 
        'sharedBy.name': newName 
      })
    );
    await Promise.all(sharedPostUpdatePromises);
    console.log('✅ Updated all shared posts');

    // 4. Update all comments (if you have a comments collection)
    // Uncomment if you have comments collection
    /*
    const commentsQuery = query(
      collection(db, 'comments'),
      where('userId', '==', userId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    console.log(`💬 Found ${commentsSnapshot.size} comments to update`);

    const commentUpdatePromises = commentsSnapshot.docs.map(commentDoc => 
      updateDoc(doc(db, 'comments', commentDoc.id), { userName: newName })
    );
    await Promise.all(commentUpdatePromises);
    console.log('✅ Updated all comments');
    */

    console.log('✅ Successfully updated user name everywhere');
    return {
      success: true,
      postsUpdated: postsSnapshot.size,
      sharedPostsUpdated: sharedPostsSnapshot.size
    };
  } catch (error) {
    console.error('❌ Error updating user name everywhere:', error);
    throw error;
  }
};

// Get fresh user profile data from Firestore
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Ensure readVersesCount is a number for display
      let readVersesCount = 0;
      if (typeof userData.readVersesCount === 'number') {
        readVersesCount = userData.readVersesCount;
      } else if (Array.isArray(userData.readVerses)) {
        readVersesCount = userData.readVerses.length;
      } else if (typeof userData.readVerses === 'number') {
        readVersesCount = userData.readVerses;
      }
      
      return { 
        id: userDoc.id, 
        ...userData,
        readVersesCount, // Ensure this is always a number
        readVerses: readVersesCount // For compatibility
      } as User;
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