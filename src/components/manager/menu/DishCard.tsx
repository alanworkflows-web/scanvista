import React from 'react';
import { Dish } from './useMenuStudio';
import { Edit2, Copy, Trash2, Eye, EyeOff, Image as ImageIcon, Leaf, Flame, Star } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatPrice } from '../../../lib/currency';

interface Props {
  key?: string | number;
  dish: Dish;
  currency?: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

export function DishCard({ dish, currency = 'USD', onEdit, onDuplicate, onDelete, onToggleAvailability }: Props) {
  let allergensList: string[] = [];
  try { allergensList = JSON.parse(dish.allergens); } catch(e) {}

  return (
    <div className={cn(
      "group bg-surface rounded-sm border p-8 transition-all hover:shadow-premium hover:border-primary relative overflow-hidden",
      dish.isOutOfStock ? "border-divider opacity-60 bg-surface/50" : "border-divider"
    )}>
      {dish.isOutOfStock && (
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />
      )}
      
      <div className="flex gap-10">
        {/* Optional Image Thumbnail */}
        <div 
          onClick={onEdit}
          className="w-20 h-20 rounded-sm bg-background border border-divider flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden transition-transform group-hover:scale-[1.02]"
        >
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={24} className="text-text-muted/80" />
          )}
        </div>

        <div className="flex-1 cursor-pointer min-w-0" onClick={onEdit}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif font-medium text-lg text-text-primary truncate">{dish.name || "Unnamed Dish"}</h3>
            {dish.isOutOfStock && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0">
                Out of Stock
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <p className="text-sm font-medium text-primary">{formatPrice(dish.price, currency)}</p>
            
            <div className="flex flex-wrap gap-1.5 border-l border-divider pl-3">
              {dish.isVeg && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  <Leaf size={10} /> Veg
                </span>
              )}
              {dish.isPopular && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                  <Star size={10} /> Popular
                </span>
              )}
              {dish.spiceLevel && dish.spiceLevel !== 'None' && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                  <Flame size={10} /> {dish.spiceLevel}
                </span>
              )}
              {allergensList.map(a => (
                <span key={a} className="text-[10px] uppercase font-medium text-text-secondary opacity-80 bg-surface-hover border border-divider px-1.5 py-0.5 rounded">
                  {a}
                </span>
              ))}
            </div>
          </div>
          
          {dish.description && (
            <p className="text-sm text-text-secondary opacity-60 mt-2 line-clamp-2 leading-relaxed">{dish.description}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100 border-l border-divider pl-4 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAvailability(); }}
            className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-sm hover:bg-background"
            title={dish.isOutOfStock ? "Mark Available" : "Mark Out of Stock"}
          >
            {dish.isOutOfStock ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-text-muted hover:text-primary transition-colors rounded-sm hover:bg-primary/5"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-sm hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}