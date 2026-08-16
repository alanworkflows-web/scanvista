import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  displayOrder?: number;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  allergens: string;
  healthTips: string;
  isOutOfStock: boolean;
  imageUrl?: string;
  dietaryCategory?: string;
  isVeg?: boolean;
  isPopular?: boolean;
  spiceLevel?: string;
  preparationTime?: string;
}

export function useMenuStudio(propertySlug: string) {
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [currency, setCurrency] = useState<string>('USD');
  const [originalCategories, setOriginalCategories] = useState<Category[]>([]);
  const [originalDishes, setOriginalDishes] = useState<Dish[]>([]);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  
  // Track deleted items to inform the backend during publish
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<Set<string>>(new Set());
  const [deletedDishIds, setDeletedDishIds] = useState<Set<string>>(new Set());

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/manager/current-property?propertyId=${encodeURIComponent(propertySlug)}`);
      if (!res.ok) {
        throw new Error("Failed to load menu data");
      }
      const data = await res.json();
      const fetchedCategories = data.categories || [];
      fetchedCategories.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setCurrency(data.property?.currency || 'USD');
      setOriginalCategories(fetchedCategories);
      setOriginalDishes(data.dishes || []);
      setCategories(fetchedCategories);
      setDishes(data.dishes || []);
    } catch (err: any) {
      console.error("Failed to load menu:", err);
      toast.error(err.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [propertySlug]);

  useEffect(() => {
    if (propertySlug) {
      fetchMenu();
    }
  }, [propertySlug, fetchMenu]);

  // Compute if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (deletedCategoryIds.size > 0 || deletedDishIds.size > 0) return true;
    if (categories.length !== originalCategories.length) return true;
    if (dishes.length !== originalDishes.length) return true;

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      const orig = originalCategories[i];
      if (!orig || c.id !== orig.id || c.name !== orig.name) return true;
    }

    for (const d of dishes) {
      const orig = originalDishes.find(od => od.id === d.id);
      if (!orig) return true;
      if (
        d.name !== orig.name ||
        d.price !== orig.price ||
        d.categoryId !== orig.categoryId ||
        d.allergens !== orig.allergens ||
        d.healthTips !== orig.healthTips ||
        d.isOutOfStock !== orig.isOutOfStock ||
        d.isVeg !== orig.isVeg ||
        d.isPopular !== orig.isPopular ||
        d.spiceLevel !== orig.spiceLevel ||
        d.preparationTime !== orig.preparationTime ||
        d.imageUrl !== orig.imageUrl
      ) {
        return true;
      }
    }

    return false;
  }, [categories, dishes, originalCategories, originalDishes, deletedCategoryIds, deletedDishIds]);

  // Category Actions
  const addCategory = (name: string) => {
    setCategories(prev => [...prev, { id: `temp-cat-${crypto.randomUUID()}`, name }]);
  };

  const reorderCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => {
    // Also delete or reassign attached dishes
    setCategories(prev => prev.filter(c => c.id !== id));
    setDishes(prev => prev.filter(d => d.categoryId !== id));
    if (!id.startsWith("temp-")) {
      setDeletedCategoryIds(prev => new Set(prev).add(id));
    }
  };

  // Dish Actions
  const saveDish = (dishData: Partial<Dish> & { name: string; price: number; categoryId: string }) => {
    if (dishData.id) {
      // Update existing
      setDishes(prev => prev.map(d => d.id === dishData.id ? { ...d, ...dishData } as Dish : d));
    } else {
      // Create new
      const newDish: Dish = {
        id: `temp-dish-${crypto.randomUUID()}`,
        name: dishData.name,
        price: dishData.price,
        categoryId: dishData.categoryId,
        allergens: dishData.allergens || '[]',
        healthTips: dishData.healthTips || '',
        isOutOfStock: dishData.isOutOfStock || false,
        isVeg: dishData.isVeg,
        isPopular: dishData.isPopular,
        spiceLevel: dishData.spiceLevel,
        preparationTime: dishData.preparationTime,
        imageUrl: dishData.imageUrl
      };
      setDishes(prev => [...prev, newDish]);
    }
  };

  const deleteDish = (id: string) => {
    setDishes(prev => prev.filter(d => d.id !== id));
    if (!id.startsWith("temp-")) {
      setDeletedDishIds(prev => new Set(prev).add(id));
    }
  };

  const duplicateDish = (dish: Dish) => {
    const newDish: Dish = {
      ...dish,
      id: `temp-dish-${crypto.randomUUID()}`,
      name: `${dish.name} (Copy)`
    };
    setDishes(prev => [...prev, newDish]);
  };

  const toggleDishAvailability = (id: string) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, isOutOfStock: !d.isOutOfStock } : d));
  };

  const publishChanges = async (): Promise<boolean> => {
    setPublishing(true);
    try {
      // 1. Delete removed items
      for (const id of deletedDishIds) {
        const res = await fetch(`/api/manager/dishes/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to delete dish (${id})`);
        }
      }
      for (const id of deletedCategoryIds) {
        const res = await fetch(`/api/manager/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to delete category (${id})`);
        }
      }

      // 2. Process Categories (Creates and Updates)
      const categoryIdMap = new Map<string, string>(); // tempId -> realId
      
      for (let i = 0; i < categories.length; i++) {
        const c = categories[i];
        if (c.id.startsWith('temp-')) {
          const res = await fetch(`/api/manager/properties/${propertySlug}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: c.name, displayOrder: i })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || errData.reason || `Failed to create category "${c.name}"`);
          }
          const saved = await res.json();
          categoryIdMap.set(c.id, saved.id);
        } else {
          const origIndex = originalCategories.findIndex(oc => oc.id === c.id);
          const orig = originalCategories[origIndex];
          if (orig && (orig.name !== c.name || origIndex !== i)) {
            const res = await fetch(`/api/manager/categories/${c.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: c.name, displayOrder: i })
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || errData.reason || `Failed to update category "${c.name}"`);
            }
          }
        }
      }

      // 3. Process Dishes (Creates and Updates)
      for (const d of dishes) {
        const payload = {
          name: d.name,
          price: Number(d.price) || 0,
          categoryId: categoryIdMap.get(d.categoryId) || d.categoryId,
          allergens: d.allergens,
          healthTips: d.healthTips,
          isOutOfStock: d.isOutOfStock,
          isVeg: d.isVeg || false,
          isPopular: d.isPopular || false,
          spiceLevel: d.spiceLevel || 'None',
          preparationTime: d.preparationTime || '',
          imageUrl: d.imageUrl || '',
        };

        if (d.id.startsWith('temp-')) {
          const res = await fetch(`/api/manager/properties/${propertySlug}/dishes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || errData.reason || `Failed to create dish "${d.name}"`);
          }
        } else {
          const orig = originalDishes.find(od => od.id === d.id);
          if (!orig || JSON.stringify({ ...orig, id: undefined }) !== JSON.stringify({ ...d, id: undefined })) {
            const res = await fetch(`/api/manager/dishes/${d.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || errData.reason || `Failed to update dish "${d.name}"`);
            }
          }
        }
      }

      setDeletedCategoryIds(new Set());
      setDeletedDishIds(new Set());
      
      // Publish snapshot so guest portal is updated as well
      await fetch(`/api/manager/properties/${propertySlug}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error("Snapshot publish warning:", err));

      // Fetch fresh live data after publishing
      await fetchMenu();
      toast.success("Menu updated successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to publish menu", err);
      toast.error(err.message || "Failed to save menu changes. Please try again.");
      return false;
    } finally {
      setPublishing(false);
    }
  };

  return {
    loading,
    publishing,
    hasChanges,
    currency,
    categories,
    dishes,
    addCategory,
    reorderCategories,
    updateCategory,
    deleteCategory,
    saveDish,
    deleteDish,
    duplicateDish,
    toggleDishAvailability,
    publishChanges,
    refresh: fetchMenu
  };
}
