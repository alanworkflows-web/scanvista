import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";
import { OpsDashboardSheet } from "../components/OpsDashboardSheet";

export function ManagerPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then(user => {
        setUserEmail(user.email);
        return fetch("/api/manager/properties");
      })
      .then(res => res.json())
      .then(properties => {
        if (properties.length === 0) {
          throw new Error("No property found");
        }
        return fetch(`/api/properties/${properties[0].slug}`);
      })
      .then(res => res.json())
      .then(data => {
        setProperty(data.property);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        navigate("/manager");
      });
  }, [navigate]);

  const handlePaddleCheckout = () => {
    if (!property) return;
    
    // @ts-ignore
    if (!window.Paddle) {
      alert("Payments are temporarily unavailable. Please try again later.");
      return;
    }

    const env = import.meta.env.VITE_PADDLE_ENV;
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    const priceId = import.meta.env.VITE_PADDLE_PRICE_ID;
    
    // Fail closed in production if config is invalid
    const isProd = import.meta.env.PROD || import.meta.env.MODE === 'production';
    if (isProd) {
      if (!env || !clientToken || !priceId || (env !== 'production' && env !== 'sandbox')) {
        alert("Payments are temporarily unavailable. Please try again later.");
        return;
      }
    } else {
      // In dev, provide safe sandbox defaults if entirely missing, but don't leak into prod
      if (!env || !clientToken || !priceId) {
        alert("Local Dev Error: VITE_PADDLE_ENV, VITE_PADDLE_CLIENT_TOKEN or VITE_PADDLE_PRICE_ID missing.");
        return;
      }
    }

    // @ts-ignore
    window.Paddle.Initialize({ 
      token: clientToken, 
      environment: env
    });

    // @ts-ignore
    window.Paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
        locale: "en"
      },
      items: [{
        priceId: priceId, 
        quantity: 1
      }],
      customer: {
        email: userEmail
      },
      customData: {
        slug: property.slug
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const subStatus = property?.subscription?.status || "none";
  const isPremium = subStatus === "active";

  return (
    <div className="min-h-screen flex bg-gray-50">
      <OpsDashboardSheet propertySlug={property?.slug || ""} isReadOnly={!isPremium} />
      
      <main className="flex-1 ml-16 md:ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Plan & Billing</h1>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Current Subscription</h2>
                <p className="text-gray-500">Manage your property's billing plan and features.</p>
              </div>
              <div>
                {isPremium ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Premium Active
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 font-semibold py-2 px-4 rounded-lg">
                    Free Plan
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan Card */}
              <div className={cn(
                "border-2 rounded-2xl p-6 transition-all",
                !isPremium ? "border-gray-900 bg-gray-50/50 relative" : "border-gray-200 opacity-60"
              )}>
                {!isPremium && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Current
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">Free Tier</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">$0 <span className="text-base font-normal text-gray-500">/mo</span></div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-600"><CheckCircle2 className="w-5 h-5 text-gray-400" /> ScanVista QR Code</li>
                  <li className="flex items-center gap-2 text-gray-600"><CheckCircle2 className="w-5 h-5 text-gray-400" /> Basic property profile</li>
                </ul>
              </div>

              {/* Premium Plan Card */}
              <div className={cn(
                "border-2 rounded-2xl p-6 transition-all",
                isPremium ? "border-emerald-500 bg-emerald-50/30 relative shadow-md" : "border-emerald-200 hover:border-emerald-300"
              )}>
                {isPremium && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Current
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">Premium Plan</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">$10 <span className="text-base font-normal text-gray-500">/mo</span></div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Dynamic Digital Menu</li>
                  <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Unlimited Categories & Dishes</li>
                  <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Hotel Amenities & Services</li>
                  <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Priority Support</li>
                </ul>

                {!isPremium && (
                  <button 
                    onClick={handlePaddleCheckout}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
