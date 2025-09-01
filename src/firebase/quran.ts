import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { QuranReadingPosition } from '../types';
import { calculateReadingProgress, getVersePosition } from '../utils/quranData';
import { db } from './config';

// Get daily verses (last 7 days)
export const getDailyVerses = async (days: number = 7) => {
  try {
    const verses = [];
    const today = new Date();

    // First, try to get daily verses from the database
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Try to get verse for this specific date
      const dailyVerseQuery = query(
        collection(db, 'dailyVerses'),
        where('date', '==', dateString),
        limit(1)
      );

      const dailyVerseSnapshot = await getDocs(dailyVerseQuery);

      if (!dailyVerseSnapshot.empty) {
        const doc = dailyVerseSnapshot.docs[0];
        verses.push({
          id: doc.id,
          ...doc.data(),
          isToday: i === 0,
        });
      }
    }

    // If we don't have enough verses, get random ones from quranVerses collection
    if (verses.length < days) {
      console.log(`Only found ${verses.length} daily verses, getting random verses to fill ${days} days`);

      // Get all verses and select random ones
      const allVerses = await getAllQuranVerses();
      const randomVerses = [];

      // Select random verses from all available verses
      const neededVerses = days - verses.length;
      const shuffledVerses = [...allVerses].sort(() => Math.random() - 0.5);

      for (let i = 0; i < neededVerses && i < shuffledVerses.length; i++) {
        randomVerses.push(shuffledVerses[i]);
      }

      // Fill missing days with random verses
      for (let i = verses.length; i < days && i < randomVerses.length; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        verses.push({
          ...randomVerses[i],
          date: dateString,
          isToday: i === 0,
        });
      }
    }

    console.log(`Returning ${verses.length} daily verses`);
    return verses;
  } catch (error) {
    console.error('Error fetching daily verses:', error);
    return [];
  }
};

// Get a random verse from the Quran collection
export const getRandomVerse = async () => {
  try {
    // Get all verses to select from
    const allVerses = await getAllQuranVerses();

    if (allVerses.length === 0) {
      return null;
    }

    // Get a random verse from all available verses
    const randomIndex = Math.floor(Math.random() * allVerses.length);
    const randomVerse = allVerses[randomIndex];

    return randomVerse;
  } catch (error) {
    console.error('Error fetching random verse:', error);
    return null;
  }
};

// Get user's Quran reading progress
export const getUserQuranProgress = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return {
        readVerses: 0,
        totalVerses: 6236, // Total verses in Quran
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null,
      };
    }
    
    const userData = userDoc.data();
    
    // Get user's reading history for streak calculation
    const readingHistoryQuery = query(
      collection(db, 'userVerseReads'),
      where('userId', '==', userId),
      orderBy('readAt', 'desc'),
      limit(30) // Last 30 days for streak calculation
    );
    
    const readingHistorySnapshot = await getDocs(readingHistoryQuery);
    const readingHistory = readingHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      readAt: doc.data().readAt?.toDate?.() || new Date(doc.data().readAt),
    }));
    
    // Calculate current streak
    const currentStreak = calculateCurrentStreak(readingHistory);
    const longestStreak = calculateLongestStreak(readingHistory);
    
    // Safely get read verses count
    let readVersesCount = 0;
    if (userData.readVersesCount) {
      readVersesCount = userData.readVersesCount;
    } else if (Array.isArray(userData.readVerses)) {
      readVersesCount = userData.readVerses.length;
    }

    return {
      readVerses: readVersesCount,
      totalVerses: 6236,
      currentStreak,
      longestStreak,
      lastReadDate: readingHistory.length > 0 ? readingHistory[0].readAt : null,
    };
  } catch (error) {
    console.error('Error fetching user Quran progress:', error);
    return {
      readVerses: 0,
      totalVerses: 6236,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
    };
  }
};

