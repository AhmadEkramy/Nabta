// Export Firebase configuration
export { analytics, default as app, auth, db, storage } from './config';

// Export authentication functions
export * from './auth';

// Export Firestore functions
export * from './firestore';

// Export Storage functions
export * from './storage';

// Export app-specific functions
export * from './circles';
export * from './focusSessions';
export * from './homePage';
export * from './notifications';
export * from './postInteractions';
export { addComment, createPost } from './posts';
export * from './quran';
export * from './bible';
export * from './stories';
export {
    checkAndUpdateStreak,
    followUser,
    getFollowersList,
    getFollowingList,
    getSuggestedUsers,
    getUserAchievements,
    getUserPosts,
    getUserProfile,
    incrementCompletedTasks,
    incrementReadVerses, isFollowingUser, unfollowUser, updateUserProfile as updateFirestoreUserProfile, updateFocusHours, updateUserLevel,
    updateUserStreak, updateUserXP
} from './userProfile';
export * from './userSettings';

