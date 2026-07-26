import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface rounded-sm border border-divider shadow-premium text-center w-full">
      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary opacity-60 max-w-sm mx-auto mb-12 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
