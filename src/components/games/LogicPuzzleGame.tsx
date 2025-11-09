import { motion } from 'framer-motion';
import { RotateCcw, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Pattern {
  sequence: string[];
  missing: number;
  options: string[];
  answer: string;
  explanation: string;
  explanationAr: string;
}

interface LogicPuzzleGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

const LogicPuzzleGame: React.FC<LogicPuzzleGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const generatePatterns = (): Pattern[] => {
    return [
      {
        sequence: ['🔴', '🔵', '🔴', '🔵', '?'],
        missing: 4,
        options: ['🔴', '🔵', '🟡', '🟢'],
        answer: '🔴',
        explanation: 'Alternating red and blue pattern',
        explanationAr: 'نمط متناوب بين الأحمر والأزرق'
      },
      {
        sequence: ['1', '2', '4', '8', '?'],
        missing: 4,
        options: ['12', '16', '10', '14'],
        answer: '16',
        explanation: 'Each number doubles (×2)',
        explanationAr: 'كل رقم يتضاعف (×2)'
      },
      {
        sequence: ['🌙', '⭐', '☀️', '🌙', '⭐', '?'],
        missing: 5,
        options: ['🌙', '⭐', '☀️', '🌟'],
        answer: '☀️',
        explanation: 'Repeating pattern: moon, star, sun',
        explanationAr: 'نمط متكرر: قمر، نجمة، شمس'
      },
      {
        sequence: ['A', 'C', 'E', 'G', '?'],
        missing: 4,
        options: ['H', 'I', 'J', 'K'],
        answer: 'I',
        explanation: 'Skip one letter each time',
        explanationAr: 'تخطي حرف واحد في كل مرة'
      },
      {
        sequence: ['🔺', '🔺🔺', '🔺🔺🔺', '?'],
        missing: 3,
        options: ['🔺🔺🔺🔺', '🔺🔺', '🔺', '🔺🔺🔺🔺🔺'],
        answer: '🔺🔺🔺🔺',
        explanation: 'Add one triangle each time',
        explanationAr: 'إضافة مثلث واحد في كل مرة'
      },
      {
        sequence: ['3', '6', '12', '24', '?'],
        missing: 4,
        options: ['36', '48', '30', '42'],
        answer: '48',
        explanation: 'Each number doubles (×2)',
        explanationAr: 'كل رقم يتضاعف (×2)'
      },
      {
        sequence: ['🟥', '🟧', '🟨', '🟩', '?'],
        missing: 4,
        options: ['🟦', '🟪', '⬜', '⬛'],
        answer: '🟦',
        explanation: 'Rainbow color sequence',
        explanationAr: 'تسلسل ألوان قوس قزح'
      },
      {
        sequence: ['Z', 'Y', 'X', 'W', '?'],
        missing: 4,
        options: ['V', 'U', 'T', 'S'],
        answer: 'V',
        explanation: 'Reverse alphabetical order',
        explanationAr: 'ترتيب أبجدي عكسي'
      }
    ];
  };

  useEffect(() => {
    setPatterns(generatePatterns());
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted && patterns.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameCompleted, patterns.length]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === patterns[currentPatternIndex].answer;
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      const points = 15 + streak * 3;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentPatternIndex < patterns.length - 1) {
        nextPattern();
      } else {
        endGame();
      }
    }, 3000);
  };

  const nextPattern = () => {
    setCurrentPatternIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  const endGame = () => {
    setGameCompleted(true);
    const xpEarned = Math.floor(score / 4);
    setTimeout(() => onGameComplete(score, xpEarned), 2000);
  };

  const restartGame = () => {
    setPatterns(generatePatterns());
    setCurrentPatternIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(120);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (patterns.length === 0) return null;

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
            {language === 'ar' ? 'ألغاز المنطق' : 'Logic Puzzles'}
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
              {language === 'ar' ? 'اللغز' : 'Puzzle'}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {currentPatternIndex + 1}/{patterns.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الوقت' : 'Time'}
            </p>
            <p className={`text-lg font-bold ${timeLeft <= 20 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {!gameCompleted ? (
          <>
            {/* Pattern Sequence */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {language === 'ar' ? 'ما هو العنصر المفقود في النمط؟' : 'What comes next in the pattern?'}
              </p>
              <div className="flex justify-center items-center space-x-2 text-3xl mb-6">
                {patterns[currentPatternIndex].sequence.map((item, index) => (
                  <span
                    key={index}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg ${
                      item === '?' 
                        ? 'bg-purple-100 dark:bg-purple-900/20 border-2 border-dashed border-purple-500' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {patterns[currentPatternIndex].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 text-2xl font-bold rounded-lg transition-all ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : selectedAnswer !== null && option === patterns[currentPatternIndex].answer
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg mb-4 ${
                  isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <p className={`text-center font-medium ${
                  isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {isCorrect ? (language === 'ar' ? '✅ صحيح!' : '✅ Correct!') : (language === 'ar' ? '❌ خطأ!' : '❌ Wrong!')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  {language === 'ar' ? patterns[currentPatternIndex].explanationAr : patterns[currentPatternIndex].explanation}
                </p>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white"
          >
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'انتهت اللعبة!' : 'Game Complete!'}
            </h3>
            <p className="mb-4">
              {language === 'ar' 
                ? `نقاطك النهائية: ${score}`
                : `Final Score: ${score}`
              }
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-5 h-5" />
              <span className="font-bold">
                {language === 'ar' ? 'نقاط مكتسبة:' : 'XP Earned:'} {Math.floor(score / 4)}
              </span>
            </div>
            <button
              onClick={restartGame}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'ar' ? 'إعادة تشغيل' : 'Play Again'}</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LogicPuzzleGame;
