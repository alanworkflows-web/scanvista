import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const baseClasses = "inline-flex items-center justify-center font-sans transition-all duration-200 ease-out min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 rounded-lg active:scale-[0.98] focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0";
    
    let variantClasses = "";
    if (variant === 'primary') {
      variantClasses = "bg-primary text-white border border-transparent shadow-sm hover:bg-primary-hover hover:-translate-y-px active:translate-y-0";
    } else if (variant === 'secondary') {
      variantClasses = "bg-surface text-text-primary border border-divider shadow-sm hover:bg-surface-hover hover:border-primary/40 hover:-translate-y-px active:translate-y-0";
    } else if (variant === 'ghost') {
      variantClasses = "bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-surface hover:-translate-y-px";
    }

    let sizeClasses = "";
    if (size === 'sm') sizeClasses = "py-2 px-4 text-xs font-medium uppercase tracking-widest";
    else if (size === 'md') sizeClasses = "py-3 px-6 text-sm font-medium";
    else if (size === 'lg') sizeClasses = "py-4 px-8 text-base font-medium";

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

