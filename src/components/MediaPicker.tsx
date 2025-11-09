import { AnimatePresence, motion } from 'framer-motion';
import { Camera, File, Image, X } from 'lucide-react';
import React, { useRef } from 'react';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaSelect: (file: File, type: 'image' | 'file') => void;
  language: string;
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onMediaSelect,
  language
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMediaSelect(file, 'image');
      onClose();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMediaSelect(file, 'file');
      onClose();
    }
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'إرسال ملف' : 'Send Media'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Media Options */}
          <div className="space-y-4">
            {/* Image Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openImagePicker}
              className="w-full flex items-center space-x-4 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Image className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'صورة' : 'Image'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'اختر صورة من جهازك' : 'Choose an image from your device'}
                </p>
              </div>
            </motion.button>

            {/* Camera Option (if supported) */}
            {navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // For now, we'll use the same image picker but with camera capture
                  if (imageInputRef.current) {
                    imageInputRef.current.setAttribute('capture', 'environment');
                    imageInputRef.current.click();
                  }
                }}
                className="w-full flex items-center space-x-4 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {language === 'ar' ? 'كاميرا' : 'Camera'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'التقط صورة جديدة' : 'Take a new photo'}
                  </p>
                </div>
              </motion.button>
            )}

            {/* File Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openFilePicker}
              className="w-full flex items-center space-x-4 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <File className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'ملف' : 'Document'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'اختر ملف من جهازك' : 'Choose a file from your device'}
                </p>
              </div>
            </motion.button>
          </div>

          {/* File Size Limit Info */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {language === 'ar' 
                ? 'الحد الأقصى لحجم الملف: 10 ميجابايت'
                : 'Maximum file size: 10MB'
              }
            </p>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.zip,.rar"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MediaPicker;