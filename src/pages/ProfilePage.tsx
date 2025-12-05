import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Award,
    BookOpen,
    Calendar,
    Clock,
    Grid3X3,
    MoreHorizontal,
    Share,
    Star,
    Target,
    TrendingUp,
    Trophy,
    User,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CoverImageModal from '../components/CoverImageModal';
import EditBioModal from '../components/EditBioModal';
import EditNameModal from '../components/EditNameModal';
import EditUsernameModal from '../components/EditUsernameModal';
import FollowersFollowingModal from '../components/FollowersFollowingModal';
import PostReactionsWrapper from '../components/PostReactionsWrapper';
import ProfileImageModal from '../components/ProfileImageModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserAchievements, getUserPosts, getUserProfile, updateUserNameEverywhere, updateUserProfile } from '../firebase/userProfile';
import { usePostShare } from '../hooks/usePostInteractions';
import { useSharedPosts } from '../hooks/useSharedPosts';
import { ExtendedUserType, Post } from '../types';



const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'shared'>('posts');

  // State for real data from Firestore
    const [profileData, setProfileData] = useState<ExtendedUserType | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [achievements, setAchievements] = useState<{
    id: number;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    icon: string;
    earned: boolean;
    requirement: number;
    current: number;
    type: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditBioModal, setShowEditBioModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showEditUsernameModal, setShowEditUsernameModal] = useState(false);
  const [showCoverImageModal, setShowCoverImageModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // Get shared posts
  const { sharedPosts, loading: loadingSharedPosts, refreshSharedPosts } = useSharedPosts(user?.id || '');
  
  // Post share/unshare hook
  const { share, unshare, loading: unshareLoading } = usePostShare();

  // Refresh user data once when component mounts
  useEffect(() => {
    const refreshOnMount = async () => {
      if (user?.id) {
        await refreshUser();
      }
    };
    refreshOnMount();
  }, [refreshUser, user?.id]); // Refresh user data when dependencies change

  // Load user profile data
  // Listen for shared posts refresh events
  useEffect(() => {
    const handleRefreshSharedPosts = () => {
      refreshSharedPosts();
    };

    window.addEventListener('refreshSharedPosts', handleRefreshSharedPosts);
    
    return () => {
      window.removeEventListener('refreshSharedPosts', handleRefreshSharedPosts);
    };
  }, [refreshSharedPosts]);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        const freshProfile = await getUserProfile(user.id);
        if (freshProfile) {
          setProfileData(freshProfile as ExtendedUserType);
        } else {
          setProfileData(user as unknown as ExtendedUserType); // Fallback to context user
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading profile data');
        setProfileData(user as unknown as ExtendedUserType); // Fallback to context user
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user, language]);

  // Load user posts
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingPosts(true);
        const posts = await getUserPosts(user.id);
        setUserPosts(posts);
      } catch (error) {
        console.error('Error loading user posts:', error);
        toast.error(language === 'ar' ? 'حدث خطأ في تحميل المنشورات' : 'Error loading posts');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    if (activeTab === 'posts') {
      loadUserPosts();
    }
  }, [user, activeTab, language]);

  // Load achievements
  useEffect(() => {
    const loadAchievements = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingAchievements(true);
        const userAchievements = await getUserAchievements(user.id);
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error loading achievements:', error);
        toast.error(language === 'ar' ? 'حدث خطأ في تحميل الإنجازات' : 'Error loading achievements');
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    loadAchievements();
  }, [user, language]);

  // Use real profile data or fallback to context user
  const displayUser = profileData || (user as unknown as ExtendedUserType);

  // Handle avatar update
  const handleAvatarUpdate = async (newAvatar: string) => {
    // Update local state immediately for better UX
    if (profileData) {
      setProfileData({ ...profileData, avatar: newAvatar });
    }
    // Refresh user context
    await refreshUser();
  };

  const stats = [
    {
      icon: <Trophy className="w-6 h-6" />,
      label: t('level'),
      value: displayUser?.level || 1,
      color: 'purple'
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: t('xp'),
      value: displayUser?.xp || 0,
      color: 'blue'
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: t('tasks.completed'),
      value: displayUser?.completedTasks || 0,
      color: 'green'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: t('verses.read'),
      value: typeof displayUser?.readVersesCount === 'number' 
        ? displayUser.readVersesCount 
        : (Array.isArray(displayUser?.readVerses) ? displayUser.readVerses.length : (typeof displayUser?.readVerses === 'number' ? displayUser.readVerses : 0)),
      color: 'teal'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: t('focus.hours'),
      value: parseFloat((displayUser?.focusHours || 0).toFixed(2)), // Round to 2 decimal places
      color: 'orange'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: t('streak'),
      value: displayUser?.streak || 0,
      color: 'red'
    }
  ];

  const colorClasses: { [key: string]: string } = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    teal: 'from-teal-500 to-teal-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header with Cover Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
          {displayUser?.coverImage && (
            <img
              src={displayUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {/* Edit Cover Button */}
          <button
            onClick={() => setShowCoverImageModal(true)}
            className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">
              {language === 'ar' ? 'تغيير الخلفية' : 'Edit Cover'}
            </span>
          </button>
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4">
            {isLoading ? (
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 animate-pulse" />
            ) : (
              <div className="relative group cursor-pointer w-32 h-32" onClick={() => setShowImageModal(true)}>
                <img
                  src={displayUser?.avatar}
                  alt={displayUser?.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover transition-transform group-hover:scale-105 shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser?.name || 'User')}&background=random&size=200`;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-center">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium">
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
                ) : (
                  displayUser?.name
                )}
              </h1>
              {!isLoading && (
                <button
                  onClick={() => setShowEditNameModal(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title={language === 'ar' ? 'تعديل الاسم' : 'Edit Name'}
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Username */}
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
              ) : (
                <>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{displayUser?.username || displayUser?.name.toLowerCase().replace(/\s+/g, '_')}
                  </p>
                  <button
                    onClick={() => setShowEditUsernameModal(true)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    title={language === 'ar' ? 'تعديل اسم المستخدم' : 'Edit Username'}
                  >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Bio */}
            <div className="flex items-start gap-2">
              {isLoading ? (
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64" />
              ) : (
                <>
                  <p className={`flex-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${!displayUser?.bio ? 'text-gray-400 dark:text-gray-500 italic' : ''}`}>
                    {displayUser?.bio || (language === 'ar' ? 'لم يتم إضافة نبذة شخصية بعد' : 'No bio added yet')}
                  </p>
                  {!isLoading && (
                    <button
                      onClick={() => setShowEditBioModal(true)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 mt-1"
                      title={language === 'ar' ? 'تعديل النبذة الشخصية' : 'Edit Bio'}
                    >
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="text-gray-600 dark:text-gray-400">
              {isLoading ? (
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64" />
              ) : (
                <p>{displayUser?.email}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {isLoading ? '...' : `${t('level')} ${displayUser?.level}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {isLoading ? '...' : `${displayUser?.xp} ${t('xp')}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {isLoading ? '...' : `${language === 'ar' ? 'انضم في' : 'Joined'} ${new Date(displayUser?.joinedAt || '').toLocaleDateString()}`}
                </span>
              </div>
            </div>

            {/* Followers and Following */}
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={() => setShowFollowersModal(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                disabled={isLoading}
              >
                <span className="text-gray-900 dark:text-white font-semibold">
                  {isLoading ? '...' : (displayUser?.followers || 0).toLocaleString()}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'متابع' : 'Followers'}
                </span>
              </button>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                disabled={isLoading}
              >
                <span className="text-gray-900 dark:text-white font-semibold">
                  {isLoading ? '...' : (displayUser?.following || 0).toLocaleString()}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'يتابع' : 'Following'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level Progress & Ranks Info */}
      {!isLoading && displayUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="w-6 h-6 text-purple-500" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'المستوى والرتب' : 'Level & Ranks'}
            </h3>
          </div>

          {/* Level Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'المستوى الحالي:' : 'Current Level:'} {displayUser.level}
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({(() => {
                    const titles = {
                      ar: ['مبتدئ', 'متعلم', 'متقدم', 'خبير', 'استاذ', 'عالم'],
                      en: ['Beginner', 'Learner', 'Advanced', 'Expert', 'Master', 'Scholar']
                    };
                    const index = Math.min(Math.floor(displayUser.level / 5), titles[language as 'ar' | 'en'].length - 1);
                    return titles[language as 'ar' | 'en'][index];
                  })()})
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {displayUser.xp} / {(displayUser.level) * 250} XP ({language === 'ar' ? 'للوصول للمستوى التالي' : 'to reach next level'})
              </span>
            </div>
            
            {/* Progress Bar */}
            {(() => {
              // النظام: Level = floor(XP / 250) + 1
              // نحسب المستوى الفعلي بناءً على الـ XP الحالي
              const actualLevel = Math.floor(displayUser.xp / 250) + 1;
              const actualNextLevel = actualLevel + 1;
              
              // XP المطلوب للوصول للمستوى الحالي (الحد الأدنى)
              const xpForCurrentLevel = (actualLevel - 1) * 250;
              // XP المطلوب للوصول للمستوى التالي
              const xpForNextLevel = actualLevel * 250;
              
              // التقدم داخل المستوى الحالي (من 0 إلى 250)
              const xpProgress = displayUser.xp - xpForCurrentLevel;
              // XP المتبقي للوصول للمستوى التالي
              const xpRemaining = xpForNextLevel - displayUser.xp;
              
              // النسبة المئوية للتقدم (من 0% إلى 100%)
              const progressPercent = Math.min(Math.max((xpProgress / 250) * 100, 0), 100);
              
              return (
                <>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 relative">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${progressPercent}%`, minWidth: progressPercent > 0 ? '4px' : '0' }}
                    >
                      {progressPercent > 15 && (
                        <span className="text-xs text-white font-medium">
                          {Math.round(progressPercent)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'ar' ? 'التقدم الحالي:' : 'Current Progress:'} {xpProgress} / 250 XP
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'ar' 
                        ? `تبقى ${xpRemaining} نقطة للوصول للمستوى ${actualNextLevel}`
                        : `${xpRemaining} XP remaining for Level ${actualNextLevel}`
                      }
                    </span>
                  </div>
                  
                  {actualLevel !== displayUser.level && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      {language === 'ar' 
                        ? `ملاحظة: المستوى الفعلي بناءً على XP هو ${actualLevel}`
                        : `Note: Actual level based on XP is ${actualLevel}`
                      }
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Ranks Table */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'جدول الرتب' : 'Ranks Table'}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                      {language === 'ar' ? 'المستوى' : 'Level'}
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                      {language === 'ar' ? 'XP المطلوب' : 'XP Required'}
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                      {language === 'ar' ? 'الرتبة' : 'Rank'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const titles = {
                      ar: ['مبتدئ', 'متعلم', 'متقدم', 'خبير', 'استاذ', 'عالم'],
                      en: ['Beginner', 'Learner', 'Advanced', 'Expert', 'Master', 'Scholar']
                    };
                    const ranks = [];
                    for (let level = 1; level <= 30; level++) {
                      const xpRequired = (level - 1) * 250;
                      const rankIndex = Math.min(Math.floor(level / 5), titles[language as 'ar' | 'en'].length - 1);
                      const isCurrentLevel = level === displayUser.level;
                      ranks.push(
                        <tr
                          key={level}
                          className={`border-b border-gray-100 dark:border-gray-800 ${
                            isCurrentLevel ? 'bg-green-50 dark:bg-green-900/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className={`font-medium ${isCurrentLevel ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {level}
                              {isCurrentLevel && ' ✓'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{xpRequired}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              isCurrentLevel 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {titles[language as 'ar' | 'en'][rankIndex]}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                    return ranks;
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                {isLoading ? (
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-16" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[stat.color]} text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Award className="w-6 h-6 text-yellow-500" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'الإنجازات' : 'Achievements'}
          </h3>
        </div>

        {isLoadingAchievements ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {language === 'ar' ? achievement.name.ar : achievement.name.en}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'ar' ? achievement.description.ar : achievement.description.en}
                    </p>
                    {!achievement.earned && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'ar' ? 'التقدم:' : 'Progress:'} {achievement.current}/{achievement.requirement}
                      </p>
                    )}
                    {achievement.earned && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {language === 'ar' ? 'مكتمل!' : 'Completed!'}
                      </p>
                    )}
                  </div>
                  {achievement.earned && (
                    <div className="text-green-500">
                      <Trophy className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Progress Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'posts'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>{language === 'ar' ? 'المنشورات' : 'Posts'}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'shared'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Share className="w-4 h-4" />
            <span>{language === 'ar' ? 'المشاركات' : 'Shared'}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'about'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'ar' ? 'حول' : 'About'}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {isLoadingPosts ? (
              // Loading skeleton for posts
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2 w-32" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-24" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20" />
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20" />
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : userPosts.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ar'
                    ? 'ابدأ بمشاركة إنجازاتك وأهدافك مع المجتمع'
                    : 'Start sharing your achievements and goals with the community'
                  }
                </p>
              </div>
            ) : (
              // Real posts
              userPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={displayUser?.avatar}
                        alt={displayUser?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {displayUser?.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                          {post.circleName && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400">{post.circleName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-900 dark:text-white mb-4">{post.content}</p>

                  {/* Post Reactions */}
                  <PostReactionsWrapper
                    postId={post.id}
                    comments={post.comments || 0}
                    shares={post.shares || 0}
                    onComment={() => console.log('Comment clicked')}
                    onShare={async () => {
                      if (!post.id) return;
                      try {
                        const success = await share(post.id);
                        if (success) {
                          toast.success(
                            language === 'ar' 
                              ? 'تم مشاركة المنشور بنجاح' 
                              : 'Post shared successfully'
                          );
                          // Refresh shared posts list
                          refreshSharedPosts();
                        } else {
                          toast.error(
                            language === 'ar' 
                              ? 'فشل مشاركة المنشور' 
                              : 'Failed to share post'
                          );
                        }
                      } catch (error) {
                        console.error('Error sharing post:', error);
                        toast.error(
                          language === 'ar' 
                            ? 'حدث خطأ أثناء مشاركة المنشور' 
                            : 'Error sharing post'
                        );
                      }
                    }}
                  />
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'shared' && (
          <div className="space-y-6">
            {loadingSharedPosts ? (
              // Loading skeleton for shared posts
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2 w-32" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-24" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20" />
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20" />
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sharedPosts.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'لا توجد مشاركات بعد' : 'No shared posts yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ar'
                    ? 'شارك المنشورات التي تعجبك مع دوائر النمو الخاصة بك'
                    : 'Share posts you like with your growth circles'
                  }
                </p>
              </div>
            ) : (
              // Shared posts
              sharedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.userAvatar}
                        alt={post.userName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {post.userName}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{post.sharedAt ? formatDistanceToNow(new Date(post.sharedAt), { addSuffix: true }) : ''}</span>
                          {post.circleName && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400">{post.circleName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!post.id || unshareLoading) return;
                        
                        try {
                          const success = await unshare(post.id);
                          if (success) {
                            toast.success(
                              language === 'ar' 
                                ? 'تم إلغاء مشاركة المنشور بنجاح' 
                                : 'Post unshared successfully'
                            );
                            // Refresh shared posts list
                            refreshSharedPosts();
                          } else {
                            toast.error(
                              language === 'ar' 
                                ? 'فشل إلغاء مشاركة المنشور' 
                                : 'Failed to unshare post'
                            );
                          }
                        } catch (error) {
                          console.error('Error unsharing post:', error);
                          toast.error(
                            language === 'ar' 
                              ? 'حدث خطأ أثناء إلغاء مشاركة المنشور' 
                              : 'Error unsharing post'
                          );
                        }
                      }}
                      disabled={unshareLoading}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={language === 'ar' ? 'الغاء المشاركة' : 'Unshare'}
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {language === 'ar' ? 'الغاء المشاركة' : 'Unshare'}
                      </span>
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-900 dark:text-white mb-4">{post.content}</p>

                  {/* Post Reactions */}
                  <PostReactionsWrapper
                    postId={post.id}
                    comments={post.comments || 0}
                    shares={post.shares || 0}
                    onComment={() => console.log('Comment clicked')}
                    onShare={async () => {
                      if (!post.id) return;
                      try {
                        const success = await share(post.id);
                        if (success) {
                          toast.success(
                            language === 'ar' 
                              ? 'تم مشاركة المنشور بنجاح' 
                              : 'Post shared successfully'
                          );
                          // Refresh shared posts list
                          refreshSharedPosts();
                        } else {
                          toast.error(
                            language === 'ar' 
                              ? 'فشل مشاركة المنشور' 
                              : 'Failed to share post'
                          );
                        }
                      } catch (error) {
                        console.error('Error sharing post:', error);
                        toast.error(
                          language === 'ar' 
                            ? 'حدث خطأ أثناء مشاركة المنشور' 
                            : 'Error sharing post'
                        );
                      }
                    }}
                  />
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'حول المستخدم' : 'About User'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      {language === 'ar' ? 'نبذة شخصية' : 'Bio'}
                    </h4>
                    {displayUser?.id === user?.id && (
                      <button
                        onClick={() => setShowEditBioModal(true)}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm"
                      >
                        <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {displayUser?.bio || (language === 'ar' ? 'لم يتم إضافة نبذة شخصية بعد' : 'No bio added yet')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Profile Image Modal */}
      {displayUser && (
        <ProfileImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          currentAvatar={displayUser.avatar || ''}
          userName={displayUser.name || 'User'}
          userId={displayUser.id}
          onAvatarUpdate={handleAvatarUpdate}
        />
      )}

      {/* Bio Edit Modal */}
      {displayUser && (
        <EditBioModal
          isOpen={showEditBioModal}
          onClose={() => setShowEditBioModal(false)}
          currentBio={displayUser.bio || ''}
          onSave={async (newBio: string) => {
            try {
              await updateUserProfile(displayUser.id, { bio: newBio });
              // Update local state immediately
              if (profileData) {
                setProfileData({ ...profileData, bio: newBio });
              }
              await refreshUser();
              toast.success(language === 'ar' ? 'تم تحديث النبذة الشخصية بنجاح' : 'Bio updated successfully');
            } catch (error) {
              console.error('Error updating bio:', error);
              toast.error(language === 'ar' ? 'حدث خطأ أثناء تحديث النبذة الشخصية' : 'Error updating bio');
            }
          }}
        />
      )}

      {/* Edit Name Modal */}
      {displayUser && (
        <EditNameModal
          isOpen={showEditNameModal}
          onClose={() => setShowEditNameModal(false)}
          currentName={displayUser.name || ''}
          onSave={async (newName: string) => {
            try {
              const loadingToast = toast.loading(
                language === 'ar' 
                  ? 'جاري تحديث الاسم في جميع المنشورات...' 
                  : 'Updating name across all posts...'
              );
              
              await updateUserNameEverywhere(displayUser.id, newName);
              await refreshUser();
              
              toast.success(
                language === 'ar' 
                  ? 'تم تحديث الاسم بنجاح في جميع الأماكن' 
                  : 'Name updated successfully everywhere',
                { id: loadingToast }
              );
              
              // Refresh the page data
              const freshProfile = await getUserProfile(displayUser.id);
              if (freshProfile) {
                setProfileData(freshProfile as ExtendedUserType);
              }
            } catch (error) {
              console.error('Error updating name:', error);
              toast.error(language === 'ar' ? 'حدث خطأ أثناء تحديث الاسم' : 'Error updating name');
            }
          }}
        />
      )}

      {/* Edit Username Modal */}
      {displayUser && showEditUsernameModal && (
        <EditUsernameModal
          currentUsername={displayUser.username || displayUser.name.toLowerCase().replace(/\s+/g, '_')}
          userId={displayUser.id}
          onClose={() => setShowEditUsernameModal(false)}
          onSave={async () => {
            try {
              await refreshUser();
              toast.success(
                language === 'ar' 
                  ? 'تم تحديث اسم المستخدم بنجاح' 
                  : 'Username updated successfully'
              );
              
              // Refresh the page data
              const freshProfile = await getUserProfile(displayUser.id);
              if (freshProfile) {
                setProfileData(freshProfile as ExtendedUserType);
              }
            } catch (error) {
              console.error('Error after updating username:', error);
            }
          }}
        />
      )}

      {/* Cover Image Modal */}
      {displayUser && (
        <CoverImageModal
          isOpen={showCoverImageModal}
          onClose={() => setShowCoverImageModal(false)}
          currentCoverImage={displayUser.coverImage}
          userId={displayUser.id}
          onCoverUpdate={async (newCoverUrl: string) => {
            try {
              await updateUserProfile(displayUser.id, { coverImage: newCoverUrl });
              await refreshUser();
              
              // Refresh the page data
              const freshProfile = await getUserProfile(displayUser.id);
              if (freshProfile) {
                setProfileData(freshProfile as ExtendedUserType);
              }
            } catch (error) {
              console.error('Error updating cover image:', error);
              throw error;
            }
          }}
        />
      )}

      {/* Followers Modal */}
      {displayUser && (
        <FollowersFollowingModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={displayUser.id}
          type="followers"
        />
      )}

      {/* Following Modal */}
      {displayUser && (
        <FollowersFollowingModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          userId={displayUser.id}
          type="following"
        />
      )}
    </div>
  );
};

export default ProfilePage;