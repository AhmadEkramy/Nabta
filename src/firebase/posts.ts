import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    increment,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { Post } from '../types';
import { db } from './config';
import { createNotification } from './notifications';

// Create a new post
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLiked'>) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: 0,
      shares: 0,
      likedBy: [],
      reactions: {
        like: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0,
        support: 0,
      },
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Like/unlike a post
export const togglePostLike = async (
  postId: string,
  userId: string,
  isLiked: boolean,
  userInfo?: { name: string; avatar: string },
  postAuthorId?: string
) => {
  try {
    const postRef = doc(db, 'posts', postId);

    if (isLiked) {
      // Unlike the post
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      });
    } else {
      // Like the post
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      });

      // Create notification for post author (if not liking own post)
      if (userInfo && postAuthorId && userId !== postAuthorId) {
        try {
          await createNotification({
            type: 'like',
            fromUserId: userId,
            fromUserName: userInfo.name,
            fromUserAvatar: userInfo.avatar,
            toUserId: postAuthorId,
            message: `${userInfo.name} liked your post`,
            messageAr: `أعجب ${userInfo.name} بمنشورك`,
            postId: postId,
          });
        } catch (notificationError) {
          console.error('Error creating like notification:', notificationError);
          // Don't throw - like should still work even if notification fails
        }
      }
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  commentData: any,
  postAuthorId?: string
) => {
  try {
    // Add comment to comments subcollection
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      ...commentData,
      createdAt: serverTimestamp(),
    });

    // Increment comment count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: increment(1),
    });

    // Create notification for post author (if not commenting on own post)
    if (postAuthorId && commentData.userId !== postAuthorId) {
      try {
        await createNotification({
          type: 'comment',
          fromUserId: commentData.userId,
          fromUserName: commentData.userName || 'Someone',
          fromUserAvatar: commentData.userAvatar || '',
          toUserId: postAuthorId,
          message: `${commentData.userName || 'Someone'} commented on your post: "${commentData.content?.substring(0, 50)}..."`,
          messageAr: `علق ${commentData.userName || 'شخص ما'} على منشورك: "${commentData.content?.substring(0, 50)}..."`,
          postId: postId,
        });
      } catch (notificationError) {
        console.error('Error creating comment notification:', notificationError);
        // Don't throw - comment should still work even if notification fails
      }
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};