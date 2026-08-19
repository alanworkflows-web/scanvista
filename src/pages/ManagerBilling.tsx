import React, { useState, useEffect } from "react";
import { toast } from 'sonner';
import { ManagerLayout } from "../components/ManagerLayout";
import { CreditCard, Loader2, CheckCircle2, Hotel, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { cn } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { GlobalHeader } from "../components/ui/GlobalHeader";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function ManagerBilling() {
  const { property, loading, error: multiPropertyError, refreshProperty } = useManagerProperty();
  console.log("ManagerBilling render -> loading:", loading, "property:", property ? property.id : null, "error:", multiPropertyError);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Paddle) {
      try {
        const paddleEnv = import.meta.env.VITE_PADDLE_ENV || "sandbox";
        if (paddleEnv === "sandbox" && (window as any).Paddle.Environment) {
          (window as any).Paddle.Environment.set("sandbox");
        }
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
        if (clientToken && (window as any).Paddle.Initialize) {
          (window as any).Paddle.Initialize({
            token: clientToken,
            eventCallback: (event: any) => {
              console.log("[Paddle Event]", event);
              if (event.name === "checkout.completed") {
                toast.success("Subscription upgraded successfully!");
                setCheckoutLoading(false);
                refreshProperty();
              } else if (event.name === "checkout.closed") {
                setCheckoutLoading(false);
              }
            }
          });
        }
      } catch (err) {
        console.warn("Paddle initialization notice:", err);
      }
    }
  }, [refreshProperty]);

  const handlePaddleCheckout = async () => {
    if (!property) return;
    setBillingError(null);
    setCheckoutLoading(true);
    try {
      // 1. Fetch secure billing identity
      const identityRes = await fetch(`/api/manager/properties/${property.slug}/checkout-identity`);
      if (!identityRes.ok) throw new Error("Could not verify billing identity");
      const { customer, checkoutToken } = await identityRes.json();

      // 2. Fetch active prices
      const pricesRes = await fetch("/api/manager/prices");
      if (!pricesRes.ok) throw new Error("Failed to load pricing");
      const pricesData = await pricesRes.json();

      const premiumPrice = pricesData.prices?.find(
        (p: any) => p.customData?.tier === "premium" || p.id === import.meta.env.VITE_PADDLE_PRICE_ID
      ) || pricesData.prices?.[0];

      if (!premiumPrice || !premiumPrice.id) throw new Error("Premium pricing not configured");

      const checkoutPayload = {
        items: [{
          priceId: premiumPrice.id,
          quantity: 1
        }],
        customer,
        customData: {
          slug: property.slug,
          checkoutToken: checkoutToken || ""
        },
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en"
        }
      };

      console.log("PADDLE PAYLOAD READY:", JSON.stringify(checkoutPayload, null, 2));

      if (typeof window !== "undefined" && (window as any).Paddle && (window as any).Paddle.Checkout) {
        (window as any).Paddle.Checkout.open(checkoutPayload);
      } else {
        throw new Error("Payment gateway SDK not loaded");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setBillingError(err.message || "Could not initialize payment gateway.");
      setCheckoutLoading(false);
      toast.error(err.message || "Could not open checkout.");
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
    } catch (err: any) {
      console.error("Portal error:", err);
      setBillingError("Could not access billing portal. Please contact support.");
      setCheckoutLoading(false);
      toast.error("Could not access billing portal.");
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="mb-12 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card className="p-8">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-10 w-32 mb-12" />
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
          <Card className="p-8">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-10 w-32 mb-12" />
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  if (multiPropertyError) {
    return (
      <ManagerLayout>
        <div className="mt-8">
          <EmptyState 
            icon={Hotel} 
            title="Multiple Restaurants Found" 
            description="Switching is not yet available." 
          />
        </div>
      </ManagerLayout>
    );
  }

  if (!property) {
    return (
      <ManagerLayout>
        <div className="mt-8">
          <EmptyState 
            icon={Hotel} 
            title="No Property Found" 
            description="Please complete your setup first." 
          />
        </div>
      </ManagerLayout>
    );
  }

  const entitlement = property?.entitlement;
  const isPremium = entitlement?.plan === "premium" && entitlement?.subscriptionStatus === "active";
  const isExpired = entitlement?.accessMode === "read_only";

  return (
    <ManagerLayout>
      <GlobalHeader
        title="Business"
        description="Review performance, manage your growth plan, and unlock premium features."
        breadcrumbs={[
          { label: 'Workspace' },
          { label: 'Business' }
        ]}
      />

      <Card className="p-8">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h2 className="text-2xl font-serif text-text-primary mb-2">Free Validation Program</h2>
            <p className="text-text-secondary opacity-80 max-w-2xl">
              ScanVista is currently free while we validate the product with hospitality properties and refine the experience.
            </p>
          </div>
          <div>
            {isPremium ? (
              <Badge variant="success">
                Premium Active
              </Badge>
            ) : (
              <Badge variant="success">
                Validation Access
              </Badge>
            )}
          </div>
        </div>

        {billingError && (
          <div className="mb-8 p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {billingError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Free Plan Card */}
          <div className={cn(
            "border rounded-sm p-8 relative transition-all",
            !isPremium
              ? "border-gray-900 bg-surface ring-1 ring-gray-900 shadow-premium-hover"
              : "border-divider bg-surface/50 opacity-80"
          )}>
            {!isPremium && (
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
                Current
              </div>
            )}
            <h3 className="text-lg font-medium text-text-primary mb-1">Free Tier</h3>
            <div className="text-4xl font-serif text-text-primary mb-4">$0 <span className="text-base font-normal text-text-secondary opacity-60">/mo</span></div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-text-secondary opacity-80"><CheckCircle2 className="w-5 h-5 text-text-muted" /> ScanVista QR Code</li>
              <li className="flex items-center gap-2 text-text-secondary opacity-80"><CheckCircle2 className="w-5 h-5 text-text-muted" /> Basic property profile</li>
              <li className="flex items-center gap-2 text-text-secondary opacity-80"><CheckCircle2 className="w-5 h-5 text-text-muted" /> Up to 2 Categories & 10 Dishes</li>
            </ul>
          </div>

          {/* Premium Plan Card */}
          <div className={cn(
            "border-2 rounded-sm p-8 relative transition-all flex flex-col justify-between",
            isPremium
              ? "border-emerald-600 bg-surface ring-1 ring-emerald-600 shadow-premium-hover"
              : "border-gray-900 bg-surface shadow-sm"
          )}>
            {isPremium && (
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Plan
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-1">Premium Plan</h3>
              <div className="text-4xl font-serif text-text-primary mb-2">$10 <span className="text-base font-normal text-text-secondary opacity-60">/mo</span></div>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full mb-4">
                Coming after validation
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-text-secondary font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Dynamic Digital Menu</li>
                <li className="flex items-center gap-2 text-text-secondary font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Unlimited Categories & Dishes</li>
                <li className="flex items-center gap-2 text-text-secondary font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Hotel Amenities & Services</li>
                <li className="flex items-center gap-2 text-text-secondary font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Priority Support</li>
              </ul>
            </div>

            <div className="mt-auto pt-4 space-y-3">
              {isPremium ? (
                <Button
                  id="manage-billing-btn"
                  variant="secondary"
                  className="w-full justify-center gap-2 py-3 text-base font-semibold"
                  onClick={handlePortal}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Manage Subscription
                    </>
                  )}
                </Button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 border border-gray-200 py-3 rounded text-center text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Unlocked for Early Validation
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </ManagerLayout>
  );
}
