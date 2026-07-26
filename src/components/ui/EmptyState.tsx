import React from 'react';
import { cn } from './Button';
import { theme } from '../../design/theme';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    
    const style = {
      '--es-bg': theme.colors.bg.secondary,
      '--es-text-primary': theme.colors.text.primary,
      '--es-text-secondary': theme.colors.text.secondary,
      '--es-icon-color': theme.colors.text.tertiary,
      '--es-radius': theme.radius['3xl'],
      '--es-pad': theme.spacing[32],
      '--es-gap': theme.spacing[16],
      '--es-icon-size': theme.spacing[48],
      '--es-icon-bg': theme.colors.bg.primary,
      '--es-icon-pad': theme.spacing[16],
      '--es-title-size': theme.typography.sizes.xl,
      '--es-desc-size': theme.typography.sizes.base,
      '--es-font-serif': theme.typography.fonts.display,
      '--es-font-sans': theme.typography.fonts.sans,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          "bg-[var(--es-bg)] rounded-[var(--es-radius)]",
          "p-[var(--es-pad)] gap-[var(--es-gap)]",
          "border border-[var(--es-border,transparent)]", // optional border if needed
          "animate-in fade-in zoom-in-[0.98] duration-700 ease-out",
          className
        )}
        {...props}
      >
        <div 
          className="flex items-center justify-center rounded-full bg-[var(--es-icon-bg)] shadow-premium"
          style={{ width: 'var(--es-icon-size)', height: 'var(--es-icon-size)' }}
        >
          <Icon className="w-1/2 h-1/2 text-[var(--es-icon-color)]" />
        </div>
        
        <div className="flex flex-col gap-2 max-w-sm">
          <h3 className="text-[length:var(--es-title-size)] [font-family:var(--es-font-serif)] font-medium text-[var(--es-text-primary)] m-0">
            {title}
          </h3>
          {description && (
            <p className="text-[length:var(--es-desc-size)] [font-family:var(--es-font-sans)] text-[var(--es-text-secondary)] m-0 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="mt-4">
            <Button onClick={action.onClick} variant="primary">
              {action.label}
            </Button>
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';
