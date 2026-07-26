import React from 'react';
import { cn } from './Button';
import { theme } from '../../design/theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'neutral' | 'primary' | 'secondary';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    
    const getVariantStyles = () => {
      switch (variant) {
        case 'success':
          return {
            '--badge-bg': theme.colors.bg.brand,
            '--badge-text': theme.colors.text.brand,
            '--badge-border': theme.colors.text.brand, // Optional border if needed
          };
        case 'warning':
          return {
            '--badge-bg': '#fef3c7', // amber-100
            '--badge-text': '#b45309', // amber-700
            '--badge-border': '#fcd34d', // amber-300
          };
        case 'neutral':
        case 'secondary':
          return {
            '--badge-bg': theme.colors.bg.tertiary,
            '--badge-text': theme.colors.text.secondary,
            '--badge-border': theme.colors.border.default,
          };
        case 'default':
        case 'primary':
        default:
          return {
            '--badge-bg': theme.colors.bg.primary,
            '--badge-text': theme.colors.text.primary,
            '--badge-border': theme.colors.border.light,
          };
      }
    };

    const style = {
      ...getVariantStyles(),
      '--badge-radius': theme.radius.md,
      '--badge-pad-y': theme.spacing[4],
      '--badge-pad-x': theme.spacing[8],
      '--badge-font-size': '11px',
      '--badge-font-weight': theme.typography.weights.bold,
      '--badge-font-family': theme.typography.fonts.sans,
    } as React.CSSProperties;

    return (
      <span
        ref={ref}
        style={style}
        className={cn(
          "inline-flex items-center justify-center",
          "bg-[var(--badge-bg)] text-[var(--badge-text)]",
          variant === 'default' ? "border border-[var(--badge-border)]" : "",
          "rounded-[var(--badge-radius)]",
          "py-[var(--badge-pad-y)] px-[var(--badge-pad-x)]",
          "text-[length:var(--badge-font-size)] font-[var(--badge-font-weight)]",
          "uppercase tracking-wider",
          "[font-family:var(--badge-font-family)]",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
