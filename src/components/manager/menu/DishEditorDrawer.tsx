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
        "fixed inset-y-0 right-0 w-full max-w-md bg-surface shadow-premium-hover z-50 transform transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <h2 className="text-lg font-semibold text-text-primary">
            {dish.id.startsWith('temp-') ? 'New Dish' : 'Edit Dish'}
          </h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface-hover">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form id="dish-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Dish Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="e.g. Truffle Fries"
                />
              </div>

              <div className="flex gap-10">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Price (€) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || 0}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-divider rounded-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId || ''}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-divider rounded-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-surface"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-divider" />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Guest Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description / Health Tips</label>
                <textarea
                  rows={3}
                  value={formData.healthTips || ''}
                  onChange={e => setFormData({ ...formData, healthTips: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                  placeholder="Describe the dish, ingredients, or health benefits..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Allergens</label>
                <input
                  type="text"
                  value={formData.allergens || ''}
                  onChange={e => setFormData({ ...formData, allergens: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="e.g. Nuts, Dairy, Gluten"
                />
                <p className="text-xs text-text-secondary opacity-60 mt-1">Comma separated list of EU allergens.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Dish Image</label>
                <ImageUploader
                  value={formData.imageUrl || ''}
                  onChange={val => setFormData({ ...formData, imageUrl: val })}
                  label="Upload Dish Image"
                  aspectRatio="video"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-divider bg-background flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="dish-form">Save Dish</Button>
        </div>
      </div>
    </>
  );
}
