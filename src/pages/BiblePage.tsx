import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import BibleNavigationControls from '../components/BibleNavigationControls';
import BibleProgressIndicator from '../components/BibleProgressIndicator';
import BibleVerseDisplay from '../components/BibleVerseDisplay';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
    getBibleVerseByIndex,
    getBibleVersesCount,
    getCurrentBibleReadingPosition,
    getUserBibleProgress,
    hasUserReadBibleVerse,
    markBibleVerseAsRead,
    getNextBibleVerse,
    getPreviousBibleVerse,
    resetBibleReadingPosition,
    updateBibleReadingPosition,
    BibleVerse,
    BibleProgress,
    BibleReadingPosition
} from '../firebase';

const BiblePage: React.FC = () => {
  const { language } = useLanguage();
  const { markVerseRead } = useGame();
  const { user } = useAuth();
  
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [readVerses, setReadVerses] = useState<Set<string>>(new Set());
  const [totalVerses, setTotalVerses] = useState(31102);
  const [progress, setProgress] = useState<BibleProgress>({
    readVerses: 0,
    totalVerses: 31102,
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null,
    currentVerseIndex: 0,
    progressPercentage: 0,
  });
  const [currentPosition, setCurrentPosition] = useState<BibleReadingPosition>({
    userId: user?.id || '',
    currentVerseIndex: 0,
    currentBook: 1,
    currentBookName: 'Genesis',
    currentBookNameAr: 'سفر التكوين',
    currentChapter: 1,
    lastReadAt: new Date(),
    progressPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [navigationLoading, setNavigationLoading] = useState(false);

  // Load a single verse by index
  const loadVerse = useCallback(async (verseIndex: number) => {
    if (verseIndex < 0) return null;

    try {
      setNavigationLoading(true);
      
      // Get verse by index (lazy loading)
      const verse = await getBibleVerseByIndex(verseIndex);
      
      if (verse) {
        setCurrentVerse(verse);
        setCurrentVerseIndex(verseIndex);

        const progressPercentage = (verseIndex / totalVerses) * 100;

        const newPosition: BibleReadingPosition = {
          userId: user?.id || '',
          currentVerseIndex: verseIndex,
          currentBook: verse.bookNumber,
          currentBookName: verse.book,
          currentBookNameAr: verse.bookAr,
          currentChapter: verse.chapter,
          lastReadAt: new Date(),
          progressPercentage,
        };

        setCurrentPosition(newPosition);
        setProgress(prev => ({
          ...prev,
          currentVerseIndex: verseIndex,
          progressPercentage,
          currentBook: verse.bookNumber,
          currentBookName: verse.book,
          currentBookNameAr: verse.bookAr,
          currentChapter: verse.chapter,
        }));

        // Check if this verse is read (only for current verse)
        if (user?.id) {
          const isRead = await hasUserReadBibleVerse(user.id, verse.id);
          if (isRead) {
            setReadVerses(prev => new Set([...prev, verse.id]));
          }
        }

        // Save position
        if (user?.id) {
          await updateBibleReadingPosition(user.id, verseIndex, verse);
        }
      }

      return verse;
    } catch (error) {
      console.error('Error loading verse:', error);
      return null;
    } finally {
      setNavigationLoading(false);
    }
  }, [user?.id, totalVerses]);

  const saveCurrentPosition = useCallback(async (verseIndex: number, verse: BibleVerse) => {
    if (user?.id && verse) {
      try {
        await updateBibleReadingPosition(user.id, verseIndex, verse);
      } catch (error) {
        console.error('Error saving reading position:', error);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    const initializeBibleData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get total count (only once)
        const count = await getBibleVersesCount();
        setTotalVerses(count);

        // Get user's position
        const userPosition = await getCurrentBibleReadingPosition(user.id);
        const targetIndex = userPosition?.currentVerseIndex || 0;

        // Get user's progress
        const userProgress = await getUserBibleProgress(user.id);
        setProgress(prev => ({
          ...prev,
          ...userProgress,
          totalVerses: count,
        }));

        // Load only the current verse (lazy loading)
        await loadVerse(targetIndex);
      } catch (error) {
        console.error('Error loading Bible data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeBibleData();
  }, [user?.id, loadVerse]);

  const handleNext = useCallback(async () => {
    if (navigationLoading || !currentVerse) return;

    try {
      setNavigationLoading(true);
      
      // Get next verse using lazy loading
      const nextVerse = await getNextBibleVerse(currentVerse);
      
      if (nextVerse) {
        const nextIndex = currentVerseIndex + 1;
        setCurrentVerse(nextVerse);
        setCurrentVerseIndex(nextIndex);

        const progressPercentage = (nextIndex / totalVerses) * 100;

        const newPosition: BibleReadingPosition = {
          userId: user?.id || '',
          currentVerseIndex: nextIndex,
          currentBook: nextVerse.bookNumber,
          currentBookName: nextVerse.book,
          currentBookNameAr: nextVerse.bookAr,
          currentChapter: nextVerse.chapter,
          lastReadAt: new Date(),
          progressPercentage,
        };

        setCurrentPosition(newPosition);
        setProgress(prev => ({
          ...prev,
          currentVerseIndex: nextIndex,
          progressPercentage,
          currentBook: nextVerse.bookNumber,
          currentBookName: nextVerse.book,
          currentBookNameAr: nextVerse.bookAr,
          currentChapter: nextVerse.chapter,
        }));

        // Check if read
        if (user?.id) {
          const isRead = await hasUserReadBibleVerse(user.id, nextVerse.id);
          if (isRead) {
            setReadVerses(prev => new Set([...prev, nextVerse.id]));
          }
        }

        // Save position
        await saveCurrentPosition(nextIndex, nextVerse);
      }
    } catch (error) {
      console.error('Error loading next verse:', error);
    } finally {
      setNavigationLoading(false);
    }
  }, [currentVerse, currentVerseIndex, navigationLoading, user?.id, totalVerses, saveCurrentPosition]);

  const handlePrevious = useCallback(async () => {
    if (navigationLoading || !currentVerse || currentVerseIndex <= 0) return;

    try {
      setNavigationLoading(true);
      
      // Get previous verse using lazy loading
      const prevVerse = await getPreviousBibleVerse(currentVerse);
      
      if (prevVerse) {
        const prevIndex = currentVerseIndex - 1;
        setCurrentVerse(prevVerse);
        setCurrentVerseIndex(prevIndex);

        const progressPercentage = (prevIndex / totalVerses) * 100;

        const newPosition: BibleReadingPosition = {
          userId: user?.id || '',
          currentVerseIndex: prevIndex,
          currentBook: prevVerse.bookNumber,
          currentBookName: prevVerse.book,
          currentBookNameAr: prevVerse.bookAr,
          currentChapter: prevVerse.chapter,
          lastReadAt: new Date(),
          progressPercentage,
        };

        setCurrentPosition(newPosition);
        setProgress(prev => ({
          ...prev,
          currentVerseIndex: prevIndex,
          progressPercentage,
          currentBook: prevVerse.bookNumber,
          currentBookName: prevVerse.book,
          currentBookNameAr: prevVerse.bookAr,
          currentChapter: prevVerse.chapter,
        }));

        // Check if read
        if (user?.id) {
          const isRead = await hasUserReadBibleVerse(user.id, prevVerse.id);
          if (isRead) {
            setReadVerses(prev => new Set([...prev, prevVerse.id]));
          }
        }

        // Save position
        await saveCurrentPosition(prevIndex, prevVerse);
      }
    } catch (error) {
      console.error('Error loading previous verse:', error);
    } finally {
      setNavigationLoading(false);
    }
  }, [currentVerse, currentVerseIndex, navigationLoading, user?.id, totalVerses, saveCurrentPosition]);

  const handleReset = useCallback(async () => {
    if (!user?.id || navigationLoading) return;
    
    try {
      setNavigationLoading(true);
      await resetBibleReadingPosition(user.id);
      setReadVerses(new Set());
      await loadVerse(0);
      setProgress(prev => ({
        ...prev,
        readVerses: 0,
        currentVerseIndex: 0,
        progressPercentage: 0,
      }));
    } catch (error) {
      console.error('Error resetting progress:', error);
    } finally {
      setNavigationLoading(false);
    }
  }, [user?.id, navigationLoading, loadVerse]);

  const handleJumpToVerse = useCallback(async (verseIndex: number) => {
    if (verseIndex >= 0 && verseIndex < totalVerses && !navigationLoading) {
      await loadVerse(verseIndex);
    }
  }, [totalVerses, navigationLoading, loadVerse]);

  const handleMarkAsRead = useCallback(async () => {
    if (!user?.id || !currentVerse || readVerses.has(currentVerse.id)) return;

    try {
      await markBibleVerseAsRead(user.id, currentVerse.id, currentVerse);
      setReadVerses(prev => new Set([...prev, currentVerse.id]));
      setProgress(prev => ({
        ...prev,
        readVerses: prev.readVerses + 1,
      }));
      markVerseRead();
    } catch (error) {
      console.error('Error marking verse as read:', error);
    }
  }, [user?.id, currentVerse, readVerses, markVerseRead]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'جاري تحميل الكتاب المقدس...' : 'Loading the Holy Bible...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'الكتاب المقدس' : 'The Holy Bible'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar'
            ? 'اقرأ الكتاب المقدس من البداية إلى النهاية'
            : 'Read the Holy Bible from beginning to end'
          }
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {currentVerse && (
            <BibleVerseDisplay
              verse={currentVerse}
              isRead={readVerses.has(currentVerse.id)}
              onMarkAsRead={handleMarkAsRead}
              loading={navigationLoading}
            />
          )}

          <BibleNavigationControls
            canGoNext={currentVerseIndex < totalVerses - 1}
            canGoPrevious={currentVerseIndex > 0}
            currentVerseIndex={currentVerseIndex}
            totalVerses={totalVerses}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onReset={handleReset}
            onJumpToVerse={handleJumpToVerse}
            loading={navigationLoading}
          />
        </div>

        <div className="lg:col-span-1">
          <BibleProgressIndicator
            progress={progress}
            currentPosition={currentPosition}
            readVerses={readVerses}
            totalReadToday={0}
            streak={progress.currentStreak}
          />
        </div>
      </div>
    </div>
  );
};

export default BiblePage;

