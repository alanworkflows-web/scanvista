import React from 'react';
import { cn } from './Button';
import { theme } from '../../design/theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    
    const style = {
      '--input-bg': theme.colors.bg.primary,
      '--input-border': theme.colors.border.default,
      '--input-focus-border': theme.colors.border.focus,
      '--input-text': theme.colors.text.primary,
      '--input-placeholder': theme.colors.text.tertiary,
      '--input-radius': theme.radius.lg,
      '--input-pad-y': theme.spacing[8],
      '--input-pad-x': theme.spacing[12],
      '--input-icon-pad': theme.spacing[32],
      '--input-font-size': theme.typography.sizes.sm,
      '--input-font-family': theme.typography.fonts.sans,
      '--input-transition': theme.motion.durations.fast,
      '--input-easing': theme.motion.easings.default,
    } as React.CSSProperties;

    return (
      <div className="relative w-full flex items-center">
        {icon && (
          <div className="absolute left-3 text-[var(--input-placeholder)] flex items-center pointer-events-none" style={style}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          style={style}
          className={cn(
            "w-full bg-[var(--input-bg)] text-[var(--input-text)] min-h-[44px] md:min-h-0",
            "border border-[var(--input-border)]",
            "rounded-[var(--input-radius)]",
            "py-[var(--input-pad-y)]",
            icon ? "pl-[var(--input-icon-pad)] pr-[var(--input-pad-x)]" : "px-[var(--input-pad-x)]",
            "text-[length:var(--input-font-size)] [font-family:var(--input-font-family)]",
            "placeholder:text-[var(--input-placeholder)]",
            "focus:outline-none focus:border-[var(--input-focus-border)] focus:ring-4 focus:ring-[var(--input-focus-border)]/20 shadow-sm focus:shadow-md",
            "transition-all duration-[var(--input-transition)] ease-[var(--input-easing)]",
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
