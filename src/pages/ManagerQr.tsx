import React, { useEffect, useState } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { OpsDashboardSheet } from "../components/OpsDashboardSheet";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function ManagerQr() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [multiPropertyError, setMultiPropertyError] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then(data => {
        if (data.properties && data.properties.length > 1) {
          setMultiPropertyError(true);
          throw new Error("Multiple properties found");
        }
        if (data.properties && data.properties.length === 1) {
          setProperty(data.properties[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.message === "Not authorized") {
          navigate(`/manager?returnTo=${encodeURIComponent(location.pathname)}`);
        }
        setLoading(false);
      });
  }, [navigate, location]);

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </ManagerLayout>
    );
  }

  if (multiPropertyError) {
    return (
      <ManagerLayout>
        <div className="bg-amber-50 border border-amber-200 px-4 py-6 text-center sm:px-6 lg:px-8 rounded-xl shadow-sm max-w-4xl mx-auto mt-8">
          <h2 className="text-lg font-bold text-amber-900 mb-2">Multiple Properties Found</h2>
          <p className="text-amber-800">
            Multiple properties found. Property switching is not yet available.
          </p>
        </div>
      </ManagerLayout>
    );
  }

  if (!property) {
    return (
      <ManagerLayout>
        <div className="text-center mt-12">
          <p className="text-gray-500">No property found. Please complete Setup first.</p>
        </div>
      </ManagerLayout>
    );
  }

  const isReadOnly = property.entitlement?.accessMode === "read_only";

  return (
    <ManagerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900">QR Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Download and print your property's QR code.</p>
      </div>
      <OpsDashboardSheet propertySlug={property.slug} isReadOnly={isReadOnly} initialTab="qr" hiddenTabs={["menu", "amenities", "grievances"]} />
    </ManagerLayout>
  );
}
