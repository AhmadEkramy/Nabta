import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { Circle, Post } from '../types';
import { db } from './config';

// Get posts for home feed (from user's circles + public posts)
interface Activity {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  timestamp: string;
  icon: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  timestamp: string;
  icon: string;
}

interface Story {
  id: string;
  userId?: string;
  content?: string;
  createdAt: string;
  viewedBy?: string[];
  isViewed: boolean;
  [key: string]: any;
}

interface CurrentPosition {
  currentVerseIndex: number;
  currentSurah: number;
  currentSurahName: string;
  lastReadAt: Date;
}

export const getHomeFeedPosts = async (_userId: string, userCircles: string[] = []): Promise<Post[]> => {
  try {
    const posts: Post[] = [];
    
    // Get ALL posts first, then filter them
    const allPostsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50) // Get more posts to ensure we have enough after filtering
    );
    const allPostsSnapshot = await getDocs(allPostsQuery);
    
    console.log('Total posts found in database:', allPostsSnapshot.size);
    
    allPostsSnapshot.forEach((doc) => {
      const data = doc.data();
      const likedBy = data.likedBy && typeof data.likedBy === 'object' 
        ? Object.entries(data.likedBy).filter(([, value]) => value).map(([key]) => key) 
        : Array.isArray(data.likedBy) ? data.likedBy : [];

      const post: Post = {
        id: doc.id,
        userId: data.userId || data.authorId,
        userName: data.userName || data.authorName,
        userAvatar: data.userAvatar || data.authorAvatar,
        content: data.content,
        circleId: data.circleId,
        circleName: data.circleName,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        likedBy: likedBy
      };
      
      // Include post if:
      // 1. It's a public post (no circleId field or circleId is null/undefined)
      // 2. It's from one of the user's circles
      const isPublicPost = !data.circleId;
      const isFromUserCircle = data.circleId && userCircles.includes(data.circleId);
      
      console.log('Post:', doc.id, 'circleId:', data.circleId, 'isPublic:', isPublicPost, 'isFromUserCircle:', isFromUserCircle);
      
      if (isPublicPost || isFromUserCircle) {
        posts.push(post);
      }
    });
    
    console.log('Filtered posts for feed:', posts.length);
    
    // Sort by date and limit results
    return posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 20);
    
  } catch (error) {
    console.error('Error fetching home feed posts:', error);
    return [];
  }
};

// Get user's circles with details
export const getUserCircles = async (circleIds: string[]): Promise<Circle[]> => {
  try {
    if (circleIds.length === 0) return [];
    
    const circles: Circle[] = [];
    
    // Fetch circles in batches (Firestore 'in' query limit is 10)
    const batchSize = 10;
    for (let i = 0; i < circleIds.length; i += batchSize) {
      const batch = circleIds.slice(i, i + batchSize);
      const circlesQuery = query(
        collection(db, 'circles'),
        where('__name__', 'in', batch.map(id => doc(db, 'circles', id)))
      );
      
      const circlesSnapshot = await getDocs(circlesQuery);
      circlesSnapshot.forEach((doc) => {
        circles.push({
          id: doc.id,
          ...doc.data(),
        } as Circle);
      });
    }
    
    return circles;
  } catch (error) {
    console.error('Error fetching user circles:', error);
    return [];
  }
};

// Get recent activity for user
export const getUserRecentActivity = async (userId: string) => {
  try {
    const activities: Activity[] = [];
    
    // Get recent posts
    const recentPostsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentPostsSnapshot = await getDocs(recentPostsQuery);
    
    recentPostsSnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'post',
        title: 'Created a post',
        titleAr: 'أنشأ منشوراً',
        timestamp: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        icon: 'post',
      });
    });
    
    // Get recent completed tasks (if you have a tasks collection)
    // This is a placeholder - adjust based on your task system
    const recentTasksQuery = query(
      collection(db, 'userTasks'),
      where('userId', '==', userId),
      where('completed', '==', true),
      orderBy('completedAt', 'desc'),
      limit(5)
    );
    
    try {
      const recentTasksSnapshot = await getDocs(recentTasksQuery);
      recentTasksSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'task',
          title: 'Completed a task',
          titleAr: 'أكمل مهمة',
          timestamp: data.completedAt?.toDate?.()?.toISOString() || data.completedAt,
          icon: 'task',
        });
      });
    } catch (error) {
      // Tasks collection might not exist yet
      console.log('Tasks collection not found, skipping task activities');
    }
    
    // Sort all activities by timestamp
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
    
  } catch (error) {
    console.error('Error fetching user recent activity:', error);
    return [];
  }
};

// Get daily Quran verse based on user's current reading position
export const getDailyQuranVerse = async (userId?: string) => {
  try {
    console.log('🔄 Getting daily verse for user:', userId);

    if (!userId) {
      console.log('⚠️ No user ID provided, returning random verse');
      return await getFallbackRandomVerse();
    }

    // Get today's date as a string
    const today = new Date().toISOString().split('T')[0];

    // Get user's current reading position and daily verse status
    const { getCurrentReadingPosition, getAllQuranVerses } = await import('./quran');
    const [currentPosition, allVerses] = await Promise.all([
      getCurrentReadingPosition(userId),
      getAllQuranVerses()
    ]);

    if (!currentPosition || allVerses.length === 0) {
      console.log('⚠️ No reading position or verses found, returning fallback');
      return await getFallbackRandomVerse();
    }

    console.log('📍 User current position:', {
      verseIndex: currentPosition.currentVerseIndex,
      surah: currentPosition.currentSurah,
      surahName: currentPosition.currentSurahName,
      lastReadAt: currentPosition.lastReadAt
    });

    // Check if user has a daily verse record for today
    const dailyVerseDoc = await getDoc(doc(db, 'userDailyVerses', `${userId}_${today}`));

    if (dailyVerseDoc.exists()) {
      const dailyVerseData = dailyVerseDoc.data();
      console.log('📅 Found existing daily verse for today:', dailyVerseData);

      // Check if the current daily verse has been marked as read
      if (dailyVerseData.isRead) {
        console.log('✅ Today\'s verse already read, advancing to next verse');
        return await advanceToNextDailyVerse(userId, currentPosition, allVerses, today);
      } else {
        console.log('📖 Today\'s verse not yet read, returning same verse');
        // Return the current verse (not yet read)
        const currentVerse = allVerses[currentPosition.currentVerseIndex];
        if (currentVerse) {
          return {
            ...currentVerse,
            date: today,
            isToday: true,
            isRead: false
          };
        }
      }
    }

    // No daily verse record for today, create one with current position
    console.log('🆕 Creating new daily verse record for today');
    const currentVerse = allVerses[currentPosition.currentVerseIndex];

    if (currentVerse) {
      // Create daily verse record
      await setDoc(doc(db, 'userDailyVerses', `${userId}_${today}`), {
        userId,
        date: today,
        verseId: currentVerse.id,
        verseIndex: currentPosition.currentVerseIndex,
        surahNumber: currentPosition.currentSurah,
        surahName: currentPosition.currentSurahName,
        isRead: false,
        createdAt: new Date(),
        lastUpdated: new Date()
      });

      console.log('✅ Created daily verse record:', currentVerse.id);

      return {
        ...currentVerse,
        date: today,
        isToday: true,
        isRead: false
      };
    }

    console.log('⚠️ No current verse found, returning fallback');
    return await getFallbackRandomVerse();

  } catch (error) {
    console.error('❌ Error fetching daily Quran verse:', error);
    return await getFallbackRandomVerse();
  }
};

// Advance to the next verse in sequence for daily verse
const advanceToNextDailyVerse = async (userId: string, currentPosition: CurrentPosition, allVerses: { id: string; surahNumber?: number; surah: string; ayah: number }[], today: string) => {
  try {
    console.log('⏭️ Advancing to next daily verse...');

    // Calculate next verse index
    const nextVerseIndex = currentPosition.currentVerseIndex + 1;

    // Check if we've reached the end of the Quran
    if (nextVerseIndex >= allVerses.length) {
      console.log('🎉 Completed entire Quran! Restarting from Al-Fatiha');
      // Restart from the beginning
      const firstVerse = allVerses[0];

      // Update user's reading position to start over
      const { updateReadingPosition } = await import('./quran');
      await updateReadingPosition(userId, 0);

      // Create new daily verse record
      await setDoc(doc(db, 'userDailyVerses', `${userId}_${today}`), {
        userId,
        date: today,
        verseId: firstVerse.id,
        verseIndex: 0,
        surahNumber: 1,
        surahName: 'Al-Fatiha',
        isRead: false,
        createdAt: new Date(),
        lastUpdated: new Date(),
        isRestart: true // Flag to indicate Quran completion and restart
      });

      return {
        ...firstVerse,
        date: today,
        isToday: true,
        isRead: false,
        isRestart: true
      };
    }

    // Get the next verse
    const nextVerse = allVerses[nextVerseIndex];
    if (!nextVerse) {
      console.log('⚠️ Next verse not found, staying at current position');
      return null;
    }

    // Update user's reading position to next verse
    const { updateReadingPosition } = await import('./quran');
    await updateReadingPosition(userId, nextVerseIndex);

    // Create new daily verse record for the next verse
    await setDoc(doc(db, 'userDailyVerses', `${userId}_${today}`), {
      userId,
      date: today,
      verseId: nextVerse.id,
      verseIndex: nextVerseIndex,
      surahNumber: nextVerse.surahNumber || nextVerse.surah,
      surahName: nextVerse.surah,
      isRead: false,
      createdAt: new Date(),
      lastUpdated: new Date()
    });

    console.log('✅ Advanced to next verse:', {
      index: nextVerseIndex,
      surah: nextVerse.surahNumber || nextVerse.surah,
      ayah: nextVerse.ayah,
      id: nextVerse.id
    });

    return {
      ...nextVerse,
      date: today,
      isToday: true,
      isRead: false
    };

  } catch (error) {
    console.error('❌ Error advancing to next daily verse:', error);
    return null;
  }
};

