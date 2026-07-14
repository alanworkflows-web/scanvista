import React from 'react';
import { cn } from './Button';
import { theme } from '../../design/theme';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    
    const style = {
      '--ph-title-color': theme.colors.text.primary,
      '--ph-desc-color': theme.colors.text.secondary,
      '--ph-title-size': theme.typography.sizes['2xl'],
      '--ph-desc-size': theme.typography.sizes.sm,
      '--ph-font-serif': theme.typography.fonts.display,
      '--ph-font-sans': theme.typography.fonts.sans,
      '--ph-margin-bottom': theme.spacing[24],
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full",
          "mb-[var(--ph-margin-bottom)]",
          className
        )}
        {...props}
      >
        <div className="flex flex-col">
          <h1 className="text-[length:var(--ph-title-size)] [font-family:var(--ph-font-serif)] font-bold text-[var(--ph-title-color)] m-0 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[length:var(--ph-desc-size)] [font-family:var(--ph-font-sans)] text-[var(--ph-desc-color)] m-0">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';
