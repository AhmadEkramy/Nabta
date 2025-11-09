import {
  Activity,
  BookOpen,
  Bot,
  Calendar,
  CheckSquare,
  Gamepad2,
  Home,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Shield,
  ShoppingBag,
  Target,
  User,
  Users
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserSettings } from '../firebase/userSettings';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [showMore, setShowMore] = useState(false);
  const [religion, setReligion] = useState<'muslim' | 'christian'>('muslim');

  // Load user's religion preference
  useEffect(() => {
    const loadReligionPreference = async () => {
      if (!user?.id) {
        setReligion('muslim'); // Default to muslim
        return;
      }

      try {
        const settings = await getUserSettings(user.id);
        setReligion(settings.preferences?.religion || 'muslim');
      } catch (error) {
        console.error('Error loading religion preference:', error);
        setReligion('muslim'); // Default to muslim
      }
    };

    loadReligionPreference();
  }, [user?.id]);

  // Get sacred text label based on religion
  const getSacredTextLabel = () => {
    if (religion === 'christian') {
      return language === 'ar' ? 'الإنجيل' : 'Bible';
    }
    return t('nav.quran');
  };

  // Memoize navItems to update when religion or language changes
  const navItems = useMemo(() => {
    const items = [
      { to: '/home', icon: Home, label: t('nav.home') },
      { to: '/circles', icon: Users, label: t('nav.circles') },
      { to: '/chat', icon: MessageCircle, label: language === 'ar' ? 'المحادثات' : 'Chat' },
      { to: '/health', icon: Activity, label: language === 'ar' ? 'متتبع الصحة' : 'Health Tracker' },
      { to: '/habits', icon: Calendar, label: language === 'ar' ? 'متتبع العادات' : 'Habit Tracker' },
      { to: '/todos', icon: CheckSquare, label: language === 'ar' ? 'قائمة المهام' : 'To Do List' },
      { to: '/focus', icon: Target, label: t('nav.focus') },
      { to: '/coach', icon: Bot, label: t('nav.coach') },
      { to: '/games', icon: Gamepad2, label: t('nav.games') },
      { to: '/quran', icon: BookOpen, label: getSacredTextLabel() },
      { to: '/store', icon: ShoppingBag, label: language === 'ar' ? 'المتجر' : 'Store' },
      { to: '/profile', icon: User, label: t('nav.profile') },
      { to: '/settings', icon: Settings, label: t('settings') },
    ];

    if (user?.isAdmin) {
      items.push({ to: '/admin', icon: Shield, label: 'Admin' });
    }

    return items;
  }, [religion, language, t, user?.isAdmin]);

  // Split items for mobile view
  const primaryNavItems = navItems.slice(0, 4);
  const secondaryNavItems = navItems.slice(4);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="h-full w-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-300 overflow-y-auto">
        <div className="p-6">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-40 lg:hidden transition-colors duration-300">
        <nav className="flex justify-between items-center h-16 px-2">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 ${
                  isActive
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 text-gray-600 dark:text-gray-400"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs mt-1">{language === 'ar' ? 'المزيد' : 'More'}</span>
          </button>
        </nav>

        {/* More menu dropdown */}
        {showMore && (
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg max-h-[70vh] overflow-y-auto">
            <div className="p-2 grid grid-cols-4 gap-2">
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-green-500 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs mt-1 text-center">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;