import React from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/Input";
import { GUEST_FILTERS } from "../../lib/guestJourney";

interface GuestFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function GuestFilters({ searchQuery, onSearchChange, activeFilter, onFilterChange }: GuestFiltersProps) {
  return (
    <div className="px-8 pb-6 space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} aria-hidden="true" />
        <Input
          className="pl-10 py-5 w-full bg-surface border-divider"
          placeholder="Search by name, phone, or room..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search guests by name, phone, or room number"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide relative" role="toolbar" aria-label="Guest filters">
        {/* Fade hint for horizontal scroll on mobile */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 sm:hidden" />
        {GUEST_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            aria-pressed={activeFilter === filter}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? "bg-gray-900 text-white"
                : "bg-surface-hover text-text-secondary opacity-80 hover:bg-gray-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
