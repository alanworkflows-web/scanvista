import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Singleton Cache
let cachedData: any = null;
let fetchPromise: Promise<any> | null = null;
let listeners: Function[] = [];

function notifyListeners() {
  listeners.forEach(l => l(cachedData));
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
      fetchPromise = fetch("/api/me")
        .then((res) => {
          if (!res.ok) throw new Error("Not authorized");
          return res.json();
        })
        .then((userData) => {
          return fetch("/api/manager/properties").then(res => res.json()).then(properties => ({ userData, properties }));
        })
        .then(({ userData, properties }): any => {
          if (properties.length === 0) {
            // Auto-provision a default property to prevent "No property found"
            return fetch("/api/manager/properties", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "My Property" })
            })
            .then(res => res.json())
            .then(newProp => {
              return fetch(`/api/properties/${newProp.slug}`)
                .then(res => res.json())
                .then(propData => ({
                  user: userData,
                  property: propData.property,
                  dishes: [],
                  amenities: [],
                  categories: []
                }));
            });
          }
          if (properties.length >= 1) {
            return fetch(`/api/properties/${properties[0].slug}?t=${Date.now()}`)
              .then((res) => res.json())
              .then((propData) => {
                return {
                  user: userData,
                  property: propData.property,
                  dishes: propData.dishes || [],
                  amenities: propData.amenities || [],
                  categories: propData.categories || []
                };
              });
          }
          return { user: userData };
        });
    }

    fetchPromise
      .then((resData) => {
        cachedData = resData;
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
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

  return {
    loading,
    property: data?.property || null,
    dishes: data?.dishes || [],
    amenities: data?.amenities || [],
    categories: data?.categories || [],
    user: data?.user || null,
    multiPropertyError,
    error,
    setProperty,
    refreshProperty
  };
}
