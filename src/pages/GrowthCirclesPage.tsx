import { motion } from 'framer-motion';
import { Filter, MessageCircle, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCircles } from '../hooks/useCircles';

const GrowthCirclesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Use real data from Firestore
  const { circles, loading, error, joiningCircle, handleJoinCircle, handleLeaveCircle } = useCircles();

  // Generate categories dynamically from circles data
  const categories = [
    { id: 'all', name: language === 'ar' ? 'جميع الفئات' : 'All Categories' },
    ...Array.from(new Set(circles.map(circle => circle.category)))
      .map(category => ({
        id: category,
        name: language === 'ar'
          ? circles.find(c => c.category === category)?.categoryAr || category
          : category
      }))
  ];

  // Filter circles based on search and category
  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.nameAr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || circle.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const colorClasses: { [key: string]: string } = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600',
    default: 'from-gray-500 to-gray-600'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('growth.circles')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {language === 'ar' ? 'انضم إلى دوائر النمو واكتشف إمكانياتك الحقيقية' : 'Join growth circles and discover your true potential'}
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن دائرة النمو...' : 'Search for growth circles...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-3/4" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                </div>
                <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
              <div className="w-full h-12 bg-gray-300 dark:bg-gray-600 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'حدث خطأ في تحميل الدوائر' : 'Error loading circles'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        </motion.div>
      )}

      {/* Circles Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCircles.map((circle, index) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Background Image */}
              <div className="relative h-32 w-full">
                {circle.backgroundImageUrl ? (
                  <img
                    src={circle.backgroundImageUrl}
                    alt={language === 'ar' ? `خلفية ${circle.nameAr}` : `${circle.name} background`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.className = `w-full h-full bg-gradient-to-r ${colorClasses[circle.color || 'default']}`;
                      }
                    }}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-r ${colorClasses[circle.color || 'default']}`} />
                )}
                
                {/* Overlay for better text visibility */}
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                
                {/* Circle Image/Icon */}
                <div className="absolute -bottom-10 left-6">
                  {circle.imageUrl ? (
                    <img
                      src={circle.imageUrl}
                      alt={language === 'ar' ? circle.nameAr : circle.name}
                      className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-r ${colorClasses[circle.color || 'default']} flex items-center justify-center text-3xl shadow-lg">${circle.icon || '⭕'}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-r ${colorClasses[circle.color || 'default']} flex items-center justify-center text-3xl shadow-lg`}>
                      {circle.icon || '⭕'}
                    </div>
                  )}
                </div>
                
                {/* Joined Badge */}
                {circle.isJoined && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                      {language === 'ar' ? 'عضو' : 'Joined'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 pt-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? circle.nameAr : circle.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {language === 'ar' ? circle.descriptionAr : circle.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{circle.members.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{circle.posts}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {language === 'ar' ? circle.categoryAr : circle.category}
                  </span>
                </div>

                {circle.isJoined ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleLeaveCircle(circle.id)}
                      disabled={joiningCircle === circle.id}
                      className="flex-1 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30"
                    >
                      {joiningCircle === circle.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                        </div>
                      ) : (
                        language === 'ar' ? 'ترك الدائرة' : 'Leave Circle'
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/circle/${circle.id}`)}
                      className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
                    >
                      {language === 'ar' ? 'عرض' : 'View'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinCircle(circle.id)}
                    disabled={joiningCircle === circle.id}
                    className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 text-white hover:bg-green-600"
                  >
                    {joiningCircle === circle.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                      </div>
                    ) : (
                      language === 'ar' ? 'انضم للدائرة' : 'Join Circle'
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCircles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'لا توجد دوائر مطابقة' : 'No matching circles found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ar' ? 'جرب البحث بكلمات أخرى أو تغيير الفئة' : 'Try searching with different keywords or change the category'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GrowthCirclesPage;