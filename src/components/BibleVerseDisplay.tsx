import { motion } from 'framer-motion';
import { BookOpen, Check, Heart } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BibleVerse } from '../firebase/bible';

interface BibleVerseDisplayProps {
  verse: BibleVerse;
  isRead: boolean;
  onMarkAsRead: () => void;
  loading?: boolean;
}

const BibleVerseDisplay: React.FC<BibleVerseDisplayProps> = ({
  verse,
  isRead,
  onMarkAsRead,
  loading = false
}) => {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Verse Reference */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? verse.referenceAr : verse.reference}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ar' ? verse.bookAr : verse.book} - {language === 'ar' ? 'الأصحاح' : 'Chapter'} {verse.chapter}
            </p>
          </div>
        </div>
        {isRead && (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'مقروءة' : 'Read'}
            </span>
          </div>
        )}
      </div>

      {/* Arabic Text */}
      {verse.arabic && (
        <div className="mb-6">
          <div className="text-right">
            <p className="text-2xl leading-relaxed text-gray-900 dark:text-white font-arabic">
              {verse.arabic}
            </p>
          </div>
        </div>
      )}

      {/* English Text */}
      {verse.english && (
        <div className="mb-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {verse.english}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onMarkAsRead}
          disabled={isRead || loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            isRead || loading
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
          }`}
        >
          <Check className="w-4 h-4" />
          <span className="font-medium">
            {isRead
              ? language === 'ar' ? 'مقروءة' : 'Read'
              : language === 'ar' ? 'ضع علامة كمقروءة' : 'Mark as Read'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default BibleVerseDisplay;

