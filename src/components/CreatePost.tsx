import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CreatePostProps {
  onClose: () => void;
  onSubmit: (content: string, circleId?: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSubmit }) => {
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');

  const circles = [
    { id: '', name: language === 'ar' ? 'النشر العام' : 'Public Post' },
    { id: '1', name: language === 'ar' ? 'دائرة التأمل والصحة النفسية' : 'Meditation & Mental Health' },
    { id: '2', name: language === 'ar' ? 'دائرة تعلم البرمجة' : 'Programming Learning' },
    { id: '3', name: language === 'ar' ? 'دائرة القراءة والكتابة' : 'Reading & Writing' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      // Only pass circleId if it's not empty string
      const circleId = selectedCircle && selectedCircle.trim() !== '' ? selectedCircle : undefined;
      onSubmit(content, circleId);
      setContent('');
      setSelectedCircle('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'إنشاء منشور جديد' : 'Create New Post'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'اختر الدائرة' : 'Select Circle'}
            </label>
            <select
              value={selectedCircle}
              onChange={(e) => setSelectedCircle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              {circles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'المحتوى' : 'Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'ar' ? 'شارك إنجازاتك وأهدافك...' : 'Share your achievements and goals...'}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'ar' ? 'نشر' : 'Post'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePost;