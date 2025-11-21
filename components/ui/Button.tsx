import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none focus:ring-rose-500",
    outline: "border-2 border-rose-200 dark:border-night-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-night-800 focus:ring-rose-200",
    ghost: "text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-night-800 hover:text-rose-700",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};