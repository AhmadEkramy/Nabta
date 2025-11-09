import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import QuranNavigationControls from '../components/QuranNavigationControls';
import QuranProgressIndicator from '../components/QuranProgressIndicator';
import QuranVerseDisplay from '../components/QuranVerseDisplay';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
    getAllQuranVerses,
    getCurrentReadingPosition,
    getUserQuranProgress,
    hasUserReadVerse,
    markVerseAsRead,
    resetReadingPosition,
    updateReadingPosition
} from '../firebase';
import { DailyVerse, QuranProgress, QuranReadingPosition, VerseDisplayInfo } from '../types';
import {
    calculateReadingProgress,
    getJuzInfo,
    getSurahInfo,
    getVersePosition,
    TOTAL_QURAN_VERSES
} from '../utils/quranData';

const QuranPage: React.FC = () => {
  const { language } = useLanguage();
  const { markVerseRead } = useGame();
  const { user } = useAuth();
  
  // State management
  const [allVerses, setAllVerses] = useState<DailyVerse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentVerse, setCurrentVerse] = useState<DailyVerse | null>(null);
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [progress, setProgress] = useState<QuranProgress>({
    readVerses: 0,
    totalVerses: TOTAL_QURAN_VERSES,
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null,
    currentVerseIndex: 0,
    progressPercentage: 0,
  });
  const [currentPosition, setCurrentPosition] = useState<QuranReadingPosition>({
    userId: user?.id || '',
    currentVerseIndex: 0,
    currentJuz: 1,
    currentSurah: 1,
    currentSurahName: 'Al-Fatiha',
    currentSurahNameAr: 'الفاتحة',
    lastReadAt: new Date(),
    progressPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [navigationLoading, setNavigationLoading] = useState(false);

  // Update current verse based on index
  const updateCurrentVerse = useCallback((verseIndex: number) => {
    if (allVerses.length > 0 && verseIndex >= 0 && verseIndex < allVerses.length) {
      const verse = allVerses[verseIndex];
      setCurrentVerse(verse);
      setCurrentVerseIndex(verseIndex);

      // Update position information
      const position = getVersePosition(verseIndex);
      const progressPercentage = calculateReadingProgress(verseIndex);

      const newPosition: QuranReadingPosition = {
        userId: user?.id || '',
        currentVerseIndex: verseIndex,
        currentJuz: position.juzNumber,
        currentSurah: position.surahNumber,
        currentSurahName: position.surahName,
        currentSurahNameAr: position.surahNameAr,
        lastReadAt: new Date(),
        progressPercentage,
      };

      setCurrentPosition(newPosition);
      setProgress(prev => ({
        ...prev,
        currentVerseIndex: verseIndex,
        progressPercentage,
        currentJuz: position.juzNumber,
        currentSurah: position.surahNumber,
        currentSurahName: position.surahName,
        currentSurahNameAr: position.surahNameAr,
      }));
    }
  }, [allVerses, user?.id]);

  // Save position to Firebase (separate function to avoid infinite loops)
  const saveCurrentPosition = useCallback(async (verseIndex: number) => {
    if (user?.id) {
      try {
        await updateReadingPosition(user.id, verseIndex);
      } catch (error) {
        console.error('Error saving reading position:', error);
      }
    }
  }, [user?.id]);

  // Initialize Quran data and user position
  useEffect(() => {
    const initializeQuranData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Load all Quran verses from database (already sorted)
        const verses = await getAllQuranVerses();
        console.log(`📊 Loaded ${verses.length} Quran verses from database`);

        if (verses.length > 0) {
          // Verses are already sorted in getAllQuranVerses function
          setAllVerses(verses);

          // Verify the first verse is Al-Fatiha
          const firstVerse = verses[0];
          console.log('🎯 First verse:', {
            id: firstVerse.id,
            surah: firstVerse.surah,
            surahNumber: firstVerse.surahNumber,
            ayah: firstVerse.ayah,
            arabic: firstVerse.arabic?.substring(0, 50) + '...'
          });

          // Debug: Check first few verses for duplicates
          console.log('🔍 First 5 verses:');
          for (let i = 0; i < Math.min(5, verses.length); i++) {
            const verse = verses[i];
            console.log(`  ${i}: Surah ${verse.surahNumber || verse.surah}, Ayah ${verse.ayah} - ${verse.arabic?.substring(0, 30)}...`);
          }

          // Check for duplicate Bismillah verses
          const bismillahVerses = verses.filter(v =>
            v.arabic?.includes('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')
          );
          console.log(`🔍 Found ${bismillahVerses.length} verses containing Bismillah`);

          // Verify we start from Al-Fatiha (Surah 1, Verse 1)
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

          // Get user's current reading position
          const userPosition = await getCurrentReadingPosition(user.id);
          const targetIndex = userPosition?.currentVerseIndex || 0;

          // Set current verse directly without using updateCurrentVerse to avoid circular dependency
          if (verses[targetIndex]) {
            const verse = verses[targetIndex];
            setCurrentVerse(verse);
            setCurrentVerseIndex(targetIndex);

            // Update position information
            const position = getVersePosition(targetIndex);
            const progressPercentage = calculateReadingProgress(targetIndex);

            const newPosition: QuranReadingPosition = {
              userId: user.id,
              currentVerseIndex: targetIndex,
              currentJuz: position.juzNumber,
              currentSurah: position.surahNumber,
              currentSurahName: position.surahName,
              currentSurahNameAr: position.surahNameAr,
              lastReadAt: new Date(),
              progressPercentage,
            };

            setCurrentPosition(newPosition);
          }

          // Load user's progress
          const userProgress = await getUserQuranProgress(user.id);
          setProgress(prev => ({
            ...prev,
            ...userProgress,
            currentVerseIndex: targetIndex,
            progressPercentage: userPosition?.progressPercentage || 0,
          }));

          // Check which verses user has read
          const readStatus = await Promise.all(
            verses.map(verse => hasUserReadVerse(user.id, verse.id))
          );

          const readVerseIds = verses
            .filter((_, index) => readStatus[index])
            .map(verse => verse.id);

          setReadVerses(readVerseIds);
        }

      } catch (error) {
        console.error('Error loading Quran data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeQuranData();
  }, [user?.id]); // Removed updateCurrentVerse from dependencies

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (navigationLoading) return;

    // Use actual array length instead of theoretical total
    const nextIndex = currentVerseIndex + 1;

    if (nextIndex < allVerses.length) {
      console.log(`🔄 Navigating from verse ${currentVerseIndex} to ${nextIndex} (of ${allVerses.length} total)`);

      // Debug: Show current and next verse info
      if (allVerses[currentVerseIndex] && allVerses[nextIndex]) {
        const currentVerse = allVerses[currentVerseIndex];
        const nextVerse = allVerses[nextIndex];

        console.log('📖 Current verse:', {
          index: currentVerseIndex,
          id: currentVerse.id,
          surah: currentVerse.surahNumber || currentVerse.surah,
          ayah: currentVerse.ayah,
          arabic: currentVerse.arabic?.substring(0, 30) + '...'
        });

        console.log('➡️ Next verse:', {
          index: nextIndex,
          id: nextVerse.id,
          surah: nextVerse.surahNumber || nextVerse.surah,
          ayah: nextVerse.ayah,
          arabic: nextVerse.arabic?.substring(0, 30) + '...'
        });

        // Check if verses are actually different
        if (currentVerse.arabic === nextVerse.arabic &&
            currentVerse.surahNumber === nextVerse.surahNumber &&
            currentVerse.ayah === nextVerse.ayah) {
          console.error('❌ WARNING: Next verse is identical to current verse! Possible duplicate in database.');
        }
      }

      setNavigationLoading(true);
      updateCurrentVerse(nextIndex);
      saveCurrentPosition(nextIndex);
      setTimeout(() => setNavigationLoading(false), 300);
    } else {
      console.log('📍 Already at the last verse');
    }
  }, [currentVerseIndex, navigationLoading, updateCurrentVerse, saveCurrentPosition, allVerses]);

  const handlePrevious = useCallback(async () => {
    if (navigationLoading) return;

    // Use actual array indices
    const prevIndex = currentVerseIndex - 1;

    if (prevIndex >= 0) {
      console.log(`🔄 Navigating back from verse ${currentVerseIndex} to ${prevIndex}`);
      setNavigationLoading(true);
      updateCurrentVerse(prevIndex);
      saveCurrentPosition(prevIndex);
      setTimeout(() => setNavigationLoading(false), 300);
    } else {
      console.log('📍 Already at the first verse');
    }
  }, [currentVerseIndex, navigationLoading, updateCurrentVerse, saveCurrentPosition]);

  const handleReset = useCallback(async () => {
    if (!user?.id || navigationLoading) return;
    
    try {
      setNavigationLoading(true);
      
      // Reset reading position in Firebase
      await resetReadingPosition(user.id);
      
      // Reset local state
      setReadVerses([]);
      updateCurrentVerse(0);
      setProgress(prev => ({
        ...prev,
        readVerses: 0,
        currentVerseIndex: 0,
        progressPercentage: 0,
      }));
      
      console.log('Reset reading progress to beginning');
    } catch (error) {
      console.error('Error resetting progress:', error);
    } finally {
      setTimeout(() => setNavigationLoading(false), 300);
    }
  }, [user?.id, navigationLoading, updateCurrentVerse]);

  const handleJumpToVerse = useCallback((verseIndex: number) => {
    if (verseIndex >= 0 && verseIndex < allVerses.length && !navigationLoading) {
      setNavigationLoading(true);
      updateCurrentVerse(verseIndex);
      saveCurrentPosition(verseIndex);
      setTimeout(() => setNavigationLoading(false), 300);
    }
  }, [allVerses.length, navigationLoading, updateCurrentVerse, saveCurrentPosition]);

  // Mark verse as read
  const handleMarkAsRead = useCallback(async () => {
    if (!user?.id || !currentVerse || readVerses.includes(currentVerse.id)) return;

    try {
      // Mark as read in Firebase
      await markVerseAsRead(user.id, currentVerse.id, currentVerse);

      // Update local state
      setReadVerses(prev => [...prev, currentVerse.id]);
      setProgress(prev => ({
        ...prev,
        readVerses: prev.readVerses + 1,
      }));

      // Update game context
      markVerseRead();

      console.log('Marked verse as read:', currentVerse.id);
    } catch (error) {
      console.error('Error marking verse as read:', error);
    }
  }, [user?.id, currentVerse, readVerses, markVerseRead]);

  // Create verse display info
  const createVerseDisplayInfo = useCallback((): VerseDisplayInfo | null => {
    if (!currentVerse) return null;

    const position = getVersePosition(currentVerseIndex);
    const juzInfo = getJuzInfo(position.juzNumber);
    const surahInfo = getSurahInfo(position.surahNumber);

    // Calculate progress percentages
    const overallPercentage = calculateReadingProgress(currentVerseIndex);

    // Calculate Juz progress
    const juzStartIndex = juzInfo ? getVersePosition(0).globalIndex : 0; // Simplified
    const juzProgress = juzInfo ? Math.min(100, ((currentVerseIndex - juzStartIndex) / juzInfo.totalVerses) * 100) : 0;

    // Calculate Surah progress
    const surahProgress = surahInfo ? Math.min(100, ((position.verseNumber - 1) / surahInfo.verses) * 100) : 0;

    return {
      verse: currentVerse,
      position: {
        globalIndex: currentVerseIndex,
        surahNumber: position.surahNumber,
        verseNumber: position.verseNumber,
        juzNumber: position.juzNumber,
        surahName: position.surahName,
        surahNameAr: position.surahNameAr,
      },
      navigation: {
        canGoNext: currentVerseIndex < allVerses.length - 1,
        canGoPrevious: currentVerseIndex > 0,
        isFirst: currentVerseIndex === 0,
        isLast: currentVerseIndex === allVerses.length - 1,
      },
      progress: {
        overallPercentage,
        juzPercentage: Math.max(0, juzProgress),
        surahPercentage: Math.max(0, surahProgress),
      },
    };
  }, [currentVerse, currentVerseIndex, allVerses.length]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'جاري تحميل القرآن الكريم...' : 'Loading the Holy Quran...'}
          </p>
        </div>
      </div>
    );
  }

  const verseDisplayInfo = createVerseDisplayInfo();

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'القرآن الكريم' : 'The Holy Quran'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar'
            ? 'اقرأ القرآن الكريم من البداية إلى النهاية'
            : 'Read the Holy Quran from beginning to end'
          }
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Verse Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verse Display */}
          {verseDisplayInfo && (
            <QuranVerseDisplay
              verseInfo={verseDisplayInfo}
              isRead={readVerses.includes(currentVerse?.id || '')}
              onMarkAsRead={handleMarkAsRead}
              loading={navigationLoading}
            />
          )}

          {/* Navigation Controls */}
          <QuranNavigationControls
            canGoNext={currentVerseIndex < allVerses.length - 1}
            canGoPrevious={currentVerseIndex > 0}
            currentVerseIndex={currentVerseIndex}
            totalVerses={allVerses.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onReset={handleReset}
            onJumpToVerse={handleJumpToVerse}
            loading={navigationLoading}
          />
        </div>

        {/* Sidebar - Progress Indicator */}
        <div className="lg:col-span-1">
          <QuranProgressIndicator
            progress={progress}
            currentPosition={currentPosition}
            readVerses={readVerses}
            totalReadToday={0} // TODO: Calculate today's reading
            streak={progress.currentStreak}
          />
        </div>
      </div>
    </div>
  );
};

export default QuranPage;
