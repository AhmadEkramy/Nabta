import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Award,
    BookOpen,
    Calendar,
    Clock,
    Grid3X3,
    MoreHorizontal,
    Star,
    Target,
    TrendingUp,
    Trophy,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PostReactionsWrapper from '../components/PostReactionsWrapper';
import ProfileImageModal from '../components/ProfileImageModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserAchievements, getUserPosts, getUserProfile } from '../firebase/userProfile';
import { User as UserType } from '../types';

type ReactionType = 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  // State for real data from Firestore
  const [profileData, setProfileData] = useState<UserType | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Refresh user data once when component mounts
  useEffect(() => {
    const refreshOnMount = async () => {
      if (user?.id) {
        await refreshUser();
      }
    };
    refreshOnMount();
  }, []); // Only run once on mount

  // Load user profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        const freshProfile = await getUserProfile(user.id);
        if (freshProfile) {
          setProfileData(freshProfile);
        } else {
          setProfileData(user); // Fallback to context user
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading profile data');
        setProfileData(user); // Fallback to context user
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
  const displayUser = profileData || user;

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
      value: displayUser?.readVersesCount || (Array.isArray(displayUser?.readVerses) ? displayUser.readVerses.length : displayUser?.readVerses) || 0,
      color: 'teal'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: t('focus.hours'),
      value: Math.round((displayUser?.focusHours || 0) * 10) / 10, // Round to 1 decimal place
      color: 'orange'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: t('streak'),
      value: displayUser?.streak || 0,
      color: 'red'
    }
  ];

  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    teal: 'from-teal-500 to-teal-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center space-x-6">
          {isLoading ? (
            <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 animate-pulse" />
          ) : (
            <div className="relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
              <img
                src={displayUser?.avatar}
                alt={displayUser?.name}
                className="w-24 h-24 rounded-full border-4 border-white/20 object-cover transition-transform group-hover:scale-105"
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
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {isLoading ? (
                <div className="h-10 bg-white/10 rounded animate-pulse w-48" />
              ) : (
                displayUser?.name
              )}
            </h1>
            <div className="text-green-100 text-lg mb-4">
              {isLoading ? (
                <div className="h-6 bg-white/10 rounded animate-pulse w-64" />
              ) : (
                <p className="text-green-100 text-lg">{displayUser?.email}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">
                  {isLoading ? '...' : `${t('level')} ${displayUser?.level}`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span className="font-medium">
                  {isLoading ? '...' : `${displayUser?.xp} ${t('xp')}`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  {isLoading ? '...' : `${language === 'ar' ? 'انضم في' : 'Joined'} ${new Date(displayUser?.joinedAt || '').toLocaleDateString()}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>{language === 'ar' ? 'المنشورات' : 'Posts'}</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
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
                    onShare={() => console.log('Share clicked')}
                  />
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {language === 'ar' ? 'تقدم هذا الأسبوع' : 'This Week Progress'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}
                </h4>
                <div className="space-y-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 w-16">{day.slice(0, 3)}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{Math.floor(Math.random() * 10)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'ar' ? 'ساعات التركيز' : 'Focus Hours'}
                </h4>
                <div className="space-y-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 w-16">{day.slice(0, 3)}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{(Math.random() * 5).toFixed(1)}h</span>
                    </div>
                  ))}
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
    </div>
  );
};

export default ProfilePage;