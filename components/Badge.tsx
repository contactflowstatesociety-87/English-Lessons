
import React from 'react';

interface BadgeProps {
  text: string;
  type: 'Beginner' | 'Intermediate' | 'Advanced' | 'Completed' | 'Default';
}

const Badge: React.FC<BadgeProps> = ({ text, type }) => {
  const colorClasses = {
    Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const classes = colorClasses[type] || colorClasses.Default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {text}
    </span>
  );
};

export default Badge;
