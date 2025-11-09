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
    Share,
    Star,
    Target,
    TrendingUp,
    Trophy,
    User as UserIcon,
    UserCheck,
    UserPlus
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import PostReactionsWrapper from '../components/PostReactionsWrapper';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserAchievements, getUserPosts, getUserProfile } from '../firebase';
import { getAllCircles } from '../firebase/circles';
import { followUser, getUserByUsername, isFollowingUser, unfollowUser } from '../firebase/userProfile';
import { usePostShare } from '../hooks/usePostInteractions';
import { useSharedPosts } from '../hooks/useSharedPosts';
import { Post, User } from '../types';

type ReactionType = 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'shared' | 'about'>('posts');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userCircles, setUserCircles] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualUserId, setActualUserId] = useState<string | null>(null);
  
  // Post share hook
  const { share } = usePostShare();
  
  // Get shared posts
  const { sharedPosts, loading: loadingSharedPosts } = useSharedPosts(actualUserId || '');

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // Check if userId is actually a username or an ID
        // Username typically contains underscores or is shorter, ID is long alphanumeric
        let resolvedUserId = userId;
        
        // If it looks like a username (contains underscore or is relatively short), try to get the actual ID
        if (userId.includes('_') || userId.length < 20) {
          const foundUserId = await getUserByUsername(userId);
          if (foundUserId) {
            resolvedUserId = foundUserId;
          }
        }

        // Save the actual user ID
        setActualUserId(resolvedUserId);

        // Fetch user profile
        const profile = await getUserProfile(resolvedUserId);
        if (profile) {
          setProfileUser(profile);

          // Check if current user is following this user
          if (currentUser?.id && currentUser.id !== resolvedUserId) {
            const followingStatus = await isFollowingUser(currentUser.id, resolvedUserId);
            setIsFollowing(followingStatus);
          }
        }

        // Fetch user posts
        const posts = await getUserPosts(resolvedUserId);
        setUserPosts(posts);

        // Fetch user achievements
        const userAchievements = await getUserAchievements(resolvedUserId);
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
    if (!currentUser?.id || !actualUserId || currentUser.id === actualUserId) return;

    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, actualUserId);
        setIsFollowing(false);
        // Update local state
        if (profileUser) {
          setProfileUser({
            ...profileUser,
            followers: (profileUser.followers || 0) - 1
          });
        }
      } else {
        await followUser(currentUser.id, actualUserId);
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
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
        <div className="relative px-4 sm:px-6 pb-6">
          {/* Profile Picture & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
            />
            
            {!isOwnProfile && (
              <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-20">
                <Link
                  to={`/chat?user=${profileUser.id}`}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'رسالة' : 'Message'}</span>
                </Link>
                
                <button
                  onClick={handleFollow}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
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

                <button className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {profileUser.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                @{profileUser.username || profileUser.name.toLowerCase().replace(/\s+/g, '_')}
              </p>
            </div>

            {profileUser.bio && (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-2xl whitespace-pre-wrap">
                {profileUser.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {profileUser.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'انضم في' : 'Joined'} {new Date(profileUser.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Follow Stats */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {userPosts.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'منشور' : 'Posts'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {(profileUser.followers || 0).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'متابع' : 'Followers'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {(profileUser.following || 0).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'يتابع' : 'Following'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${colorClasses[stat.color]}`}>
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
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {language === 'ar' ? 'دوائر النمو' : 'Growth Circles'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {userCircles.length > 0 ? (
            userCircles.map((circle, index) => {
              // Handle both string and object formats for circle names
              const circleName = language === 'ar' 
                ? (typeof circle.nameAr === 'string' ? circle.nameAr : circle.nameAr?.ar || circle.name?.ar || circle.name)
                : (typeof circle.name === 'string' ? circle.name : circle.name?.en || circle.nameAr?.en || circle.nameAr);
              
              return (
                <div
                  key={circle.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {circleName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {circle.members} {language === 'ar' ? 'عضو' : 'members'}
                  </p>
                </div>
              );
            })
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
            <UserIcon className="w-4 h-4" />
            <span>{language === 'ar' ? 'حول' : 'About'}</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
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
                              <span className="text-green-600 dark:text-green-400">
                                {typeof post.circleName === 'string' 
                                  ? post.circleName 
                                  : (language === 'ar' ? post.circleName?.ar : post.circleName?.en) || post.circleName}
                              </span>
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
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
                </div>
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
                                <span className="text-green-600 dark:text-green-400">
                                  {typeof post.circleName === 'string' 
                                    ? post.circleName 
                                    : (language === 'ar' ? post.circleName?.ar : post.circleName?.en) || post.circleName}
                                </span>
                              </>
                            )}
                          </div>
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
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {profileUser?.bio || (language === 'ar' ? 'لم يتم إضافة نبذة شخصية بعد' : 'No bio added yet')}
                    </p>
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