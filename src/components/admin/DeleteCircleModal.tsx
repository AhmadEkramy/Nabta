import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { CircleWithStats, deleteCircle } from '../../firebase/admin';

interface DeleteCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: CircleWithStats | null;
  onCircleDeleted: () => void;
}

const DeleteCircleModal: React.FC<DeleteCircleModalProps> = ({
  isOpen,
  onClose,
  circle,
  onCircleDeleted
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (!circle) return;
    
    // Require typing "DELETE" to confirm
    if (confirmText !== 'DELETE') {
      toast.error(
        language === 'ar' 
          ? 'يرجى كتابة "DELETE" للتأكيد' 
          : 'Please type "DELETE" to confirm'
      );
      return;
    }

    setLoading(true);
    try {
      await deleteCircle(circle.id);
      toast.success(
        language === 'ar' 
          ? 'تم حذف الدائرة بنجاح' 
          : 'Circle deleted successfully'
      );
      onCircleDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting circle:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في حذف الدائرة' 
          : 'Failed to delete circle'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen || !circle) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {language === 'ar' ? 'حذف الدائرة' : 'Delete Circle'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? circle.nameAr || circle.name : circle.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {circle.memberCount} {language === 'ar' ? 'عضو' : 'members'} • {circle.postsCount} {language === 'ar' ? 'منشور' : 'posts'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                    {language === 'ar' ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه' : 'Warning: This action cannot be undone'}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {language === 'ar' 
                      ? 'سيتم حذف الدائرة وجميع منشوراتها وتعليقاتها نهائياً. سيفقد الأعضاء الوصول إلى هذه الدائرة.'
                      : 'The circle and all its posts and comments will be permanently deleted. Members will lose access to this circle.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' 
                  ? 'اكتب "DELETE" للتأكيد:' 
                  : 'Type "DELETE" to confirm:'
                }
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== 'DELETE'}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {loading 
                    ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') 
                    : (language === 'ar' ? 'حذف' : 'Delete')
                  }
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteCircleModal;
