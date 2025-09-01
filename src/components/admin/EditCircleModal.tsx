import { doc, updateDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Save, Tag, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { CircleWithStats } from '../../firebase/admin';
import { db } from '../../firebase/config';

interface EditCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: CircleWithStats | null;
  onCircleUpdated: () => void;
}

const EditCircleModal: React.FC<EditCircleModalProps> = ({
  isOpen,
  onClose,
  circle,
  onCircleUpdated
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    category: '',
    categoryAr: '',
    isActive: true,
    imageUrl: '',
    backgroundImageUrl: ''
  });

  const categories = [
    { en: 'Personal Development', ar: 'التطوير الشخصي' },
    { en: 'Health & Fitness', ar: 'الصحة واللياقة' },
    { en: 'Career & Business', ar: 'المهنة والأعمال' },
    { en: 'Education & Learning', ar: 'التعليم والتعلم' },
    { en: 'Relationships', ar: 'العلاقات' },
    { en: 'Spirituality', ar: 'الروحانية' },
    { en: 'Hobbies & Interests', ar: 'الهوايات والاهتمامات' },
    { en: 'Community Service', ar: 'خدمة المجتمع' }
  ];

  useEffect(() => {
    if (circle) {
      setFormData({
        name: circle.name,
        nameAr: circle.nameAr || '',
        description: circle.description,
        descriptionAr: circle.descriptionAr || '',
        category: circle.category,
        categoryAr: circle.categoryAr || '',
        isActive: circle.status === 'active',
        imageUrl: circle.imageUrl || '',
        backgroundImageUrl: circle.backgroundImageUrl || ''
      });
    }
  }, [circle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle) return;

    setLoading(true);
    try {
      const circleRef = doc(db, 'circles', circle.id);
      await updateDoc(circleRef, {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        category: formData.category,
        categoryAr: formData.categoryAr,
        status: formData.isActive ? 'active' : 'inactive',
        imageUrl: formData.imageUrl,
        backgroundImageUrl: formData.backgroundImageUrl,
        updatedAt: new Date()
      });

      toast.success(
        language === 'ar' 
          ? 'تم تحديث الدائرة بنجاح' 
          : 'Circle updated successfully'
      );
      onCircleUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating circle:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في تحديث الدائرة' 
          : 'Failed to update circle'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !circle) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {language === 'ar' ? 'تعديل الدائرة' : 'Edit Circle'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Name (Arabic) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => handleInputChange('nameAr', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                dir="rtl"
              />
            </div>

            {/* Description (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Description (Arabic) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                dir="rtl"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                {language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selectedCategory = categories.find(cat => cat.en === e.target.value);
                  handleInputChange('category', e.target.value);
                  handleInputChange('categoryAr', selectedCategory?.ar || '');
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">
                  {language === 'ar' ? 'اختر الفئة' : 'Select Category'}
                </option>
                {categories.map((category) => (
                  <option key={category.en} value={category.en}>
                    {language === 'ar' ? category.ar : category.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={language === 'ar' ? 'رابط صورة الدائرة' : 'Circle image URL'}
              />
            </div>

            {/* Background Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'رابط صورة الخلفية' : 'Background Image URL'}
              </label>
              <input
                type="url"
                value={formData.backgroundImageUrl}
                onChange={(e) => handleInputChange('backgroundImageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={language === 'ar' ? 'رابط صورة خلفية الدائرة' : 'Circle background image URL'}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'نشط' : 'Active'}
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditCircleModal;
