import React from 'react';
import { PageHeader } from './PageHeader';
import { ChevronRight } from 'lucide-react';
import { theme } from '../../design/theme';
import { Link } from 'react-router-dom';
import { cn } from './Button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface GlobalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const GlobalHeader = React.forwardRef<HTMLDivElement, GlobalHeaderProps>(
  ({ className, title, description, breadcrumbs, actions, ...props }, ref) => {
    
    return (
      <div ref={ref} className={cn("flex flex-col mb-2", className)} {...props}>
        <nav className="flex items-center text-sm font-medium mb-3 text-text-secondary opacity-60 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <Link 
                    to={crumb.href} 
                    className="hover:text-text-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn(isLast ? "text-text-primary" : "")}>
                    {crumb.label}
                  </span>
                )}
                
                {!isLast && (
                  <ChevronRight className="w-4 h-4 mx-2 text-text-muted shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </nav>
        <PageHeader 
          title={title} 
          description={description} 
          actions={actions} 
          className="mb-12" // Override margin for the global header structure
        />
      </div>
    );
  }
);
GlobalHeader.displayName = 'GlobalHeader';
