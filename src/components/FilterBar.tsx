import React from "react";
import { Leaf, WheatOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FilterState = {
  veganOnly: boolean;
  vegetarianOnly: boolean;
  hideGluten: boolean;
};

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function FilterBar({ filters, setFilters, compact }: FilterBarProps & { compact?: boolean }) {
  return (
    <div className={cn("flex w-full", compact ? "gap-1.5 flex-wrap" : "grid grid-cols-2 sm:grid-cols-3 gap-3")}>
      <button
        onClick={() => setFilters(prev => ({ ...prev, veganOnly: !prev.veganOnly, vegetarianOnly: false }))}
        className={cn(
          "flex items-center justify-center transition-all duration-200 border",
          compact ? "gap-1 px-2 py-1 rounded-lg text-[11px]" : "gap-2 px-4 py-2 rounded-xl text-sm",
          "font-medium",
          filters.veganOnly 
            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
            : "bg-white text-gray-700 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50"
        )}
      >
        <Leaf size={compact ? 12 : 14} className={cn(filters.veganOnly ? "text-emerald-100" : "text-emerald-500")} />
        Vegan Only
      </button>

      <button
        onClick={() => setFilters(prev => ({ ...prev, vegetarianOnly: !prev.vegetarianOnly, veganOnly: false }))}
        className={cn(
          "flex items-center justify-center transition-all duration-200 border",
          compact ? "gap-1 px-2 py-1 rounded-lg text-[11px]" : "gap-2 px-4 py-2 rounded-xl text-sm",
          "font-medium",
          filters.vegetarianOnly 
            ? "bg-green-600 text-white border-green-600 shadow-sm" 
            : "bg-white text-gray-700 border-gray-200 hover:border-green-200 hover:bg-green-50"
        )}
      >
        <Leaf size={compact ? 12 : 14} className={cn(filters.vegetarianOnly ? "text-green-100" : "text-green-500")} />
        Vegetarian
      </button>

      <button
        onClick={() => setFilters(prev => ({ ...prev, hideGluten: !prev.hideGluten }))}
        className={cn(
          "flex items-center justify-center transition-all duration-200 border",
          compact ? "gap-1 px-2 py-1 rounded-lg text-[11px]" : "gap-2 px-4 py-2 rounded-xl text-sm",
          "font-medium",
          filters.hideGluten 
            ? "bg-amber-500 text-white border-amber-500 shadow-sm" 
            : "bg-white text-gray-700 border-gray-200 hover:border-amber-200 hover:bg-amber-50"
        )}
      >
        <WheatOff size={compact ? 12 : 14} className={cn(filters.hideGluten ? "text-amber-100" : "text-amber-500")} />
        Hide Gluten
      </button>
    </div>
  );
}
