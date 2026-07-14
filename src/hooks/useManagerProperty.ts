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

  useEffect(() => {
    if (cachedData) {
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
            return { user: userData, properties: [] };
          }
          if (properties.length >= 1) {
            return fetch(`/api/properties/${properties[0].slug}`)
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
        if (resData.properties?.length === 0 && location.pathname !== "/manager/onboarding") {
          navigate("/manager/onboarding");
        }
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
  }, [navigate, location]);

  const setProperty = useCallback((updater: any) => {
    const newValue = typeof updater === 'function' ? updater(cachedData?.property) : updater;
    cachedData = { ...cachedData, property: newValue };
    setData({ ...cachedData });
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
    setProperty
  };
}
