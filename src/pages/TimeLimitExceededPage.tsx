import { motion } from 'framer-motion';
import { Clock, Calendar, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserSettings, updateUserPreferences } from '../firebase/userSettings';

const TimeLimitExceededPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>('');
  const [currentLimit, setCurrentLimit] = useState<'unlimited' | '1min' | '1hour'>('unlimited');
  const [loading, setLoading] = useState(false);

  // Load current time limit
  useEffect(() => {
    const loadTimeLimit = async () => {
      if (!user?.id) return;
      
      try {
        const settings = await getUserSettings(user.id);
        setCurrentLimit(settings.preferences?.dailyTimeLimit || 'unlimited');
      } catch (error) {
        console.error('Error loading time limit:', error);
      }
    };

    loadTimeLimit();
  }, [user?.id]);

  // Handle time limit change
  const handleTimeLimitChange = async (newLimit: 'unlimited' | '1min' | '1hour') => {
    if (!user?.id || loading) return;

    setLoading(true);
    try {
      await updateUserPreferences(user.id, { dailyTimeLimit: newLimit });
      setCurrentLimit(newLimit);
      
      toast.success(
        language === 'ar' 
          ? 'تم تحديث الحد اليومي بنجاح' 
          : 'Daily time limit updated successfully'
      );

      // If user changed to unlimited or a higher limit, redirect to home immediately
      if (newLimit === 'unlimited' || newLimit === '1hour') {
        // Use window.location.href for forced redirect to ensure ProtectedRoute re-checks
        setTimeout(() => {
          window.location.href = '/home';
        }, 500);
      }
    } catch (error) {
      console.error('Error updating time limit:', error);
      toast.error(
        language === 'ar' 
          ? 'خطأ في تحديث الحد اليومي' 
          : 'Error updating daily time limit'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateTimeUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (language === 'ar') {
        setTimeUntilMidnight(`${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`);
      } else {
        setTimeUntilMidnight(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimeUntilMidnight();
    const interval = setInterval(updateTimeUntilMidnight, 1000);

    return () => clearInterval(interval);
  }, [language]);

  const today = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {language === 'ar' ? 'تم تجاوز الحد اليومي' : 'Daily Time Limit Exceeded'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 dark:text-gray-300 mb-8"
        >
          {language === 'ar' 
            ? 'لقد استخدمت الحد اليومي المحدد لاستخدام الموقع. يمكنك العودة غداً.'
            : 'You have used your daily time limit for the site. You can return tomorrow.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'اليوم' : 'Today'}
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{today}</p>
          
          <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {language === 'ar' ? 'الوقت المتبقي حتى اليوم التالي:' : 'Time until next day:'}
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {timeUntilMidnight}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تغيير الحد اليومي' : 'Change Daily Time Limit'}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {language === 'ar' 
              ? 'يمكنك تغيير الحد اليومي للعودة إلى الموقع الآن'
              : 'You can change your daily time limit to return to the site now'}
          </p>

          <div className="flex items-center justify-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'ar' ? 'الحد اليومي:' : 'Daily Limit:'}
            </label>
            <select
              value={currentLimit}
              onChange={(e) => handleTimeLimitChange(e.target.value as 'unlimited' | '1min' | '1hour')}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="unlimited">
                {language === 'ar' ? 'لانهائي' : 'Unlimited'}
              </option>
              <option value="1min">
                {language === 'ar' ? 'دقيقة واحدة' : '1 Minute'}
              </option>
              <option value="1hour">
                {language === 'ar' ? 'ساعة واحدة' : '1 Hour'}
              </option>
            </select>
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TimeLimitExceededPage;

