import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  className = ''
}) => {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {change && (
            <p className={`text-xs sm:text-sm ${changeColor[changeType]} truncate`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;