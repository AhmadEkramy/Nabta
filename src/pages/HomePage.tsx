import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Loader2,
    MessageCircle,
    Plus,
    Target,
    TrendingUp,
    UserPlus,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import DailyVerse from '../components/DailyVerse';
import PostCard from '../components/PostCard';
import StatsCard from '../components/StatsCard';
import StoriesSection from '../components/StoriesSection';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import { followUser, getSuggestedUsers } from '../firebase';
import {
    useCreatePost,
    useHomeFeedPosts,
    useQuranProgress,
    useRecentActivity
} from '../hooks/useHomePage';
import { User } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { addXP } = useGame();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  // Use Firebase hooks for real data
  const { posts, loading: postsLoading, error: postsError, refreshPosts } = useHomeFeedPosts();
  const { activities, loading: activitiesLoading } = useRecentActivity();
  const { createPost } = useCreatePost();
  const { progress: quranProgress, loading: quranLoading } = useQuranProgress();

  // Load suggested users
  useEffect(() => {
    const loadSuggestedUsers = async () => {
      if (!user?.id) return;
      
      setLoadingSuggested(true);
      try {
        const users = await getSuggestedUsers(user.id, 5);
        setSuggestedUsers(users);
      } catch (error) {
        console.error('Error loading suggested users:', error);
      } finally {
        setLoadingSuggested(false);
      }
    };

    loadSuggestedUsers();
  }, [user?.id]);

  const handleCreatePost = async (content: string, circleId?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    try {
      const postId = await createPost(content, circleId, mediaUrl, mediaType);
      if (postId) {
        await addXP(10, 'Post created');
        setShowCreatePost(false);

        // Add a small delay to ensure Firestore has processed the write
        setTimeout(() => {
          refreshPosts(); // Refresh the feed to show the new post
        }, 500);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleFollowUser = async (targetUserId: string) => {
    if (!user) return;

    setFollowingUsers(prev => new Set(prev).add(targetUserId));

    try {
      await followUser(user.id, targetUserId, {
        name: user.name,
        avatar: user.avatar
      });

      toast.success(
        language === 'ar' ? 'تمت المتابعة بنجاح!' : 'Successfully followed!',
        { duration: 2000 }
      );

      // Remove from suggested list after following
      setSuggestedUsers(prev => prev.filter(u => u.id !== targetUserId));
    } catch (error) {
      console.error('Error following user:', error);
      toast.error(
        language === 'ar' ? 'فشلت عملية المتابعة' : 'Failed to follow user'
      );
      setFollowingUsers(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'ar' ? `أهلاً وسهلاً، ${user?.name}!` : `Welcome back, ${user?.name}!`}
            </h1>
            <p className="text-green-100 text-lg">
              {language === 'ar' ? 'استمر في رحلة النمو والتطوير الشخصي' : 'Continue your personal growth journey'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{t('level')} {user?.level}</div>
            <div className="text-green-100">{user?.xp} {t('xp')}</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Target className="w-6 h-6" />}
          title={t('tasks.completed')}
          value={user?.completedTasks || 0}
          color="blue"
        />
        <StatsCard
          icon={<BookOpen className="w-6 h-6" />}
          title={t('verses.read')}
          value={typeof quranProgress.readVerses === 'number' ? quranProgress.readVerses : 0}
          color="green"
          loading={quranLoading}
        />
        <StatsCard
          icon={<Clock className="w-6 h-6" />}
          title={t('focus.hours')}
          value={parseFloat((user?.focusHours || 0).toFixed(2))}
          color="purple"
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          title={t('streak')}
          value={user?.streak || 0}
          color="orange"
        />
      </div>

      {/* Daily Verse */}
      <DailyVerse />

      {/* Stories Section */}
      <StoriesSection />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
              />
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 md:py-3 text-left text-sm md:text-base text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {language === 'ar' ? 'شارك إنجازاتك اليوم...' : 'Share your achievements today...'}
              </button>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-green-500 text-white p-2.5 md:p-3 rounded-full hover:bg-green-600 transition-colors flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {postsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'جاري تحميل المنشورات...' : 'Loading posts...'}
                </span>
              </div>
            ) : postsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">
                  {language === 'ar' ? 'خطأ في تحميل المنشورات' : 'Error loading posts'}
                </p>
                <button 
                  onClick={refreshPosts}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {language === 'ar' 
                      ? 'كن أول من يشارك إنجازاته أو انضم إلى دوائر النمو لرؤية المنشورات'
                      : 'Be the first to share your achievements or join growth circles to see posts'
                    }
                  </p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    {language === 'ar' ? 'إنشاء منشور' : 'Create Post'}
                  </button>
                </div>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <PostCard post={post} onPostUpdate={refreshPosts} />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/focus')}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
              >
                <Target className="w-5 h-5" />
                <span>{language === 'ar' ? 'بدء جلسة تركيز' : 'Start Focus Session'}</span>
              </button>
              <button 
                onClick={() => navigate('/circles')}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>{language === 'ar' ? 'استكشاف الدوائر' : 'Explore Circles'}</span>
              </button>
              <button 
                onClick={() => navigate('/quran')}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>{language === 'ar' ? 'قراءة القرآن' : 'Read Quran'}</span>
              </button>
            </div>
          </motion.div>

          {/* Suggested Users to Follow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'مستخدمون مقترحون' : 'Suggested Users'}
            </h3>
            <div className="space-y-3">
              {loadingSuggested ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : suggestedUsers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'لا يوجد مستخدمون مقترحون' : 'No suggestions available'}
                  </p>
                </div>
              ) : (
                suggestedUsers.map((suggestedUser) => (
                  <div
                    key={suggestedUser.id}
                    className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={suggestedUser.avatar || '/avatar.jpeg'}
                      alt={suggestedUser.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/profile/${suggestedUser.username || suggestedUser.id}`)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/avatar.jpeg';
                      }}
                    />
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/profile/${suggestedUser.username || suggestedUser.id}`)}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {suggestedUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {language === 'ar' ? 'مستوى' : 'Level'} {suggestedUser.level || 1} • {suggestedUser.xp || 0} {language === 'ar' ? 'نقطة' : 'XP'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFollowUser(suggestedUser.id)}
                      disabled={followingUsers.has(suggestedUser.id)}
                      className="flex-shrink-0 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      title={language === 'ar' ? 'متابعة' : 'Follow'}
                    >
                      {followingUsers.has(suggestedUser.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </h3>
            <div className="space-y-3">
              {activitiesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity'}
                  </p>
                </div>
              ) : (
                activities.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'post' 
                        ? 'bg-green-100 dark:bg-green-900/20' 
                        : 'bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      {activity.type === 'post' ? (
                        <MessageCircle className={`w-4 h-4 ${
                          activity.type === 'post' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      ) : (
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {language === 'ar' ? activity.titleAr : activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default HomePage;