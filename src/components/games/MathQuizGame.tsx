import { motion } from 'framer-motion';
import { RotateCcw, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Question {
  question: string;
  answer: number;
  options: number[];
}

interface MathQuizGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

const MathQuizGame: React.FC<MathQuizGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateQuestion = (): Question => {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 15) + 1;
        num1 = num2 * answer;
        question = `${num1} ÷ ${num2}`;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2; question = '1 + 1';
    }

    // Generate wrong options
    const options = [answer];
    while (options.length < 4) {
      const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
      if (wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return { question, answer, options };
  };

  const initializeGame = () => {
    const newQuestions = Array.from({ length: 15 }, () => generateQuestion());
    setQuestions(newQuestions);
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
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameCompleted]);

  const handleAnswerSelect = (answer: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].answer;
    setIsCorrect(correct);
    
    if (correct) {
      const points = 10 + streak * 2;
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
    }, 1500);
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
            {language === 'ar' ? 'الرياضيات السريعة' : 'Quick Math'}
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
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                {questions[currentQuestionIndex].question} = ?
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 text-xl font-bold rounded-lg transition-all ${
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
                {language === 'ar' ? 'نقاط مكتسبة:' : 'XP Earned:'} {Math.floor(score / 3)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Restart Button */}
        {gameCompleted && (
          <div className="flex justify-center mt-4">
            <button
              onClick={initializeGame}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'ar' ? 'إعادة تشغيل' : 'Restart'}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MathQuizGame;
