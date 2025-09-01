import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CreatePostModalProps {
  circleId: string;
  onClose: () => void;
  onPost: (content: string) => Promise<void>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ circleId, onClose, onPost }) => {
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onPost(content);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-xl">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'إنشاء منشور جديد' : 'Create New Post'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'ar' ? 'ماذا يدور في ذهنك؟' : 'What\'s on your mind?'}
              className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'ar' ? 'جاري النشر...' : 'Posting...'}</span>
                  </div>
                ) : (
                  language === 'ar' ? 'نشر' : 'Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