// Fallback function to get a random verse when user data is not available
const getFallbackRandomVerse = async () => {
  try {
    const { getAllQuranVerses } = await import('./quran');
    const allVerses = await getAllQuranVerses();

    if (allVerses.length > 0) {
      const randomIndex = Math.floor(Math.random() * allVerses.length);
      const today = new Date().toISOString().split('T')[0];

      return {
        ...allVerses[randomIndex],
        date: today,
        isToday: true,
        isRead: false
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting fallback verse:', error);
    return null;
  }
};

// Mark today's daily verse as read
export const markDailyVerseAsRead = async (userId: string, verseId: string) => {
  try {
    console.log('✅ Marking daily verse as read:', { userId, verseId });

    const today = new Date().toISOString().split('T')[0];
    const dailyVerseDocRef = doc(db, 'userDailyVerses', `${userId}_${today}`);

    // Update the daily verse record to mark as read
    await updateDoc(dailyVerseDocRef, {
      isRead: true,
      readAt: new Date(),
      lastUpdated: new Date()
    });

    // Also mark the verse as read in the regular verse tracking system
    const { markVerseAsRead } = await import('./quran');

    // Get the verse data to pass to markVerseAsRead
    const { getAllQuranVerses } = await import('./quran');
    const allVerses = await getAllQuranVerses();
    const verse = allVerses.find(v => v.id === verseId);

    if (verse) {
      await markVerseAsRead(userId, verseId, verse);
      console.log('✅ Marked verse as read in both daily and regular tracking');
    }

    return true;
  } catch (error) {
    console.error('❌ Error marking daily verse as read:', error);
    throw error;
  }
};

// Get user's daily verse reading streak and statistics
export const getDailyVerseStats = async (userId: string) => {
  try {
    console.log('📊 Getting daily verse stats for user:', userId);

    // Get all daily verse records for this user
    const dailyVersesQuery = query(
      collection(db, 'userDailyVerses'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(30) // Get last 30 days
    );

    const dailyVersesSnapshot = await getDocs(dailyVersesQuery);
    const dailyVerses = dailyVersesSnapshot.docs.map(doc => doc.data());

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    let checkDate = new Date(today);

    // Check consecutive days backwards from today
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayRecord = dailyVerses.find(v => v.date === dateStr);

      if (dayRecord && dayRecord.isRead) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) {
          // Today not read yet, but don't break streak if it's still today
          const now = new Date();
          if (dateStr === now.toISOString().split('T')[0]) {
            // It's still today, don't break streak yet
          } else {
            tempStreak = 0;
          }
        } else {
          tempStreak = 0;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    const readDays = dailyVerses.filter(v => v.isRead).length;

    return {
      currentStreak,
      longestStreak,
      totalDaysRead: readDays,
      totalDaysTracked: dailyVerses.length
    };

  } catch (error) {
    console.error('❌ Error getting daily verse stats:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDaysRead: 0,
      totalDaysTracked: 0
    };
  }
};

// Create a new post
export const createNewPost = async (postData: {
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  circleId?: string;
  circleName?: string;
}) => {
  try {
    // Create the post document, only including defined fields
    const postFields = {
      userId: postData.userId,
      userName: postData.userName,
      userAvatar: postData.userAvatar,
      content: postData.content,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: 0,
      shares: 0,
      likedBy: [],
      ...(postData.circleId?.trim() ? { circleId: postData.circleId.trim() } : {}),
      ...(postData.circleName?.trim() ? { circleName: postData.circleName.trim() } : {})
    };

    const docRef = await addDoc(collection(db, 'posts'), postFields);
    
    // Update user's post count (only if user document exists)
    try {
      const userRef = doc(db, 'users', postData.userId);
      await updateDoc(userRef, {
        postsCount: increment(1),
      });
    } catch (userUpdateError) {
      console.warn('Could not update user post count:', userUpdateError);
      // Don't throw error here, post creation was successful
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get stories for stories section
export const getStories = async (userId: string) => {
  try {
    // Get stories from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const storiesQuery = query(
      collection(db, 'stories'),
      where('createdAt', '>', yesterday),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const storiesSnapshot = await getDocs(storiesQuery);
    const stories: Story[] = [];
    
    storiesSnapshot.forEach((doc) => {
      const data = doc.data();
      stories.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        isViewed: data.viewedBy?.includes(userId) || false,
      });
    });
    
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
};