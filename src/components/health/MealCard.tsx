import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Meal } from '../../types/nutrition';

interface MealCardProps {
  meal: Meal;
  onEdit?: (meal: Meal) => void;
  onDelete?: (meal: Meal) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onEdit, onDelete }) => {
  const { isDark } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={`p-3 sm:p-4 border rounded-lg
                 transition-colors duration-200 ${isDark 
                    ? 'bg-gray-800 border-gray-700 hover:border-emerald-800' 
                    : 'bg-white border-gray-100 hover:border-emerald-100'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <h4 className={`font-medium capitalize text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{meal.type}</h4>
            <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{meal.time}</span>
          </div>
          <motion.div 
            className="mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {meal.items.map((item, index) => (
              <p key={item.id} className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                {item.name}
                {index < meal.items.length - 1 && ', '}
              </p>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-2 sm:mt-0">
          <motion.div 
            className="text-right flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-emerald-500 font-medium text-sm sm:text-base">
              {meal.totalNutrition.calories} kcal
            </span>
            <div className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5 sm:mt-1 whitespace-nowrap`}>
              P: {meal.totalNutrition.protein.amount}g • 
              C: {meal.totalNutrition.carbs.amount}g • 
              F: {meal.totalNutrition.fat.amount}g
            </div>
          </motion.div>

          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit?.(meal)}
              className={`p-1 sm:p-1.5 rounded-full transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30' 
                  : 'text-gray-500 hover:text-emerald-500 hover:bg-emerald-50'
              }`}
              title="Edit meal"
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete?.(meal)}
              className={`p-1 sm:p-1.5 rounded-full transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
              title="Delete meal"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MealCard;