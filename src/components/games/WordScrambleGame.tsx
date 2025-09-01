import { motion } from 'framer-motion';
import { RotateCcw, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WordScrambleGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  
  const words = language === 'ar' 
    ? [
        { word: 'تعليم', hint: 'عملية اكتساب المعرفة' },
        { word: 'صداقة', hint: 'علاقة طيبة بين الأشخاص' },
        { word: 'نجاح', hint: 'تحقيق الهدف المطلوب' },
        { word: 'سعادة', hint: 'شعور بالفرح والرضا' },
        { word: 'إبداع', hint: 'القدرة على الابتكار' },
        { word: 'تطوير', hint: 'تحسين وتقدم الأشياء' },
        { word: 'معرفة', hint: 'المعلومات والعلم' },
        { word: 'تحدي', hint: 'مواجهة الصعوبات' }
      ]
    : [
        { word: 'EDUCATION', hint: 'The process of learning and teaching' },
        { word: 'FRIENDSHIP', hint: 'A close relationship between people' },
        { word: 'SUCCESS', hint: 'Achieving your goals' },
        { word: 'HAPPINESS', hint: 'A feeling of joy and contentment' },
        { word: 'CREATIVITY', hint: 'The ability to create and innovate' },
        { word: 'DEVELOPMENT', hint: 'Growth and improvement' },
        { word: 'KNOWLEDGE', hint: 'Information and understanding' },
        { word: 'CHALLENGE', hint: 'A difficult task or situation' }
      ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const scrambleWord = (word: string) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  };

  const initializeGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setStreak(0);
    setGameCompleted(false);
    setShowHint(false);
    setTimeLeft(60);
    setUserInput('');
    setIsCorrect(null);
    setScrambledWord(scrambleWord(words[0].word));
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameCompleted]);

  const checkAnswer = () => {
    const currentWord = words[currentWordIndex].word;
    const isAnswerCorrect = userInput.toUpperCase() === currentWord.toUpperCase();
    
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      const points = showHint ? 5 : 10;
      setScore(prev => prev + points + streak);
      setStreak(prev => prev + 1);
      
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          nextWord();
        } else {
          endGame();
        }
      }, 1500);
    } else {
      setStreak(0);
      setTimeout(() => {
        setIsCorrect(null);
        setUserInput('');
      }, 1500);
    }
  };

  const nextWord = () => {
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setScrambledWord(scrambleWord(words[nextIndex].word));
    setUserInput('');
    setShowHint(false);
    setIsCorrect(null);
  };

  const endGame = () => {
    setGameCompleted(true);
    const xpEarned = Math.floor(score / 2);
    setTimeout(() => onGameComplete(score, xpEarned), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim()) {
      checkAnswer();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'ترتيب الكلمات' : 'Word Scramble'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'النقاط' : 'Score'}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'التسلسل' : 'Streak'}
            </p>
            <p className="text-lg font-bold text-orange-500">{streak}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الكلمة' : 'Word'}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {currentWordIndex + 1}/{words.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الوقت' : 'Time'}
            </p>
            <p className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>

        {!gameCompleted ? (
          <>
            {/* Scrambled Word */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4 tracking-wider">
                {scrambledWord}
              </div>
              
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  💡 {words[currentWordIndex].hint}
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="mb-6">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'ar' ? 'اكتب الكلمة الصحيحة...' : 'Type the correct word...'}
                className={`w-full p-4 text-center text-xl font-bold border-2 rounded-lg focus:outline-none transition-colors ${
                  isCorrect === true ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                  isCorrect === false ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white`}
                disabled={isCorrect !== null}
              />
              
              {isCorrect === true && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-green-600 dark:text-green-400 mt-2 font-bold"
                >
                  ✅ {language === 'ar' ? 'صحيح!' : 'Correct!'}
                </motion.div>
              )}
              
              {isCorrect === false && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-red-600 dark:text-red-400 mt-2 font-bold"
                >
                  ❌ {language === 'ar' ? 'خطأ! حاول مرة أخرى' : 'Wrong! Try again'}
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={checkAnswer}
                disabled={!userInput.trim() || isCorrect !== null}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {language === 'ar' ? 'تحقق' : 'Check'}
              </button>
              
              <button
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {language === 'ar' ? 'تلميح' : 'Hint'}
              </button>
              
              <button
                onClick={initializeGame}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white"
          >
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'انتهت اللعبة!' : 'Game Over!'}
            </h3>
            <p className="mb-4">
              {language === 'ar' 
                ? `نقاطك النهائية: ${score}`
                : `Final Score: ${score}`
              }
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5" />
              <span className="font-bold">
                {language === 'ar' ? 'نقاط مكتسبة:' : 'XP Earned:'} {Math.floor(score / 2)}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WordScrambleGame;
