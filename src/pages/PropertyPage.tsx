import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PropertyData, Dish, MenuCategory, Amenity } from "../types";
import { DishCard } from "../components/DishCard";
import { FilterBar, FilterState } from "../components/FilterBar";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import {
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
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  Clock,
  CreditCard,
  Compass,
  MessageSquare,
  Hotel,
  Palmtree,
  ShieldCheck,
  QrCode,
  Share2,
  Mail,
  Globe,
  MessageCircle,
  Camera
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { trackEvent } from "../lib/tracking";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IconMap: Record<string, React.FC<any>> = {
  Dumbbell,
  Waves,
  Flower2,
  Coffee,
  Wine,
  Sparkles,
  Compass
};

const DEFAULT_HERO_IMAGES: Record<string, string> = {
  HOTEL: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop",
  RESORT: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop",
  HOMESTAY: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1600&auto=format&fit=crop",
  RETREAT: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop"
};

const PROPERTY_TYPE_LABELS: Record<string, { label: string; icon: any }> = {
  HOTEL: { label: "Luxury Hotel", icon: Hotel },
  RESORT: { label: "Full-Service Resort", icon: Palmtree },
  HOMESTAY: { label: "Boutique Villa / Homestay", icon: Home },
  RETREAT: { label: "Wellness Retreat", icon: Sparkles }
};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export interface PropertyPageProps {
  initialData?: PropertyData | null;
  isPreview?: boolean;
  isScanned?: boolean;
}

export function PropertyPage({ initialData, isPreview = false, isScanned: propIsScanned }: PropertyPageProps = {}) {
  const { propertySlug } = useParams<{ propertySlug: string }>();
  const [searchParams] = useSearchParams();
  const isScanned = propIsScanned ?? (searchParams.get("scanned") === "true");

  const [data, setData] = useState<PropertyData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("menu");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPreviewBanner, setShowPreviewBanner] = useState(isPreview || !isScanned);
  const [openAccordion, setOpenAccordion] = useState<string | null>("rules");
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    veganOnly: false,
    vegetarianOnly: false,
    hideGluten: false,
    searchQuery: "",
  });

  // Track if initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData) return;

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties/${propertySlug}`);
        if (!res.ok) {
          if (res.status === 429) throw new Error("Too many requests. Please try again in a minute.");
          if (res.status === 404) throw new Error("Property Not Found");
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
  }, [propertySlug, initialData]);

  useEffect(() => {
    if (data?.property?.name) {
      document.title = `${data.property.name} | Guest Experience`;
    }
  }, [data?.property?.name]);

  const propertyType = data?.property?.propertyType || "HOTEL";

  useEffect(() => {
    if (!propertyType) return;

    const isHotelOrResort = propertyType === "HOTEL" || propertyType === "RESORT";
    const currentTabs = isHotelOrResort
      ? [{ id: "menu" }, { id: "amenities" }, { id: "wifi" }]
      : [{ id: "menu" }, { id: "host" }, { id: "rules" }];

    if (!currentTabs.find((t) => t.id === activeTab)) {
      setActiveTab(currentTabs[0].id);
    }
  }, [propertyType]);

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    if (data?.property?.id) {
      trackEvent(data.property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'WIFI_COPIED', field });
    }
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSearchFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (newFilters.searchQuery && data?.property?.id) {
      trackEvent(data.property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'MENU_SEARCHED', query: newFilters.searchQuery });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface max-w-2xl mx-auto flex flex-col p-6 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isSystemError = error && error !== "Property Not Found";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", isSystemError ? "bg-amber-100" : "bg-red-100")}>
          {isSystemError ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <Home className="w-8 h-8 text-red-500" />}
        </div>
        <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">
          {error || "Property Not Found"}
        </h1>
        <p className="text-text-secondary opacity-70 max-w-md">
          {isSystemError ? "We are experiencing technical difficulties. Please refresh." : "We couldn't find the hospitality property you're looking for."}
        </p>
      </div>
    );
  }

  const { property, categories, dishes, amenities, guest } = data;
  const isHotelOrResort = property.propertyType === "HOTEL" || property.propertyType === "RESORT";
  const typeMeta = PROPERTY_TYPE_LABELS[property.propertyType || "HOTEL"] || PROPERTY_TYPE_LABELS.HOTEL;
  const TypeIcon = typeMeta.icon;

  let parsedContacts: { whatsapp?: string; email?: string; phone?: string; website?: string } = {};
  try {
    if (typeof (property as any).contacts === "string") {
      parsedContacts = JSON.parse((property as any).contacts);
    } else if ((property as any).contacts && typeof (property as any).contacts === "object") {
      parsedContacts = (property as any).contacts;
    }
  } catch (e) {}

  const heroImage = property.bannerUrl || property.heroImage || DEFAULT_HERO_IMAGES[property.propertyType || "HOTEL"] || DEFAULT_HERO_IMAGES.HOTEL;
  const gallery = Array.isArray(property.gallery) ? property.gallery.filter(Boolean) : [];

  const tabs = isHotelOrResort
    ? [
        { id: "menu", label: "🍽️ Dining Menu" },
        { id: "amenities", label: "🛎️ Amenities" },
        { id: "wifi", label: "📶 Wi-Fi & Support" },
      ]
    : [
        { id: "menu", label: "🍳 Dining & Meals" },
        { id: "host", label: "🏡 Your Host" },
        { id: "rules", label: "🗺️ Stay Guide" },
      ];

  // Filter logic
  const filteredItems = (dishes || []).filter((item) => {
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
    <div className="min-h-screen bg-background pb-32 text-text-primary antialiased">
      {/* Sleek, non-intrusive preview banner for owner */}
      {(isPreview || (!isScanned && showPreviewBanner)) && (
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md text-white px-4 py-2.5 shadow-md flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white tracking-wide">
              {isPreview ? "Draft Preview Mode" : "Live Guest Portal Preview"}
            </span>
            <span className="hidden md:inline text-gray-400 text-xs">
              {isPreview ? "• Reviewing draft content before publishing" : "• Scan master QR code to simulate mobile experience"}
            </span>
          </div>
          <button 
            onClick={() => setShowPreviewBanner(false)}
            className="text-gray-300 hover:text-white text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Atmosphere Section */}
      <div className="relative h-80 md:h-[420px] w-full overflow-hidden bg-gray-950">
        <img
          src={heroImage}
          alt={property.name}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DEFAULT_HERO_IMAGES.HOTEL;
          }}
        />
        {/* Editorial Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-black/20 z-10" />

        {/* Floating Top Pill Header with optional subtle guest greeting */}
        <div className="absolute top-6 left-4 right-4 z-20 max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium uppercase tracking-wider">
            <TypeIcon size={13} className="text-emerald-400" />
            <span>{typeMeta.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {guest?.name && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                <Sparkles size={12} className="text-amber-400" />
                <span>{getTimeGreeting()}, {guest.name}</span>
                {guest.roomNumber && <span className="text-white/60 text-[10px]">Rm {guest.roomNumber}</span>}
              </div>
            )}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Digital Concierge Active</span>
            </div>
          </div>
        </div>

        {/* Header Content with Logo & Tagline */}
        <div className="absolute bottom-6 left-4 right-4 md:bottom-10 md:left-8 md:right-8 z-20 max-w-4xl mx-auto">
          <div className="flex items-center gap-3.5 mb-2">
            {property.logoUrl && (
              <img 
                src={property.logoUrl} 
                alt={`${property.name} logo`} 
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover bg-white/10 backdrop-blur-md border border-white/20 shadow-md shrink-0"
              />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-white tracking-tight leading-tight drop-shadow-md">
                {property.name}
              </h1>
              {property.tagline && (
                <p className="text-xs sm:text-sm text-emerald-300 font-medium tracking-wide">
                  {property.tagline}
                </p>
              )}
            </div>
          </div>

          <p className="text-gray-200/90 text-sm md:text-base font-normal max-w-2xl flex items-center gap-2 line-clamp-2">
            <Map className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{property.description || "Welcome to your digital guest experience. Explore our dining, amenities, and stay guide."}</span>
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4 relative z-30">
        {/* Navigation Tabs Pill Bar */}
        <div className="bg-surface/90 backdrop-blur-xl rounded-2xl shadow-premium border border-divider p-1.5 flex gap-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center text-center",
                activeTab === tab.id
                  ? "bg-gray-900 text-white shadow-md scale-[1.01]"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DINING MENU */}
        {activeTab === "menu" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Sticky Category Bar & Filters */}
            <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-xl py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-divider/60">
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
                      className="whitespace-nowrap px-4 py-2 bg-surface border border-divider text-text-secondary rounded-full text-xs sm:text-sm font-medium hover:bg-surface-hover hover:border-emerald-600 hover:text-text-primary transition-all shadow-sm flex items-center min-h-[40px]"
                    >
                      {cat.name}
                    </a>
                  );
                })}
              </div>
              <FilterBar filters={filters} setFilters={handleSearchFilterChange} compact />
            </div>

            {/* Menu List */}
            <div className="space-y-8 pb-8">
              {(!categories || categories.length === 0) ? (
                <div className="bg-surface rounded-2xl border border-divider p-8 text-center shadow-premium">
                  <EmptyState 
                    icon={UtensilsCrossed} 
                    title="Menu Curated Daily" 
                    description="We are currently refreshing our seasonal selections. Please check back shortly or connect with our team." 
                  />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="bg-surface rounded-2xl border border-divider p-8 text-center shadow-premium">
                  <EmptyState 
                    icon={UtensilsCrossed} 
                    title="No Items Match Your Filter" 
                    description="Try resetting your dietary options to see all selections." 
                    action={{
                      label: "Reset Filters",
                      onClick: () => handleSearchFilterChange({
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
                    (item) => item.categoryId === category.id
                  );
                  if (categoryItems.length === 0) return null;

                  return (
                    <div
                      key={category.id}
                      id={`category-${category.id}`}
                      className="scroll-mt-48 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-divider">
                        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-text-primary">
                          {category.name}
                        </h2>
                        <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                          {categoryItems.length} {categoryItems.length === 1 ? 'selection' : 'selections'}
                        </span>
                      </div>

                      <div className="bg-surface rounded-2xl shadow-premium border border-divider p-4 sm:p-6 divide-y divide-divider/60">
                        {categoryItems.map((item) => (
                          <DishCard
                            key={item.id}
                            item={item}
                            propertyType={property.propertyType as any}
                            currency={property.currency}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AMENITIES */}
        {activeTab === "amenities" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-serif font-medium text-text-primary mb-1">
                Property Amenities & Services
              </h2>
              <p className="text-sm text-text-secondary opacity-70">
                Explore facilities, operating hours, and wellness areas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {amenities && amenities.length > 0 ? (
                amenities.map((amenity) => {
                  const Icon = IconMap[amenity.icon || "Sparkles"] || Sparkles;

                  // Real-time status logic (Device local time)
                  let isOpen = true;
                  if (amenity.openTime && amenity.closeTime) {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();

                    const [openH, openM] = amenity.openTime.split(":").map(Number);
                    const [closeH, closeM] = amenity.closeTime.split(":").map(Number);

                    const openMinutes = openH * 60 + openM;
                    const closeMinutes = closeH * 60 + closeM;

                    if (openMinutes < closeMinutes) {
                      isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
                    } else {
                      // Overnight hours (e.g. 20:00 - 02:00)
                      isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
                    }
                  }

                  return (
                    <div
                      key={amenity.id}
                      className="p-5 bg-surface rounded-2xl shadow-premium border border-divider flex flex-col justify-between hover:border-emerald-600/40 transition-colors group"
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl group-hover:bg-emerald-100 transition-colors shrink-0">
                          <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-serif font-medium text-lg text-text-primary truncate">
                              {amenity.name}
                            </h3>
                            {amenity.openTime && amenity.closeTime && (
                              <span
                                className={cn(
                                  "px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full shrink-0",
                                  isOpen
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                )}
                              >
                                {isOpen ? "Open Now" : "Closed"}
                              </span>
                            )}
                          </div>
                          {amenity.description && (
                            <p className="text-sm text-text-secondary opacity-80 line-clamp-2">
                              {amenity.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-divider/60 flex items-center justify-between text-xs text-text-muted mt-auto">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock size={14} className="text-emerald-700" />
                          <span>
                            {amenity.openTime && amenity.closeTime
                              ? `${amenity.openTime} – ${amenity.closeTime}`
                              : "Open 24 Hours"}
                          </span>
                        </div>

                        {amenity.requiresReservation && (
                          <a
                            href={`tel:${property.receptionPhone || ""}`}
                            onClick={() => {
                              if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'AMENITY_RESERVATION_CLICK', amenityId: amenity.id, amenityName: amenity.name });
                            }}
                            className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>Reserve via Desk</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-8 bg-surface rounded-2xl border border-divider text-center shadow-premium">
                  <Sparkles className="w-8 h-8 text-emerald-700 mx-auto mb-3" />
                  <h3 className="font-serif text-lg text-text-primary mb-1">Complimentary Amenities Available</h3>
                  <p className="text-sm text-text-secondary opacity-70">
                    Contact our front desk or team for information regarding resort amenities, pool access, and wellness facilities.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WI-FI & SUPPORT */}
        {activeTab === "wifi" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Wi-Fi Luxury One-Tap Card */}
            <div className="bg-surface rounded-2xl shadow-premium border border-divider overflow-hidden">
              <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-900 via-gray-900 to-gray-950 text-white relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-emerald-400 border border-white/10">
                      <Wifi size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-medium text-white">
                        High-Speed Guest Wi-Fi
                      </h3>
                      <p className="text-xs text-gray-300">
                        Complimentary unlimited access throughout the property
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                    <ShieldCheck size={13} />
                    <span>Secure Network</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Network Box */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Network (SSID)
                      </p>
                      <p className="text-base font-semibold text-white font-mono">
                        {property.wifiNetwork || `${property.name}_Guest`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(property.wifiNetwork || `${property.name}_Guest`, 'network')}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                      title="Copy Network Name"
                    >
                      {copiedField === 'network' ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                      <span>{copiedField === 'network' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Password Box */}
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Password
                      </p>
                      <p className="text-base font-semibold text-white font-mono">
                        {property.wifiPassword || "Welcome2026"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(property.wifiPassword || "Welcome2026", 'password')}
                      className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
                      title="Copy Password"
                    >
                      {copiedField === 'password' ? <Check size={15} /> : <Copy size={15} />}
                      <span>{copiedField === 'password' ? 'Copied!' : 'Copy Password'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Concierge & Team Support Actions */}
            <div>
              <h3 className="text-xl font-serif font-medium text-text-primary mb-3">
                Guest Services & Assistance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Front Desk / Reception */}
                {property.receptionPhone ? (
                  <a
                    href={`tel:${property.receptionPhone}`}
                    onClick={() => {
                      if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'RECEPTION_CALL_CLICK' });
                    }}
                    className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider hover:border-emerald-600/50 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                      <PhoneCall size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">Front Desk</span>
                    <span className="text-xs text-text-muted">{property.receptionPhone}</span>
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider">
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-full mb-3">
                      <PhoneCall size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">Front Desk</span>
                    <span className="text-xs text-text-muted">Dial 0 from room phone</span>
                  </div>
                )}

                {/* WhatsApp Concierge */}
                {parsedContacts.whatsapp ? (
                  <a
                    href={`https://wa.me/${parsedContacts.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'WHATSAPP_CLICK' });
                    }}
                    className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider hover:border-emerald-600/50 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                      <MessageCircle size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">WhatsApp Chat</span>
                    <span className="text-xs text-text-muted">Instant Concierge</span>
                  </a>
                ) : null}

                {/* Email Support */}
                {parsedContacts.email ? (
                  <a
                    href={`mailto:${parsedContacts.email}`}
                    onClick={() => {
                      if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'EMAIL_CLICK' });
                    }}
                    className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider hover:border-emerald-600/50 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                      <Mail size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">Email Concierge</span>
                    <span className="text-xs text-text-muted">{parsedContacts.email}</span>
                  </a>
                ) : null}

                {/* Direct Phone (if distinct from reception) */}
                {parsedContacts.phone && parsedContacts.phone !== property.receptionPhone ? (
                  <a
                    href={`tel:${parsedContacts.phone}`}
                    onClick={() => {
                      if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'PHONE_CLICK' });
                    }}
                    className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider hover:border-emerald-600/50 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                      <Phone size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">Direct Line</span>
                    <span className="text-xs text-text-muted">{parsedContacts.phone}</span>
                  </a>
                ) : null}

                {/* Housekeeping */}
                {property.housekeepingPhone ? (
                  <a
                    href={`tel:${property.housekeepingPhone}`}
                    onClick={() => {
                      if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'HOUSEKEEPING_CALL_CLICK' });
                    }}
                    className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider hover:border-emerald-600/50 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                      <LifeBuoy size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">Housekeeping</span>
                    <span className="text-xs text-text-muted">Linens & room service</span>
                  </a>
                ) : null}

                {/* Emergency Duty */}
                {property.emergencyPhone ? (
                  <a
                    href={`tel:${property.emergencyPhone}`}
                    onClick={() => {
                      if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'EMERGENCY_CALL_CLICK' });
                    }}
                    className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider hover:border-rose-300 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-3.5 bg-rose-50 text-rose-600 rounded-full mb-3 group-hover:bg-rose-100 transition-colors">
                      <HeartPulse size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">Emergency Duty</span>
                    <span className="text-xs text-rose-600 font-medium">Urgent Night Line</span>
                  </a>
                ) : null}

                {/* Official Website */}
                {parsedContacts.website ? (
                  <a
                    href={parsedContacts.website.startsWith('http') ? parsedContacts.website : `https://${parsedContacts.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'WEBSITE_CLICK' });
                    }}
                    className="flex flex-col items-center justify-center text-center p-6 bg-surface rounded-2xl shadow-premium border border-divider hover:border-emerald-600/50 transition-all hover:scale-[1.02] group"
                  >
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                      <Globe size={22} />
                    </div>
                    <span className="font-semibold text-text-primary text-sm mb-1">Official Website</span>
                    <span className="text-xs text-text-muted">Explore Resort</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOST (Homestay / Retreat) */}
        {activeTab === "host" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-serif font-medium text-text-primary">
              Your Host & Welcome
            </h2>
            <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-premium border border-divider flex items-start gap-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl shrink-0">
                <User size={26} />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-medium text-text-primary">
                  Warm Hospitality Message
                </h3>
                <p className="text-text-secondary opacity-80 leading-relaxed text-sm sm:text-base">
                  {property.hostInfo || property.welcomeMessage || `Welcome to ${property.name}! We're thrilled to have you with us. If there's anything you need to make your stay comfortable and memorable, please don't hesitate to reach out.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STAY GUIDE & HOUSE RULES */}
        {activeTab === "rules" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-serif font-medium text-text-primary">
              Stay Guide & Guidelines
            </h2>

            {/* Check-in / Check-out timing card */}
            <div className="bg-surface p-6 rounded-2xl shadow-premium border border-divider grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Check-In</p>
                  <p className="font-serif text-lg font-semibold text-text-primary">{property.checkInTime || "3:00 PM"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Check-Out</p>
                  <p className="font-serif text-lg font-semibold text-text-primary">{property.checkOutTime || "11:00 AM"}</p>
                </div>
              </div>
            </div>

            {/* Conditional Photo Gallery Showcase (Only if gallery exists) */}
            {gallery.length > 0 && (
              <div className="bg-surface rounded-2xl shadow-premium border border-divider p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={20} className="text-emerald-700" />
                    <h3 className="font-serif font-medium text-lg text-text-primary">Property Gallery</h3>
                  </div>
                  <span className="text-xs text-text-muted">{activeGalleryIndex + 1} / {gallery.length}</span>
                </div>

                <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-gray-950">
                  <img 
                    src={gallery[activeGalleryIndex]} 
                    alt={`Property view ${activeGalleryIndex + 1}`} 
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  {gallery.length > 1 && (
                    <>
                      <button 
                        onClick={() => {
                          setActiveGalleryIndex(prev => (prev === 0 ? gallery.length - 1 : prev - 1));
                          if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'GALLERY_VIEWED' });
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          setActiveGalleryIndex(prev => (prev === gallery.length - 1 ? 0 : prev + 1));
                          if (property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'GALLERY_VIEWED' });
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        aria-label="Next photo"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveGalleryIndex(idx)}
                        className={cn(
                          "w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                          idx === activeGalleryIndex ? "border-emerald-600 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* House Rules Accordion */}
            <div className="bg-surface rounded-2xl shadow-premium border border-divider overflow-hidden">
              <button
                onClick={() => {
                  const nextState = openAccordion === 'rules' ? null : 'rules';
                  setOpenAccordion(nextState);
                  if (nextState && property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'RULE_OPENED', section: 'house_rules' });
                }}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-lg text-text-primary">Property Guidelines & House Rules</h3>
                    <p className="text-xs text-text-secondary opacity-70">Policies regarding noise, smoking, and shared spaces</p>
                  </div>
                </div>
                <ChevronDown size={20} className={cn("transition-transform text-text-muted", openAccordion === 'rules' && "rotate-180")} />
              </button>
              {openAccordion === 'rules' && (
                <div className="px-6 pb-6 pt-2 text-sm text-text-secondary opacity-80 leading-relaxed border-t border-divider/60 whitespace-pre-wrap">
                  {(() => {
                    const rules = property.hotelRules || property.houseRules;
                    if (!rules) return "• Quiet hours observed after 10:00 PM for guest relaxation.\n• Non-smoking inside all rooms and indoor facilities.\n• Please keep room keys and valuables secured in room safes.\n• Guests are kindly requested to notify front desk of visitors.";
                    if (typeof rules === 'string') return rules;
                    if (Array.isArray(rules)) return rules.map((r: any) => typeof r === 'string' ? r : r.text || JSON.stringify(r)).join('\n');
                    return JSON.stringify(rules);
                  })()}
                </div>
              )}
            </div>

            {/* Experiences / Local Recommendations */}
            <div className="bg-surface rounded-2xl shadow-premium border border-divider overflow-hidden">
              <button
                onClick={() => {
                  const nextState = openAccordion === 'exp' ? null : 'exp';
                  setOpenAccordion(nextState);
                  if (nextState && property.id) trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { type: 'RULE_OPENED', section: 'experiences' });
                }}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-lg text-text-primary">Local Attractions & Experiences</h3>
                    <p className="text-xs text-text-secondary opacity-70">Curated nearby sights, dining, and activities</p>
                  </div>
                </div>
                <ChevronDown size={20} className={cn("transition-transform text-text-muted", openAccordion === 'exp' && "rotate-180")} />
              </button>
              {openAccordion === 'exp' && (
                <div className="px-6 pb-6 pt-2 text-sm text-text-secondary opacity-80 leading-relaxed border-t border-divider/60">
                  {property.experiences || "Ask our front desk team for curated walking maps, private transportation, and top-rated local dining recommendations."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Action Bar on Mobile / Scanned Devices */}
      {property && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none pb-safe">
          <div className="max-w-md mx-auto w-full pointer-events-auto">
            {(property.roomServicePhone || property.receptionPhone) ? (
              <a 
                href={`tel:${property.roomServicePhone || property.receptionPhone}`}
                onClick={() => {
                  if (property.id) {
                    trackEvent(property.id, 'EXECUTED', 'RECOMMENDATION', { 
                      type: property.roomServicePhone ? 'ROOM_SERVICE_CALL_CLICK' : 'RECEPTION_CALL_CLICK' 
                    });
                  }
                }}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-semibold shadow-premium-hover transition-all active:scale-[0.98] border border-white/10"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>{property.roomServicePhone ? "Order Room Service" : "Call Front Desk"}</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-3 bg-surface/90 backdrop-blur-md text-text-secondary text-xs font-semibold rounded-2xl shadow-premium border border-divider">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>ScanVista Guest Experience Platform</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default PropertyPage;
