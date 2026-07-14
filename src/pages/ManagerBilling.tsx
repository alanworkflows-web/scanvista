import React, { useState } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { CreditCard, Loader2, CheckCircle2, Hotel } from "lucide-react";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { cn } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { GlobalHeader } from "../components/ui/GlobalHeader";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function ManagerBilling() {
  const { property, loading, error: multiPropertyError } = useManagerProperty();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const handlePaddleCheckout = async () => {
    if (!property) return;
    setBillingError(null);
    setCheckoutLoading(true);
    try {
      // 1. Ensure user is loaded
      const userRes = await fetch("/api/me");
      if (!userRes.ok) throw new Error("Not authenticated");
      const { user } = await userRes.json();
      const userEmail = user.email;

      // 2. Fetch active prices
      const pricesRes = await fetch("/api/manager/prices");
      if (!pricesRes.ok) throw new Error("Failed to load pricing");
      const pricesData = await pricesRes.json();

      const premiumPrice = pricesData.prices.find(
        (p: any) => p.customData?.tier === "premium",
      );
      if (!premiumPrice) throw new Error("Premium pricing not configured");

      const checkoutPayload = {
        items: [{
          priceId: premiumPrice.id,
          quantity: 1
        }],
        customer: {
          email: userEmail
        },
        customData: {
          slug: property.slug
        }
      };

      // @ts-ignore
      window.Paddle.Checkout.open(checkoutPayload);
    } catch (err) {
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
      setBillingError("Could not access billing portal. Please contact support.");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-10 w-32 mb-6" />
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
          <Card className="p-8">
            <Skeleton className="h-8 w-24 mb-4" />
            <Skeleton className="h-10 w-32 mb-6" />
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
            title="No Restaurant Found" 
            description="Please complete your setup first." 
          />
        </div>
      </ManagerLayout>
    );
  }

  const entitlement = property?.entitlement;
  const isPremium = entitlement?.plan === "premium";
  const isExpired = entitlement?.accessMode === "read_only";

  return (
    <ManagerLayout>
      <GlobalHeader
        title="Growth Plan"
        description="Manage your restaurant's billing plan and unlock premium features."
        breadcrumbs={[
          { label: 'Workspace' },
          { label: 'Growth Plan' }
        ]}
      />

      <Card className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Current Subscription</h2>
            <p className="text-gray-500">Manage your billing plan and features.</p>
          </div>
          <div>
            {isPremium ? (
              <Badge variant="warning">
                Premium Active
              </Badge>
            ) : (
              <Badge variant="neutral">
                Free Plan
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <div className={cn(
            "border rounded-xl p-6 relative transition-all",
            !isPremium && !isExpired ? "border-gray-900 bg-white ring-1 ring-gray-900 shadow-md" : "border-gray-200 bg-gray-50/50"
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
              <li className="flex items-center gap-2 text-gray-600"><CheckCircle2 className="w-5 h-5 text-gray-400" /> Basic restaurant profile</li>
            </ul>
          </div>

          {/* Premium Plan Card */}
          <div className={cn(
            "border-2 rounded-2xl p-6 transition-all",
            isPremium ? "border-[var(--card-hover-border)] bg-emerald-50/30 relative shadow-md" : isExpired ? "border-red-500 bg-red-50/10 relative shadow-md" : "border-gray-200"
          )}>
            {isPremium && (
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[var(--card-hover-border)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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
              <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-[var(--card-hover-border)]" /> Dynamic Digital Menu</li>
              <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-[var(--card-hover-border)]" /> Unlimited Categories & Dishes</li>
              <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-[var(--card-hover-border)]" /> Hotel Amenities & Services</li>
              <li className="flex items-center gap-2 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-[var(--card-hover-border)]" /> Priority Support</li>
            </ul>

            {billingError && (
              <div role="alert" className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <span>{billingError}</span>
              </div>
            )}

            {isPremium ? (
              <Button
                onClick={handlePortal}
                disabled={checkoutLoading}
                isLoading={checkoutLoading}
                variant="secondary"
                className="w-full"
              >
                <CreditCard size={18} className="mr-2" />
                Manage Subscription
              </Button>
            ) : (
              <Button
                onClick={handlePaddleCheckout}
                disabled={checkoutLoading}
                isLoading={checkoutLoading}
                className="w-full"
              >
                <CreditCard size={18} className="mr-2" />
                {checkoutLoading ? "Opening secure checkout..." : (isExpired ? "Renew Subscription" : "Upgrade to Premium")}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </ManagerLayout>
  );
}
