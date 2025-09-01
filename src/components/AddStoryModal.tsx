import { motion } from 'framer-motion';
import { Image, Loader2, Plus, Video, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AddStoryModalProps {
  onClose: () => void;
  onSubmit: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => Promise<boolean>;
  loading?: boolean;
}

const AddStoryModal: React.FC<AddStoryModalProps> = ({
  onClose,
  onSubmit,
  loading = false
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) return;

    setSubmitting(true);
    const success = await onSubmit(
      content.trim(),
      mediaUrl.trim() || undefined,
      mediaType
    );
    setSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  const handleMediaTypeChange = (type: 'image' | 'video') => {
    setMediaType(type);
    if (!mediaUrl) {
      // Set placeholder URL for demo
      if (type === 'image') {
        setMediaUrl('https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400');
      } else {
        setMediaUrl('https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4');
      }
    }
  };

  const isDisabled = (!content.trim() && !mediaUrl.trim()) || submitting || loading;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'إضافة قصة' : 'Add Story'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'قصة جديدة' : 'New Story'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Content Input */}
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'ar' ? 'شارك قصتك...' : 'Share your story...'}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              disabled={submitting || loading}
            />
          </div>

          {/* Media Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {language === 'ar' ? 'إضافة وسائط (اختياري)' : 'Add Media (Optional)'}
            </label>
            
            <div className="flex space-x-3 mb-4">
              <button
                type="button"
                onClick={() => handleMediaTypeChange('image')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  mediaType === 'image'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                disabled={submitting || loading}
              >
                <Image className="w-4 h-4" />
                <span className="text-sm">{language === 'ar' ? 'صورة' : 'Image'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleMediaTypeChange('video')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  mediaType === 'video'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                disabled={submitting || loading}
              >
                <Video className="w-4 h-4" />
                <span className="text-sm">{language === 'ar' ? 'فيديو' : 'Video'}</span>
              </button>
            </div>

            {mediaType && (
              <div className="mb-4">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={
                    mediaType === 'image'
                      ? (language === 'ar' ? 'رابط الصورة' : 'Image URL')
                      : (language === 'ar' ? 'رابط الفيديو' : 'Video URL')
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={submitting || loading}
                />
              </div>
            )}

            {mediaUrl && mediaType && (
              <div className="mb-4">
                <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {mediaType === 'image' ? (
                    <img
                      src={mediaUrl}
                      alt="Story preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                      }}
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      className="w-full h-48 object-cover"
                      controls
                      onError={(e) => {
                        e.currentTarget.poster = 'https://via.placeholder.com/400x200?text=Video+Not+Found';
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Story Duration Info */}
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {language === 'ar' 
                ? '💡 ستختفي قصتك تلقائياً بعد 24 ساعة'
                : '💡 Your story will automatically disappear after 24 hours'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              disabled={submitting || loading}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting || loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{language === 'ar' ? 'نشر القصة' : 'Share Story'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddStoryModal;