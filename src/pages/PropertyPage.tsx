import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PropertyData } from "../types";
import { DishCard } from "../components/DishCard";
import { FilterBar, FilterState } from "../components/FilterBar";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import {
  Loader2,
  UtensilsCrossed,
  Wifi,
  FileText,
  Map,
  User,
  Home,
  Dumbbell,
  Waves,
  Flower2,
  Coffee,
  Wine,
  Phone,
  PhoneCall,
  HeartPulse,
  LifeBuoy,
  ChevronDown,
  Info,
  AlertTriangle,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IconMap: Record<string, React.FC<any>> = {
  Dumbbell,
  Waves,
  Flower2,
  Coffee,
  Wine,
};

export function PropertyPage() {
  const { propertySlug } = useParams<{ propertySlug: string }>();
  const [searchParams] = useSearchParams();
  const isScanned = searchParams.get("scanned") === "true";

  const [data, setData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("menu");

  const [filters, setFilters] = useState<FilterState>({
    veganOnly: false,
    vegetarianOnly: false,
    hideGluten: false,
    searchQuery: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties/${propertySlug}`);
        if (!res.ok) {
          if (res.status === 429) throw new Error("Too many requests. Please try again in a minute.");
          if (res.status === 404) throw new Error("Restaurant Not Found");
          throw new Error("System Error. Please try again.");
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

  useEffect(() => {
    if (data?.property?.name) {
      document.title = data.property.name;
    }
  }, [data?.property?.name]);

  const propertyType = data?.property?.propertyType;

  // Set initial tab if property type changed
  useEffect(() => {
    if (!propertyType) return;

    const isHotelOrResort =
      propertyType === "HOTEL" || propertyType === "RESORT";
    const currentTabs = isHotelOrResort
      ? [{ id: "menu" }, { id: "amenities" }, { id: "wifi" }]
      : [{ id: "menu" }, { id: "host" }, { id: "rules" }];

    if (!currentTabs.find((t) => t.id === activeTab)) {
      setActiveTab(currentTabs[0].id);
    }
  }, [propertyType, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-2xl mx-auto flex flex-col p-6 space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isSystemError = error && error !== "Restaurant Not Found";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", isSystemError ? "bg-amber-100" : "bg-red-100")}>
          {isSystemError ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <Home className="w-8 h-8 text-red-500" />}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {error || "Restaurant Not Found"}
        </h1>
        <p className="text-gray-500">
          {isSystemError ? "We are experiencing technical difficulties. Please refresh." : "We couldn't find the restaurant you're looking for."}
        </p>
      </div>
    );
  }

  const { property, categories, dishes, amenities } = data;

  const isHotelOrResort =
    property.propertyType === "HOTEL" || property.propertyType === "RESORT";

  const tabs = isHotelOrResort
    ? [
        { id: "menu", label: "🍽️ Menu" },
        { id: "amenities", label: "🛎️ Amenities" },
        { id: "wifi", label: "📶 Wi-Fi & Info" },
      ]
    : [
        { id: "menu", label: "🍳 Meals" },
        { id: "host", label: "🏡 Your Host" },
        { id: "rules", label: "🗺️ Info" },
      ];

  // Filter logic
  const filteredItems = dishes.filter((item) => {
    if (filters.veganOnly && item.dietaryCategory !== "Vegan") return false;
    if (
      filters.vegetarianOnly &&
      item.dietaryCategory !== "Vegetarian" &&
      item.dietaryCategory !== "Vegan"
    )
      return false;

    let hasGluten = false;
    try {
      hasGluten = JSON.parse(item.allergens).includes("GLUTEN");
    } catch (e) {}

    if (filters.hideGluten && hasGluten) return false;
    
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesDesc = item.description?.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc) return false;
    }

    return true;
  });

  return (
    <>
      {!isScanned && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white/95 p-8 rounded-2xl shadow-2xl max-w-lg text-center mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🖥️ Management Administrative Preview Mode
            </h2>
            <p className="text-gray-600 font-medium text-lg">
              Scan Physical QR for Guest Execution
            </p>
          </div>
        </div>
      )}
      <div
        className={cn(
          "min-h-screen bg-gray-50 pb-24",
          !isScanned &&
            "pointer-events-none select-none filter grayscale-[30%] blur-[1px]",
        )}
      >
        {/* Property Header */}
        {property.bannerUrl && (
          <div className="relative h-72 md:h-96 w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
            <img
              src={property.bannerUrl}
              alt={property.name}
              className="w-full h-full object-cover"
            />

            {/* Overlay Property Info */}
            <div className="absolute bottom-6 left-4 right-4 md:bottom-10 md:left-10 md:right-10 z-30 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-md">
                  {property.name}
                </h1>
                <p className="text-gray-200 text-sm md:text-base font-medium flex items-center gap-2">
                  <Map className="w-4 h-4" /> {property.description || `${property.name} Location`}
                </p>
              </div>
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
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "menu" && (
            <div className="flex flex-col gap-6">
              
              {/* Sticky Category Nav & Filters */}
              <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-xl py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200/50">
                <div 
                  className="flex overflow-x-auto hide-scrollbar gap-2 mb-3 pb-1"
                  style={{ maskImage: "linear-gradient(to right, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 90%, transparent 100%)" }}
                >
                  {categories.map((cat) => {
                    const hasItems = filteredItems.some(i => i.categoryId === cat.id);
                    if (!hasItems) return null;
                    return (
                      <a 
                        key={cat.id} 
                        href={`#category-${cat.id}`}
                        className="whitespace-nowrap px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors shadow-sm min-h-[44px] flex items-center"
                      >
                        {cat.name}
                      </a>
                    );
                })}
              </div>
                <FilterBar filters={filters} setFilters={setFilters} compact />
              </div>

              <div className="flex flex-col gap-8 pb-12">
                {categories.length === 0 ? (
                  <div className="px-2 mt-4">
                    <EmptyState 
                      icon={UtensilsCrossed} 
                      title="Menu Coming Soon" 
                      description="We are currently updating our digital menu. Please check back shortly or ask your server for assistance." 
                    />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="px-2 mt-4 text-center">
                    <EmptyState 
                      icon={UtensilsCrossed} 
                      title="No Items Found" 
                      description="Try adjusting your dietary filters." 
                      action={{
                        label: "Clear filters",
                        onClick: () => setFilters({
                          veganOnly: false,
                          vegetarianOnly: false,
                          hideGluten: false,
                          searchQuery: "",
                        })
                      }}
                    />
                  </div>
                ) : (
                  categories.map((category) => {
                    const categoryItems = filteredItems.filter(
                      (item) => item.categoryId === category.id,
                    );
                    if (categoryItems.length === 0) return null;

                    return (
                      <div
                        key={category.id}
                        id={`category-${category.id}`}
                        className="scroll-mt-48"
                      >
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 py-2 border-b border-gray-100">
                          {category.name}
                        </h2>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                          <div className="flex flex-col w-full">
                            {categoryItems.map((item) => (
                              <DishCard
                                key={item.id}
                                item={item}
                                propertyType={property.propertyType as any}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "amenities" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif font-semibold text-gray-900">
                Amenities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.map((am) => {
                  const IconComponent =
                    am.icon && IconMap[am.icon] ? IconMap[am.icon] : Dumbbell;

                  // Calculate open/closed status
                  let isOpen = true;
                  if (am.openTime && am.closeTime) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

                    if (am.openTime <= am.closeTime) {
                      isOpen =
                        currentTimeStr >= am.openTime &&
                        currentTimeStr <= am.closeTime;
                    } else {
                      // spans midnight
                      isOpen =
                        currentTimeStr >= am.openTime ||
                        currentTimeStr <= am.closeTime;
                    }
                  }

                  return (
                    <div
                      key={am.id}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {am.name}
                            </h3>
                            {am.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {am.description}
                              </p>
                            )}
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
              <h2 className="text-2xl font-serif font-semibold text-gray-900">
                Information & Support
              </h2>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-50 flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Wifi size={24} />
                  </div>
                  <div className="w-full">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Wi-Fi Connection
                    </h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between border-b border-gray-50 pb-3">
                        <span className="text-gray-500">Network</span>
                        <span className="font-medium text-gray-900">
                          {property.wifiNetwork || "Not provided"}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Password</span>
                        <span className="font-medium text-gray-900">
                          {property.wifiPassword || "Not provided"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Team Communication Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.receptionPhone && (
                  <a
                    href={`tel:${property.receptionPhone}`}
                    className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-gray-700 hover:text-indigo-700"
                  >
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                      <PhoneCall size={24} />
                    </div>
                    <span className="font-medium">Call Reception</span>
                  </a>
                )}
                {property.housekeepingPhone && (
                  <a
                    href={`tel:${property.housekeepingPhone}`}
                    className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all text-gray-700 hover:text-teal-700"
                  >
                    <div className="p-3 bg-teal-50 rounded-full text-teal-600">
                      <LifeBuoy size={24} />
                    </div>
                    <span className="font-medium">Call Housekeeping</span>
                  </a>
                )}
                {property.emergencyPhone && (
                  <a
                    href={`tel:${property.emergencyPhone}`}
                    className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-200 transition-all text-gray-700 hover:text-rose-700"
                  >
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
              <h2 className="text-2xl font-serif font-semibold text-gray-900">
                Your Host
              </h2>
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
              <h2 className="text-2xl font-serif font-semibold text-gray-900">
                Info & Experiences
              </h2>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    House Rules
                  </h3>
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
                  <h3 className="font-medium text-gray-900 mb-2">
                    Experiences
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {property.experiences || "No experiences listed."}
                  </p>
                </div>
              </div>

              {/* Direct Team Communication Actions for Homestay/Retreat */}
              {(property.emergencyPhone || property.receptionPhone) && (
                <div className="pt-4">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Support & Contacts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {property.receptionPhone && (
                      <a
                        href={`tel:${property.receptionPhone}`}
                        className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-gray-700 hover:text-indigo-700"
                      >
                        <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                          <PhoneCall size={24} />
                        </div>
                        <span className="font-medium">Call Host</span>
                      </a>
                    )}
                    {property.emergencyPhone && (
                      <a
                        href={`tel:${property.emergencyPhone}`}
                        className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-200 transition-all text-gray-700 hover:text-rose-700"
                      >
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
      
      {/* Floating Bottom Bar (Only visible if scanned) */}
      {isScanned && property && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none pb-safe">
          <div className="max-w-md mx-auto w-full pointer-events-auto">
            {(property.roomServicePhone || property.receptionPhone) ? (
              <a 
                href={`tel:${property.roomServicePhone || property.receptionPhone}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-gray-800 transition-all active:scale-95"
              >
                <Phone className="w-5 h-5" />
                {property.roomServicePhone ? "Order Room Service" : "Call to Order"}
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-gray-900 rounded-2xl font-semibold shadow-lg border border-gray-200">
                <Info className="w-5 h-5" />
                <span>Please order at the counter</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
