import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { ImageUploader } from "./components/ImageUploader";
import { OpsDashboardSheet } from "./components/OpsDashboardSheet";

export function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertySlug, setPropertySlug] = useState("ocean-hotel"); // default
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    bannerUrl: "",
    logoUrl: "", // Just placeholder if we want to expand
    description: "", // Re-purposed as location subtext in the UI
    receptionPhone: "",
    roomServicePhone: "",
    housekeepingPhone: "",
    emergencyPhone: ""
  });

  useEffect(() => {
    // Check if user is logged in securely
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then(user => {
        return fetch("/api/manager/properties");
      })
      .then(res => res.json())
      .then(properties => {
        if (properties.length === 0) {
          // Create default property
          return fetch("/api/manager/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: "prop_" + Date.now(), name: "My Property" })
          }).then(res => res.json()).then(prop => [prop]);
        }
        return properties;
      })
      .then(properties => {
        const targetProperty = properties[0].slug;
        setPropertySlug(targetProperty);
        return fetch(`/api/properties/${targetProperty}`);
      })
      .then(res => res.json())
      .then(data => {
        if (data.property) {
          setFormData({
            name: data.property.name || "",
            bannerUrl: data.property.bannerUrl || "",
            logoUrl: "", 
            description: data.property.description || "",
            receptionPhone: data.property.receptionPhone || "",
            roomServicePhone: data.property.roomServicePhone || "",
            housekeepingPhone: data.property.housekeepingPhone || "",
            emergencyPhone: data.property.emergencyPhone || ""
          });

          if (data.property.subscription && data.property.subscription.status !== 'active') {
             // Basic lockout logic based on status
             setIsReadOnly(true);
          } else {
             setIsReadOnly(false);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.message === "Not authorized") {
          navigate("/manager");
        } else {
          console.error(err);
        }
        setLoading(false);
      });
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/manager/properties/${propertySlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      navigate(`/p/${propertySlug}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    fetch("/api/logout", { method: "POST" })
      .then(() => {
        navigate("/manager");
      });
  };

  const handlePaddleCheckout = () => {
    const loadPaddleAndCheckout = () => {
      // @ts-ignore
      if (window.Paddle) {
        let managerEmail = "manager@example.com";
        // In real app, you would pass the actual logged in user's email

        // @ts-ignore
        window.Paddle.Initialize({ 
          token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || "live_caac7ae17428c47d0eb266823c4", 
          environment: "sandbox" // Change to "production" when launching live
        });

        // @ts-ignore
        window.Paddle.Checkout.open({
          settings: {
            displayMode: "overlay",
            theme: "light",
            locale: "en"
          },
          items: [{
            priceId: "pro_01kwxk9wd47vc7fxt8axgx7vrx", 
            quantity: 1
          }],
          customer: {
            email: managerEmail
          },
          customData: {
            slug: propertySlug
          }
        });
      }
    };

    // @ts-ignore
    if (!window.Paddle) {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.crossOrigin = 'anonymous';
      script.onload = loadPaddleAndCheckout;
      document.body.appendChild(script);
    } else {
      loadPaddleAndCheckout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {isReadOnly && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-red-800">
            ⚠️ Subscription Expired: Your workspace is now locked in Read-Only Mode. Please renew your $10 flat plan to unblock real-time edits.
          </p>
          <button 
            onClick={handlePaddleCheckout}
            disabled={saving}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Renew Subscription ($10/mo)
          </button>
        </div>
      )}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-900 transition-colors"
              title="Logout"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-serif font-bold text-gray-900">
              Complete Your Property Profile
            </h1>
            {isReadOnly ? (
              <button 
                onClick={handlePaddleCheckout}
                disabled={saving}
                className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md font-sans text-sm tracking-wide transition-all disabled:opacity-50"
              >
                💳 Activate Flat Plan ($10/mo)
              </button>
            ) : (
              <span className="ml-2 bg-gray-100 text-gray-600 font-semibold py-2 px-4 rounded-lg font-sans text-sm tracking-wide">
                🟢 Premium Plan Active
              </span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={saving || isReadOnly}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save & Publish
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 relative">
        {isReadOnly && (
          <div className="fixed bottom-6 right-6 z-50">
            <button 
              onClick={handlePaddleCheckout}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all font-bold text-lg animate-pulse disabled:opacity-50 disabled:animate-none"
            >
              {saving ? <Loader2 size={24} className="animate-spin" /> : <span>🟢</span>}
              Renew Subscription ($10/mo)
            </button>
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Media & Assets */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Media & Assets</h2>
            <div className="space-y-6">
              <ImageUploader 
                label="Header Hero Image" 
                currentImage={formData.bannerUrl}
                onImageSelected={(url) => setFormData(prev => ({ ...prev, bannerUrl: url }))} 
              />
              <ImageUploader 
                label="Brand Logo (Optional)" 
                currentImage={formData.logoUrl}
                onImageSelected={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))} 
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Property Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                  placeholder="e.g. Ocean View Hotel"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brief Location Subtext</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                  placeholder="e.g. Beach Road, Goa"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Operational Dialers */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Operational Dialers</h2>
            <p className="text-sm text-gray-500 mb-6">Enter direct phone numbers for these services. Leave blank if unavailable.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reception / Front Desk</label>
                <input
                  type="tel"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                  placeholder="+1 (555) 123-4567"
                  value={formData.receptionPhone}
                  onChange={e => setFormData({ ...formData, receptionPhone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Service</label>
                <input
                  type="tel"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                  placeholder="+1 (555) 123-4568"
                  value={formData.roomServicePhone}
                  onChange={e => setFormData({ ...formData, roomServicePhone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Housekeeping</label>
                <input
                  type="tel"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                  placeholder="+1 (555) 123-4569"
                  value={formData.housekeepingPhone}
                  onChange={e => setFormData({ ...formData, housekeepingPhone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency / Host Direct Line</label>
                <input
                  type="tel"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all disabled:opacity-50"
                  placeholder="+1 (555) 911-0000"
                  value={formData.emergencyPhone}
                  onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Live Ops Dashboard */}
        <div className="mt-8">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Live Operations Matrix</h2>
          <OpsDashboardSheet propertySlug={propertySlug} isReadOnly={isReadOnly} />
        </div>
      </main>
    </div>
  );
}
