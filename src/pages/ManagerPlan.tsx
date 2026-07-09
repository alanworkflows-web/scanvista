import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";
import { ManagerLayout } from "../components/ManagerLayout";

export function ManagerPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [billingError, setBillingError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [multiPropertyError, setMultiPropertyError] = useState(false);

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
        if (properties.length > 1) {
          setMultiPropertyError(true);
          throw new Error("Multiple properties found");
        }
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
        if (err.message === "Not authorized") {
          navigate(`/manager?returnTo=${encodeURIComponent(location.pathname)}`);
        }
        setLoading(false);
      });
  }, [navigate, location]);

  const handlePaddleCheckout = () => {
    if (!property) return;

    setBillingError(null);
    setCheckoutLoading(true);

    // @ts-ignore
    if (!window.Paddle) {
      setBillingError("Payments are temporarily unavailable. Please try again later.");
      setCheckoutLoading(false);
      return;
    }

    const env = import.meta.env.VITE_PADDLE_ENV;
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    const priceId = import.meta.env.VITE_PADDLE_PRICE_ID;

    // Fail closed in production if config is invalid
    const isProd = import.meta.env.PROD || import.meta.env.MODE === 'production';
    if (isProd) {
      if (!env || !clientToken || !priceId || (env !== 'production' && env !== 'sandbox')) {
        setBillingError("Payments are temporarily unavailable. Please try again later.");
        setCheckoutLoading(false);
        return;
      }
    } else {
      // In dev, provide safe sandbox defaults if entirely missing, but don't leak into prod
      if (!env || !clientToken || !priceId) {
        setBillingError("Local Dev Error: VITE_PADDLE_ENV, VITE_PADDLE_CLIENT_TOKEN or VITE_PADDLE_PRICE_ID missing.");
        setCheckoutLoading(false);
        return;
      }
    }

    try {
      // @ts-ignore
      window.Paddle.Initialize({
        token: clientToken,
        environment: env,
        eventCallback: function(data: any) {
          if (data.name === "checkout.closed") {
            setCheckoutLoading(false);
            // Refresh entitlement gracefully
            fetch(`/api/properties/${property.slug}`)
              .then(res => res.json())
              .then(d => { if (d.property) setProperty(d.property); });
          }
        }
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
    } catch (err) {
      console.error(err);
      setBillingError("Could not initialize payment gateway.");
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!property) return;
    setBillingError(null);
    setCheckoutLoading(true);
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}/portal`, {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error("Failed to generate portal link");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned");
      }
    } catch (err) {
      console.error(err);
      setBillingError("Could not access billing portal. Please contact support.");
      setCheckoutLoading(false);
    }
  };

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

  const entitlement = property?.entitlement;
  const isPremium = entitlement?.plan === "premium";
  const isExpired = entitlement?.accessMode === "read_only";

  return (
    <ManagerLayout>
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
                "border rounded-xl p-6 relative transition-all",
                !isPremium && !isExpired ? "border-gray-900 bg-white ring-1 ring-gray-900 shadow-md" : "border-gray-200 bg-white/50"
              )}>
                {!isPremium && !isExpired && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
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
                isPremium ? "border-emerald-500 bg-emerald-50/30 relative shadow-md" : isExpired ? "border-red-500 bg-red-50/10 relative shadow-md" : "border-emerald-200 hover:border-emerald-300"
              )}>
                {isPremium && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Current
                  </div>
                )}
                {isExpired && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Expired
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

                {billingError && (
                  <div role="alert" className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">⚠️</span>
                    <span>{billingError}</span>
                  </div>
                )}

                {isPremium ? (
                  <button
                    onClick={handlePortal}
                    disabled={checkoutLoading}
                    className="w-full font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={handlePaddleCheckout}
                    disabled={checkoutLoading}
                    className="w-full font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                    {isExpired ? "Renew Subscription" : "Upgrade to Premium"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
    </ManagerLayout>
  );
}
