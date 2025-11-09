import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BibleNavigationControlsProps {
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

const BibleNavigationControls: React.FC<BibleNavigationControlsProps> = ({
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
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const handleJumpToVerseClick = () => {
    const index = parseInt(jumpToIndex);
    if (index >= 1 && index <= totalVerses && onJumpToVerse) {
      onJumpToVerse(index - 1);
      setJumpToIndex('');
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
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

          <button
            onClick={onNext}
            disabled={!canGoNext || loading}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              canGoNext && !loading
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
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

        {/* Jump to Verse */}
        {onJumpToVerse && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={totalVerses}
                value={jumpToIndex}
                onChange={(e) => setJumpToIndex(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJumpToVerseClick()}
                placeholder={language === 'ar' ? 'انتقل إلى الآية...' : 'Jump to verse...'}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleJumpToVerseClick}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
              >
                {language === 'ar' ? 'انتقل' : 'Go'}
              </button>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              showResetConfirm
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium">
              {showResetConfirm
                ? language === 'ar' ? 'انقر مرة أخرى للتأكيد' : 'Click again to confirm'
                : language === 'ar' ? 'إعادة تعيين التقدم' : 'Reset Progress'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BibleNavigationControls;

