import React, { useState } from "react";
import { Dish } from "../types";
import { ChevronDown, Leaf, WheatOff, Info, AlertTriangle, Star, ChefHat, Phone, Calendar } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DishCardProps {
  item: Dish;
  propertyType: 'HOTEL' | 'HOMESTAY' | 'RESORT' | 'RETREAT';
  roomServicePhone?: string;
  hostPhone?: string; // fallback if needed
}

export const DishCard: React.FC<DishCardProps> = ({ item, propertyType, roomServicePhone, hostPhone }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  let allergensList: string[] = [];
  try {
    allergensList = JSON.parse(item.allergens);
  } catch (e) {
    console.error("Failed to parse allergens");
  }

  const isPreplanned = propertyType === 'HOMESTAY' || propertyType === 'RETREAT';

  return (
    <div className={cn(
      "py-5 flex items-start gap-4 transition-opacity text-left w-full",
      item.isOutOfStock && "opacity-60 grayscale-[0.5]"
    )}>
      {/* Dish Image as bullet */}
      {item.imageUrl && (
        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative mt-1">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {item.isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900 bg-white/80 px-1 py-0.5 rounded">Out</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2.5">
        {/* Title & Price Row */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-serif text-lg font-medium text-gray-900 leading-tight">{item.name}</h3>
              {item.isOutOfStock && !item.imageUrl && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">Sold Out</span>
              )}
            </div>
            {item.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
          <span className="font-medium text-emerald-700 whitespace-nowrap mt-0.5">
            €{item.price.toFixed(2)}
          </span>
        </div>

        {/* Dietary and Status Text Line */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
            {item.isPopular && <span className="flex items-center gap-1 text-amber-700"><Star size={12} className="fill-amber-500 text-amber-500" /> Popular</span>}
            {item.isChefRec && <span className="flex items-center gap-1 text-blue-700"><ChefHat size={12} /> Chef's Choice</span>}
            {item.dietaryCategory === "Vegan" && <span className="flex items-center gap-1 text-emerald-700"><Leaf size={12} /> Vegan</span>}
            {item.dietaryCategory === "Vegetarian" && <span className="flex items-center gap-1 text-green-700"><Leaf size={12} /> Vegetarian</span>}
            {item.dietaryCategory === "Gluten-Free" && <span className="flex items-center gap-1 text-amber-700"><WheatOff size={12} /> GF</span>}
          </div>
          
          {/* Collapsible Trigger */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors py-1 text-xs font-medium"
          >
            <Info size={14} />
            {isExpanded ? 'Hide Info' : 'EU Allergen & Health Info'}
            <ChevronDown 
              size={14} 
              className={cn("transition-transform duration-300", isExpanded && "rotate-180")}
            />
          </button>
        </div>

        {/* Collapsible Health Info */}
        <div 
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="bg-slate-50 rounded-xl p-4 space-y-4 text-sm border border-slate-100 mt-1">
              {/* EU Allergens */}
              <div>
                <h4 className="flex items-center gap-1.5 font-semibold text-slate-700 mb-2">
                  <AlertTriangle size={14} className="text-amber-500" /> 
                  Allergens (EU 1169/2011)
                </h4>
                {allergensList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allergensList.map(allergen => (
                      <span key={allergen} className="px-2 py-0.5 bg-white text-slate-600 rounded-md border border-slate-200 text-xs font-medium tracking-wide">
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

        {/* Action Line */}
        <div className="mt-1">
          {!item.isOutOfStock && isPreplanned && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
              <Calendar size={14} />
              <span>Pre-planned Meal (Call Host to Coordinate)</span>
            </div>
          )}
          {!item.isOutOfStock && !isPreplanned && roomServicePhone && (
            <a 
              href={`tel:${roomServicePhone}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Phone size={14} />
              Call Room Service to Order
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
