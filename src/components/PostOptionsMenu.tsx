import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Edit3, Loader2, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PostOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  loading?: boolean;
}

const PostOptionsMenu: React.FC<PostOptionsMenuProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  loading = false
}) => {
  const { language } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
        setShowDeleteConfirm(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      >
        {!showDeleteConfirm ? (
          <div className="py-2">
            {/* Edit Option */}
            <button
              onClick={handleEdit}
              disabled={loading}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'تعديل المنشور' : 'Edit Post'}
              </span>
            </button>

            {/* Delete Option */}
            <button
              onClick={handleDeleteClick}
              disabled={loading}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">
                {language === 'ar' ? 'حذف المنشور' : 'Delete Post'}
              </span>
            </button>
          </div>
        ) : (
          <div className="p-4">
            {/* Delete Confirmation */}
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' 
                    ? 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.'
                    : 'Are you sure you want to delete this post? This action cannot be undone.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={loading}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PostOptionsMenu;