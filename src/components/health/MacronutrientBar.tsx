import { motion } from 'framer-motion';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface MacronutrientBarProps {
  label: string;
  percentage: number;
  color: string;
  calories: number;
}

const MacronutrientBar: React.FC<MacronutrientBarProps> = ({
  label,
  percentage,
  color,
  calories,
}) => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
        <motion.span 
          className="text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {percentage}%
        </motion.span>
      </div>
      <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-1.5`}>
        <motion.div
          className={`${color} rounded-full h-1.5`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <motion.div 
        className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {calories} kcal
      </motion.div>
    </div>
  );
};

export default MacronutrientBar;