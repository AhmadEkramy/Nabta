// Time tracking utility for daily usage limits

const STORAGE_KEY_PREFIX = 'daily_usage_';
const DATE_KEY = 'last_usage_date';

/**
 * Get today's date string in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

/**
 * Get the storage key for a user's daily usage
 */
const getUserStorageKey = (userId: string): string => {
  return `${STORAGE_KEY_PREFIX}${userId}`;
};

/**
 * Check if we need to reset daily usage (new day)
 */
const shouldResetDailyUsage = (userId: string): boolean => {
  const lastDate = localStorage.getItem(`${DATE_KEY}_${userId}`);
  const today = getTodayDateString();
  
  if (lastDate !== today) {
    // New day, reset usage
    localStorage.setItem(`${DATE_KEY}_${userId}`, today);
    return true;
  }
  
  return false;
};

/**
 * Initialize daily usage tracking for a user
 */
export const initializeDailyUsage = (userId: string): void => {
  if (shouldResetDailyUsage(userId)) {
    // Reset usage for new day
    const storageKey = getUserStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify({
      startTime: Date.now(),
      totalTime: 0,
      date: getTodayDateString()
    }));
  } else {
    // Check if usage exists, if not create it
    const storageKey = getUserStorageKey(userId);
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      localStorage.setItem(storageKey, JSON.stringify({
        startTime: Date.now(),
        totalTime: 0,
        date: getTodayDateString()
      }));
    } else {
      try {
        // Update start time if user just came back
        const usage = JSON.parse(existing);
        
        // Check if it's a new day
        if (usage.date !== getTodayDateString()) {
          localStorage.setItem(storageKey, JSON.stringify({
            startTime: Date.now(),
            totalTime: 0,
            date: getTodayDateString()
          }));
        } else if (!usage.startTime) {
          // If startTime is missing, set it to now
          usage.startTime = Date.now();
          if (!usage.totalTime) {
            usage.totalTime = 0;
          }
          localStorage.setItem(storageKey, JSON.stringify(usage));
        }
      } catch (error) {
        // If parsing fails, reset
        localStorage.setItem(storageKey, JSON.stringify({
          startTime: Date.now(),
          totalTime: 0,
          date: getTodayDateString()
        }));
      }
    }
  }
};

/**
 * Get current daily usage in milliseconds
 */
export const getDailyUsage = (userId: string): number => {
  const storageKey = getUserStorageKey(userId);
  const usageData = localStorage.getItem(storageKey);
  
  if (!usageData) {
    return 0;
  }
  
  try {
    const usage = JSON.parse(usageData);
    
    // Check if it's a new day
    if (usage.date !== getTodayDateString()) {
      return 0;
    }
    
    // Calculate total time: existing total + time since last start
    const currentTime = Date.now();
    const totalTime = usage.totalTime || 0;
    const startTime = usage.startTime || currentTime;
    const sessionTime = currentTime - startTime;
    
    // Return total time (always positive)
    return Math.max(0, totalTime + sessionTime);
  } catch (error) {
    console.error('Error parsing usage data:', error);
    return 0;
  }
};

/**
 * Update daily usage (call periodically)
 */
export const updateDailyUsage = (userId: string): void => {
  const storageKey = getUserStorageKey(userId);
  const usageData = localStorage.getItem(storageKey);
  
  if (!usageData) {
    initializeDailyUsage(userId);
    return;
  }
  
  try {
    const usage = JSON.parse(usageData);
    
    // Check if it's a new day
    if (usage.date !== getTodayDateString()) {
      initializeDailyUsage(userId);
      return;
    }
    
    // Update total time
    const currentTime = Date.now();
    const totalTime = usage.totalTime || 0;
    const startTime = usage.startTime || currentTime;
    
    // Calculate session time since last update
    const sessionTime = Math.max(0, currentTime - startTime);
    
    // Update total time and reset start time
    usage.totalTime = totalTime + sessionTime;
    usage.startTime = currentTime;
    
    localStorage.setItem(storageKey, JSON.stringify(usage));
  } catch (error) {
    console.error('Error updating usage data:', error);
    // Reset on error
    initializeDailyUsage(userId);
  }
};

/**
 * Convert time limit string to milliseconds
 */
export const getTimeLimitInMs = (timeLimit: 'unlimited' | '1min' | '1hour'): number => {
  switch (timeLimit) {
    case '1min':
      return 60 * 1000; // 1 minute
    case '1hour':
      return 60 * 60 * 1000; // 1 hour
    case 'unlimited':
    default:
      return Infinity;
  }
};

/**
 * Check if user has exceeded their daily time limit
 */
export const hasExceededTimeLimit = (
  userId: string,
  timeLimit: 'unlimited' | '1min' | '1hour'
): boolean => {
  if (timeLimit === 'unlimited') {
    return false;
  }
  
  const limitMs = getTimeLimitInMs(timeLimit);
  const usageMs = getDailyUsage(userId);
  
  // Check if usage has reached or exceeded the limit
  // Use >= to catch when time is exactly at or over the limit
  const exceeded = usageMs >= limitMs;
  
  // Debug logging (can be removed in production)
  if (exceeded) {
    console.log(`Time limit exceeded: usage=${usageMs}ms, limit=${limitMs}ms`);
  }
  
  return exceeded;
};

/**
 * Get remaining time in milliseconds
 */
export const getRemainingTime = (
  userId: string,
  timeLimit: 'unlimited' | '1min' | '1hour'
): number => {
  if (timeLimit === 'unlimited') {
    return Infinity;
  }
  
  const limitMs = getTimeLimitInMs(timeLimit);
  const usageMs = getDailyUsage(userId);
  
  return Math.max(0, limitMs - usageMs);
};

/**
 * Format milliseconds to readable string
 */
export const formatTime = (ms: number): string => {
  if (ms === Infinity) {
    return '∞';
  }
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format milliseconds to readable string in Arabic
 */
export const formatTimeArabic = (ms: number): string => {
  if (ms === Infinity) {
    return 'لانهائي';
  }
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${seconds}ث`;
  }
};

