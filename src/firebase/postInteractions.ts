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
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './config';

// Reaction types
export type ReactionType = 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';

// Reaction interface
export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  reactionType: ReactionType;
  createdAt: { seconds: number; nanoseconds: number } | Date;
}

// Like/Unlike a post
export const togglePostLike = async (postId: string, userId: string, userName: string, userAvatar: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    const likedBy = postData.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike the post
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      });
      return false; // Not liked anymore
    } else {
      // Like the post
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });
      
      // Add notification for post owner (if not liking own post)
      if (postData.userId !== userId) {
        await addDoc(collection(db, 'notifications'), {
          type: 'like',
          fromUserId: userId,
          fromUserName: userName,
          fromUserAvatar: userAvatar,
          toUserId: postData.userId,
          postId: postId,
          message: `${userName} liked your post`,
          messageAr: `أعجب ${userName} بمنشورك`,
          createdAt: serverTimestamp(),
          read: false,
        });
      }
      
      return true; // Now liked
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Add a comment to a post
export const addPostComment = async (
  postId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
  parentCommentId?: string // Optional parent comment ID for replies
) => {
  try {
    // Get user's username from their profile
    let username = userName.toLowerCase().replace(/\s+/g, '_'); // Fallback
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        username = userData.username || username;
      }
    } catch (error) {
      console.warn('Could not fetch username, using fallback:', error);
    }

    // Add comment to comments collection
    const commentRef = await addDoc(collection(db, 'comments'), {
      postId,
      userId,
      userName,
      username, // Add username field
      userAvatar,
      content,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      parentCommentId: parentCommentId || null, // For nested replies
    });
    
    // Update post comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: increment(1),
    });
    
    // Get post data for notification
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      const postData = postDoc.data();
      
      // Add notification for post owner (if not commenting on own post and if post has an authorId)
      const authorId = postData.userId || postData.authorId;
      if (authorId && authorId !== userId) {
        await addDoc(collection(db, 'notifications'), {
          type: 'comment',
          fromUserId: userId,
          fromUserName: userName,
          fromUserAvatar: userAvatar,
          toUserId: authorId,
          postId: postId,
          commentId: commentRef.id,
          message: `${userName} commented on your post`,
          messageAr: `علق ${userName} على منشورك`,
          createdAt: serverTimestamp(),
          read: false,
        });
      }
    }
    
    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get comments for a post
