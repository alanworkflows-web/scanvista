import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { calculatePropertyStatus, PropertyStatusResult } from "../lib/propertyStatusEngine";

export const ACTIVE_PROPERTY_KEY = "scanvista_active_property_slug";
export const ACTIVE_PROPERTY_ID_KEY = "scanvista_active_property_id";

// Singleton Cache
let cachedData: any = null;
let fetchPromise: Promise<any> | null = null;
let listeners: Function[] = [];

function notifyListeners() {
  listeners.forEach(l => l(cachedData));
}

export function clearManagerCache() {
  cachedData = null;
  fetchPromise = null;
}

export function useManagerProperty() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [multiPropertyError, setMultiPropertyError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (cachedData && !fetchPromise) {
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      console.log("useManagerProperty: CREATING NEW FETCH PROMISE");
      fetchPromise = fetch("/api/me")
        .then((res) => {
          console.log("useManagerProperty: /api/me returned", res.status);
          if (!res.ok) throw new Error("Not authorized");
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("loggedOut");
          }
          return res.json();
        })
        .then((userData) => {
          console.log("useManagerProperty: userData loaded");
          const savedId = typeof window !== "undefined" 
            ? (localStorage.getItem(ACTIVE_PROPERTY_ID_KEY) || localStorage.getItem(ACTIVE_PROPERTY_KEY) || "") 
            : "";
          const queryParam = savedId ? `?propertyId=${encodeURIComponent(savedId)}` : "";

          console.log("useManagerProperty: fetching current-property", queryParam);
          return fetch(`/api/manager/current-property${queryParam}`)
            .then((res) => {
              console.log("useManagerProperty: current-property returned", res.status);
              if (!res.ok) throw new Error("Failed to fetch property");
              return res.json();
            })
            .then((managerData) => {
              console.log("useManagerProperty: managerData loaded");
              const activeSlug = managerData.property?.slug || null;
              const activeId = managerData.property?.id || null;

              if (typeof window !== "undefined" && activeSlug) {
                localStorage.setItem(ACTIVE_PROPERTY_KEY, activeSlug);
              }
              if (typeof window !== "undefined" && activeId) {
                localStorage.setItem(ACTIVE_PROPERTY_ID_KEY, activeId);
              }

              const propWithEntities = managerData.property ? {
                ...managerData.property,
                categories: managerData.categories || [],
                dishes: managerData.dishes || [],
                amenities: managerData.amenities || []
              } : null;

              const status: PropertyStatusResult | null = managerData.status || (propWithEntities ? calculatePropertyStatus({
                property: propWithEntities,
                snapshots: managerData.property?.snapshots
              }) : null);

              const checklist = status;

              return {
                user: userData,
                property: managerData.property,
                properties: managerData.properties || [],
                activePropertyId: managerData.activePropertyId || activeId,
                activePropertySlug: activeSlug,
                dishes: managerData.dishes || [],
                amenities: managerData.amenities || [],
                categories: managerData.categories || [],
                status,
                checklist
              };
            });
        });
    }

    fetchPromise
      .then((resData) => {
        cachedData = resData;
        setData(resData);
        console.log("useManagerProperty resolved, setting loading to false. resData:", resData);
        setLoading(false);
      })
      .catch((err) => {
        console.log("useManagerProperty caught error:", err.message);
        if (err.message === "Not authorized") {
          navigate(`/manager?returnTo=${encodeURIComponent(location.pathname)}`);
        } else {
          setError(err.message);
        }
        setLoading(false);
        fetchPromise = null; // allow retry
      });
  }, [navigate, location, refreshCount]);

  const setProperty = useCallback((updater: any) => {
    const newValue = typeof updater === 'function' ? updater(cachedData?.property) : updater;
    cachedData = { ...cachedData, property: newValue };
    setData({ ...cachedData });
  }, []);

  const refreshProperty = useCallback(() => {
    fetchPromise = null;
    cachedData = null;
    setLoading(true);
    setRefreshCount(c => c + 1);
  }, []);

  const switchProperty = useCallback((slugOrId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_PROPERTY_KEY, slugOrId);
      localStorage.setItem(ACTIVE_PROPERTY_ID_KEY, slugOrId);
    }
    fetchPromise = null;
    cachedData = null;
    setLoading(true);
    setRefreshCount(c => c + 1);
  }, []);

  return {
    loading,
    property: data?.property || null,
    properties: data?.properties || [],
    activePropertyId: data?.activePropertyId || null,
    activePropertySlug: data?.activePropertySlug || null,
    dishes: data?.dishes || [],
    amenities: data?.amenities || [],
    categories: data?.categories || [],
    status: data?.status || null,
    checklist: data?.checklist || null,
    user: data?.user || null,
    multiPropertyError,
    error,
    setProperty,
    refreshProperty,
    switchProperty
  };
}
