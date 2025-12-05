import { motion } from 'framer-motion';
import { Image, Loader2, Save, Video, X } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { isYouTubeUrl, getYouTubeEmbedUrl, extractYouTubeVideoId } from '../utils/youtube';

interface EditPostModalProps {
  postId: string;
  currentContent: string;
  currentMediaUrl?: string;
  currentMediaType?: 'image' | 'video';
  onClose: () => void;
  onSave: (newContent: string, mediaUrl?: string, mediaType?: 'image' | 'video') => Promise<boolean>;
  loading?: boolean;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  postId,
  currentContent,
  currentMediaUrl,
  currentMediaType,
  onClose,
  onSave,
  loading = false
}) => {
  const { language } = useLanguage();
  const [content, setContent] = useState(currentContent);
  const [mediaUrl, setMediaUrl] = useState(currentMediaUrl || '');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(currentMediaType);
  const [showMediaInput, setShowMediaInput] = useState(!!currentMediaUrl);
  const [saving, setSaving] = useState(false);

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is valid (will remove media)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasChanges = content.trim() !== currentContent.trim() || 
                      mediaUrl.trim() !== (currentMediaUrl || '').trim() ||
                      mediaType !== currentMediaType;
    
    if (!hasChanges) return;

    setSaving(true);
    const finalMediaUrl = mediaUrl.trim() || undefined;
    const success = await onSave(content.trim(), finalMediaUrl, mediaType);
    setSaving(false);
    
    if (success) {
      onClose();
    }
  };

  const handleMediaTypeSelect = (type: 'image' | 'video') => {
    setMediaType(type);
    setShowMediaInput(true);
  };

  const isDisabled = (!content.trim() && !mediaUrl.trim()) || saving || loading;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'تعديل المنشور' : 'Edit Post'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'محتوى المنشور' : 'Post Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'ar' ? 'ما الذي تريد مشاركته؟' : "What's on your mind?"}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              disabled={saving || loading}
            />
          </div>

          {/* Media Options */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => handleMediaTypeSelect('image')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  mediaType === 'image'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                disabled={saving || loading}
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
                disabled={saving || loading}
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
                  disabled={saving || loading}
                >
                  {language === 'ar' ? 'إزالة' : 'Remove'}
                </button>
              )}
            </div>

            {/* Media URL Input */}
            {showMediaInput && mediaType && (
              <div className="mb-4">
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
                  disabled={saving || loading}
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
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              disabled={saving || loading}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving || loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{language === 'ar' ? 'حفظ' : 'Save'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditPostModal;