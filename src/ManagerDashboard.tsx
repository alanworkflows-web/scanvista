import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { ImageUploader } from "./components/ImageUploader";
import { OpsDashboardSheet } from "./components/OpsDashboardSheet";
import { ManagerLayout } from "./components/ManagerLayout";

export function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [propertySlug, setPropertySlug] = useState("ocean-hotel"); // default
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [multiPropertyError, setMultiPropertyError] = useState(false);
  const [entitlement, setEntitlement] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  const [initialData, setInitialData] = useState({
    name: "",
    bannerUrl: "",
    logoUrl: "",
    description: "",
    receptionPhone: "",
    roomServicePhone: "",
    housekeepingPhone: "",
    emergencyPhone: "",
  });
  const [formData, setFormData] = useState(initialData);

  // Check dirty state
  useEffect(() => {
    const dirty = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(dirty);
  }, [formData, initialData]);

  useEffect(() => {
    // Check if user is logged in securely
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then((user) => {
        return fetch("/api/manager/properties");
      })
      .then((res) => res.json())
      .then((properties) => {
        if (properties.length === 0) {
          // Create default property
          return fetch("/api/manager/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "My Property" }),
          })
            .then((res) => res.json())
            .then((prop) => [prop]);
        }
        return properties;
      })
      .then((properties) => {
        if (properties.length > 1) {
          setMultiPropertyError(true);
          throw new Error("Multiple properties found");
        }
        const targetProperty = properties[0].slug;
        setPropertySlug(targetProperty);
        return fetch(`/api/properties/${targetProperty}`);
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.property) {
          const loadedData = {
            name: data.property.name || "",
            bannerUrl: data.property.bannerUrl || "",
            logoUrl: "",
            description: data.property.description || "",
            receptionPhone: data.property.receptionPhone || "",
            roomServicePhone: data.property.roomServicePhone || "",
            housekeepingPhone: data.property.housekeepingPhone || "",
            emergencyPhone: data.property.emergencyPhone || "",
          };
          setInitialData(loadedData);
          setFormData(loadedData);

          const ent = data.property.entitlement;
          setEntitlement(ent);
          setIsReadOnly(ent?.accessMode === "read_only");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === "Not authorized") {
          navigate(
            `/manager?returnTo=${encodeURIComponent(location.pathname)}`,
          );
        } else {
          console.error(err);
        }
        setLoading(false);
      });
  }, [navigate, location]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving) return;

    setSaving(true);
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const response = await fetch(`/api/manager/properties/${propertySlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update property profile");
      }

      setInitialData(formData);
      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "An error occurred while saving.");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    fetch("/api/logout", { method: "POST" }).then(() => {
      navigate("/manager");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (multiPropertyError) {
    return (
      <ManagerLayout>
        <div className="bg-amber-50 border border-amber-200 px-4 py-6 text-center sm:px-6 lg:px-8 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-amber-900 mb-2">
            Multiple Properties Found
          </h2>
          <p className="text-amber-800">
            Multiple properties found. Property switching is not yet available.
          </p>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      {isReadOnly && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 text-center sm:px-6 lg:px-8 rounded-xl mb-6 shadow-sm">
          <p className="text-sm font-medium text-red-800 mb-2">
            ⚠️ Subscription Expired: Your workspace is now locked in Read-Only
            Mode. Please renew your plan to unblock edits.
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate("/manager/plan");
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Renew Subscription
          </button>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 pb-4 pt-4 px-4 sm:px-6 mb-8 -mx-4 sm:-mx-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Property Setup
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your property details and contact information.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {saveError && (
            <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hidden sm:inline-block">
              ⚠️ {saveError}
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hidden sm:inline-block">
              ✓ Saved successfully
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving || isReadOnly}
            className={`font-bold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:cursor-not-allowed ${
              !isDirty
                ? "bg-gray-100 text-gray-400"
                : "bg-gray-900 hover:bg-gray-800 text-white"
            }`}
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {isReadOnly && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate("/manager/plan");
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all font-bold text-lg animate-pulse"
          >
            <span>🟢</span>
            Renew Subscription
          </button>
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Media & Assets */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Media & Assets
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <span role="img" aria-label="image">
                🖼️
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Header Hero Image
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg inline-block font-medium">
              Coming Soon
            </p>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Property Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                placeholder="e.g. Ocean View Hotel"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brief Location Subtext
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                placeholder="e.g. Beach Road, Goa"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Operational Dialers */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Operational Dialers
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter direct phone numbers for these services. Leave blank if
            unavailable.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reception / Front Desk
              </label>
              <input
                type="tel"
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                placeholder="+1 (555) 123-4567"
                value={formData.receptionPhone}
                onChange={(e) =>
                  setFormData({ ...formData, receptionPhone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Service
              </label>
              <input
                type="tel"
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                placeholder="+1 (555) 123-4568"
                value={formData.roomServicePhone}
                onChange={(e) =>
                  setFormData({ ...formData, roomServicePhone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Housekeeping
              </label>
              <input
                type="tel"
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                placeholder="+1 (555) 123-4569"
                value={formData.housekeepingPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    housekeepingPhone: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency / Host Direct Line
              </label>
              <input
                type="tel"
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                placeholder="+1 (555) 911-0000"
                value={formData.emergencyPhone}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyPhone: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </form>
    </ManagerLayout>
  );
}
