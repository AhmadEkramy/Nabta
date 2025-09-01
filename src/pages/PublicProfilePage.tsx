import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Calendar,
    Clock,
    Grid3X3,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Star,
    Target,
    TrendingUp,
    Trophy,
    UserCheck,
    UserPlus
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PostReactionsWrapper from '../components/PostReactionsWrapper';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserAchievements, getUserPosts, getUserProfile } from '../firebase';
import { getAllCircles } from '../firebase/circles';
import { followUser, isFollowingUser, unfollowUser } from '../firebase/userProfile';
import { Post, User } from '../types';

type ReactionType = 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userCircles, setUserCircles] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // Fetch user profile
        const profile = await getUserProfile(userId);
        if (profile) {
          setProfileUser(profile);

          // Check if current user is following this user
          if (currentUser?.id && currentUser.id !== userId) {
            const followingStatus = await isFollowingUser(currentUser.id, userId);
            setIsFollowing(followingStatus);
          }
        }

        // Fetch user posts
        const posts = await getUserPosts(userId);
        setUserPosts(posts);

        // Fetch user achievements
        const userAchievements = await getUserAchievements(userId);
        setAchievements(userAchievements);

        // Fetch circles data
        const allCircles = await getAllCircles();
        const userCircleIds = profile?.circles || [];
        const userCircleData = allCircles.filter(circle => userCircleIds.includes(circle.id));
        setUserCircles(userCircleData);

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, currentUser?.id]);

  const handleFollow = async () => {
    if (!currentUser?.id || !userId || currentUser.id === userId) return;

    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, userId);
        setIsFollowing(false);
        // Update local state
        if (profileUser) {
          setProfileUser({
            ...profileUser,
            followers: (profileUser.followers || 0) - 1
          });
        }
      } else {
        await followUser(currentUser.id, userId);
        setIsFollowing(true);
        // Update local state
        if (profileUser) {
          setProfileUser({
            ...profileUser,
            followers: (profileUser.followers || 0) + 1
          });
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const stats = profileUser ? [
    {
      icon: <Trophy className="w-5 h-5" />,
      label: language === 'ar' ? 'المستوى' : 'Level',
      value: profileUser.level || 1,
      color: 'purple'
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'XP',
      value: (profileUser.xp || 0).toLocaleString(),
      color: 'blue'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: language === 'ar' ? 'مهام مكتملة' : 'Tasks Completed',
      value: profileUser.completedTasks || 0,
      color: 'green'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: language === 'ar' ? 'سلسلة الإنجازات' : 'Streak',
      value: profileUser.streak || 0,
      color: 'orange'
    }
  ] : [];

  const colorClasses = {
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
  };

  const isOwnProfile = currentUser?.id === profileUser?.id;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User not found
  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'المستخدم غير موجود' : 'User Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'لم يتم العثور على هذا المستخدم' : 'This user could not be found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cover Image & Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 relative">
          {profileUser.coverImage ? (
            <img
              src={profileUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="flex items-end justify-between -mt-16 mb-4">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
            />
            
            {!isOwnProfile && (
              <div className="flex items-center space-x-3 mt-20">
                <Link
                  to={`/chat?user=${profileUser.id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === 'ar' ? 'رسالة' : 'Message'}</span>
                </Link>
                
                <button
                  onClick={handleFollow}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{language === 'ar' ? 'متابع' : 'Following'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'متابعة' : 'Follow'}</span>
                    </>
                  )}
                </button>

                <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profileUser.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">@{profileUser.name.toLowerCase().replace(/\s+/g, '_')}</p>
            </div>

            {profileUser.bio && (
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                {profileUser.bio}
              </p>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              {profileUser.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'انضم في' : 'Joined'} {new Date(profileUser.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Follow Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {userPosts.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'منشور' : 'Posts'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {(profileUser.followers || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'متابع' : 'Followers'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {(profileUser.following || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'يتابع' : 'Following'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Growth Circles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'دوائر النمو' : 'Growth Circles'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userCircles.length > 0 ? (
            userCircles.map((circle, index) => (
              <div
                key={circle.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? circle.nameAr : circle.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {circle.members} {language === 'ar' ? 'عضو' : 'members'}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'لم ينضم إلى أي دوائر بعد' : 'No circles joined yet'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="flex border-b border-gray-200 dark:border-gray-700">
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
            <Trophy className="w-4 h-4" />
            <span>{language === 'ar' ? 'الإنجازات' : 'Achievements'}</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    {/* Post Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={profileUser.avatar}
                        alt={profileUser.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {profileUser.name}
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
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'إحصائيات النشاط' : 'Activity Stats'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {language === 'ar' ? 'آيات مقروءة' : 'Verses Read'}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {profileUser.readVerses || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {language === 'ar' ? 'ساعات التركيز' : 'Focus Hours'}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {profileUser.focusHours || 0}h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'الإنجازات' : 'Achievements'}
                  </h4>
                  <div className="space-y-2">
                    {achievements.length > 0 ? (
                      achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {language === 'ar' ? achievement.nameAr : achievement.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? 'لا توجد إنجازات بعد' : 'No achievements yet'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PublicProfilePage;