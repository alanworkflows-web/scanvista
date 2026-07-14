import React from 'react';
import { cn } from './Button';
import { theme } from '../../design/theme';

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, title, description, headerAction, children, ...props }, ref) => {
    
    const style = {
      '--sec-title-color': theme.colors.text.primary,
      '--sec-desc-color': theme.colors.text.secondary,
      '--sec-title-size': theme.typography.sizes.xl,
      '--sec-desc-size': theme.typography.sizes.sm,
      '--sec-font-serif': theme.typography.fonts.display,
      '--sec-font-sans': theme.typography.fonts.sans,
      '--sec-pad-y': theme.spacing[32],
      '--sec-gap': theme.spacing[16],
    } as React.CSSProperties;

    return (
      <section
        ref={ref}
        style={style}
        className={cn(
          "flex flex-col w-full py-[var(--sec-pad-y)]",
          className
        )}
        {...props}
      >
        {(title || headerAction) && (
          <div className="flex items-center justify-between gap-4 mb-[var(--sec-gap)]">
            <div className="flex flex-col">
              {title && (
                <h2 className="text-[length:var(--sec-title-size)] [font-family:var(--sec-font-serif)] font-bold text-[var(--sec-title-color)] m-0">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-[length:var(--sec-desc-size)] [font-family:var(--sec-font-sans)] text-[var(--sec-desc-color)] m-0">
                  {description}
                </p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        <div className="flex flex-col w-full gap-[var(--sec-gap)]">
          {children}
        </div>
      </section>
    );
  }
);
Section.displayName = 'Section';
