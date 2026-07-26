import React from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Hotel } from "lucide-react";
import { MenuStudio } from "../components/manager/menu/MenuStudio";

export function ManagerMenu() {
  const { loading, property, multiPropertyError } = useManagerProperty();

  if (loading) {
    return (
      <ManagerLayout>
        <div className="mb-12 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </ManagerLayout>
    );
  }

  if (multiPropertyError || !property) {
    return (
      <ManagerLayout>
        <div className="mt-8">
          <EmptyState icon={Hotel} title="No Property Setup" description="Please select or complete your property profile first." />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <MenuStudio propertySlug={property.slug} propertyName={property.name} />
    </ManagerLayout>
  );
}
