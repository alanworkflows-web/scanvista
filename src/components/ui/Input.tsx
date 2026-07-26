import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    
    return (
      <div className="relative w-full flex items-center">
        {icon && (
          <div className="absolute left-4 text-text-muted flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-surface text-text-primary min-h-[48px]",
            "border border-divider rounded-sm",
            "py-3",
            icon ? "pl-11 pr-4" : "px-4",
            "text-base font-sans",
            "placeholder:text-text-muted",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm focus:shadow-premium transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';
