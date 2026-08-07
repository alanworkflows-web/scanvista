import React, { useState } from "react";
import { Dish } from "../types";
import { ChevronDown, Leaf, WheatOff, Info, AlertTriangle, Star, ChefHat, X, Sparkles } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatPrice } from "../lib/currency";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DishCardProps {
  item: Dish;
  propertyType: 'HOTEL' | 'HOMESTAY' | 'RESORT' | 'RETREAT';
  currency?: string;
}

export const DishCard: React.FC<DishCardProps> = ({ item, propertyType, currency = 'USD' }) => {
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
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setIsZoomed(false)}
          >
            <X size={20} />
          </button>
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
          />
          <div className="mt-4 text-center">
            <h3 className="text-white text-xl sm:text-2xl font-serif font-medium">{item.name}</h3>
            <p className="text-emerald-400 font-semibold text-lg mt-1">{formatPrice(item.price, currency)}</p>
          </div>
        </div>
      )}
      <div className={cn(
        "py-4 flex items-start gap-4 sm:gap-6 transition-opacity text-left w-full border-b border-divider/60 last:border-0",
        item.isOutOfStock && "opacity-50 grayscale-[0.8]"
      )}>
        {/* Dish Image */}
        {item.imageUrl && (
          <button 
            onClick={() => setIsZoomed(true)}
            className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-background border border-divider relative mt-0.5 block cursor-zoom-in group shadow-sm"
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors z-10" />
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {item.isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/80 px-2 py-0.5 rounded">Sold Out</span>
              </div>
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Title & Price Row */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-serif font-semibold text-base sm:text-lg text-text-primary leading-snug truncate">
                  {item.name}
                </h3>
                {item.isOutOfStock && !item.imageUrl && (
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Sold Out
                  </span>
                )}
              </div>
              {item.description && (
                <p className="font-sans text-xs sm:text-sm text-text-secondary opacity-80 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <span className="font-serif font-semibold text-text-primary whitespace-nowrap text-sm sm:text-base">
              {formatPrice(item.price, currency)}
            </span>
          </div>

          {/* Dietary and Status Text Line */}
          <div className="flex flex-wrap items-center justify-between gap-y-1.5 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {item.isPopular && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                  <Star size={11} className="fill-amber-500 text-amber-500" /> Popular
                </span>
              )}
              {item.isChefRec && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                  <ChefHat size={11} /> Chef's Rec
                </span>
              )}
              {item.dietaryCategory === "Vegan" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                  <Leaf size={11} /> Vegan
                </span>
              )}
              {item.dietaryCategory === "Vegetarian" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                  <Leaf size={11} /> Vegetarian
                </span>
              )}
              {item.dietaryCategory === "Gluten-Free" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                  <WheatOff size={11} /> Gluten-Free
                </span>
              )}
            </div>
            
            {/* Collapsible Trigger */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={`dish-info-${item.id}`}
              className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors py-1 text-xs font-medium"
            >
              <Info size={12} />
              <span>{isExpanded ? 'Hide Info' : 'Allergens & Info'}</span>
              <ChevronDown 
                size={13} 
                className={cn("transition-transform duration-300", isExpanded && "rotate-180")}
              />
            </button>
          </div>

          {/* Collapsible Health Info */}
          <div 
            id={`dish-info-${item.id}`}
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              isExpanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="bg-background rounded-xl p-4 space-y-3 text-xs border border-divider">
                {/* EU Allergens */}
                <div>
                  <h4 className="flex items-center gap-1.5 font-semibold text-text-primary mb-1.5">
                    <AlertTriangle size={13} className="text-amber-500" /> 
                    Allergens (EU Standard)
                  </h4>
                  {allergensList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {allergensList.map(allergen => (
                        <span key={allergen} className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-surface text-text-secondary border border-divider">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted italic">No allergens declared.</p>
                  )}
                </div>

                {/* Nutritional Info */}
                {item.healthTips && (
                  <div className="pt-2 border-t border-divider">
                    <h4 className="font-semibold text-text-primary mb-1 text-[11px] uppercase tracking-wider">Chef's Note & Tips</h4>
                    <p className="text-text-secondary leading-relaxed">
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
