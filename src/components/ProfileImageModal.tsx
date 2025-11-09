import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Eye, Link, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { uploadImageAndGetURL } from '../firebase/storage';
import { updateUserProfile } from '../firebase/userProfile';
import ImagePreviewModal from './ImagePreviewModal';

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userName: string;
  userId: string;
  onAvatarUpdate: (newAvatar: string) => void;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  userId,
  onAvatarUpdate
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'preview' | 'upload' | 'url'>('preview');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(language === 'ar' ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File size too large (max 5MB)');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const imagePath = `avatars/${userId}/${Date.now()}_${file.name}`;
      const downloadURL = await uploadImageAndGetURL(file, imagePath);
      setImageUrl(downloadURL);
      toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح!' : 'Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(language === 'ar' ? 'فشل في رفع الصورة' : 'Failed to upload image');
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال رابط صالح' : 'Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      setPreviewImage(imageUrl);
      toast.success(language === 'ar' ? 'تم تحديد الصورة!' : 'Image set!');
    } catch {
      toast.error(language === 'ar' ? 'رابط غير صالح' : 'Invalid URL');
    }
  };

  const handleSaveAvatar = async () => {
    const newAvatar = previewImage || imageUrl;
    if (!newAvatar) {
      toast.error(language === 'ar' ? 'يرجى اختيار صورة أولاً' : 'Please select an image first');
      return;
    }

    try {
      setUpdating(true);
      await updateUserProfile(userId, { avatar: newAvatar });
      onAvatarUpdate(newAvatar);
      toast.success(language === 'ar' ? 'تم تحديث الصورة الشخصية!' : 'Profile picture updated!');
      onClose();
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error(language === 'ar' ? 'فشل في تحديث الصورة' : 'Failed to update profile picture');
    } finally {
      setUpdating(false);
    }
  };

  const resetToDefault = () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=200`;
    setPreviewImage(defaultAvatar);
    setImageUrl(defaultAvatar);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الصورة الشخصية' : 'Profile Picture'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {language === 'ar' ? 'معاينة' : 'Preview'}
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {language === 'ar' ? 'رفع صورة' : 'Upload'}
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'url'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {language === 'ar' ? 'رابط' : 'URL'}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'preview' && (
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <img
                    src={previewImage || currentAvatar}
                    alt={userName}
                    className="w-48 h-48 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 mx-auto cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setShowFullPreview(true)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=200`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setShowFullPreview(true)}>
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {userName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'انقر على الصورة أو استخدم الأزرار أدناه لتغييرها' : 'Click on the image or use the buttons below to change it'}
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowFullPreview(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{language === 'ar' ? 'معاينة كاملة' : 'Full Preview'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{language === 'ar' ? 'رفع صورة' : 'Upload'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('url')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Link className="w-4 h-4" />
                    <span>{language === 'ar' ? 'رابط' : 'URL'}</span>
                  </button>
                  <button
                    onClick={resetToDefault}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {language === 'ar' ? 'افتراضي' : 'Default'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                >
                  {uploading ? (
                    <div className="space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'جاري رفع الصورة...' : 'Uploading image...'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {language === 'ar' ? 'اختر صورة من جهازك' : 'Choose an image from your device'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {language === 'ar' ? 'PNG, JPG, GIF حتى 5 ميجابايت' : 'PNG, JPG, GIF up to 5MB'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {previewImage && (
                  <div className="text-center">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-200 dark:border-green-800"
                    />
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {activeTab === 'url' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder={language === 'ar' ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {previewImage && (
                  <div className="text-center">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-200 dark:border-green-800"
                      onError={() => {
                        setPreviewImage(null);
                        toast.error(language === 'ar' ? 'فشل في تحميل الصورة من الرابط' : 'Failed to load image from URL');
                      }}
                    />
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">
                        {language === 'ar' ? 'نصائح للحصول على أفضل النتائج:' : 'Tips for best results:'}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>{language === 'ar' ? 'استخدم صوراً مربعة للحصول على أفضل مظهر' : 'Use square images for best appearance'}</li>
                        <li>{language === 'ar' ? 'تأكد من أن الرابط ينتهي بـ .jpg أو .png أو .gif' : 'Make sure URL ends with .jpg, .png, or .gif'}</li>
                        <li>{language === 'ar' ? 'استخدم روابط من مواقع موثوقة' : 'Use URLs from trusted websites'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleSaveAvatar}
              disabled={updating || (!previewImage && !imageUrl)}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{language === 'ar' ? 'حفظ' : 'Save'}</span>
            </button>
          </div>
        </motion.div>

        {/* Full Image Preview Modal */}
        <ImagePreviewModal
          isOpen={showFullPreview}
          onClose={() => setShowFullPreview(false)}
          imageUrl={previewImage || currentAvatar}
          imageAlt={`${userName}'s profile picture`}
          userName={userName}
          showDownload={true}
        />
      </div>
    </AnimatePresence>
  );
};

export default ProfileImageModal;
