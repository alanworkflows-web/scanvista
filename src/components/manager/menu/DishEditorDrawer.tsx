import React, { useState, useEffect } from 'react';
import { Dish, Category } from './useMenuStudio';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { ImageUploader } from '../../ui/ImageUploader';

interface Props {
  dish: Dish | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: Dish) => void;
}

export function DishEditorDrawer({ dish, categories, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Dish>>({});

  useEffect(() => {
    if (dish) {
      setFormData(dish);
    } else {
      setFormData({});
    }
  }, [dish]);

  if (!isOpen || !dish) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Dish);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-4xl bg-surface shadow-premium z-50 transform transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Top Header & Save Bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-divider bg-background">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} className="p-2 -ml-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface-hover">
              <X size={20} />
            </button>
            <h2 className="text-xl font-serif font-medium text-text-primary">
              {dish.id.startsWith('temp-') ? 'Create New Dish' : 'Edit Dish Details'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="bg-surface">Discard Changes</Button>
            <Button type="submit" form="dish-form" className="bg-text-primary text-white hover:bg-text-primary/90">Save Dish</Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          
          {/* Left Column - Form Fields (70%) */}
          <div className="flex-1 p-8 lg:border-r border-divider">
            <form id="dish-form" onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Dish Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-text-primary font-medium"
                    placeholder="e.g. Truffle Parmesan Fries"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Price (€) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || 0}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-background border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-text-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Menu Description & Ingredients</label>
                <textarea
                  rows={3}
                  value={formData.healthTips || ''}
                  onChange={e => setFormData({ ...formData, healthTips: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-text-primary resize-none"
                  placeholder="Describe the dish, core ingredients, and flavor profile..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Category *</label>
                  <select
                    required
                    value={formData.categoryId || ''}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-text-primary"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Availability</label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={!formData.isOutOfStock}
                        onChange={e => setFormData({ ...formData, isOutOfStock: !e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-red-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-divider after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ml-3 text-sm font-medium text-text-primary">
                        {!formData.isOutOfStock ? "Available (In Stock)" : "Sold Out (Hidden)"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Dietary Type</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isVeg" checked={!formData.isVeg} onChange={() => setFormData({ ...formData, isVeg: false })} className="accent-primary" />
                      <span className="text-sm text-text-primary">Non-Veg</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isVeg" checked={formData.isVeg} onChange={() => setFormData({ ...formData, isVeg: true })} className="accent-primary" />
                      <span className="text-sm text-text-primary">Vegetarian</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Spice Level</label>
                  <select
                    value={formData.spiceLevel || 'None'}
                    onChange={e => setFormData({ ...formData, spiceLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-text-primary"
                  >
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Extra Spicy">Extra Spicy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Prep Time</label>
                  <input
                    type="text"
                    value={formData.preparationTime || ''}
                    onChange={e => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-text-primary"
                    placeholder="e.g. 15-20 mins"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Allergens</label>
                  <input
                    type="text"
                    value={(() => {
                      try { return JSON.parse(formData.allergens || "[]").join(", "); }
                      catch { return formData.allergens || ''; }
                    })()}
                    onChange={e => {
                      const tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData({ ...formData, allergens: JSON.stringify(tags) });
                    }}
                    className="w-full px-4 py-3 bg-background border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-text-primary"
                    placeholder="e.g. Nuts, Dairy (Comma separated)"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-divider">
                <label className="flex items-start gap-3 cursor-pointer p-5 bg-amber-50/50 border border-amber-200/50 hover:border-amber-300 rounded-xl transition-all">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={formData.isPopular}
                      onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-5 h-5 accent-amber-600 rounded cursor-pointer" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Mark as Popular / Chef's Recommendation</p>
                    <p className="text-xs text-amber-800/70 mt-1 leading-relaxed">Highlights this dish with a special badge on the guest menu, drawing attention to high-margin or signature items.</p>
                  </div>
                </label>
              </div>

            </form>
          </div>

          {/* Right Column - Media & Preview (30%) */}
          <div className="w-full lg:w-[320px] bg-background p-8 flex flex-col gap-8 flex-shrink-0">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Dish Photo</label>
              <div className="bg-surface border border-divider rounded-xl overflow-hidden">
                <ImageUploader
                  value={formData.imageUrl || ''}
                  onChange={val => setFormData({ ...formData, imageUrl: val })}
                  label="Upload Image"
                  aspectRatio="video"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Mobile Preview
              </label>
              <div className="border border-divider rounded-xl overflow-hidden bg-surface shadow-sm">
                <div className="p-4 pointer-events-none">
                  <div className="flex gap-4">
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} className="w-16 h-16 rounded object-cover flex-shrink-0" alt="Preview" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-medium text-text-primary text-sm truncate">{formData.name || "Dish Name"}</h4>
                      <p className="text-sm font-medium text-primary mt-0.5">
                        ${(formData.price || 0).toFixed(2)}
                      </p>
                      {formData.healthTips && (
                        <p className="text-[10px] text-text-secondary line-clamp-2 mt-1 leading-snug">{formData.healthTips}</p>
                      )}
                      
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {formData.isVeg && <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded">Veg</span>}
                        {formData.isPopular && <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded">Popular</span>}
                        {formData.spiceLevel && formData.spiceLevel !== 'None' && <span className="text-[9px] uppercase font-bold text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded">{formData.spiceLevel}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
