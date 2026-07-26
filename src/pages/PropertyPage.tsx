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
      <div className="min-h-screen bg-background max-w-2xl mx-auto flex flex-col p-8 space-y-6">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", isSystemError ? "bg-amber-100" : "bg-red-100")}>
          {isSystemError ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <Home className="w-8 h-8 text-red-500" />}
        </div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          {error || "Restaurant Not Found"}
        </h1>
        <p className="text-text-secondary opacity-60">
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
          <div className="bg-surface/95 p-8 rounded-sm shadow-premium-hover max-w-lg text-center mx-4">
            <h2 className="text-3xl font-serif text-text-primary mb-4">
              🖥️ Management Administrative Preview Mode
            </h2>
            <p className="text-text-secondary opacity-80 font-medium text-lg">
              Scan Physical QR for Guest Execution
            </p>
          </div>
        </div>
      )}
      <div
        className={cn(
          "min-h-screen bg-background pb-24",
          !isScanned &&
            "pointer-events-none select-none filter grayscale-[30%] blur-[1px]",
        )}
      >
        {/* Property Header */}
        {(property.bannerUrl || property.heroImage) && (
          <div className="relative h-72 md:h-96 w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
            <img
              src={property.bannerUrl || property.heroImage}
              alt={property.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?q=80&w=2000&auto=format&fit=crop";
              }}
            />

            {/* Overlay Property Info */}
            <div className="absolute bottom-6 left-4 right-4 md:bottom-10 md:left-10 md:right-10 z-30 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-2 drop-shadow-premium-hover">
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
          <div className="mb-12">
            <div className="bg-surface/80 backdrop-blur-md rounded-sm shadow-premium border border-divider p-1 flex justify-between gap-1 w-full max-w-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 whitespace-nowrap py-1.5 px-3 text-sm font-medium rounded-sm transition-colors",
                    activeTab === tab.id
                      ? "bg-gray-900 text-white shadow"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "menu" && (
            <div className="flex flex-col gap-10">
              
              {/* Sticky Category Nav & Filters */}
              <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-divider/50">
                <div 
                  className="flex overflow-x-auto hide-scrollbar gap-2 mb-3 pb-1"
                  style={{ maskImage: "linear-gradient(to right, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 90%, transparent 100%)" }}
                >
                  {(categories || []).map((cat) => {
                    const hasItems = filteredItems.some(i => i.categoryId === cat.id);
                    if (!hasItems) return null;
                    return (
                      <a 
                        key={cat.id} 
                        href={`#category-${cat.id}`}
                        className="whitespace-nowrap px-4 py-2.5 bg-surface border border-divider text-text-secondary rounded-full text-sm font-medium hover:bg-surface-hover hover:border-primary transition-colors shadow-premium min-h-[44px] flex items-center"
                      >
                        {cat.name}
                      </a>
                    );
                })}
              </div>
                <FilterBar filters={filters} setFilters={setFilters} compact />
              </div>

              <div className="flex flex-col gap-10 pb-12">
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
                  (categories || []).map((category) => {
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
                        <h2 className="text-2xl font-serif font-medium text-text-primary mb-4 py-2 border-b border-divider">
                          {category.name}
                        </h2>

                        <div className="bg-surface rounded-sm shadow-premium border border-divider p-8">
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
              <h2 className="text-2xl font-serif font-semibold text-text-primary">
                Amenities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {(amenities || []).map((am) => {
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
                      className="bg-surface p-8 rounded-sm shadow-premium border border-divider flex flex-col gap-10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-10">
                          <div className="p-3 bg-primary-light/20 rounded-sm text-primary-hover shrink-0">
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <h3 className="font-medium text-text-primary">
                              {am.name}
                            </h3>
                            {am.description && (
                              <p className="text-sm text-text-secondary opacity-60 mt-1">
                                {am.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {am.openTime && am.closeTime && (
                          <div className="shrink-0">
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/5 text-text-primary border border-divider">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
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
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-background text-text-secondary rounded-sm text-sm font-medium hover:bg-surface-hover transition-colors border border-divider"
                          >
                            <Phone size={16} />
                            Call Desk to Book Slot
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!amenities || amenities.length === 0) && (
                  <p className="text-text-secondary opacity-60">No amenities listed.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "wifi" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif font-semibold text-text-primary">
                Information & Support
              </h2>

              <div className="bg-surface rounded-sm shadow-premium border border-divider overflow-hidden mb-12">
                <div className="p-8 border-b border-gray-50 flex items-start gap-10">
                  <div className="p-3 bg-blue-50 rounded-sm text-blue-600">
                    <Wifi size={24} />
                  </div>
                  <div className="w-full">
                    <h3 className="font-medium text-text-primary mb-3">
                      Wi-Fi Connection
                    </h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between border-b border-gray-50 pb-3">
                        <span className="text-text-secondary opacity-60">Network</span>
                        <span className="font-medium text-text-primary">
                          {property.wifiNetwork || "Not provided"}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-text-secondary opacity-60">Password</span>
                        <span className="font-medium text-text-primary">
                          {property.wifiPassword || "Not provided"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Team Communication Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {property.receptionPhone && (
                  <a
                    href={`tel:${property.receptionPhone}`}
                    className="flex flex-col items-center justify-center gap-2 p-8 bg-surface rounded-sm shadow-premium border border-divider hover:shadow-premium-hover hover:border-indigo-200 transition-all text-text-secondary hover:text-indigo-700"
                  >
                    <div className="p-3 bg-primary-light/20 rounded-full text-primary-hover">
                      <PhoneCall size={24} />
                    </div>
                    <span className="font-medium">Call Reception</span>
                  </a>
                )}
                {property.housekeepingPhone && (
                  <a
                    href={`tel:${property.housekeepingPhone}`}
                    className="flex flex-col items-center justify-center gap-2 p-8 bg-surface rounded-sm shadow-premium border border-divider hover:shadow-premium-hover hover:border-teal-200 transition-all text-text-secondary hover:text-teal-700"
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
                    className="flex flex-col items-center justify-center gap-2 p-8 bg-surface rounded-sm shadow-premium border border-divider hover:shadow-premium-hover hover:border-rose-200 transition-all text-text-secondary hover:text-rose-700"
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
              <h2 className="text-2xl font-serif font-semibold text-text-primary">
                Your Host
              </h2>
              <div className="bg-surface p-8 rounded-sm shadow-premium border border-divider flex items-start gap-10">
                <div className="p-3 bg-amber-50 rounded-sm text-amber-600">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-text-secondary leading-relaxed">
                    {property.hostInfo || "No host information provided."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif font-semibold text-text-primary">
                Info & Experiences
              </h2>

              <div className="bg-surface p-8 rounded-sm shadow-premium border border-divider flex items-start gap-10">
                <div className="p-3 bg-rose-50 rounded-sm text-rose-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary mb-2">
                    House Rules
                  </h3>
                  <p className="text-text-secondary opacity-80 text-sm leading-relaxed">
                    {property.houseRules || "No house rules listed."}
                  </p>
                </div>
              </div>

              <div className="bg-surface p-8 rounded-sm shadow-premium border border-divider flex items-start gap-10">
                <div className="p-3 bg-teal-50 rounded-sm text-teal-600">
                  <Map size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary mb-2">
                    Experiences
                  </h3>
                  <p className="text-text-secondary opacity-80 text-sm leading-relaxed">
                    {property.experiences || "No experiences listed."}
                  </p>
                </div>
              </div>

              {/* Direct Team Communication Actions for Homestay/Retreat */}
              {(property.emergencyPhone || property.receptionPhone) && (
                <div className="pt-4">
                  <h3 className="font-medium text-text-primary mb-4">
                    Support & Contacts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {property.receptionPhone && (
                      <a
                        href={`tel:${property.receptionPhone}`}
                        className="flex flex-col items-center justify-center gap-2 p-8 bg-surface rounded-sm shadow-premium border border-divider hover:shadow-premium-hover hover:border-indigo-200 transition-all text-text-secondary hover:text-indigo-700"
                      >
                        <div className="p-3 bg-primary-light/20 rounded-full text-primary-hover">
                          <PhoneCall size={24} />
                        </div>
                        <span className="font-medium">Call Host</span>
                      </a>
                    )}
                    {property.emergencyPhone && (
                      <a
                        href={`tel:${property.emergencyPhone}`}
                        className="flex flex-col items-center justify-center gap-2 p-8 bg-surface rounded-sm shadow-premium border border-divider hover:shadow-premium-hover hover:border-rose-200 transition-all text-text-secondary hover:text-rose-700"
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
        <div className="fixed bottom-0 left-0 right-0 p-8 z-50 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none pb-safe">
          <div className="max-w-md mx-auto w-full pointer-events-auto">
            {(property.roomServicePhone || property.receptionPhone) ? (
              <a 
                href={`tel:${property.roomServicePhone || property.receptionPhone}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white rounded-sm font-medium shadow-premium hover:bg-gray-800 transition-all active:scale-95"
              >
                <Phone className="w-5 h-5" />
                {property.roomServicePhone ? "Order Room Service" : "Call to Order"}
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-3.5 bg-surface text-text-primary rounded-sm font-semibold shadow-premium border border-divider">
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
