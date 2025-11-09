import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface QuranNavigationControlsProps {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentVerseIndex: number;
  totalVerses: number;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onJumpToVerse?: (verseIndex: number) => void;
  loading?: boolean;
}

const QuranNavigationControls: React.FC<QuranNavigationControlsProps> = ({
  canGoNext,
  canGoPrevious,
  currentVerseIndex,
  totalVerses,
  onNext,
  onPrevious,
  onReset,
  onJumpToVerse,
  loading = false
}) => {
  const { language } = useLanguage();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [jumpToIndex, setJumpToIndex] = useState('');

  const handleReset = () => {
    if (showResetConfirm) {
      onReset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const handleJumpToVerse = () => {
    const index = parseInt(jumpToIndex);
    if (index >= 1 && index <= totalVerses && onJumpToVerse) {
      onJumpToVerse(index - 1); // Convert to 0-based index
      setJumpToIndex('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToVerse();
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Navigation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious || loading}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              canGoPrevious && !loading
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {language === 'ar' ? (
              <>
                <span className="font-medium">السابق</span>
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Previous</span>
              </>
            )}
          </button>

          {/* Verse Counter */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentVerseIndex + 1}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ar' ? `من ${totalVerses}` : `of ${totalVerses}`}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {((currentVerseIndex / totalVerses) * 100).toFixed(1)}%
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={!canGoNext || loading}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              canGoNext && !loading
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {language === 'ar' ? (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">التالي</span>
              </>
            ) : (
              <>
                <span className="font-medium">Next</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentVerseIndex + 1) / totalVerses) * 100}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Additional Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between space-x-4">
          {/* Quick Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onJumpToVerse && onJumpToVerse(0)}
              disabled={currentVerseIndex === 0 || loading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={language === 'ar' ? 'الذهاب إلى البداية' : 'Go to beginning'}
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => onJumpToVerse && onJumpToVerse(totalVerses - 1)}
              disabled={currentVerseIndex === totalVerses - 1 || loading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={language === 'ar' ? 'الذهاب إلى النهاية' : 'Go to end'}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to Verse */}
          {onJumpToVerse && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={totalVerses}
                value={jumpToIndex}
                onChange={(e) => setJumpToIndex(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'ar' ? 'رقم الآية' : 'Verse #'}
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleJumpToVerse}
                disabled={!jumpToIndex || loading}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {language === 'ar' ? 'اذهب' : 'Go'}
              </button>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={loading}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              showResetConfirm
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showResetConfirm
                ? (language === 'ar' ? 'تأكيد الإعادة' : 'Confirm Reset')
                : (language === 'ar' ? 'إعادة تعيين' : 'Reset')
              }
            </span>
          </button>
        </div>

        {/* Reset Confirmation Message */}
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
              {language === 'ar' 
                ? 'سيتم إعادة تعيين التقدم والعودة إلى بداية القرآن. انقر مرة أخرى للتأكيد.'
                : 'This will reset your progress and return to the beginning of the Quran. Click again to confirm.'
              }
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Keyboard Shortcuts Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3"
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {language === 'ar' 
            ? 'استخدم الأسهم ← → للتنقل بين الآيات'
            : 'Use arrow keys ← → to navigate between verses'
          }
        </p>
      </motion.div>
    </div>
  );
};

export default QuranNavigationControls;
