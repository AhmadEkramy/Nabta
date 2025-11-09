import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    updateDoc
} from 'firebase/firestore';
import { Circle } from '../types';
import { db } from './config';

// Join a circle
export const joinCircle = async (circleId: string, userId: string) => {
  try {
    console.log('Joining circle:', { circleId, userId }); // Debugging line
    
    // Get current circle data
    const circleDoc = await getDoc(doc(db, 'circles', circleId));
    console.log('Circle data before join:', circleDoc.exists() ? circleDoc.data() : 'Not found'); // Debugging line
    // Add user to circle members
    const circleRef = doc(db, 'circles', circleId);
    await updateDoc(circleRef, {
      memberIds: arrayUnion(userId),
      members: increment(1),
    });

    // Add circle to user's circles
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      circles: arrayUnion(circleId),
    });
  } catch (error) {
    console.error('Error joining circle:', error);
    throw error;
  }
};

// Leave a circle
export const leaveCircle = async (circleId: string, userId: string) => {
  try {
    // Remove user from circle members
    const circleRef = doc(db, 'circles', circleId);
    await updateDoc(circleRef, {
      memberIds: arrayRemove(userId),
      members: increment(-1),
    });

    // Remove circle from user's circles
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      circles: arrayRemove(circleId),
    });
  } catch (error) {
    console.error('Error leaving circle:', error);
    throw error;
  }
};

// Check if user is member of a circle
export const isCircleMember = async (circleId: string, userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.circles?.includes(circleId) || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking circle membership:', error);
    return false;
  }
};

// Get all circles from Firestore
export const getAllCircles = async (): Promise<Circle[]> => {
  try {
    console.log('Fetching all circles...'); // Debugging line
    const circlesQuery = query(
      collection(db, 'circles'),
      orderBy('members', 'desc') // Order by member count (most popular first)
    );

    const circlesSnapshot = await getDocs(circlesQuery);
    const circles: Circle[] = [];

    circlesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Circle data from Firestore:', { id: doc.id, ...data }); // Debugging line
      circles.push({
        id: doc.id,
        name: data.name || '',
        nameAr: data.nameAr || data.name || '',
        description: data.description || '',
        descriptionAr: data.descriptionAr || data.description || '',
        category: data.category || 'other',
        categoryAr: data.categoryAr || data.category || 'أخرى',
        members: data.members || 0,
        posts: data.posts || 0,
        color: data.color || 'blue',
        icon: data.icon || '🔵',
        imageUrl: data.imageUrl || '',
        backgroundImageUrl: data.backgroundImageUrl || '',
        isJoined: false, // Will be updated based on user's circles
        memberIds: data.memberIds || [],
        adminIds: data.adminIds || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        status: data.status || 'active'
      } as Circle);
    });

    return circles;
  } catch (error) {
    console.error('Error fetching all circles:', error);
    return [];
  }
};

// Get circles with user membership status
export const getCirclesWithMembership = async (userId: string): Promise<Circle[]> => {
  try {
    const [allCircles, userDoc] = await Promise.all([
      getAllCircles(),
      getDoc(doc(db, 'users', userId))
    ]);

    let userCircles: string[] = [];
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userCircles = userData.circles || [];
    }

    // Update isJoined status for each circle
    return allCircles.map(circle => ({
      ...circle,
      isJoined: userCircles.includes(circle.id)
    }));
  } catch (error) {
    console.error('Error fetching circles with membership:', error);
    return [];
  }
};