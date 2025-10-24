import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Link as LinkIcon, Loader2, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { uploadImage } from '../firebase/storage';

interface CoverImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverImage?: string;
  userId: string;
  onCoverUpdate: (newCoverUrl: string) => Promise<void>;
}

const CoverImageModal: React.FC<CoverImageModalProps> = ({
  isOpen,
  onClose,
  currentCoverImage,
  userId,
  onCoverUpdate,
}) => {
  const { language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'ar' ? 'يرجى اختيار صورة' : 'Please select an image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const coverUrl = await uploadImage(selectedFile, `covers/${userId}`);
      
      // Update user profile
      await onCoverUpdate(coverUrl);
      
      toast.success(language === 'ar' ? 'تم تحديث صورة الخلفية بنجاح' : 'Cover image updated successfully');
      onClose();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء رفع الصورة' : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveFromUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال رابط الصورة' : 'Please enter image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      toast.error(language === 'ar' ? 'رابط غير صحيح' : 'Invalid URL');
      return;
    }

    setUploading(true);
    try {
      await onCoverUpdate(imageUrl);
      toast.success(language === 'ar' ? 'تم تحديث صورة الخلفية بنجاح' : 'Cover image updated successfully');
      onClose();
      setImageUrl('');
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error updating cover image from URL:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تحديث الصورة' : 'Error updating image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    try {
      setUploading(true);
      await onCoverUpdate('');
      toast.success(language === 'ar' ? 'تم إزالة صورة الخلفية' : 'Cover image removed');
      onClose();
    } catch (error) {
      console.error('Error removing cover image:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إزالة الصورة' : 'Error removing image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlPreview = () => {
    if (imageUrl.trim()) {
      setPreviewUrl(imageUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تغيير صورة الخلفية' : 'Change Cover Image'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Preview */}
            <div className="mb-6">
              <div className="relative w-full h-48 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-lg overflow-hidden">
                {previewUrl || currentCoverImage ? (
                  <img
                    src={previewUrl || currentCoverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">
                        {language === 'ar' ? 'لا توجد صورة خلفية' : 'No cover image'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => {
                  setMode('upload');
                  setPreviewUrl(null);
                  setImageUrl('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
                  mode === 'upload'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                {language === 'ar' ? 'رفع صورة' : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setMode('url');
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
                  mode === 'url'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                {language === 'ar' ? 'رابط' : 'URL'}
              </button>
            </div>

            {/* Upload Mode */}
            {mode === 'upload' && (
              <div className="mb-6">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-400 transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'ar' 
                          ? 'اضغط لاختيار صورة أو اسحبها هنا' 
                          : 'Click to select or drag an image here'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {language === 'ar' ? 'حجم الصورة الأقصى: 5 ميجابايت' : 'Max size: 5MB'}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* URL Mode */}
            {mode === 'url' && (
              <div className="mb-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      disabled={uploading}
                    />
                    <button
                      onClick={handleUrlPreview}
                      disabled={!imageUrl.trim() || uploading}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      {language === 'ar' ? 'معاينة' : 'Preview'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {language === 'ar'
                      ? 'الصق رابط صورة من الإنترنت'
                      : 'Paste an image URL from the web'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {currentCoverImage && (
                <button
                  onClick={handleRemoveCover}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                >
                  {language === 'ar' ? 'إزالة الصورة' : 'Remove Image'}
                </button>
              )}
              <button
                onClick={mode === 'upload' ? handleUpload : handleSaveFromUrl}
                disabled={(mode === 'upload' ? !selectedFile : !imageUrl.trim()) || uploading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (language === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CoverImageModal;

