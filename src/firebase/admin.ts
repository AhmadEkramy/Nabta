import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { Post, User } from '../types';
import { db } from './config';
import { deletePost as deletePostWithRelations } from './postInteractions';

// Admin Statistics
export interface AdminStats {
  totalUsers: number;
  totalCircles: number;
  totalPosts: number;
  activeUsers: number;
  dailyPosts: number;
  weeklyUsers: number;
  monthlyUsers: number;
}

export interface UserWithStats extends User {
  postsCount: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

export interface CircleWithStats {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  members: number;
  posts: number;
  adminIds: string[];
  createdAt: string;
  status: 'active' | 'inactive';
  isPrivate: boolean;
  imageUrl?: string;
  backgroundImageUrl?: string;
}

// Get admin statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;

    // Get total circles
    const circlesSnapshot = await getDocs(collection(db, 'circles'));
    const totalCircles = circlesSnapshot.size;

    // Get total posts
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    const totalPosts = postsSnapshot.size;

    // Get daily posts
    const dailyPostsQuery = query(
      collection(db, 'posts'),
      where('createdAt', '>=', Timestamp.fromDate(oneDayAgo))
    );
    const dailyPostsSnapshot = await getDocs(dailyPostsQuery);
    const dailyPosts = dailyPostsSnapshot.size;

    // Get weekly active users (users who posted in the last week)
    const weeklyPostsQuery = query(
      collection(db, 'posts'),
      where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo))
    );
    const weeklyPostsSnapshot = await getDocs(weeklyPostsQuery);
    const weeklyActiveUserIds = new Set(weeklyPostsSnapshot.docs.map(doc => doc.data().userId));
    const weeklyUsers = weeklyActiveUserIds.size;

    // Get monthly active users
    const monthlyPostsQuery = query(
      collection(db, 'posts'),
      where('createdAt', '>=', Timestamp.fromDate(oneMonthAgo))
    );
    const monthlyPostsSnapshot = await getDocs(monthlyPostsQuery);
    const monthlyActiveUserIds = new Set(monthlyPostsSnapshot.docs.map(doc => doc.data().userId));
    const monthlyUsers = monthlyActiveUserIds.size;

    // Estimate active users (users active in the last week)
    const activeUsers = weeklyUsers;

    return {
      totalUsers,
      totalCircles,
      totalPosts,
      activeUsers,
      dailyPosts,
      weeklyUsers,
      monthlyUsers
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    throw error;
  }
};

