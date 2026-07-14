import React from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { PublishingCenter } from "../components/PublishingCenter";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Hotel } from "lucide-react";
import { GlobalHeader } from "../components/ui/GlobalHeader";

export function ManagerPublishing() {
  const { loading, property, multiPropertyError, dishes, amenities, categories } = useManagerProperty();

  if (loading) {
    return (
      <ManagerLayout>
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-8 items-center justify-center min-h-[400px]">
          <Skeleton className="h-64 w-64 rounded-xl mb-6" />
          <Skeleton className="h-10 w-48" />
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
            title="No Restaurant Setup" 
            description="Please complete your setup first." 
          />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <PublishingCenter property={property} dishes={dishes} amenities={amenities} categories={categories} />
    </ManagerLayout>
  );
}
