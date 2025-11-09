import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CreatePostModal } from '../components/CreatePostModal';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCircleDetails } from '../hooks/useCircleDetails';
import { useCirclePosts } from '../hooks/useCirclePosts';
import { CirclePost } from '../types';

const CircleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { 
    circle,
    loading,
    error,
    createPost
  } = useCircleDetails(id || '');

  const {
    posts
  } = useCirclePosts(id || '');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error || t('errors.circleNotFound')}
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Main Content - Posts */}
          <div className="space-y-6">
            {/* Circle Header with Background */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Background Image */}
              <div className="relative h-48">
                {circle.backgroundImageUrl ? (
                  <img
                    src={circle.backgroundImageUrl}
                    alt={language === 'ar' ? `خلفية ${circle.nameAr}` : `${circle.name} background`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700" />
                )}
                {/* Circle Icon Overlay */}
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg">
                    <img
                      src={circle.imageUrl || '/avatar.jpeg'}
                      alt={language === 'ar' ? circle.nameAr : circle.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Circle Info */}
              <div className="p-6 pt-4">
                <h1 className="text-2xl font-bold mb-2">
                  {language === 'ar' ? circle.nameAr : circle.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'ar' ? circle.descriptionAr : circle.description}
                </p>
              </div>
            </div>

            {/* Create Post Button */}
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <img
                  src={user?.avatar || '/avatar.jpeg'}
                  alt={user?.name || 'User'}
                  className="flex-shrink-0 w-10 h-10 rounded-full"
                />
                <div className="flex-grow text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'شارك شيئاً مع الدائرة...' : 'Share something with the circle...'}
                </div>
              </div>
            </button>

            {/* Posts List */}
            <div className="space-y-6">
              {posts?.map((post: CirclePost) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    userId: post.authorId,
                    userName: post.authorName,
                    userAvatar: post.authorAvatar,
                    content: post.content,
                    circleId: post.circleId,
                    createdAt: typeof post.createdAt === 'string' ? post.createdAt : new Date(post.createdAt.seconds * 1000).toISOString(),
                    updatedAt: post.updatedAt,
                    likes: post.likes,
                    comments: post.comments,
                    shares: 0,
                    likedBy: Object.entries(post.likedBy || {})
                      .filter(([, value]) => value)
                      .map(([key]) => key),
                    user: {
                      id: post.authorId,
                      name: post.authorName,
                      avatar: post.authorAvatar
                    }
                  }}
                />
              ))}
              {posts?.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          circleId={circle.id}
          onClose={() => setShowCreatePost(false)}
          onPost={async (content: string) => {
            await createPost(content);
            setShowCreatePost(false);
          }}
        />
      )}
    </>
  );
};

export default CircleDetailsPage;
