import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NutritionProgressProps {
  caloriesConsumed: number;
  calorieGoal: number;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
  }[];
}

const NutritionProgress: React.FC<NutritionProgressProps> = ({
  caloriesConsumed,
  calorieGoal,
  meals
}) => {
  const { isDark } = useTheme();
  const [hoveredMeal, setHoveredMeal] = useState<string | null>(null);
  const caloriesLeft = calorieGoal - caloriesConsumed;

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 sm:p-8 shadow-lg`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Progress Ring Section */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute -top-2 left-0 right-0 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-lg sm:text-xl tracking-wider font-mono inline-flex items-center justify-center"
            >
              <span className="text-emerald-500">CALORIE BUDGET</span>
              <span className="text-blue-500 ml-2">{calorieGoal}</span>
            </motion.div>
          </div>

          <motion.div
            className="relative w-48 h-48 sm:w-64 sm:h-64"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Center Content */}
            <motion.div 
              className="h-full flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Apple className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500 mb-3" />
                <div className="absolute inset-0 bg-emerald-500 opacity-10 blur-xl" />
              </motion.div>
              <motion.div
                className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {caloriesConsumed}
              </motion.div>
              <motion.div
                className="text-sm sm:text-base text-emerald-500 font-semibold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                {caloriesLeft} remaining
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Meal Breakdown Section */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`font-semibold mb-6 tracking-wide ${isDark ? 'text-white' : 'text-gray-800'}`}
          >
            MEAL BREAKDOWN
          </motion.h3>
          {meals.map((meal, index) => (
            <motion.div
              key={meal.type}
              initial={{ opacity: 0, x: -10, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              className="relative group"
              onMouseEnter={() => setHoveredMeal(meal.type)}
              onMouseLeave={() => setHoveredMeal(null)}
            >
              <div className={`
                flex items-center justify-between p-4 rounded-xl
                transition-all duration-200 ease-out
                ${isDark
                  ? hoveredMeal === meal.type
                    ? 'shadow-md bg-gray-700/80 scale-[1.01]'
                    : 'shadow-sm bg-gray-700/50 hover:bg-gray-700'
                  : hoveredMeal === meal.type
                    ? 'shadow-md bg-gray-100/80 scale-[1.01]'
                    : 'shadow-sm bg-gray-50 hover:bg-gray-100/50'
                }
              `}>
                <div className="flex items-center gap-3">
                  <span className="text-xl select-none">{getMealIcon(meal.type)}</span>
                  <span className={`font-medium capitalize ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {meal.type}
                  </span>
                </div>
                <motion.div
                  className={`
                    font-mono font-bold transition-colors duration-200
                    ${hoveredMeal === meal.type 
                      ? 'text-emerald-500' 
                      : isDark ? 'text-gray-300' : 'text-gray-600'
                    }
                  `}
                >
                  {meal.calories} cal
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NutritionProgress;