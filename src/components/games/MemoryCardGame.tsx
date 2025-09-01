import { motion } from 'framer-motion';
import { RotateCcw, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

const MemoryCardGame: React.FC<MemoryCardGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const emojis = ['🌟', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻'];

  const initializeGame = () => {
    const gameCards: Card[] = [];
    emojis.forEach((emoji, index) => {
      gameCards.push(
        { id: index * 2, emoji, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    });
    
    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameCompleted(false);
    setGameStarted(true);
    setStartTime(Date.now());
    setTimeElapsed(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId)) return;
    
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCard, secondCard] = newFlippedCards.map(id => 
        cards.find(card => card.id === id)!
      );

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is complete
          if (matches + 1 === emojis.length) {
            setGameCompleted(true);
            const finalTime = Math.floor((Date.now() - startTime) / 1000);
            const score = Math.max(1000 - moves * 10 - finalTime, 100);
            const xpEarned = Math.floor(score / 10);
            setTimeout(() => onGameComplete(score, xpEarned), 500);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            {language === 'ar' ? 'كروت الذاكرة' : 'Memory Cards'}
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
              {language === 'ar' ? 'الحركات' : 'Moves'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{moves}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'المطابقات' : 'Matches'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{matches}/{emojis.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الوقت' : 'Time'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(timeElapsed)}</p>
          </div>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-lg cursor-pointer flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '?'}
            </motion.div>
          ))}
        </div>

        {/* Game Complete Modal */}
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white"
          >
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'تهانينا!' : 'Congratulations!'}
            </h3>
            <p className="mb-4">
              {language === 'ar' 
                ? `أكملت اللعبة في ${moves} حركة و ${formatTime(timeElapsed)}`
                : `You completed the game in ${moves} moves and ${formatTime(timeElapsed)}`
              }
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-5 h-5" />
              <span className="font-bold">
                {language === 'ar' ? 'نقاط مكتسبة:' : 'XP Earned:'} {Math.floor((1000 - moves * 10 - timeElapsed) / 10)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={initializeGame}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'ar' ? 'إعادة تشغيل' : 'Restart'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MemoryCardGame;
