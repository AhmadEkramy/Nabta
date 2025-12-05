import { motion } from 'framer-motion';
import { Image, Send, Video, X } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { isYouTubeUrl, getYouTubeEmbedUrl, extractYouTubeVideoId } from '../utils/youtube';

interface CreatePostProps {
  onClose: () => void;
  onSubmit: (content: string, circleId?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSubmit }) => {
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [showMediaInput, setShowMediaInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || mediaUrl.trim()) {
      // Always post as public (no circleId)
      onSubmit(content, undefined, mediaUrl.trim() || undefined, mediaType);
      setContent('');
      setMediaUrl('');
      setMediaType(undefined);
      setShowMediaInput(false);
    }
  };

  const handleMediaTypeSelect = (type: 'image' | 'video') => {
    setMediaType(type);
    setShowMediaInput(true);
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    // Check if it's a YouTube URL (special handling)
    if (isYouTubeUrl(url)) {
      return extractYouTubeVideoId(url) !== null;
    }
    // For other URLs, validate normally
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
              {language === 'ar' ? 'المحتوى' : 'Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'ar' ? 'شارك إنجازاتك وأهدافك...' : 'Share your achievements and goals...'}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
            />
          </div>

          {/* Media Options */}
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => handleMediaTypeSelect('image')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                mediaType === 'image'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة صورة' : 'Add Image'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleMediaTypeSelect('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                mediaType === 'video'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة فيديو' : 'Add Video'}</span>
            </button>
            {mediaType && (
              <button
                type="button"
                onClick={() => {
                  setMediaType(undefined);
                  setMediaUrl('');
                  setShowMediaInput(false);
                }}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {language === 'ar' ? 'إزالة' : 'Remove'}
              </button>
            )}
          </div>

          {/* Media URL Input */}
          {showMediaInput && mediaType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {mediaType === 'image'
                  ? (language === 'ar' ? 'رابط الصورة' : 'Image URL')
                  : (language === 'ar' ? 'رابط الفيديو' : 'Video URL')}
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={
                  mediaType === 'image'
                    ? (language === 'ar' ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg')
                    : (language === 'ar' ? 'https://example.com/video.mp4' : 'https://example.com/video.mp4')
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
              {mediaUrl && !isValidUrl(mediaUrl) && (
                <p className="mt-1 text-sm text-red-500">
                  {language === 'ar' ? 'الرجاء إدخال رابط صحيح' : 'Please enter a valid URL'}
                </p>
              )}
            </div>
          )}

          {/* Media Preview */}
          {mediaUrl && mediaType && isValidUrl(mediaUrl) && (
            <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                />
              ) : isYouTubeUrl(mediaUrl) ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(mediaUrl) || mediaUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video player"
                  />
                </div>
              ) : (
                <video
                  src={mediaUrl}
                  className="w-full max-h-64 object-cover"
                  controls
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.poster = 'https://via.placeholder.com/400x200?text=Video+Not+Found';
                  }}
                />
              )}
            </div>
          )}

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
              disabled={!content.trim() && !mediaUrl.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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