import { addDoc, collection, deleteDoc, doc, getDocs, increment, query, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

export const sharePost = async (postId: string, userId: string) => {
  try {
    // Check if the post has already been shared by this user
    const existingShareQuery = query(
      collection(db, 'sharedPosts'),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const existingShareSnapshot = await getDocs(existingShareQuery);

    if (!existingShareSnapshot.empty) {
      // Post already shared by this user
      return false;
    }

    // Create a new share record
    await addDoc(collection(db, 'sharedPosts'), {
      postId,
      userId,
      sharedAt: new Date(),
    });

    // Increment the shares count on the original post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      shares: increment(1)
    });

    return true;
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
};

export const unsharePost = async (postId: string, userId: string) => {
  try {
    // Find the share record
    const shareQuery = query(
      collection(db, 'sharedPosts'),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const shareSnapshot = await getDocs(shareQuery);

    if (shareSnapshot.empty) {
      return false;
    }

    // Delete the share record
    const shareDoc = shareSnapshot.docs[0];
    await deleteDoc(doc(db, 'sharedPosts', shareDoc.id));

    // Decrement the shares count on the original post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      shares: increment(-1)
    });

    return true;
  } catch (error) {
    console.error('Error unsharing post:', error);
    throw error;
  }
};