import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 font-semibold'
  };

  const variantClasses = {
    primary: 'bg-sage-600 hover:bg-sage-700 text-white shadow-sm hover:shadow focus:ring-sage-500',
    secondary: 'bg-sage-100 hover:bg-sage-200 text-sage-800 focus:ring-sage-400',
    outline: 'border border-stone-200 hover:bg-stone-50 text-stone-700 focus:ring-stone-300',
    ghost: 'hover:bg-stone-100 text-stone-600 focus:ring-stone-200',
    danger: 'bg-coral-500 hover:bg-coral-600 text-white shadow-sm focus:ring-coral-400'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
