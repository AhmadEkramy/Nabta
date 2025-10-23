import { motion } from 'framer-motion';
import { RotateCcw, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PatternMemoryGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

const PatternMemoryGame: React.FC<PatternMemoryGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  const [pattern, setPattern] = useState<string[]>([]);
  const [userPattern, setUserPattern] = useState<string[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const emojis = ['🌟', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🌈', '🦋'];

  const generatePattern = (length: number) => {
    const newPattern = [];
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * emojis.length);
      newPattern.push(emojis[randomIndex]);
    }
    return newPattern;
  };

  const startLevel = () => {
    const newPattern = generatePattern(level + 2);
    setPattern(newPattern);
    setUserPattern([]);
    setShowingPattern(true);
    setTimeLeft(newPattern.length * 1000); // Show each symbol for 1 second
  };

  useEffect(() => {
    if (!gameStarted) return;
    if (timeLeft > 0 && showingPattern) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1000);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showingPattern) {
      setShowingPattern(false);
    }
  }, [timeLeft, showingPattern, gameStarted]);

  const handleEmojiClick = (emoji: string) => {
    if (showingPattern || !gameStarted) return;

    const newUserPattern = [...userPattern, emoji];
    setUserPattern(newUserPattern);

    // Check if the user's pattern matches the correct pattern so far
    for (let i = 0; i < newUserPattern.length; i++) {
      if (newUserPattern[i] !== pattern[i]) {
        endGame();
        return;
      }
    }

    // If user completed the pattern correctly
    if (newUserPattern.length === pattern.length) {
      const points = level * 15;
      setScore(prev => prev + points);
      setLevel(prev => prev + 1);
      setTimeout(startLevel, 1000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLevel(1);
    setGameCompleted(false);
    startLevel();
  };

  const endGame = () => {
    setGameCompleted(true);
    setGameStarted(false);
    const xpEarned = Math.floor(score / 5);
    setTimeout(() => onGameComplete(score, xpEarned), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'ذاكرة الأنماط' : 'Pattern Memory'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'المستوى' : 'Level'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{level}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'النقاط' : 'Score'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'النمط' : 'Pattern'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {showingPattern ? Math.ceil(timeLeft / 1000) : '-'}
            </p>
          </div>
        </div>

        {/* Game Area */}
        {!gameStarted && !gameCompleted ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' 
                ? 'انتبه للنمط وكرره بنفس الترتيب!'
                : 'Watch the pattern and repeat it in the same order!'
              }
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
            >
              {language === 'ar' ? 'ابدأ اللعب' : 'Start Game'}
            </button>
          </div>
        ) : gameCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl text-white"
          >
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'انتهت اللعبة!' : 'Game Over!'}
            </h3>
            <p className="mb-4">
              {language === 'ar'
                ? `وصلت إلى المستوى ${level} وحققت ${score} نقطة`
                : `You reached level ${level} and scored ${score} points`
              }
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-5 h-5" />
              <span className="font-bold">
                {language === 'ar' ? 'نقاط مكتسبة:' : 'XP Earned:'} {Math.floor(score / 5)}
              </span>
            </div>
            <button
              onClick={startGame}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-pink-600 rounded-lg hover:bg-gray-100 transition-colors mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'ar' ? 'العب مرة أخرى' : 'Play Again'}</span>
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Pattern Display */}
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-5 gap-4">
                {pattern.map((emoji, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: showingPattern && index <= (pattern.length - timeLeft / 1000) ? 1 : 0,
                      scale: showingPattern && index <= (pattern.length - timeLeft / 1000) ? 1 : 0.5,
                    }}
                    className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-100 dark:bg-purple-900/20 rounded-lg"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* User Input */}
            {!showingPattern && (
              <div>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  {language === 'ar' ? 'اختر الرموز بنفس الترتيب' : 'Select the symbols in the same order'}
                </p>
                <div className="grid grid-cols-5 gap-4">
                  {emojis.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* User Progress */}
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                {pattern.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < userPattern.length
                        ? 'bg-purple-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PatternMemoryGame;