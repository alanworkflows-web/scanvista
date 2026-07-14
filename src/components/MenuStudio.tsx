import React, { useState, useMemo } from "react";
import { Search, Plus, Trash2, X, Image as ImageIcon, CheckCircle2, ChevronRight, Save, Utensils, Edit2, ExternalLink, Printer, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { DishCard } from "./DishCard";
import { cn, buildGuestUrl } from "../lib/utils";

interface Dish {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  allergens: string;
  healthTips: string;
  isOutOfStock: boolean;
  description?: string;
  imageUrl?: string;
  dietaryCategory?: string;
  isPopular?: boolean;
  isChefRec?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface MenuStudioProps {
  propertySlug: string;
  dishes: Dish[];
  categories: Category[];
  isReadOnly: boolean;
  onUpdateDish: (id: string, updates: Partial<Dish>) => void;
  onSaveDish: (id: string) => void;
  onDeleteDish: (id: string) => void;
  onAddDish: (categoryId: string) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onSaveCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddCategory: () => void;
}

export function MenuStudio({
  propertySlug,
  dishes,
  categories,
  isReadOnly,
  onUpdateDish,
  onSaveDish,
  onDeleteDish,
  onAddDish,
  onUpdateCategory,
  onSaveCategory,
  onDeleteCategory,
  onAddCategory
}: MenuStudioProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories.length > 0 ? categories[0].id : null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [deleteStatus, setDeleteStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [searchQuery, setSearchQuery] = useState("");
  const guestUrl = buildGuestUrl(propertySlug);

  const handleDownloadQR = () => {
    const svg = document.querySelector('.menu-studio-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.download = `${propertySlug}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // If active category is deleted, default to first
  if (activeCategoryId && !categories.find(c => c.id === activeCategoryId) && categories.length > 0) {
    setActiveCategoryId(categories[0].id);
  }



  const filteredDishes = useMemo(() => {
    let result = dishes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
    } else if (activeCategoryId) {
      result = result.filter(d => d.categoryId === activeCategoryId);
    }
    return result;
  }, [dishes, activeCategoryId, searchQuery]);

  const activeDish = editingDishId ? dishes.find(d => d.id === editingDishId) : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-120px)] lg:min-h-0 lg:h-[800px] w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      
      {/* LEFT COLUMN: Categories */}
      <div className="w-full lg:w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Categories</h3>
          <Button variant="ghost" size="sm" onClick={onAddCategory} disabled={isReadOnly} className="h-8 w-8 p-0 rounded-full">
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {categories.length === 0 ? (
            <div className="text-center p-4 text-sm text-gray-500">No categories yet.</div>
          ) : (
            categories.map(cat => (
              <div 
                key={cat.id} 
                className={cn(
                  "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                  activeCategoryId === cat.id && !searchQuery ? "bg-emerald-50 text-emerald-900" : "hover:bg-gray-100 text-gray-700"
                )}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  setSearchQuery("");
                }}
              >
                {cat.id.startsWith("temp-") ? (
                  <div className="flex flex-col gap-1 w-full">
                    <Input 
                      autoFocus
                      size="sm"
                      value={cat.name} 
                      onChange={e => onUpdateCategory(cat.id, { name: e.target.value })}
                      placeholder="Category Name"
                      className="h-7 text-sm px-2 bg-white"
                      onClick={e => e.stopPropagation()}
                    />
                    <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onSaveCategory(cat.id); }}>Save</Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-sm truncate">{cat.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const newName = prompt("Rename category:", cat.name);
                          if (newName && newName.trim()) {
                            onUpdateCategory(cat.id, { name: newName });
                            onSaveCategory(cat.id); // ensure it saves
                          }
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-900 rounded-md"
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat.id); }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-600 rounded-md"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER COLUMN: Workspace */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search all dishes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-50/20 shadow-sm focus:shadow-md0/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <Button 
            onClick={() => {
              if (!activeCategoryId && categories.length > 0) setActiveCategoryId(categories[0].id);
              if (activeCategoryId || categories.length > 0) {
                onAddDish(activeCategoryId || categories[0].id);
              } else {
                // Handled gracefully below
              }
            }} 
            disabled={isReadOnly || categories.length === 0}
            className="shrink-0"
          >
            <Plus size={16} className="mr-2" /> Add Dish
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {filteredDishes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Utensils className="text-gray-400" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">No dishes found</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                {searchQuery ? "Try adjusting your search terms." : "Add your first dish to this category to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDishes.map(dish => (
                <Card 
                  key={dish.id} 
                  hoverable 
                  className={cn(
                    "cursor-pointer transition-all overflow-hidden border-2",
                    editingDishId === dish.id ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-transparent"
                  )}
                  onClick={() => setEditingDishId(dish.id)}
                >
                  <div className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center relative">
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={24} />
                      )}
                      {dish.isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900 bg-white/90 px-1 py-0.5 rounded shadow-sm">Out</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 truncate">{dish.name || "Unnamed Dish"}</h4>
                        <span className="font-semibold text-emerald-600">€{dish.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {dish.description || "No description provided."}
                      </p>
                      {dish.id.startsWith("temp-") && (
                        <Badge variant="warning" className="mt-2 self-start text-[10px] py-0">Unsaved</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT DRAWER: The Inspector */}
      <div className={cn(
        "bg-white border-l border-gray-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 flex flex-col shrink-0 overflow-hidden",
        editingDishId ? "w-[400px] opacity-100" : "w-0 opacity-0 border-l-0"
      )}>
        {activeDish && (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                Inspector
                {activeDish.id.startsWith("temp-") && <Badge variant="warning" className="text-[10px]">Unsaved</Badge>}
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingDishId(null)} className="h-8 w-8 p-0 rounded-full">
                  <X size={16} />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {/* Media Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Media</label>
                {activeDish.imageUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                    <img src={activeDish.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="danger" size="sm" onClick={() => onUpdateDish(activeDish.id, { imageUrl: "" })}>Remove Image</Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={24} className="mb-2" />
                    <span className="text-xs">No image provided</span>
                  </div>
                )}
                <Input 
                  placeholder="Paste Image URL..." 
                  value={activeDish.imageUrl || ""} 
                  onChange={e => onUpdateDish(activeDish.id, { imageUrl: e.target.value })}
                  disabled={isReadOnly}
                  className="text-sm bg-white"
                />
              </div>

              <hr className="border-gray-100" />

              {/* Core Details */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Core Details</label>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dish Name</label>
                  <Input 
                    value={activeDish.name} 
                    onChange={e => onUpdateDish(activeDish.id, { name: e.target.value })}
                    disabled={isReadOnly}
                    className="font-medium bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price (€)</label>
                    <Input 
                      type="number"
                      value={activeDish.price} 
                      onChange={e => onUpdateDish(activeDish.id, { price: parseFloat(e.target.value) || 0 })}
                      disabled={isReadOnly}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={activeDish.categoryId} 
                      onChange={e => onUpdateDish(activeDish.id, { categoryId: e.target.value })}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={activeDish.description || ""} 
                    onChange={e => onUpdateDish(activeDish.id, { description: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Describe the dish..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Status & Tags */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status & Tags</label>
                
                <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={activeDish.isOutOfStock} 
                    onChange={e => onUpdateDish(activeDish.id, { isOutOfStock: e.target.checked })}
                    disabled={isReadOnly}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Mark as Out of Stock</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2 border border-gray-100 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      checked={activeDish.isPopular} 
                      onChange={e => onUpdateDish(activeDish.id, { isPopular: e.target.checked })}
                      disabled={isReadOnly}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs font-medium">Popular</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-gray-100 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      checked={activeDish.isChefRec} 
                      onChange={e => onUpdateDish(activeDish.id, { isChefRec: e.target.checked })}
                      disabled={isReadOnly}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium">Chef's Choice</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-4 border-t border-gray-100 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
              <Button 
                variant="ghost" 
                className="w-full sm:w-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setDeleteStatus('loading');
                  setTimeout(() => {
                    onDeleteDish(activeDish.id);
                    setEditingDishId(null);
                    setDeleteStatus('idle');
                  }, 600);
                }}
                disabled={isReadOnly}
                status={deleteStatus}
              >
                {deleteStatus === 'loading' ? 'Deleting...' : 'Delete Dish'}
              </Button>
              <Button 
                onClick={() => {
                  setSaveStatus('loading');
                  onSaveDish(activeDish.id);
                  // Artificial delay to let user register the save state, since actual save might be too fast
                  setTimeout(() => {
                    setSaveStatus('success');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                  }, 600);
                }}
                disabled={isReadOnly || !activeDish.name.trim()}
                status={saveStatus}
                className="flex-1"
              >
                {saveStatus === 'loading' ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</>
                ) : saveStatus === 'success' ? (
                  <><CheckCircle2 size={16} className="mr-2" /> Saved!</>
                ) : (
                  <><Save size={16} className="mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT COLUMN: Live Guest Preview */}
      <div className="hidden xl:flex w-[375px] bg-gray-100 border-l border-gray-200 flex-col shrink-0 items-center justify-start p-8 relative">
        <QRCodeSVG className="menu-studio-qr-svg hidden" value={guestUrl} size={1024} />
        
        {/* Quick Publishing Tools */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-6">
          <Button variant="secondary" size="sm" onClick={handleDownloadQR} className="w-full sm:flex-1 font-semibold text-xs shadow-sm bg-white hover:bg-gray-50 text-gray-900 border-gray-200">
            <Printer size={14} className="mr-2" /> Print QR
          </Button>
          <Button size="sm" onClick={() => window.open(guestUrl, "_blank")} className="w-full sm:flex-1 font-semibold text-xs shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
            Open Menu <ExternalLink size={14} className="ml-2" />
          </Button>
        </div>

        <div className="w-full h-[700px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-gray-900 relative flex flex-col">
          {/* Simulated Mobile Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl w-40 mx-auto z-50"></div>
          
          <div className="flex-1 overflow-y-auto bg-white pt-10 pb-6 hide-scrollbar px-5">
            <h2 className="font-serif font-bold text-2xl text-center mb-6">{categories.find(c => c.id === activeCategoryId)?.name || "Menu Preview"}</h2>
            <div className="flex flex-col">
              {dishes.filter(d => activeCategoryId ? d.categoryId === activeCategoryId : true).map(dish => (
                <DishCard key={dish.id} item={dish} propertyType="HOTEL" />
              ))}
              {dishes.filter(d => activeCategoryId ? d.categoryId === activeCategoryId : true).length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">Preview empty</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}