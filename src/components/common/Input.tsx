import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-sm rounded-xl px-3.5 py-2 outline-none transition-all duration-200 backdrop-blur-md shadow-2xs',
            'focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20',
            'placeholder:text-muted-foreground/50',
            icon && 'pl-9',
            error && 'border-[#FB7185] focus:border-[#FB7185] focus:ring-[#FB7185]/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#E11D48] dark:text-[#FDA4AF] mt-1">{error}</p>}
    </div>
  );
};
