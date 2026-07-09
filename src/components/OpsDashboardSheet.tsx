import React, { useState, useEffect } from "react";
import { Loader2, Utensils, Wifi, AlertTriangle, Plus, Trash2, List } from "lucide-react";
import { cn, buildGuestUrl } from "../lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { createPortal } from "react-dom";

interface Dish {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  allergens: string;
  healthTips: string;
  isOutOfStock: boolean;
}

interface Amenity {
  id: string;
  name: string;
  openTime: string;
  closeTime: string;
  requiresReservation: boolean;
}

const TABS = [
  { id: "categories", label: "Categories", icon: <List size={16} /> },
  { id: "menu", label: "Menu Management", icon: <Utensils size={16} /> },
  { id: "amenities", label: "Amenities & Timings", icon: <Wifi size={16} /> },
  { id: "qr", label: "QR Generator", icon: <span role="img" aria-label="print" className="text-[16px]">🖨️</span> },
];

export function OpsDashboardSheet({
  propertySlug,
  isReadOnly = false,
  initialTab = "menu",
  hiddenTabs = []
}: {
  propertySlug: string,
  isReadOnly?: boolean,
  initialTab?: string,
  hiddenTabs?: string[]
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [qrPrintsThisMonth, setQrPrintsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${propertySlug}`)
      .then(res => res.json())
      .then(data => {
        setDishes(data.dishes || []);
        setAmenities(data.amenities || []);
        setCategories(data.categories || []);
        setQrPrintsThisMonth(data.property?.qrPrintsThisMonth || 0);
        setLoading(false);
      });
  }, [propertySlug]);

  const updateDish = async (id: string, updates: Partial<Dish>) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

    // Do not auto-save local drafts
    if (id.startsWith("temp-")) return;

    await fetch(`/api/manager/dishes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
  };

  const saveDish = async (id: string) => {
    const dish = dishes.find(d => d.id === id);
    if (!dish) return;
    if (!dish.name || !dish.name.trim()) return;

    try {
      const res = await fetch(`/api/manager/properties/${propertySlug}/dishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dish.name.trim(),
          price: Number(dish.price) || 0,
          categoryId: dish.categoryId,
          allergens: dish.allergens,
          healthTips: dish.healthTips,
          isOutOfStock: dish.isOutOfStock,
        })
      });
      if (!res.ok) throw new Error("Failed to save dish");
      const savedDish = await res.json();
      setDishes(prev => prev.map(d => d.id === id ? savedDish : d));
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const updateAmenity = async (id: string, updates: Partial<Amenity>) => {
    setAmenities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

    // Do not auto-save local drafts
    if (id.startsWith("temp-")) return;

    await fetch(`/api/manager/amenities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
  };

  const saveAmenity = async (id: string) => {
    const amenity = amenities.find(a => a.id === id);
    if (!amenity) return;
    if (!amenity.name || !amenity.name.trim()) return;

    try {
      const res = await fetch(`/api/manager/properties/${propertySlug}/amenities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: amenity.name.trim(),
          openTime: amenity.openTime,
          closeTime: amenity.closeTime,
          requiresReservation: amenity.requiresReservation
        })
      });
      if (!res.ok) throw new Error("Failed to save amenity");
      const savedAmenity = await res.json();
      setAmenities(prev => prev.map(a => a.id === id ? savedAmenity : a));
    } catch (err) {
      console.error("Save error", err);
    }
  };


  const addDish = () => {
    const newDish: Dish = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      price: 0,
      categoryId: categories.length > 0 ? categories[0].id : "",
      allergens: "",
      healthTips: "",
      isOutOfStock: false,
    };
    setDishes(prev => [...prev, newDish]);
  };

  const addAmenity = () => {
    const newAmenity: Amenity = {
      id: `temp-${crypto.randomUUID()}`,
      name: "",
      openTime: "08:00",
      closeTime: "20:00",
      requiresReservation: false,
    };
    setAmenities(prev => [...prev, newAmenity]);
  };

  const updateCategory = async (id: string, updates: Partial<{name: string}>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (id.startsWith("temp-")) return;
    await fetch(`/api/manager/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
  };

  const saveCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    if (!category.name || !category.name.trim()) return;

    try {
      const res = await fetch(`/api/manager/properties/${propertySlug}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: category.name.trim() })
      });
      if (!res.ok) throw new Error("Failed to save category");
      const savedCategory = await res.json();
      setCategories(prev => prev.map(c => c.id === id ? savedCategory : c));
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const addCategory = () => {
    setCategories(prev => [...prev, { id: `temp-${crypto.randomUUID()}`, name: "" }]);
  };

  const deleteCategory = async (id: string) => {
    const inUse = dishes.some(d => d.categoryId === id);
    if (inUse) {
      alert("Cannot delete category because it contains dishes.");
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    await fetch(`/api/manager/categories/${id}`, { method: "DELETE" });
  };

  const deleteDish = async (id: string) => {
    setDishes(prev => prev.filter(d => d.id !== id));
    await fetch(`/api/manager/dishes/${id}`, { method: "DELETE" });
  };

  const deleteAmenity = async (id: string) => {
    setAmenities(prev => prev.filter(a => a.id !== id));
    await fetch(`/api/manager/amenities/${id}`, { method: "DELETE" });
  };

  const handlePrintQR = async () => {
    setPrinting(true);
    try {
      // API call to track prints could be added here
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      console.error(err);
    } finally {
      setPrinting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {TABS.filter(t => !hiddenTabs.includes(t.id)).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
              activeTab === tab.id
                ? "bg-white text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        {activeTab === "categories" && (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Category Name</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={category.name}
                      onChange={e => updateCategory(category.id, { name: e.target.value })}
                      disabled={isReadOnly}
                      className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-gray-900 w-full min-w-[200px] disabled:opacity-50"
                      placeholder="e.g. Starters, Mains, Drinks"
                    />
                  </td>
                  <td className="px-4 py-3 flex items-center justify-center gap-2">
                    {category.id.startsWith("temp-") ? (
                      <button
                        onClick={() => saveCategory(category.id)}
                        disabled={!category.name || !category.name.trim()}
                        className="text-xs bg-emerald-600 text-white px-2 py-1 rounded disabled:opacity-50 hover:bg-emerald-700"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteCategory(category.id)}
                        disabled={isReadOnly}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isReadOnly && (
                <tr>
                  <td colSpan={2} className="px-4 py-3">
                    <button onClick={addCategory} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <Plus size={16} /> Add New Category
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === "menu" && (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Dish Name</th>
                <th className="px-4 py-3 font-medium">Price (€)</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">EU Allergens</th>
                <th className="px-4 py-3 font-medium">Health Tip</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dishes.map(dish => (
                <tr key={dish.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={dish.name}
                      onChange={e => updateDish(dish.id, { name: e.target.value })}
                      disabled={isReadOnly}
                      className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-gray-900 w-full min-w-[150px] disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={dish.price}
                      step="0.01"
                      onChange={e => updateDish(dish.id, { price: parseFloat(e.target.value) || 0 })}
                      disabled={isReadOnly}
                      className="bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 w-20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={dish.categoryId}
                      onChange={e => updateDish(dish.id, { categoryId: e.target.value })}
                      disabled={isReadOnly}
                      className="bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={dish.allergens}
                      onChange={e => updateDish(dish.id, { allergens: e.target.value })}
                      disabled={isReadOnly}
                      className="bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 w-full min-w-[120px] disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={dish.healthTips || ""}
                      onChange={e => updateDish(dish.id, { healthTips: e.target.value })}
                      disabled={isReadOnly}
                      className="bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 w-full min-w-[150px] disabled:opacity-50"
                      placeholder="Add health tip..."
                    />
                  </td>
                  <td className="px-4 py-3 flex items-center justify-center gap-2">
                    {dish.id.startsWith("temp-") ? (
                      <button
                        onClick={() => saveDish(dish.id)}
                        disabled={!dish.name || !dish.name.trim()}
                        className="text-xs bg-emerald-600 text-white px-2 py-1 rounded disabled:opacity-50 hover:bg-emerald-700"
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => updateDish(dish.id, { isOutOfStock: !dish.isOutOfStock })}
                          disabled={isReadOnly}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                            dish.isOutOfStock ? "bg-red-500" : "bg-emerald-500"
                          )}
                        >
                          <span className="sr-only">Toggle status</span>
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              dish.isOutOfStock ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                        <button
                          onClick={() => deleteDish(dish.id)}
                          disabled={isReadOnly}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!isReadOnly && (
                <tr>
                  <td colSpan={6} className="px-4 py-3">
                    <button onClick={addDish} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <Plus size={16} /> Add New Dish
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === "amenities" && (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Facility Name</th>
                <th className="px-4 py-3 font-medium">Opening Time</th>
                <th className="px-4 py-3 font-medium">Closing Time</th>
                <th className="px-4 py-3 font-medium text-center">Status Badge</th>
                <th className="px-4 py-3 font-medium text-center">Booking Rule</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {amenities.map(am => {
                const now = new Date();
                const currentTime = now.getHours() * 100 + now.getMinutes();
                const openStr = am.openTime.replace(':', '');
                const closeStr = am.closeTime.replace(':', '');
                const openInt = parseInt(openStr, 10);
                const closeInt = parseInt(closeStr, 10);

                let isOpen = false;
                if (openInt <= closeInt) {
                  isOpen = currentTime >= openInt && currentTime <= closeInt;
                } else {
                  isOpen = currentTime >= openInt || currentTime <= closeInt;
                }

                return (
                  <tr key={am.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={am.name}
                        onChange={e => updateAmenity(am.id, { name: e.target.value })}
                        disabled={isReadOnly}
                        className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-gray-900 w-full min-w-[150px] disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={am.openTime}
                        onChange={e => updateAmenity(am.id, { openTime: e.target.value })}
                        disabled={isReadOnly}
                        className="bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={am.closeTime}
                        onChange={e => updateAmenity(am.id, { closeTime: e.target.value })}
                        disabled={isReadOnly}
                        className="bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                        isOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {isOpen ? "Open Now" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={am.requiresReservation}
                        onChange={e => updateAmenity(am.id, { requiresReservation: e.target.checked })}
                        disabled={isReadOnly}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:opacity-50"
                      />
                    </td>
                  <td className="px-4 py-3 flex items-center justify-center gap-2">
                    {am.id.startsWith("temp-") ? (
                      <button
                        onClick={() => saveAmenity(am.id)}
                        disabled={!am.name || !am.name.trim()}
                        className="text-xs bg-emerald-600 text-white px-2 py-1 rounded disabled:opacity-50 hover:bg-emerald-700"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteAmenity(am.id)}
                        disabled={isReadOnly}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                  </tr>
                );
              })}
              {!isReadOnly && (
                <tr>
                  <td colSpan={6} className="px-4 py-3">
                    <button onClick={addAmenity} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <Plus size={16} /> Add New Amenity
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}


        {activeTab === "qr" && (
          <div className="p-8 flex flex-col items-center text-center print:p-0 print:m-0">
            <div className="print:hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Master QR Stand Generator</h3>
              <p className="text-gray-500 mb-8 max-w-md">Generate and print your property's master QR code. Guests scan this to instantly access your digital amenities.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center mb-8 relative shadow-lg print:shadow-none print:border-none print:w-full print:h-full print:justify-start print:pt-20">
              {isReadOnly ? (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl print:hidden">
                  <div className="bg-red-50 text-red-600 p-3 rounded-full">
                    <AlertTriangle size={24} />
                  </div>
                </div>
              ) : null}

              <div className="mb-8 flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">ScanVista</span>
              </div>

              <div className="qr-container mb-10 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <QRCodeSVG
                  value={buildGuestUrl(propertySlug)}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <h4 className="text-2xl font-serif font-bold text-gray-900 mb-2">{propertySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
              <p className="text-gray-500 text-sm font-medium">Scan for Digital Concierge & Menu</p>
            </div>

            <div className="print:hidden w-full max-w-md">
              {isReadOnly ? (
                <div className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2 mb-4 justify-center">
                  🔒 Subscription required to generate QR codes
                </div>
              ) : (
                <div className="flex flex-col items-center w-full gap-3">
                  <button
                    onClick={handlePrintQR}
                    disabled={printing}
                    className="w-full bg-gray-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {printing ? <Loader2 size={16} className="animate-spin" /> : <span role="img" aria-label="print">🖨️</span>}
                    Print Master QR Stand
                  </button>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => {
                        const svg = document.querySelector('.qr-container svg');
                        if (!svg) return;
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `${propertySlug}-qr.svg`;
                        link.click();
                      }}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Download SVG
                    </button>
                    <button
                      onClick={() => {
                        const svg = document.querySelector('.qr-container svg');
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
                      }}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Download PNG
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {createPortal(
        <div id="print-only-qr" className="hidden flex-col items-center justify-center bg-white">
          <div className="flex flex-col items-center justify-center p-12 border-2 border-gray-100 rounded-3xl shadow-xl max-w-2xl text-center">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              {propertySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <p className="text-xl text-gray-600 mb-10">Scan to view guest information</p>
            <div className="p-4 bg-white border border-gray-200 rounded-xl mb-10 inline-block">
              <QRCodeSVG
                value={buildGuestUrl(propertySlug)}
                size={300}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2 font-medium">
              Powered by <span className="font-serif font-bold text-gray-700">ScanVista</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
