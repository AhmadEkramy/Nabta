import { motion } from 'framer-motion';
import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, color, loading = false }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          {loading ? (
            <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;