// Mark a verse as read
export const markVerseAsRead = async (userId: string, verseId: string, verseData: any) => {
  try {
    // Add to user's reading history
    await addDoc(collection(db, 'userVerseReads'), {
      userId,
      verseId,
      verseData,
      readAt: serverTimestamp(),
    });
    
    // Update user's total read verses count
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentReadVerses = userData.readVerses;

      // Ensure currentReadVerses is an array
      const readVersesArray = Array.isArray(currentReadVerses) ? currentReadVerses : [];

      // Only update if verse hasn't been read before
      if (!readVersesArray.includes(verseId)) {
        await updateDoc(userRef, {
          readVerses: arrayUnion(verseId),
          readVersesCount: readVersesArray.length + 1,
        });
      }
    } else {
      // Create initial data for new user
      await updateDoc(userRef, {
        readVerses: [verseId],
        readVersesCount: 1,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error marking verse as read:', error);
    throw error;
  }
};

// Check if user has read a specific verse
export const hasUserReadVerse = async (userId: string, verseId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const readVerses = userData.readVerses;

    // Ensure readVerses is an array before using includes
    if (!Array.isArray(readVerses)) {
      return false;
    }

    return readVerses.includes(verseId);
  } catch (error) {
    console.error('Error checking if verse is read:', error);
    return false;
  }
};

// Get user's read verses for a specific date range
export const getUserReadVerses = async (userId: string, startDate?: Date, endDate?: Date) => {
  try {
    let readingQuery = query(
      collection(db, 'userVerseReads'),
      where('userId', '==', userId),
      orderBy('readAt', 'desc')
    );
    
    if (startDate && endDate) {
      readingQuery = query(
        collection(db, 'userVerseReads'),
        where('userId', '==', userId),
        where('readAt', '>=', startDate),
        where('readAt', '<=', endDate),
        orderBy('readAt', 'desc')
      );
    }
    
    const readingSnapshot = await getDocs(readingQuery);
    const readVerses = [];
    
    readingSnapshot.forEach((doc) => {
      const data = doc.data();
      readVerses.push({
        id: doc.id,
        ...data,
        readAt: data.readAt?.toDate?.() || new Date(data.readAt),
      });
    });
    
    return readVerses;
  } catch (error) {
    console.error('Error fetching user read verses:', error);
    return [];
  }
};

// Helper function to calculate current reading streak
const calculateCurrentStreak = (readingHistory: any[]): number => {
  if (readingHistory.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Group readings by date
  const readingsByDate = new Map();
  readingHistory.forEach(reading => {
    const date = new Date(reading.readAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.getTime();
    
    if (!readingsByDate.has(dateKey)) {
      readingsByDate.set(dateKey, true);
    }
  });
  
  // Calculate streak from today backwards
  let currentDate = new Date(today);
  
  while (readingsByDate.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
};

// Helper function to calculate longest reading streak
const calculateLongestStreak = (readingHistory: any[]): number => {
  if (readingHistory.length === 0) return 0;
  
  // Group readings by date
  const readingsByDate = new Map();
  readingHistory.forEach(reading => {
    const date = new Date(reading.readAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.getTime();
    
    if (!readingsByDate.has(dateKey)) {
      readingsByDate.set(dateKey, true);
    }
  });
  
  const sortedDates = Array.from(readingsByDate.keys()).sort((a, b) => a - b);
  
  let longestStreak = 0;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currentDate = new Date(sortedDates[i]);
    
    // Check if dates are consecutive
    const dayDifference = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDifference === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  return Math.max(longestStreak, currentStreak);
};

// Get all Quran verses (loads ALL 6236 verses from database)
export const getAllQuranVerses = async () => {
  try {
    console.log('🔄 Loading ALL Quran verses from database...');

    // Try different query strategies to handle various database schemas
    let versesSnapshot;
    let verses = [];

    try {
      // Strategy 1: Try with surahNumber field (most accurate)
      console.log('📋 Attempting to load with surahNumber ordering...');
      const versesQuery1 = query(
        collection(db, 'quranVerses'),
        orderBy('surahNumber', 'asc'),
        orderBy('ayah', 'asc')
      );
      versesSnapshot = await getDocs(versesQuery1);
      console.log(`✅ Found ${versesSnapshot.size} verses using surahNumber`);
    } catch (error) {
      console.log('⚠️ surahNumber field not found, trying alternative...');

      try {
        // Strategy 2: Try with 'surah' field as number
        console.log('📋 Attempting to load with surah field ordering...');
        const versesQuery2 = query(
          collection(db, 'quranVerses'),
          orderBy('surah', 'asc'),
          orderBy('ayah', 'asc')
        );
        versesSnapshot = await getDocs(versesQuery2);
        console.log(`✅ Found ${versesSnapshot.size} verses using surah field`);
      } catch (error2) {
        console.log('⚠️ Ordered query failed, loading all verses without ordering...');

        // Strategy 3: Load all without ordering (will sort client-side)
        const versesQuery3 = query(collection(db, 'quranVerses'));
        versesSnapshot = await getDocs(versesQuery3);
        console.log(`✅ Found ${versesSnapshot.size} verses without ordering`);
      }
    }

    // Process all verses
    versesSnapshot.forEach((doc) => {
      const data = doc.data();
      verses.push({
        id: doc.id,
        ...data,
        // Normalize field names for consistent sorting
        surahNumber: data.surahNumber || data.surah || 1,
        ayah: data.ayah || data.verseNumber || 1,
      });
    });

    console.log(`📊 Loaded ${verses.length} verses from database`);

    // Remove duplicates and sort verses properly
    if (verses.length > 0) {
      console.log('🔄 Removing duplicates and sorting verses...');

      // Remove duplicates based on surah and ayah combination
      const uniqueVerses = [];
      const seenVerses = new Set();

      for (const verse of verses) {
        const surahNum = Number(verse.surahNumber) || Number(verse.surah) || 1;
        const ayahNum = Number(verse.ayah) || Number(verse.verseNumber) || 1;
        const key = `${surahNum}-${ayahNum}`;

        if (!seenVerses.has(key)) {
          seenVerses.add(key);
          uniqueVerses.push({
            ...verse,
            surahNumber: surahNum,
            ayah: ayahNum
          });
        } else {
          console.log(`🗑️ Removing duplicate: Surah ${surahNum}, Ayah ${ayahNum}`);
        }
      }

      console.log(`📊 Removed ${verses.length - uniqueVerses.length} duplicates. ${uniqueVerses.length} unique verses remaining.`);
      verses = uniqueVerses;

      // Sort the unique verses in correct Quran order
      verses.sort((a, b) => {
        // First sort by surah number
        if (a.surahNumber !== b.surahNumber) {
          return a.surahNumber - b.surahNumber;
        }

        // Then sort by verse number within the same surah
        return a.ayah - b.ayah;
      });

      // Verify first and last verses
      const firstVerse = verses[0];
      const lastVerse = verses[verses.length - 1];

      console.log('🎯 First verse:', {
        surah: firstVerse.surahNumber || firstVerse.surah,
        ayah: firstVerse.ayah,
        text: firstVerse.arabic?.substring(0, 30) + '...'
      });

      console.log('🏁 Last verse:', {
        surah: lastVerse.surahNumber || lastVerse.surah,
        ayah: lastVerse.ayah,
        text: lastVerse.arabic?.substring(0, 30) + '...'
      });

      // Validate that we start with Al-Fatiha
      const firstSurah = Number(firstVerse.surahNumber) || Number(firstVerse.surah);
      const firstAyah = Number(firstVerse.ayah);

      if (firstSurah !== 1 || firstAyah !== 1) {
        console.error('❌ ERROR: First verse is not Al-Fatiha 1:1!', {
          actualSurah: firstSurah,
          actualAyah: firstAyah,
          expected: 'Surah 1, Ayah 1'
        });
      } else {
        console.log('✅ Verified: Starting with Al-Fatiha 1:1');
      }
    }

    // Fix Al-Fatiha sequence if needed
    if (verses.length > 0) {
      verses = ensureCorrectAlFatiha(verses);
    }

    // Validate verse sequence
    if (verses.length > 0) {
      console.log('🔍 Validating verse sequence...');
      validateVerseSequence(verses);
    }

    console.log(`🎉 Successfully loaded and sorted ${verses.length} Quran verses`);
    return verses;

  } catch (error) {
    console.error('❌ Error fetching all Quran verses:', error);
    return [];
  }
};

// Validate that verses are in correct sequence
const validateVerseSequence = (verses: any[]) => {
  let issues = 0;

  // Check first 10 verses for proper sequence
  console.log('🔍 Checking first 10 verses sequence after duplicate removal:');
  for (let i = 0; i < Math.min(10, verses.length); i++) {
    const verse = verses[i];
    const surah = verse.surahNumber;
    const ayah = verse.ayah;

    console.log(`  ${i}: Surah ${surah}, Ayah ${ayah} - ${verse.arabic?.substring(0, 40)}...`);

    // Check if this matches expected sequence
    if (i === 0 && (surah !== 1 || ayah !== 1)) {
      console.error(`❌ First verse should be Surah 1, Ayah 1, but got Surah ${surah}, Ayah ${ayah}`);
      issues++;
    }
  }

  // Check for any remaining duplicates in first 20 verses (should be none after deduplication)
  const first20 = verses.slice(0, Math.min(20, verses.length));
  const duplicateKeys = new Set();
  const duplicates = [];

  for (const verse of first20) {
    const key = `${verse.surahNumber}-${verse.ayah}`;
    if (duplicateKeys.has(key)) {
      duplicates.push(verse);
    } else {
      duplicateKeys.add(key);
    }
  }

  if (duplicates.length > 0) {
    console.error(`❌ Still found ${duplicates.length} duplicate verses after deduplication!`);
    issues++;
  } else {
    console.log('✅ No duplicates found in first 20 verses');
  }

  // Check Al-Fatiha sequence (should be verses 0-6)
  console.log('🔍 Validating Al-Fatiha sequence (verses 1:1 to 1:7):');
  const fatihaVerses = verses.slice(0, Math.min(7, verses.length));
  let fatihaIssues = 0;

  for (let i = 0; i < fatihaVerses.length; i++) {
    const verse = fatihaVerses[i];
    const expectedAyah = i + 1;

    console.log(`  Al-Fatiha ${i + 1}: Expected Surah 1, Ayah ${expectedAyah} | Got Surah ${verse.surahNumber}, Ayah ${verse.ayah}`);

    if (verse.surahNumber !== 1 || verse.ayah !== expectedAyah) {
      console.error(`❌ Al-Fatiha verse ${i + 1} should be Surah 1, Ayah ${expectedAyah}, but got Surah ${verse.surahNumber}, Ayah ${verse.ayah}`);
      fatihaIssues++;
    }
  }

  if (fatihaIssues === 0) {
    console.log('✅ Al-Fatiha sequence is correct');
  } else {
    console.error(`❌ Found ${fatihaIssues} issues in Al-Fatiha sequence`);
    issues += fatihaIssues;
  }

  // Check if we have a reasonable number of verses
  if (verses.length < 100) {
    console.error(`❌ Only ${verses.length} verses found. Expected thousands.`);
    issues++;
  } else if (verses.length > 7000) {
    console.error(`❌ Too many verses: ${verses.length}. Expected around 6236.`);
    issues++;
  } else {
    console.log(`✅ Reasonable verse count: ${verses.length}`);
  }

  if (issues === 0) {
    console.log('✅ Verse sequence validation passed');
  } else {
    console.error(`❌ Found ${issues} issues in verse sequence`);
  }

  return issues === 0;
};

// Fix Al-Fatiha sequence by ensuring we have the correct verses
const ensureCorrectAlFatiha = (verses: any[]) => {
  console.log('🔧 Ensuring correct Al-Fatiha sequence...');

  // Correct Al-Fatiha verses
  const correctAlFatiha = [
    {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      surah: 'Al-Fatiha',
      surahAr: 'الفاتحة',
      ayah: 1,
      surahNumber: 1,
      verseNumber: 1,
      reference: 'الفاتحة: 1',
      juzNumber: 1,
      globalIndex: 0
    },
    {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      translation: '[All] praise is [due] to Allah, Lord of the worlds -',
      surah: 'Al-Fatiha',
      surahAr: 'الفاتحة',
      ayah: 2,
      surahNumber: 1,
      verseNumber: 2,
      reference: 'الفاتحة: 2',
      juzNumber: 1,
      globalIndex: 1
    },
    {
      arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
      translation: 'The Entirely Merciful, the Especially Merciful,',
      surah: 'Al-Fatiha',
      surahAr: 'الفاتحة',
      ayah: 3,
      surahNumber: 1,
      verseNumber: 3,
      reference: 'الفاتحة: 3',
      juzNumber: 1,
      globalIndex: 2
    },
    {
      arabic: 'مَالِكِ يَوْمِ الدِّينِ',
      translation: 'Sovereign of the Day of Recompense.',
      surah: 'Al-Fatiha',
      surahAr: 'الفاتحة',
      ayah: 4,
      surahNumber: 1,
      verseNumber: 4,
      reference: 'الفاتحة: 4',
      juzNumber: 1,
      globalIndex: 3
    },
    {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translation: 'It is You we worship and You we ask for help.',
      surah: 'Al-Fatiha',
      surahAr: 'الفاتحة',
      ayah: 5,
      surahNumber: 1,
      verseNumber: 5,
      reference: 'الفاتحة: 5',
      juzNumber: 1,
      globalIndex: 4
    },
    {
      arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      translation: 'Guide us to the straight path -',
      surah: 'Al-Fatiha',
      surahAr: 'الفاتحة',
      ayah: 6,
      surahNumber: 1,
      verseNumber: 6,
      reference: 'الفاتحة: 6',
      juzNumber: 1,
      globalIndex: 5
    },
    {
      arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
      surah: 'Al-Fatiha',
      surahAr: 'الفاتحة',
      ayah: 7,
      surahNumber: 1,
      verseNumber: 7,
      reference: 'الفاتحة: 7',
      juzNumber: 1,
      globalIndex: 6
    }
  ];

  // Check if we have correct Al-Fatiha sequence
  let needsFix = false;
  for (let i = 0; i < 7 && i < verses.length; i++) {
    const verse = verses[i];
    if (verse.surahNumber !== 1 || verse.ayah !== (i + 1)) {
      needsFix = true;
      break;
    }
  }

  if (needsFix) {
    console.log('🔧 Fixing Al-Fatiha sequence...');

    // Remove any existing Al-Fatiha verses
    const nonFatihaVerses = verses.filter(v => v.surahNumber !== 1);

    // Add correct Al-Fatiha at the beginning
    const fixedVerses = [...correctAlFatiha, ...nonFatihaVerses];

    console.log(`✅ Fixed Al-Fatiha sequence. Total verses: ${fixedVerses.length}`);
    return fixedVerses;
  }

  console.log('✅ Al-Fatiha sequence is already correct');
  return verses;
};

// Save user's current reading position
export const saveCurrentReadingPosition = async (userId: string, currentVerseIndex: number) => {
  try {
    const position = getVersePosition(currentVerseIndex);
    const progressPercentage = calculateReadingProgress(currentVerseIndex);

    const readingPosition: QuranReadingPosition = {
      userId,
      currentVerseIndex,
      currentJuz: position.juzNumber,
      currentSurah: position.surahNumber,
      currentSurahName: position.surahName,
      currentSurahNameAr: position.surahNameAr,
      lastReadAt: new Date(),
      progressPercentage,
    };

    await setDoc(doc(db, 'userReadingPositions', userId), readingPosition);
    console.log('Saved reading position:', readingPosition);
    return true;
  } catch (error) {
    console.error('Error saving reading position:', error);
    throw error;
  }
};

// Get user's current reading position
export const getCurrentReadingPosition = async (userId: string): Promise<QuranReadingPosition | null> => {
  try {
    const positionDoc = await getDoc(doc(db, 'userReadingPositions', userId));

    if (!positionDoc.exists()) {
      // Return default position (start from Al-Fatiha)
      return {
        userId,
        currentVerseIndex: 0,
        currentJuz: 1,
        currentSurah: 1,
        currentSurahName: 'Al-Fatiha',
        currentSurahNameAr: 'الفاتحة',
        lastReadAt: new Date(),
        progressPercentage: 0,
      };
    }

    const data = positionDoc.data() as QuranReadingPosition;
    // Convert Firestore timestamp to Date if needed
    if (data.lastReadAt && typeof data.lastReadAt !== 'object') {
      data.lastReadAt = new Date(data.lastReadAt);
    }

    return data;
  } catch (error) {
    console.error('Error fetching reading position:', error);
    return null;
  }
};

// Reset user's reading position to the beginning
export const resetReadingPosition = async (userId: string) => {
  try {
    const defaultPosition: QuranReadingPosition = {
      userId,
      currentVerseIndex: 0,
      currentJuz: 1,
      currentSurah: 1,
      currentSurahName: 'Al-Fatiha',
      currentSurahNameAr: 'الفاتحة',
      lastReadAt: new Date(),
      progressPercentage: 0,
    };

    await setDoc(doc(db, 'userReadingPositions', userId), defaultPosition);
    console.log('Reset reading position to beginning');
    return true;
  } catch (error) {
    console.error('Error resetting reading position:', error);
    throw error;
  }
};

// Update reading position when user navigates to a specific verse
export const updateReadingPosition = async (userId: string, newVerseIndex: number) => {
  try {
    await saveCurrentReadingPosition(userId, newVerseIndex);
    return true;
  } catch (error) {
    console.error('Error updating reading position:', error);
    throw error;
  }
};

// Check if database has all Quran verses and provide diagnostics
export const ensureAllQuranVersesExist = async () => {
  try {
    const verses = await getAllQuranVerses();
    console.log(`📊 Database contains ${verses.length} verses`);

    if (verses.length < 6000) { // If we don't have close to all verses
      console.log('⚠️ Database appears to be missing verses. Expected ~6236 verses.');

      // Check if we have Al-Fatiha (first verse)
      const firstVerse = verses.find(v =>
        (Number(v.surahNumber) === 1 || Number(v.surah) === 1) &&
        (Number(v.ayah) === 1 || Number(v.verseNumber) === 1)
      );

      if (!firstVerse) {
        console.log('❌ Al-Fatiha verse 1 not found in database!');
      } else {
        console.log('✅ Found Al-Fatiha verse 1:', {
          id: firstVerse.id,
          arabic: firstVerse.arabic?.substring(0, 50) + '...'
        });
      }

      return false; // Database needs population
    }

    console.log('✅ Database has sufficient verses');
    return true; // Database has sufficient verses
  } catch (error) {
    console.error('❌ Error checking Quran verses:', error);
    return false;
  }
};

// Add sample Al-Fatiha verses if database is empty (for testing)
export const addSampleAlFatihaVerses = async () => {
  try {
    console.log('🔄 Adding sample Al-Fatiha verses...');

    const alFatihaVerses = [
      {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 1,
        surahNumber: 1,
        verseNumber: 1,
        reference: 'الفاتحة: 1',
        juzNumber: 1,
        globalIndex: 0
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: '[All] praise is [due] to Allah, Lord of the worlds -',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 2,
        surahNumber: 1,
        verseNumber: 2,
        reference: 'الفاتحة: 2',
        juzNumber: 1,
        globalIndex: 1
      },
      {
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'The Entirely Merciful, the Especially Merciful,',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 3,
        surahNumber: 1,
        verseNumber: 3,
        reference: 'الفاتحة: 3',
        juzNumber: 1,
        globalIndex: 2
      },
      {
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        translation: 'Sovereign of the Day of Recompense.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 4,
        surahNumber: 1,
        verseNumber: 4,
        reference: 'الفاتحة: 4',
        juzNumber: 1,
        globalIndex: 3
      },
      {
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'It is You we worship and You we ask for help.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 5,
        surahNumber: 1,
        verseNumber: 5,
        reference: 'الفاتحة: 5',
        juzNumber: 1,
        globalIndex: 4
      },
      {
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Guide us to the straight path -',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 6,
        surahNumber: 1,
        verseNumber: 6,
        reference: 'الفاتحة: 6',
        juzNumber: 1,
        globalIndex: 5
      },
      {
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 7,
        surahNumber: 1,
        verseNumber: 7,
        reference: 'الفاتحة: 7',
        juzNumber: 1,
        globalIndex: 6
      }
    ];

    for (const verse of alFatihaVerses) {
      await addDoc(collection(db, 'quranVerses'), verse);
      console.log(`✅ Added Al-Fatiha verse ${verse.ayah}`);
    }

    console.log('🎉 Successfully added Al-Fatiha verses');
    return true;
  } catch (error) {
    console.error('❌ Error adding Al-Fatiha verses:', error);
    return false;
  }
};
