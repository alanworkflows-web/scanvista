import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Category {
  id: string;
  name: string;
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  allergens: string;
  healthTips: string;
  isOutOfStock: boolean;
  imageUrl?: string;
  dietaryCategory?: string;
}

export function useMenuStudio(propertySlug: string) {
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
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
      const res = await fetch(`/api/properties/${propertySlug}`);
      const data = await res.json();
      setOriginalCategories(data.categories || []);
      setOriginalDishes(data.dishes || []);
      setCategories(data.categories || []);
      setDishes(data.dishes || []);
      setDeletedCategoryIds(new Set());
      setDeletedDishIds(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [propertySlug]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Check if there are unpublished changes
  const hasChanges = useMemo(() => {
    if (categories.length !== originalCategories.length) return true;
    if (dishes.length !== originalDishes.length) return true;
    if (deletedCategoryIds.size > 0 || deletedDishIds.size > 0) return true;
    
    // Deep check
    const categoriesChanged = categories.some(c => {
      const orig = originalCategories.find(oc => oc.id === c.id);
      return !orig || orig.name !== c.name;
    });
    
    if (categoriesChanged) return true;
    
    const dishesChanged = dishes.some(d => {
      const orig = originalDishes.find(od => od.id === d.id);
      if (!orig) return true;
      return orig.name !== d.name ||
             orig.price !== d.price ||
             orig.categoryId !== d.categoryId ||
             orig.allergens !== d.allergens ||
             orig.healthTips !== d.healthTips ||
             orig.isOutOfStock !== d.isOutOfStock;
    });
    
    return dishesChanged;
  }, [categories, originalCategories, dishes, originalDishes, deletedCategoryIds, deletedDishIds]);

  const addCategory = (name: string) => {
    setCategories(prev => [...prev, { id: `temp-cat-${crypto.randomUUID()}`, name }]);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => {
    const inUse = dishes.some(d => d.categoryId === id);
    if (inUse) {
      alert("Cannot delete a category that contains dishes. Move or delete them first.");
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    if (!id.startsWith("temp-")) {
      setDeletedCategoryIds(prev => new Set(prev).add(id));
    }
  };

  const saveDish = (dish: Dish) => {
    setDishes(prev => {
      const exists = prev.find(d => d.id === dish.id);
      if (exists) return prev.map(d => d.id === dish.id ? dish : d);
      return [...prev, dish];
    });
  };

  const deleteDish = (id: string) => {
    setDishes(prev => prev.filter(d => d.id !== id));
    if (!id.startsWith("temp-")) {
      setDeletedDishIds(prev => new Set(prev).add(id));
    }
  };

  const toggleDishAvailability = (id: string) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, isOutOfStock: !d.isOutOfStock } : d));
  };

  const duplicateDish = (dish: Dish) => {
    const newDish: Dish = {
      ...dish,
      id: `temp-dish-${crypto.randomUUID()}`,
      name: `${dish.name} (Copy)`
    };
    setDishes(prev => [...prev, newDish]);
  };

  const publishChanges = async () => {
    setPublishing(true);
    try {
      // 1. Delete removed items
      const deletePromises = [
        ...Array.from(deletedDishIds).map(id => fetch(`/api/manager/dishes/${id}`, { method: 'DELETE' })),
        ...Array.from(deletedCategoryIds).map(id => fetch(`/api/manager/categories/${id}`, { method: 'DELETE' }))
      ];
      await Promise.all(deletePromises);

      // 2. Process Categories (Creates and Updates)
      // We must await creates to get real IDs back so we can map dishes to them.
      const categoryIdMap = new Map<string, string>(); // tempId -> realId
      
      for (const c of categories) {
        if (c.id.startsWith('temp-')) {
          const res = await fetch(`/api/manager/properties/${propertySlug}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: c.name })
          });
          const saved = await res.json();
          categoryIdMap.set(c.id, saved.id);
        } else {
          const orig = originalCategories.find(oc => oc.id === c.id);
          if (orig && orig.name !== c.name) {
            await fetch(`/api/manager/categories/${c.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: c.name })
            });
          }
        }
      }

      // 3. Process Dishes (Creates and Updates)
      const dishPromises = dishes.map(d => {
        const payload = {
          name: d.name,
          price: Number(d.price) || 0,
          categoryId: categoryIdMap.get(d.categoryId) || d.categoryId,
          allergens: d.allergens,
          healthTips: d.healthTips,
          isOutOfStock: d.isOutOfStock,
        };

        if (d.id.startsWith('temp-')) {
          return fetch(`/api/manager/properties/${propertySlug}/dishes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          const orig = originalDishes.find(od => od.id === d.id);
          // Simple diff check for update
          if (!orig || JSON.stringify({ ...orig, id: undefined }) !== JSON.stringify({ ...d, id: undefined })) {
            return fetch(`/api/manager/dishes/${d.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }
        return Promise.resolve();
      });

      await Promise.all(dishPromises);
      
      // Fetch fresh data after publishing
      await fetchMenu();
      
    } catch (err) {
      console.error("Failed to publish menu", err);
      alert("Failed to publish some changes. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  return {
    loading,
    publishing,
    hasChanges,
    categories,
    dishes,
    addCategory,
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
