import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'completed' | 'progress' | 'locked' | 'default' | 'thesis';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  let style = 'bg-[#F4F2EC] text-editorial-muted border-border';

  if (variant === 'completed') {
    style = 'bg-[#EAF3EC] text-[#266C44] border-[#C1E1CB]';
  } else if (variant === 'progress') {
    style = 'bg-[#FBF2E7] text-[#B26926] border-[#F2D7B7]';
  } else if (variant === 'locked') {
    style = 'bg-[#F0EFEA] text-[#7B817D] border-[#D7D6CF]';
  } else if (variant === 'thesis') {
    style = 'bg-[#EAF3EC] text-[#2E473E] border-[#C4D9CD]';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {children}
    </span>
  );
};

