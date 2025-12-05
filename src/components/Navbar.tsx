import { Bell, Globe, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLevelTitle = (level: number) => {
    const titles = {
      ar: ['مبتدئ', 'متعلم', 'متقدم', 'خبير', 'استاذ', 'عالم'],
      en: ['Beginner', 'Learner', 'Advanced', 'Expert', 'Master', 'Scholar']
    };
    const index = Math.min(Math.floor(level / 5), titles[language].length - 1);
    return titles[language][index];
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Growth Circles Logo" 
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              {/* Notifications button - visible on mobile */}
              <Link
                to="/notifications"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              >
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              {/* Hamburger menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
              {user && (
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="flex items-center gap-3 rtl:space-x-reverse">
                    {/* Level Badge */}
                    <div className="flex items-center space-x-1 rtl:space-x-reverse bg-[#1bc46d] bg-opacity-10 text-[#1bc46d] px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">
                        {t('level')} {user.level}
                      </span>
                      <span className="text-xs">
                        {getLevelTitle(user.level)}
                      </span>
                      <span className="text-xs">•</span>
                    </div>

                    {/* XP Badge */}
                    <div className="flex items-center space-x-1 rtl:space-x-reverse bg-[#4c8bf5] bg-opacity-10 text-[#4c8bf5] px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">{user.xp}</span>
                      <span className="text-sm">XP</span>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center space-x-1 rtl:space-x-reverse bg-[#ff6b21] bg-opacity-10 text-[#ff6b21] px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">{user.streak}</span>
                      <span className="text-sm">{t('streak')}</span>
                      <span className="text-sm">🔥</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              <button
                onClick={toggleLanguage}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <Link
                to="/notifications"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {user && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Link to="/profile" className="flex items-center space-x-2 rtl:space-x-reverse hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className={`fixed inset-y-0 ${language === 'ar' ? 'left-0' : 'right-0'} w-64 bg-white dark:bg-gray-800 shadow-xl p-6`}>
            {user && (
              <div className="space-y-4">
                <Link to="/profile" className="flex items-center space-x-3 rtl:space-x-reverse mb-6" onClick={() => setIsMobileMenuOpen(false)}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('level')} {user.level} • {user.xp} XP
                    </div>
                  </div>
                </Link>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-700 dark:text-green-400">{t('level')} {user.level}</span>
                    <span className="text-sm text-green-600 dark:text-green-500">{getLevelTitle(user.level)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-blue-700 dark:text-blue-400">XP</span>
                    <span className="text-sm text-blue-600 dark:text-blue-500">{user.xp}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-orange-700 dark:text-orange-400">{t('streak')}</span>
                    <span className="text-sm text-orange-600 dark:text-orange-500">{user.streak} 🔥</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-4 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{isDark ? t('lightMode') : t('darkMode')}</span>
                  </button>

                  <button
                    onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Globe className="w-5 h-5" />
                    <span>{language === 'ar' ? 'English' : 'العربية'}</span>
                  </button>

                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;