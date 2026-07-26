import React from 'react';
import { Dish, Category } from './useMenuStudio';
import { Leaf, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Props {
  categories: Category[];
  dishes: Dish[];
  propertyName?: string;
}

export function GuestMenuPreview({ categories, dishes, propertyName = "Restaurant Menu" }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-surface-hover/50 p-8 rounded-sm">
      {/* Mobile Device Frame */}
      <div className="relative w-full max-w-[375px] h-[750px] bg-surface rounded-[40px] shadow-premium-hover border-[8px] border-gray-900 overflow-hidden flex flex-col">
        {/* Fake Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
          <div className="w-32 h-6 bg-gray-900 rounded-b-3xl"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pt-12 pb-8 px-4 bg-background no-scrollbar">
          
          <div className="mb-12 text-center">
            <h1 className="text-xl font-medium text-text-primary font-serif tracking-tight">{propertyName}</h1>
            <p className="text-sm text-text-secondary opacity-60 mt-1">Digital Guest Menu</p>
          </div>

          <div className="space-y-8">
            {categories.map(category => {
              const categoryDishes = dishes.filter(d => d.categoryId === category.id);
              if (categoryDishes.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <h2 className="text-lg font-medium text-text-primary sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b border-divider">
                    {category.name}
                  </h2>
                  
                  <div className="space-y-4">
                    {categoryDishes.map(dish => (
                      <div key={dish.id} className="bg-surface rounded-sm p-8 shadow-premium border border-divider/50 relative overflow-hidden">
                        {dish.isOutOfStock && (
                          <div className="absolute inset-0 bg-surface/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                              Sold Out
                            </span>
                          </div>
                        )}
                        <div className={cn("flex justify-between items-start gap-10", dish.isOutOfStock && "opacity-50")}>
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary">{dish.name}</h3>
                            {dish.healthTips && (
                              <p className="text-sm text-text-secondary opacity-60 mt-1 line-clamp-2 leading-relaxed">
                                {dish.healthTips}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {dish.allergens && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                                  <Info size={10} />
                                  Contains: {dish.allergens}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-medium text-text-primary">€{dish.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <p>Menu is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
