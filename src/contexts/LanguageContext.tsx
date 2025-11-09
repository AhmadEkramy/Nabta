import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'ar' | 'en';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.circles': 'دوائر النمو',
    'nav.focus': 'التركيز',
    'nav.coach': 'المدرب الذكي',
    'nav.games': 'الألعاب',
    'nav.quran': 'القرآن',
    'nav.profile': 'الملف الشخصي',
    'welcome': 'مرحباً بك في دوائر النمو',
    'login': 'تسجيل الدخول',
    'signup': 'إنشاء حساب',
    'level': 'المستوى',
    'xp': 'نقاط الخبرة',
    'streak': 'سلسلة الإنجازات',
    'verses.read': 'آيات مقروءة',
    'tasks.completed': 'مهام مكتملة',
    'focus.hours': 'ساعات التركيز',
    'daily.verse': 'آية اليوم',
    'mark.read': 'تم القراءة',
    'growth.circles': 'دوائر النمو',
    'join.circle': 'انضم للدائرة',
    'members': 'أعضاء',
    'posts': 'منشورات',
    'focus.modes': 'أنماط التركيز',
    'productivity': 'الإنتاجية',
    'meditation': 'التأمل',
    'urgent': 'عاجل',
    'start.session': 'بدء الجلسة',
    'ai.coach': 'المدرب الذكي',
    'weekly.goals': 'أهداف الأسبوع',
    'progress.analysis': 'تحليل التقدم',
    'tips': 'نصائح',
    'games': 'الألعاب',
    'play.now': 'العب الآن',
    'notifications': 'الإشعارات',
    'settings': 'الإعدادات',
    'dark.mode': 'الوضع الليلي',
    'language': 'اللغة'
  },
  en: {
    'nav.home': 'Home',
    'nav.circles': 'Growth Circles',
    'nav.focus': 'Focus',
    'nav.coach': 'AI Coach',
    'nav.games': 'Games',
    'nav.quran': 'Quran',
    'nav.profile': 'Profile',
    'welcome': 'Welcome to Growth Circles',
    'login': 'Login',
    'signup': 'Sign Up',
    'level': 'Level',
    'xp': 'XP',
    'streak': 'Streak',
    'verses.read': 'Verses Read',
    'tasks.completed': 'Tasks Completed',
    'focus.hours': 'Focus Hours',
    'daily.verse': 'Daily Verse',
    'mark.read': 'Mark as Read',
    'growth.circles': 'Growth Circles',
    'join.circle': 'Join Circle',
    'members': 'Members',
    'posts': 'Posts',
    'focus.modes': 'Focus Modes',
    'productivity': 'Productivity',
    'meditation': 'Meditation',
    'urgent': 'Urgent',
    'start.session': 'Start Session',
    'ai.coach': 'AI Coach',
    'weekly.goals': 'Weekly Goals',
    'progress.analysis': 'Progress Analysis',
    'tips': 'Tips',
    'games': 'Games',
    'play.now': 'Play Now',
    'notifications': 'Notifications',
    'settings': 'Settings',
    'dark.mode': 'Dark Mode',
    'language': 'Language'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};