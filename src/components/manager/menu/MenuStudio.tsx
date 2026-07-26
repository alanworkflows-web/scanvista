import React, { useState } from 'react';
import { useMenuStudio, Dish, Category } from './useMenuStudio';
import { GuestMenuPreview } from './GuestMenuPreview';
import { DishCard } from './DishCard';
import { DishEditorDrawer } from './DishEditorDrawer';
import { Button } from '../../ui/Button';
import { 
  Plus, Trash2, Loader2, Save, RefreshCw, Utensils, Sparkles, 
  CheckCircle2, BookOpen, Layers, ArrowRight, Eye, ShieldCheck 
} from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState';
import { toast } from 'sonner';

export function MenuStudio({ propertySlug, propertyName }: { propertySlug: string, propertyName?: string }) {
  const {
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
    refresh
  } = useMenuStudio(propertySlug);

  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  const handleCreateDish = (categoryId: string) => {
    setEditingDish({
      id: `temp-dish-${crypto.randomUUID()}`,
      name: "",
      price: 0,
      categoryId,
      allergens: "",
      healthTips: "",
      isOutOfStock: false,
    });
  };

  const handlePublish = async () => {
    try {
      await publishChanges();
      toast.success("Menu changes published live to Guest App!");
    } catch (err: any) {
      toast.error("Failed to publish menu changes.");
    }
  };

  const displayName = propertyName || propertySlug || "Hotel Menu";
  const readyScore = dishes.length > 0 ? 100 : categories.length > 0 ? 50 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Flagship Header & Onboarding Banner */}
      <div className="bg-surface border border-[#EAE8E1] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EAE8E1] pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-serif font-medium text-[#1A1A1A]">Menu Studio</h1>
              <span className="text-[10px] uppercase font-semibold px-2.5 py-1 bg-[#D4AF37]/15 text-[#1A1A1A] border border-[#D4AF37]/30 rounded-md">
                Flagship Studio
              </span>
            </div>
            <p className="text-text-secondary text-sm font-light">
              Craft digital dining experiences with live real-time guest smartphone preview for <span className="font-medium text-[#1A1A1A]">{displayName}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh} 
              disabled={publishing || !hasChanges}
              className="text-xs border-[#EAE8E1]"
            >
              <RefreshCw size={14} className="mr-1.5" />
              Discard Draft
            </Button>

            <Button 
              size="sm" 
              onClick={handlePublish} 
              disabled={!hasChanges || publishing}
              className={hasChanges 
                ? "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] shadow-md animate-pulse-subtle" 
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"}
            >
              {publishing ? <Loader2 size={15} className="animate-spin mr-1.5" /> : <Save size={15} className="mr-1.5" />}
              {hasChanges ? "Publish Menu Live" : "All Changes Live"}
            </Button>
          </div>
        </div>

        {/* Onboarding & Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FCFAF7] border border-[#EAE8E1] rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium block">Live Menu Structure</span>
              <span className="text-lg font-serif font-medium text-[#1A1A1A]">{categories.length} Categories • {dishes.length} Dishes</span>
            </div>
            <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg">
              <Layers size={20} />
            </div>
          </div>

          <div className="bg-[#FCFAF7] border border-[#EAE8E1] rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium block">Publish Status</span>
              <span className={`text-sm font-medium ${hasChanges ? "text-amber-800" : "text-emerald-800"}`}>
                {hasChanges ? "⚠️ Draft Modifications Pending" : "✓ Fully Synced & Published"}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg ${hasChanges ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
              {hasChanges ? <Sparkles size={20} /> : <CheckCircle2 size={20} />}
            </div>
          </div>

          <div className="bg-[#FCFAF7] border border-[#EAE8E1] rounded-lg p-4 flex items-center justify-between">
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Menu Readiness</span>
                <span className="text-xs font-semibold text-[#1A1A1A]">{readyScore}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#D4AF37] h-full transition-all duration-500" style={{ width: `${readyScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-280px)] min-h-[600px] overflow-hidden">
        
        {/* Left Workspace: Categories & Dishes */}
        <div className="flex-1 flex flex-col bg-surface rounded-xl shadow-sm border border-[#EAE8E1] overflow-hidden">
          
          <div className="flex items-center justify-between p-5 border-b border-[#EAE8E1] bg-[#FCFAF7]">
            <h3 className="font-serif font-medium text-lg text-[#1A1A1A] flex items-center gap-2">
              <Utensils size={18} className="text-[#D4AF37]" /> Menu Categories & Dishes
            </h3>
            <Button onClick={() => addCategory("New Category")} className="bg-[#1A1A1A] text-white text-xs gap-1.5">
              <Plus size={14} /> Add Category
            </Button>
          </div>

          {/* Scrollable Categories List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/30">
            {categories.length === 0 ? (
              <div className="bg-surface border border-[#EAE8E1] rounded-xl p-10 text-center space-y-6">
                <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto">
                  <Utensils size={28} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#1A1A1A] mb-1">Your Menu is Empty</h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Create categories like Starters, Main Courses, and Desserts to display on your digital guest menu.
                  </p>
                </div>

                {/* Quick Starter Preset Buttons */}
                <div className="pt-4 border-t border-[#EAE8E1]">
                  <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block mb-3">
                    One-Click Quick Start Templates
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Starters & Appetizers", "Chef's Signature Mains", "Artisanal Desserts", "Craft Cocktails & Wine"].map((name) => (
                      <button
                        key={name}
                        onClick={() => addCategory(name)}
                        className="text-xs font-medium px-3.5 py-2 bg-[#FCFAF7] border border-[#EAE8E1] hover:border-[#D4AF37] hover:bg-surface rounded-lg transition-all flex items-center gap-1.5 text-[#1A1A1A]"
                      >
                        <Plus size={12} className="text-[#D4AF37]" /> {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              categories.map(category => {
                const categoryDishes = dishes.filter(d => d.categoryId === category.id);

                return (
                  <div key={category.id} className="bg-surface rounded-xl border border-[#EAE8E1] p-6 shadow-sm space-y-4 hover:border-[#D4AF37]/40 transition-all">
                    {/* Category Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE8E1]">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, e.target.value)}
                          className="font-serif text-lg font-medium text-[#1A1A1A] bg-transparent border-b border-transparent focus:border-[#D4AF37] px-1 py-0.5 focus:outline-none w-full max-w-xs"
                          placeholder="Category Name (e.g. Starters)..."
                        />
                        <span className="text-xs text-text-muted font-normal">({categoryDishes.length} dishes)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCreateDish(category.id)}
                          className="text-xs border-[#EAE8E1] hover:border-[#D4AF37]"
                        >
                          <Plus size={14} className="mr-1" /> Add Dish
                        </Button>
                        <button 
                          onClick={() => deleteCategory(category.id)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Dish List Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {categoryDishes.map(dish => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          onEdit={() => setEditingDish(dish)}
                          onDuplicate={() => duplicateDish(dish)}
                          onDelete={() => deleteDish(dish.id)}
                          onToggleAvailability={() => toggleDishAvailability(dish.id)}
                        />
                      ))}

                      {categoryDishes.length === 0 && (
                        <div className="col-span-full py-6 text-center text-xs text-text-muted border border-dashed border-[#EAE8E1] rounded-lg bg-[#FCFAF7]/50">
                          No dishes in this category yet. Click "Add Dish" above.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {categories.length > 0 && (
              <div className="flex justify-center pt-2 pb-6">
                <Button variant="outline" onClick={() => addCategory("New Category")} className="text-xs border-[#EAE8E1]">
                  <Plus size={14} className="mr-1.5" /> Add Another Category
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Smartphone Preview */}
        <div className="hidden lg:flex w-[420px] bg-surface rounded-xl shadow-sm border border-[#EAE8E1] overflow-hidden flex-col flex-shrink-0">
          <div className="p-4 border-b border-[#EAE8E1] bg-[#FCFAF7] flex justify-between items-center">
            <span className="text-xs font-medium text-[#1A1A1A] flex items-center gap-1.5">
              <Eye size={15} className="text-[#D4AF37]" /> Live Smartphone Guest View
            </span>
            <span className="text-[10px] text-text-muted font-mono">{displayName}</span>
          </div>

          <div className="flex-1 p-4 overflow-hidden flex items-center justify-center bg-background/50">
            <GuestMenuPreview 
              categories={categories} 
              dishes={dishes} 
              propertyName={displayName}
            />
          </div>
        </div>
      </div>

      {/* Dish Editor Drawer */}
      <DishEditorDrawer
        dish={editingDish}
        categories={categories}
        isOpen={!!editingDish}
        onClose={() => setEditingDish(null)}
        onSave={saveDish}
      />
    </div>
  );
}
