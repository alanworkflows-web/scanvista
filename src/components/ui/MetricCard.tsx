import React from 'react';
import { cn } from './Button';
import { Card } from './Card';
import { theme } from '../../design/theme';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, icon: Icon, trend, ...props }, ref) => {
    
    const style = {
      '--mc-title-color': theme.colors.text.secondary,
      '--mc-value-color': theme.colors.text.primary,
      '--mc-icon-color': theme.colors.text.tertiary,
      '--mc-title-size': theme.typography.sizes.sm,
      '--mc-value-size': theme.typography.sizes['3xl'],
      '--mc-font-sans': theme.typography.fonts.sans,
      '--mc-pad': theme.spacing[24],
    } as React.CSSProperties;

    return (
      <Card
        ref={ref}
        style={style}
        className={cn("p-[var(--mc-pad)] flex flex-col gap-2", className)}
        {...props}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[length:var(--mc-title-size)] [font-family:var(--mc-font-sans)] font-medium text-[var(--mc-title-color)] m-0">
            {title}
          </h3>
          {Icon && <Icon className="w-5 h-5 text-[var(--mc-icon-color)]" />}
        </div>
        
        <div className="flex items-baseline gap-3 mt-1">
          <p className="text-[length:var(--mc-value-size)] [font-family:var(--mc-font-sans)] font-medium text-[var(--mc-value-color)] m-0 leading-none">
            {value}
          </p>
          {trend && (
            <span 
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-primary" : "text-red-600"
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </Card>
    );
  }
);
MetricCard.displayName = 'MetricCard';
