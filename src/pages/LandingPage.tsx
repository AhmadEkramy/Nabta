import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Bot,
    Facebook,
    Gamepad2,
    Globe,
    Instagram,
    Mail,
    MapPin,
    Moon,
    Phone,
    Sun,
    Target,
    Trophy,
    Twitter,
    Users,
    Youtube
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Smooth scroll function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 80; // Account for fixed header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const features = [
    {
      icon: Users,
      title: language === 'ar' ? 'نبتة' : 'Nabta',
      description: language === 'ar' ? 'انضم إلى دوائر متخصصة في اللغات، البرمجة، الصحة والمزيد' : 'Join specialized circles for languages, programming, health and more'
    },
    {
      icon: Target,
      title: language === 'ar' ? 'أنماط التركيز' : 'Focus Modes',
      description: language === 'ar' ? 'وضع الإنتاجية، التأمل، والتركيز العميق مع مكافآت XP' : 'Productivity, meditation, and deep focus modes with XP rewards'
    },
    {
      icon: Bot,
      title: language === 'ar' ? 'المدرب الذكي' : 'AI Coach',
      description: language === 'ar' ? 'مدرب شخصي ذكي يحلل تقدمك ويقترح أهدافاً أسبوعية' : 'Smart personal coach that analyzes your progress and suggests weekly goals'
    },
    {
      icon: Gamepad2,
      title: language === 'ar' ? 'الألعاب التفاعلية' : 'Interactive Games',
      description: language === 'ar' ? 'العب واربح نقاط XP من خلال ألعاب الذاكرة والمنطق' : 'Play and earn XP through memory and logic games'
    },
    {
      icon: BookOpen,
      title: language === 'ar' ? 'القرآن الكريم' : 'Holy Quran',
      description: language === 'ar' ? 'آية يومية مع تتبع تقدمك في قراءة القرآن الكريم' : 'Daily verse with progress tracking for Quran reading'
    },
    {
      icon: Trophy,
      title: language === 'ar' ? 'نظام المكافآت' : 'Reward System',
      description: language === 'ar' ? '25 مستوى مع ألقاب فريدة وعوالم ثلاثية الأبعاد' : '25 levels with unique titles and 3D personal worlds'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer">
              <div className="relative w-12 h-12 transition-all duration-300 hover:scale-105 group-hover:rotate-6">
                {/* Glowing Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/60 to-green-500/60 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 blur-sm scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/40 to-green-600/40 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-300 blur-md scale-120"></div>
                
                {/* Logo Image */}
                <img 
                  src="/logo.png" 
                  alt="Nabta Logo" 
                  className="w-12 h-12 rounded-full object-cover relative z-10 shadow-lg group-hover:shadow-2xl group-hover:shadow-green-500/30 transition-all duration-300 group-hover:drop-shadow-lg"
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => smoothScrollTo('home')}
                className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-500 group cursor-pointer"
              >
                <span className="relative z-10 font-medium">
                  {language === 'ar' ? 'الرئيسية' : 'Home'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-green-500/20 group-hover:scale-105"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 group-hover:w-full transition-all duration-500"></div>
              </button>

              <button
                onClick={() => smoothScrollTo('about')}
                className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-500 group cursor-pointer"
              >
                <span className="relative z-10 font-medium">
                  {language === 'ar' ? 'من نحن' : 'About'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-green-500/20 group-hover:scale-105"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 group-hover:w-full transition-all duration-500"></div>
              </button>

              <button
                onClick={() => smoothScrollTo('features')}
                className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-500 group cursor-pointer"
              >
                <span className="relative z-10 font-medium">
                  {language === 'ar' ? 'الميزات' : 'Features'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-green-500/20 group-hover:scale-105"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 group-hover:w-full transition-all duration-500"></div>
              </button>

              <button
                onClick={() => smoothScrollTo('contact')}
                className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-500 group cursor-pointer"
              >
                <span className="relative z-10 font-medium">
                  {language === 'ar' ? 'تواصل معنا' : 'Contact'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-green-500/20 group-hover:scale-105"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 group-hover:w-full transition-all duration-500"></div>
              </button>


            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group hover:shadow-lg hover:shadow-gray-300/30 dark:hover:shadow-gray-700/30 hover:scale-110"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 dark:from-blue-400/20 dark:to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-yellow-500 transition-colors duration-300 relative z-10" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors duration-300 relative z-10" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="relative p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group hover:shadow-lg hover:shadow-gray-300/30 dark:hover:shadow-gray-700/30 hover:scale-110"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-green-500 transition-colors duration-300 relative z-10 group-hover:rotate-12" />
              </button>

              {/* Login Button */}
              <Link
                to="/login"
                className="relative px-6 py-2.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-xl transition-all duration-300 group font-medium hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20"></div>
                <span className="relative z-10">{t('login')}</span>
              </Link>

              {/* Signup Button */}
              <Link
                to="/signup"
                className="relative px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-green-500/30 font-medium group hover:scale-105 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center space-x-2">
                  <span>{t('signup')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMobileMenu}
                className="lg:hidden relative p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group hover:shadow-lg hover:shadow-gray-300/30 dark:hover:shadow-gray-700/30 hover:scale-110"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 w-5 h-5 flex flex-col justify-center space-y-1">
                  <div className={`w-full h-0.5 bg-gray-600 dark:bg-gray-300 group-hover:bg-green-500 transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                  <div className={`w-full h-0.5 bg-gray-600 dark:bg-gray-300 group-hover:bg-green-500 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-full h-0.5 bg-gray-600 dark:bg-gray-300 group-hover:bg-green-500 transition-all duration-300 transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-gray-200/20 dark:shadow-gray-900/40 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <nav className="space-y-4">
              <button
                onClick={() => smoothScrollTo('home')}
                className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-500 group hover:scale-105 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150"></div>
                  <span className="font-medium">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
                </div>
              </button>
              <button
                onClick={() => smoothScrollTo('about')}
                className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-500 group hover:scale-105 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150"></div>
                  <span className="font-medium">{language === 'ar' ? 'من نحن' : 'About'}</span>
                </div>
              </button>
              <button
                onClick={() => smoothScrollTo('features')}
                className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-500 group hover:scale-105 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150"></div>
                  <span className="font-medium">{language === 'ar' ? 'الميزات' : 'Features'}</span>
                </div>
              </button>
              <button
                onClick={() => smoothScrollTo('contact')}
                className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-500 group hover:scale-105 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150"></div>
                  <span className="font-medium">{language === 'ar' ? 'تواصل معنا' : 'Contact'}</span>
                </div>
              </button>

              {/* Mobile Login/Signup Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full block text-center px-4 py-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-300 font-medium border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full block text-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/30 font-medium"
                >
                  {t('signup')}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-green-25 to-green-100 dark:from-green-900/10 dark:via-green-800/5 dark:to-green-900/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-green-600/5 dark:from-green-400/3 dark:to-green-600/3"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.03),transparent_50%)]"></div>
        
        {/* Plant Illustrations */}
        {/* Large Plant - Top Left */}
        <div className="absolute top-10 left-10 opacity-20 dark:opacity-10 animate-pulse">
          <svg width="120" height="150" viewBox="0 0 120 150" className="text-green-500">
            <path d="M60 150 Q50 130 45 110 Q40 90 50 70 Q60 50 70 70 Q80 90 75 110 Q70 130 60 150" fill="currentColor" opacity="0.3"/>
            <path d="M60 150 Q70 130 75 110 Q80 90 70 70 Q60 50 50 70 Q40 90 45 110 Q50 130 60 150" fill="currentColor" opacity="0.4"/>
            <circle cx="60" cy="40" r="8" fill="currentColor" opacity="0.6"/>
            <circle cx="55" cy="35" r="4" fill="currentColor" opacity="0.8"/>
            <circle cx="65" cy="35" r="4" fill="currentColor" opacity="0.8"/>
          </svg>
        </div>

        {/* Medium Plant - Top Right */}
        <div className="absolute top-20 right-20 opacity-15 dark:opacity-8 animate-pulse delay-1000">
          <svg width="80" height="100" viewBox="0 0 80 100" className="text-green-600">
            <path d="M40 100 Q35 85 30 70 Q25 55 35 40 Q45 25 55 40 Q65 55 60 70 Q55 85 40 100" fill="currentColor" opacity="0.4"/>
            <path d="M40 100 Q45 85 50 70 Q55 55 45 40 Q35 25 25 40 Q15 55 20 70 Q25 85 40 100" fill="currentColor" opacity="0.3"/>
            <circle cx="40" cy="25" r="6" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        {/* Small Plants - Bottom */}
        <div className="absolute bottom-10 left-1/4 opacity-25 dark:opacity-12 animate-pulse delay-500">
          <svg width="60" height="80" viewBox="0 0 60 80" className="text-green-400">
            <path d="M30 80 Q25 65 20 50 Q15 35 25 25 Q35 15 45 25 Q55 35 50 50 Q45 65 30 80" fill="currentColor" opacity="0.5"/>
            <circle cx="30" cy="20" r="4" fill="currentColor" opacity="0.8"/>
          </svg>
        </div>

        <div className="absolute bottom-20 right-1/3 opacity-20 dark:opacity-10 animate-pulse delay-1500">
          <svg width="70" height="90" viewBox="0 0 70 90" className="text-green-500">
            <path d="M35 90 Q30 75 25 60 Q20 45 30 30 Q40 15 50 30 Q60 45 55 60 Q50 75 35 90" fill="currentColor" opacity="0.4"/>
            <path d="M35 90 Q40 75 45 60 Q50 45 40 30 Q30 15 20 30 Q10 45 15 60 Q20 75 35 90" fill="currentColor" opacity="0.3"/>
            <circle cx="35" cy="18" r="5" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        {/* Floating Leaves */}
        <div className="absolute top-1/3 left-1/5 opacity-30 dark:opacity-15 animate-bounce">
          <svg width="30" height="20" viewBox="0 0 30 20" className="text-green-400">
            <path d="M5 15 Q15 5 25 15 Q20 18 15 15 Q10 18 5 15" fill="currentColor"/>
          </svg>
        </div>

        <div className="absolute top-2/3 right-1/4 opacity-25 dark:opacity-12 animate-bounce delay-700">
          <svg width="25" height="18" viewBox="0 0 25 18" className="text-green-500">
            <path d="M3 13 Q12 3 22 13 Q18 16 12 13 Q8 16 3 13" fill="currentColor"/>
          </svg>
        </div>

        {/* Vine Decorations */}
        <div className="absolute top-1/2 left-5 opacity-20 dark:opacity-10">
          <svg width="40" height="200" viewBox="0 0 40 200" className="text-green-600">
            <path d="M20 0 Q30 20 20 40 Q10 60 20 80 Q30 100 20 120 Q10 140 20 160 Q30 180 20 200" 
                  stroke="currentColor" strokeWidth="3" fill="none" opacity="0.4"/>
            <circle cx="25" cy="30" r="3" fill="currentColor" opacity="0.6"/>
            <circle cx="15" cy="70" r="3" fill="currentColor" opacity="0.6"/>
            <circle cx="25" cy="110" r="3" fill="currentColor" opacity="0.6"/>
            <circle cx="15" cy="150" r="3" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>

        <div className="absolute top-1/4 right-8 opacity-18 dark:opacity-9">
          <svg width="35" height="180" viewBox="0 0 35 180" className="text-green-500">
            <path d="M17 0 Q25 18 17 36 Q9 54 17 72 Q25 90 17 108 Q9 126 17 144 Q25 162 17 180" 
                  stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
            <circle cx="22" cy="25" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="12" cy="60" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="22" cy="95" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="12" cy="130" r="2" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              {language === 'ar' ? (
                <>
                  <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                    نبتة
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl">منصة النمو الشخصي</span>
                </>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                    Nabta
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl">Personal Growth Platform</span>
                </>
              )}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'حوّل وقتك المهدور إلى وقت نمو. تواصل، انمُ، العب، تأمل، وازدهر في منصة واحدة شاملة.'
                : 'Turn wasted time into growth time. Connect, grow, play, reflect, and thrive in one comprehensive platform.'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span className="text-lg font-medium">
                  {language === 'ar' ? 'ابدأ رحلتك الآن' : 'Start Your Journey'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-lg font-medium"
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Plant Decorations for Features Section */}
        <div className="absolute top-10 left-10 opacity-10 dark:opacity-5 animate-pulse delay-400">
          <svg width="80" height="100" viewBox="0 0 80 100" className="text-green-400">
            <path d="M40 100 Q35 85 30 70 Q25 55 35 40 Q45 25 55 40 Q65 55 60 70 Q55 85 40 100" fill="currentColor" opacity="0.4"/>
            <circle cx="40" cy="25" r="4" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        <div className="absolute top-20 right-16 opacity-12 dark:opacity-6 animate-pulse delay-900">
          <svg width="70" height="90" viewBox="0 0 70 90" className="text-green-500">
            <path d="M35 90 Q30 75 25 60 Q20 45 30 30 Q40 15 50 30 Q60 45 55 60 Q50 75 35 90" fill="currentColor" opacity="0.3"/>
            <circle cx="35" cy="18" r="3" fill="currentColor" opacity="0.8"/>
          </svg>
        </div>

        <div className="absolute bottom-16 left-1/4 opacity-15 dark:opacity-8 animate-bounce delay-1100">
          <svg width="50" height="35" viewBox="0 0 50 35" className="text-green-600">
            <path d="M5 30 Q25 15 45 30 Q40 33 25 30 Q10 33 5 30" fill="currentColor" opacity="0.5"/>
            <circle cx="25" cy="20" r="2" fill="currentColor" opacity="0.8"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'ميزات شاملة' : 'Comprehensive Features'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'استكشف مجموعة متكاملة من الأدوات والميزات المصممة خصيصاً لرحلة نموك الشخصي'
                : 'Explore an integrated suite of tools and features designed specifically for your personal growth journey'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-transparent hover:border-green-500/30 overflow-hidden"
              >
                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-xl"></div>
                
                {/* Animated Border Glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/20 via-green-500/30 to-green-600/20 blur-sm"></div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Icon with Enhanced Glow */}
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/50 to-green-600/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg scale-125"></div>
                    <feature.icon className="w-6 h-6 text-white relative z-10 group-hover:drop-shadow-lg" />
                  </div>

                  {/* Title with Glow Effect */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-500 group-hover:drop-shadow-sm">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-500">
                    {feature.description}
                  </p>

                  {/* Animated Progress Bar */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out shadow-lg shadow-green-500/50"></div>
                    </div>
                  </div>

                  {/* Floating Particles Effect */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute bottom-6 left-4 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute top-1/2 right-6 opacity-0 group-hover:opacity-100 transition-all duration-900 delay-100">
                    <div className="w-1 h-1 bg-green-300 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Corner Glow Effects */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-green-500/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-8 translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-green-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-green-100">
                {language === 'ar' ? 'مستخدم نشط' : 'Active Users'}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white"
            >
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-green-100">
                {language === 'ar' ? 'نبتة' : 'Nabta'}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white"
            >
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-green-100">
                {language === 'ar' ? 'مهمة مكتملة' : 'Tasks Completed'}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white"
            >
              <div className="text-4xl font-bold mb-2">25</div>
              <div className="text-green-100">
                {language === 'ar' ? 'مستوى تقدم' : 'Progress Levels'}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              {language === 'ar' ? 'ابدأ رحلة النمو اليوم' : 'Start Your Growth Journey Today'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {language === 'ar' 
                ? 'انضم إلى آلاف المستخدمين الذين يحققون أهدافهم الشخصية يومياً'
                : 'Join thousands of users who achieve their personal goals daily'
              }
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
            >
              <span>
                {language === 'ar' ? 'إنشاء حساب مجاني' : 'Create Free Account'}
              </span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-green-25 to-green-100 dark:from-green-900/20 dark:via-green-800/10 dark:to-green-900/30 relative overflow-hidden">
        {/* Background Pattern Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-green-600/5 dark:from-green-400/3 dark:to-green-600/3"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.04),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.06),transparent_60%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.03),transparent_60%)]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-400/10 to-green-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-green-500/8 to-green-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-green-300/12 to-green-400/12 rounded-full blur-xl animate-pulse delay-500"></div>

        {/* Plant Illustrations for About Section */}
        {/* Decorative Plant - Left Side */}
        <div className="absolute top-16 left-16 opacity-15 dark:opacity-8 animate-pulse delay-300">
          <svg width="100" height="120" viewBox="0 0 100 120" className="text-green-400">
            <path d="M50 120 Q45 105 40 90 Q35 75 45 60 Q55 45 65 60 Q75 75 70 90 Q65 105 50 120" fill="currentColor" opacity="0.4"/>
            <path d="M50 120 Q55 105 60 90 Q65 75 55 60 Q45 45 35 60 Q25 75 30 90 Q35 105 50 120" fill="currentColor" opacity="0.3"/>
            <circle cx="50" cy="45" r="6" fill="currentColor" opacity="0.7"/>
            <circle cx="46" cy="40" r="3" fill="currentColor" opacity="0.8"/>
            <circle cx="54" cy="40" r="3" fill="currentColor" opacity="0.8"/>
          </svg>
        </div>

        {/* Decorative Plant - Right Side */}
        <div className="absolute top-32 right-12 opacity-12 dark:opacity-6 animate-pulse delay-800">
          <svg width="90" height="110" viewBox="0 0 90 110" className="text-green-500">
            <path d="M45 110 Q40 95 35 80 Q30 65 40 50 Q50 35 60 50 Q70 65 65 80 Q60 95 45 110" fill="currentColor" opacity="0.4"/>
            <circle cx="45" cy="35" r="5" fill="currentColor" opacity="0.8"/>
            <path d="M30 70 Q40 65 50 70" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
            <path d="M40 85 Q50 80 60 85" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
          </svg>
        </div>

        {/* Small Decorative Elements */}
        <div className="absolute bottom-24 left-1/4 opacity-20 dark:opacity-10 animate-bounce delay-1200">
          <svg width="40" height="30" viewBox="0 0 40 30" className="text-green-600">
            <path d="M5 25 Q20 10 35 25 Q30 28 20 25 Q10 28 5 25" fill="currentColor" opacity="0.6"/>
            <circle cx="20" cy="15" r="2" fill="currentColor" opacity="0.8"/>
          </svg>
        </div>

        <div className="absolute bottom-16 right-1/3 opacity-18 dark:opacity-9 animate-bounce delay-600">
          <svg width="35" height="25" viewBox="0 0 35 25" className="text-green-400">
            <path d="M3 20 Q17 8 32 20 Q27 23 17 20 Q7 23 3 20" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        {/* Vine Border Decoration */}
        <div className="absolute top-1/3 left-8 opacity-15 dark:opacity-8">
          <svg width="30" height="150" viewBox="0 0 30 150" className="text-green-500">
            <path d="M15 0 Q22 15 15 30 Q8 45 15 60 Q22 75 15 90 Q8 105 15 120 Q22 135 15 150" 
                  stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
            <circle cx="18" cy="20" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="12" cy="50" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="18" cy="80" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="12" cy="110" r="2" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Enhanced Title with Glow */}
            <div className="relative inline-block mb-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white relative z-10 group cursor-default">
                {language === 'ar' ? 'من نحن' : 'About Us'}
                <div className="absolute inset-0 text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm scale-110"></div>
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 via-green-500/30 to-green-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Enhanced Description with Glow Background */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"></div>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed relative z-10 p-6 rounded-2xl group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-500">
                  {language === 'ar' 
                    ? 'نبتة هي منصة شاملة للنمو الشخصي والروحي، تجمع بين التكنولوجيا الحديثة والحكمة التقليدية. نحن نؤمن بأن كل شخص لديه إمكانات لا محدودة للنمو والتطور، ونسعى لتوفير الأدوات والمجتمع المناسب لتحقيق ذلك.'
                    : 'Nabta is a comprehensive platform for personal and spiritual growth, combining modern technology with traditional wisdom. We believe that every person has unlimited potential for growth and development, and we strive to provide the right tools and community to achieve that.'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* Vision Card with Enhanced Glow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="group relative text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 hover:border-green-400/50 dark:hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20"
                >
                  {/* Card Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl"></div>
                  
                  {/* Enhanced Icon with Multiple Glow Layers */}
                  <div className="relative flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md scale-125"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/60 to-green-600/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl scale-150"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-300/40 to-green-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl scale-200"></div>
                      <Target className="w-8 h-8 text-white relative z-10 group-hover:drop-shadow-lg" />
                    </div>
                    
                    {/* Floating Particles around Icon */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-900 delay-200 animate-pulse"></div>
                    <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-800 delay-100 animate-pulse"></div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-500 relative z-10 group-hover:drop-shadow-sm">
                    {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-500 relative z-10">
                    {language === 'ar' 
                      ? 'عالم يحقق فيه كل فرد إمكاناته الكاملة'
                      : 'A world where every individual achieves their full potential'
                    }
                  </p>

                  {/* Corner Glow Effects */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-green-500/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-6 translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
                </motion.div>

                {/* Mission Card with Enhanced Glow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="group relative text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 hover:border-green-400/50 dark:hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20"
                >
                  {/* Card Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl"></div>
                  
                  {/* Enhanced Icon */}
                  <div className="relative flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md scale-125"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/60 to-green-600/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl scale-150"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-300/40 to-green-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl scale-200"></div>
                      <Users className="w-8 h-8 text-white relative z-10 group-hover:drop-shadow-lg" />
                    </div>
                    
                    {/* Floating Particles */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-900 delay-200 animate-pulse"></div>
                    <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-800 delay-100 animate-pulse"></div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-500 relative z-10 group-hover:drop-shadow-sm">
                    {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-500 relative z-10">
                    {language === 'ar' 
                      ? 'تمكين الأفراد من خلال التكنولوجيا والمجتمع'
                      : 'Empowering individuals through technology and community'
                    }
                  </p>

                  {/* Corner Glow Effects */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-green-500/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-6 translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
                </motion.div>

                {/* Values Card with Enhanced Glow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="group relative text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 hover:border-green-400/50 dark:hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20"
                >
                  {/* Card Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl"></div>
                  
                  {/* Enhanced Icon */}
                  <div className="relative flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md scale-125"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/60 to-green-600/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl scale-150"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-300/40 to-green-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl scale-200"></div>
                      <Trophy className="w-8 h-8 text-white relative z-10 group-hover:drop-shadow-lg" />
                    </div>
                    
                    {/* Floating Particles */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-900 delay-200 animate-pulse"></div>
                    <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-800 delay-100 animate-pulse"></div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-500 relative z-10 group-hover:drop-shadow-sm">
                    {language === 'ar' ? 'قيمنا' : 'Our Values'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-500 relative z-10">
                    {language === 'ar' 
                      ? 'النمو المستمر، الأصالة، والتميز'
                      : 'Continuous growth, authenticity, and excellence'
                    }
                  </p>

                  {/* Corner Glow Effects */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-green-500/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-6 translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0 blur-xl"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {language === 'ar' 
                ? 'نحن هنا لمساعدتك في رحلة نموك الشخصي'
                : 'We\'re here to help you on your personal growth journey'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300 group-hover:scale-110">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">support@growthcircles.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {language === 'ar' 
                      ? '123 شارع النمو، مدينة التطوير'
                      : '123 Growth Street, Development City'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
            >
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:shadow-md focus:shadow-lg focus:shadow-green-500/10"
                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:shadow-md focus:shadow-lg focus:shadow-green-500/10"
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:shadow-md focus:shadow-lg focus:shadow-green-500/10"
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا' : 'Write your message here'}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1 font-medium"
                >
                  {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Plant Decorations for Footer */}
        <div className="absolute top-8 left-12 opacity-8 dark:opacity-4 animate-pulse delay-200">
          <svg width="60" height="80" viewBox="0 0 60 80" className="text-green-400">
            <path d="M30 80 Q25 65 20 50 Q15 35 25 25 Q35 15 45 25 Q55 35 50 50 Q45 65 30 80" fill="currentColor" opacity="0.3"/>
            <circle cx="30" cy="20" r="3" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>

        <div className="absolute top-12 right-20 opacity-6 dark:opacity-3 animate-pulse delay-700">
          <svg width="50" height="70" viewBox="0 0 50 70" className="text-green-500">
            <path d="M25 70 Q20 55 15 40 Q10 25 20 15 Q30 5 40 15 Q50 25 45 40 Q40 55 25 70" fill="currentColor" opacity="0.4"/>
            <circle cx="25" cy="12" r="2" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        <div className="absolute bottom-8 left-1/3 opacity-10 dark:opacity-5 animate-bounce delay-1000">
          <svg width="40" height="25" viewBox="0 0 40 25" className="text-green-600">
            <path d="M3 20 Q20 8 37 20 Q32 23 20 20 Q8 23 3 20" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>

        <div className="absolute bottom-12 right-1/4 opacity-8 dark:opacity-4 animate-bounce delay-500">
          <svg width="35" height="20" viewBox="0 0 35 20" className="text-green-400">
            <path d="M2 15 Q17 5 32 15 Q27 18 17 15 Q7 18 2 15" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6 group cursor-pointer">
                <div className="relative w-12 h-12 transition-all duration-300 hover:scale-105 group-hover:rotate-6">
                  {/* Glowing Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/60 to-green-500/60 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 blur-sm scale-110"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/40 to-green-600/40 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-300 blur-md scale-120"></div>
                  
                  {/* Logo Image */}
                  <img 
                    src="/logo.png" 
                    alt="Nabta Logo" 
                    className="w-12 h-12 rounded-full object-cover relative z-10 shadow-lg group-hover:shadow-2xl group-hover:shadow-green-500/30 transition-all duration-300 group-hover:drop-shadow-lg"
                  />
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                {language === 'ar' 
                  ? 'منصة النمو الشخصي والروحي - حيث يلتقي التطوير الذاتي بالتكنولوجيا. انضم إلينا في رحلة التحول والنمو.'
                  : 'Personal and Spiritual Growth Platform - Where Self-Development Meets Technology. Join us on a journey of transformation and growth.'
                }
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-110 group"
                >
                  <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/25 hover:scale-110 group"
                >
                  <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 hover:scale-110 group"
                >
                  <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-110 group"
                >
                  <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-green-400">
                {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'من نحن' : 'About Us'}
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'الميزات' : 'Features'}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'تواصل معنا' : 'Contact'}
                  </a>
                </li>
                <li>
                  <Link to="/signup" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-green-400">
                {language === 'ar' ? 'الدعم' : 'Support'}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'مركز المساعدة' : 'Help Center'}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                    {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Nabta. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">
                  {language === 'ar' ? 'صُنع بـ' : 'Made with'}
                </span>
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">
                  {language === 'ar' ? 'في مصر' : 'in Egypt'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;