import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmDeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postContent?: string;
}

const ConfirmDeletePostModal: React.FC<ConfirmDeletePostModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  postContent
}) => {
  const { language } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass morphism card */}
              <div className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 z-10"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Header with animated icon */}
                <div className="relative bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-600/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-red-600/20 px-6 pt-8 pb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="relative">
                      {/* Pulsing background */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.2, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-red-500 rounded-full blur-xl"
                      />
                      
                      {/* Icon container */}
                      <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <motion.div
                          animate={{
                            rotate: [0, -10, 10, -10, 0],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          <AlertTriangle className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-center text-gray-900 dark:text-white"
                  >
                    {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
                  </motion.h3>
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="px-6 py-6"
                >
                  <p className="text-center text-gray-700 dark:text-gray-300 mb-4 text-lg">
                    {language === 'ar' 
                      ? 'هل أنت متأكد من حذف هذا المنشور؟'
                      : 'Are you sure you want to delete this post?'
                    }
                  </p>

                  {postContent && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {postContent}
                      </p>
                    </div>
                  )}

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-sm text-red-800 dark:text-red-300 text-center">
                      {language === 'ar'
                        ? '⚠️ لا يمكن التراجع عن هذا الإجراء'
                        : '⚠️ This action cannot be undone'
                      }
                    </p>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="px-6 pb-6 flex gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60"
                  >
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeletePostModal;

