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
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center w-full">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
