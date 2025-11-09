import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Search } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  level: number;
  role: 'Admin' | 'Moderator' | 'Member';
  joinedAt: Date;
}

interface AllMembersModalProps {
  members: Member[];
  onClose: () => void;
}

export const AllMembersModal: React.FC<AllMembersModalProps> = ({ members, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    // Sort by role first
    const roleOrder = { Admin: 0, Moderator: 1, Member: 2 };
    if (roleOrder[a.role] !== roleOrder[b.role]) {
      return roleOrder[a.role] - roleOrder[b.role];
    }
    // Then by level
    if (a.level !== b.level) {
      return b.level - a.level;
    }
    // Finally by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'أعضاء الدائرة' : 'Circle Members'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'البحث عن عضو...' : 'Search members...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-gray-500">
              {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
            </p>
          ) : (
            sortedMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={member.avatar || '/default-avatar.png'}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h4>
                      {member.id === user?.uid && (
                        <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                          {language === 'ar' ? 'أنت' : 'You'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {language === 'ar' ? `المستوى ${member.level}` : `Level ${member.level}`}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  member.role === 'Admin'
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                    : member.role === 'Moderator'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                }`}>
                  {member.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
