import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sage' | 'emerald' | 'sky' | 'amber' | 'purple' | 'orange' | 'coral' | 'stone';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sage',
  size = 'md',
  className = '',
  icon
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5'
  };

  const variantClasses = {
    sage: 'bg-sage-100 text-sage-800 border border-sage-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    sky: 'bg-sky-50 text-sky-700 border border-sky-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200',
    coral: 'bg-coral-50 text-coral-700 border border-coral-200',
    stone: 'bg-stone-100 text-stone-600 border border-stone-200'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
