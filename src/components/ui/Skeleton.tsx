import React from 'react';
import { cn } from './Button';
import { theme } from '../../design/theme';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', ...props }, ref) => {
    
    const style = {
      '--sk-bg': theme.colors.bg.tertiary,
      '--sk-radius': variant === 'circular' ? theme.radius.full : variant === 'text' ? theme.radius.sm : theme.radius.xl,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "animate-pulse bg-[var(--sk-bg)] rounded-[var(--sk-radius)]",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';
