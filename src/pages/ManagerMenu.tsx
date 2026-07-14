import React from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Hotel } from "lucide-react";
import { OpsDashboardSheet } from "../components/OpsDashboardSheet";

export function ManagerMenu() {
  const { loading, property, multiPropertyError } = useManagerProperty();

  if (loading) {
    return (
      <ManagerLayout>
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" />
        </div>
      </ManagerLayout>
    );
  }

  if (multiPropertyError || !property) {
    return (
      <ManagerLayout>
        <div className="mt-8">
          <EmptyState icon={Hotel} title="No Restaurant Setup" description="Please complete your setup first." />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <OpsDashboardSheet propertySlug={property.slug} initialTab="menu" hiddenTabs={["categories", "amenities", "qr"]} />
    </ManagerLayout>
  );
}
