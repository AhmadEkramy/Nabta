import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../firebase/config';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCircleCreated: () => void;
}

const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCircleCreated
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
    color: 'blue',
    icon: '🔵',
    image: '',
    backgroundImage: ''
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

  const colors = [
    'blue', 'green', 'purple', 'red', 'yellow', 'pink', 'indigo', 'gray'
  ];

  const icons = [
    '🔵', '🟢', '🟣', '🔴', '🟡', '🟠', '⚫', '⚪',
    '📚', '💪', '🎯', '🌟', '❤️', '🧘', '🎨', '🤝',
    '💼', '🎓', '🏃', '🎵', '🌱', '🔬', '🍎', '⭐'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.category) {
      toast.error(
        language === 'ar' 
          ? 'يرجى ملء جميع الحقول المطلوبة' 
          : 'Please fill in all required fields'
      );
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'circles'), {
        name: formData.name,
        nameAr: formData.nameAr || formData.name,
        description: formData.description,
        descriptionAr: formData.descriptionAr || formData.description,
        category: formData.category,
        categoryAr: formData.categoryAr || categories.find(cat => cat.en === formData.category)?.ar || formData.category,
        color: formData.color,
        icon: formData.icon,
        image: formData.image || '',
        backgroundImage: formData.backgroundImage || '',
        members: 0,
        posts: 0,
        memberIds: [],
        adminIds: [], // Will be set by admin functions if needed
        createdAt: serverTimestamp(),
        status: 'active',
        isPrivate: false
      });

      toast.success(
        language === 'ar' 
          ? 'تم إنشاء الدائرة بنجاح' 
          : 'Circle created successfully'
      );
      onCircleCreated();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        category: '',
        categoryAr: '',
        color: 'blue',
        icon: '🔵',
        image: '',
        backgroundImage: ''
      });
    } catch (error) {
      console.error('Error creating circle:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في إنشاء الدائرة' 
          : 'Failed to create circle'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      category: '',
      categoryAr: '',
      color: 'blue',
      icon: '🔵',
      image: '',
      backgroundImage: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {language === 'ar' ? 'إنشاء دائرة جديدة' : 'Create New Circle'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'اسم الدائرة (إنجليزي) *' : 'Circle Name (English) *'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'اسم الدائرة (عربي)' : 'Circle Name (Arabic)'}
                </label>
                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الوصف (إنجليزي) *' : 'Description (English) *'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الفئة *' : 'Category *'}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الفئة (عربي)' : 'Category (Arabic)'}
                </label>
                <input
                  type="text"
                  name="categoryAr"
                  value={formData.categoryAr}
                  onChange={handleInputChange}
                  placeholder={categories.find(cat => cat.en === formData.category)?.ar || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Visual Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'اللون' : 'Color'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color
                          ? 'border-gray-900 dark:border-white'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-${color}-500`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الأيقونة' : 'Icon'}
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-8 h-8 text-lg border rounded ${
                        formData.icon === icon
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'رابط صورة الخلفية' : 'Background Image URL'}
                </label>
                <input
                  type="url"
                  name="backgroundImage"
                  value={formData.backgroundImage}
                  onChange={handleInputChange}
                  placeholder="https://example.com/background.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
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
                <span>{loading ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (language === 'ar' ? 'إنشاء' : 'Create')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateCircleModal;
