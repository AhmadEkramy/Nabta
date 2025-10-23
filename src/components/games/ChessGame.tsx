import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Trophy, Star, Cpu, Zap, Brain } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ChessGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

type Color = 'w' | 'b';
type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
type Piece = `${Color}${PieceType}`;
type Board = (Piece | null)[][];

const initialBoard: Board = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR'],
];

const pieceEmoji: Record<Exclude<Piece, null>, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

const pieceValues: Record<PieceType, number> = {
  P: 10, N: 30, B: 30, R: 50, Q: 90, K: 900
};

const ChessGame: React.FC<ChessGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  const [board, setBoard] = useState<Board>(() => initialBoard.map(r => [...r]));
  const [turn, setTurn] = useState<Color>('w');
  const [selected, setSelected] = useState<{r: number; c: number} | null>(null);
  const [validMoves, setValidMoves] = useState<{r: number; c: number}[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [captures, setCaptures] = useState<{w: number; b: number}>({w: 0, b: 0});
  const [startTime] = useState<number>(Date.now());
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [lastMove, setLastMove] = useState<{from: {r: number; c: number}; to: {r: number; c: number}} | null>(null);
  const [thinking, setThinking] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTimeElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  // Check if game is over
  const isGameOver = useMemo(() => {
    let wK = false, bK = false;
    for (const row of board) {
      for (const p of row) {
        if (p === 'wK') wK = true;
        if (p === 'bK') bK = true;
      }
    }
    if (!wK) {
      setGameResult('lose');
      return true;
    }
    if (!bK) {
      setGameResult('win');
      return true;
    }
    return false;
  }, [board]);

  useEffect(() => {
    if (isGameOver && gameResult) {
      const timePenalty = Math.floor(timeElapsed / 10);
      const moveBonus = Math.max(0, 80 - movesCount) * 10;
      const captureBonus = captures.w * 15;
      
      if (gameResult === 'win') {
        const raw = 1000 + moveBonus + captureBonus - timePenalty;
        const score = Math.max(300, raw);
        const xp = Math.floor(score / 8);
        setTimeout(() => onGameComplete(score, xp), 1500);
      } else {
        const score = Math.max(50, captureBonus - timePenalty);
        const xp = Math.floor(score / 15);
        setTimeout(() => onGameComplete(score, xp), 1500);
      }
    }
  }, [isGameOver, gameResult]);

  // Calculate valid moves for a piece
  const calculateValidMoves = (r: number, c: number, boardState: Board): {r: number; c: number}[] => {
    const piece = boardState[r][c];
    if (!piece) return [];

    const color = piece[0] as Color;
    const type = piece[1] as PieceType;
    const moves: {r: number; c: number}[] = [];

    const isValidSquare = (row: number, col: number) => row >= 0 && row < 8 && col >= 0 && col < 8;
    const isEmptyOrEnemy = (row: number, col: number) => {
      if (!isValidSquare(row, col)) return false;
      const target = boardState[row][col];
      return !target || target[0] !== color;
    };

    switch (type) {
      case 'P': {
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        
        // Forward move
        if (isValidSquare(r + direction, c) && !boardState[r + direction][c]) {
          moves.push({r: r + direction, c});
          // Double move from start
          if (r === startRow && !boardState[r + 2 * direction][c]) {
            moves.push({r: r + 2 * direction, c});
          }
        }
        // Captures
        [-1, 1].forEach(dc => {
          const nr = r + direction;
          const nc = c + dc;
          if (isValidSquare(nr, nc) && boardState[nr][nc] && boardState[nr][nc]![0] !== color) {
            moves.push({r: nr, c: nc});
          }
        });
        break;
      }
      case 'N': {
        const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        knightMoves.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (isEmptyOrEnemy(nr, nc)) moves.push({r: nr, c: nc});
        });
        break;
      }
      case 'B': {
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
          let nr = r + dr, nc = c + dc;
          while (isValidSquare(nr, nc)) {
            if (boardState[nr][nc]) {
              if (boardState[nr][nc]![0] !== color) moves.push({r: nr, c: nc});
              break;
            }
            moves.push({r: nr, c: nc});
            nr += dr; nc += dc;
          }
        });
        break;
      }
      case 'R': {
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
          let nr = r + dr, nc = c + dc;
          while (isValidSquare(nr, nc)) {
            if (boardState[nr][nc]) {
              if (boardState[nr][nc]![0] !== color) moves.push({r: nr, c: nc});
              break;
            }
            moves.push({r: nr, c: nc});
            nr += dr; nc += dc;
          }
        });
        break;
      }
      case 'Q': {
        [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
          let nr = r + dr, nc = c + dc;
          while (isValidSquare(nr, nc)) {
            if (boardState[nr][nc]) {
              if (boardState[nr][nc]![0] !== color) moves.push({r: nr, c: nc});
              break;
            }
            moves.push({r: nr, c: nc});
            nr += dr; nc += dc;
          }
        });
        break;
      }
      case 'K': {
        [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (isEmptyOrEnemy(nr, nc)) moves.push({r: nr, c: nc});
        });
        break;
      }
    }

    return moves;
  };

  // AI Move calculation
  const evaluateBoard = (boardState: Board): number => {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece) {
          const value = pieceValues[piece[1] as PieceType];
          score += piece[0] === 'b' ? value : -value;
        }
      }
    }
    return score;
  };

  const getAIMove = (boardState: Board): {from: {r: number; c: number}; to: {r: number; c: number}} | null => {
    let bestMove: {from: {r: number; c: number}; to: {r: number; c: number}} | null = null;
    let bestScore = -Infinity;

    // Find all black pieces and their moves
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && piece[0] === 'b') {
          const moves = calculateValidMoves(r, c, boardState);
          
          for (const move of moves) {
            // Simulate move
            const newBoard = boardState.map(row => [...row]);
            newBoard[move.r][move.c] = piece;
            newBoard[r][c] = null;
            
            let score = evaluateBoard(newBoard);
            
            // Bonus for captures
            if (boardState[move.r][move.c]) {
              score += pieceValues[boardState[move.r][move.c]![1] as PieceType] * 2;
            }
            
            // Bonus for center control
            if (move.r >= 3 && move.r <= 4 && move.c >= 3 && move.c <= 4) {
              score += 5;
            }
            
            // Bonus for advancing pawns
            if (piece[1] === 'P' && move.r > r) {
              score += 3;
            }
            
            if (score > bestScore) {
              bestScore = score;
              bestMove = {from: {r, c}, to: move};
            }
          }
        }
      }
    }

    return bestMove;
  };

  // AI makes move
  useEffect(() => {
    if (turn === 'b' && !isGameOver) {
      setThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove) {
          setBoard(prev => {
            const copy = prev.map(row => [...row]);
            const capturedPiece = copy[aiMove.to.r][aiMove.to.c];
            if (capturedPiece) {
              setCaptures(c => ({...c, b: c.b + 1}));
            }
            copy[aiMove.to.r][aiMove.to.c] = copy[aiMove.from.r][aiMove.from.c];
            copy[aiMove.from.r][aiMove.from.c] = null;
            return copy;
          });
          setLastMove(aiMove);
          setMovesCount(m => m + 1);
          setTurn('w');
        }
        setThinking(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [turn, isGameOver, board]);

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== 'w' || isGameOver || thinking) return;
    
    const piece = board[r][c];
    
    if (!selected) {
      if (!piece || piece[0] !== 'w') return;
      setSelected({r, c});
      setValidMoves(calculateValidMoves(r, c, board));
      return;
    }

    const from = selected;
    const moving = board[from.r][from.c];
    if (!moving) {
      setSelected(null);
      setValidMoves([]);
      return;
    }

    // Reselect if clicking own piece
    if (piece && piece[0] === 'w') {
      setSelected({r, c});
      setValidMoves(calculateValidMoves(r, c, board));
      return;
    }

    // Check if move is valid
    const isValid = validMoves.some(m => m.r === r && m.c === c);
    if (!isValid) {
      setSelected(null);
      setValidMoves([]);
      return;
    }

    // Make move
    setBoard(prev => {
      const copy = prev.map(row => [...row]);
      const capturedPiece = copy[r][c];
      if (capturedPiece) {
        setCaptures(c => ({...c, w: c.w + 1}));
      }
      copy[r][c] = moving;
      copy[from.r][from.c] = null;
      return copy;
    });
    setLastMove({from, to: {r, c}});
    setMovesCount(m => m + 1);
    setTurn('b');
    setSelected(null);
    setValidMoves([]);
  };

  const restart = () => {
    setBoard(initialBoard.map(r => [...r]));
    setTurn('w');
    setSelected(null);
    setValidMoves([]);
    setMovesCount(0);
    setCaptures({w: 0, b: 0});
    setLastMove(null);
    setGameResult(null);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isLastMoveSquare = (r: number, c: number) => {
    if (!lastMove) return false;
    return (lastMove.from.r === r && lastMove.from.c === c) || 
           (lastMove.to.r === r && lastMove.to.c === c);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, rotateX: 10 }} 
        animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
        className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {language === 'ar' ? 'شطرنج المستقبل' : 'Cyber Chess'}
              </h2>
              <p className="text-xs text-cyan-400/70 font-mono">
                {language === 'ar' ? 'نسخة 3.0 - وضع AI' : 'v3.0 - AI Mode'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-cyan-400 hover:text-cyan-300 text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-cyan-500/10 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-cyan-400/70 mb-1 font-mono">{language === 'ar' ? 'الدور' : 'Turn'}</p>
            <div className="flex items-center justify-center gap-2">
              {turn === 'b' && <Brain className="w-4 h-4 text-purple-400 animate-pulse" />}
              <p className="text-lg font-bold text-cyan-100">
                {turn === 'w' ? (language === 'ar' ? 'أنت' : 'YOU') : (language === 'ar' ? 'AI' : 'AI')}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-purple-400/70 mb-1 font-mono">{language === 'ar' ? 'الحركات' : 'Moves'}</p>
            <p className="text-lg font-bold text-purple-100">{movesCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border border-green-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-green-400/70 mb-1 font-mono">{language === 'ar' ? 'التقاطاتك' : 'Your Captures'}</p>
            <p className="text-lg font-bold text-green-100">{captures.w}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-sm border border-red-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-red-400/70 mb-1 font-mono">{language === 'ar' ? 'التقاطات AI' : 'AI Captures'}</p>
            <p className="text-lg font-bold text-red-100">{captures.b}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-3 text-center">
            <p className="text-xs text-yellow-400/70 mb-1 font-mono">{language === 'ar' ? 'الوقت' : 'Time'}</p>
            <p className="text-lg font-bold text-yellow-100 font-mono">{formatTime(timeElapsed)}</p>
          </div>
        </div>

        {/* AI Thinking Indicator */}
        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 rounded-xl p-3"
            >
              <Cpu className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-purple-300 font-mono text-sm">
                {language === 'ar' ? 'AI يفكر...' : 'AI is thinking...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Chess Board */}
        <div className="perspective-1000 mb-6">
          <motion.div 
            className="mx-auto max-w-2xl"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateX: 0 }}
            initial={{ rotateX: 15 }}
            transition={{ duration: 1 }}
          >
            <div className="grid grid-cols-8 border-4 border-cyan-500/50 rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/30"
              style={{
                boxShadow: '0 0 60px rgba(6, 182, 212, 0.3), inset 0 0 60px rgba(139, 92, 246, 0.1)',
              }}
            >
            {board.map((row, r) => row.map((p, c) => {
              const dark = (r + c) % 2 === 1;
              const isSel = selected && selected.r === r && selected.c === c;
                const isValid = validMoves.some(m => m.r === r && m.c === c);
                const isLastMove = isLastMoveSquare(r, c);
                
              return (
                  <motion.button
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                    disabled={thinking}
                    whileHover={!thinking ? { scale: 1.05, z: 20 } : {}}
                    whileTap={!thinking ? { scale: 0.95 } : {}}
                    className={`
                      aspect-square flex items-center justify-center text-3xl sm:text-4xl select-none relative
                      transition-all duration-200
                      ${dark 
                        ? 'bg-gradient-to-br from-purple-900/80 to-purple-800/60' 
                        : 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/30'
                      }
                      ${isSel ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50 z-10' : ''}
                      ${isValid ? 'ring-2 ring-green-400 shadow-md shadow-green-400/40' : ''}
                      ${isLastMove ? 'ring-2 ring-cyan-400 shadow-md shadow-cyan-400/50' : ''}
                      ${!thinking && 'hover:brightness-125 cursor-pointer'}
                      ${thinking && 'cursor-not-allowed opacity-75'}
                    `}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isSel ? 'translateZ(10px)' : 'translateZ(0)',
                      textShadow: p 
                        ? p[0] === 'w' 
                          ? '0 0 20px rgba(6, 182, 212, 0.8), 0 0 5px rgba(255, 255, 255, 0.5)'
                          : '0 0 20px rgba(139, 92, 246, 0.8), 0 0 5px rgba(168, 85, 247, 0.5)'
                        : 'none'
                    }}
                  >
                    {p && (
                      <motion.span
                        initial={{ scale: 0, rotateY: 0 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        className={p[0] === 'w' ? 'text-cyan-100' : 'text-purple-200'}
                      >
                        {pieceEmoji[p]}
                      </motion.span>
                    )}
                    {isValid && !p && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-green-400/60 shadow-lg shadow-green-400/50"
                      />
                    )}
                  </motion.button>
              );
            }))}
          </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 flex-wrap justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restart} 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'ar' ? 'إعادة' : 'Restart'}</span>
          </motion.button>
          
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 rounded-xl text-purple-300 font-mono text-sm">
            <Cpu className="w-4 h-4" />
            <span>{language === 'ar' ? 'وضع الذكاء الاصطناعي' : 'AI Opponent Mode'}</span>
          </div>
        </div>

        {/* Game Over */}
        <AnimatePresence>
          {isGameOver && gameResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className={`mt-6 p-6 rounded-2xl text-center border-2 ${
                gameResult === 'win'
                  ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-green-400/50'
                  : 'bg-gradient-to-r from-red-500/20 to-purple-500/20 border-red-400/50'
              }`}
              style={{
                boxShadow: gameResult === 'win' 
                  ? '0 0 40px rgba(34, 197, 94, 0.3)' 
                  : '0 0 40px rgba(239, 68, 68, 0.3)',
              }}
            >
              <Trophy className={`w-16 h-16 mx-auto mb-4 ${
                gameResult === 'win' ? 'text-green-400' : 'text-red-400'
              }`} />
              <h3 className={`text-3xl font-bold mb-2 ${
                gameResult === 'win' ? 'text-green-300' : 'text-red-300'
              }`}>
                {gameResult === 'win' 
                  ? (language === 'ar' ? '🎉 فزت!' : '🎉 You Won!') 
                  : (language === 'ar' ? 'خسرت' : 'You Lost')
                }
              </h3>
              <p className="text-cyan-300 mb-3">
                {language === 'ar'
                  ? `الحركات: ${movesCount} | الالتقاطات: ${captures.w} | الوقت: ${formatTime(timeElapsed)}`
                  : `Moves: ${movesCount} | Captures: ${captures.w} | Time: ${formatTime(timeElapsed)}`
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-300">
                <Star className="w-6 h-6" />
                <span className="font-bold text-lg">
                  {language === 'ar' ? 'جاري احتساب النقاط...' : 'Calculating score...'}
                </span>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default ChessGame;
