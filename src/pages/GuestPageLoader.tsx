import React, { useEffect, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { PropertyData, GuestInfo } from "../types";
import { PropertyPage } from "./PropertyPage";
import { Skeleton } from "../components/Skeleton";
import { AlertTriangle, Home } from "lucide-react";

interface GuestPageLoaderProps {
  mode?: "property" | "preview" | "guest";
}

export function GuestPageLoader({ mode }: GuestPageLoaderProps) {
  const { propertySlug, token } = useParams<{ propertySlug?: string; token?: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isScanned = searchParams.get("scanned") === "true";

  const resolvedMode = mode || (
    location.pathname.startsWith("/preview/") ? "preview" :
    location.pathname.startsWith("/g/") ? "guest" : "property"
  );

  const identifier = resolvedMode === "property" ? (propertySlug || token) : token;

  const [data, setData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGuestData() {
      if (!identifier) {
        setError("Invalid guest link");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        let endpoint = `/api/properties/${identifier}`;
        if (resolvedMode === "preview") {
          endpoint = `/api/preview/${identifier}`;
        } else if (resolvedMode === "guest") {
          endpoint = `/api/guests/${identifier}`;
        }

        const res = await fetch(endpoint);
        if (!res.ok) {
          if (res.status === 429) throw new Error("Too many requests. Please try again in a minute.");
          if (res.status === 404) throw new Error("Property or Guest Journey Not Found");
          throw new Error("Unable to load guest portal. Please refresh.");
        }

        const json = await res.json();

        // ── Comprehensive Universal Normalizer for All 3 Modes ──
        let prop: any = null;
        let categories: any[] = [];
        let dishes: any[] = [];
        let amenities: any[] = [];
        let guestInfo: GuestInfo | undefined = undefined;

        if (json.property) {
          // Standard /api/properties/:slug or /api/guests/:token shape
          prop = json.property;
          categories = json.categories || prop.categories || [];
          amenities = json.amenities || prop.amenities || [];
          dishes = json.dishes || prop.dishes || categories.flatMap((c: any) => c.dishes || []);

          if (json.name || json.roomNumber || json.arrivalDate) {
            guestInfo = {
              name: json.name && json.name !== "Guest" ? json.name : undefined,
              roomNumber: json.roomNumber,
              arrivalDate: json.arrivalDate,
              departureDate: json.departureDate,
              status: json.status
            };
          }
        } else {
          // Flattened /api/preview/:token shape where root IS the property
          prop = json;
          categories = json.categories || [];
          amenities = json.amenities || [];
          dishes = json.dishes || categories.flatMap((c: any) => c.dishes || []);
        }

        setData({
          property: prop,
          categories,
          dishes,
          amenities,
          guest: guestInfo?.name ? guestInfo : undefined
        });
      } catch (err: any) {
        setError(err.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    }

    fetchGuestData();
  }, [identifier, resolvedMode]);

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
    const isSystemError = error && error !== "Property or Guest Journey Not Found" && error !== "Property Not Found";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSystemError ? "bg-amber-100" : "bg-red-100"}`}>
          {isSystemError ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <Home className="w-8 h-8 text-red-500" />}
        </div>
        <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">
          {error || "Property Not Found"}
        </h1>
        <p className="text-text-secondary opacity-70 max-w-md">
          {isSystemError ? "We are experiencing technical difficulties. Please refresh." : "The guest link you followed is invalid or has expired."}
        </p>
      </div>
    );
  }

  return (
    <PropertyPage 
      initialData={data} 
      isPreview={resolvedMode === "preview"} 
      isScanned={isScanned} 
    />
  );
}
export default GuestPageLoader;
