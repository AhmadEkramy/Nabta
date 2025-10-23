import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Lightbulb, Trophy, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SudokuGameProps {
  onGameComplete: (score: number, xpEarned: number) => void;
  onClose: () => void;
}

type Grid = number[][]; // 9x9

const basePuzzle: Grid = [
  [0,0,0,2,6,0,7,0,1],
  [6,8,0,0,7,0,0,9,0],
  [1,9,0,0,0,4,5,0,0],
  [8,2,0,1,0,0,0,4,0],
  [0,0,4,6,0,2,9,0,0],
  [0,5,0,0,0,3,0,2,8],
  [0,0,9,3,0,0,0,7,4],
  [0,4,0,0,5,0,0,3,6],
  [7,0,3,0,1,8,0,0,0],
];

const solution: Grid = [
  [4,3,5,2,6,9,7,8,1],
  [6,8,2,5,7,1,4,9,3],
  [1,9,7,8,3,4,5,6,2],
  [8,2,6,1,9,5,3,4,7],
  [3,7,4,6,8,2,9,1,5],
  [9,5,1,7,4,3,6,2,8],
  [5,1,9,3,2,6,8,7,4],
  [2,4,8,9,5,7,1,3,6],
  [7,6,3,4,1,8,2,5,9],
];

const SudokuGame: React.FC<SudokuGameProps> = ({ onGameComplete, onClose }) => {
  const { language } = useLanguage();
  const [grid, setGrid] = useState<Grid>(() => basePuzzle.map(r => [...r]));
  const [fixed, setFixed] = useState<boolean[][]>(() => basePuzzle.map(row => row.map(v => v !== 0)));
  const [errors, setErrors] = useState<number>(0);
  const [hints, setHints] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const isComplete = useMemo(() => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== solution[r][c]) return false;
      }
    }
    return true;
  }, [grid]);

  useEffect(() => {
    if (isComplete) {
      const timePenalty = timeElapsed; // 1 point per second
      const errorPenalty = errors * 25;
      const hintPenalty = hints * 40;
      const raw = 1200 - timePenalty - errorPenalty - hintPenalty;
      const score = Math.max(150, raw);
      const xp = Math.floor(score / 12);
      setTimeout(() => onGameComplete(score, xp), 400);
    }
  }, [isComplete]);

  const handleChange = (r: number, c: number, value: string) => {
    if (fixed[r][c]) return;
    const n = parseInt(value, 10);
    if (Number.isNaN(n) || n < 1 || n > 9) {
      setGrid(prev => {
        const copy = prev.map(row => [...row]);
        copy[r][c] = 0;
        return copy;
      });
      return;
    }
    setGrid(prev => {
      const copy = prev.map(row => [...row]);
      copy[r][c] = n;
      return copy;
    });
    if (n !== solution[r][c]) setErrors(e => e + 1);
  };

  const giveHint = () => {
    // find first incorrect/empty cell and fill from solution
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!fixed[r][c] && grid[r][c] !== solution[r][c]) {
          setGrid(prev => {
            const copy = prev.map(row => [...row]);
            copy[r][c] = solution[r][c];
            return copy;
          });
          setHints(h => h + 1);
          return;
        }
      }
    }
  };

  const restart = () => {
    setGrid(basePuzzle.map(r => [...r]));
    setErrors(0);
    setHints(0);
    setStartTime(Date.now());
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const cellBorder = (r: number, c: number) => {
    const parts = ['border','border-gray-300','dark:border-gray-700'];
    if (r % 3 === 0) parts.push('border-t-2');
    if (c % 3 === 0) parts.push('border-l-2');
    if (r === 8) parts.push('border-b-2');
    if (c === 8) parts.push('border-r-2');
    return parts.join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{language === 'ar' ? 'سودوكو' : 'Sudoku'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'الأخطاء' : 'Errors'}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{errors}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'التلميحات' : 'Hints'}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{hints}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'الوقت' : 'Time'}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(timeElapsed)}</p>
          </div>
        </div>

        {/* Board */}
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-9">
            {grid.map((row, r) => row.map((val, c) => (
              <div key={`${r}-${c}`} className={`aspect-square ${cellBorder(r,c)} flex items-center justify-center bg-gray-50 dark:bg-gray-900`}>
                {(fixed[r] && fixed[r][c]) ? (
                  <span className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200">{val}</span>
                ) : (
                  <input
                    inputMode="numeric"
                    pattern="[1-9]"
                    maxLength={1 as any}
                    value={val === 0 ? '' : String(val)}
                    onChange={(e) => handleChange(r, c, e.target.value.replace(/[^1-9]/g, ''))}
                    className="w-full h-full text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none text-lg sm:text-xl"
                  />
                )}
              </div>
            )))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={restart} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'ar' ? 'إعادة' : 'Restart'}</span>
          </button>
          <button onClick={giveHint} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            <Lightbulb className="w-4 h-4" />
            <span>{language === 'ar' ? 'تلميح' : 'Hint'}</span>
          </button>
        </div>

        {/* Completion banner (shown briefly before closing) */}
        {isComplete && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 text-white rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-2" />
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              <span className="font-semibold">{language === 'ar' ? 'أحسنت! يتم احتساب نقاطك...' : 'Great! Scoring your run...'}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SudokuGame;


