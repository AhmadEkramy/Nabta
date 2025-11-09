import { motion } from 'framer-motion';
import { Clock, Gamepad2, Lock, Play, RefreshCw, ShoppingBag, Star, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogicPuzzleGame from '../components/games/LogicPuzzleGame';
import MathQuizGame from '../components/games/MathQuizGame';
import MemoryCardGame from '../components/games/MemoryCardGame';
import PatternMemoryGame from '../components/games/PatternMemoryGame';
import VocabularyGame from '../components/games/VocabularyGame';
import WordScrambleGame from '../components/games/WordScrambleGame';
import SudokuGame from '../components/games/SudokuGame';
import ChessGame from '../components/games/ChessGame';
import TicTacToeGame from '../components/games/TicTacToeGame';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useLanguage } from '../contexts/LanguageContext';
import { checkGameOwnership } from '../firebase/store';
import { useGameStats } from '../hooks/useGameStats';
import { useGames } from '../hooks/useGames';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Game } from '../types';
import './GamesPage.css';

const GamesPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { addXP } = useGame();
  const { loading: gamesLoading, getGamesByCategory } = useGames();
  const { stats, recordGameSession, formatPlayTime } = useGameStats();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const { leaderboard, loading: leaderboardLoading, getXPForPeriod, getPeriodLabel, refreshLeaderboard } = useLeaderboard(leaderboardPeriod, 10);
  const [gameOwnership, setGameOwnership] = useState<Record<string, boolean>>({});
  const [loadingOwnership, setLoadingOwnership] = useState(true);
  
  // Games that require purchase
  const lockedGames = ['Chess', 'Sudoku'];
  
  // Check game ownership on mount and when user changes
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user?.id) {
        setLoadingOwnership(false);
        return;
      }
      
      try {
        const ownership: Record<string, boolean> = {};
        
        for (const gameName of lockedGames) {
          const owns = await checkGameOwnership(user.id, gameName);
          ownership[gameName] = owns;
        }
        
        setGameOwnership(ownership);
      } catch (error) {
        console.error('Error checking game ownership:', error);
      } finally {
        setLoadingOwnership(false);
      }
    };
    
    checkOwnership();
    
    // Listen for purchase events to refresh ownership
    const handlePurchase = () => {
      checkOwnership();
    };
    
    window.addEventListener('gamePurchased', handlePurchase);
    
    return () => {
      window.removeEventListener('gamePurchased', handlePurchase);
    };
  }, [user?.id]);

  const categories = [
    { id: 'all', name: language === 'ar' ? 'جميع الألعاب' : 'All Games' },
    { id: 'memory', name: language === 'ar' ? 'الذاكرة' : 'Memory' },
    { id: 'language', name: language === 'ar' ? 'اللغة' : 'Language' },
    { id: 'math', name: language === 'ar' ? 'الرياضيات' : 'Math' },
    { id: 'logic', name: language === 'ar' ? 'المنطق' : 'Logic' },
  ];

  const filteredGames = getGamesByCategory(selectedCategory);

  const playGame = async (game: Game) => {
    // Check if game is locked and user doesn't own it
    if (lockedGames.includes(game.name)) {
      const owns = gameOwnership[game.name];
      if (!owns) {
        // Game is locked, don't allow play
        return;
      }
    }
    
    setActiveGame(game);
  };

  const handleGameComplete = async (score: number, xpEarned: number) => {
    if (!activeGame) return;

    try {
      // Add XP to user
      await addXP(xpEarned, `Playing ${activeGame.name}`);

      // Record game session
      await recordGameSession({
        gameId: activeGame.id,
        gameName: activeGame.name,
        score,
        xpEarned,
        duration: 300, // Default 5 minutes, could be tracked more precisely
        difficulty: activeGame.difficulty,
        category: activeGame.category
      });

      // Refresh leaderboard to show updated stats
      refreshLeaderboard();

      // Close game
      setActiveGame(null);
    } catch (error) {
      console.error('Error completing game:', error);
      setActiveGame(null);
    }
  };

  const closeGame = () => {
    setActiveGame(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (gamesLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {t('games')}
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {language === 'ar' ? 
            'تحدى نفسك واكسب نقاط XP من خلال ألعاب ممتعة وتعليمية' :
            'Challenge yourself and earn XP through fun and educational games'
          }
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'ألعاب ملعوبة' : 'Games Played'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGamesPlayed}</p>
            </div>
            <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'نقاط مكتسبة' : 'XP Earned'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalXpEarned}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'أفضل نتيجة' : 'Best Score'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bestScore.toLocaleString()}</p>
            </div>
            <Trophy className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'وقت اللعب' : 'Play Time'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPlayTime(stats.totalPlayTime)}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-wrap gap-2 justify-center sm:justify-start"
      >
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredGames.map((game, index) => {
          const isLocked = lockedGames.includes(game.name) && !gameOwnership[game.name];
          
          return (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden ${
              isLocked ? 'opacity-75' : ''
            }`}
          >
            {/* Dark overlay for locked games */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60 pointer-events-none z-10"></div>
            )}
            <div className="relative z-20">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${
                game.color === 'purple' ? 'from-purple-500 to-purple-600' :
                game.color === 'blue' ? 'from-blue-500 to-blue-600' :
                game.color === 'green' ? 'from-green-500 to-green-600' :
                game.color === 'orange' ? 'from-orange-500 to-orange-600' :
                game.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
                game.color === 'pink' ? 'from-pink-500 to-pink-600' :
                'from-purple-500 to-purple-600'
              } rounded-full flex items-center justify-center text-xl sm:text-2xl relative`}>
                {game.icon || '🎮'}
                {lockedGames.includes(game.name) && !gameOwnership[game.name] && (
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                  {game.difficulty}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-500">+{game.xpReward}</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? game.nameAr : game.name}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {language === 'ar' ? game.descriptionAr : game.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{game.playTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{game.players}P</span>
                </div>
              </div>
            </div>

            {lockedGames.includes(game.name) && !gameOwnership[game.name] ? (
              <Link
                to="/store"
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{language === 'ar' ? 'شراء من المتجر' : 'Buy from Store'}</span>
              </Link>
            ) : (
              <button
                onClick={() => playGame(game)}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{t('play.now')}</span>
              </button>
            )}
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard'}
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Period Selection */}
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {(['weekly', 'monthly', 'all-time'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setLeaderboardPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap ${
                    leaderboardPeriod === period
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {period === 'weekly' ? (language === 'ar' ? 'أسبوعي' : 'Weekly') :
                   period === 'monthly' ? (language === 'ar' ? 'شهري' : 'Monthly') :
                   (language === 'ar' ? 'كل الأوقات' : 'All Time')}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshLeaderboard}
              disabled={leaderboardLoading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
              title={language === 'ar' ? 'تحديث' : 'Refresh'}
            >
              <RefreshCw className={`w-5 h-5 ${leaderboardLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {leaderboardLoading ? (
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
                <div key={entry.userId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* Game Components */}
      {activeGame && (
        <>
          {activeGame.name === 'Memory Cards' && (
            <MemoryCardGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Word Scramble' && (
            <WordScrambleGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Quick Math' && (
            <MathQuizGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Logic Puzzles' && (
            <LogicPuzzleGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Vocabulary Builder' && (
            <VocabularyGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Pattern Memory' && (
            <PatternMemoryGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Sudoku' && (
            <SudokuGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Chess' && (
            <ChessGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
          {activeGame.name === 'Tic Tac Toe' && (
            <TicTacToeGame
              onGameComplete={handleGameComplete}
              onClose={closeGame}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GamesPage;