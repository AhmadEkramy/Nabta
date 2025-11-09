import { motion } from 'framer-motion';
import { RotateCcw, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface VocabularyQuestion {
  word: string;
  definition: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface VocabularyGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

const VocabularyGame: React.FC<VocabularyGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  
  const vocabularyData = language === 'ar' 
    ? [
        { word: 'إبداع', definition: 'القدرة على إنتاج أفكار جديدة ومبتكرة', options: ['تقليد', 'إبداع', 'تكرار', 'نسخ'], answer: 'إبداع', difficulty: 'easy' as const },
        { word: 'تطوير', definition: 'عملية تحسين وتقدم الأشياء', options: ['تدمير', 'تطوير', 'إهمال', 'تجاهل'], answer: 'تطوير', difficulty: 'easy' as const },
        { word: 'استراتيجية', definition: 'خطة طويلة المدى لتحقيق هدف معين', options: ['عشوائية', 'استراتيجية', 'فوضى', 'ارتجال'], answer: 'استراتيجية', difficulty: 'medium' as const },
        { word: 'فلسفة', definition: 'دراسة الأسئلة الأساسية حول الوجود والمعرفة', options: ['رياضة', 'فلسفة', 'طبخ', 'تسوق'], answer: 'فلسفة', difficulty: 'medium' as const },
        { word: 'ديمقراطية', definition: 'نظام حكم يشارك فيه الشعب في اتخاذ القرارات', options: ['ديكتاتورية', 'ملكية', 'ديمقراطية', 'فوضى'], answer: 'ديمقراطية', difficulty: 'hard' as const },
        { word: 'تكنولوجيا', definition: 'تطبيق المعرفة العلمية لأغراض عملية', options: ['تكنولوجيا', 'زراعة', 'رياضة', 'فن'], answer: 'تكنولوجيا', difficulty: 'medium' as const }
      ]
    : [
        { word: 'Innovation', definition: 'The introduction of new ideas or methods', options: ['Tradition', 'Innovation', 'Repetition', 'Imitation'], answer: 'Innovation', difficulty: 'easy' as const },
        { word: 'Perseverance', definition: 'Persistence in doing something despite difficulty', options: ['Giving up', 'Perseverance', 'Laziness', 'Avoidance'], answer: 'Perseverance', difficulty: 'medium' as const },
        { word: 'Serendipity', definition: 'A pleasant surprise or fortunate accident', options: ['Misfortune', 'Planning', 'Serendipity', 'Disaster'], answer: 'Serendipity', difficulty: 'hard' as const },
        { word: 'Empathy', definition: 'The ability to understand others\' feelings', options: ['Selfishness', 'Empathy', 'Indifference', 'Cruelty'], answer: 'Empathy', difficulty: 'easy' as const },
        { word: 'Resilience', definition: 'The ability to recover quickly from difficulties', options: ['Weakness', 'Fragility', 'Resilience', 'Vulnerability'], answer: 'Resilience', difficulty: 'medium' as const },
        { word: 'Eloquent', definition: 'Fluent and persuasive in speaking or writing', options: ['Silent', 'Eloquent', 'Mumbling', 'Confused'], answer: 'Eloquent', difficulty: 'hard' as const }
      ];

  const [questions, setQuestions] = useState<VocabularyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initializeGame = () => {
    // Shuffle questions
    const shuffled = [...vocabularyData].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(90);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    initializeGame();
  }, [language]);

  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameCompleted, questions.length]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].answer;
    setIsCorrect(correct);
    
    if (correct) {
      const difficultyMultiplier = questions[currentQuestionIndex].difficulty === 'easy' ? 1 : 
                                   questions[currentQuestionIndex].difficulty === 'medium' ? 1.5 : 2;
      const points = Math.floor((10 + streak * 2) * difficultyMultiplier);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        nextQuestion();
      } else {
        endGame();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const endGame = () => {
    setGameCompleted(true);
    const xpEarned = Math.floor(score / 3);
    setTimeout(() => onGameComplete(score, xpEarned), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) return null;

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
            {language === 'ar' ? 'بناء المفردات' : 'Vocabulary Builder'}
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
              {language === 'ar' ? 'السؤال' : 'Question'}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {currentQuestionIndex + 1}/{questions.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الوقت' : 'Time'}
            </p>
            <p className={`text-lg font-bold ${timeLeft <= 15 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {!gameCompleted ? (
          <>
            {/* Question */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  questions[currentQuestionIndex].difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  questions[currentQuestionIndex].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {questions[currentQuestionIndex].difficulty.toUpperCase()}
                </span>
              </div>
              
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                "{questions[currentQuestionIndex].word}"
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {questions[currentQuestionIndex].definition}
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {language === 'ar' ? 'اختر الكلمة التي تطابق التعريف:' : 'Choose the word that matches the definition:'}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 text-lg font-medium rounded-lg transition-all text-left ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : selectedAnswer !== null && option === questions[currentQuestionIndex].answer
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center p-4 rounded-lg mb-4 ${
                  isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <p className={`font-bold ${
                  isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {isCorrect 
                    ? (language === 'ar' ? '✅ ممتاز!' : '✅ Excellent!') 
                    : (language === 'ar' ? '❌ حاول مرة أخرى!' : '❌ Try again!')
                  }
                </p>
                {isCorrect && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    +{Math.floor((10 + streak * 2) * (questions[currentQuestionIndex].difficulty === 'easy' ? 1 : questions[currentQuestionIndex].difficulty === 'medium' ? 1.5 : 2))} {language === 'ar' ? 'نقطة' : 'points'}
                  </p>
                )}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white"
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
                {language === 'ar' ? 'نقاط مكتسبة:' : 'XP Earned:'} {Math.floor(score / 3)}
              </span>
            </div>
            <button
              onClick={initializeGame}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors mx-auto"
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

export default VocabularyGame;
