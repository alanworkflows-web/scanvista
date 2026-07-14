import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { theme } from '../../design/theme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  status?: 'idle' | 'loading' | 'success';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, status = 'idle', children, ...props }, ref) => {
    
    const getVariantStyles = () => {
      switch (variant) {
        case 'secondary':
          return {
            '--btn-bg': theme.colors.bg.primary,
            '--btn-hover-bg': theme.colors.bg.secondary,
            '--btn-text': theme.colors.text.primary,
            '--btn-border': theme.colors.border.default,
            '--btn-shadow': theme.shadows.sm,
          };
        case 'danger':
          return {
            '--btn-bg': theme.colors.bg.primary,
            '--btn-hover-bg': '#fef2f2', // light red
            '--btn-text': '#ef4444', // red-500
            '--btn-border': '#f87171',
            '--btn-shadow': theme.shadows.sm,
          };
        case 'ghost':
          return {
            '--btn-bg': 'transparent',
            '--btn-hover-bg': theme.colors.bg.secondary,
            '--btn-text': theme.colors.text.secondary,
            '--btn-border': 'transparent',
            '--btn-shadow': 'none',
          };
        case 'primary':
        default:
          return {
            '--btn-bg': theme.colors.action.primary,
            '--btn-hover-bg': theme.colors.action.primaryHover,
            '--btn-text': theme.colors.text.inverse,
            '--btn-border': 'transparent',
            '--btn-shadow': theme.shadows.sm,
          };
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            '--btn-pad-y': theme.spacing[4],
            '--btn-pad-x': theme.spacing[8],
            '--btn-text-size': theme.typography.sizes.xs,
          };
        case 'lg':
          return {
            '--btn-pad-y': theme.spacing[12],
            '--btn-pad-x': theme.spacing[24],
            '--btn-text-size': theme.typography.sizes.base,
          };
        case 'md':
        default:
          return {
            '--btn-pad-y': theme.spacing[8],
            '--btn-pad-x': theme.spacing[16],
            '--btn-text-size': theme.typography.sizes.sm,
          };
      }
    };

    const style = {
      ...getVariantStyles(),
      ...getSizeStyles(),
      '--btn-radius': theme.radius.xl,
      '--btn-transition': theme.motion.durations.normal,
      '--btn-easing': theme.motion.easings.default,
      '--btn-font-weight': theme.typography.weights.medium,
      '--btn-font-family': theme.typography.fonts.sans,
    } as React.CSSProperties;

    return (
      <button
        ref={ref}
        style={style}
        disabled={isLoading || status === 'loading' || props.disabled}
        className={cn(
          "inline-flex items-center justify-center border min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0",
          status === 'success' ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent" : "bg-[var(--btn-bg)] hover:bg-[var(--btn-hover-bg)] text-[var(--btn-text)]",
          "border-[var(--btn-border)]",
          "rounded-[var(--btn-radius)]",
          "py-[var(--btn-pad-y)] px-[var(--btn-pad-x)]",
          "text-[length:var(--btn-text-size)] font-[var(--btn-font-weight)]",
          "shadow-[var(--btn-shadow)]",
          "transition-all duration-[var(--btn-transition)] ease-[var(--btn-easing)]",
          "active:scale-[0.98] hover:-translate-y-px",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0",
          "[font-family:var(--btn-font-family)]",
          className
        )}
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
