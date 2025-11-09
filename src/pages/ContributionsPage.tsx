import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const ContributionsPage: React.FC = () => {
  const { language } = useLanguage();

  const contributors = [
    {
      name: 'Shaza Ghanem',
      nameAr: 'شذى غانم',
      idea: 'Adding XP Points and Gamification',
      ideaAr: 'إضافة نقاط الخبرة والألعاب للمستخدمين',
      color: 'from-purple-400 to-purple-600',
      hoverColor: 'purple',
      icon: '🎮'
    },
    {
      name: 'Lena Gad',
      nameAr: 'لينا جاد',
      idea: 'Adding Themes',
      ideaAr: 'إضافة المظاهر',
      color: 'from-pink-400 to-pink-600',
      hoverColor: 'pink',
      icon: '🎨'
    },
    {
      name: 'Duha Abdulsalam',
      nameAr: 'ضحى عبدالسلام',
      idea: 'Let the User Set the Usage Time',
      ideaAr: 'السماح للمستخدم بتحديد وقت الاستخدام',
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'blue',
      icon: '⏰'
    },
    {
      name: 'Guayria Wael',
      nameAr: 'جويرية وائل',
      idea: 'Interactive Games',
      ideaAr: 'ألعاب تفاعلية',
      color: 'from-green-400 to-green-600',
      hoverColor: 'green',
      icon: '🎯'
    },
    {
      name: 'Ahmed Elnabawy',
      nameAr: 'أحمد النبوي',
      idea: 'Adding Audio Comments',
      ideaAr: 'إضافة التعليقات الصوتية',
      color: 'from-cyan-400 to-cyan-600',
      hoverColor: 'cyan',
      icon: '🎤'
    },
    {
      name: 'Ahmed Gabr',
      nameAr: 'أحمد جبر',
      idea: 'Message Scheduling',
      ideaAr: 'جدولة الرسائل',
      color: 'from-indigo-400 to-indigo-600',
      hoverColor: 'indigo',
      icon: '📅'
    },
    {
      name: 'Malak Islam',
      nameAr: 'ملك إسلام',
      idea: 'AI Coach',
      ideaAr: 'المدرب الذكي',
      color: 'from-orange-400 to-orange-600',
      hoverColor: 'orange',
      icon: '🤖'
    },
    {
      name: 'Habiba Salah',
      nameAr: 'حبيبة صلاح',
      idea: 'Habit Tracker and Making Points for Each Task',
      ideaAr: 'متتبع العادات وصنع نقاط لكل مهمة',
      color: 'from-red-400 to-red-600',
      hoverColor: 'red',
      icon: '🎨'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `url('/hero_section_img.png')`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-white/95 to-blue-50/90 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95"></div>
      </div>

      {/* Animated Particles */}
      <div className="fixed inset-0 z-[1]">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0,
              scale: 0
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="group inline-flex items-center space-x-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-x-2"
            >
              <ArrowLeft className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Lightbulb className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4"
            >
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                {language === 'ar' ? 'المساهمون المبدعون' : 'Creative Contributors'}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              {language === 'ar' 
                ? 'شكراً خاصاً للأشخاص المبدعين الذين ساهموا بأفكارهم الرائعة لتحسين المنصة'
                : 'Special thanks to the creative minds who contributed their amazing ideas to improve the platform'
              }
            </motion.p>

            {/* Decorative Line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.6 }}
              className="max-w-md mx-auto mt-8"
            >
              <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
            </motion.div>
          </motion.div>

          {/* Contributors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {contributors.map((contributor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -15, scale: 1.05 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-500 shadow-lg hover:shadow-2xl">
                  {/* Animated Border Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${contributor.color} opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10`}></div>
                  <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-3xl z-0"></div>

                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${contributor.color} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>

                  {/* Content */}
                  <div className="relative z-10 p-8">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className="text-6xl mb-4 flex justify-center"
                    >
                      {contributor.icon}
                    </motion.div>

                    {/* Number Badge */}
                    <div className={`absolute top-4 right-4 w-10 h-10 bg-gradient-to-br ${contributor.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>

                    {/* Name */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center group-hover:scale-105 transition-transform duration-300">
                      {language === 'ar' ? contributor.nameAr : contributor.name}
                    </h3>

                    {/* Divider */}
                    <div className="my-4 flex items-center justify-center space-x-2">
                      <Sparkles className={`w-4 h-4 text-${contributor.hoverColor}-500 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse`} />
                      <div className={`h-0.5 w-0 bg-gradient-to-r ${contributor.color} group-hover:w-16 transition-all duration-500`}></div>
                      <Sparkles className={`w-4 h-4 text-${contributor.hoverColor}-500 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse delay-100`} />
                    </div>

                    {/* Idea */}
                    <div className={`p-4 bg-gradient-to-br ${contributor.color} bg-opacity-10 rounded-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 group-hover:border-transparent transition-all duration-500`}>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium text-center leading-relaxed">
                        {language === 'ar' ? contributor.ideaAr : contributor.idea}
                      </p>
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute top-6 left-6 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce"></div>
                    <div className="absolute bottom-8 right-8 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 animate-bounce"></div>
                    <div className="absolute top-1/2 left-4 w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-600 delay-200 animate-bounce"></div>
                  </div>

                  {/* Corner Accents */}
                  <div className={`absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-transparent group-hover:border-${contributor.hoverColor}-400 transition-all duration-500 rounded-tl-3xl`}></div>
                  <div className={`absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-transparent group-hover:border-${contributor.hoverColor}-400 transition-all duration-500 rounded-br-3xl`}></div>

                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Thank You Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-20 text-center"
          >
            <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl p-8 md:p-12 border border-yellow-300/30 shadow-2xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-6xl mb-6"
              >
                🙏
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'شكراً جزيلاً!' : 'Thank You So Much!'}
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {language === 'ar' 
                  ? 'أفكاركم الإبداعية جعلت منصتنا أفضل بكثير. نحن ممتنون لمساهماتكم القيمة!'
                  : 'Your creative ideas made our platform so much better. We are grateful for your valuable contributions!'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContributionsPage;

