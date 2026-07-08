import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PropertyData } from "../types";
import { DishCard } from "../components/DishCard";
import { FilterBar, FilterState } from "../components/FilterBar";
import { Loader2, UtensilsCrossed, Wifi, FileText, Map, User, Home, Dumbbell, Waves, Flower2, Coffee, Wine, Phone, PhoneCall, HeartPulse, LifeBuoy, ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IconMap: Record<string, React.FC<any>> = {
  Dumbbell, Waves, Flower2, Coffee, Wine
};

export function PropertyPage() {
  const { propertySlug } = useParams<{ propertySlug: string }>();
  const [searchParams] = useSearchParams();
  const isScanned = searchParams.get("scanned") === "true";
  
  const [data, setData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("menu");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const [filters, setFilters] = useState<FilterState>({
    veganOnly: false,
    vegetarianOnly: false,
    hideGluten: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties/${propertySlug}`);
        if (!res.ok) {
          throw new Error("Property not found");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (propertySlug) {
      fetchData();
    }
  }, [propertySlug]);

  const propertyType = data?.property?.propertyType;

  // Set initial tab if property type changed
  useEffect(() => {
    if (!propertyType) return;
    
    const isHotelOrResort = propertyType === "HOTEL" || propertyType === "RESORT";
    const currentTabs = isHotelOrResort ? [
      { id: "menu" },
      { id: "amenities" },
      { id: "wifi" }
    ] : [
      { id: "menu" },
      { id: "host" },
      { id: "rules" }
    ];

    if (!currentTabs.find(t => t.id === activeTab)) {
      setActiveTab(currentTabs[0].id);
    }
  }, [propertyType, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Home className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</h1>
        <p className="text-gray-500">We couldn't find the property you're looking for.</p>
      </div>
    );
  }

  const { property, categories, dishes, amenities } = data;

  const isHotelOrResort = property.propertyType === "HOTEL" || property.propertyType === "RESORT";
  
  const tabs = isHotelOrResort ? [
    { id: "menu", label: "🍽️ Menu" },
    { id: "amenities", label: "🛎️ Amenities" },
    { id: "wifi", label: "📶 Wi-Fi & Info" }
  ] : [
    { id: "menu", label: "🍳 Meals" },
    { id: "host", label: "🏡 Your Host" },
    { id: "rules", label: "🗺️ Info" }
  ];

  // Filter logic
  const filteredItems = dishes.filter(item => {
    if (filters.veganOnly && item.dietaryCategory !== "Vegan") return false;
    if (filters.vegetarianOnly && item.dietaryCategory !== "Vegetarian" && item.dietaryCategory !== "Vegan") return false;
    
    let hasGluten = false;
    try {
      hasGluten = JSON.parse(item.allergens).includes("GLUTEN");
    } catch(e) {}
    
    if (filters.hideGluten && hasGluten) return false;
    return true;
  });

  return (
    <>
      {!isScanned && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white/95 p-8 rounded-2xl shadow-2xl max-w-lg text-center mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🖥️ Management Administrative Preview Mode</h2>
            <p className="text-gray-600 font-medium text-lg">Scan Physical QR for Guest Execution</p>
          </div>
        </div>
      )}
      <div className={cn("min-h-screen bg-gray-50 pb-24", !isScanned && "pointer-events-none select-none filter grayscale-[30%] blur-[1px]")}>
      {/* Property Header */}
      {property.bannerUrl && (
        <div className="relative h-64 md:h-80 w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
          <img 
            src={property.bannerUrl} 
            alt={property.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Property Info */}
          <div className="absolute bottom-6 left-4 md:bottom-10 md:left-10 z-30 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-md">
              {property.name}
            </h1>
            <p className="text-white/90 text-sm md:text-base text-shadow-sm font-medium">
              📍 {property.name} Location | 📞 {property.receptionPhone || property.emergencyPhone || "+91 98765 43210"}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-1 flex justify-between gap-1 w-full max-w-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 whitespace-nowrap py-1.5 px-3 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.id
                    ? "bg-gray-900 text-white shadow"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "menu" && (
          <div>
            <div className="mb-4">
              <FilterBar filters={filters} setFilters={setFilters} compact />
            </div>

            <div className="flex flex-col gap-2">
              {categories.map(category => {
                const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
                if (categoryItems.length === 0) return null;

                const isExpanded = expandedCategories[category.id];

                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden my-1">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full pl-4 pr-3 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <h2 className="text-lg font-serif font-semibold text-gray-900 flex-1">
                        {category.name}
                      </h2>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ml-4 shrink-0",
                        isExpanded ? "rotate-180 bg-gray-100" : "bg-gray-50"
                      )}>
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      </div>
                    </button>
                    
                    <div className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}>
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-1 divide-y divide-gray-100 flex flex-col text-left items-start w-full">
                          {categoryItems.map(item => (
                            <DishCard 
                              key={item.id} 
                              item={item} 
                              propertyType={property.propertyType}
                              roomServicePhone={property.roomServicePhone}
                              hostPhone={property.emergencyPhone} // fallback
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-20 px-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
                  <p className="text-gray-500">Try adjusting your dietary filters.</p>
                  <button 
                    onClick={() => setFilters({ veganOnly: false, vegetarianOnly: false, hideGluten: false })}
                    className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "amenities" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-serif font-semibold text-gray-900">Amenities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {amenities.map(am => {
                const IconComponent = am.icon && IconMap[am.icon] ? IconMap[am.icon] : Dumbbell;
                
                // Calculate open/closed status
                let isOpen = true;
                if (am.openTime && am.closeTime) {
                  const now = new Date();
                  const currentHour = now.getHours();
                  const currentMinute = now.getMinutes();
                  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
                  
                  if (am.openTime <= am.closeTime) {
                    isOpen = currentTimeStr >= am.openTime && currentTimeStr <= am.closeTime;
                  } else {
                    // spans midnight
                    isOpen = currentTimeStr >= am.openTime || currentTimeStr <= am.closeTime;
                  }
                }

                return (
                  <div key={am.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <IconComponent size={24} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{am.name}</h3>
                          {am.description && <p className="text-sm text-gray-500 mt-1">{am.description}</p>}
                        </div>
                      </div>
                      
                      {am.openTime && am.closeTime && (
                        <div className="shrink-0">
                          {isOpen ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Open Now
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Closed
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {am.requiresReservation && property.receptionPhone && (
                      <div className="mt-2 pt-4 border-t border-gray-50">
                        <a 
                          href={`tel:${property.receptionPhone}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <Phone size={16} />
                          Call Desk to Book Slot
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
              {amenities.length === 0 && (
                <p className="text-gray-500">No amenities listed.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "wifi" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-serif font-semibold text-gray-900">Information & Support</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-50 flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Wifi size={24} />
                </div>
                <div className="w-full">
                  <h3 className="font-medium text-gray-900 mb-3">Wi-Fi Connection</h3>
                  <div className="space-y-3 text-sm">
                    <p className="flex justify-between border-b border-gray-50 pb-3">
                      <span className="text-gray-500">Network</span>
                      <span className="font-medium text-gray-900">{property.wifiNetwork || 'Not provided'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Password</span>
                      <span className="font-medium text-gray-900">{property.wifiPassword || 'Not provided'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Team Communication Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.receptionPhone && (
                <a href={`tel:${property.receptionPhone}`} className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-gray-700 hover:text-indigo-700">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                    <PhoneCall size={24} />
                  </div>
                  <span className="font-medium">Call Reception</span>
                </a>
              )}
              {property.housekeepingPhone && (
                <a href={`tel:${property.housekeepingPhone}`} className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all text-gray-700 hover:text-teal-700">
                  <div className="p-3 bg-teal-50 rounded-full text-teal-600">
                    <LifeBuoy size={24} />
                  </div>
                  <span className="font-medium">Call Housekeeping</span>
                </a>
              )}
              {property.emergencyPhone && (
                <a href={`tel:${property.emergencyPhone}`} className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-200 transition-all text-gray-700 hover:text-rose-700">
                  <div className="p-3 bg-rose-50 rounded-full text-rose-600">
                    <HeartPulse size={24} />
                  </div>
                  <span className="font-medium">Emergency Line</span>
                </a>
              )}
            </div>
          </div>
        )}

        {activeTab === "host" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-serif font-semibold text-gray-900">Your Host</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <User size={24} />
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed">
                  {property.hostInfo || "No host information provided."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-serif font-semibold text-gray-900">Info & Experiences</h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">House Rules</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {property.houseRules || "No house rules listed."}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                <Map size={24} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Experiences</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {property.experiences || "No experiences listed."}
                </p>
              </div>
            </div>

            {/* Direct Team Communication Actions for Homestay/Retreat */}
            {(property.emergencyPhone || property.receptionPhone) && (
              <div className="pt-4">
                <h3 className="font-medium text-gray-900 mb-4">Support & Contacts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.receptionPhone && (
                    <a href={`tel:${property.receptionPhone}`} className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-gray-700 hover:text-indigo-700">
                      <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <PhoneCall size={24} />
                      </div>
                      <span className="font-medium">Call Host</span>
                    </a>
                  )}
                  {property.emergencyPhone && (
                    <a href={`tel:${property.emergencyPhone}`} className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-200 transition-all text-gray-700 hover:text-rose-700">
                      <div className="p-3 bg-rose-50 rounded-full text-rose-600">
                        <HeartPulse size={24} />
                      </div>
                      <span className="font-medium">Emergency Line</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </>
  );
}
