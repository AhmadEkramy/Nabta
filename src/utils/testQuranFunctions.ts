import { getDailyVerses, getUserQuranProgress, hasUserReadVerse } from '../firebase/quran';

// Test function to verify Quran functions work correctly
export const testQuranFunctions = async (userId: string) => {
  try {
    console.log('Testing Quran functions...');

    // Test getDailyVerses
    console.log('1. Testing getDailyVerses...');
    const dailyVerses = await getDailyVerses(3);
    console.log('Daily verses:', dailyVerses);

    // Test getUserQuranProgress
    console.log('2. Testing getUserQuranProgress...');
    const progress = await getUserQuranProgress(userId);
    console.log('User progress:', progress);

    // Test hasUserReadVerse
    if (dailyVerses.length > 0) {
      console.log('3. Testing hasUserReadVerse...');
      const hasRead = await hasUserReadVerse(userId, dailyVerses[0].id);
      console.log('Has read first verse:', hasRead);
    }

    console.log('All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Make test function available globally
(window as any).testQuranFunctions = testQuranFunctions;
