import React, { useState } from "react";
import { Dish } from "../types";
import { ChevronDown, Leaf, WheatOff, Info, AlertTriangle, Star, ChefHat, Phone, Calendar, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DishCardProps {
  item: Dish;
  propertyType: 'HOTEL' | 'HOMESTAY' | 'RESORT' | 'RETREAT';
}

export const DishCard: React.FC<DishCardProps> = ({ item, propertyType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  let allergensList: string[] = [];
  try {
    allergensList = JSON.parse(item.allergens);
  } catch (e) {
    // Ignore invalid JSON silent fallback
  }

  return (
    <>
      {isZoomed && item.imageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-8 right-6 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            onClick={() => setIsZoomed(false)}
          >
            <X size={24} />
          </button>
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-premium-hover"
          />
          <h3 className="text-white text-xl font-serif font-medium mt-6 text-center">{item.name}</h3>
        </div>
      )}
      <div className={cn(
        "py-4 flex items-start gap-10 transition-opacity text-left w-full border-b border-divider last:border-0",
      item.isOutOfStock && "opacity-50 grayscale-[0.8]"
    )}>
      {/* Dish Image as bullet */}
      {item.imageUrl && (
        <button 
          onClick={() => setIsZoomed(true)}
          className="w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-background border border-divider relative mt-1 block cursor-zoom-in group"
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {item.isOutOfStock && (
            <div className="absolute inset-0 bg-surface/60 flex items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-primary bg-surface/80 px-1 py-0.5 rounded">Out</span>
            </div>
          )}
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {/* Title & Price Row */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="font-serif font-semibold text-[17px] text-text-primary leading-snug truncate">{item.name}</h3>
              {item.isOutOfStock && !item.imageUrl && (
                <span className="bg-surface-hover text-text-secondary opacity-80 px-2 py-0.5 rounded-none text-[11px] font-medium uppercase tracking-wider">Sold Out</span>
              )}
            </div>
            {item.description && (
              <p className="font-sans text-sm text-text-secondary opacity-80 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <span className="font-semibold text-text-primary whitespace-nowrap mt-0.5">
            €{item.price.toFixed(2)}
          </span>
        </div>

        {/* Dietary and Status Text Line */}
        <div className="flex flex-wrap items-center justify-between gap-y-1.5 mt-0.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs font-medium text-text-secondary opacity-60 uppercase tracking-wide">
            {item.isPopular && <span className="flex items-center gap-1 text-amber-700"><Star size={10} className="fill-amber-500 text-amber-500" /> Popular</span>}
            {item.isChefRec && <span className="flex items-center gap-1 text-blue-700"><ChefHat size={10} /> Chef's Choice</span>}
            {item.dietaryCategory === "Vegan" && <span className="flex items-center gap-1 text-text-primary"><Leaf size={10} /> Vegan</span>}
            {item.dietaryCategory === "Vegetarian" && <span className="flex items-center gap-1 text-green-700"><Leaf size={10} /> Vegetarian</span>}
            {item.dietaryCategory === "Gluten-Free" && <span className="flex items-center gap-1 text-amber-700"><WheatOff size={10} /> GF</span>}
          </div>
          
          {/* Collapsible Trigger */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={`dish-info-${item.id}`}
            className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors py-1 text-[11px] font-medium"
          >
            <Info size={12} />
            {isExpanded ? 'Hide Info' : 'EU Allergen & Health Info'}
            <ChevronDown 
              size={12} 
              className={cn("transition-transform duration-300", isExpanded && "rotate-180")}
            />
          </button>
        </div>

        {/* Collapsible Health Info */}
        <div 
          id={`dish-info-${item.id}`}
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="bg-slate-50 rounded-sm p-8 space-y-4 text-sm border border-slate-100 mt-1">
              {/* EU Allergens */}
              <div>
                <h4 className="flex items-center gap-1.5 font-semibold text-slate-700 mb-2">
                  <AlertTriangle size={14} className="text-amber-500" /> 
                  Allergens (EU 1169/2011)
                </h4>
                {allergensList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allergensList.map(allergen => (
                      <span key={allergen} className="px-2 py-0.5 rounded-none text-[11px] font-medium uppercase tracking-wider bg-surface text-text-secondary opacity-80 border border-divider">
                        {allergen}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-xs">No mandatory allergens.</p>
                )}
              </div>

              {/* Nutritional Info */}
              {item.healthTips && (
                <div className="pt-3 border-t border-slate-200/60">
                  <h4 className="font-semibold text-slate-700 mb-1.5 text-xs uppercase tracking-wider">Health Tips</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {item.healthTips}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
