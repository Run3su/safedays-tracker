import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-night-900 rounded-2xl shadow-sm border border-rose-100 dark:border-night-800 overflow-hidden transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
};