import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Lock, Save, Plus, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EU_ALLERGENS = [
  "CELERY", "CEREALS CONTAINING GLUTEN", "CRUSTACEANS", "EGGS", 
  "FISH", "LUPIN", "MILK", "MOLLUSCS", "MUSTARD", "NUTS", 
  "PEANUTS", "SESAME SEEDS", "SOYA", "SULPHUR DIOXIDE"
];

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [activeTab, setActiveTab] = useState("qr");
  
  // Dummy local state for a dish form
  const [dishForm, setDishForm] = useState({
    name: "",
    description: "",
    price: "",
    isPopular: false,
    isChefRec: false,
    isOutOfStock: false,
    dietaryCategory: "None",
    selectedAllergens: [] as string[]
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid password. (Hint: 'admin')");
    }
  };

  const toggleAllergen = (allergen: string) => {
    setDishForm(prev => ({
      ...prev,
      selectedAllergens: prev.selectedAllergens.includes(allergen)
        ? prev.selectedAllergens.filter(a => a !== allergen)
        : [...prev.selectedAllergens, allergen]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Host Access</h1>
          <p className="text-gray-500 mb-6 text-sm">Enter your magic link password to manage your property view.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const qrUrl = `${appUrl}/ocean-hotel`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} className="text-gray-400" />
            Host Dashboard
          </h1>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('qr')}
            className={cn("w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === 'qr' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}
          >
            QR Code & Links
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={cn("w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === 'menu' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}
          >
            Add Menu Item
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'qr' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">Guest Access QR</h2>
              <p className="text-gray-500 mb-8 text-sm">Download or print this code for your tables or rooms. Guests scan it to instantly access your dynamic dashboard.</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                  <QRCodeSVG value={qrUrl} size={180} level="M" />
                </div>
                <div className="space-y-4 text-center sm:text-left w-full">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Direct Link</label>
                    <div className="mt-1 flex">
                      <input 
                        type="text" 
                        readOnly 
                        value={qrUrl}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-l-lg px-3 py-2 text-sm text-gray-600 focus:outline-none"
                      />
                      <button className="bg-gray-900 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-gray-800">
                        Copy
                      </button>
                    </div>
                  </div>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 underline">
                    Download Print Package (PDF)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Add New Dish</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                    <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Avocado Toast" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                    <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" rows={3}></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Status Toggles</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        checked={dishForm.isPopular} onChange={e => setDishForm({...dishForm, isPopular: e.target.checked})}
                      />
                      Popular
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        checked={dishForm.isChefRec} onChange={e => setDishForm({...dishForm, isChefRec: e.target.checked})}
                      />
                      Chef's Recommendation
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" 
                        checked={dishForm.isOutOfStock} onChange={e => setDishForm({...dishForm, isOutOfStock: e.target.checked})}
                      />
                      Mark Out of Stock
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">EU Allergens Checklist (1169/2011)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EU_ALLERGENS.map(allergen => (
                      <label key={allergen} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          checked={dishForm.selectedAllergens.includes(allergen)}
                          onChange={() => toggleAllergen(allergen)}
                        />
                        <span className="truncate">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                    <Save size={18} />
                    Save Dish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
