import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { checkUsernameAvailability, updateUsername } from '../firebase/userProfile';

interface EditUsernameModalProps {
  currentUsername: string;
  userId: string;
  onClose: () => void;
  onSave: (newUsername: string) => void;
}

const EditUsernameModal: React.FC<EditUsernameModalProps> = ({
  currentUsername,
  userId,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const [username, setUsername] = useState(currentUsername || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Reset availability check when username changes
    const checkAvailability = async () => {
      const trimmedUsername = username.trim().toLowerCase();
      
      // Don't check if username is the same as current
      if (trimmedUsername === currentUsername.toLowerCase()) {
        setIsAvailable(true);
        setError('');
        return;
      }

      // Don't check empty or very short usernames
      if (trimmedUsername.length < 3) {
        setIsAvailable(null);
        setError(language === 'ar' ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters');
        return;
      }

      // Check valid characters
      const usernameRegex = /^[a-z0-9_.]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        setIsAvailable(false);
        setError(language === 'ar' ? 'يمكن استخدام الحروف والأرقام و _ و . فقط' : 'Only letters, numbers, _ and . are allowed');
        return;
      }

      setIsChecking(true);
      setError('');

      try {
        const available = await checkUsernameAvailability(trimmedUsername, userId);
        setIsAvailable(available);
        if (!available) {
          setError(language === 'ar' ? 'اسم المستخدم محجوز بالفعل' : 'Username is already taken');
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setIsAvailable(null);
        setError(language === 'ar' ? 'حدث خطأ أثناء التحقق' : 'Error checking availability');
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the availability check
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username, currentUsername, userId, language]);

  const handleSave = async () => {
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername) {
      setError(language === 'ar' ? 'اسم المستخدم مطلوب' : 'Username is required');
      return;
    }

    if (trimmedUsername === currentUsername.toLowerCase()) {
      onClose();
      return;
    }

    if (!isAvailable) {
      setError(language === 'ar' ? 'اسم المستخدم غير متاح' : 'Username is not available');
      return;
    }

    try {
      setSaving(true);
      const result = await updateUsername(userId, trimmedUsername);
      
      if (result.success) {
        onSave(trimmedUsername);
        onClose();
      } else {
        setError(result.error || (language === 'ar' ? 'فشل تحديث اسم المستخدم' : 'Failed to update username'));
      }
    } catch (err) {
      console.error('Error saving username:', err);
      setError(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving username');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'تعديل اسم المستخدم' : 'Edit Username'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'اسم المستخدم' : 'Username'}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                @
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder={language === 'ar' ? 'ahmed_ekramy' : 'ahmed_ekramy'}
                className="w-full pl-8 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={saving}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking && (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!isChecking && isAvailable === true && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
            
            {/* Helper text */}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {language === 'ar' 
                ? 'يمكنك استخدام الحروف الإنجليزية والأرقام و _ و . فقط (3-30 حرف)'
                : 'Use only letters, numbers, _ and . (3-30 characters)'}
            </p>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Success message */}
            {!isChecking && isAvailable === true && username.toLowerCase() !== currentUsername.toLowerCase() && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-green-500 dark:text-green-400 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                {language === 'ar' ? 'اسم المستخدم متاح!' : 'Username is available!'}
              </motion.p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={saving}
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isAvailable || !username.trim() || isChecking}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {language === 'ar' ? 'حفظ' : 'Save'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditUsernameModal;

