export interface User {
  id: string;
  uid: string;
  name: string;
  username?: string; // Unique username (e.g., @ahmed_ekramy)
  displayName?: string;
  email: string;
  avatar: string;
  photoURL?: string;
  coverImage?: string; // Profile cover/banner image
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string; // Last date user was active (YYYY-MM-DD format)
  isAdmin: boolean;
  joinedAt: string;
  circles: string[];
  completedTasks: number;
  readVerses: number | string[]; // Can be count (number) or array of verse IDs
  readVersesCount?: number; // Explicit count field
  focusHours: number;
  followers?: number;
  following?: number;
  followersList?: string[];
  followingList?: string[];
  bio?: string;
  location?: string;
}

export interface Circle {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  members: number;
  posts: number;
  color: string;
  icon: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  isJoined: boolean;
  memberIds?: string[];
  adminIds?: string[];
  createdAt?: string;
  status?: 'active' | 'inactive';
}

export interface CirclePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  circleId: string;
  createdAt: string | { seconds: number; nanoseconds: number };
  updatedAt?: string;
  likes: number;
  comments: number;
  likedBy: Record<string, boolean>;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  circleId?: string;
  circleName?: string;
  createdAt: string;
  updatedAt?: string;
  sharedAt?: string;  // Added for shared posts
  sharedBy?: {  // Added for shared posts - who shared the post
    userId: string;
    userName: string;
    userAvatar: string;
  };
  likes: number;
  comments: number;
  shares: number;
  likedBy: string[];
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
  likes: number;
  comments: number;
  views: number;
  likedBy: string[];
  viewedBy: string[];
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export interface StoryComment {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface Game {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  playTime: string;
  players: number;
  icon?: string;
  color?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  type: 'xp' | 'level' | 'follow' | 'like' | 'comment' | 'share' | 'reaction' | 'story_like' | 'story_comment' | 'message' | 'circle';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  userId?: string;
  postId?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  commentId?: string;
  storyId?: string;
  reactionType?: string;
}

export interface QuranVerse {
  id: string;
  arabic: string;
  translation: string;
  surah: string;
  surahAr?: string;
  ayah: number;
  surahNumber?: number;
  verseNumber?: number;
  juzNumber?: number;
  globalIndex?: number;
  date?: string;
  isRead?: boolean;
  isToday?: boolean;
  reference?: string;
}

export interface DailyVerse extends QuranVerse {
  date: string;
  isToday: boolean;
}

export interface QuranProgress {
  readVerses: number;
  totalVerses: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: Date | null;
  currentVerseIndex?: number; // Global index of current verse being read
  currentJuz?: number;
  currentSurah?: number;
  currentSurahName?: string;
  currentSurahNameAr?: string;
  progressPercentage?: number;
}

export interface UserVerseRead {
  id: string;
  userId: string;
  verseId: string;
  verseData: QuranVerse;
  readAt: Date;
}

// Enhanced interfaces for Quran navigation and progress tracking

export interface QuranReadingPosition {
  userId: string;
  currentVerseIndex: number; // Global index (0-based) of current verse
  currentJuz: number;
  currentSurah: number;
  currentSurahName: string;
  currentSurahNameAr: string;
  lastReadAt: Date;
  progressPercentage: number;
}

export interface JuzProgress {
  juzNumber: number;
  juzName: string;
  juzNameAr: string;
  totalVerses: number;
  readVerses: number;
  progressPercentage: number;
  isCompleted: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface SurahProgress {
  surahNumber: number;
  surahName: string;
  surahNameAr: string;
  totalVerses: number;
  readVerses: number;
  progressPercentage: number;
  isCompleted: boolean;
  juzNumber: number[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface QuranNavigationState {
  currentVerseIndex: number;
  totalVerses: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentPosition: QuranReadingPosition;
  juzProgress: JuzProgress[];
  surahProgress: SurahProgress[];
}

export interface VerseDisplayInfo {
  verse: QuranVerse;
  position: {
    globalIndex: number;
    surahNumber: number;
    verseNumber: number;
    juzNumber: number;
    surahName: string;
    surahNameAr: string;
  };
  navigation: {
    canGoNext: boolean;
    canGoPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
  progress: {
    overallPercentage: number;
    juzPercentage: number;
    surahPercentage: number;
  };
}

export interface ExtendedUserType extends Omit<User, 'circles'> {
  // Weekly progress
  weeklyProgress?: {
    [key: string]: {
      tasks: number;
      tasksCount: number;
      focusHours: number;
    };
  };
  circles: string[];  // Keep the original circles array from User
  circleDetails?: Array<{
    id: string;
    name: string;
  }>;
  interests?: string[];
  totalPosts?: number;
  sharedPosts?: number;
  skills?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface FocusSession {
  id: string;
  userId: string;
  modeId: string;
  modeName: string;
  duration: number; // Planned duration in seconds
  totalSeconds: number; // Actual time spent in seconds
  xpReward: number;
  status: 'active' | 'paused' | 'completed' | 'stopped';
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  // Optional post-session fields
  notes?: string; // User's written reflection/notes
  rating?: number; // 1-5 rating for session quality
  voiceNoteUrl?: string; // URL to stored voice note
  reflectionAt?: string; // When the reflection was submitted
}