// Get all users with pagination and stats
export const getAllUsers = async (
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ users: UserWithStats[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    let usersQuery = query(
      collection(db, 'users'),
      orderBy('joinedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      usersQuery = query(
        collection(db, 'users'),
        orderBy('joinedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const usersSnapshot = await getDocs(usersQuery);
    const users: UserWithStats[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data() as User;
      
      // Get user's post count
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userDoc.id)
      );
      const userPostsSnapshot = await getDocs(userPostsQuery);
      const postsCount = userPostsSnapshot.size;

      // Get user's last post to determine activity
      const lastPostQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userDoc.id),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const lastPostSnapshot = await getDocs(lastPostQuery);
      
      let lastActive = userData.joinedAt;
      let status: 'active' | 'inactive' = 'inactive';
      
      if (!lastPostSnapshot.empty) {
        const lastPost = lastPostSnapshot.docs[0].data();
        lastActive = lastPost.createdAt.toDate().toISOString();
        
        // Consider user active if they posted in the last 7 days
        const lastPostDate = lastPost.createdAt.toDate();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        status = lastPostDate > sevenDaysAgo ? 'active' : 'inactive';
      }

      users.push({
        ...userData,
        postsCount,
        lastActive,
        status
      });
    }

    const lastDocument = usersSnapshot.docs[usersSnapshot.docs.length - 1] || null;

    return { users, lastDoc: lastDocument };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get all circles with stats
export const getAllCircles = async (): Promise<CircleWithStats[]> => {
  try {
    const circlesSnapshot = await getDocs(collection(db, 'circles'));
    const circles: CircleWithStats[] = [];

    for (const circleDoc of circlesSnapshot.docs) {
      const circleData = circleDoc.data();
      
      // Get circle's post count
      const circlePostsQuery = query(
        collection(db, 'posts'),
        where('circleId', '==', circleDoc.id)
      );
      const circlePostsSnapshot = await getDocs(circlePostsQuery);
      const posts = circlePostsSnapshot.size;

      // Get member count (assuming members are stored in a subcollection or array)
      const members = circleData.memberIds ? circleData.memberIds.length : 0;

      // Determine status based on recent activity
      const recentPostsQuery = query(
        collection(db, 'posts'),
        where('circleId', '==', circleDoc.id),
        where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      );
      const recentPostsSnapshot = await getDocs(recentPostsQuery);
      const status: 'active' | 'inactive' = recentPostsSnapshot.size > 0 ? 'active' : 'inactive';

      circles.push({
        id: circleDoc.id,
        name: circleData.name || 'Unnamed Circle',
        nameAr: circleData.nameAr || circleData.name || 'دائرة بدون اسم',
        description: circleData.description || '',
        descriptionAr: circleData.descriptionAr || circleData.description || '',
        category: circleData.category || 'General',
        categoryAr: circleData.categoryAr || circleData.category || 'عام',
        members,
        posts,
        adminIds: circleData.adminIds || [],
        createdAt: circleData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        status,
        isPrivate: circleData.isPrivate || false,
        imageUrl: circleData.imageUrl || '',
        backgroundImageUrl: circleData.backgroundImageUrl || ''
      });
    }

    return circles.sort((a, b) => b.members - a.members);
  } catch (error) {
    console.error('Error getting all circles:', error);
    throw error;
  }
};

//Get recent posts for admin overview
export const getRecentPosts = async (limitCount: number = 10): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    const posts: Post[] = [];

    for (const postDoc of postsSnapshot.docs) {
      try {
        const postData = postDoc.data();
        
        // Safely get user data for the post if userId exists
        let userData = null;
        if (postData.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', postData.userId));
            userData = userDoc.exists() ? userDoc.data() : null;
          } catch (userError) {
            console.error('Error fetching user data:', userError);
          }
        }

        // Handle likedBy data safely
        // Process likedBy data safely
        const likedBy = (() => {
          try {
            if (!postData.likedBy) return [];
            if (Array.isArray(postData.likedBy)) return [...postData.likedBy];
            if (typeof postData.likedBy === 'object') {
              return Object.entries(postData.likedBy)
                .filter(([, v]) => v === true)
                .map(([k]) => k);
            }
            return [];
          } catch (error) {
            console.error('Error processing likedBy data:', error);
            return [];
          }
        })();

        const post: Post = {
          id: postDoc.id,
          userId: postData.userId || '',
          userName: postData.userName || postData.authorName || 'Unknown User',
          userAvatar: postData.userAvatar || postData.authorAvatar || '',
          content: postData.content || '',
          circleId: postData.circleId,
          circleName: postData.circleName,
          createdAt: postData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: postData.updatedAt?.toDate?.()?.toISOString(),
          likes: typeof postData.likes === 'number' ? postData.likes : 0,
          comments: typeof postData.comments === 'number' ? postData.comments : 0,
          shares: typeof postData.shares === 'number' ? postData.shares : 0,
          likedBy: likedBy,
          user: userData ? {
            id: userData.id || postData.userId || '',
            name: userData.name || postData.userName || postData.authorName || 'Unknown User',
            avatar: userData.avatar || postData.userAvatar || postData.authorAvatar || ''
          } : {
            id: postData.userId || '',
            name: postData.userName || postData.authorName || 'Unknown User',
            avatar: postData.userAvatar || postData.authorAvatar || ''
          }
        };

        posts.push(post);
      } catch (postError) {
        console.error('Error processing post:', postDoc.id, postError);
        continue;
      }
    }

    return posts;
  } catch (error) {
    console.error('Error getting recent posts:', error);
    throw error;
  }
};

// Update user status (admin action)
export const updateUserStatus = async (userId: string, isAdmin: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Delete user (admin action)
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Note: In a real app, you'd want to also delete user's posts, comments, etc.
    // and handle this server-side for security
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Delete circle (admin action)
export const deleteCircle = async (circleId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'circles', circleId));
  } catch (error) {
    console.error('Error deleting circle:', error);
    throw error;
  }
};

// Delete post (admin action)
export const deletePost = async (postId: string, userId: string = ''): Promise<void> => {
  try {
    // Use the deletePost function from postInteractions which handles all related data
    // Pass isAdmin=true to bypass authorization check
    await deletePostWithRelations(postId, userId, true);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};
