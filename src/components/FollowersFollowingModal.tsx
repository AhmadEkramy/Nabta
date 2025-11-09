import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getFollowersList, getFollowingList } from '../firebase/userProfile';
import { User as UserType } from '../types';

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

const FollowersFollowingModal: React.FC<FollowersFollowingModalProps> = ({
  isOpen,
  onClose,
  userId,
  type
}) => {
  const { language } = useLanguage();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      loadUsers();
    } else {
      setUsers([]);
      setSearchTerm('');
    }
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = type === 'followers' 
        ? await getFollowersList(userId)
        : await getFollowingList(userId);
      setUsers(userList);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (targetUserId: string) => {
    onClose();
    navigate(`/profile/${targetUserId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {type === 'followers' 
                ? (language === 'ar' ? 'المتابعون' : 'Followers')
                : (language === 'ar' ? 'المتابَعون' : 'Following')}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
            >
              ✕
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
                >
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? (language === 'ar' ? 'لا توجد نتائج' : 'No results found')
                  : (type === 'followers'
                      ? (language === 'ar' ? 'لا يوجد متابعون' : 'No followers yet')
                      : (language === 'ar' ? 'لا يوجد متابعون' : 'Not following anyone yet'))}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </h4>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full whitespace-nowrap">
                            {language === 'ar' ? 'أنت' : 'You'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{user.username || user.name.toLowerCase().replace(/\s+/g, '_')}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? `المستوى ${user.level}` : `Level ${user.level}`}
                        </span>
                        {user.followers !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {user.followers} {language === 'ar' ? 'متابع' : 'followers'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersFollowingModal;

