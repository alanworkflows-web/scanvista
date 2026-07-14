import React from 'react';
import { cn } from './Button';
import { theme } from '../../design/theme';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, children, ...props }, ref) => {
    
    const style = {
      '--card-bg': theme.colors.bg.primary,
      '--card-border': theme.colors.border.light,
      '--card-radius': theme.radius['2xl'],
      '--card-shadow': theme.shadows.sm,
      '--card-hover-shadow': theme.shadows.medium,
      '--card-hover-border': theme.colors.border.focus,
      '--card-transition': theme.motion.durations.normal,
      '--card-easing': theme.motion.easings.default,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "bg-[var(--card-bg)]",
          "border border-[var(--card-border)]",
          "rounded-[var(--card-radius)]",
          "shadow-[var(--card-shadow)]",
          "overflow-hidden flex flex-col",
          "transition-all duration-[var(--card-transition)] ease-[var(--card-easing)]",
          hoverable && "hover:-translate-y-1 hover:shadow-[var(--card-hover-shadow)] hover:border-[var(--card-hover-border)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
