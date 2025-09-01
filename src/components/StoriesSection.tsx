import { motion } from 'framer-motion';
import { Loader2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCreateStory, useStories } from '../hooks/useStories';
import AddStoryModal from './AddStoryModal';
import StoryViewer from './StoryViewer';

const StoriesSection: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showAddStory, setShowAddStory] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<{
    groupIndex: number;
    storyIndex: number;
  } | null>(null);
  
  // Use Firebase hooks for real stories data
  const { stories: storyGroups, loading: storiesLoading, error: storiesError, refreshStories } = useStories();
  const { create: createStory, loading: createLoading } = useCreateStory();

  const handleCreateStory = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const storyId = await createStory(content, mediaUrl, mediaType);
    if (storyId) {
      refreshStories(); // Refresh stories to show the new one
      return true;
    }
    return false;
  };

  const openStoryViewer = (groupIndex: number, storyIndex: number = 0) => {
    setSelectedStoryGroup({ groupIndex, storyIndex });
  };

  const closeStoryViewer = () => {
    setSelectedStoryGroup(null);
  };

  // Check if current user has stories
  const userStoryGroup = storyGroups.find(group => group.userId === user?.id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'القصص' : 'Stories'}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'ar' ? 'تختفي خلال 24 ساعة' : 'Disappear in 24h'}
          </span>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Add Your Story */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => setShowAddStory(true)}
              className="relative group"
              disabled={createLoading}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-105 transition-transform">
                {createLoading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center max-w-[64px] truncate">
                {language === 'ar' ? 'قصتك' : 'Your Story'}
              </p>
            </button>
          </div>

          {/* User's Own Stories (if any) */}
          {userStoryGroup && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <button
                onClick={() => {
                  const groupIndex = storyGroups.findIndex(group => group.userId === user?.id);
                  openStoryViewer(groupIndex, 0);
                }}
                className="relative group"
              >
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <span className="text-white text-xs font-bold">{userStoryGroup.stories.length}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center max-w-[64px] truncate">
                  {language === 'ar' ? 'قصصك' : 'Your Stories'}
                </p>
              </button>
            </motion.div>
          )}

          {/* Stories Loading */}
          {storiesLoading ? (
            <div className="flex items-center space-x-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : storiesError ? (
            <div className="flex items-center text-red-500 text-sm">
              {language === 'ar' ? 'خطأ في تحميل القصص' : 'Error loading stories'}
            </div>
          ) : storyGroups.filter(group => group.userId !== user?.id).length === 0 ? (
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              {language === 'ar' ? 'لا توجد قصص حالياً' : 'No stories available'}
            </div>
          ) : (
            /* Other Users' Stories */
            storyGroups
              .filter(group => group.userId !== user?.id) // Exclude user's own stories
              .map((storyGroup, index) => (
                <motion.div
                  key={storyGroup.userId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex-shrink-0"
                >
                  <button
                    onClick={() => {
                      const groupIndex = storyGroups.findIndex(group => group.userId === storyGroup.userId);
                      openStoryViewer(groupIndex, 0);
                    }}
                    className="relative group"
                  >
                    <div className={`w-16 h-16 rounded-full p-0.5 ${
                      storyGroup.hasUnviewed 
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    } group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                        <img
                          src={storyGroup.userAvatar}
                          alt={storyGroup.userName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {storyGroup.stories.length > 1 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <span className="text-white text-xs font-bold">{storyGroup.stories.length}</span>
                      </div>
                    )}
                    <Link 
                      to={`/profile/${storyGroup.userId}`}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mt-2 text-center max-w-[64px] truncate block transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {storyGroup.userName.split(' ')[0]}
                    </Link>
                  </button>
                </motion.div>
              ))
          )}
        </div>
      </motion.div>

      {/* Add Story Modal */}
      {showAddStory && (
        <AddStoryModal
          onClose={() => setShowAddStory(false)}
          onSubmit={handleCreateStory}
          loading={createLoading}
        />
      )}

      {/* Story Viewer */}
      {selectedStoryGroup && (
        <StoryViewer
          storyGroups={storyGroups}
          initialGroupIndex={selectedStoryGroup.groupIndex}
          initialStoryIndex={selectedStoryGroup.storyIndex}
          onClose={closeStoryViewer}
          onStoryUpdate={refreshStories}
        />
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default StoriesSection;