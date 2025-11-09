import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './config';

// Create a new story
export const createStory = async (
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video'
) => {
  try {
    const storyRef = await addDoc(collection(db, 'stories'), {
      userId,
      userName,
      userAvatar,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      likes: 0,
      comments: 0,
      views: 0,
      likedBy: [],
      viewedBy: [],
    });

    return storyRef.id;
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
};

// Get all active stories (not expired)
export const getActiveStories = async () => {
  try {
    const now = new Date();
    const storiesQuery = query(
      collection(db, 'stories'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const storiesSnapshot = await getDocs(storiesQuery);
    const stories = [];

    storiesSnapshot.forEach((doc) => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
      
      // Only include non-expired stories
      if (expiresAt > now) {
        stories.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          expiresAt: expiresAt.toISOString(),
        });
      }
    });

    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
};

// Get stories grouped by user
export const getStoriesGroupedByUser = async () => {
  try {
    const stories = await getActiveStories();
    const groupedStories = new Map();

    stories.forEach((story) => {
      const userId = story.userId;
      if (!groupedStories.has(userId)) {
        groupedStories.set(userId, {
          userId: story.userId,
          userName: story.userName,
          userAvatar: story.userAvatar,
          stories: [],
          hasUnviewed: false,
        });
      }
      groupedStories.get(userId).stories.push(story);
    });

    return Array.from(groupedStories.values());
  } catch (error) {
    console.error('Error fetching grouped stories:', error);
    return [];
  }
};

// Like/Unlike a story
export const toggleStoryLike = async (storyId: string, userId: string, userName: string, userAvatar: string) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (!storyDoc.exists()) {
      throw new Error('Story not found');
    }
    
    const storyData = storyDoc.data();
    const likedBy = storyData.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike the story
      await updateDoc(storyRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      });
      return false;
    } else {
      // Like the story
      await updateDoc(storyRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });
      
      // Add notification for story owner (if not liking own story)
      if (storyData.userId !== userId) {
        await addDoc(collection(db, 'notifications'), {
          type: 'story_like',
          fromUserId: userId,
          fromUserName: userName,
          fromUserAvatar: userAvatar,
          toUserId: storyData.userId,
          storyId: storyId,
          message: `${userName} liked your story`,
          messageAr: `أعجب ${userName} بقصتك`,
          createdAt: serverTimestamp(),
          read: false,
        });
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error toggling story like:', error);
    throw error;
  }
};

// Add a comment to a story
export const addStoryComment = async (
  storyId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string
) => {
  try {
    // Add comment to story_comments collection
    const commentRef = await addDoc(collection(db, 'story_comments'), {
      storyId,
      userId,
      userName,
      userAvatar,
      content,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
    });
    
    // Update story comment count
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      comments: increment(1),
    });
    
    // Get story data for notification
    const storyDoc = await getDoc(storyRef);
    if (storyDoc.exists()) {
      const storyData = storyDoc.data();
      
      // Add notification for story owner (if not commenting on own story)
      if (storyData.userId !== userId) {
        await addDoc(collection(db, 'notifications'), {
          type: 'story_comment',
          fromUserId: userId,
          fromUserName: userName,
          fromUserAvatar: userAvatar,
          toUserId: storyData.userId,
          storyId: storyId,
          commentId: commentRef.id,
          message: `${userName} commented on your story`,
          messageAr: `علق ${userName} على قصتك`,
          createdAt: serverTimestamp(),
          read: false,
        });
      }
    }
    
    return commentRef.id;
  } catch (error) {
    console.error('Error adding story comment:', error);
    throw error;
  }
};

// Get comments for a story
export const getStoryComments = async (storyId: string) => {
  try {
    const commentsQuery = query(
      collection(db, 'story_comments'),
      where('storyId', '==', storyId),
      orderBy('createdAt', 'desc')
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = [];
    
    commentsSnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error fetching story comments:', error);
    return [];
  }
};

// Mark story as viewed
export const markStoryAsViewed = async (storyId: string, userId: string) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (!storyDoc.exists()) {
      return false;
    }
    
    const storyData = storyDoc.data();
    const viewedBy = storyData.viewedBy || [];
    
    if (!viewedBy.includes(userId)) {
      await updateDoc(storyRef, {
        views: increment(1),
        viewedBy: arrayUnion(userId),
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error marking story as viewed:', error);
    return false;
  }
};

// Delete a story (only by story author)
export const deleteStory = async (storyId: string, userId: string) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (!storyDoc.exists()) {
      throw new Error('Story not found');
    }
    
    const storyData = storyDoc.data();
    
    // Check if user can delete (only story author)
    if (storyData.userId !== userId) {
      throw new Error('Not authorized to delete this story');
    }
    
    // Delete all comments for this story
    const commentsQuery = query(
      collection(db, 'story_comments'),
      where('storyId', '==', storyId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    
    const deletePromises = [];
    commentsSnapshot.forEach((commentDoc) => {
      deletePromises.push(deleteDoc(commentDoc.ref));
    });
    
    // Delete all notifications for this story
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('storyId', '==', storyId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    notificationsSnapshot.forEach((notificationDoc) => {
      deletePromises.push(deleteDoc(notificationDoc.ref));
    });
    
    // Wait for all related data to be deleted
    await Promise.all(deletePromises);
    
    // Finally delete the story
    await deleteDoc(storyRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

// Get story stats
export const getStoryStats = async (storyId: string) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (!storyDoc.exists()) {
      return { likes: 0, comments: 0, views: 0, likedBy: [], viewedBy: [] };
    }
    
    const data = storyDoc.data();
    return {
      likes: data.likes || 0,
      comments: data.comments || 0,
      views: data.views || 0,
      likedBy: data.likedBy || [],
      viewedBy: data.viewedBy || [],
    };
  } catch (error) {
    console.error('Error fetching story stats:', error);
    return { likes: 0, comments: 0, views: 0, likedBy: [], viewedBy: [] };
  }
};