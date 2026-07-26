import React from "react";
import { Leaf, WheatOff, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FilterState = {
  veganOnly: boolean;
  vegetarianOnly: boolean;
  hideGluten: boolean;
  searchQuery: string;
};

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function FilterBar({ filters, setFilters, compact }: FilterBarProps & { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-text-muted" />
        </div>
        <input
          type="text"
          placeholder="Search menu..."
          value={filters.searchQuery || ""}
          onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 bg-surface border border-divider rounded-sm focus:ring-4 focus:ring-primary/20 shadow-premium focus:shadow-premium-hover focus:border-transparent outline-none text-sm transition-all shadow-premium placeholder:text-text-muted"
          aria-label="Search menu items"
        />
      </div>
      <div className={cn("flex w-full", compact ? "gap-1.5 flex-wrap" : "grid grid-cols-2 sm:grid-cols-3 gap-3")}>
      <button
        onClick={() => setFilters(prev => ({ ...prev, veganOnly: !prev.veganOnly, vegetarianOnly: false }))}
        aria-label="Toggle vegan filter"
        aria-pressed={filters.veganOnly}
        className={cn(
          "flex items-center justify-center transition-all duration-200 border",
          compact ? "gap-1 px-2 py-1 rounded-sm text-[11px]" : "gap-2 px-4 py-2 rounded-sm text-sm",
          "font-medium",
          filters.veganOnly 
            ? "bg-primary hover:bg-primary-hover text-white shadow-premium-hover transition-all text-white border-emerald-600 shadow-premium" 
            : "bg-surface text-text-secondary border-divider hover:border-divider hover:bg-primary/5"
        )}
      >
        <Leaf size={compact ? 12 : 14} className={cn(filters.veganOnly ? "text-emerald-100" : "text-primary")} />
        Vegan Only
      </button>

      <button
        onClick={() => setFilters(prev => ({ ...prev, vegetarianOnly: !prev.vegetarianOnly, veganOnly: false }))}
        aria-label="Toggle vegetarian filter"
        aria-pressed={filters.vegetarianOnly}
        className={cn(
          "flex items-center justify-center transition-all duration-200 border",
          compact ? "gap-1 px-2 py-1 rounded-sm text-[11px]" : "gap-2 px-4 py-2 rounded-sm text-sm",
          "font-medium",
          filters.vegetarianOnly 
            ? "bg-green-600 text-white border-green-600 shadow-premium" 
            : "bg-surface text-text-secondary border-divider hover:border-green-200 hover:bg-green-50"
        )}
      >
        <Leaf size={compact ? 12 : 14} className={cn(filters.vegetarianOnly ? "text-green-100" : "text-green-500")} />
        Vegetarian
      </button>

      <button
        onClick={() => setFilters(prev => ({ ...prev, hideGluten: !prev.hideGluten }))}
        aria-label="Toggle gluten-free filter"
        aria-pressed={filters.hideGluten}
        className={cn(
          "flex items-center justify-center transition-all duration-200 border",
          compact ? "gap-1 px-2 py-1 rounded-sm text-[11px]" : "gap-2 px-4 py-2 rounded-sm text-sm",
          "font-medium",
          filters.hideGluten 
            ? "bg-amber-500 text-white border-amber-500 shadow-premium" 
            : "bg-surface text-text-secondary border-divider hover:border-amber-200 hover:bg-amber-50"
        )}
      >
        <WheatOff size={compact ? 12 : 14} className={cn(filters.hideGluten ? "text-amber-100" : "text-amber-500")} />
        Hide Gluten
      </button>
      </div>
    </div>
  );
}
