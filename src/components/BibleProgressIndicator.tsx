import { motion } from 'framer-motion';
import { Award, BookOpen, Calendar, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BibleProgress, BibleReadingPosition } from '../firebase/bible';

interface BibleProgressIndicatorProps {
  progress: BibleProgress;
  currentPosition: BibleReadingPosition;
  readVerses: string[];
  totalReadToday?: number;
  streak?: number;
}

const BibleProgressIndicator: React.FC<BibleProgressIndicatorProps> = ({
  progress,
  currentPosition,
  readVerses,
  totalReadToday = 0,
  streak = 0
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
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

        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الكتاب' : 'Book'}
                </span>
              </div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {language === 'ar' ? currentPosition.currentBookNameAr : currentPosition.currentBookName}
              </span>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الأصحاح' : 'Chapter'}
                </span>
              </div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {currentPosition.currentChapter}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'مقروءة' : 'Read'}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {progress.readVerses}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'السلسلة' : 'Streak'}
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {streak || progress.currentStreak}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BibleProgressIndicator;