export const getPostComments = async (postId: string) => {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const allComments: Array<{
      id: string;
      content: string;
      postId: string;
      userId: string;
      userName: string;
      username?: string;
      userAvatar: string;
      likes: number;
      likedBy: string[];
      createdAt: string | { seconds: number; nanoseconds: number };
      parentCommentId: string | null;
      replies?: any[];
    }> = [];
    
    commentsSnapshot.forEach((doc) => {
      const data = doc.data();
      const comment = {
        id: doc.id,
        content: data.content,
        postId: data.postId,
        userId: data.userId,
        userName: data.userName,
        username: data.username, // Add username field
        userAvatar: data.userAvatar,
        likes: data.likes || 0,
        likedBy: data.likedBy || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        parentCommentId: data.parentCommentId || null,
        replies: [],
      };
      allComments.push(comment);
    });
    
    // Build nested structure: organize comments into parent-child relationships
    const commentMap = new Map();
    const topLevelComments: any[] = [];
    
    // First pass: create a map of all comments
    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Second pass: build the tree structure
    allComments.forEach((comment) => {
      if (comment.parentCommentId && commentMap.has(comment.parentCommentId)) {
        // This is a reply, add it to parent's replies array
        const parent = commentMap.get(comment.parentCommentId);
        parent.replies.push(commentMap.get(comment.id));
      } else {
        // This is a top-level comment
        topLevelComments.push(commentMap.get(comment.id));
      }
    });
    
    return topLevelComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Like/Unlike a comment
export const toggleCommentLike = async (commentId: string, userId: string) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }
    
    const commentData = commentDoc.data();
    const likedBy = commentData.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike the comment
      await updateDoc(commentRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      });
      return false;
    } else {
      // Like the comment
      await updateDoc(commentRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

// Share a post (create a share record)
export const sharePost = async (
  postId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  shareType: 'direct' | 'story' | 'external' = 'direct'
) => {
  try {
    // Add share record
    await addDoc(collection(db, 'shares'), {
      postId,
      userId,
      userName,
      userAvatar,
      shareType,
      createdAt: serverTimestamp(),
    });
    
    // Update post share count (we'll add this field to posts)
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      shares: increment(1),
    });
    
    // Get post data for notification
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      const postData = postDoc.data();
      
      // Add notification for post owner (if not sharing own post)
      if (postData.userId !== userId) {
        await addDoc(collection(db, 'notifications'), {
          type: 'share',
          fromUserId: userId,
          fromUserName: userName,
          fromUserAvatar: userAvatar,
          toUserId: postData.userId,
          postId: postId,
          message: `${userName} shared your post`,
          messageAr: `شارك ${userName} منشورك`,
          createdAt: serverTimestamp(),
          read: false,
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
};

// Get post interaction stats
export const getPostStats = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      return { likes: 0, comments: 0, shares: 0, likedBy: [] };
    }
    
    const data = postDoc.data();
    return {
      likes: data.likes || 0,
      comments: data.comments || 0,
      shares: data.shares || 0,
      likedBy: data.likedBy || [],
    };
  } catch (error) {
    console.error('Error fetching post stats:', error);
    return { likes: 0, comments: 0, shares: 0, likedBy: [] };
  }
};

// Update a post (only by post author)
export const updatePost = async (postId: string, userId: string, newContent: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Check if user can edit (only post author)
    if (postData.userId !== userId) {
      throw new Error('Not authorized to edit this post');
    }
    
    // Update post content
    await updateDoc(postRef, {
      content: newContent,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post (only by post author or admin)
export const deletePost = async (postId: string, userId: string, isAdmin: boolean = false) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Check if user can delete (post author or admin)
    if (!isAdmin && postData.userId !== userId) {
      throw new Error('Not authorized to delete this post');
    }
    
    // Delete all comments for this post
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    
    const deletePromises: Promise<void>[] = [];
    commentsSnapshot.forEach((commentDoc) => {
      deletePromises.push(deleteDoc(commentDoc.ref));
    });
    
    // Delete all shares for this post
    const sharesQuery = query(
      collection(db, 'shares'),
      where('postId', '==', postId)
    );
    const sharesSnapshot = await getDocs(sharesQuery);
    
    sharesSnapshot.forEach((shareDoc) => {
      deletePromises.push(deleteDoc(shareDoc.ref));
    });
    
    // Delete all notifications for this post
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('postId', '==', postId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    notificationsSnapshot.forEach((notificationDoc) => {
      deletePromises.push(deleteDoc(notificationDoc.ref));
    });
    
    // Wait for all related data to be deleted
    await Promise.all(deletePromises);
    
    // Finally delete the post
    await deleteDoc(postRef);
    
    // Update user's post count (for the post author, not the admin)
    try {
      const postAuthorId = postData.userId;
      if (postAuthorId) {
        const userRef = doc(db, 'users', postAuthorId);
        await updateDoc(userRef, {
          postsCount: increment(-1),
        });
      }
    } catch (userUpdateError) {
      console.warn('Could not update user post count:', userUpdateError);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Delete a comment (only by comment author or post author)
export const deleteComment = async (commentId: string, userId: string) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }
    
    const commentData = commentDoc.data();
    
    // Check if user can delete (comment author or post author)
    const postRef = doc(db, 'posts', commentData.postId);
    const postDoc = await getDoc(postRef);
    const postData = postDoc.data();
    
    const canDelete = commentData.userId === userId || postData?.userId === userId;
    
    if (!canDelete) {
      throw new Error('Not authorized to delete this comment');
    }
    
    // Find and delete all nested replies
    const repliesQuery = query(
      collection(db, 'comments'),
      where('parentCommentId', '==', commentId)
    );
    const repliesSnapshot = await getDocs(repliesQuery);
    
    let deletedCount = 1; // Count the main comment
    
    // Delete all replies recursively
    const deleteRepliesRecursively = async (parentId: string) => {
      const nestedRepliesQuery = query(
        collection(db, 'comments'),
        where('parentCommentId', '==', parentId)
      );
      const nestedRepliesSnapshot = await getDocs(nestedRepliesQuery);
      
      for (const replyDoc of nestedRepliesSnapshot.docs) {
        // Recursively delete nested replies
        await deleteRepliesRecursively(replyDoc.id);
        await deleteDoc(replyDoc.ref);
        deletedCount++;
      }
    };
    
    // Delete all direct and nested replies
    for (const replyDoc of repliesSnapshot.docs) {
      await deleteRepliesRecursively(replyDoc.id);
      await deleteDoc(replyDoc.ref);
      deletedCount++;
    }
    
    // Delete the main comment
    await deleteDoc(commentRef);
    
    // Update post comment count
    await updateDoc(postRef, {
      comments: increment(-deletedCount),
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Add or update a reaction to a post
export const addPostReaction = async (
  postId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  reactionType: ReactionType
) => {
  try {
    // Check if user already has a reaction on this post
    const existingReactionQuery = query(
      collection(db, 'reactions'),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    
    const existingReactionSnapshot = await getDocs(existingReactionQuery);
    
    if (!existingReactionSnapshot.empty) {
      // User already has a reaction, update it
      const existingReactionDoc = existingReactionSnapshot.docs[0];
      const existingReaction = existingReactionDoc.data();
      
      if (existingReaction.reactionType === reactionType) {
        // Same reaction, remove it
        await deleteDoc(existingReactionDoc.ref);
        
        // Update post reaction count
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          [`reactions.${reactionType}`]: increment(-1),
        });
        
        return null; // Reaction removed
      } else {
        // Different reaction, update it
        await updateDoc(existingReactionDoc.ref, {
          reactionType,
          createdAt: serverTimestamp(),
        });
        
        // Update post reaction counts
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          [`reactions.${existingReaction.reactionType}`]: increment(-1),
          [`reactions.${reactionType}`]: increment(1),
        });
        
        return reactionType; // New reaction type
      }
    } else {
      // No existing reaction, add new one
      await addDoc(collection(db, 'reactions'), {
        postId,
        userId,
        userName,
        userAvatar,
        reactionType,
        createdAt: serverTimestamp(),
      });
      
      // Update post reaction count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        [`reactions.${reactionType}`]: increment(1),
      });
      
      // Add notification for post owner (if not reacting to own post)
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const authorId = postData.userId || postData.authorId;

        if (authorId && authorId !== userId) {
          await addDoc(collection(db, 'notifications'), {
            type: 'reaction',
            fromUserId: userId,
            fromUserName: userName,
            fromUserAvatar: userAvatar,
            toUserId: authorId,
            postId: postId,
            reactionType: reactionType,
            message: `${userName} reacted to your post`,
            messageAr: `تفاعل ${userName} مع منشورك`,
            createdAt: serverTimestamp(),
            read: false,
          });
        }
      }
      
      return reactionType; // New reaction added
    }
  } catch (error) {
    console.error('Error adding post reaction:', error);
    throw error;
  }
};

// Get reactions for a post
export const getPostReactions = async (postId: string) => {
  try {
    const reactionsQuery = query(
      collection(db, 'reactions'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const reactionsSnapshot = await getDocs(reactionsQuery);
    const reactions: PostReaction[] = [];
    
    reactionsSnapshot.forEach((doc) => {
      const data = doc.data();
      reactions.push({
        id: doc.id,
        postId: data.postId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        reactionType: data.reactionType,
        createdAt: data.createdAt,
      });
    });
    
    return reactions;
  } catch (error) {
    console.error('Error fetching post reactions:', error);
    return [];
  }
};

// Get user's reaction for a specific post
export const getUserReaction = async (postId: string, userId: string): Promise<ReactionType | null> => {
  try {
    const reactionQuery = query(
      collection(db, 'reactions'),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    
    const reactionSnapshot = await getDocs(reactionQuery);
    
    if (reactionSnapshot.empty) {
      return null;
    }
    
    const reactionData = reactionSnapshot.docs[0].data();
    return reactionData.reactionType as ReactionType;
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    return null;
  }
};

// Subscribe to real-time reactions for a post
export const subscribeToPostReactions = (
  postId: string,
  callback: (reactions: PostReaction[]) => void
) => {
  const reactionsQuery = query(
    collection(db, 'reactions'),
    where('postId', '==', postId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(reactionsQuery, (snapshot) => {
    const reactions: PostReaction[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      reactions.push({
        id: doc.id,
        postId: data.postId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        reactionType: data.reactionType,
        createdAt: data.createdAt,
      });
    });
    
    callback(reactions);
  });
};

// Get reaction counts for a post
export const getPostReactionCounts = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      return {
        like: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0,
        support: 0,
      };
    }
    
    const data = postDoc.data();
    const reactions = data.reactions || {};
    
    return {
      like: reactions.like || 0,
      laugh: reactions.laugh || 0,
      wow: reactions.wow || 0,
      sad: reactions.sad || 0,
      angry: reactions.angry || 0,
      support: reactions.support || 0,
    };
  } catch (error) {
    console.error('Error fetching post reaction counts:', error);
    return {
      like: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      angry: 0,
      support: 0,
    };
  }
};