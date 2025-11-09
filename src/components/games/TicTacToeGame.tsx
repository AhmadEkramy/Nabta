import { motion } from 'framer-motion';
import { RotateCcw, Star, Trophy, Cpu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TicTacToeGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

type Player = 'X' | 'O' | null;
type Board = Player[];

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'computer' | 'draw' | null>(null);
  const [score, setScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [startTime] = useState(Date.now());

  // Check for winner
  const checkWinner = (board: Board): Player => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (board: Board): boolean => {
    return board.every(cell => cell !== null);
  };

  // Computer AI move using minimax algorithm
  const getBestMove = (board: Board): number => {
    // First, check if computer can win
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = 'O';
        if (checkWinner(testBoard) === 'O') return i;
      }
    }

    // Second, block player from winning
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = 'X';
        if (checkWinner(testBoard) === 'X') return i;
      }
    }

    // Third, take center if available
    if (board[4] === null) return 4;

    // Fourth, take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Finally, take any available space
    const availableMoves = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null) as number[];
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // Handle player move
  const handleCellClick = (index: number) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      endGame('player', newBoard);
      return;
    }

    if (isBoardFull(newBoard)) {
      endGame('draw', newBoard);
      return;
    }

    setIsPlayerTurn(false);
  };

  // Computer makes move
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const bestMove = getBestMove(newBoard);
        newBoard[bestMove] = 'O';
        setBoard(newBoard);

        const winner = checkWinner(newBoard);
        if (winner === 'O') {
          endGame('computer', newBoard);
          return;
        }

        if (isBoardFull(newBoard)) {
          endGame('draw', newBoard);
          return;
        }

        setIsPlayerTurn(true);
      }, 500); // Add slight delay for computer move

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, board]);

  // End game
  const endGame = (result: 'player' | 'computer' | 'draw', finalBoard: Board) => {
    setGameOver(true);
    setWinner(result);
    setGamesPlayed(prev => prev + 1);

    if (result === 'player') {
      const points = 100;
      setScore(prev => prev + points);
      setWins(prev => prev + 1);
    } else if (result === 'draw') {
      const points = 30;
      setScore(prev => prev + points);
    }
  };

  // Reset board for new game
  const playAgain = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  // Complete entire game session
  const completeGame = () => {
    const timePlayed = Math.floor((Date.now() - startTime) / 1000);
    const winBonus = wins * 50;
    const totalScore = score + winBonus;
    const xpEarned = Math.floor(totalScore / 10);
    onGameComplete(totalScore, xpEarned);
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
            {language === 'ar' ? 'تيك تاك تو' : 'Tic Tac Toe'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'النقاط' : 'Score'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الألعاب' : 'Games'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{gamesPlayed}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الفوز' : 'Wins'}
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{wins}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'الدور' : 'Turn'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {gameOver ? '—' : isPlayerTurn ? 'X' : 'O'}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: cell === null && isPlayerTurn && !gameOver ? 1.05 : 1 }}
                whileTap={{ scale: cell === null && isPlayerTurn && !gameOver ? 0.95 : 1 }}
                onClick={() => handleCellClick(index)}
                disabled={!isPlayerTurn || gameOver || cell !== null}
                className={`
                  aspect-square flex items-center justify-center text-4xl font-bold rounded-lg
                  transition-colors
                  ${cell === 'X' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                  ${cell === 'O' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                  ${cell === null ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' : ''}
                  ${!isPlayerTurn || gameOver || cell !== null ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {cell}
              </motion.button>
            ))}
          </div>

          {/* Turn Indicator */}
          {!gameOver && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {!isPlayerTurn && <Cpu className="w-5 h-5 text-red-500 animate-pulse" />}
                <p className="text-gray-600 dark:text-gray-400">
                  {isPlayerTurn
                    ? language === 'ar' ? 'دورك (X)' : 'Your turn (X)'
                    : language === 'ar' ? 'دور الكمبيوتر (O)' : 'Computer turn (O)'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Game Over Message */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg text-center mb-4 ${
              winner === 'player'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : winner === 'computer'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
            }`}
          >
            {winner === 'player' && (
              <>
                <Trophy className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xl font-bold">
                  {language === 'ar' ? 'فزت! 🎉' : 'You Won! 🎉'}
                </p>
                <p className="text-sm mt-1">
                  {language === 'ar' ? '+100 نقطة' : '+100 points'}
                </p>
              </>
            )}
            {winner === 'computer' && (
              <>
                <Cpu className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xl font-bold">
                  {language === 'ar' ? 'الكمبيوتر فاز' : 'Computer Won'}
                </p>
                <p className="text-sm mt-1">
                  {language === 'ar' ? 'حاول مرة أخرى!' : 'Try again!'}
                </p>
              </>
            )}
            {winner === 'draw' && (
              <>
                <Star className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xl font-bold">
                  {language === 'ar' ? 'تعادل!' : 'Draw!'}
                </p>
                <p className="text-sm mt-1">
                  {language === 'ar' ? '+30 نقطة' : '+30 points'}
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {gameOver ? (
            <>
              <button
                onClick={playAgain}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'ar' ? 'العب مرة أخرى' : 'Play Again'}</span>
              </button>
              {gamesPlayed > 0 && (
                <button
                  onClick={completeGame}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إنهاء' : 'Finish'}</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={completeGame}
              className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {language === 'ar' ? 'إنهاء الجلسة' : 'End Session'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            {language === 'ar' 
              ? 'فوز = 100 نقطة | تعادل = 30 نقطة'
              : 'Win = 100 points | Draw = 30 points'
            }
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TicTacToeGame;

