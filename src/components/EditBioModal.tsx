import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface EditBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newBio: string) => void;
  currentBio: string;
}

const EditBioModal: React.FC<EditBioModalProps> = ({ isOpen, onClose, onSave, currentBio }) => {
  const { language } = useLanguage();
  const [bio, setBio] = useState(currentBio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(bio);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'تحديث النبذة الشخصية' : 'Update Bio'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="bio" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {language === 'ar' ? 'نبذتك الشخصية' : 'Your Bio'}
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-32 px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-600 transition-colors resize-none"
                  placeholder={language === 'ar' ? 'اكتب نبذة عن نفسك...' : 'Write something about yourself...'}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditBioModal;