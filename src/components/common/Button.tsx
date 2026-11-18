import React from 'react';
import { cn } from '../../lib/utils';
import { sound } from '../../lib/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      sound.playTick();
      onClick?.(e);
    }
  };

  const variants = {
    primary: 'bg-[#0071E3] hover:bg-[#005BB6] text-white shadow-sm border border-[#0071E3]/20',
    secondary: 'bg-[#F4ECE0]/80 dark:bg-white/[0.08] text-foreground hover:bg-[#EBDDC9] dark:hover:bg-white/[0.12] border border-black/[0.05] dark:border-white/[0.08] backdrop-blur-md',
    outline: 'border border-black/[0.08] dark:border-white/[0.12] bg-white/60 dark:bg-white/[0.05] hover:bg-white/90 dark:hover:bg-white/[0.1] text-foreground backdrop-blur-md shadow-2xs',
    ghost: 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-foreground',
    danger: 'bg-[#FFF5F7] dark:bg-[#FB7185]/15 text-[#E11D48] dark:text-[#FDA4AF] hover:bg-[#FCE7F0] dark:hover:bg-[#FB7185]/25 border border-[#FB7185]/30 backdrop-blur-md',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-2xl gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
