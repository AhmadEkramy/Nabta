import {
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail,
    updatePassword
} from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
    Bell,
    BookOpen,
    Clock,
    Edit3,
    Globe,
    Lock,
    Mail,
    Moon,
    Sun,
    Trash2,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../firebase/config';
import {
    getUserProfile,
    updateUserProfile as updateFirestoreUserProfile
} from '../firebase/userProfile';
import {
    getUserSettings,
    updateUserPreferences,
    toggleUserSetting
} from '../firebase/userSettings';
import { syncUserQuranData } from '../firebase/syncQuranData';
import {
  getRemainingTime,
  initializeDailyUsage,
  updateDailyUsage,
  formatTime,
  formatTimeArabic
} from '../utils/timeTracking';

// User Settings Interface
interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
  };
  preferences?: {
    theme?: string;
    language?: string;
    religion?: 'muslim' | 'christian';
    dailyTimeLimit?: 'unlimited' | '1min' | '1hour';
  };
}

const SettingsPage: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, refreshUser } = useAuth();

  // State for user settings
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: {
      push: true,
      email: true,
    },
    preferences: {
      theme: 'system',
      language: 'en',
      religion: 'muslim',
    },
  });

  // State for edit modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State for form inputs
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmText: '',
  });

  const [loading, setLoading] = useState(false);
  const [syncingQuranData, setSyncingQuranData] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(Infinity);

  // Load user settings from Firebase
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return;

      try {
        // Load user profile
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfileData({
            name: userProfile.name || '',
            bio: userProfile.bio || '',
          });
        }

        // Load user settings from Firebase
        const firebaseSettings = await getUserSettings(user.id);
        setUserSettings({
          notifications: {
            push: firebaseSettings.notifications.push,
            email: firebaseSettings.notifications.email,
          },
          preferences: {
            theme: firebaseSettings.preferences?.theme || 'system',
            language: firebaseSettings.preferences?.language || 'en',
            religion: firebaseSettings.preferences?.religion || 'muslim',
            dailyTimeLimit: firebaseSettings.preferences?.dailyTimeLimit || 'unlimited',
          },
        });
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };

    loadUserSettings();
  }, [user?.id]);

  // Update remaining time countdown
  useEffect(() => {
    if (!user?.id) return;

    // Initialize daily usage tracking
    initializeDailyUsage(user.id);

    const updateRemainingTime = () => {
      const timeLimit = userSettings.preferences?.dailyTimeLimit || 'unlimited';
      if (timeLimit !== 'unlimited') {
        updateDailyUsage(user.id);
        const remaining = getRemainingTime(user.id, timeLimit);
        setRemainingTime(remaining);
      } else {
        setRemainingTime(Infinity);
      }
    };

    // Update immediately
    updateRemainingTime();

    // Update every second
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [user?.id, userSettings.preferences?.dailyTimeLimit]);

  // Handler functions
  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await updateFirestoreUserProfile(user.id, {
        name: profileData.name,
        bio: profileData.bio,
      });

      await refreshUser();
      setShowProfileModal(false);
      toast.success(
        language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully'
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        language === 'ar' ? 'خطأ في تحديث الملف الشخصي' : 'Error updating profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        emailData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update email
      await updateEmail(auth.currentUser, emailData.newEmail);

      setShowEmailModal(false);
      setEmailData({ newEmail: '', currentPassword: '' });
      toast.success(
        language === 'ar' ? 'تم تحديث البريد الإلكتروني بنجاح' : 'Email updated successfully'
      );
    } catch (error: any) {
      console.error('Error updating email:', error);
      let errorMessage = language === 'ar' ? 'خطأ في تحديث البريد الإلكتروني' : 'Error updating email';

      if (error.code === 'auth/wrong-password') {
        errorMessage = language === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already in use';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!auth.currentUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(
        language === 'ar' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match'
      );
      return;
    }

    setLoading(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);

      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(
        language === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully'
      );
    } catch (error: any) {
      console.error('Error updating password:', error);
      let errorMessage = language === 'ar' ? 'خطأ في تحديث كلمة المرور' : 'Error updating password';

      if (error.code === 'auth/wrong-password') {
        errorMessage = language === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = language === 'ar' ? 'كلمة المرور الجديدة ضعيفة' : 'New password is too weak';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    if (!auth.currentUser || !user?.id) return;

    const confirmText = language === 'ar' ? 'حذف حسابي' : 'DELETE MY ACCOUNT';
    if (deleteData.confirmText !== confirmText) {
      toast.error(
        language === 'ar' ? 'يرجى كتابة النص التأكيدي بشكل صحيح' : 'Please type the confirmation text correctly'
      );
      return;
    }

    setLoading(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        deleteData.password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.id));

      // Delete user account
      await deleteUser(auth.currentUser);

      toast.success(
        language === 'ar' ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully'
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      let errorMessage = language === 'ar' ? 'خطأ في حذف الحساب' : 'Error deleting account';

      if (error.code === 'auth/wrong-password') {
        errorMessage = language === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler for syncing Quran reading data
  const handleSyncQuranData = async () => {
    if (!user?.id) return;

    setSyncingQuranData(true);
    try {
      const result = await syncUserQuranData(user.id);
      
      if (result.success) {
        if (result.synced) {
          toast.success(
            language === 'ar' 
              ? `تم تحديث البيانات! الآيات المقروءة: ${result.newCount} (كان: ${result.oldCount})`
              : `Data synced! Verses read: ${result.newCount} (was: ${result.oldCount})`
          );
          // Refresh user data to show updated count
          await refreshUser();
        } else {
          toast.success(
            language === 'ar'
              ? 'البيانات محدثة بالفعل ✓'
              : 'Data is already up to date ✓'
          );
        }
      } else {
        toast.error(
          language === 'ar'
            ? 'خطأ في مزامنة البيانات'
            : 'Error syncing data'
        );
      }
    } catch (error) {
      console.error('Error syncing Quran data:', error);
      toast.error(
        language === 'ar'
          ? 'خطأ في مزامنة البيانات'
          : 'Error syncing data'
      );
    } finally {
      setSyncingQuranData(false);
    }
  };

  const handleSettingToggle = async (section: 'notifications', setting: string, value: boolean) => {
    if (!user?.id) return;

    try {
      // Update local state immediately for better UX
      const newSettings = {
        ...userSettings,
        [section]: {
          ...userSettings[section],
          [setting]: value,
        },
      };
      setUserSettings(newSettings);

      // Save to Firebase using the dedicated function
      await toggleUserSetting(user.id, `${section}.${setting}`, value);

      toast.success(
        language === 'ar' ? 'تم تحديث الإعدادات' : 'Settings updated'
      );
    } catch (error) {
      console.error('Error updating settings:', error);

      // Revert local state on error
      const revertedSettings = {
        ...userSettings,
        [section]: {
          ...userSettings[section],
          [setting]: !value,
        },
      };
      setUserSettings(revertedSettings);

      toast.error(
        language === 'ar' ? 'خطأ في تحديث الإعدادات' : 'Error updating settings'
      );
    }
  };

  const settingSections = [
    {
      title: language === 'ar' ? 'الحساب' : 'Account',
      icon: <User className="w-5 h-5" />,
      items: [
        {
          icon: <User className="w-4 h-4" />,
          label: language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information',
          action: 'edit',
          onClick: () => setShowProfileModal(true)
        },
        {
          icon: <Mail className="w-4 h-4" />,
          label: language === 'ar' ? 'تغيير البريد الإلكتروني' : 'Change Email',
          action: 'edit',
          onClick: () => setShowEmailModal(true)
        },
        {
          icon: <Lock className="w-4 h-4" />,
          label: language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password',
          action: 'edit',
          onClick: () => setShowPasswordModal(true)
        }
      ]
    },
    {
      title: language === 'ar' ? 'التفضيلات' : 'Preferences',
      icon: <Globe className="w-5 h-5" />,
      items: [
        {
          icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
          label: t('dark.mode'),
          action: 'toggle',
          value: isDark,
          onChange: toggleTheme
        },
        {
          icon: <Globe className="w-4 h-4" />,
          label: t('language'),
          action: 'toggle',
          value: language === 'ar',
          onChange: toggleLanguage
        },
        {
          icon: <BookOpen className="w-4 h-4" />,
          label: language === 'ar' ? 'الدين' : 'Religion',
          action: 'select',
          value: userSettings.preferences?.religion || 'muslim',
          options: [
            { value: 'muslim', label: language === 'ar' ? 'مسلم' : 'Muslim' },
            { value: 'christian', label: language === 'ar' ? 'مسيحي' : 'Christian' }
          ],
          onChange: async (value: 'muslim' | 'christian') => {
            if (!user?.id) return;
            try {
              await updateUserPreferences(user.id, { religion: value });
              setUserSettings(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  religion: value
                }
              }));
              toast.success(
                language === 'ar' ? 'تم تحديث الدين' : 'Religion updated'
              );
            } catch (error) {
              console.error('Error updating religion:', error);
              toast.error(
                language === 'ar' ? 'خطأ في تحديث الدين' : 'Error updating religion'
              );
            }
          }
        },
        {
          icon: <Clock className="w-4 h-4" />,
          label: language === 'ar' ? 'الحد اليومي لاستخدام الموقع' : 'Daily Time Limit',
          action: 'select',
          value: userSettings.preferences?.dailyTimeLimit || 'unlimited',
          options: [
            { value: 'unlimited', label: language === 'ar' ? 'لانهائي' : 'Unlimited' },
            { value: '1min', label: language === 'ar' ? 'دقيقة واحدة' : '1 Minute' },
            { value: '1hour', label: language === 'ar' ? 'ساعة واحدة' : '1 Hour' }
          ],
          onChange: async (value: 'unlimited' | '1min' | '1hour') => {
            if (!user?.id) return;
            try {
              await updateUserPreferences(user.id, { dailyTimeLimit: value });
              setUserSettings(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  dailyTimeLimit: value
                }
              }));
              toast.success(
                language === 'ar' ? 'تم تحديث الحد اليومي' : 'Daily time limit updated'
              );
            } catch (error) {
              console.error('Error updating daily time limit:', error);
              toast.error(
                language === 'ar' ? 'خطأ في تحديث الحد اليومي' : 'Error updating daily time limit'
              );
            }
          }
        }
      ]
    },
    {
      title: language === 'ar' ? 'الإشعارات' : 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      items: [
        {
          icon: <Bell className="w-4 h-4" />,
          label: language === 'ar' ? 'إشعارات الدفع' : 'Push Notifications',
          action: 'toggle',
          value: userSettings.notifications.push,
          onChange: (value: boolean) => handleSettingToggle('notifications', 'push', value)
        },
        {
          icon: <Mail className="w-4 h-4" />,
          label: language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications',
          action: 'toggle',
          value: userSettings.notifications.email,
          onChange: (value: boolean) => handleSettingToggle('notifications', 'email', value)
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('settings')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {language === 'ar' ? 'اضبط تفضيلاتك وإعدادات حسابك' : 'Customize your preferences and account settings'}
        </p>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * sectionIndex }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              {section.icon}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
            </div>

            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${
                    item.action === 'select' && item.label === (language === 'ar' ? 'الحد اليومي لاستخدام الموقع' : 'Daily Time Limit')
                      ? 'flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.label}
                    </span>
                  </div>

                  {item.action === 'toggle' && (
                    <button
                      onClick={() => item.onChange(!item.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}

                  {item.action === 'edit' && (
                    <button
                      onClick={item.onClick}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                    </button>
                  )}

                  {item.action === 'select' && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      {item.label === (language === 'ar' ? 'الحد اليومي لاستخدام الموقع' : 'Daily Time Limit') && 
                       userSettings.preferences?.dailyTimeLimit !== 'unlimited' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 w-full sm:w-auto justify-center sm:justify-start">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {language === 'ar' ? 'المتبقي:' : 'Remaining:'}
                          </span>
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            {language === 'ar' 
                              ? formatTimeArabic(remainingTime)
                              : formatTime(remainingTime)}
                          </span>
                        </div>
                      )}
                      <select
                        value={item.value}
                        onChange={(e) => {
                          if (item.label === (language === 'ar' ? 'الحد اليومي لاستخدام الموقع' : 'Daily Time Limit')) {
                            item.onChange(e.target.value as 'unlimited' | '1min' | '1hour');
                          } else {
                            item.onChange(e.target.value as 'muslim' | 'christian');
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
                      >
                        {item.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'إدارة البيانات' : 'Data Management'}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {language === 'ar' ? 'مزامنة بيانات القرآن' : 'Sync Quran Data'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'تحديث عدد الآيات المقروءة من السجلات الفعلية' 
                  : 'Update verses read count from actual records'}
              </p>
            </div>
            <button
              onClick={handleSyncQuranData}
              disabled={syncingQuranData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncingQuranData ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{language === 'ar' ? 'جاري المزامنة...' : 'Syncing...'}</span>
                </>
              ) : (
                <span>{language === 'ar' ? 'مزامنة' : 'Sync'}</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800"
      >
        <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
          {language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-800 dark:text-red-400">
                {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
              </p>
              <p className="text-sm text-red-600 dark:text-red-500">
                {language === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'تحديث الملف الشخصي' : 'Update Profile'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'النبذة الشخصية' : 'Bio'}
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث' : 'Update')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'تغيير البريد الإلكتروني' : 'Change Email'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني الجديد' : 'New Email'}
                </label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={emailData.currentPassword}
                  onChange={(e) => setEmailData({ ...emailData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleEmailUpdate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث' : 'Update')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handlePasswordUpdate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث' : 'Update')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Account Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
            </h3>

            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar'
                  ? 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.'
                  : 'This action cannot be undone. All your data will be permanently deleted.'
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="password"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar'
                    ? 'اكتب "حذف حسابي" للتأكيد'
                    : 'Type "DELETE MY ACCOUNT" to confirm'
                  }
                </label>
                <input
                  type="text"
                  value={deleteData.confirmText}
                  onChange={(e) => setDeleteData({ ...deleteData, confirmText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleAccountDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') : (language === 'ar' ? 'حذف الحساب' : 'Delete Account')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;