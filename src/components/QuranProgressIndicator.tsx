import { motion } from 'framer-motion';
import { Award, BookOpen, Calendar, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { QuranProgress, QuranReadingPosition } from '../types';
import { getJuzInfo, getSurahInfo } from '../utils/quranData';

interface QuranProgressIndicatorProps {
  progress: QuranProgress;
  currentPosition: QuranReadingPosition;
  readVerses: string[];
  totalReadToday?: number;
  streak?: number;
}

const QuranProgressIndicator: React.FC<QuranProgressIndicatorProps> = ({
  progress,
  currentPosition,
  readVerses,
  totalReadToday = 0,
  streak = 0
}) => {
  const { language } = useLanguage();

  const currentJuzInfo = getJuzInfo(currentPosition.currentJuz);
  const currentSurahInfo = getSurahInfo(currentPosition.currentSurah);

  // Calculate Juz progress
  const juzProgress = currentJuzInfo ? 
    Math.round(((currentPosition.currentVerseIndex - (currentJuzInfo.startSurah === 1 ? 0 : 
      // Calculate verses before this Juz
      Array.from({length: currentJuzInfo.startSurah - 1}, (_, i) => 
        getSurahInfo(i + 1)?.verses || 0
      ).reduce((sum, verses) => sum + verses, 0)
    )) / currentJuzInfo.totalVerses) * 100) : 0;

  // Calculate Surah progress  
  const surahProgress = currentSurahInfo ? 
    Math.round((currentPosition.currentVerseIndex % currentSurahInfo.verses) / currentSurahInfo.verses * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {language === 'ar' ? 'تقدم القراءة' : 'Reading Progress'}
              </h3>
              <p className="text-white/80 text-sm">
                {language === 'ar' 
                  ? `${progress.readVerses} من ${progress.totalVerses} آية`
                  : `${progress.readVerses} of ${progress.totalVerses} verses`
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {progress.progressPercentage?.toFixed(1) || '0.0'}%
            </div>
            <div className="text-white/80 text-sm">
              {language === 'ar' ? 'مكتمل' : 'Complete'}
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-2">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress.progressPercentage || 0}%` }}
          ></div>
        </div>
      </motion.div>

      {/* Current Position Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'الموقع الحالي' : 'Current Position'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Juz */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {language === 'ar' ? 'الجزء الحالي' : 'Current Juz'}
              </span>
              <span className="text-xs text-blue-500">
                {juzProgress}%
              </span>
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1">
              {language === 'ar' 
                ? `الجزء ${currentPosition.currentJuz}`
                : `Juz ${currentPosition.currentJuz}`
              }
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {currentJuzInfo?.nameAr && language === 'ar' 
                ? currentJuzInfo.nameAr 
                : currentJuzInfo?.name || ''
              }
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${juzProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Surah */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {language === 'ar' ? 'السورة الحالية' : 'Current Surah'}
              </span>
              <span className="text-xs text-purple-500">
                {surahProgress}%
              </span>
            </div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-1">
              {language === 'ar' 
                ? currentPosition.currentSurahNameAr
                : currentPosition.currentSurahName
              }
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">
              {language === 'ar' 
                ? `السورة ${currentPosition.currentSurah}`
                : `Surah ${currentPosition.currentSurah}`
              }
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${surahProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Verse */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {language === 'ar' ? 'الآية الحالية' : 'Current Verse'}
              </span>
            </div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-1">
              {language === 'ar' 
                ? `الآية ${currentPosition.currentVerseIndex + 1}`
                : `Verse ${currentPosition.currentVerseIndex + 1}`
              }
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {language === 'ar' 
                ? `من ${progress.totalVerses} آية`
                : `of ${progress.totalVerses} verses`
              }
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Total Read Verses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'الآيات المقروءة' : 'Verses Read'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {progress.readVerses}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'السلسلة الحالية' : 'Current Streak'}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {progress.currentStreak}
              </p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'أطول سلسلة' : 'Longest Streak'}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {progress.longestStreak}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {/* Today's Reading */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'قراءة اليوم' : 'Today\'s Reading'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {totalReadToday}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </motion.div>

      {/* Last Read Info */}
      {progress.lastReadDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {language === 'ar' 
              ? `آخر قراءة: ${new Date(progress.lastReadDate).toLocaleDateString('ar-SA')}`
              : `Last read: ${new Date(progress.lastReadDate).toLocaleDateString()}`
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default QuranProgressIndicator;
