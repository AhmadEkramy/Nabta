import { motion } from 'framer-motion';
import { RefreshCw, Trophy } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LeaderboardEntry, LeaderboardPeriod, useLeaderboard } from '../hooks/useLeaderboard';

interface LeaderboardProps {
  period?: LeaderboardPeriod;
  limit?: number;
  showPeriodSelector?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  period = 'weekly',
  limit = 10,
  showPeriodSelector = true,
  showRefreshButton = true,
  className = ''
}) => {
  const { language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = React.useState<LeaderboardPeriod>(period);
  const { 
    leaderboard, 
    loading, 
    getXPForPeriod, 
    getPeriodLabel, 
    refreshLeaderboard 
  } = useLeaderboard(selectedPeriod, limit);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard'}
        </h3>
        
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          {showRefreshButton && (
            <button
              onClick={refreshLeaderboard}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
              title={language === 'ar' ? 'تحديث' : 'Refresh'}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {/* Period Selection */}
          {showPeriodSelector && (
            <div className="flex space-x-2">
              {(['weekly', 'monthly', 'all-time'] as const).map((periodOption) => (
                <button
                  key={periodOption}
                  onClick={() => setSelectedPeriod(periodOption)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedPeriod === periodOption
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {periodOption === 'weekly' ? (language === 'ar' ? 'أسبوعي' : 'Weekly') :
                   periodOption === 'monthly' ? (language === 'ar' ? 'شهري' : 'Monthly') :
                   (language === 'ar' ? 'كل الأوقات' : 'All Time')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد بيانات متاحة' : 'No data available'}</p>
              <p className="text-sm mt-2">
                {language === 'ar' ? 'ابدأ بلعب الألعاب لتظهر في لوحة المتصدرين!' : 'Start playing games to appear on the leaderboard!'}
              </p>
            </div>
          ) : (
            leaderboard.map((entry) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    entry.rank === 1 ? 'bg-yellow-500 text-white' :
                    entry.rank === 2 ? 'bg-gray-400 text-white' :
                    entry.rank === 3 ? 'bg-orange-500 text-white' :
                    'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {entry.rank}
                  </div>
                  <img
                    src={entry.userAvatar}
                    alt={entry.userName}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.userName)}&background=random`;
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.userName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language === 'ar' ? `المستوى ${entry.level}` : `Level ${entry.level}`} • 
                      {language === 'ar' ? ` ${entry.totalGamesPlayed} لعبة` : ` ${entry.totalGamesPlayed} games`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {getXPForPeriod(entry).toLocaleString()} XP
                  </p>
                  <p className="text-sm text-gray-500">
                    {getPeriodLabel(language)}
                  </p>
                  {entry.bestScore > 0 && (
                    <p className="text-xs text-gray-400">
                      {language === 'ar' ? 'أفضل نتيجة:' : 'Best:'} {entry.bestScore.toLocaleString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
