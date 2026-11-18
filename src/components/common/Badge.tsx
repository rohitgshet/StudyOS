import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variants = {
    default: 'bg-black/[0.05] dark:bg-white/[0.08] text-muted-foreground border-transparent backdrop-blur-md',
    primary: 'bg-[#0071E3]/12 text-[#0071E3] dark:text-[#38BDF8] border-[#0071E3]/25 backdrop-blur-md',
    success: 'bg-[#10B981]/12 text-[#059669] dark:text-[#34D399] border-[#10B981]/25 backdrop-blur-md',
    warning: 'bg-[#DEC5A6]/25 text-[#92400E] dark:text-[#FDE68A] border-[#DEC5A6]/40 backdrop-blur-md',
    danger: 'bg-[#FFF5F7] dark:bg-[#FB7185]/15 text-[#E11D48] dark:text-[#FDA4AF] border-[#FB7185]/30 backdrop-blur-md',
    outline: 'border border-black/[0.08] dark:border-white/[0.12] text-foreground bg-white/40 dark:bg-white/[0.04] backdrop-blur-md',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-0.5 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border transition-colors shadow-2xs',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
