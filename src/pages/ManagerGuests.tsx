import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Users, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { GlobalHeader } from "../components/ui/GlobalHeader";
import { toast } from "sonner";

import { GuestCard } from "../components/guest/GuestCard";
import { GuestForm, type GuestFormData } from "../components/guest/GuestForm";
import { GuestFilters } from "../components/guest/GuestFilters";
import { ShareDialog } from "../components/guest/ShareDialog";
import {
  matchesGuestSearch,
  matchesGuestFilter,
  toUTCDate,
  toUTCArrivalTime,
  type Guest,
} from "../lib/guestJourney";

const EMPTY_FORM: GuestFormData = {
  name: "",
  phone: "",
  roomNumber: "",
  arrivalDate: "",
  arrivalTime: "",
  notes: "",
  status: "BOOKED",
};

export function ManagerGuests() {
  const { property, loading } = useManagerProperty();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [fetching, setFetching] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<Guest | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GuestFormData>(EMPTY_FORM);

  // ── Data fetching ──
  const fetchGuests = async () => {
    if (!property?.slug) return;
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}/guests`);
      if (res.ok) setGuests(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (property) fetchGuests();
  }, [property]);

  // ── Handlers ──
  const handleSave = async () => {
    if (!property?.slug) return;
    const isEditing = !!isEditOpen;
    const url = isEditing
      ? `/api/manager/guests/${isEditOpen.id}`
      : `/api/manager/properties/${property.slug}/guests`;

    const payload: Record<string, unknown> = { ...formData };
    if (payload.arrivalDate) {
      payload.arrivalDate = toUTCDate(payload.arrivalDate as string);
    } else {
      payload.arrivalDate = null;
    }
    if (payload.arrivalTime && payload.arrivalDate) {
      payload.arrivalTime = toUTCArrivalTime(
        formData.arrivalDate,
        formData.arrivalTime
      );
    } else {
      payload.arrivalTime = null;
    }

    setSaving(true);
    try {
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(isEditing ? "Guest details updated" : "Guest registered successfully");
        setIsAddOpen(false);
        setIsEditOpen(null);
        setFormData(EMPTY_FORM);
        await fetchGuests();
      } else {
        const errJson = await res.json().catch(() => ({}));
        const message = errJson.error || errJson.details?.[0]?.message || "Failed to save guest details";
        toast.error(message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving guest details");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this guest?")) return;
    try {
      const res = await fetch(`/api/manager/guests/${id}`, { method: "DELETE" });
      if (res.ok) setGuests(guests.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (guest: Guest) => {
    setIsEditOpen(guest);
    setFormData({
      name: guest.name,
      phone: guest.phone,
      roomNumber: guest.roomNumber || "",
      arrivalDate: guest.arrivalDate ? guest.arrivalDate.split("T")[0] : "",
      arrivalTime: guest.arrivalTime
        ? new Date(guest.arrivalTime).toISOString().substring(11, 16)
        : "",
      notes: guest.notes || "",
      status: guest.status,
    });
  };

  // ── Filtering ──
  const filteredGuests = guests.filter(
    (g) => matchesGuestSearch(g, searchQuery) && matchesGuestFilter(g, activeFilter)
  );

  // ── Render ──
  if (loading)
    return (
      <ManagerLayout>
        <div className="p-8">
          <Skeleton className="h-10 w-48 mb-12" />
        </div>
      </ManagerLayout>
    );

  if (!property)
    return (
      <ManagerLayout>
        <div className="p-8">
          <EmptyState icon={Users} title="No Property" description="Please set up your property." />
        </div>
      </ManagerLayout>
    );

  return (
    <ManagerLayout>
      <GlobalHeader
        title="Guest Journey"
        description="Manage guest life cycles and activate personalized experiences."
        breadcrumbs={[{ label: "Workspace" }, { label: "Guests" }]}
        actions={
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus size={18} className="mr-2" aria-hidden="true" /> Register Arrival
          </Button>
        }
      />

      <GuestFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 p-8 pt-0">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : guests.length === 0 ? (
        <div className="p-8 pt-0">
          <EmptyState
            icon={Users}
            title="No Active Guests"
            description="Add your first guest to generate a personalized journey link."
            action={{ label: "Register Arrival", onClick: () => setIsAddOpen(true) }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 p-8 pt-0">
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={setIsShareOpen}
            />
          ))}
        </div>
      )}

      {isShareOpen && <ShareDialog token={isShareOpen} onClose={() => setIsShareOpen(null)} />}

      {(isAddOpen || isEditOpen) && (
        <GuestForm
          formData={formData}
          onChange={setFormData}
          onSave={handleSave}
          onCancel={() => {
            setIsAddOpen(false);
            setIsEditOpen(null);
          }}
          isEditing={!!isEditOpen}
            isSaving={saving}
        />
      )}
    </ManagerLayout>
  );
}
